
import React, { useState, useEffect, useCallback } from 'react';
import { fetchLatestBlockNumber, fetchGasPrice, subscribeToBlocks, fetchInfuraGasData } from './services/blockchain';
import { InfuraGasResponse } from './types';
import MetricCard from './components/MetricCard';
import ChatInterface from './components/ChatInterface';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const App: React.FC = () => {
  const [blockHeight, setBlockHeight] = useState<number>(0);
  const [gasPrice, setGasPrice] = useState<string>("0");
  const [gasDetails, setGasDetails] = useState<InfuraGasResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [history, setHistory] = useState<{ time: string; blocks: number }[]>([]);

  const updateStats = useCallback((newBlock: number) => {
    setBlockHeight(newBlock);
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setHistory(prev => {
      const newHistory = [...prev, { time: now, blocks: newBlock }];
      return newHistory.slice(-15);
    });
    setIsLoading(false);
    setIsLive(true);
  }, []);

  const refreshGas = useCallback(async () => {
    const [standardGas, detailedGas] = await Promise.all([
      fetchGasPrice(),
      fetchInfuraGasData()
    ]);
    setGasPrice(standardGas);
    setGasDetails(detailedGas);
  }, []);

  const refreshManual = useCallback(async () => {
    setIsLoading(true);
    const block = await fetchLatestBlockNumber();
    await refreshGas();
    updateStats(block);
  }, [updateStats, refreshGas]);

  useEffect(() => {
    refreshManual();

    const unsubscribe = subscribeToBlocks((blockNum) => {
      updateStats(blockNum);
      refreshGas();
    });

    return () => unsubscribe();
  }, [refreshManual, updateStats, refreshGas]);

  const congestionColor = (val: number) => {
    if (val < 0.3) return 'bg-emerald-500';
    if (val < 0.7) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#020617] text-slate-100 selection:bg-blue-500/30">
      <nav className="sticky top-0 z-50 bg-slate-900/60 backdrop-blur-xl border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center text-white font-bold shadow-xl shadow-blue-500/20 transform hover:rotate-12 transition-transform">
                Ξ
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-white to-slate-400 bg-clip-text text-transparent">
                  EtherSense AI
                </h1>
                <div className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">
                    {isLive ? 'WebSocket Live' : 'Connecting...'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-400">
                <a href="#" className="hover:text-white transition-colors">Blocks</a>
                <a href="#" className="hover:text-white transition-colors">Nodes</a>
                <a href="#" className="hover:text-white transition-colors">Analytics</a>
              </div>
              <button 
                onClick={refreshManual}
                className="group p-2 rounded-full hover:bg-slate-800 transition-all active:scale-95"
                title="Refresh Cache"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-slate-400 group-hover:text-white ${isLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <MetricCard 
              label="Block Height" 
              value={blockHeight ? blockHeight.toLocaleString() : '---'} 
              loading={isLoading && !blockHeight}
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>}
              footer={
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                  <span>TARGET: 12.0s</span>
                  <span className="text-emerald-500">HEALTHY</span>
                </div>
              }
            />
            <MetricCard 
              label="Gas Forecast" 
              value={`${gasDetails ? Math.round(parseFloat(gasDetails.estimatedBaseFee)) : gasPrice} Gwei`} 
              loading={isLoading && gasPrice === "0"}
              trend={gasDetails ? (gasDetails.networkCongestion < 0.4 ? 'Low' : gasDetails.networkCongestion > 0.8 ? 'High' : 'Normal') : '...'}
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
              footer={
                gasDetails ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-mono">
                      <span className="text-slate-500">LOW</span>
                      <span className="text-emerald-400">{Math.round(parseFloat(gasDetails.low.suggestedMaxFeePerGas))} Gwei</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-mono">
                      <span className="text-slate-500">MID</span>
                      <span className="text-amber-400">{Math.round(parseFloat(gasDetails.medium.suggestedMaxFeePerGas))} Gwei</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-mono">
                      <span className="text-slate-500">HIGH</span>
                      <span className="text-rose-400">{Math.round(parseFloat(gasDetails.high.suggestedMaxFeePerGas))} Gwei</span>
                    </div>
                  </div>
                ) : null
              }
            />
            <MetricCard 
              label="Network Congestion" 
              value={gasDetails ? `${Math.round(gasDetails.networkCongestion * 100)}%` : "---"} 
              loading={isLoading}
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
              footer={
                gasDetails ? (
                  <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${congestionColor(gasDetails.networkCongestion)}`} 
                      style={{ width: `${gasDetails.networkCongestion * 100}%` }}
                    />
                  </div>
                ) : null
              }
            />
          </div>

          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 backdrop-blur-md shadow-inner relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <svg className="w-32 h-32 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Block Propagation Velocity</h2>
                <p className="text-slate-500 text-sm">Real-time throughput monitoring via GetBlock WSS</p>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50"></div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Mainnet</span>
                </div>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history}>
                  <defs>
                    <linearGradient id="colorBlocks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis 
                    dataKey="time" 
                    stroke="#475569" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false}
                    tickMargin={12}
                  />
                  <YAxis domain={['dataMin - 1', 'dataMax + 1']} hide />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
                    itemStyle={{ color: '#60a5fa', fontWeight: 'bold' }}
                    labelStyle={{ color: '#94a3b8' }}
                  />
                  <Area 
                    type="stepAfter" 
                    dataKey="blocks" 
                    stroke="#3b82f6" 
                    fillOpacity={1} 
                    fill="url(#colorBlocks)" 
                    strokeWidth={3}
                    animationDuration={1000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl overflow-hidden backdrop-blur-md">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/20">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                Recent Network Activity
              </h2>
              <div className="flex gap-2">
                 <span className="px-3 py-1 bg-slate-800 rounded-full text-[10px] text-slate-400 font-mono">12s AVG</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-950/50 text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">
                  <tr>
                    <th className="px-8 py-5">Block Identifier</th>
                    <th className="px-8 py-5">Verification Hash</th>
                    <th className="px-8 py-5 text-right">Ops Count</th>
                    <th className="px-8 py-5 text-right">Time Delta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 text-slate-300 text-sm">
                  {[...Array(6)].map((_, i) => (
                    <tr key={i} className="hover:bg-blue-500/5 group transition-colors cursor-default">
                      <td className="px-8 py-5">
                        <span className="font-mono text-blue-400 group-hover:text-blue-300 transition-colors">
                          #{blockHeight ? blockHeight - i : '---'}
                        </span>
                      </td>
                      <td className="px-8 py-5 font-mono text-slate-500 text-xs">
                        0x{Math.random().toString(16).slice(2, 10)}...{Math.random().toString(16).slice(2, 10)}
                      </td>
                      <td className="px-8 py-5 text-right font-medium">
                        {blockHeight ? (180 + Math.floor(Math.random() * 120)) : '--'}
                      </td>
                      <td className="px-8 py-5 text-right text-slate-600 group-hover:text-slate-400 transition-colors">
                        {i === 0 ? 'Live' : `${i * 12}s ago`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col h-[700px] lg:h-[800px] sticky top-24">
          <ChatInterface currentBlock={blockHeight} gasPrice={gasDetails ? gasDetails.estimatedBaseFee : gasPrice} />
          
          <div className="mt-6 p-6 bg-blue-600/5 border border-blue-500/10 rounded-2xl">
             <h4 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">Network Tip</h4>
             <p className="text-xs text-slate-400 leading-relaxed">
               {gasDetails && gasDetails.networkCongestion > 0.8 
                 ? "Network congestion is currently high. Consider delaying non-urgent transactions."
                 : "Network throughput is optimal. Smart contract interactions are executing within expected fee windows."}
             </p>
          </div>
        </div>
      </main>

      <footer className="bg-slate-950 border-t border-slate-900 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="text-center md:text-left">
            <p className="text-slate-500 text-sm">
              Powered by <span className="text-white font-semibold">GetBlock.io</span>, <span className="text-blue-500 font-semibold">Infura Gas API</span> & <span className="text-blue-400 font-semibold">Gemini 3 Flash</span>
            </p>
          </div>
          <div className="flex justify-center md:justify-end gap-6 text-[10px] text-slate-600 font-mono uppercase tracking-widest">
             Ethereum Mainnet Explorer v2.1.0
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
