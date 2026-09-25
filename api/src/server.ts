import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import { config } from "./config.js";
import { logger } from "./lib/logger.js";
import { healthRoutes } from "./routes/health.js";
import { publicRoutes } from "./routes/public.js";
import { startIndexer } from "./chain/indexer.js";

const app = Fastify({ logger: false, trustProxy: true });

await app.register(helmet);
await app.register(cors, { origin: config.CORS_ORIGIN, credentials: true });

await app.register(healthRoutes);
await app.register(publicRoutes, { prefix: "/api" });

startIndexer().catch((err) => logger.error("Indexer crashed", err));

try {
    await app.listen({ port: config.PORT, host: "0.0.0.0" });
    logger.info(`HOMR API listening on :${config.PORT}`);
} catch (err) {
    logger.error("Failed to start server", err);
    process.exit(1);
}