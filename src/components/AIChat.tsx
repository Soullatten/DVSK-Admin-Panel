import React, { useState, useRef, useEffect } from 'react';
import { Loader2, Sparkles, Activity, Eye, ArrowUp, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export type Message = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export interface ChatProps {
  currentChatId?: string | null;
  chatHistory?: any[]; 
  updateChat?: (id: string, messages: Message[], title?: string) => void;
}

export default function AIChat({ currentChatId, chatHistory, updateChat }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ── 1. LOAD CHAT HISTORY ──
  useEffect(() => {
    if (currentChatId) {
      setActiveSessionId(currentChatId);
      const selectedChat = chatHistory?.find(c => c.id === currentChatId);
      if (selectedChat && selectedChat.messages) {
        setMessages(selectedChat.messages);
        return;
      }
      const stored = localStorage.getItem('dvsk_chats');
      if (stored) {
        const parsed = JSON.parse(stored);
        const found = parsed.find((c: any) => c.id === currentChatId);
        if (found && found.messages) {
          setMessages(found.messages);
          return;
        }
      }
    } else {
      setActiveSessionId(null);
      setMessages([{ role: 'assistant', content: 'Welcome back, Krishiv. DVSK systems are online. How can we scale today?' }]);
    }
  }, [currentChatId, chatHistory]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    const path = window.location.pathname;
    if (path.includes('/live')) setCurrentScreen('Live Map Operations');
    else if (path.includes('/analytics')) setCurrentScreen('Analytics Dashboard');
    else setCurrentScreen(null);
  }, []);

  // ── 2. AUTO-SAVE FUNCTION ──
  const saveToHistory = (chatId: string, msgs: Message[]) => {
    try {
      if (updateChat) {
        const title = msgs.find(m => m.role === 'user')?.content.substring(0, 25) + '...';
        updateChat(chatId, msgs, title);
      }

      const storageKey = 'dvsk_chats';
      const storedData = localStorage.getItem(storageKey);
      let historyArray = storedData ? JSON.parse(storedData) : [];

      const existingIndex = historyArray.findIndex((c: any) => c.id === chatId);
      const chatTitle = msgs.find(m => m.role === 'user')?.content.substring(0, 25) + '...' || 'New Conversation';

      if (existingIndex >= 0) {
        historyArray[existingIndex].messages = msgs;
      } else {
        historyArray.unshift({ id: chatId, title: chatTitle, messages: msgs });
      }

      localStorage.setItem(storageKey, JSON.stringify(historyArray));
      window.dispatchEvent(new Event('storage')); 
    } catch (error) {
      console.error("Failed to save chat to history:", error);
    }
  };

  // ── 3. SEND MESSAGE LOGIC ──
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();
    setInput('');
    
    const currentId = activeSessionId || `chat_${Date.now()}`;
    if (!activeSessionId) setActiveSessionId(currentId);

    const newMessages: Message[] = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    saveToHistory(currentId, newMessages);
    setIsTyping(true);

    let currentPageContext = null;
    const currentPath = window.location.pathname;

    if (currentPath.includes('/live')) {
      currentPageContext = { page_name: "Live Map", visible_orders: [{ city: 'Mumbai', amount: '₹4,500' }, { city: 'Delhi', amount: '₹12,200' }] };
    } else if (currentPath.includes('/analytics')) {
      currentPageContext = { page_name: "Analytics", metrics_on_screen: { gross_sales: "₹14,500", orders_fulfilled: 42 } };
    }

    try {
      const response = await fetch('http://localhost:5001/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.filter(m => m.role !== 'system'), 
          pastMemory: localStorage.getItem('dvsk_memory') || "No previous memory.",
          pageContext: currentPageContext 
        }),
      });

      if (!response.ok) throw new Error('Failed to connect to backend');
      const data = await response.json();
      
      const finalMessages: Message[] = [...newMessages, { role: 'assistant', content: data.reply }];
      setMessages(finalMessages);
      saveToHistory(currentId, finalMessages);
    } catch (error) {
      const errorMessages: Message[] = [...newMessages, { role: 'assistant', content: '⚠️ Connection lost. Ensure the DVSK backend is running on port 5001.' }];
      setMessages(errorMessages);
      saveToHistory(currentId, errorMessages);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#0a0a0a] relative overflow-hidden font-sans">
      
      {/* ── BACKGROUND PURPLE GLOW EFFECT ── */}
      <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-purple-600/10 blur-[100px] pointer-events-none rounded-full" />

      {/* ── FLOATING HEADER ── */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 pointer-events-none flex flex-col items-center">
        <motion.div 
          initial={{ y: -20, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="bg-[#111111]/80 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full flex items-center gap-2.5 shadow-[0_8px_30px_rgba(0,0,0,0.5)]"
        >
          <div className="w-6 h-6 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
            <Bot className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <span className="text-[12px] font-bold text-[#ececec] tracking-widest uppercase leading-none mt-[1px]">DVSK</span>
          <div className="w-[1px] h-3.5 bg-white/15 mx-1" />
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] text-emerald-400/90 font-bold uppercase tracking-widest mt-[1px]">Online</span>
          </div>
        </motion.div>
      </div>

      {/* ── MESSAGES AREA ── */}
      <div className="flex-1 overflow-y-auto px-5 pt-24 pb-32 space-y-6 scroll-smooth relative z-10 custom-scrollbar">
        <AnimatePresence initial={false}>
          {messages.map((msg, index) => {
            const isUser = msg.role === 'user';
            return (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20, scale: 0.95, x: isUser ? 20 : -20 }}
                animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 28, mass: 2.5 }}
                className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {isUser ? (
                  // ── USER MESSAGE (Purple Accent) ──
                  <div className="max-w-[75%] px-4 py-2.5 bg-purple-600 text-white rounded-2xl rounded-tr-sm text-[14px] leading-relaxed shadow-[0_4px_15px_rgba(147,51,234,0.2)] font-medium">
                    {msg.content}
                  </div>
                ) : (
                  // ── NAVYA MESSAGE ──
                  <div className="flex gap-3.5 max-w-[85%] group">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-b from-[#222] to-[#111] border border-white/10 flex items-center justify-center flex-shrink-0 shadow-lg mt-0.5 group-hover:border-purple-500/30 transition-colors duration-300">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                    </div>
                    <div className="text-[14.5px] leading-relaxed text-[#d4d4d4] pt-1 font-normal tracking-wide">
                      {msg.content.split('\n').map((line, i) => (
                        <React.Fragment key={i}>
                          {line}
                          {i !== msg.content.split('\n').length - 1 && <div className="h-2" />}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* ── TYPING INDICATOR ── */}
        <AnimatePresence>
          {isTyping && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex w-full justify-start"
            >
              <div className="flex gap-3.5 max-w-[85%]">
                <div className="w-8 h-8 rounded-full bg-gradient-to-b from-[#222] to-[#111] border border-white/10 flex items-center justify-center flex-shrink-0 shadow-lg mt-0.5">
                  <Activity className="w-4 h-4 text-purple-400 animate-pulse" />
                </div>
                <div className="flex items-center gap-1.5 pt-3.5 pl-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div 
                      key={i}
                      className="w-1.5 h-1.5 bg-[#666] rounded-full" 
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} className="h-4" />
      </div>

      {/* ── FLOATING INPUT BAR ── */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-[90%] z-30">
        <form onSubmit={handleSendMessage} className="relative group">
          
          <AnimatePresence>
            {currentScreen && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.9 }} 
                animate={{ opacity: 1, y: 0, scale: 1 }} 
                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                className="absolute -top-8 left-2 flex items-center gap-2 bg-[#111]/90 backdrop-blur-md border border-purple-500/20 px-3 py-1.5 rounded-full shadow-lg"
              >
                <Eye className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider">Vision: {currentScreen}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className={`
            absolute inset-0 bg-[#161616] rounded-2xl border transition-all duration-300 shadow-[0_10px_40px_rgba(0,0,0,0.8)]
            ${isFocused ? 'border-purple-500/40 shadow-[0_0_20px_rgba(168,85,247,0.15)]' : 'border-white/10 group-hover:border-white/20'}
          `} />
          
          <div className="relative flex items-end p-1.5">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
              placeholder={currentScreen ? `Ask DVSK about ${currentScreen}...` : "Message DVSK..."}
              className="flex-1 max-h-[120px] min-h-[44px] bg-transparent border-none outline-none text-[#ececec] placeholder-[#6b6b6b] px-3 py-2.5 text-[14px] resize-none leading-relaxed custom-scrollbar font-medium"
              disabled={isTyping}
              rows={1}
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className={`
                mb-0.5 mr-0.5 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 focus:outline-none flex-shrink-0
                ${(!input.trim() || isTyping) 
                  ? 'bg-[#222] text-[#555]' 
                  : 'bg-white text-black hover:bg-purple-500 hover:text-white shadow-lg hover:shadow-purple-500/25 hover:scale-105'
                }
              `}
            >
              {isTyping ? (
                <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
              ) : (
                <ArrowUp className="w-5 h-5" strokeWidth={2.5} />
              )}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}