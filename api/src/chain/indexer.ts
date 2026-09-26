import { config } from "../config.js";
import { publicClient } from "./contracts.js";
import { prisma } from "../db/client.js";
import { logger } from "../lib/logger.js";

const POLL_INTERVAL_MS = 15_000;

async function getCursor(): Promise<bigint> {
    const cursor = await prisma.indexerCursor.findUnique({ where: { id: "singleton" } });
    if (cursor) return cursor.lastBlock;
    return config.DEPLOY_BLOCK;
}

async function setCursor(block: bigint) {
    await prisma.indexerCursor.upsert({
        where: { id: "singleton" },
        create: { id: "singleton", lastBlock: block },
        update: { lastBlock: block },
    });
}

async function processBlockRange(fromBlock: bigint, toBlock: bigint): Promise<{ skipped: boolean; newCursor: bigint }> {
    try {
        const logs = await publicClient.getLogs({
            address: [
                config.addresses.vault,
                config.addresses.loanManager,
                config.addresses.auction,
            ],
            fromBlock,
            toBlock,
        });

        for (const log of logs) {
            const existing = await prisma.chainEvent.findUnique({
                where: { txHash_logIndex: { txHash: log.transactionHash!, logIndex: log.logIndex! } },
            });
            if (existing) continue;

            await prisma.chainEvent.create({
                data: {
                    txHash: log.transactionHash!,
                    blockNumber: log.blockNumber!,
                    logIndex: log.logIndex!,
                    eventName: log.topics[0] ?? "unknown",
                    payload: {
                        address: log.address,
                        topics: log.topics,
                        data: log.data,
                    },
                },
            });
        }

        return { skipped: false, newCursor: toBlock };
    } catch (err) {
        // Deteksi "history pruned" — RPC tidak bisa baca block lama.
        // Skip ke block terkini tanpa error berulang.
        const errorCode = (err as { code?: number }).code;
        if (errorCode === -32701) {
            logger.warn("RPC pruned history for this range — skipping forward");
            // Ambil block terkini dan skip ke situ
            const currentBlock = await publicClient.getBlockNumber();
            return { skipped: true, newCursor: currentBlock };
        }
        throw err;
    }
}

export async function startIndexer() {
    logger.info("Indexer starting...");

    // Delay awal supaya Neon (yang scale-to-zero) sempat bangun
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const tick = async () => {
        try {
            const currentBlock = await publicClient.getBlockNumber();
            const fromBlock = (await getCursor()) + 1n;
            if (fromBlock > currentBlock) return;

            // Batch kecil (500 block) supaya tidak kena limit RPC
            const toBlock = fromBlock + 500n > currentBlock ? currentBlock : fromBlock + 500n;

            const result = await processBlockRange(fromBlock, toBlock);
            await setCursor(result.newCursor);

            if (!result.skipped) {
                logger.info(`Indexed blocks ${fromBlock}..${toBlock}`);
            }
        } catch (err) {
            // Log error ringkas, tidak dump stacktrace panjang
            const msg = (err as Error).message || "unknown";
            logger.error(`Indexer tick failed: ${msg.slice(0, 120)}`);
        }
    };

    // Tunggu satu siklus, lalu jalankan interval
    await tick();
    setInterval(tick, POLL_INTERVAL_MS);
}