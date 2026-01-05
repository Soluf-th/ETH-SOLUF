
export interface BlockData {
  number: number;
  hash: string;
  timestamp: string;
  transactions: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  isStreaming?: boolean;
}

export interface RPCResponse<T> {
  jsonrpc: string;
  id: string | number;
  result: T;
  error?: {
    code: number;
    message: string;
  };
}

export interface NewHead {
  number: string;
  hash: string;
  parentHash: string;
  sha3Uncles: string;
  logsBloom: string;
  transactionsRoot: string;
  stateRoot: string;
  receiptsRoot: string;
  miner: string;
  difficulty: string;
  totalDifficulty: string;
  extraData: string;
  size: string;
  gasLimit: string;
  gasUsed: string;
  timestamp: string;
}

export interface InfuraGasEstimate {
  suggestedMaxPriorityFeePerGas: string;
  suggestedMaxFeePerGas: string;
  minWaitTimeEstimate: number;
  maxWaitTimeEstimate: number;
}

export interface InfuraGasResponse {
  low: InfuraGasEstimate;
  medium: InfuraGasEstimate;
  high: InfuraGasEstimate;
  estimatedBaseFee: string;
  networkCongestion: number;
  priorityFeeTrend: 'up' | 'down' | 'stable';
  baseFeeTrend: 'up' | 'down' | 'stable';
}

export enum NetworkStatus {
  SYNCED = 'SYNCED',
  LOADING = 'LOADING',
  ERROR = 'ERROR',
  LIVE = 'LIVE'
}
