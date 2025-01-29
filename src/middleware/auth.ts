// middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import { MerchantAuthService } from '../services/webhook.service';

const merchantAuthService = new MerchantAuthService();

// Add merchant to Request type
declare global {
    namespace Express {
        interface Request {
            merchant?: any; // or your Merchant interface
        }
    }
}

export const authenticateMerchant = async (
    req: Request, 
    res: Response, 
    next: NextFunction
) => {
    try {
        const apiKey = req.headers['x-api-key'] as string;
        
        if (!apiKey) {
            return res.status(401).json({
                error: 'No API key provided'
            });
        }

        // Use your MerchantAuthService to find the merchant
        const merchant = await merchantAuthService.validateApiKey(apiKey);

        if (!merchant) {
            return res.status(401).json({
                error: 'Invalid API key'
            });
        }

        // Attach merchant to request object
        req.merchant = merchant;
        next();
    } catch (error) {
        console.error('Auth error:', error);
        res.status(500).json({ error: 'Authentication failed' });
    }
};