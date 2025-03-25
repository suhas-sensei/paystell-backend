import { Router } from "express";
import { SalesSummaryController } from "../controllers/SalesSummary.controller";
import { authenticateMerchant } from "../middlewares/merchantAuth";

const router = Router();
const salesSummaryController = new SalesSummaryController();

/**
 * @route   GET /api/sales-summary/total
 * @desc    Get total sales for a merchant
 * @access  Private (Merchant)
 */
router.get(
  "/total",
  authenticateMerchant,
  salesSummaryController.getTotalSales.bind(salesSummaryController)
);

/**
 * @route   GET /api/sales-summary/by-period/:timePeriod
 * @desc    Get sales breakdown by time period (daily/weekly/monthly)
 * @access  Private (Merchant)
 */
router.get(
  "/by-period/:timePeriod",
  authenticateMerchant,
  salesSummaryController.getSalesByTimePeriod.bind(salesSummaryController)
);

/**
 * @route   GET /api/sales-summary/top-products
 * @desc    Get top selling products
 * @access  Private (Merchant)
 */
router.get(
  "/top-products",
  authenticateMerchant,
  salesSummaryController.getTopSellingProducts.bind(salesSummaryController)
);

/**
 * @route   GET /api/sales-summary
 * @desc    Get complete sales summary with all metrics
 * @access  Private (Merchant)
 */
router.get(
  "/",
  authenticateMerchant,
  salesSummaryController.getSalesSummary.bind(salesSummaryController)
);

export default router;