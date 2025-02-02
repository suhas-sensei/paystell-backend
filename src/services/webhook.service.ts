import axios from 'axios'
import crypto from 'crypto'
import { WebhookPayload, MerchantWebhook, Merchant } from '../interfaces/webhook.interfaces'
import { validateWebhookUrl } from '../validators/webhook.validators'


export class WebhookService {
    private async generateSignature(payload: WebhookPayload, secret: string): Promise<string> {
        const hmac = crypto.createHmac('sha256', secret);
        hmac.update(JSON.stringify(payload))
        return hmac.digest('hex')
    }

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

    private async sendWebhookNotification(
        webhookUrl: string,
        payload: WebhookPayload,
        id: string,
    ): Promise<boolean> {
        try {
            const merchant: Merchant | null = await this.getMerchant(id)
            // if (!merchant) return
            const signature = await this.generateSignature(payload, merchant?.secret!);
            await axios.post(webhookUrl, payload, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Webhook-Signature': signature
                },
                timeout: 5000
            });

            return true;
        } catch (err) {
            console.error('Failed to send webhook notification', err)
            return false;
        }
    }

    async notifyPaymentUpdate (
        merchantWebhook: MerchantWebhook,
        paymentDetails: Omit<WebhookPayload, 'timestamp'>
    ): Promise<boolean> {
        const merchant = await this.getMerchant(merchantWebhook.merchantId)
        if (!merchantWebhook.isActive || !validateWebhookUrl(merchantWebhook.url)) {
            return false;
        }

        const webhookPayload: WebhookPayload = {
            ...paymentDetails,
            timestamp: new Date().toISOString()
        }

        return this.sendWebhookNotification(merchantWebhook.url, webhookPayload, merchant?.secret!)
    }
}