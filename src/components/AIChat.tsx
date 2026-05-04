import React, { useState, useRef, useEffect } from 'react';
import { Loader2, Sparkles, Activity, Eye, ArrowUp, Bot, Paperclip, X, FileText, Image as ImageIcon, Wrench } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiClient } from '../api/client';

export type Attachment = {
  kind: 'image' | 'text' | 'csv';
  name: string;
  mimeType: string;
  dataUrl?: string;  // for images (base64) — also useful for previews
  text?: string;     // extracted text for text/csv
  size: number;
};

export type Message = {
  role: 'user' | 'assistant' | 'system';
  content: string;
  attachments?: Attachment[];
  toolEvents?: Array<{ name: string; args: any; result: any }>;
};

const MAX_ATTACHMENT_BYTES = 8 * 1024 * 1024;
const SUPPORTED_TEXT_EXT = ['.txt', '.md', '.json', '.log', '.csv', '.tsv'];

const readFileAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

const readFileAsText = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });

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
  const [pendingAttachments, setPendingAttachments] = useState<Attachment[]>([]);

  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const next: Attachment[] = [];
    for (const file of files) {
      if (file.size > MAX_ATTACHMENT_BYTES) {
        console.warn('Attachment too large:', file.name);
        continue;
      }
      const isImage = file.type.startsWith('image/');
      const lowerName = file.name.toLowerCase();
      const isText = !isImage && (
        file.type.startsWith('text/') ||
        file.type.includes('json') ||
        SUPPORTED_TEXT_EXT.some((ext) => lowerName.endsWith(ext))
      );
      try {
        if (isImage) {
          const dataUrl = await readFileAsDataUrl(file);
          next.push({ kind: 'image', name: file.name, mimeType: file.type, dataUrl, size: file.size });
        } else if (isText) {
          const text = await readFileAsText(file);
          const kind: Attachment['kind'] = lowerName.endsWith('.csv') || lowerName.endsWith('.tsv') ? 'csv' : 'text';
          next.push({ kind, name: file.name, mimeType: file.type || 'text/plain', text, size: file.size });
        } else {
          console.warn('Unsupported file type:', file.type, '— only images and text/csv files are supported.');
        }
      } catch (err) {
        console.error('Failed to read file:', file.name, err);
      }
    }
    setPendingAttachments((prev) => [...prev, ...next]);
    e.target.value = '';
  };

  const removePendingAttachment = (index: number) => {
    setPendingAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  // ── 3. SEND MESSAGE LOGIC ──
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!input.trim() && pendingAttachments.length === 0) || isTyping) return;

    const userMessage = input.trim();
    const attachmentsForMessage = pendingAttachments;
    setInput('');
    setPendingAttachments([]);

    const currentId = activeSessionId || `chat_${Date.now()}`;
    if (!activeSessionId) setActiveSessionId(currentId);

    const newMessages: Message[] = [
      ...messages,
      { role: 'user', content: userMessage, attachments: attachmentsForMessage },
    ];
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
      const { data } = await apiClient.post('/admin/chat', {
        messages: newMessages
          .filter(m => m.role !== 'system')
          .map(m => ({
            role: m.role,
            content: m.content,
            attachments: m.attachments?.map(a => ({
              kind: a.kind,
              name: a.name,
              mimeType: a.mimeType,
              dataUrl: a.dataUrl,
              text: a.text,
            })),
          })),
        pastMemory: localStorage.getItem('dvsk_memory') || 'No previous memory.',
        pageContext: currentPageContext,
      });

      const reply = data?.data?.reply ?? data?.reply ?? '';
      const toolEvents = data?.data?.toolEvents ?? [];

      const finalMessages: Message[] = [
        ...newMessages,
        { role: 'assistant', content: reply, toolEvents },
      ];
      setMessages(finalMessages);
      saveToHistory(currentId, finalMessages);
    } catch (error: any) {
      const msg =
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        error?.message ||
        'Connection lost.';
      const errorMessages: Message[] = [
        ...newMessages,
        { role: 'assistant', content: `⚠️ ${msg} Ensure the DVSK main website backend is running on port 5000 and you are logged in as admin.` },
      ];
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
                  <div className="max-w-[75%] flex flex-col items-end gap-2">
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="flex flex-wrap gap-2 justify-end">
                        {msg.attachments.map((att, ai) =>
                          att.kind === 'image' && att.dataUrl ? (
                            <img
                              key={ai}
                              src={att.dataUrl}
                              alt={att.name}
                              className="max-w-[220px] max-h-[220px] rounded-xl border border-purple-400/30 shadow-lg object-cover"
                            />
                          ) : (
                            <div
                              key={ai}
                              className="bg-purple-600/20 border border-purple-500/30 text-purple-100 px-3 py-2 rounded-xl flex items-center gap-2 text-[12px] font-medium"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span className="font-mono">{att.name}</span>
                              <span className="text-purple-300/70">{Math.round(att.size / 1024)} KB</span>
                            </div>
                          )
                        )}
                      </div>
                    )}
                    {msg.content && (
                      <div className="px-4 py-2.5 bg-purple-600 text-white rounded-2xl rounded-tr-sm text-[14px] leading-relaxed shadow-[0_4px_15px_rgba(147,51,234,0.2)] font-medium">
                        {msg.content}
                      </div>
                    )}
                  </div>
                ) : (
                  // ── NAVYA MESSAGE ──
                  <div className="flex gap-3.5 max-w-[85%] group">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-b from-[#222] to-[#111] border border-white/10 flex items-center justify-center flex-shrink-0 shadow-lg mt-0.5 group-hover:border-purple-500/30 transition-colors duration-300">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                    </div>
                    <div className="text-[14.5px] leading-relaxed text-[#d4d4d4] pt-1 font-normal tracking-wide flex-1">
                      {msg.content.split('\n').map((line, i) => (
                        <React.Fragment key={i}>
                          {line}
                          {i !== msg.content.split('\n').length - 1 && <div className="h-2" />}
                        </React.Fragment>
                      ))}
                      {msg.toolEvents && msg.toolEvents.length > 0 && (
                        <div className="mt-3 space-y-1.5">
                          {msg.toolEvents.map((evt, ei) => (
                            <div
                              key={ei}
                              className="flex items-center gap-2 text-[11px] text-[#888] bg-[#111] border border-white/5 rounded-lg px-2.5 py-1.5"
                            >
                              <Wrench className="w-3 h-3 text-purple-400 flex-shrink-0" />
                              <span className="font-mono text-purple-300">{evt.name}</span>
                              <span className="text-[#555]">·</span>
                              <span className="font-mono truncate text-[#666]">
                                {(() => {
                                  const r = evt.result;
                                  if (!r) return 'no result';
                                  if (Array.isArray(r)) return `${r.length} rows`;
                                  if (r.error) return `error: ${r.error}`;
                                  if (r.ok) return 'ok';
                                  if (typeof r.totalOrders === 'number') return `${r.totalOrders} orders · ₹${Math.round(r.totalRevenue).toLocaleString('en-IN')}`;
                                  if (typeof r.count === 'number') return `${r.count}`;
                                  return 'done';
                                })()}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
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
          
          {pendingAttachments.length > 0 && (
            <div className="relative px-3 pt-3 pb-1 flex flex-wrap gap-2">
              {pendingAttachments.map((att, i) => (
                <div
                  key={i}
                  className="bg-[#1a1a1a] border border-white/10 rounded-xl pl-2 pr-1.5 py-1.5 flex items-center gap-2 text-[11px] text-[#ccc]"
                >
                  {att.kind === 'image' && att.dataUrl ? (
                    <img src={att.dataUrl} alt={att.name} className="w-8 h-8 object-cover rounded-md" />
                  ) : (
                    <div className="w-8 h-8 rounded-md bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                      {att.kind === 'image' ? (
                        <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
                      ) : (
                        <FileText className="w-3.5 h-3.5 text-purple-400" />
                      )}
                    </div>
                  )}
                  <div className="flex flex-col leading-tight">
                    <span className="font-mono truncate max-w-[150px]">{att.name}</span>
                    <span className="text-[#666] text-[10px]">{Math.round(att.size / 1024)} KB</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removePendingAttachment(i)}
                    className="ml-1 w-6 h-6 rounded-md hover:bg-red-500/20 text-[#888] hover:text-red-400 flex items-center justify-center"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="relative flex items-end p-1.5">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.txt,.md,.json,.log,.csv,.tsv,text/*"
              onChange={handleFilesSelected}
              className="hidden"
            />
            <button
              type="button"
              onClick={handleAttachClick}
              disabled={isTyping}
              title="Attach images or text/CSV files"
              className="mb-0.5 ml-0.5 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 focus:outline-none flex-shrink-0 text-[#888] hover:text-purple-400 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Paperclip className="w-4 h-4" strokeWidth={2} />
            </button>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
              placeholder={currentScreen ? `Ask Navya about ${currentScreen}...` : "Message Navya — drop files, ask about DVSK..."}
              className="flex-1 max-h-[120px] min-h-[44px] bg-transparent border-none outline-none text-[#ececec] placeholder-[#6b6b6b] px-3 py-2.5 text-[14px] resize-none leading-relaxed custom-scrollbar font-medium"
              disabled={isTyping}
              rows={1}
            />
            <button
              type="submit"
              disabled={(!input.trim() && pendingAttachments.length === 0) || isTyping}
              className={`
                mb-0.5 mr-0.5 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 focus:outline-none flex-shrink-0
                ${((!input.trim() && pendingAttachments.length === 0) || isTyping)
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