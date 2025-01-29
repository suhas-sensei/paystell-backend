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

    private async sendWebhookNotification(
        webhookUrl: string,
        payload: WebhookPayload,
        secret: string,
    ): Promise<boolean> {
        try {
            const signature = await this.generateSignature(payload, secret);
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
        if (!merchantWebhook.isActive || !validateWebhookUrl(merchantWebhook.url)) {
            return false;
        }

        const webhookPayload: WebhookPayload = {
            ...paymentDetails,
            timestamp: new Date().toISOString()
        }

        return this.sendWebhookNotification(merchantWebhook.url, webhookPayload, merchantWebhook.secret)
    }
}

export class MerchantAuthService {
    private async findMerchantByApiKey(apiKey: string): Promise <Merchant | null> {
        try {
            // These are sample details, normally you'd find the merchant from the by their apikey
            const createDate = new Date()
            createDate.setDate(createDate.getDate() - 1) 
                const merchantDetails = {
                    id: crypto.randomUUID(),
                    name: 'random-merchant',
                    email: 'merchant-email',
                    apiKey,
                    isActive: false,
                    createdAt: new Date()
                    }
            return {
                id: merchantDetails.id,
                apiKey: merchantDetails.apiKey,
                name: merchantDetails.name,
                email: merchantDetails.email,
                isActive: merchantDetails.isActive,
                createdAt: createDate,
                updatedAt: createDate,
            }
        } catch (err) {
            console.error(err)
            return null
        }
    }

    async validateApiKey(apiKey: string): Promise<Merchant | null> {
        if (!apiKey) return null;
    
        const merchant = await this.findMerchantByApiKey(apiKey);
        
        if (!merchant || !merchant.isActive) {
          return null;
        }
    
        return merchant;
    }
}