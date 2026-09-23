import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { parseUnits, keccak256, encodePacked } from 'viem';
import { useDemoMode } from '../context/DemoModeContext';
import { CONTRACT_ADDRESSES } from '../contracts/addresses';
import CreditAuctionABI from '../contracts/abi/CreditAuction';

export function useAuction() {
  const {
    isDemoMode,
    seededData,
    commitDemoBid,
    revealDemoBid,
    approveDemoBorrower,
    finalizeDemoAuction
  } = useDemoMode();

  const { address, isConnected } = useAccount();

  // Onchain state reads
  const { data: auctionState } = useReadContract({
    address: CONTRACT_ADDRESSES.CreditAuction,
    abi: CreditAuctionABI,
    functionName: 'state',
    query: { enabled: !isDemoMode && isConnected }
  });

  const { data: commitDeadline } = useReadContract({
    address: CONTRACT_ADDRESSES.CreditAuction,
    abi: CreditAuctionABI,
    functionName: 'commitDeadline',
    query: { enabled: !isDemoMode && isConnected }
  });

  const { data: revealDeadline } = useReadContract({
    address: CONTRACT_ADDRESSES.CreditAuction,
    abi: CreditAuctionABI,
    functionName: 'revealDeadline',
    query: { enabled: !isDemoMode && isConnected }
  });

  const { data: userApproval } = useReadContract({
    address: CONTRACT_ADDRESSES.CreditAuction,
    abi: CreditAuctionABI,
    functionName: 'approvals',
    args: address ? [address] : undefined,
    query: { enabled: !isDemoMode && isConnected && !!address }
  });

  const { writeContractAsync } = useWriteContract();

  // Commit bid logic using exact Solidity keccak256(abi.encodePacked(amount, rate, term, msg.sender, salt))
  const commitBid = async ({ amount, rate, term, salt }) => {
    if (isDemoMode) {
      commitDemoBid({ amount, rate, term, salt });
      return { hash: '0xdemo_commit...' };
    }

    const parsedAmount = parseUnits(amount.toString(), 6);
    const parsedRate = BigInt(rate);
    const parsedTerm = BigInt(term);

    // Matching Solidity: keccak256(abi.encodePacked(amount, rate, term, msg.sender, salt))
    const commitmentHash = keccak256(
      encodePacked(
        ['uint256', 'uint256', 'uint256', 'address', 'string'],
        [parsedAmount, parsedRate, parsedTerm, address, salt]
      )
    );

    const tx = await writeContractAsync({
      address: CONTRACT_ADDRESSES.CreditAuction,
      abi: CreditAuctionABI,
      functionName: 'commitBid',
      args: [commitmentHash]
    });

    return tx;
  };

  const revealBid = async ({ amount, rate, term, salt }) => {
    if (isDemoMode) {
      revealDemoBid({ amount, rate, term, salt });
      return { hash: '0xdemo_reveal...' };
    }

    const parsedAmount = parseUnits(amount.toString(), 6);
    const parsedRate = BigInt(rate);
    const parsedTerm = BigInt(term);

    const tx = await writeContractAsync({
      address: CONTRACT_ADDRESSES.CreditAuction,
      abi: CreditAuctionABI,
      functionName: 'revealBid',
      args: [parsedAmount, parsedRate, parsedTerm, salt]
    });

    return tx;
  };

  const approveBorrower = async (borrowerAddr, maxPrincipalUsdc, propertyHash) => {
    if (isDemoMode) {
      approveDemoBorrower(borrowerAddr, maxPrincipalUsdc, propertyHash);
      return { hash: '0xdemo_approve...' };
    }

    const parsedAmount = parseUnits(maxPrincipalUsdc.toString(), 6);
    const tx = await writeContractAsync({
      address: CONTRACT_ADDRESSES.CreditAuction,
      abi: CreditAuctionABI,
      functionName: 'approveBorrower',
      args: [borrowerAddr, parsedAmount, propertyHash]
    });

    return tx;
  };

  const startAuction = async (commitDurationSec = 3600, revealDurationSec = 3600) => {
    if (isDemoMode) {
      return { hash: '0xdemo_start_auction...' };
    }

    const tx = await writeContractAsync({
      address: CONTRACT_ADDRESSES.CreditAuction,
      abi: CreditAuctionABI,
      functionName: 'startAuction',
      args: [BigInt(commitDurationSec), BigInt(revealDurationSec)]
    });

    return tx;
  };

  const finalizeAuction = async () => {
    if (isDemoMode) {
      finalizeDemoAuction();
      return { hash: '0xdemo_finalize...' };
    }

    const tx = await writeContractAsync({
      address: CONTRACT_ADDRESSES.CreditAuction,
      abi: CreditAuctionABI,
      functionName: 'finalizeAuction'
    });

    return tx;
  };

  if (isDemoMode) {
    return {
      isDemoMode: true,
      state: seededData.auction.state, // 'CommitPhase' | 'RevealPhase' | 'Finalized'
      commitDeadline: seededData.auction.commitDeadline,
      revealDeadline: seededData.auction.revealDeadline,
      userApproval: seededData.borrower,
      bids: seededData.auction.bids,
      commitBid,
      revealBid,
      approveBorrower,
      startAuction,
      finalizeAuction
    };
  }

  const stateNames = ['Created', 'CommitPhase', 'RevealPhase', 'Finalized'];
  const currentStateName = auctionState !== undefined ? stateNames[Number(auctionState)] : 'Created';

  return {
    isDemoMode: false,
    state: currentStateName,
    commitDeadline: commitDeadline ? Number(commitDeadline) * 1000 : null,
    revealDeadline: revealDeadline ? Number(revealDeadline) * 1000 : null,
    userApproval: userApproval ? {
      isApproved: userApproval[0],
      maxPrincipal: (Number(userApproval[1]) / 1e6).toString(),
      propertyHash: userApproval[2]
    } : null,
    bids: [],
    commitBid,
    revealBid,
    approveBorrower,
    startAuction,
    finalizeAuction
  };
}
