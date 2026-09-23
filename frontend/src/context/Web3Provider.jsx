import React from 'react';
import { createConfig, http, WagmiProvider } from 'wagmi';
import { bscTestnet } from 'wagmi/chains';
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

const config = createConfig({
  chains: [bscTestnet],
  transports: {
    [bscTestnet.id]: http(CHAIN_CONFIG.rpcUrl)
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
