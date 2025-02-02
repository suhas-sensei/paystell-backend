import request from "supertest";
import { WebhookController } from "../../controllers/webhook.controller";
import { MerchantAuthService } from "../../services/merchant.service";
import { WebhookService } from "../../services/webhook.service";
import app from "../../app"; // Assuming Express app is exported from app.ts

jest.mock("../../services/merchant.service");
jest.mock("../../services/webhook.service");

describe("WebhookController", () => {
    let webhookController: WebhookController;

    beforeEach(() => {
        webhookController = new WebhookController();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should return 500 if an error occurs", async () => {
        const response = await request(app)
            .post("/webhook")
            .send({ payload: null });

        expect(response.status).toBe(500);
        expect(response.body.error).toBe("Webhook error");
    });

    it("should return 200 if merchant and webhook exist", async () => {
        const mockMerchant = { id: "merchant123" };
        const mockWebhook = { id: "webhook123", url: "https://webhook.site/test" };

        (MerchantAuthService.getMerchantById as jest.Mock).mockResolvedValue(mockMerchant);
        (WebhookService.getMerchantWebhook as jest.Mock).mockResolvedValue(mockWebhook);
        (WebhookService.prototype.notifyWithRetry as jest.Mock).mockResolvedValue(undefined);

        const response = await request(app)
            .post("/webhook")
            .send({
                payload: {
                    customer: { id: "merchant123" },
                    transaction: {
                        id: "txn123",
                        type: "payment",
                        status: "completed",
                        amount_in: { amount: "100", asset: "USD" },
                    },
                },
            });

        expect(response.status).toBe(200);
    });

    it("should return 400 if merchant does not exist", async () => {
        (MerchantAuthService.getMerchantById as jest.Mock).mockResolvedValue(null);

        const response = await request(app)
            .post("/webhook")
            .send({
                payload: {
                    customer: { id: "invalid_merchant" },
                    transaction: {},
                },
            });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe("Merchant not found");
    });

    it("should return 400 if webhook does not exist", async () => {
        const mockMerchant = { id: "merchant123" };
        (MerchantAuthService.getMerchantById as jest.Mock).mockResolvedValue(mockMerchant);
        (WebhookService.getMerchantWebhook as jest.Mock).mockResolvedValue(null);

        const response = await request(app)
            .post("/webhook")
            .send({
                payload: {
                    customer: { id: "merchant123" },
                    transaction: {},
                },
            });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe("Webhook not found");
    });
});
