import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import { config } from "./config.js";
import { logger } from "./lib/logger.js";
import { healthRoutes } from "./routes/health.js";
import { publicRoutes } from "./routes/public.js";
import { adminRoutes } from "./routes/admin.js";
import { applicationRoutes } from "./modules/applications/routes.js";
import { auctionRoutes } from "./modules/auctions/routes.js";
import { startIndexer } from "./chain/indexer.js";

const app = Fastify({ logger: false, trustProxy: true });

await app.register(helmet);
await app.register(cors, { origin: config.CORS_ORIGIN, credentials: true });

await app.register(healthRoutes);

// Public read endpoints: /api/vault, /api/loans, /api/events
await app.register(publicRoutes, { prefix: "/api" });

// Borrower application + public auction list
await app.register(applicationRoutes, { prefix: "/api" });
await app.register(auctionRoutes, { prefix: "/api" });

// Admin (dilindungi API key)
await app.register(adminRoutes, { prefix: "/api/admin" });

startIndexer().catch((err) => logger.error("Indexer crashed", err));

try {
    await app.listen({ port: config.PORT, host: "0.0.0.0" });
    logger.info(`HOMR API listening on :${config.PORT}`);
} catch (err) {
    logger.error("Failed to start server", err);
    process.exit(1);
}