
import { RPCResponse, NewHead, InfuraGasResponse } from '../types';

const DEFAULT_RPC = "https://cloudflare-eth.com";
const GETBLOCK_URL = "https://go.getblock.io/37487c42b46749a7be6a39d047193e42/";
const GETBLOCK_WSS = "wss://go.getblock.asia/37487c42b46749a7be6a39d047193e42";
const INFURA_GAS_BASE = "https://gas.api.infura.io/v3/0c91c54ca09942718c417979dcb18a88";

export const fetchLatestBlockNumber = async (): Promise<number> => {
  try {
    const response = await fetch(GETBLOCK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_blockNumber",
        params: [],
        id: "getblock.io"
      })
    });
    
    if (!response.ok) return await fetchFallbackBlockNumber();

    const data: RPCResponse<string> = await response.json();
    return parseInt(data.result, 16);
  } catch (error) {
    console.error("RPC Error:", error);
    return await fetchFallbackBlockNumber();
  }
};

const fetchFallbackBlockNumber = async (): Promise<number> => {
    try {
        const response = await fetch(DEFAULT_RPC, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: "2.0",
                method: "eth_blockNumber",
                params: [],
                id: 1
            })
        });
        const data: RPCResponse<string> = await response.json();
        return parseInt(data.result, 16);
    } catch {
        return 0;
    }
};

export const fetchGasPrice = async (): Promise<string> => {
    try {
        const response = await fetch(DEFAULT_RPC, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: "2.0",
                method: "eth_gasPrice",
                params: [],
                id: 1
            })
        });
        const data: RPCResponse<string> = await response.json();
        const wei = parseInt(data.result, 16);
        return (wei / 1e9).toFixed(2);
    } catch {
        return "0";
    }
};

export const fetchInfuraGasData = async (): Promise<InfuraGasResponse | null> => {
    try {
        const response = await fetch(`${INFURA_GAS_BASE}/networks/1/suggestedGasFees`);
        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        console.error("Infura Gas API Error:", error);
        return null;
    }
};

export const subscribeToBlocks = (onBlock: (blockNumber: number) => void): () => void => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: number;

    const connect = () => {
        ws = new WebSocket(GETBLOCK_WSS);

        ws.onopen = () => {
            console.log("Connected to GetBlock WSS");
            ws?.send(JSON.stringify({
                jsonrpc: "2.0",
                id: 1,
                method: "eth_subscribe",
                params: ["newHeads"]
            }));
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.method === "eth_subscription" && data.params?.result?.number) {
                const blockNum = parseInt(data.params.result.number, 16);
                onBlock(blockNum);
            }
        };

        ws.onclose = () => {
            console.log("WSS Closed, reconnecting...");
            reconnectTimeout = window.setTimeout(connect, 5000);
        };

        ws.onerror = (err) => {
            console.error("WSS Error:", err);
            ws?.close();
        };
    };

    connect();

    return () => {
        if (ws) {
            ws.onclose = null;
            ws.close();
        }
        clearTimeout(reconnectTimeout);
    };
};
