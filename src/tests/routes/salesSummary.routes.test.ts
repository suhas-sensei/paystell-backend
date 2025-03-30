import request from "supertest";
import express from "express";
import salesSummaryRoutes from "../../routes/salesSummary.routes";
import { SalesSummaryController } from "../../controllers/SalesSummary.controller";
import { authenticateMerchant } from "../../middlewares/merchantAuth";

// Mock the middleware and controller
jest.mock("../../middlewares/merchantAuth", () => ({
  authenticateMerchant: jest.fn((req, res, next) => next()),
}));

jest.mock("../../controllers/SalesSummary.controller");

describe("Sales Summary Routes", () => {
  let app: express.Application;
  let mockSalesSummaryController: jest.Mocked<SalesSummaryController>;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Creates mock controller
    mockSalesSummaryController = {
      getTotalSales: jest.fn(),
      getSalesByTimePeriod: jest.fn(),
      getTopSellingProducts: jest.fn(),
      getSalesSummary: jest.fn(),
    } as unknown as jest.Mocked<SalesSummaryController>;

    // Mock the controller constructor
    (SalesSummaryController as jest.Mock).mockImplementation(() => mockSalesSummaryController);

    // Setup express app
    app = express();
    app.use(express.json());
    app.use("/api/sales-summary", salesSummaryRoutes);
  });

  describe("GET /api/sales-summary/total", () => {
    it("should call the controller's getTotalSales method", async () => {
      mockSalesSummaryController.getTotalSales.mockImplementation((req, res) => {
        res.status(200).json({ success: true, data: { totalSales: 1500 } });
        return Promise.resolve() as unknown as Promise<express.Response>;
      });

      const response = await request(app).get("/api/sales-summary/total");

      expect(authenticateMerchant).toHaveBeenCalled();
      expect(mockSalesSummaryController.getTotalSales).toHaveBeenCalled();
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true, data: { totalSales: 1500 } });
    });
  });

  describe("GET /api/sales-summary/by-period/:timePeriod", () => {
    it("should call the controller's getSalesByTimePeriod method", async () => {
      mockSalesSummaryController.getSalesByTimePeriod.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: {
            timePeriod: "daily",
            sales: [
              { date: "2023-01-01", total: 100 },
              { date: "2023-01-02", total: 200 },
            ],
          },
        });
        return Promise.resolve() as unknown as Promise<express.Response>;
      });

      const response = await request(app).get("/api/sales-summary/by-period/daily");

      expect(authenticateMerchant).toHaveBeenCalled();
      expect(mockSalesSummaryController.getSalesByTimePeriod).toHaveBeenCalled();
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.timePeriod).toBe("daily");
      expect(response.body.data.sales.length).toBe(2);
    });
  });

  describe("GET /api/sales-summary/top-products", () => {
    it("should call the controller's getTopSellingProducts method", async () => {
      mockSalesSummaryController.getTopSellingProducts.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: {
            topProducts: [
              { name: "Product 1", sku: "SKU1", total: 500, count: 5 },
              { name: "Product 2", sku: "SKU2", total: 300, count: 3 },
            ],
          },
        });
        return Promise.resolve() as unknown as Promise<express.Response>;
      });

      const response = await request(app).get("/api/sales-summary/top-products");

      expect(authenticateMerchant).toHaveBeenCalled();
      expect(mockSalesSummaryController.getTopSellingProducts).toHaveBeenCalled();
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.topProducts.length).toBe(2);
    });
  });

  describe("GET /api/sales-summary", () => {
    it("should call the controller's getSalesSummary method", async () => {
      mockSalesSummaryController.getSalesSummary.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: {
            totalSales: 1000,
            dailySales: [{ date: "2023-01-01", total: 100 }],
            monthlySales: [{ date: "2023-01", total: 300 }],
            topProducts: [{ name: "Product 1", sku: "SKU1", total: 500, count: 5 }],
          },
        });
        return Promise.resolve() as unknown as Promise<express.Response>;
      });

      const response = await request(app).get("/api/sales-summary");

      expect(authenticateMerchant).toHaveBeenCalled();
      expect(mockSalesSummaryController.getSalesSummary).toHaveBeenCalled();
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.totalSales).toBe(1000);
    });
  });
});