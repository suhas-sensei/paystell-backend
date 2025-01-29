export type WebhookPayload = {
    transactionId: string,
    status: 'success' | 'failure' | 'pending',
    amount: number,
    currency: string, // This should be the coin, whether USDC or XLM etc
    merchantId: string,
    timestamp: string,
    paymentMethod: string,
    metadata?: Record<string, any>
}

export type MerchantWebhook = {
    id: string,
    merchantId: string,
    url: string,
    secret: string,
    isActive: boolean,
    createdAt: Date,
    updatedAt: Date
}

export type Merchant = {
    id: string;
    apiKey: string;
    name: string;
    email: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}