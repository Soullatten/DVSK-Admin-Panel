import React from 'react';
import { Sparkles, Plus, ArrowUp, X } from 'lucide-react';

export type Message = { role: 'user' | 'assistant'; content: string; };

export type ChatProps = {
  messages: Message[];
  input: string;
  setInput: (val: string) => void;
  loading: boolean;
  sendMessage: () => void;
  isFloating?: boolean;
  onClose?: () => void;
};

export default function AIChat({ messages, input, setInput, loading, sendMessage, isFloating, onClose }: ChatProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { e.preventDefault(); sendMessage(); }
  };

  return (
    <div className={`w-full bg-white overflow-hidden ${isFloating
        ? 'h-[550px] flex flex-col rounded-2xl shadow-2xl border border-[#e3e3e3]'
        : 'rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-[#e3e3e3]'
      }`}>

      {/* Floating Header */}
      {isFloating && (
        <div className="bg-[#1a1a1a] text-white px-4 py-3.5 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#a855f7]" />
            <span className="font-medium text-[14px]">DVSK Assistant</span>
          </div>
          <button onClick={onClose} className="text-[#a8a8a8] hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Message History */}
      {(messages.length > 0 || isFloating) && (
        <div className={`${isFloating ? 'flex-1 bg-[#fafafa]' : 'max-h-[400px] bg-white'} overflow-y-auto p-5 space-y-5 border-b border-[#efefef]`}>
          {messages.length === 0 && isFloating && (
            <p className="text-center text-[#8a8a8a] text-[13px] mt-10">Ask me to write product descriptions, analyze orders, or suggest marketing ideas.</p>
          )}

          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] px-4 py-3 text-[14px] leading-relaxed shadow-sm ${msg.role === 'user'
                    ? 'bg-[#1a1a1a] text-white rounded-[20px] rounded-tr-sm'
                    : 'bg-[#f4f4f4] text-[#1a1a1a] rounded-[20px] rounded-tl-sm'
                  }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-[#f4f4f4] text-[#8a8a8a] text-[14px] px-5 py-3 rounded-[20px] rounded-tl-sm shadow-sm flex gap-1">
                <span className="animate-bounce">●</span>
                <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>●</span>
                <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>●</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Input Area */}
      <div className="px-1 pt-1 pb-2 bg-white shrink-0">
        <div className="flex items-center px-3 py-2">
          <input
            type="text"
            placeholder="Ask anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-[14px] text-[#1a1a1a] placeholder-[#8a8a8a] outline-none h-[28px]"
          />
          <div className="flex items-center gap-2 ml-3">
            <button className="w-[28px] h-[28px] flex items-center justify-center text-[#6b6b6b] hover:bg-[#f3f3f3] rounded-full transition-colors">
              <Plus className="w-[14px] h-[14px]" strokeWidth={2.5} />
            </button>
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className={`w-[28px] h-[28px] flex items-center justify-center rounded-full transition-colors ${input.trim() ? 'text-[#1a1a1a] hover:bg-[#f3f3f3] cursor-pointer' : 'text-[#c4c4c4] cursor-not-allowed'
                }`}
            >
              <div className="w-[20px] h-[20px] rounded-full border-[1.5px] border-current flex items-center justify-center">
                <ArrowUp className="w-[10px] h-[10px]" strokeWidth={3} />
              </div>
            </button>
          </div>
        </div>
        <div className="px-3 pt-2 border-t border-[#f1f1f1] flex items-center gap-1.5">
          <Sparkles className="w-[13px] h-[13px] text-[#8b5cf6]" />
          <span className="text-[12px] font-medium text-[#6b6b6b]">Powered by Magic</span>
        </div>
      </div>
    </div>
  );
}