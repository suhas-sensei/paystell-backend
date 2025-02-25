import { Request, Response } from "express";
import { MerchantWebhookQueueService } from "../services/MerchantWebhookQueue.service";

const merchantWebhookQueueService = new MerchantWebhookQueueService();


export class MerchantWebhookQueueController {
  async getFailedWebhooks(req: Request, res: Response): Promise<any> {
    try {
      const { merchantId, limit, offset } = req.query;

      const limitNum = limit ? parseInt(limit as string) : 10;
      const offsetNum = offset ? parseInt(offset as string) : 0;

      const failedWebhooks =
        await merchantWebhookQueueService.getFailedWebhookEvents(
          merchantId as string,
          limitNum,
          offsetNum
        );

      return res.json({
        status: "success",
        data: failedWebhooks,
      });
    } catch (err: any) {
      console.error("Error fetching failed webhooks:", err);
      return res.status(500).json({
        status: "error",
        message: "Failed to fetch failed webhooks",
        error: err.message,
      });
    }
  }

  async getPendingWebhooks(req: Request, res: Response): Promise<any> {
    try {
      const { merchantId, limit, offset } = req.query;

      const limitNum = limit ? parseInt(limit as string) : 10;
      const offsetNum = offset ? parseInt(offset as string) : 0;

      const pendingWebhooks =
        await merchantWebhookQueueService.getPendingWebhookEvents(
          merchantId as string,
          limitNum,
          offsetNum
        );

      return res.json({
        status: "success",
        data: pendingWebhooks,
      });
    } catch (err: any) {
      console.error("Error fetching pending webhooks:", err);
      return res.status(500).json({
        status: "error",
        message: "Failed to fetch pending webhooks",
        error: err.message,
      });
    }
  }

  async retryWebhook(req: Request, res: Response): Promise<any> {
    try {
      const { jobId } = req.params;

      if (!jobId) {
        return res.status(400).json({
          status: "error",
          message: "Job ID is required",
        });
      }

      await merchantWebhookQueueService.retryWebhook(jobId);

      return res.json({
        status: "success",
        message: "Webhook queued for retry",
      });
    } catch (err: any) {
      console.error("Error retrying webhook:", err);
      return res.status(500).json({
        status: "error",
        message: "Failed to retry webhook",
        error: err.message,
      });
    }
  }

  async getQueueMetrics(req: Request, res: Response): Promise<any> {
    try {
      const { merchantId } = req.query;
      const metrics = await merchantWebhookQueueService.getQueueMetrics(
        merchantId as string
      );

      return res.json({
        status: "success",
        data: metrics,
      });
    } catch (err: any) {
      console.error("Error fetching queue metrics:", err);
      return res.status(500).json({
        status: "error",
        message: "Failed to fetch queue metrics",
        error: err.message,
      });
    }
  }
}
