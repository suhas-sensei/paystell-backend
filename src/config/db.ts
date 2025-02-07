import { DataSource } from 'typeorm';
import dotenv from 'dotenv';

dotenv.config();

const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT),
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DATABASE,
    synchronize: true,
    logging: false,
    entities: [__dirname + '/../entities/*.ts'],
    migrations: [__dirname + '/../migrations/*.ts'],
});


export default AppDataSource;