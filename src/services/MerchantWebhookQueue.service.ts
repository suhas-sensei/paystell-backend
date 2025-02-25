import Queue from "bull";
import { Repository } from "typeorm";
import {
  WebhookPayload,
  MerchantWebhook,
} from "../interfaces/webhook.interfaces";
import { MerchantWebhookEventEntity } from "../entities/MerchantWebhookEvent.entity";
import AppDataSource from "../config/db";
import { WebhookService } from "./webhook.service";
import { MerchantWebhookEventEntityStatus } from "../enums/MerchantWebhookEventStatus";
import { NotificationService } from "./inAppNotification.service";
import {
  NotificationCategory,
  NotificationType,
} from "../entities/InAppNotification.entity";

const notificationService = new NotificationService()

export class MerchantWebhookQueueService {
  private webhookQueue: Queue.Queue;
  private merchantWebhookEventRepository: Repository<MerchantWebhookEventEntity>;
  private webhookService: WebhookService;
  private MERCHANT_WEBHOOK_QUEUE = "merchant-webhook-queue";

  constructor() {
    // Set up the queue with exponential backoff
    this.webhookQueue = new Queue(this.MERCHANT_WEBHOOK_QUEUE, {
      redis: {
        host: process.env.REDIS_HOST || "localhost",
        port: parseInt(process.env.REDIS_PORT || "6379"),
      },
      defaultJobOptions: {
        attempts: 5, // Maximum number of retry attempts
        backoff: {
          type: "exponential",
          delay: 5000, // 5 seconds initial delay
        },
        removeOnComplete: false, // Keep successful jobs for tracking
        removeOnFail: false, // Keep failed jobs for manual retries
      },
    });

    this.merchantWebhookEventRepository = AppDataSource.getRepository(
      MerchantWebhookEventEntity
    );

    this.webhookService = new WebhookService();

    this.setupQueueProcessor();
    this.setupQueueEvents();
  }

  private setupQueueProcessor() {
    this.webhookQueue.process(async (job: any) => {
      const { merchantWebhook, webhookPayload } = job.data;
      const attemptsMade = job.attemptsMade;

      try {
        const result = await this.webhookService.notifyPaymentUpdate(
          merchantWebhook,
          webhookPayload
        );

        if (!result) {
          throw new Error("Webhook notification failed");
        }

        // Update webhook event record on success
        await this.merchantWebhookEventRepository.update(
          { jobId: job.id.toString() },
          {
            status: MerchantWebhookEventEntityStatus.COMPLETED,
            attemptsMade,
            completedAt: new Date(),
            nextRetry: undefined,
          }
        );

        console.log(
          `Webhook delivered successfully to ${merchantWebhook.url} after ${attemptsMade} attempt(s)`
        );

        return { success: true };
      } catch (error: any) {
        // Calculate next retry time
        const nextRetryDelay = this.calculateNextRetryDelay(attemptsMade);
        const nextRetryDate = new Date(Date.now() + nextRetryDelay);

        // Record failed attempt in database
        const isLastAttempt = attemptsMade >= job.opts.attempts;

        await this.merchantWebhookEventRepository.update(
          { jobId: job.id.toString() },
          {
            status: isLastAttempt
              ? MerchantWebhookEventEntityStatus.FAILED
              : MerchantWebhookEventEntityStatus.PENDING,
            error: error?.message || "Unknown error",
            attemptsMade,
            nextRetry: isLastAttempt ? undefined : nextRetryDate,
          }
        );

        console.error(
          `Webhook delivery attempt ${attemptsMade} failed for ${merchantWebhook.url}:`,
          error.message
        );

        throw error;
      }
    });
  }

