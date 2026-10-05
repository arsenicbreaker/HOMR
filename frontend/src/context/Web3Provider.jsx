import React from 'react';
import { createConfig, http, WagmiProvider } from 'wagmi';
import { bscTestnet, localhost } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CHAIN_CONFIG } from '../contracts/addresses';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

const chain = CHAIN_CONFIG.chainId === 31337 ? { ...localhost, id: 31337 } : bscTestnet;
if (![97, 31337].includes(CHAIN_CONFIG.chainId)) throw new Error('Supported chains: BNB Testnet (97) and local development (31337).');

const config = createConfig({
  chains: [chain],
  connectors: [injected()],
  transports: {
    [chain.id]: http(CHAIN_CONFIG.rpcUrl, { timeout: 15000, retryCount: 1 })
  }
});

export function Web3Provider({ children }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default Web3Provider;
