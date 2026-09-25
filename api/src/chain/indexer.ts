import { config } from "../config.js";
import { publicClient } from "./contracts.js";
import { prisma } from "../db/client.js";
import { logger } from "../lib/logger.js";

const POLL_INTERVAL_MS = 5_000;

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

async function processBlockRange(fromBlock: bigint, toBlock: bigint) {
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
}

export async function startIndexer() {
    logger.info("Indexer starting...");

    const tick = async () => {
        try {
            const currentBlock = await publicClient.getBlockNumber();
            const fromBlock = (await getCursor()) + 1n;
            if (fromBlock > currentBlock) return;

            const toBlock = fromBlock + 2_000n > currentBlock ? currentBlock : fromBlock + 2_000n;
            await processBlockRange(fromBlock, toBlock);
            await setCursor(toBlock);
            logger.info(`Indexed blocks ${fromBlock}..${toBlock}`);
        } catch (err) {
            logger.error("Indexer tick failed", err);
        }
    };

    await tick();
    setInterval(tick, POLL_INTERVAL_MS);
}