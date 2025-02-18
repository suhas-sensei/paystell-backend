import axios from 'axios'
import crypto from 'crypto'
import { WebhookPayload, MerchantWebhook, Merchant } from '../interfaces/webhook.interfaces'
import { validateWebhookUrl } from '../validators/webhook.validators'
import { MerchantAuthService } from './merchant.service';
import { Repository } from "typeorm";
import AppDataSource from "../config/db";
import { MerchantWebhookEntity } from './../entities/MerchantWebhook.entity';

const merchantAuthService = new MerchantAuthService()

export class WebhookService {
    private merchantWebhookrepository: Repository<MerchantWebhookEntity>

    constructor() {
        this.merchantWebhookrepository = AppDataSource.getRepository(MerchantWebhookEntity)
    }

    private async generateNonce (): Promise<string> {
        return crypto.randomBytes(16).toString('hex');
    }

    private async generateSignature(payload: WebhookPayload, secret: string): Promise<string> {
        const nonce = await this.generateNonce()
        const { timestamp } = payload
        const timestampMs = Date.parse(timestamp);
        const now = Date.now()

        if (Math.abs(now - timestampMs) > 5 * 60 * 1000) {
            throw new Error('Timestamp validation failed. Request too old or future dated')
        }

        const hmac = crypto.createHmac('sha256', secret);
        payload.nonce = nonce

        const dataToSign = {
            ...payload, nonce, timestamp
        }

        hmac.update(JSON.stringify(dataToSign))
        const signature = hmac.digest('hex')

        if (payload.reqMethod === 'GET' || payload.reqMethod.startsWith('GET_')) {
            const url = new URL(payload.metadata?.url);
            url.searchParams.append('signature', signature)
            return url.toString()
        }

        return signature
    }

    async register (webhookdata: MerchantWebhook): Promise<MerchantWebhook> {
        const webhookExists = await this.merchantWebhookrepository.findOne({
            where: {
                id: webhookdata.id,
                merchantId: webhookdata.merchantId
            }
        })
        if (webhookExists) {
            throw new Error('Webhook already exists')
        }

        const webhook = this.merchantWebhookrepository.create(webhookdata)
        const savedWebhook = this.merchantWebhookrepository.save(webhook)

        return savedWebhook
    }

    async update (webhookData: MerchantWebhook): Promise<MerchantWebhook> {
        const existingWebhook = await this.merchantWebhookrepository.findOne({
            where: {
                id: webhookData.id,
                merchantId: webhookData.merchantId
            }
        })

        if (!existingWebhook) {
            throw new Error('Webhook does not exist. Register Webhook')
        }

        const updatedWebhook = this.merchantWebhookrepository.merge(existingWebhook, webhookData)

        const savedUpdatedWebhook = this.merchantWebhookrepository.save(updatedWebhook)

        return savedUpdatedWebhook
    }

    private async sendWebhookNotification(
        webhookUrl: string,
        payload: WebhookPayload,
        id: string,
    ): Promise<boolean> {
        try {
            const merchant: Merchant | null = await merchantAuthService.getMerchantById(id)
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

    async getMerchantWebhook(merchantId: string): Promise<MerchantWebhook | null> {
        try {
            const merchantWebhook = await this.merchantWebhookrepository.findOne({
                where: {
                    merchantId
                }
            })
            if (!merchantWebhook) {
                throw new Error('Merchant web hook not found')
            }
            if (!merchantWebhook.isActive) {
                throw new Error('Merchant web hook not active')
            }
            return merchantWebhook
        } catch (err) {
            console.error('Failed to get merchant webhook', err)
            return null
        }
    }

    private async notifyPaymentUpdate(
        merchantWebhook: MerchantWebhook,
        paymentDetails: Omit<WebhookPayload, 'timestamp'>
    ): Promise<boolean> {
        const merchant = await merchantAuthService.getMerchantById(merchantWebhook.merchantId)
        if (!merchantWebhook.isActive || !validateWebhookUrl(merchantWebhook.url)) {
            return false;
        }

        const webhookPayload: WebhookPayload = {
            ...paymentDetails,
            timestamp: new Date().toISOString()
        }

        return this.sendWebhookNotification(merchantWebhook.url, webhookPayload, merchant?.secret!)
    }

    async notifyWithRetry(merchantWebhook: MerchantWebhook, webhookPayload: WebhookPayload, maxRetries = 3, delay = 3000) {
        let attempts = 0;

        while (attempts < maxRetries) {
            try {
                await this.notifyPaymentUpdate(merchantWebhook, webhookPayload);
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
}