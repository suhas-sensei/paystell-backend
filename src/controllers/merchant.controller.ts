import { Request, Response } from 'express'
import { validateWebhookUrl } from '../validators/webhook.validators'
import crypto from 'crypto'
import { MerchantWebhook } from '../interfaces/webhook.interfaces';


export class MerchantController {

    async registerMerchant(req: Request, res: Response) {
        try {
          const { name, email } = req.body;
          
          // Generate API key for the merchant
          const apiKey = crypto.randomBytes(32).toString('hex');
          
          // Create merchant in database, something like this, edit this to be a function that posts this object
          const merchant = {
            id: crypto.randomUUID(),
            name,
            email,
            apiKey,
            // password: crypto.createHmac('sha256', password),
            isActive: true
          };
    
          // Return their credentials
          return res.status(201).json({
            message: 'Registration successful',
            merchantId: merchant.id,
            apiKey: apiKey // They'll use this for future requests
          });
        } catch (error) {
          console.error('Registration failed:', error);
          return res.status(500).json({ error: 'Registration failed' });
        }
      }

    async registerWebhook(req: Request, res: Response) {
        try {
            const { url } = req.body;
            const merchantId = req.merchant.id
            // the middleware helped join it to our request headers

            if (!validateWebhookUrl(url)) {
                return res.status(400).json({
                    error: 'Invalid webhook url. Must be a valid HTTPS url'
                })
            }

            const secret = crypto.randomBytes(32).toString('hex');
            const webhook: MerchantWebhook = {
                id: crypto.randomUUID(),
                merchantId,
                url,
                secret,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            }
            // implement logic to save to database here

            return res.status(201).json({
                message: 'Webhook registered successfully',
                webhook: {
                    id: webhook.id,
                    url: webhook.url,
                    secret: webhook.secret
                }
            });
        } catch (err) {
            console.error('Failed to register webhook', err)
            return res.status(500).json({error: 'Internal Server Error'})
        }
    }
}