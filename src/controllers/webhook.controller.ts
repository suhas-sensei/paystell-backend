import { Merchant, MerchantWebhook, StellarWebhookPayload, WebhookPayload } from "../interfaces/webhook.interfaces";
import { MerchantAuthService } from "../services/merchant.service";
import { WebhookService } from "../services/webhook.service";
import { Request, Response } from 'express'

const webhookService = new WebhookService();
const merchantAuthService = new MerchantAuthService()

export class WebhookController {

    async handleWebhook(
        req: Request, res: Response
    ) {
        // const response = res
        try {
            const { payload }: StellarWebhookPayload = req.body

            const merchant = await merchantAuthService.getMerchantById(payload.customer.id)

            if (!merchant || !merchant.isActive) {
                return res.status(404).json({
                    status: 'error',
                    code: 'MERCHANT_NOT_FOUND',
                    message: merchant ? "Merchant not active" : "Merchant not found"
                })
            }
            
            const merchantWebhook = await webhookService.getMerchantWebhook(merchant.id)

            if (!merchantWebhook) {
                return res.status(404).json({
                    status: 'error',
                    code: 'WEBHOOK_NOT_FOUND',
                    message: "Webhook not found" 
                })
            }

            const webhookPayload: WebhookPayload = {
                transactionId: payload.transaction.id,
                transactionType: payload.transaction.type,
                status: payload.transaction.status,
                amount: payload.transaction.amount_in?.amount,
                asset: payload.transaction.amount_in?.asset,
                merchantId: payload.customer.id,
                timestamp: (new Date()).toISOString(),
                eventType: `${payload.transaction.type}.${payload.transaction.status}`,
                reqMethod: 'POST'
            }
            

            await webhookService.notifyWithRetry(merchantWebhook, webhookPayload)

            return res.status(200).json({
                status: 'success',
                message: "Webhook processed successfully" 
            });
        } catch (err) {
            console.error("Webhook error: ", err);
            return res.status(500).json({
                status: 'error',
                code: 'INTERNAL_ERROR', 
                message: "Internal server error" 
            })
        }
    }
}