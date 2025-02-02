import { Merchant, MerchantWebhook } from "../interfaces/webhook.interfaces"

export class MerchantAuthService {
    private async findMerchantByApiKey(apiKey: string): Promise <Merchant | null> {
        try {
            // This should be replaced with a mechanism to find the merchant from the db. The return statement remains
            const createDate = new Date()
            createDate.setDate(createDate.getDate() - 1) 
                
            return {
                ...merchantDetailsWithoutApiKey,
                apiKey,
            }
        } catch (err) {
            console.error(err)
            return null
        }
    }

    static async getMerchantById(id: string): Promise<Merchant | null>{
        // replace with a method to find merchant from db by id
        const date = new Date()
        const merchant: Omit<Merchant, 'createdAt' & 'updatedAt'> = {
            ...sampleMerchantWithoutId,
            id,
        }
        if (!merchant.isActive) {
            throw new Error('Merchant not found');
        }
        return merchant
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