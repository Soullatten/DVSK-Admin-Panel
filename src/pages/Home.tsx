import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, MessageSquare, LayoutPanelLeft, MoreHorizontal, Trash2, Edit3, AlertTriangle } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import AIChat, { type ChatProps } from '../components/AIChat';

type ChatSession = { id: string; title: string; };

interface ExtendedChatProps extends ChatProps {
  chatHistory?: ChatSession[];
  currentChatId?: string | null;
  loadChat?: (id: string) => void;
  startNewChat?: () => void;
  deleteChat?: (id: string) => void;
  renameChat?: (id: string, newTitle: string) => void;
  editMessage?: (index: number, newContent: string) => void;
}

export default function Home() {
  const chatState = useOutletContext<ExtendedChatProps>();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [chatToDelete, setChatToDelete] = useState<ChatSession | null>(null);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const previousChats = chatState.chatHistory || [];
  const filteredChats = previousChats.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()));

  useEffect(() => {
    const handleClick = () => setActiveDropdown(null);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const handleRenameSave = (id: string) => {
    if (chatState.renameChat && editTitle.trim()) chatState.renameChat(id, editTitle.trim());
    setEditingChatId(null);
  };

  return (
    // Deep OLED Black Foundation
    <div className="flex h-[calc(100vh-52px)] w-full bg-[#050505] text-[#ececec] overflow-hidden font-sans selection:bg-[#ffffff20] selection:text-white relative">
      
      {/* ── LEFT SIDEBAR (HISTORY) ── */}
      <AnimatePresence initial={false}>
        {sidebarOpen && (
          <motion.div 
            initial={{ width: 0, opacity: 0 }} animate={{ width: 260, opacity: 1 }} exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="bg-[#0a0a0a] border-r border-[#ffffff0a] flex flex-col flex-shrink-0 z-20 relative"
          >
            <div className="w-[260px] h-full flex flex-col">
              
              {/* Top Actions */}
              <div className="p-3 pb-2 flex gap-2">
                <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-[#ffffff0a] rounded-xl transition-all text-[#666] hover:text-[#ececec]">
                  <LayoutPanelLeft className="w-[18px] h-[18px]" strokeWidth={1.5} />
                </button>
                <button onClick={() => chatState.startNewChat?.()} className="flex-1 flex items-center justify-between bg-[#ffffff05] border border-[#ffffff0a] hover:bg-[#ffffff0a] rounded-xl px-3 py-1.5 text-[13px] font-medium transition-all group">
                  <span className="flex items-center gap-2 text-[#ececec]"><Plus className="w-4 h-4 text-[#888] group-hover:text-white transition-colors" strokeWidth={1.5} /> New chat</span>
                  <Edit3 className="w-3.5 h-3.5 text-[#555] group-hover:text-[#888] transition-colors" strokeWidth={1.5} />
                </button>
              </div>

              {/* Search Box */}
              <div className="px-3 pb-3 pt-2">
                <div className="relative group">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-[10px] text-[#555] group-focus-within:text-[#ececec] transition-colors" />
                  <input 
                    type="text" placeholder="Search history..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#ffffff03] text-[13px] text-[#ececec] placeholder-[#555] rounded-xl pl-9 pr-3 py-2 outline-none focus:ring-1 focus:ring-[#ffffff1a] border border-[#ffffff0a] transition-all"
                  />
                </div>
              </div>

              {/* Chat List */}
              <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-[2px] custom-scrollbar">
                <div className="text-[10px] font-semibold text-[#555] mb-2 px-3 pt-2 tracking-widest uppercase">History</div>
                
                {filteredChats.length === 0 ? (
                  <div className="text-[13px] text-[#555] px-3 py-4">No conversations yet.</div>
                ) : (
                  filteredChats.map((chat) => {
                    const isActive = chatState.currentChatId === chat.id;
                    const isEditing = editingChatId === chat.id;

                    return (
                      <div key={chat.id} className="relative">
                        <button onClick={() => { if (!isEditing) chatState.loadChat?.(chat.id); }} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all group ${isActive ? 'bg-[#ffffff0a] text-[#ececec]' : 'hover:bg-[#ffffff05] text-[#888]'}`}>
                          <div className="flex items-center gap-3 overflow-hidden w-full">
                            {isEditing ? (
                              <input autoFocus value={editTitle} onChange={(e) => setEditTitle(e.target.value)} onBlur={() => handleRenameSave(chat.id)} onKeyDown={(e) => { if (e.key === 'Enter') handleRenameSave(chat.id); if (e.key === 'Escape') setEditingChatId(null); }} className="bg-transparent border-b border-[#555] outline-none text-[13px] w-full text-white" onClick={(e) => e.stopPropagation()} />
                            ) : (
                              <span className="text-[13px] truncate font-medium pt-[1px]">{chat.title}</span>
                            )}
                          </div>
                          
                          <div onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === chat.id ? null : chat.id); }} className={`p-1 rounded-md hover:bg-[#ffffff10] transition-colors ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                            <MoreHorizontal className="w-4 h-4 text-[#888] hover:text-white" />
                          </div>
                        </button>

                        <AnimatePresence>
                          {activeDropdown === chat.id && (
                            <motion.div initial={{ opacity: 0, scale: 0.95, y: -5 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -5 }} transition={{ duration: 0.15 }} className="absolute right-2 top-10 w-36 bg-[#111] border border-[#222] rounded-xl shadow-2xl z-50 p-1" onClick={(e) => e.stopPropagation()}>
                              <button onClick={() => { setEditTitle(chat.title); setEditingChatId(chat.id); setActiveDropdown(null); }} className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-[#ececec] hover:bg-[#222] rounded-lg transition-colors"><Edit3 className="w-3.5 h-3.5 text-[#888]" /> Rename</button>
                              <div className="h-[1px] w-full bg-[#ffffff0a] my-1" />
                              <button onClick={() => { setChatToDelete(chat); setActiveDropdown(null); }} className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-[#ef4444] hover:bg-[#3f1616] rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── RIGHT MAIN AREA (AIChat Engine) ── */}
      <div className="flex-1 flex flex-col relative min-w-0 z-10 bg-transparent">
        {!sidebarOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute top-4 left-4 z-30">
             <button onClick={() => setSidebarOpen(true)} className="p-2 text-[#888] hover:text-[#ececec] hover:bg-[#ffffff0a] rounded-xl transition-colors bg-[#0a0a0a] border border-[#ffffff0a] shadow-md"><LayoutPanelLeft className="w-5 h-5" strokeWidth={1.5} /></button>
          </motion.div>
        )}
        <AIChat {...chatState} />
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {chatToDelete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[#0a0a0a] border border-[#ffffff10] rounded-3xl shadow-2xl w-full max-w-sm p-8">
              <div className="flex items-center gap-3 text-[#ef4444] mb-4"><div className="w-10 h-10 rounded-full bg-[#ef4444]/10 flex items-center justify-center"><AlertTriangle className="w-5 h-5" /></div><h3 className="text-lg font-semibold text-[#ececec]">Delete Chat?</h3></div>
              <p className="text-[#a1a1aa] text-[14px] mb-8">Are you sure you want to delete <strong className="text-white">"{chatToDelete.title}"</strong>?</p>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setChatToDelete(null)} className="px-5 py-2.5 rounded-xl text-[13px] font-medium text-[#ececec] hover:bg-[#ffffff0a] transition-colors border border-[#ffffff10]">Cancel</button>
                <button onClick={() => { if (chatState.deleteChat) chatState.deleteChat(chatToDelete.id); setChatToDelete(null); }} className="px-5 py-2.5 rounded-xl text-[13px] font-medium bg-[#ef4444] text-white hover:bg-[#dc2626] transition-colors">Delete</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: transparent; border-radius: 10px; }
        *:hover > .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; }
      `}} />
    </div>
  );
}