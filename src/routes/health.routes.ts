import express from "express";
import AppDataSource from "../config/db";

const router = express.Router();

router.get("/", async (_req, res) => {
  const healthcheck = {
    uptime: process.uptime(),
    message: "OK",
    timestamp: Date.now()
  };
  
  try {
    res.status(200).json(healthcheck);
  } catch (error) {
    healthcheck.message = error instanceof Error ? error.message : "Unknown error";
    res.status(503).json(healthcheck);
  }
});

router.get("/db", async (_req, res) => {
  const healthcheck = {
    message: "OK",
    timestamp: Date.now()
  };
  
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    
    await AppDataSource.query("SELECT 1");
    res.status(200).json(healthcheck);
  } catch (error) {
    healthcheck.message = error instanceof Error ? error.message : "Database connection failed";
    res.status(503).json(healthcheck);
  }
});

router.get("/dependencies", async (_req, res) => {
  const healthcheck = {
    message: "OK",
    dependencies: {
      stellar: "OK"
    },
    timestamp: Date.now()
  };
  
  try {
    // TODO: Implement Stellar health check here
    // Add code to check Stellar connectivity
    
    res.status(200).json(healthcheck);
  } catch (error) {
    healthcheck.message = error instanceof Error ? error.message : "Dependencies check failed";
    res.status(503).json(healthcheck);
  }
});

export default router; 