  private setupQueueEvents() {
    // Listen for failed jobs after all retries
    this.webhookQueue.on("failed", async (job, error) => {
      const attemptsMade = job.attemptsMade;
      const maxAttempts = job.opts.attempts || 5;
      const { merchantWebhook, webhookPayload } = job.data;

      let nextRetryTimestamp = null;
      if (attemptsMade < maxAttempts - 1) {
        const nextRetryDelay = this.calculateNextRetryDelay(attemptsMade);
        nextRetryTimestamp = new Date(Date.now() + nextRetryDelay);
      }

      console.error("Webhook delivery failure details:", {
        merchantId: merchantWebhook.merchantId,
        originalPayload: webhookPayload,
        error: error.message,
        attemptNumber: attemptsMade + 1, // Make human-readable (1-based)
        maxAttempts: maxAttempts,
        isFinalAttempt: attemptsMade >= maxAttempts - 1,
        nextRetryTimestamp: nextRetryTimestamp,
        webhookUrl: merchantWebhook.url,
        jobId: job.id,
      });

      if (attemptsMade >= maxAttempts) {
        const alertData = {
          merchantId: merchantWebhook.merchantId,
          webhookUrl: merchantWebhook.url,
          transactionId: webhookPayload.transactionId,
          error: error.message,
          attemptNumber: attemptsMade + 1,
          jobId: job.id,
          timestamp: new Date().toISOString(),
        };

        console.error(
          `ALERT: Webhook delivery failed after ${maxAttempts} attempts for job ${job.id}`,
          alertData
        );

        try {
          await notificationService.createNotification({
            title: "Webhook Delivery Failed",
            message: `Webhook to ${merchantWebhook.url} for transaction ${webhookPayload.transactionId} failed after ${maxAttempts} attempts.`,
            notificationType: NotificationType.ADMIN,
            category: NotificationCategory.ERROR,
            priority: 2,
            metadata: {
              ...alertData,
              merchantWebhookId: merchantWebhook.id,
              asset: webhookPayload.asset,
              amount: webhookPayload.amount,
              eventType: webhookPayload.eventType,
            },
            link: `/admin/webhooks/failed/${job.id}`,
          });

          console.log("Created notification for failed webhook");
        } catch (notificationError) {
          console.error("Failed to create notification:", notificationError);
        }

        // Final failure after all retry attempts
        console.error(
          `ALERT: Webhook delivery failed after ${maxAttempts} attempts for job ${job.id}`,
          {
            merchantId: merchantWebhook.merchantId,
            transactionId: webhookPayload.transactionId,
            error: error.message,
          }
        );

        await this.merchantWebhookEventRepository.update(
          { jobId: job.id.toString() },
          {
            status: MerchantWebhookEventEntityStatus.FAILED,
            attemptsMade: maxAttempts,
            nextRetry: undefined,
            completedAt: new Date(),
          }
        );
      }
    });

    // Optional: Track completed jobs for metrics
    this.webhookQueue.on("completed", async (job) => {
      const { merchantWebhook } = job.data;
      const attemptsMade = job.attemptsMade;

      console.log(
        `Webhook to merchant ${merchantWebhook.merchantId} completed successfully after ${attemptsMade} attempt(s)`
      );
    });
  }

  private calculateNextRetryDelay(attemptsMade: number): number {
    const baseDelay = 5000; // 5 seconds
    const maxDelay = 3600000; // 1 hour

    // Exponential backoff: 5s, 10s, 20s, 40s ...
    const delay = baseDelay * Math.pow(2, attemptsMade - 1);

    // Cap at max delay
    return Math.min(delay, maxDelay);
  }

  async addToQueue(
    merchantWebhook: MerchantWebhook,
    webhookPayload: WebhookPayload
  ) {
    // Create a unique job ID
    const uniqueId = `${merchantWebhook.merchantId}-${webhookPayload.transactionId}-${Date.now()}`;

    // Add job to the queue
    const job = await this.webhookQueue.add(
      { merchantWebhook, webhookPayload },
      {
        jobId: uniqueId,
        attempts: 5,
      }
    );

    // Create webhook event record in database - fix type issues
    const webhookEvent = new MerchantWebhookEventEntity();
    webhookEvent.jobId = job.id.toString();
    webhookEvent.merchantId = merchantWebhook.merchantId;
    webhookEvent.webhookUrl = merchantWebhook.url;
    webhookEvent.payload = webhookPayload;
    webhookEvent.status = MerchantWebhookEventEntityStatus.PENDING;
    webhookEvent.attemptsMade = 0;
    webhookEvent.maxAttempts = 5;
    webhookEvent.nextRetry = new Date(Date.now() + 5000);

    await this.merchantWebhookEventRepository.save(webhookEvent);

    return job;
  }

