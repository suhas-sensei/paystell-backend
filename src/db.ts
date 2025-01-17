import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

console.log('POSTGRES_HOST:', process.env.POSTGRES_HOST);
console.log('POSTGRES_PORT:', process.env.POSTGRES_PORT);
console.log('POSTGRES_USER:', process.env.POSTGRES_USER);
console.log('POSTGRES_PASSWORD:', process.env.POSTGRES_PASSWORD);
console.log('POSTGRES_DATABASE:', process.env.POSTGRES_DATABASE);

const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT),
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DATABASE,
    synchronize: true,
    logging: false,
    ssl: {
        rejectUnauthorized: false,
    },
    entities: [
        // Add your entities here
    ],
    migrations: [
        // Add your migrations here
    ],
    subscribers: [
        // Add your subscribers here
    ],
});

AppDataSource.initialize()
    .then(() => {
        console.log('Data Source has been initialized!');
    })
    .catch((err) => {
        console.error('Error during Data Source initialization:', err);
    });

export default AppDataSource;