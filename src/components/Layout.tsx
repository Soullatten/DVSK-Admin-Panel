import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    Search, Bell, Settings, Home, Inbox,
    Megaphone, Percent, TrendingUp,
    Package, Users, Store, Plus,
    Globe, BookOpen, MessageSquare, X, Eye, MessageCircle, Sparkles
} from 'lucide-react';
import secondaryLogo from '../assets/Secondary_logo.svg';
import MetallicPaint from '@/components/MetallicPaint';
import AIChat, { type Message } from './AIChat';

const metallicProps = {
    seed: 42, scale: 2, patternSharpness: 0.2, noiseScale: 2.5,
    speed: 0.45, liquid: 0.25, mouseAnimation: false, brightness: 2.45,
    contrast: 0.52, refraction: 0.02, blur: 0.05, chromaticSpread: 1,
    fresnel: 1, angle: 1, waveAmplitude: 1, distortion: 1, contour: 0.2,
    lightColor: "#ffebab", darkColor: "#080808", tintColor: "#ffffff",
};

const navItems = [
    { icon: <Home className="h-[18px] w-[18px]" strokeWidth={1.5} />, label: 'Home', path: '/' },
    {
        icon: <Inbox className="h-[18px] w-[18px]" strokeWidth={1.5} />, label: 'Orders', path: '/orders',
        subItems: [
            { label: 'Drafts', path: '/orders/drafts' },
            { label: 'Abandoned checkouts', path: '/orders/abandoned' },
        ],
    },
    {
        icon: <Package className="h-[18px] w-[18px]" strokeWidth={1.5} />, label: 'Products', path: '/products',
        subItems: [
            { label: 'Collections', path: '/products/collections' },
            { label: 'Inventory', path: '/products/inventory' },
            { label: 'Purchase orders', path: '/products/purchase-orders' },
            { label: 'Transfers', path: '/products/transfers' },
            { label: 'Gift cards', path: '/products/gift-cards' },
        ],
    },
    {
        icon: <Users className="h-[18px] w-[18px]" strokeWidth={1.5} />, label: 'Customers', path: '/customers',
        subItems: [
            { label: 'Segments', path: '/customers/segments' },
            { label: 'Companies', path: '/customers/companies' },
        ],
    },
    {
        icon: <Megaphone className="h-[18px] w-[18px]" strokeWidth={1.5} />, label: 'Marketing', path: '/marketing',
        subItems: [
            { label: 'Campaigns', path: '/marketing/campaigns' },
            { label: 'Automations', path: '/marketing/automations' },
            { label: 'Attribution', path: '/marketing/attribution' },
        ],
    },
    { icon: <Percent className="h-[18px] w-[18px]" strokeWidth={1.5} />, label: 'Discounts', path: '/discounts' },
    {
        icon: <TrendingUp className="h-[18px] w-[18px]" strokeWidth={1.5} />, label: 'Analytics', path: '/analytics',
        subItems: [
            { label: 'Reports', path: '/analytics/reports' },
            { label: 'Live View', path: '/analytics/live-view' },
        ],
    },
    { icon: <Globe className="h-[18px] w-[18px]" strokeWidth={1.5} />, label: 'Markets', path: '/markets' },
    { icon: <BookOpen className="h-[18px] w-[18px]" strokeWidth={1.5} />, label: 'Catalogs', path: '/catalogs' },
    { icon: <Store className="h-[18px] w-[18px]" strokeWidth={1.5} />, label: 'Online Store', path: '/online-store' },
];

export type ChatSession = {
    id: string;
    title: string;
    messages: Message[];
};

