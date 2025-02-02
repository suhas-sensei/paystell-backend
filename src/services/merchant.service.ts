import { Merchant } from "../interfaces/webhook.interfaces"

export class MerchantAuthService {
    private async findMerchantByApiKey(apiKey: string): Promise <Merchant | null> {
        try {
            // This should be replaced with a mechanism to find the merchant from the db. The return statement remains
            const createDate = new Date()
            createDate.setDate(createDate.getDate() - 1) 
                const merchantDetails = {
                    id: crypto.randomUUID(),
                    name: 'random-merchant',
                    email: 'merchant-email',
                    secret: 'merchant-secret',
                    apiKey,
                    isActive: false,
                    createdAt: new Date()
                    }
            return {
                id: merchantDetails.id,
                apiKey: merchantDetails.apiKey,
                secret: merchantDetails.secret,
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
    
        const merchant: Merchant | null = await this.findMerchantByApiKey(apiKey);
        
        if (!merchant || !merchant.isActive) {
          throw new Error("Merchant does not exist or is not active")
        }
    
        return merchant;
    }
}