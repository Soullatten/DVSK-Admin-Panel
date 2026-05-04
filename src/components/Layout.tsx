import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    Search, Bell, Settings, Home, Inbox,
    Megaphone, Percent, TrendingUp,
    Package, Users, Store, Plus,
    Globe, BookOpen, MessageSquare, X, Eye, MessageCircle, Sparkles,
    LogIn, LogOut, ChevronDown, ShoppingBag, AlertCircle, CornerDownLeft
} from 'lucide-react';
import type { Socket } from 'socket.io-client';
import { connectLiveFeed } from '../lib/liveSocket';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import secondaryLogo from '../assets/Secondary_logo.svg';
import MetallicPaint from '@/components/MetallicPaint';
import AIChat, { type Message } from './AIChat';
import { auth } from '../lib/firebase';
import { clearAuthToken } from '../api/client';
import toast from 'react-hot-toast';

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

    const [authUser, setAuthUser] = useState<{ name?: string | null; email?: string | null } | null>(null);
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);

    // ── Search ──
    const [searchQuery, setSearchQuery] = useState('');
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchActiveIdx, setSearchActiveIdx] = useState(0);
    const searchRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const SEARCH_TARGETS = [
        { label: 'Home', path: '/', section: 'Page' },
        { label: 'Orders', path: '/orders', section: 'Page' },
        { label: 'Drafts', path: '/orders/drafts', section: 'Page' },
        { label: 'Abandoned Checkouts', path: '/orders/abandoned', section: 'Page' },
        { label: 'Products', path: '/products', section: 'Page' },
        { label: 'Collections', path: '/products/collections', section: 'Page' },
        { label: 'Inventory', path: '/products/inventory', section: 'Page' },
        { label: 'Purchase Orders', path: '/products/purchase-orders', section: 'Page' },
        { label: 'Transfers', path: '/products/transfers', section: 'Page' },
        { label: 'Gift Cards', path: '/products/gift-cards', section: 'Page' },
        { label: 'Customers', path: '/customers', section: 'Page' },
        { label: 'Segments', path: '/customers/segments', section: 'Page' },
        { label: 'Companies', path: '/customers/companies', section: 'Page' },
        { label: 'Marketing', path: '/marketing', section: 'Page' },
        { label: 'Campaigns', path: '/marketing/campaigns', section: 'Page' },
        { label: 'Automations', path: '/marketing/automations', section: 'Page' },
        { label: 'Attribution', path: '/marketing/attribution', section: 'Page' },
        { label: 'Discounts', path: '/discounts', section: 'Page' },
        { label: 'Markets', path: '/markets', section: 'Page' },
        { label: 'Catalogs', path: '/catalogs', section: 'Page' },
        { label: 'Analytics', path: '/analytics', section: 'Page' },
        { label: 'Reports', path: '/analytics/reports', section: 'Page' },
        { label: 'Live View', path: '/analytics/live-view', section: 'Page' },
        { label: 'Online Store', path: '/online-store', section: 'Page' },
    ];

    const searchResults = React.useMemo(() => {
        if (!searchQuery.trim()) return [];
        const q = searchQuery.toLowerCase();
        return SEARCH_TARGETS
            .filter((t) => t.label.toLowerCase().includes(q) || t.path.toLowerCase().includes(q))
            .slice(0, 8);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery]);

    const goToSearchResult = (path: string) => {
        navigate(path);
        setSearchOpen(false);
        setSearchQuery('');
    };

    // ── Notifications ──
    type Notification = {
        id: string;
        type: 'order' | 'inventory' | 'system';
        title: string;
        body: string;
        ts: number;
        read: boolean;
        link?: string;
    };

    const [notifications, setNotifications] = useState<Notification[]>(() => {
        try {
            const stored = localStorage.getItem('dvsk_notifications');
            if (stored) return JSON.parse(stored);
        } catch {}
        return [];
    });
    const [bellOpen, setBellOpen] = useState(false);
    const bellRef = useRef<HTMLDivElement>(null);
    const unreadCount = notifications.filter((n) => !n.read).length;

    const persistNotifications = (list: Notification[]) => {
        try {
            localStorage.setItem('dvsk_notifications', JSON.stringify(list.slice(0, 50)));
        } catch {}
    };

    const pushNotification = (n: Omit<Notification, 'id' | 'read'>) => {
        const note: Notification = {
            ...n,
            id: `${n.ts}_${Math.random().toString(36).slice(2, 8)}`,
            read: false,
        };
        setNotifications((prev) => {
            const next = [note, ...prev].slice(0, 50);
            persistNotifications(next);
            return next;
        });
    };

    const markAllRead = () => {
        setNotifications((prev) => {
            const next = prev.map((n) => ({ ...n, read: true }));
            persistNotifications(next);
            return next;
        });
    };

    const clearAllNotifications = () => {
        setNotifications([]);
        persistNotifications([]);
    };

    const handleNotificationClick = (id: string, link?: string) => {
        setNotifications((prev) => {
            const next = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
            persistNotifications(next);
            return next;
        });
        if (link) navigate(link);
        setBellOpen(false);
    };

    const formatTimeAgo = (ts: number): string => {
        const sec = Math.floor((Date.now() - ts) / 1000);
        if (sec < 60) return 'just now';
        const m = Math.floor(sec / 60);
        if (m < 60) return `${m}m ago`;
        const h = Math.floor(m / 60);
        if (h < 24) return `${h}h ago`;
        return `${Math.floor(h / 24)}d ago`;
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setAuthUser({ name: user.displayName || user.email?.split('@')[0], email: user.email });
            } else {
                setAuthUser(null);
            }
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const onClick = (e: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
                setProfileMenuOpen(false);
            }
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setSearchOpen(false);
            }
            if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
                setBellOpen(false);
            }
        };
        document.addEventListener('mousedown', onClick);
        return () => document.removeEventListener('mousedown', onClick);
    }, []);

    // Cmd/Ctrl + K to focus search
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                searchInputRef.current?.focus();
                setSearchOpen(true);
            }
            if (e.key === 'Escape') {
                setSearchOpen(false);
                setBellOpen(false);
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    // Subscribe to socket events for notifications
    useEffect(() => {
        if (!authUser) return;
        let cancelled = false;
        let socket: Socket | null = null;
        (async () => {
            socket = await connectLiveFeed();
            if (cancelled) {
                socket.disconnect();
                return;
            }
            socket.on('order:placed', (d: any) => {
                pushNotification({
                    type: 'order',
                    title: `New order ${d.id || ''}`.trim(),
                    body: `${d.amount || ''}${d.city ? ' from ' + d.city : ''}`.trim(),
                    ts: d.ts || Date.now(),
                    link: '/orders',
                });
                toast.success(`New order: ${d.amount || ''}${d.city ? ' · ' + d.city : ''}`, { icon: '📦' });
            });
            socket.on('inventory:low', (d: any) => {
                pushNotification({
                    type: 'inventory',
                    title: 'Stock running low',
                    body: `${d.productName || d.sku || 'Item'} — ${d.stock ?? '?'} left`,
                    ts: d.ts || Date.now(),
                    link: '/products/inventory',
                });
            });
        })();
        return () => {
            cancelled = true;
            socket?.disconnect();
        };
    }, [authUser]);

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            clearAuthToken();
            localStorage.removeItem('adminAuth');
            toast.success('Signed out');
            navigate('/login', { replace: true });
        } catch (err: any) {
            toast.error(err?.message || 'Sign out failed');
        }
    };

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

                <div ref={searchRef} className="flex-1 max-w-[580px] mx-4 relative group">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none transition-colors group-focus-within:text-white text-[#6b6b6b] z-10">
                        <Search className="h-4 w-4" />
                    </div>
                    <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Search pages — try 'orders' or 'inventory'..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setSearchOpen(true);
                            setSearchActiveIdx(0);
                        }}
                        onFocus={() => setSearchOpen(searchQuery.length > 0)}
                        onKeyDown={(e) => {
                            if (e.key === 'ArrowDown') {
                                e.preventDefault();
                                setSearchActiveIdx((i) => Math.min(i + 1, Math.max(0, searchResults.length - 1)));
                            } else if (e.key === 'ArrowUp') {
                                e.preventDefault();
                                setSearchActiveIdx((i) => Math.max(0, i - 1));
                            } else if (e.key === 'Enter') {
                                e.preventDefault();
                                const target = searchResults[searchActiveIdx];
                                if (target) goToSearchResult(target.path);
                            }
                        }}
                        className="w-full bg-[#1a1a1a] hover:bg-[#222222] text-[#e3e3e3] placeholder-[#6b6b6b] text-[14px] rounded-xl pl-10 pr-16 py-2 border border-white/5 hover:border-white/10 focus:border-purple-500/50 focus:bg-[#1a1a1a] focus:ring-4 focus:ring-purple-500/10 focus:outline-none transition-all duration-200"
                    />
                    <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none gap-1">
                        <span className="text-[10px] font-semibold bg-[#2a2a2a] border border-white/10 rounded px-1.5 py-0.5 text-[#888]">⌘</span>
                        <span className="text-[10px] font-semibold bg-[#2a2a2a] border border-white/10 rounded px-1.5 py-0.5 text-[#888]">K</span>
                    </div>

                    {searchOpen && searchResults.length > 0 && (
                        <div className="absolute left-0 right-0 top-[calc(100%+6px)] bg-[#0f0f0f] border border-white/10 rounded-xl shadow-2xl py-1.5 z-50 overflow-hidden">
                            <div className="px-3 py-1.5 text-[10px] font-bold text-[#666] uppercase tracking-widest">
                                {searchResults.length} {searchResults.length === 1 ? 'result' : 'results'}
                            </div>
                            {searchResults.map((r, i) => (
                                <button
                                    key={r.path}
                                    onMouseEnter={() => setSearchActiveIdx(i)}
                                    onClick={() => goToSearchResult(r.path)}
                                    className={`w-full flex items-center justify-between px-3 py-2.5 text-left transition-colors ${i === searchActiveIdx ? 'bg-purple-500/10' : 'hover:bg-white/5'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded-md bg-white/5 border border-white/10 flex items-center justify-center text-[#888]">
                                            <Search className="h-3 w-3" />
                                        </div>
                                        <div className="flex flex-col leading-tight">
                                            <span className="text-[13px] font-semibold text-white">{r.label}</span>
                                            <span className="text-[11px] text-[#666] font-mono">{r.path}</span>
                                        </div>
                                    </div>
                                    {i === searchActiveIdx && <CornerDownLeft className="h-3.5 w-3.5 text-purple-400" />}
                                </button>
                            ))}
                        </div>
                    )}
                    {searchOpen && searchQuery.trim() && searchResults.length === 0 && (
                        <div className="absolute left-0 right-0 top-[calc(100%+6px)] bg-[#0f0f0f] border border-white/10 rounded-xl shadow-2xl py-6 px-4 z-50 text-center text-[13px] text-[#666]">
                            No matches for <span className="text-white font-mono">"{searchQuery}"</span>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    {authUser && (
                        <div ref={bellRef} className="relative">
                            <button
                                onClick={() => { setBellOpen((v) => !v); }}
                                className="p-2 hover:bg-white/5 rounded-xl transition-colors relative group"
                            >
                                <Bell className="h-5 w-5 text-[#888] group-hover:text-white transition-colors" strokeWidth={1.5} />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-purple-500 rounded-full border-2 border-[#111111] text-[10px] font-bold text-white flex items-center justify-center leading-none">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </button>
                            {bellOpen && (
                                <div className="absolute right-0 top-[calc(100%+6px)] bg-[#0f0f0f] border border-white/10 rounded-xl shadow-2xl w-[360px] max-h-[480px] flex flex-col z-50 overflow-hidden">
                                    <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between bg-[#111]">
                                        <div className="flex items-center gap-2">
                                            <Bell className="h-3.5 w-3.5 text-purple-400" />
                                            <span className="text-[13px] font-bold text-white">Notifications</span>
                                            {unreadCount > 0 && (
                                                <span className="bg-purple-500/20 text-purple-300 text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                                                    {unreadCount} new
                                                </span>
                                            )}
                                        </div>
                                        {notifications.length > 0 && (
                                            <button
                                                onClick={markAllRead}
                                                className="text-[11px] text-[#888] hover:text-white transition-colors font-medium"
                                            >
                                                Mark all read
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                                        {notifications.length === 0 ? (
                                            <div className="py-12 flex flex-col items-center justify-center text-center px-6">
                                                <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-3">
                                                    <Bell className="h-5 w-5 text-[#555]" />
                                                </div>
                                                <p className="text-[13px] font-semibold text-[#888]">No notifications yet</p>
                                                <p className="text-[11px] text-[#555] mt-1">New orders and stock alerts will appear here.</p>
                                            </div>
                                        ) : (
                                            <div className="divide-y divide-white/5">
                                                {notifications.map((n) => {
                                                    const Icon = n.type === 'order' ? ShoppingBag : n.type === 'inventory' ? AlertCircle : Sparkles;
                                                    const tint =
                                                        n.type === 'order' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' :
                                                        n.type === 'inventory' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' :
                                                        'text-purple-400 bg-purple-500/10 border-purple-500/20';
                                                    return (
                                                        <button
                                                            key={n.id}
                                                            onClick={() => handleNotificationClick(n.id, n.link)}
                                                            className={`w-full text-left px-4 py-3 hover:bg-white/[0.03] transition-colors group flex items-start gap-3 ${!n.read ? 'bg-purple-500/[0.04]' : ''}`}
                                                        >
                                                            <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${tint}`}>
                                                                <Icon className="h-4 w-4" strokeWidth={1.8} />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-start justify-between gap-2">
                                                                    <span className="text-[13px] font-semibold text-white truncate">{n.title}</span>
                                                                    {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0" />}
                                                                </div>
                                                                {n.body && (
                                                                    <p className="text-[12px] text-[#aaa] mt-0.5 truncate">{n.body}</p>
                                                                )}
                                                                <p className="text-[10px] text-[#666] mt-1">{formatTimeAgo(n.ts)}</p>
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                    {notifications.length > 0 && (
                                        <div className="border-t border-white/5 px-3 py-2 bg-[#0a0a0a]">
                                            <button
                                                onClick={clearAllNotifications}
                                                className="w-full text-[11px] text-[#666] hover:text-red-400 transition-colors py-1.5 font-medium"
                                            >
                                                Clear all
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {authUser ? (
                        <div ref={profileRef} className="relative ml-1">
                            <button
                                onClick={() => setProfileMenuOpen((v) => !v)}
                                className="flex items-center gap-2.5 cursor-pointer hover:bg-white/5 pl-2 pr-3 py-1.5 rounded-xl border border-transparent hover:border-white/5 transition-all"
                            >
                                <div className="w-8 h-8 flex-shrink-0 rounded-full overflow-hidden border border-white/10">
                                    <MetallicPaint imageSrc={secondaryLogo} {...metallicProps} />
                                </div>
                                <div className="flex flex-col text-left">
                                    <span className="text-[#e3e3e3] text-[13px] font-semibold leading-tight">DVSK Admin</span>
                                    <span className="text-[#6b6b6b] text-[11px] font-medium leading-tight">Pro Plan</span>
                                </div>
                                <ChevronDown className={`h-3.5 w-3.5 text-[#666] transition-transform ${profileMenuOpen ? 'rotate-180' : ''}`} strokeWidth={2} />
                            </button>
                            {profileMenuOpen && (
                                <div className="absolute right-0 top-[calc(100%+6px)] bg-[#111111] border border-white/10 rounded-xl shadow-2xl py-1.5 w-[220px] overflow-hidden z-50">
                                    <div className="px-3 py-2 border-b border-white/5">
                                        <div className="text-[12px] font-semibold text-white truncate">{authUser.name || 'Admin'}</div>
                                        {authUser.email && <div className="text-[11px] text-[#888] truncate">{authUser.email}</div>}
                                    </div>
                                    <button
                                        onClick={handleSignOut}
                                        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[13px] font-medium text-[#ececec] hover:bg-red-500/10 hover:text-red-400 transition-colors"
                                    >
                                        <LogOut className="h-4 w-4" strokeWidth={1.5} />
                                        Sign out
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <button
                            onClick={() => navigate('/login')}
                            className="flex items-center gap-2 cursor-pointer bg-purple-600 hover:bg-purple-500 text-white pl-3 pr-4 py-2 rounded-xl text-[13px] font-semibold shadow-[0_0_15px_rgba(168,85,247,0.25)] transition-colors ml-1"
                        >
                            <LogIn className="h-4 w-4" strokeWidth={2} />
                            Login
                        </button>
                    )}
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