import { prisma } from "../../db/client.js";
import { startAuction as startAuctionOnchain, finalizeAuction as finalizeAuctionOnchain } from "../../chain/signer.js";

export interface StartAuctionInput {
    commitDuration: number;   // detik
    revealDuration: number;   // detik
}

export async function startAuction(input: StartAuctionInput) {
    const now = new Date();
    const commitDeadline = new Date(now.getTime() + input.commitDuration * 1000);
    const revealDeadline = new Date(commitDeadline.getTime() + input.revealDuration * 1000);

    // Panggil kontrak dulu
    const tx = await startAuctionOnchain(
        BigInt(input.commitDuration),
        BigInt(input.revealDuration)
    );

    // Simpan ke DB
    const latest = await prisma.auction.findFirst({ orderBy: { onchainAuctionId: "desc" } });
    const nextId = latest ? latest.onchainAuctionId + 1n : 0n;

    return prisma.auction.create({
        data: {
            onchainAuctionId: nextId,
            commitDeadline,
            revealDeadline,
            status: "OPEN",
            createTxHash: tx.txHash,
        },
    });
}

export async function listAuctions() {
    return prisma.auction.findMany({
        orderBy: { createdAt: "desc" },
        include: { bids: true },
    });
}

export async function finalizeAuction(auctionId: string) {
    const auction = await prisma.auction.findUnique({ where: { id: auctionId } });
    if (!auction) throw new Error("AUCTION_NOT_FOUND");

    const tx = await finalizeAuctionOnchain();

    return prisma.auction.update({
        where: { id: auctionId },
        data: {
            status: "FINALIZED",
            finalizeTxHash: tx.txHash,
        },
    });
}