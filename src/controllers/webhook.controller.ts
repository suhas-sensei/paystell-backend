import { Merchant, MerchantWebhook, StellarWebhookPayload, WebhookPayload } from "../interfaces/webhook.interfaces";
import { WebhookService } from "../services/webhook.service";
import { Request, Response } from 'express'

const webhookService = new WebhookService();

export class WebhookController {

    private async getMerchant(id: string): Promise<Merchant | null>{
        // replace with a method to find merchant from db by id
        const date = new Date()
        const merchant: Omit<Merchant, 'createdAt' & 'updatedAt'> = {
            id,
            apiKey: 'random-api-key',
            name: 'random-merchant-name',
            email: 'randomMerchant@gmail.com',
            secret: 'merchant-webhook-secret',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
        }
        if (!merchant.isActive) {
            throw new Error('Merchant not found');
        }
        return merchant
    }

    private async getMerchantWebhook(merchantId: string): Promise<MerchantWebhook | null> {
        // replace with mechanism to find merchant webhook from merchant id.
        // in the future, another argument can be added for the transaction type
        const merchantWebhook: MerchantWebhook = {
            id: 'merchant-webhook-id',
            merchantId,
            url: 'merchant-webhook-url',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
        }
        if (!merchantWebhook.isActive) {
            throw new Error('Merchant web hook not found')
        }
        return merchantWebhook
    }

    private async notifyWithRetry(merchantWebhook: MerchantWebhook, webhookPayload: WebhookPayload, maxRetries = 3, delay = 3000) {
        let attempts = 0;

        while (attempts < maxRetries) {
            try {
                await webhookService.notifyPaymentUpdate(merchantWebhook, webhookPayload);
                return; // Exit if successful
            } catch (err) {
                attempts++;
                console.error(`Attempt ${attempts} failed:`, err);

                if (attempts < maxRetries) {
                    await new Promise(resolve => setTimeout(resolve, delay)); // Wait before retrying
                }
            }
        }
        console.error("Failed to notify after maximum retries.");
    }

    async handleWebhook (
        req: Request, res: Response
    ) {
        const response = res
        try {
            const { payload }: StellarWebhookPayload = req.body

            const merchant: Merchant | null = await this.getMerchant(payload.customer.id)
            if (!merchant) return
            const merchantWebhook: MerchantWebhook | null = await this.getMerchantWebhook(merchant.id)
            if (!merchantWebhook) return
            const webhookPayload: WebhookPayload = {
                transactionId: payload.transaction.id,
                transactionType: payload.transaction.type,
                status: payload.transaction.status,
                amount: payload.transaction.amount_in?.amount,
                asset: payload.transaction.amount_in?.asset,
                merchantId: payload.customer.id,
                timestamp: (new Date()).toISOString(),
                eventType: `${payload.transaction.type}.${payload.transaction.status}`,
            }
            // webhookService.notifyPaymentUpdate(merchantWebhook, webhookPayload)
            this.notifyWithRetry(merchantWebhook, webhookPayload)
        } catch (err) {
            console.error("Webhook error: ", err);
            return res.status(500).json({error: "Webhook error"})
        }
    }
}