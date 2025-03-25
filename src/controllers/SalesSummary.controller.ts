import { Request, Response } from "express";
import { SalesSummaryService } from "../services/SalesSummary.service";
import { Merchant } from "../interfaces/webhook.interfaces";

// Define custom request type with merchant property
interface MerchantRequest extends Request {
  merchant?: Merchant;
}

export class SalesSummaryController {
  private salesSummaryService: SalesSummaryService;

  constructor() {
    this.salesSummaryService = new SalesSummaryService();
  }

  /**
   * Get total sales for a merchant
   */
  async getTotalSales(req: MerchantRequest, res: Response): Promise<Response> {
    try {
      const merchantId = req.merchant?.id;
      
      if (!merchantId) {
        return res.status(401).json({ error: "Merchant not authenticated" });
      }

      // Parse date parameters
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

      // Validate dates if provided
      if (startDate && isNaN(startDate.getTime())) {
        return res.status(400).json({ error: "Invalid startDate format" });
      }

      if (endDate && isNaN(endDate.getTime())) {
        return res.status(400).json({ error: "Invalid endDate format" });
      }

      const totalSales = await this.salesSummaryService.getTotalSales(
        merchantId,
        startDate,
        endDate
      );

      return res.status(200).json({
        success: true,
        data: {
          totalSales
        }
      });
    } catch (error) {
      console.error("Error getting total sales:", error);
      return res.status(500).json({ 
        success: false,
        error: (error as Error).message || "Failed to get total sales"
      });
    }
  }

  /**
   * Get sales by time period (daily/weekly/monthly)
   */
  async getSalesByTimePeriod(req: MerchantRequest, res: Response): Promise<Response> {
    try {
      const merchantId = req.merchant?.id;
      
      if (!merchantId) {
        return res.status(401).json({ error: "Merchant not authenticated" });
      }

      // Get and validate timePeriod parameter
      const timePeriod = req.params.timePeriod as 'daily' | 'weekly' | 'monthly';
      if (!['daily', 'weekly', 'monthly'].includes(timePeriod)) {
        return res.status(400).json({ 
          error: "Invalid timePeriod. Must be one of: daily, weekly, monthly"
        });
      }

      // Parse date parameters
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

      // Validate dates if provided
      if (startDate && isNaN(startDate.getTime())) {
        return res.status(400).json({ error: "Invalid startDate format" });
      }

      if (endDate && isNaN(endDate.getTime())) {
        return res.status(400).json({ error: "Invalid endDate format" });
      }

      const salesByPeriod = await this.salesSummaryService.getSalesByTimePeriod(
        merchantId,
        timePeriod,
        startDate,
        endDate
      );

      return res.status(200).json({
        success: true,
        data: {
          timePeriod,
          sales: salesByPeriod
        }
      });
    } catch (error) {
      console.error(`Error getting ${req.params.timePeriod} sales:`, error);
      return res.status(500).json({ 
        success: false,
        error: (error as Error).message || `Failed to get ${req.params.timePeriod} sales`
      });
    }
  }

  /**
   * Get top selling products
   */
  async getTopSellingProducts(req: MerchantRequest, res: Response): Promise<Response> {
    try {
      const merchantId = req.merchant?.id;
      
      if (!merchantId) {
        return res.status(401).json({ error: "Merchant not authenticated" });
      }

      // Parse limit parameter
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      
      // Validate limit
      if (isNaN(limit) || limit < 1 || limit > 100) {
        return res.status(400).json({ error: "Invalid limit. Must be a number between 1 and 100" });
      }

      // Parse date parameters
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

      // Validate dates if provided
      if (startDate && isNaN(startDate.getTime())) {
        return res.status(400).json({ error: "Invalid startDate format" });
      }

      if (endDate && isNaN(endDate.getTime())) {
        return res.status(400).json({ error: "Invalid endDate format" });
      }

      const topProducts = await this.salesSummaryService.getTopSellingProducts(
        merchantId,
        limit,
        startDate,
        endDate
      );

      return res.status(200).json({
        success: true,
        data: {
          topProducts
        }
      });
    } catch (error) {
      console.error("Error getting top selling products:", error);
      return res.status(500).json({ 
        success: false,
        error: (error as Error).message || "Failed to get top selling products"
      });
    }
  }

  /**
   * Get complete sales summary with all metrics
   */
  async getSalesSummary(req: MerchantRequest, res: Response): Promise<Response> {
    try {
      const merchantId = req.merchant?.id;
      
      if (!merchantId) {
        return res.status(401).json({ error: "Merchant not authenticated" });
      }

      // Parse date parameters
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

      // Validate dates if provided
      if (startDate && isNaN(startDate.getTime())) {
        return res.status(400).json({ error: "Invalid startDate format" });
      }

      if (endDate && isNaN(endDate.getTime())) {
        return res.status(400).json({ error: "Invalid endDate format" });
      }

      const summary = await this.salesSummaryService.getSalesSummary(
        merchantId,
        startDate,
        endDate
      );

      return res.status(200).json({
        success: true,
        data: summary
      });
    } catch (error) {
      console.error("Error getting sales summary:", error);
      return res.status(500).json({ 
        success: false,
        error: (error as Error).message || "Failed to get sales summary"
      });
    }
  }
}