import request from "supertest";
import app from "../app";
import { getConnection } from "typeorm";

// Mock the TypeORM getConnection
jest.mock("typeorm", () => ({
  getConnection: jest.fn().mockReturnValue({
    query: jest.fn().mockResolvedValue(true)
  })
}));

describe("Health Check Endpoints", () => {
  describe("GET /health", () => {
    it("should return 200 and uptime information", async () => {
      const response = await request(app).get("/health");
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("uptime");
      expect(response.body.message).toBe("OK");
      expect(response.body).toHaveProperty("timestamp");
    });
  });

  describe("GET /health/db", () => {
    it("should return 200 if database connection is successful", async () => {
      const response = await request(app).get("/health/db");
      
      expect(response.status).toBe(200);
      expect(response.body.message).toBe("OK");
      expect(getConnection().query).toHaveBeenCalledWith("SELECT 1");
    });

    it("should return 503 if database connection fails", async () => {
      // Mock a database connection failure
      (getConnection().query as jest.Mock).mockRejectedValueOnce(new Error("Database connection failed"));
      
      const response = await request(app).get("/health/db");
      
      expect(response.status).toBe(503);
      expect(response.body.message).toBe("Database connection failed");
    });
  });

  describe("GET /health/dependencies", () => {
    it("should return 200 if all dependencies are accessible", async () => {
      const response = await request(app).get("/health/dependencies");
      
      expect(response.status).toBe(200);
      expect(response.body.message).toBe("OK");
      expect(response.body.dependencies).toHaveProperty("stellar");
    });
  });
}); 