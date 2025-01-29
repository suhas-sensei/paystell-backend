import express from "express";
import { MerchantController } from '../controllers/merchant.controller'
import { authenticateMerchant } from "../middleware/auth";

const router = express.Router();
const merchantController = new MerchantController();

router.post(
    '/webhooks/register',authenticateMerchant ,merchantController.registerWebhook
)

export default router