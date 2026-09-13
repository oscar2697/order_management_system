import 'dotenv/config';
import { join } from 'path';
import { DataSource } from 'typeorm';

/**
 * Standalone DataSource used by the TypeORM CLI (migration:generate/run).
 * The NestJS app configures its own connection in AppModule; both read
 * the same environment variables so they always point to the same DB.
 */
export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '3307', 10),
  username: process.env.DB_USER ?? 'app',
  password: process.env.DB_PASSWORD ?? 'apppass',
  database: process.env.DB_NAME ?? 'order_management',
  entities: [join(__dirname, '..', 'modules', '**', '*.entity{.ts,.js}')],
  migrations: [join(__dirname, 'migrations', '*{.ts,.js}')],
  synchronize: false,
});
