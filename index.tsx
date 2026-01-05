
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, WagmiProvider, createConfig } from 'wagmi'
import { mainnet, linea, lineaSepolia } from 'wagmi/chains'
import { metaMask } from 'wagmi/connectors'
import React, { useEffect, useState } from "react";
import { MetaMaskSDK } from "@metamask/sdk";

const MetaMaskConnect = () => {
  const [account, setAccount] = useState(null);

  useEffect(() => {
    const connectMetaMask = async () => {
      const MMSDK = new MetaMaskSDK({
        dappMetadata: {
          name: "Simple Dapp",
          url: window.location.href,
        },
        infuraAPIKey: "0c91c54ca09942718c417979dcb18a88",
      });

      const ethereum = MMSDK.getProvider();

      try {
        const accounts = await MMSDK.connect();
        setAccount(accounts[0]);
      } catch (err) {
        console.error("MetaMask connection failed", err);
      }
    };

    connectMetaMask();
  }, []);

  return (
    <div>
      <h2>MetaMask Connect</h2>
      {account ? <p>Connected: {account}</p> : <p>Connecting...</p>}
    </div>
  );
};

export default MetaMaskConnect;
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