export default function Layout() {
    const navigate = useNavigate();
    const location = useLocation();

    const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
    const [currentChatId, setCurrentChatId] = useState<string | null>(null);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const loadChats = () => {
            const savedHistory = localStorage.getItem('dvsk_chats');
            if (savedHistory) setChatHistory(JSON.parse(savedHistory));
        };
        loadChats();
        window.addEventListener('storage', loadChats);
        return () => window.removeEventListener('storage', loadChats);
    }, []);

    const currentMessages = currentChatId 
        ? chatHistory.find(chat => chat.id === currentChatId)?.messages || [] : [];

    const startNewChat = () => { setCurrentChatId(null); setInput(''); setIsChatOpen(true); };
    const loadChat = (id: string) => { setCurrentChatId(id); setInput(''); setIsChatOpen(true); };
    
    const deleteChat = (id: string) => {
        const updated = chatHistory.filter(chat => chat.id !== id);
        setChatHistory(updated);
        localStorage.setItem('dvsk_chats', JSON.stringify(updated));
        if (currentChatId === id) startNewChat();
    };

    const renameChat = (id: string, newTitle: string) => {
        const updated = chatHistory.map(chat => chat.id === id ? { ...chat, title: newTitle } : chat);
        setChatHistory(updated);
        localStorage.setItem('dvsk_chats', JSON.stringify(updated));
    };

    const updateChat = (id: string, messages: Message[], title?: string) => {
        setChatHistory(prev => {
            const existingIndex = prev.findIndex(c => c.id === id);
            let updated = [...prev];
            if (existingIndex >= 0) {
                updated[existingIndex].messages = messages;
                if (title) updated[existingIndex].title = title;
            } else {
                updated.unshift({ id, title: title || 'New Conversation', messages });
            }
            localStorage.setItem('dvsk_chats', JSON.stringify(updated));
            return updated;
        });
        setCurrentChatId(id);
    };

    const editMessage = async () => {};
    const sendMessage = async () => {};

    const chatState = {
        messages: currentMessages, chatHistory, currentChatId, input, setInput, loading, 
        sendMessage, startNewChat, loadChat, deleteChat, renameChat, editMessage, updateChat 
    };

    const isHomePage = location.pathname === '/';

    return (
        <div className="min-h-screen bg-[#111111] text-[#e3e3e3] antialiased selection:bg-purple-500/30 selection:text-white flex flex-col"
            style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "San Francisco", "Segoe UI", Roboto, sans-serif' }}>
            
            <nav className={`fixed top-0 w-full h-[60px] flex items-center justify-between px-4 z-50 transition-all duration-300 ${scrolled ? 'bg-[#111111]/80 backdrop-blur-md border-b border-white/5 shadow-sm' : 'bg-[#111111]'}`}>
                <div className="flex items-center gap-3 w-[220px]">
                    <div className="w-10 h-10 flex-shrink-0 rounded-lg overflow-hidden shadow-[0_0_15px_rgba(255,255,255,0.05)] border border-white/10">
                        <MetallicPaint imageSrc={secondaryLogo} {...metallicProps} />
                    </div>
                </div>

                <div className="flex-1 max-w-[580px] mx-4 relative group">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none transition-colors group-focus-within:text-white text-[#6b6b6b]">
                        <Search className="h-4 w-4" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search anything..."
                        className="w-full bg-[#1a1a1a] hover:bg-[#222222] text-[#e3e3e3] placeholder-[#6b6b6b] text-[14px] rounded-xl pl-10 pr-16 py-2 border border-white/5 hover:border-white/10 focus:border-purple-500/50 focus:bg-[#1a1a1a] focus:ring-4 focus:ring-purple-500/10 focus:outline-none transition-all duration-200"
                    />
                    <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none gap-1">
                        <span className="text-[10px] font-semibold bg-[#2a2a2a] border border-white/10 rounded px-1.5 py-0.5 text-[#888]">⌘</span>
                        <span className="text-[10px] font-semibold bg-[#2a2a2a] border border-white/10 rounded px-1.5 py-0.5 text-[#888]">K</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button className="p-2 hover:bg-white/5 rounded-xl transition-colors relative group">
                        <Bell className="h-5 w-5 text-[#888] group-hover:text-white transition-colors" strokeWidth={1.5} />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-purple-500 rounded-full border-2 border-[#111111]"></span>
                    </button>
                    
                    <div className="flex items-center gap-2.5 cursor-pointer hover:bg-white/5 pl-2 pr-3 py-1.5 rounded-xl border border-transparent hover:border-white/5 transition-all ml-1">
                        <div className="w-8 h-8 flex-shrink-0 rounded-full overflow-hidden border border-white/10">
                            <MetallicPaint imageSrc={secondaryLogo} {...metallicProps} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[#e3e3e3] text-[13px] font-semibold leading-tight">DVSK Admin</span>
                            <span className="text-[#6b6b6b] text-[11px] font-medium leading-tight">Pro Plan</span>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="flex pt-[60px] flex-1 h-screen overflow-hidden">
                <aside className="w-[240px] bg-[#111111] flex flex-col justify-between h-full fixed overflow-y-auto z-40 sidebar-scroll border-r border-white/5">
                    <div className="p-3 pt-5">
                        <div className="text-[11px] font-bold text-[#6b6b6b] uppercase tracking-[0.15em] mb-3 px-3">Main Menu</div>
                        <ul className="space-y-1">
                            {navItems.map((item) => {
                                const isMainActive = location.pathname === item.path;
                                const isSubItemActive = item.subItems?.some((sub) => location.pathname === sub.path);
                                const isExpanded = isMainActive || isSubItemActive;
                                const activeSubIndex = item.subItems?.findIndex((sub) => location.pathname === sub.path) ?? -1;

                                return (
                                    <li key={item.label} className="relative group">
                                        <div className="flex items-center relative">
                                            <a
                                                href="#"
                                                onClick={(e) => { e.preventDefault(); navigate(item.path); }}
                                                className={`flex-1 flex items-center gap-3 px-3 py-2 rounded-xl text-[14px] font-medium transition-all duration-200 relative z-10
                                                    ${isMainActive
                                                        ? 'bg-purple-500/10 text-purple-400 font-semibold'
                                                        : isExpanded
                                                            ? 'text-white'
                                                            : 'text-[#888] hover:bg-white/5 hover:text-white'
                                                    }`}
                                            >
                                                <div className={`${isMainActive ? 'text-purple-400' : 'text-[#888] group-hover:text-white'} transition-colors`}>
                                                    {item.icon}
                                                </div>
                                                {item.label}
                                            </a>

                                            {item.label === 'Online Store' && (
                                                <a
                                                    href="http://localhost:5173" 
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="absolute right-2 opacity-0 group-hover:opacity-100 hover:bg-white/10 p-1.5 rounded-lg transition-all z-20 text-[#888] hover:text-white"
                                                >
                                                    <Eye className="h-4 w-4" strokeWidth={2} />
                                                </a>
                                            )}
                                        </div>

                                        {item.subItems && isExpanded && (
                                            <div className="relative pb-2 mt-1 animate-in slide-in-from-top-2 fade-in duration-200">
                                                {activeSubIndex !== -1 && (
                                                    <svg className="absolute left-[21px] top-[-10px] pointer-events-none z-10" width="16" height={(activeSubIndex * 36) + 26} style={{ overflow: 'visible' }}>
                                                        <path d={`M 0 0 L 0 ${(activeSubIndex * 36) + 14} A 8 8 0 0 0 8 ${(activeSubIndex * 36) + 22} L 12 ${(activeSubIndex * 36) + 22}`} fill="none" stroke="#a855f7" strokeWidth="2" opacity="0.5" />
                                                        <circle cx="12" cy={(activeSubIndex * 36) + 22} r="2.5" fill="#a855f7" />
                                                    </svg>
                                                )}

                                                <ul className="space-y-1 relative z-0">
                                                    {item.subItems.map((sub) => {
                                                        const isSubActive = location.pathname === sub.path;
                                                        return (
                                                            <li key={sub.label} className="relative group/sub">
                                                                <a
                                                                    href="#"
                                                                    onClick={(e) => { e.preventDefault(); navigate(sub.path); }}
                                                                    className={`block pl-[44px] pr-3 py-[7px] rounded-xl text-[13px] font-medium transition-all duration-200
                                                                        ${isSubActive
                                                                            ? 'text-white font-semibold'
                                                                            : 'text-[#6b6b6b] hover:text-white hover:bg-white/5'
                                                                        }`}
                                                                >
                                                                    {sub.label}
                                                                </a>
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            </div>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>

                        <div className="mt-6 pt-5 border-t border-white/5">
                            <div className="flex items-center justify-between px-3 mb-3">
                                <div className="text-[11px] font-bold text-[#6b6b6b] uppercase tracking-[0.15em] flex items-center gap-1.5">
                                    Navya AI <Sparkles className="h-3 w-3 text-purple-400" />
                                </div>
                                <button onClick={startNewChat} className="p-1 hover:bg-white/10 rounded-md text-purple-400 transition-colors">
                                    <Plus className="h-3.5 w-3.5" />
                                </button>
                            </div>
                            
                            <div className="space-y-1 px-1">
                                {chatHistory.slice(0, 3).map((chat) => (
                                    <button 
                                        key={chat.id} 
                                        onClick={() => loadChat(chat.id)}
                                        className={`flex items-center gap-3 w-full px-2 py-2 rounded-xl text-[13px] font-medium transition-all truncate border border-transparent
                                            ${currentChatId === chat.id 
                                                ? 'bg-purple-500/5 text-purple-300 border-purple-500/20 shadow-[inset_0_0_10px_rgba(168,85,247,0.05)]' 
                                                : 'text-[#888] hover:bg-white/5 hover:text-white hover:border-white/5'}`}
                                    >
                                        <MessageCircle className={`w-4 h-4 flex-shrink-0 ${currentChatId === chat.id ? 'text-purple-400' : 'text-[#555]'}`} />
                                        <span className="truncate">{chat.title}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="p-3 pb-5">
                        <a href="#" className="flex items-center gap-3 px-3 py-2 text-[#888] hover:bg-white/5 hover:text-white rounded-xl font-medium text-[14px] transition-all">
                            <Settings className="h-5 w-5" strokeWidth={1.5} /> Settings
                        </a>
                    </div>
                </aside>

                <main className="flex-1 ml-[240px] bg-[#0a0a0a] overflow-y-auto relative" 
                      style={{ 
                          borderRadius: '24px 0 0 0', 
                          borderTop: '1px solid rgba(255,255,255,0.05)', 
                          borderLeft: '1px solid rgba(255,255,255,0.05)',
                          boxShadow: 'inset 0 10px 30px rgba(0,0,0,0.5)'
                      }}>
                    
                    <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-purple-500/5 to-transparent pointer-events-none" />
                    
                    <div className="relative z-10 h-full">
                        <Outlet context={chatState} />
                    </div>

                    {!isHomePage && (
                        <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end">
                            {isChatOpen && (
                                <div
                                    className="mb-4 w-[420px] h-[600px] bg-[#111111]/90 backdrop-blur-xl shadow-[0_20px_40px_rgba(0,0,0,0.5)] border border-white/10 rounded-3xl overflow-hidden flex flex-col"
                                    style={{
                                        animation: 'chatPopIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                        transformOrigin: 'bottom right',
                                    }}
                                >
                                    <AIChat {...chatState} />
                                </div>
                            )}

                            <button
                                onClick={() => setIsChatOpen(!isChatOpen)}
                                className="w-14 h-14 bg-[#1a1a1a] border border-white/10 text-white rounded-full shadow-[0_10px_25px_rgba(0,0,0,0.5)] flex items-center justify-center hover:bg-[#222] hover:scale-105 hover:border-purple-500/30 transition-all duration-300 relative group"
                            >
                                <div className="absolute inset-0 rounded-full bg-purple-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                
                                <div className="relative z-10" style={{ animation: 'chatPopIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
                                    {isChatOpen
                                        ? <X className="w-6 h-6 text-[#888] group-hover:text-white" strokeWidth={1.5} />
                                        : <Sparkles className="w-6 h-6 text-purple-400 group-hover:text-purple-300" strokeWidth={1.5} />
                                    }
                                </div>
                                
                                {currentMessages.length > 0 && !isChatOpen && (
                                    <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-purple-500 rounded-full border-2 border-[#1a1a1a] animate-pulse" />
                                )}
                            </button>
                        </div>
                    )}
                </main>
            </div>

            <style
                dangerouslySetInnerHTML={{
                    __html: `
                        .sidebar-scroll::-webkit-scrollbar { width: 4px; }
                        .sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
                        .sidebar-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
                        .sidebar-scroll::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }

                        main::-webkit-scrollbar { width: 8px; }
                        main::-webkit-scrollbar-track { background: #0a0a0a; }
                        main::-webkit-scrollbar-thumb { background: #222; border-radius: 10px; border: 2px solid #0a0a0a; }
                        main::-webkit-scrollbar-thumb:hover { background: #333; }

                        @keyframes chatPopIn {
                            0% { opacity: 0; transform: scale(0.9) translateY(10px); }
                            100% { opacity: 1; transform: scale(1) translateY(0); }
                        }
                    `,
                }}
            />
        </div>
    );
}