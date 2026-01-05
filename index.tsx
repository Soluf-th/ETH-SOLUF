
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, WagmiProvider, createConfig } from 'wagmi'
import { mainnet, linea, lineaSepolia } from 'wagmi/chains'
import { metaMask } from 'wagmi/connectors'

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
const config = createConfig({
  ssr: true, // Enable this if your dapp uses server-side rendering.
  chains: [mainnet, linea, lineaSepolia],
  connectors: [
    metaMask({
      infuraAPIKey: process.env.NEXT_PUBLIC_INFURA_API_KEY!,
    }),
  ],
  transports: {
    [mainnet.id]: http(),
    [linea.id]: http(),
    [lineaSepolia.id]: http(),
  },
});
