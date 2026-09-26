import type { FastifyInstance } from "fastify";
import { apiKeyAuth } from "../middleware/apiKeyAuth.js";
import { reviewApplication } from "../modules/applications/service.js";
import { startAuction, finalizeAuction } from "../modules/auctions/service.js";
import { publicClient, abis, walletClient } from "../chain/contracts.js";
import { config } from "../config.js";

export async function adminRoutes(app: FastifyInstance) {
    // Semua route admin butuh API key
    app.addHook("onRequest", apiKeyAuth);

    // Cek status admin (roles, balance)
    app.get("/status", async () => {
        const admin = walletClient.account!.address;
        const balance = await publicClient.getBalance({ address: admin });
        return {
            adminAddress: admin,
            balanceWei: balance.toString(),
            balanceBnb: (Number(balance) / 1e18).toFixed(6),
            chainId: config.CHAIN_ID,
            contracts: {
                vault: config.addresses.vault,
                auction: config.addresses.auction,
                loanManager: config.addresses.loanManager,
            },
        };
    });

    // Review application — APPROVE / REJECT
    app.post("/applications/:id/review", async (req, reply) => {
        const { id } = req.params as { id: string };
        const body = req.body as {
            decision: "APPROVED" | "REJECTED";
            maxPrincipal?: string;
            reviewedBy?: string;
            reviewNote?: string;
        };

        if (!body?.decision || !["APPROVED", "REJECTED"].includes(body.decision)) {
            return reply.code(400).send({ error: "decision must be APPROVED or REJECTED" });
        }

        try {
            const result = await reviewApplication(id, {
                decision: body.decision,
                maxPrincipal: body.maxPrincipal,
                reviewedBy: body.reviewedBy ?? "credit_manager",
                reviewNote: body.reviewNote,
            });
            return result;
        } catch (err) {
            const msg = (err as Error).message;
            if (msg === "APPLICATION_NOT_FOUND") return reply.code(404).send({ error: msg });
            if (msg === "APPLICATION_ALREADY_REVIEWED") return reply.code(409).send({ error: msg });
            if (msg === "MAX_PRINCIPAL_REQUIRED") return reply.code(400).send({ error: msg });
            app.log.error(err);
            return reply.code(500).send({ error: "review_failed", message: msg });
        }
    });

    // Start auction
    app.post("/auctions", async (req, reply) => {
        const body = req.body as { commitDuration?: number; revealDuration?: number };
        if (!body?.commitDuration || !body?.revealDuration) {
            return reply.code(400).send({ error: "commitDuration and revealDuration required (seconds)" });
        }
        try {
            const auction = await startAuction({
                commitDuration: body.commitDuration,
                revealDuration: body.revealDuration,
            });
            return reply.code(201).send(auction);
        } catch (err) {
            app.log.error(err);
            return reply.code(500).send({ error: "start_auction_failed", message: (err as Error).message });
        }
    });

    // Finalize auction
    app.post("/auctions/:id/finalize", async (req, reply) => {
        const { id } = req.params as { id: string };
        try {
            const auction = await finalizeAuction(id);
            return auction;
        } catch (err) {
            const msg = (err as Error).message;
            if (msg === "AUCTION_NOT_FOUND") return reply.code(404).send({ error: msg });
            app.log.error(err);
            return reply.code(500).send({ error: "finalize_failed", message: msg });
        }
    });
}