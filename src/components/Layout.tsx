import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    Search, Bell, Settings, Home, Inbox,
    Megaphone, Percent, TrendingUp,
    Package, Users, Store, Plus, ChevronRight,
    Globe, BookOpen, MessageSquare, X, Eye
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

// ✅ "Online Store" is now officially part of your main navItems!
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
    { icon: <Store className="h-[18px] w-[18px]" strokeWidth={1.5} />, label: 'Online Store', path: '/online-store' }, // Placed at the bottom of main list
];

export default function Layout() {
    const navigate = useNavigate();
    const location = useLocation();

    // ── Global Chat Memory ──
    const [messages, setMessages] = useState<Message[]>(() => {
        const savedMemory = localStorage.getItem('dvsk_ai_messages');
        return savedMemory ? JSON.parse(savedMemory) : [];
    });

    // ── Hidden Background Vault for Old Chats ──
    const [pastMemory, setPastMemory] = useState(() => {
        return localStorage.getItem('dvsk_ai_background_memory') || '';
    });

    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);

    // Save UI messages and Background Memory whenever they change
    useEffect(() => {
        localStorage.setItem('dvsk_ai_messages', JSON.stringify(messages));
        localStorage.setItem('dvsk_ai_background_memory', pastMemory);
    }, [messages, pastMemory]);

    // ── Auto-Archiver Logic ──
    const archiveChatToMemory = (currentMessages: Message[]) => {
        if (currentMessages.length === 0) return;

        const chatLog = currentMessages.map(m => `${m.role === 'user' ? 'Kashyap' : 'AI'}: ${m.content}`).join(' | ');
        const updatedMemory = (pastMemory + '\n---\n' + chatLog).slice(-3000);

        setPastMemory(updatedMemory);
        setMessages([]);
    };

    useEffect(() => {
        if (messages.length >= 20) {
            archiveChatToMemory(messages);
        }
    }, [messages]);

    const sendMessage = async () => {
        const text = input.trim();
        if (!text || loading) return;

        const newMessages = [...messages, { role: 'user' as const, content: text }];
        setMessages(newMessages);
        setInput('');
        setLoading(true);

        try {
            // ✅ CHANGED THIS SECTION TO USE VITE_API_URL
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
            
            const res = await fetch(`${API_URL}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: newMessages,
                    pastMemory: pastMemory
                }),
            });

            if (!res.ok) throw new Error('Failed');
            const data = await res.json();

            const replyText = data.reply || 'No response';
            const delay = Math.min(replyText.length * 10, 2500);

            setTimeout(() => {
                setMessages([...newMessages, { role: 'assistant', content: replyText }]);
                setLoading(false);
            }, delay);

        } catch {
            setMessages([...newMessages, { role: 'assistant', content: 'Could not connect to backend.' }]);
            setLoading(false);
        }
    };

    const chatState = {
        messages, input, setInput, loading, sendMessage, setMessages,
        startNewChat: () => archiveChatToMemory(messages)
    };

    const isHomePage = location.pathname === '/';

    return (
        <div
            className="min-h-screen bg-[#1a1a1a] text-[#1a1a1a] antialiased"
            style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "San Francisco", "Segoe UI", Roboto, sans-serif' }}
        >
            {/* Top Nav */}
            <nav className="fixed top-0 w-full h-[52px] bg-[#1a1a1a] flex items-center justify-between px-4 z-50">
                <div className="flex items-center gap-2.5 w-[220px]">
                    <div className="w-12 h-12 flex-shrink-0">
                        <MetallicPaint imageSrc={secondaryLogo} {...metallicProps} />
                    </div>
                </div>

                <div className="flex-1 max-w-[580px] mx-4 relative">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <Search className="h-[14px] w-[14px] text-[#6b6b6b]" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search"
                        className="w-full bg-[#2c2c2c] hover:bg-[#333] text-[#e3e3e3] placeholder-[#6b6b6b] text-[13px] rounded-lg pl-8 pr-16 py-[6px] border border-[#3d3d3d] hover:border-[#4d4d4d] focus:border-[#6b6b6b] focus:bg-[#222] focus:outline-none transition-all"
                    />
                    <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none gap-0.5">
                        <span className="text-[10px] font-medium bg-[#111] border border-[#3d3d3d] rounded px-1.5 py-0.5 text-[#6b6b6b]">CTRL</span>
                        <span className="text-[10px] font-medium bg-[#111] border border-[#3d3d3d] rounded px-1.5 py-0.5 text-[#6b6b6b]">K</span>
                    </div>
                </div>

                <div className="flex items-center gap-1.5">
                    <button className="p-1.5 hover:bg-[#2c2c2c] rounded-lg transition-colors">
                        <svg className="h-5 w-5 text-[#c4c4c4]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <rect x="3" y="3" width="7" height="7" rx="1" />
                            <rect x="14" y="3" width="7" height="7" rx="1" />
                            <rect x="3" y="14" width="7" height="7" rx="1" />
                            <rect x="14" y="14" width="7" height="7" rx="1" />
                        </svg>
                    </button>
                    <button className="p-1.5 hover:bg-[#2c2c2c] rounded-lg transition-colors">
                        <Bell className="h-5 w-5 text-[#c4c4c4]" strokeWidth={1.5} />
                    </button>
                    <div className="flex items-center gap-2 cursor-pointer hover:bg-[#2c2c2c] px-2 py-1 rounded-lg transition-colors ml-1">
                        <div className="w-8 h-8 flex-shrink-0">
                            <MetallicPaint imageSrc={secondaryLogo} {...metallicProps} />
                        </div>
                        <span className="text-[#e3e3e3] text-[13px] font-medium">DVSK</span>
                    </div>
                </div>
            </nav>

            <div className="flex pt-[52px] h-screen">
                {/* Sidebar */}
                <aside className="w-[220px] bg-[#1a1a1a] flex flex-col justify-between h-full fixed overflow-y-auto z-40 sidebar-scroll">
                    <div className="p-2 pt-3">
                        <ul className="space-y-0.5">
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
                                                className={`flex-1 flex items-center gap-2.5 px-2.5 py-[6px] rounded-lg text-[13px] font-medium transition-all relative z-10
                                                    ${isMainActive
                                                        ? 'bg-white text-[#1a1a1a] shadow-sm'
                                                        : isExpanded
                                                            ? 'text-white'
                                                            : 'text-[#c4c4c4] hover:bg-[#2c2c2c] hover:text-white'
                                                    }`}
                                            >
                                                {item.icon} {item.label}
                                            </a>

                                            {/* ✅ The Shopify Hover Eye only appears next to "Online Store" */}
                                            {item.label === 'Online Store' && (
                                                <a
                                                    href="http://localhost:5173" // Change to your live site URL later!
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    title="View online store"
                                                    className={`absolute right-2 opacity-0 group-hover:opacity-100 hover:bg-[#4d4d4d] p-1 rounded transition-all z-20
                                                        ${isMainActive ? 'text-[#6b6b6b] hover:text-white' : 'text-[#9a9a9a] hover:text-white'}`}
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <Eye className="h-[14px] w-[14px]" strokeWidth={2} />
                                                </a>
                                            )}
                                        </div>

                                        {item.subItems && isExpanded && (
                                            <div className="relative pb-1">
                                                {activeSubIndex !== -1 && (
                                                    <svg
                                                        className="absolute left-[17px] top-[-8px] pointer-events-none z-10"
                                                        width="16"
                                                        height={(activeSubIndex * 32) + 24}
                                                        style={{ overflow: 'visible' }}
                                                    >
                                                        <path
                                                            d={`M 0 0 L 0 ${(activeSubIndex * 32) + 12} A 6 6 0 0 0 6 ${(activeSubIndex * 32) + 18} L 12 ${(activeSubIndex * 32) + 18}`}
                                                            fill="none" stroke="#6b6b6b" strokeWidth="1.5"
                                                        />
                                                        <path
                                                            d={`M 9 ${(activeSubIndex * 32) + 15} L 13 ${(activeSubIndex * 32) + 18} L 9 ${(activeSubIndex * 32) + 21}`}
                                                            fill="none" stroke="#6b6b6b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                                                        />
                                                    </svg>
                                                )}

                                                <ul className="space-y-[2px] relative z-0 mt-1">
                                                    {item.subItems.map((sub) => {
                                                        const isSubActive = location.pathname === sub.path;
                                                        return (
                                                            <li key={sub.label} className="relative group/sub">
                                                                <a
                                                                    href="#"
                                                                    onClick={(e) => { e.preventDefault(); navigate(sub.path); }}
                                                                    className={`block pl-[38px] pr-2.5 py-[6px] rounded-lg text-[13px] font-medium transition-all
                                                                        ${isSubActive
                                                                            ? 'bg-white text-[#1a1a1a] shadow-sm'
                                                                            : 'text-[#9a9a9a] hover:text-white hover:bg-[#2c2c2c]'
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

                        <div className="mt-4 px-2.5 pt-4 border-t border-[#333]">
                            <button className="flex items-center justify-between w-full text-[11px] font-semibold text-[#6b6b6b] mb-1.5 hover:text-[#c4c4c4] transition-colors uppercase tracking-wider">
                                Apps <ChevronRight className="h-3.5 w-3.5" />
                            </button>
                            <a href="#" className="flex items-center gap-2.5 px-2.5 py-[6px] text-[#c4c4c4] hover:bg-[#2c2c2c] hover:text-white rounded-lg font-medium text-[13px] transition-all">
                                <div className="w-[18px] h-[18px] flex items-center justify-center border border-[#4d4d4d] rounded-[4px]">
                                    <Plus className="h-3 w-3" />
                                </div>
                                Add
                            </a>
                        </div>
                    </div>

                    <div className="p-2 pb-3">
                        <a href="#" className="flex items-center gap-2.5 px-2.5 py-[6px] text-[#c4c4c4] hover:bg-[#2c2c2c] hover:text-white rounded-lg font-medium text-[13px] transition-all mb-3">
                            <Settings className="h-[18px] w-[18px]" strokeWidth={1.5} /> Settings
                        </a>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 ml-[220px] bg-[#f1f2f4] overflow-y-auto" style={{ borderRadius: '12px 0 0 0' }}>
                    <Outlet context={chatState} />

                    {/* ── Floating Chat ── */}
                    {!isHomePage && (
                        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
                            {isChatOpen && (
                                <div
                                    className="mb-4 w-[380px]"
                                    style={{
                                        animation: 'chatPopIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                        transformOrigin: 'bottom right',
                                    }}
                                >
                                    <AIChat
                                        {...chatState}
                                        isFloating={true}
                                        onClose={() => setIsChatOpen(false)}
                                    />
                                </div>
                            )}

                            <button
                                onClick={() => setIsChatOpen(!isChatOpen)}
                                className="w-14 h-14 bg-[#1a1a1a] text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform relative"
                                style={{ animation: 'chatPopIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
                            >
                                {isChatOpen
                                    ? <X className="w-5 h-5" />
                                    : <MessageSquare className="w-5 h-5" />
                                }
                                {messages.length > 0 && !isChatOpen && (
                                    <span className="absolute top-1 right-1 w-3 h-3 bg-[#a855f7] rounded-full border-2 border-[#f1f2f4]" />
                                )}
                            </button>
                        </div>
                    )}
                </main>
            </div>

            <style
                dangerouslySetInnerHTML={{
                    __html: `
                        .sidebar-scroll::-webkit-scrollbar { width: 6px; }
                        .sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
                        .sidebar-scroll::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
                        .sidebar-scroll::-webkit-scrollbar-thumb:hover { background: #444; }

                        @keyframes chatPopIn {
                            0% { opacity: 0; transform: scale(0.85) translateY(10px); }
                            100% { opacity: 1; transform: scale(1) translateY(0); }
                        }
                    `,
                }}
            />
        </div>
    );
}