import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import {
  PaginatedResult,
  PaginationQueryDto,
  toPaginatedResult,
} from '../../common/dto/pagination-query.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly products: Repository<Product>,
  ) {}

  async findAll(query: PaginationQueryDto): Promise<PaginatedResult<Product>> {
    const { page, limit } = query;
    const [data, total] = await this.products.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return toPaginatedResult(data, total, query);
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.products.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product #${id} not found`);
    }
    return product;
  }

  create(dto: CreateProductDto): Promise<Product> {
    return this.products.save(this.products.create(dto));
  }

  /**
   * Editing a product NEVER affects existing orders: order items store a
   * snapshot of the product name and unit price taken at creation time.
   */
  async update(id: number, dto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);
    Object.assign(product, dto);
    return this.products.save(product);
  }

  async remove(id: number): Promise<void> {
    const product = await this.findOne(id);
    try {
      await this.products.remove(product);
    } catch (error) {
      // FK is RESTRICT: deleting a product referenced by any order fails.
      if (
        error instanceof QueryFailedError &&
        (error.driverError as { code?: string }).code?.startsWith('ER_ROW_IS_REFERENCED')
      ) {
        throw new ConflictException(
          'Product cannot be deleted because it appears in existing orders',
        );
      }
      throw error;
    }
  }
}
