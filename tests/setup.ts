import { DataSource } from 'typeorm';
import { User } from '../src/entities/User';

// Создаем тестовую базу данных
export const testDataSource = new DataSource({
    type: 'sqlite',
    database: ':memory:',
    synchronize: true,
    entities: [User],
    logging: false
});

beforeAll(async () => {
    await testDataSource.initialize();
});

afterAll(async () => {
    await testDataSource.destroy();
});