import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    Search, Bell, Settings, Home, Inbox,
    Megaphone, Percent, TrendingUp,
    Package, Users, Store, Plus, ChevronRight,
    Globe, BookOpen,
} from 'lucide-react';
import secondaryLogo from '../assets/Secondary_logo.svg';
import MetallicPaint from '@/components/MetallicPaint';

const metallicProps = {
    seed: 42, scale: 2, patternSharpness: 0.2, noiseScale: 2.5,
    speed: 0.45, liquid: 0.25, mouseAnimation: false, brightness: 2.45,
    contrast: 0.52, refraction: 0.02, blur: 0.05, chromaticSpread: 1,
    fresnel: 1, angle: 1, waveAmplitude: 1, distortion: 1, contour: 0.2,
    lightColor: "#ffebab", darkColor: "#080808", tintColor: "#ffffff",
};

const navItems = [
    {
        icon: <Home className="h-[18px] w-[18px]" strokeWidth={1.5} />,
        label: 'Home', path: '/',
    },
    {
        icon: <Inbox className="h-[18px] w-[18px]" strokeWidth={1.5} />,
        label: 'Orders', path: '/orders',
        subItems: [
            { label: 'Drafts', path: '/orders/drafts' },
            { label: 'Abandoned checkouts', path: '/orders/abandoned' },
        ],
    },
    {
        icon: <Package className="h-[18px] w-[18px]" strokeWidth={1.5} />,
        label: 'Products', path: '/products',
        subItems: [
            { label: 'Collections', path: '/products/collections' },
            { label: 'Inventory', path: '/products/inventory' },
            { label: 'Purchase orders', path: '/products/purchase-orders' },
            { label: 'Transfers', path: '/products/transfers' },
            { label: 'Gift cards', path: '/products/gift-cards' },
        ],
    },
    {
        icon: <Users className="h-[18px] w-[18px]" strokeWidth={1.5} />,
        label: 'Customers', path: '/customers',
        subItems: [
            { label: 'Segments', path: '/customers/segments' },
            { label: 'Companies', path: '/customers/companies' },
        ],
    },
    {
        icon: <Megaphone className="h-[18px] w-[18px]" strokeWidth={1.5} />,
        label: 'Marketing', path: '/marketing',
        subItems: [
            { label: 'Campaigns', path: '/marketing/campaigns' },
            { label: 'Automations', path: '/marketing/automations' },
            { label: 'Attribution', path: '/marketing/attribution' },
        ],
    },
    {
        icon: <Percent className="h-[18px] w-[18px]" strokeWidth={1.5} />,
        label: 'Discounts', path: '/discounts',
    },
    {
        icon: <TrendingUp className="h-[18px] w-[18px]" strokeWidth={1.5} />,
        label: 'Analytics', path: '/analytics',
        subItems: [
            { label: 'Reports', path: '/analytics/reports' },
            { label: 'Live View', path: '/analytics/live-view' },
        ],
    },
    {
        icon: <Globe className="h-[18px] w-[18px]" strokeWidth={1.5} />,
        label: 'Markets', path: '/markets',
    },
    {
        icon: <BookOpen className="h-[18px] w-[18px]" strokeWidth={1.5} />,
        label: 'Catalogs', path: '/catalogs',
    },
];

export default function Layout() {
    const navigate = useNavigate();
    const location = useLocation();

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
                                    <li key={item.label} className="relative">
                                        <a
                                            href="#"
                                            onClick={(e) => { e.preventDefault(); navigate(item.path); }}
                                            className={`flex items-center gap-2.5 px-2.5 py-[6px] rounded-lg text-[13px] font-medium transition-all relative z-10
                        ${isMainActive
                                                    ? 'bg-white text-[#1a1a1a] shadow-sm'
                                                    : isExpanded
                                                        ? 'text-white'
                                                        : 'text-[#c4c4c4] hover:bg-[#2c2c2c] hover:text-white'
                                                }`}
                                        >
                                            {item.icon} {item.label}
                                        </a>

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
                                                            <li key={sub.label} className="relative group">
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

                        {/* Sales Channels */}
                        <div className="mt-6 px-2.5">
                            <button className="flex items-center justify-between w-full text-[11px] font-semibold text-[#6b6b6b] mb-1.5 hover:text-[#c4c4c4] transition-colors uppercase tracking-wider">
                                Sales channels <ChevronRight className="h-3.5 w-3.5" />
                            </button>
                            <a href="#" className="flex items-center gap-2.5 px-2.5 py-[6px] text-[#c4c4c4] hover:bg-[#2c2c2c] hover:text-white rounded-lg font-medium text-[13px] transition-all">
                                <Store className="h-[18px] w-[18px]" strokeWidth={1.5} /> Online Store
                            </a>
                        </div>

                        {/* Apps */}
                        <div className="mt-4 px-2.5">
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

                    {/* Settings */}
                    <div className="p-2 pb-3">
                        <a href="#" className="flex items-center gap-2.5 px-2.5 py-[6px] text-[#c4c4c4] hover:bg-[#2c2c2c] hover:text-white rounded-lg font-medium text-[13px] transition-all mb-3">
                            <Settings className="h-[18px] w-[18px]" strokeWidth={1.5} /> Settings
                        </a>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 ml-[220px] bg-[#f1f2f4] overflow-y-auto" style={{ borderRadius: '12px 0 0 0' }}>
                    <Outlet />
                </main>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
          .sidebar-scroll::-webkit-scrollbar { width: 6px; }
          .sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
          .sidebar-scroll::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
          .sidebar-scroll::-webkit-scrollbar-thumb:hover { background: #444; }
        `
            }} />
        </div>
    );
}