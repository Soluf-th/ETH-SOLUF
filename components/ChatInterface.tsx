
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { getGeminiStream } from '../services/gemini';

interface ChatInterfaceProps {
  currentBlock: number;
  gasPrice: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ currentBlock, gasPrice }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: "Hello! I'm EtherSense AI. I'm connected to the Ethereum mainnet via WebSockets. I can help you analyze the latest blocks and gas prices in real-time. What would you like to know?", timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg: ChatMessage = { role: 'user', text: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const context = `Latest block: ${currentBlock}, Current Gas: ${gasPrice} Gwei.`;
      
      // Initialize model message for streaming
      const modelMsgId = Date.now();
      setMessages(prev => [...prev, { 
        role: 'model', 
        text: '', 
        timestamp: modelMsgId, 
        isStreaming: true 
      }]);

      let fullText = '';
      const stream = getGeminiStream(input, context);
      
      for await (const chunk of stream) {
        fullText += chunk;
        setMessages(prev => prev.map(msg => 
          msg.timestamp === modelMsgId ? { ...msg, text: fullText } : msg
        ));
      }

      setMessages(prev => prev.map(msg => 
        msg.timestamp === modelMsgId ? { ...msg, isStreaming: false } : msg
      ));

    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, I encountered an error processing your request.", timestamp: Date.now() }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/50 rounded-2xl border border-slate-700 overflow-hidden backdrop-blur-md shadow-2xl">
      <div className="p-4 border-b border-slate-700 bg-slate-800/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <h2 className="font-semibold text-slate-200 text-sm">EtherSense AI</h2>
        </div>
        <span className="text-[10px] text-slate-500 font-mono uppercase tracking-tighter">Gemini 3 Flash</span>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[90%] p-3 rounded-2xl ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none shadow-lg shadow-blue-500/10' 
                : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700 shadow-md'
            }`}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {msg.text}
                {msg.isStreaming && <span className="inline-block w-1.5 h-4 ml-1 bg-blue-400 animate-pulse align-middle"></span>}
              </p>
              <div className="flex justify-between items-center mt-2">
                <span className="text-[9px] opacity-40">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                {!msg.isStreaming && msg.role === 'model' && (
                  <div className="flex gap-1">
                    <div className="w-1 h-1 rounded-full bg-slate-600"></div>
                    <div className="w-1 h-1 rounded-full bg-slate-600"></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} className="p-4 bg-slate-800/80 border-t border-slate-700">
        <div className="relative group">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about on-chain data..."
            className="w-full bg-slate-950 text-white text-sm rounded-xl py-3 pl-4 pr-12 border border-slate-700 focus:outline-none focus:border-blue-500 transition-all focus:ring-1 focus:ring-blue-500/20"
          />
          <button 
            type="submit"
            disabled={isTyping || !input.trim()}
            className="absolute right-2 top-1.5 p-2 text-blue-400 hover:text-blue-300 disabled:opacity-30 disabled:hover:text-blue-400 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;
