import { config } from "../config.js";
import { publicClient, walletClient, abis } from "./contracts.js";

export async function approveBorrower(
    borrower: `0x${string}`,
    maxPrincipal: bigint,
    propertyHash: string
) {
    const hash = await walletClient.writeContract({
        address: config.addresses.auction,
        abi: abis.auction,
        functionName: "approveBorrower",
        args: [borrower, maxPrincipal, propertyHash],
        chain: null,
        account: walletClient.account!,
    });
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    if (receipt.status !== 'success') throw new Error('APPROVAL_REVERTED');
    return { txHash: hash, blockNumber: receipt.blockNumber };
}

export async function startAuction(commitDuration: bigint, revealDuration: bigint) {
    const hash = await walletClient.writeContract({
        address: config.addresses.auction,
        abi: abis.auction,
        functionName: "startAuction",
        args: [commitDuration, revealDuration],
        chain: null,
        account: walletClient.account!,
    });
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    if (receipt.status !== 'success') throw new Error('AUCTION_START_REVERTED');
    return { txHash: hash, blockNumber: receipt.blockNumber };
}

export async function finalizeAuction() {
    const hash = await walletClient.writeContract({
        address: config.addresses.auction,
        abi: abis.auction,
        functionName: "finalizeAuction",
        chain: null,
        account: walletClient.account!,
    });
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    if (receipt.status !== 'success') throw new Error('AUCTION_FINALIZE_REVERTED');
    return { txHash: hash, blockNumber: receipt.blockNumber };
}