  async getFailedWebhookEvents(merchantId?: string, limit = 10, offset = 0) {
    const query = this.merchantWebhookEventRepository
      .createQueryBuilder("event")
      .where("event.status = :status", {
        status: MerchantWebhookEventEntityStatus.FAILED,
      })
      .orderBy("event.completedAt", "DESC")
      .limit(limit)
      .offset(offset);

    if (merchantId) {
      query.andWhere("event.merchantId = :merchantId", { merchantId });
    }

    return query.getMany();
  }

  async getPendingWebhookEvents(merchantId?: string, limit = 10, offset = 0) {
    const query = this.merchantWebhookEventRepository
      .createQueryBuilder("event")
      .where("event.status = :status", {
        status: MerchantWebhookEventEntityStatus.PENDING,
      })
      .orderBy("event.nextRetry", "ASC")
      .limit(limit)
      .offset(offset);

    if (merchantId) {
      query.andWhere("event.merchantId = :merchantId", { merchantId });
    }

    return query.getMany();
  }

  async retryWebhook(jobId: string) {
    const job = await this.webhookQueue.getJob(jobId);

    if (!job) {
      throw new Error("Webhook job not found");
    }

    // Reset job attempt count for manual retry
    await job.retry();

    // Update database record
    await this.merchantWebhookEventRepository.update(
      { jobId: job.id.toString() },
      {
        status: MerchantWebhookEventEntityStatus.PENDING,
        error: undefined,
        nextRetry: new Date(),
      }
    );

    return job;
  }

  async getQueueMetrics(merchantId?: string) {
    // Get queue statistics
    const [active, completed, failed, delayed, waiting] = await Promise.all([
      this.webhookQueue.getActiveCount(),
      this.webhookQueue.getCompletedCount(),
      this.webhookQueue.getFailedCount(),
      this.webhookQueue.getDelayedCount(),
      this.webhookQueue.getWaitingCount(),
    ]);

    // Calculate success rate
    const total = completed + failed;
    const successRate = total > 0 ? (completed / total) * 100 : 100;

    // Get merchant-specific metrics if requested
    let merchantMetrics = {};
    if (merchantId) {
      const merchantEvents = await this.merchantWebhookEventRepository
        .createQueryBuilder("event")
        .select("event.status", "status")
        .addSelect("COUNT(*)", "count")
        .where("event.merchantId = :merchantId", { merchantId })
        .groupBy("event.status")
        .getRawMany();

      // Convert to object with status as key
      const statusCounts = merchantEvents.reduce(
        (acc, curr) => {
          acc[curr.status] = parseInt(curr.count);
          return acc;
        },
        {
          [MerchantWebhookEventEntityStatus.PENDING]: 0,
          [MerchantWebhookEventEntityStatus.COMPLETED]: 0,
          [MerchantWebhookEventEntityStatus.FAILED]: 0,
        }
      );

      // Calculate merchant-specific success rate
      const merchantTotal =
        statusCounts[MerchantWebhookEventEntityStatus.COMPLETED] +
        statusCounts[MerchantWebhookEventEntityStatus.FAILED];

      const merchantSuccessRate =
        merchantTotal > 0
          ? (statusCounts[MerchantWebhookEventEntityStatus.COMPLETED] /
              merchantTotal) *
            100
          : 100;

      merchantMetrics = {
        completed: statusCounts[MerchantWebhookEventEntityStatus.COMPLETED],
        failed: statusCounts[MerchantWebhookEventEntityStatus.FAILED],
        pending: statusCounts[MerchantWebhookEventEntityStatus.PENDING],
        successRate: merchantSuccessRate,
      };
    }

    return {
      overall: {
        active,
        completed,
        failed,
        delayed,
        waiting,
        successRate,
      },
      merchant: merchantId ? merchantMetrics : undefined,
    };
  }
}
