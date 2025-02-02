import express from "express";
import { MerchantController } from '../controllers/merchant.controller'
import { authenticateMerchant, authenticateStellarWebhook } from "../middleware/auth";
import { WebhookController } from "../controllers/webhook.controller";

const router = express.Router();
const merchantController = new MerchantController();
const webhookController = new WebhookController()

router.post(
    // @ts-ignore
    '/webhooks/register', authenticateMerchant, merchantController.registerWebhook
)
router.post(
    // @ts-ignore
    '/webhooks/stellar', authenticateStellarWebhook, webhookController.handleWebhook
)

export default router