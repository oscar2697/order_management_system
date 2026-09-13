import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
  PaginatedResult,
  toPaginatedResult,
} from '../../common/dto/pagination-query.dto';
import { Customer } from '../customers/customer.entity';
import { Product } from '../products/product.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { ListOrdersDto } from './dto/list-orders.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderItem } from './order-item.entity';
import { ORDER_TRANSITIONS, Order } from './order.entity';
import { calculateOrderTotal, canTransition } from './order.rules';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orders: Repository<Order>,
    @InjectRepository(Customer)
    private readonly customers: Repository<Customer>,
    @InjectRepository(Product)
    private readonly products: Repository<Product>,
  ) {}

  async findAll(query: ListOrdersDto): Promise<PaginatedResult<Order>> {
    const { page, limit, status } = query;
    const [data, total] = await this.orders.findAndCount({
      where: status ? { status } : {},
      relations: { customer: true },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return toPaginatedResult(data, total, query);
  }

  async findOne(id: number): Promise<Order> {
    const order = await this.orders.findOne({
      where: { id },
      relations: { customer: true, items: true },
    });
    if (!order) {
      throw new NotFoundException(`Order #${id} not found`);
    }
    return order;
  }

  /**
   * Transactional so a failure never leaves a half-persisted order.
   * Prices and product names are snapshotted here; the persisted total
   * is derived from those snapshots.
   */
  async create(dto: CreateOrderDto): Promise<Order> {
    const customer = await this.customers.findOne({
      where: { id: dto.customerId },
    });
    if (!customer) {
      throw new NotFoundException(`Customer #${dto.customerId} not found`);
    }

    // Merge repeated product ids instead of rejecting them.
    const quantities = new Map<number, number>();
    for (const item of dto.items) {
      quantities.set(
        item.productId,
        (quantities.get(item.productId) ?? 0) + item.quantity,
      );
    }

    const products = await this.products.findBy({
      id: In([...quantities.keys()]),
    });
    const foundIds = new Set(products.map((p) => p.id));
    const missing = [...quantities.keys()].filter((id) => !foundIds.has(id));
    if (missing.length > 0) {
      throw new BadRequestException(
        `Unknown product id(s): ${missing.join(', ')}`,
      );
    }

    const items: OrderItem[] = products.map((product) => {
      const item = new OrderItem();
      item.product = product;
      item.productId = product.id;
      item.productName = product.name; // snapshot
      item.unitPrice = product.price; // snapshot
      item.quantity = quantities.get(product.id)!;
      return item;
    });

    const order = new Order();
    order.customer = customer;
    order.customerId = customer.id;
    order.status = 'pending';
    order.items = items;
    order.total = calculateOrderTotal(items);

    const saved = await this.orders.manager.transaction((em) => em.save(order));
    return this.findOne(saved.id);
  }

  /** State machine: pending -> completed | cancelled; both terminal. */
  async updateStatus(id: number, dto: UpdateOrderStatusDto): Promise<Order> {
    const order = await this.orders.findOne({ where: { id } });
    if (!order) {
      throw new NotFoundException(`Order #${id} not found`);
    }
    if (!canTransition(order.status, dto.status)) {
      const allowed = ORDER_TRANSITIONS[order.status];
      throw new ConflictException(
        allowed.length === 0
          ? `Order #${id} is already "${order.status}" and cannot change state`
          : `Cannot move order from "${order.status}" to "${dto.status}". Allowed: ${allowed.join(', ')}`,
      );
    }
    order.status = dto.status;
    return this.orders.save(order);
  }
}
