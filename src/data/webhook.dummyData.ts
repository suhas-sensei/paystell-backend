// These dummy data is used in services concerning webhooks

// To be used in getMerchantWebhook by merchantId
export const sampleWebhookWithoutMerchantId = {
    id: 'merchant-webhook-id',
    url: 'merchant-webhook-url',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
}

// To be used in getMerchant by id
export const sampleMerchantWithoutId = {
    apiKey: 'random-api-key',
    name: 'random-merchant-name',
    email: 'randomMerchant@gmail.com',
    secret: 'merchant-webhook-secret',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
}

// To be used in find merchant by Api Key
const merchantDetailsWithoutApiKey = {
    id: crypto.randomUUID(),
    name: 'random-merchant',
    email: 'merchant-email',
    secret: 'merchant-secret',
    isActive: false,
    createdAt: new Date(),
    updatedAt: new Date()
}