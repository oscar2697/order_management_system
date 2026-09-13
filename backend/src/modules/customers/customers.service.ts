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
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { Customer } from './customer.entity';

const MYSQL_UNIQUE_VIOLATION = 'ER_DUP_ENTRY';
const MYSQL_FK_VIOLATION = 'ER_ROW_IS_REFERENCED';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly customers: Repository<Customer>,
  ) {}

  async findAll(query: PaginationQueryDto): Promise<PaginatedResult<Customer>> {
    const { page, limit } = query;
    const [data, total] = await this.customers.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return toPaginatedResult(data, total, query);
  }

  async findOne(id: number): Promise<Customer> {
    const customer = await this.customers.findOne({ where: { id } });
    if (!customer) {
      throw new NotFoundException(`Customer #${id} not found`);
    }
    return customer;
  }

  async create(dto: CreateCustomerDto): Promise<Customer> {
    try {
      return await this.customers.save(this.customers.create(dto));
    } catch (error) {
      throwIfDuplicateEmail(error);
      throw error;
    }
  }

  async update(id: number, dto: UpdateCustomerDto): Promise<Customer> {
    const customer = await this.findOne(id);
    Object.assign(customer, dto);
    try {
      return await this.customers.save(customer);
    } catch (error) {
      throwIfDuplicateEmail(error);
      throw error;
    }
  }

  async remove(id: number): Promise<void> {
    const customer = await this.findOne(id);
    try {
      await this.customers.remove(customer);
    } catch (error) {
      // FK is RESTRICT: MySQL rejects deleting a customer that has orders.
      if (
        error instanceof QueryFailedError &&
        (error.driverError as { code?: string }).code?.startsWith(
          MYSQL_FK_VIOLATION,
        )
      ) {
        throw new ConflictException(
          'Customer cannot be deleted because it has associated orders',
        );
      }
      throw error;
    }
  }
}

function throwIfDuplicateEmail(error: unknown): void {
  if (
    error instanceof QueryFailedError &&
    (error.driverError as { code?: string }).code === MYSQL_UNIQUE_VIOLATION
  ) {
    throw new ConflictException('A customer with that email already exists');
  }
}
