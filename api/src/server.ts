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

// === BigInt JSON patch ===
// Prisma mengembalikan BigInt untuk kolom decimal/bigint.
// JSON.stringify tidak tahu cara serialize BigInt → kita beri method toJSON.
(BigInt.prototype as unknown as { toJSON: () => string }).toJSON = function () {
    return this.toString();
};

const app = Fastify({ logger: false, trustProxy: true });

await app.register(helmet);

// CORS: split string jadi array supaya fastify-cors kirim header benar
const allowedOrigins = config.CORS_ORIGIN.split(",")
    .map((s) => s.trim())
    .filter(Boolean);
await app.register(cors, { origin: allowedOrigins, credentials: true });

await app.register(healthRoutes);
await app.register(publicRoutes, { prefix: "/api" });
await app.register(applicationRoutes, { prefix: "/api" });
await app.register(auctionRoutes, { prefix: "/api" });
await app.register(adminRoutes, { prefix: "/api/admin" });

startIndexer().catch((err) => logger.error("Indexer crashed", err));

try {
    await app.listen({ port: config.PORT, host: "0.0.0.0" });
    logger.info(`HOMR API listening on :${config.PORT}`);
} catch (err) {
    logger.error("Failed to start server", err);
    process.exit(1);
}