import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { AppController } from './app.controller';
import { CustomersModule } from './modules/customers/customers.module';
import { OrdersModule } from './modules/orders/orders.module';
import { ProductsModule } from './modules/products/products.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql' as const,
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 3307),
        username: config.get<string>('DB_USER', 'app'),
        password: config.get<string>('DB_PASSWORD', 'apppass'),
        database: config.get<string>('DB_NAME', 'order_management'),
        autoLoadEntities: true,
        // Schema only via migrations; pending ones are applied on boot so a
        // fresh `docker compose up` needs no manual setup.
        synchronize: false,
        migrations: [join(__dirname, 'database', 'migrations', '*{.ts,.js}')],
        migrationsRun: true,
      }),
    }),
    CustomersModule,
    ProductsModule,
    OrdersModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
