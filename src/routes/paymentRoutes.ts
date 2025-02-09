import express from "express"
import { PaymentController } from "../controllers/PaymentController"

const router = express.Router()
const paymentController = new PaymentController()

router.post("/", paymentController.createPayment.bind(paymentController))

export { router as paymentRouter }

