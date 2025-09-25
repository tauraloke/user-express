import { DataSource } from 'typeorm';
import { User } from '../entities/User';

export const AppDataSource = new DataSource({
    type: 'sqlite',
    database: process.env.DATABASE_URL?.replace('sqlite://', '') || './database.sqlite',
    synchronize: true,
    logging: process.env.NODE_ENV === 'development',
    entities: [User],
    migrations: [],
    subscribers: []
});