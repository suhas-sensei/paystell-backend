import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import PaymentRoute from './routes/ParymentLink.routes';

const app = express();

app.use(morgan('dev'));
app.use(cors());
app.use(express.json()); 

app.use("/paymentlink", PaymentRoute)

export default app;
