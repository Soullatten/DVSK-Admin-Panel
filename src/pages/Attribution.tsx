import React, { useEffect, useMemo, useRef, useState } from 'react';
import { 
  Activity, Calendar, ChevronDown, BarChart2, Info, Store, X, 
  Printer, Download, Filter, GitBranch, ArrowRightLeft, Route
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { Socket } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { orderService } from '../api/orderService';
import type { StatsPeriod } from '../api/orderService';
import { connectLiveFeed } from '../lib/liveSocket';

const W = 1600;
const H = 380;
const VIEW_H = 392;
const PADDING_LEFT = 10;
const PADDING_RIGHT = 10;

type HoverState = { visible: boolean; cursorX: number; cursorY: number; pointX: number; pointY: number; index: number; };
type MetricType = 'Sessions' | 'Sales' | 'Orders';

export default function Attribution() {
  // UI States
  const [showBanner, setShowBanner] = useState(true);
  const [activeTab, setActiveTab] = useState<'Overview' | 'Conversion Paths' | 'Model Comparison'>('Overview');
  const [activeMetric, setActiveMetric] = useState<MetricType>('Orders');

  // Dropdown States
  const [isDateDropOpen, setIsDateDropOpen] = useState(false);
  const [dateRange, setDateRange] = useState('Last 30 days');

  const [isModelDropOpen, setIsModelDropOpen] = useState(false);
  const [attrModel, setAttrModel] = useState('Last non-direct click');

  const [isMetricDropOpen, setIsMetricDropOpen] = useState(false);

  const chartRef = useRef<HTMLDivElement | null>(null);

  // 1. REAL DATA from /orders/admin/stats
  const [daily, setDaily] = useState<{ date: string; count: number; revenue: number }[]>([]);

  const fetchStats = async () => {
    try {
      const period: StatsPeriod =
        dateRange === 'Last 7 days' ? 'Last 7 days'
        : dateRange === 'Last 90 days' ? 'Last 90 days'
        : 'Last 30 days';
      const stats = await orderService.stats(period);
      setDaily(stats.daily ?? []);
    } catch (err) {
      console.error('[Attribution] failed to load stats', err);
    }
  };

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange]);

  useEffect(() => {
    let cancelled = false;
    let socket: Socket | null = null;
    (async () => {
      socket = await connectLiveFeed();
      if (cancelled) {
        socket.disconnect();
        return;
      }
      socket.on('order:placed', fetchStats);
    })();
    return () => {
      cancelled = true;
      socket?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange]);

  const dynamicChartData = useMemo(() => {
    return daily.map(d => ({
      label: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      date: d.date,
      value: activeMetric === 'Sales' ? d.revenue : d.count,
    }));
  }, [daily, activeMetric]);

  // 2. DYNAMIC SCALING & FORMATTING (auto-scale to data)
  const maxVal = useMemo(() => {
    const max = dynamicChartData.reduce((m, d) => Math.max(m, d.value), 0);
    return max > 0 ? max * 1.2 : 2;
  }, [dynamicChartData]);
  const formatValue = (val: number) => activeMetric === 'Sales' ? `₹${val.toLocaleString('en-IN', { maximumFractionDigits: 0 })}` : Math.round(val).toString();

  const getX = (index: number, total: number) => PADDING_LEFT + (index / (total - 1)) * (W - PADDING_LEFT - PADDING_RIGHT);
  const getY = (value: number) => H - (value / maxVal) * H;

  const points = useMemo(() => dynamicChartData.map((d: any, i: number) => ({
    ...d, x: getX(i, dynamicChartData.length), y: getY(d.value),
  })), [dynamicChartData]);

  const linePath = useMemo(() => {
    if (!points.length) return '';
    let path = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];
      const cp1x = current.x + (next.x - current.x) / 2;
      const cp1y = current.y;
      const cp2x = current.x + (next.x - current.x) / 2;
      const cp2y = next.y;
      path += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${next.x.toFixed(2)} ${next.y.toFixed(2)}`;
    }
    return path;
  }, [points]);

  const xLabelIndices = useMemo(() => {
    const step = Math.max(1, Math.floor(dynamicChartData.length / 6));
    return Array.from({ length: 7 }, (_, i) => Math.min(i * step, dynamicChartData.length - 1));
  }, [dynamicChartData.length]);

  // 3. HOVER LOGIC
  const targetRef = useRef<HoverState>({ visible: false, cursorX: 0, cursorY: 0, pointX: 0, pointY: 0, index: 0 });
  const [hover, setHover] = useState<HoverState>({ visible: false, cursorX: 0, cursorY: 0, pointX: 0, pointY: 0, index: 0 });

  useEffect(() => {
    let raf = 0;
    const animate = () => {
      setHover((prev) => {
        const t = targetRef.current;
        const ease = 0.14;
        return {
          visible: t.visible, index: t.index,
          cursorX: prev.cursorX + (t.cursorX - prev.cursorX) * ease,
          cursorY: prev.cursorY + (t.cursorY - prev.cursorY) * ease,
          pointX: prev.pointX + (t.pointX - prev.pointX) * ease,
          pointY: prev.pointY + (t.pointY - prev.pointY) * ease,
        };
      });
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, []);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!chartRef.current) return;
    const rect = chartRef.current.getBoundingClientRect();
    const localX = e.clientX - rect.left;
    const localY = e.clientY - rect.top;
    const ratio = Math.max(0, Math.min(1, localX / rect.width));
    const index = Math.round(ratio * (dynamicChartData.length - 1));
    const p = points[index];
    targetRef.current = {
      visible: true, index, cursorX: localX, cursorY: localY,
      pointX: (p.x / W) * rect.width, pointY: (p.y / VIEW_H) * rect.height,
    };
  };

  const handleLeave = () => { targetRef.current.visible = false; };

  const activePoint = points[hover.index];
  const chartWidth = chartRef.current?.clientWidth ?? 1;
  const placeLeft = hover.cursorX > chartWidth * 0.75;

  // Actions
  const handlePrint = () => { window.print(); };
  const handleExport = () => { toast.success('Attribution report exported to CSV!'); };

  // Click outside to close dropdowns
  useEffect(() => {
    const closeDrops = () => { setIsDateDropOpen(false); setIsModelDropOpen(false); setIsMetricDropOpen(false); };
    window.addEventListener('click', closeDrops);
    return () => window.removeEventListener('click', closeDrops);
  }, []);

  return (
    <div className="min-h-full font-sans pb-10 text-[#ececec]">
      <div className="w-full max-w-[1400px] px-6 lg:px-8 py-8 mx-auto">
        
        {/* ── HEADER ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <Activity className="w-5 h-5 text-purple-400" />
            </div>
            <div className="flex items-center">
              <h1 className="text-[24px] font-bold text-white tracking-tight">Attribution</h1>
              <button 
                onClick={(e) => { e.stopPropagation(); toast('Channel settings opened', { icon: '⚙️' }); }}
                className="flex items-center gap-2 bg-[#1a1a1a] hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-lg text-[13px] font-semibold text-white transition-colors ml-4 shadow-sm"
              >
                Channels <ChevronDown className="w-4 h-4 text-[#888]" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={handlePrint} className="flex items-center gap-2 bg-[#1a1a1a] border border-white/10 text-white text-[13px] font-semibold px-4 py-2 rounded-xl hover:bg-white/10 transition-colors">
              <Printer className="w-4 h-4" /> Print
            </button>
            <button onClick={handleExport} className="flex items-center gap-2 bg-[#1a1a1a] border border-white/10 text-white text-[13px] font-semibold px-4 py-2 rounded-xl hover:bg-white/10 transition-colors">
              <Download className="w-4 h-4" /> Export
            </button>
          </div>
        </div>

        {/* ── TABS NAVIGATION ── */}
        <div className="flex items-center gap-6 border-b border-white/10 mb-6">
          {(['Overview', 'Conversion Paths', 'Model Comparison'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-[14px] font-bold transition-all relative ${activeTab === tab ? 'text-purple-400' : 'text-[#888] hover:text-white'}`}
            >
              {tab}
              {activeTab === tab && (
                <motion.div layoutId="attrTab" className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.8)]" />
              )}
            </button>
          ))}
        </div>

        {/* ── GLOBAL FILTERS (Applies to all tabs) ── */}
        <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-3 relative">
            <div className="relative">
              <button 
                onClick={(e) => { e.stopPropagation(); setIsDateDropOpen(!isDateDropOpen); setIsModelDropOpen(false); }}
                className="flex items-center gap-2 bg-[#111] border border-white/10 text-white text-[13px] font-semibold px-4 py-2 rounded-xl hover:bg-[#1a1a1a] transition-colors"
              >
                <Calendar className="w-4 h-4 text-[#888]" /> {dateRange} <ChevronDown className="w-3 h-3 text-[#666]" />
              </button>
              {isDateDropOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-[#161616] border border-white/10 rounded-xl shadow-2xl z-50 py-2">
                  {['Last 7 days', 'Last 30 days', 'Last 90 days'].map(opt => (
                    <button key={opt} onClick={() => { setDateRange(opt); setIsDateDropOpen(false); }} className={`w-full text-left px-4 py-2 text-[13px] ${dateRange === opt ? 'text-purple-400 bg-purple-500/10' : 'text-white hover:bg-white/5'}`}>
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <button onClick={() => toast.success('Data grouped by Day')} className="flex items-center gap-1 bg-[#111] border border-white/10 text-white text-[13px] font-semibold px-4 py-2 rounded-xl hover:bg-[#1a1a1a] transition-colors">
              Daily <ChevronDown className="w-4 h-4 text-[#888]" />
            </button>
          </div>

          <div className="relative">
            <button 
              onClick={(e) => { e.stopPropagation(); setIsModelDropOpen(!isModelDropOpen); setIsDateDropOpen(false); }}
              className="flex items-center gap-2 bg-[#111] border border-white/10 text-white text-[13px] font-semibold px-4 py-2 rounded-xl hover:bg-[#1a1a1a] transition-colors"
            >
              <BarChart2 className="w-4 h-4 text-[#888]" /> {attrModel} <ChevronDown className="w-3 h-3 text-[#666]" />
            </button>
            {isModelDropOpen && (
              <div className="absolute top-full right-0 mt-2 w-56 bg-[#161616] border border-white/10 rounded-xl shadow-2xl z-50 py-2">
                {['Last non-direct click', 'First click', 'Last click', 'Linear'].map(opt => (
                  <button key={opt} onClick={() => { setAttrModel(opt); setIsModelDropOpen(false); }} className={`w-full text-left px-4 py-2 text-[13px] ${attrModel === opt ? 'text-purple-400 bg-purple-500/10' : 'text-white hover:bg-white/5'}`}>
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── TAB VIEWS ── */}
        <AnimatePresence mode="wait">
          
          {/* OVERVIEW TAB */}
          {activeTab === 'Overview' && (
            <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              
              {/* CHART CARD */}
              <div className="bg-[#111] rounded-2xl border border-white/10 shadow-2xl p-8 mb-6">
                
                {/* Metric Selector */}
                <div className="relative inline-block mb-8">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setIsMetricDropOpen(!isMetricDropOpen); }}
                    className="flex items-center gap-2 cursor-pointer group w-max"
                  >
                    <span className="text-[16px] font-bold text-white group-hover:text-purple-400 transition-colors">{activeMetric} by top 5 channels over time</span>
                    <ChevronDown className="w-4 h-4 text-[#666] group-hover:text-purple-400 transition-colors" />
                  </button>
                  {isMetricDropOpen && (
                    <div className="absolute top-full left-0 mt-2 w-48 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl z-50 p-2">
                      {(['Sessions', 'Sales', 'Orders'] as MetricType[]).map(m => (
                        <button key={m} onClick={() => { setActiveMetric(m); setIsMetricDropOpen(false); }} className={`w-full text-left px-4 py-2 text-[13px] font-bold rounded-lg ${activeMetric === m ? 'text-purple-400 bg-purple-500/10' : 'text-white hover:bg-white/10'}`}>
                          {m}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-4 relative">
                  {/* Y Axis Labels */}
                  <div className="flex flex-col justify-between text-[12px] font-medium text-[#666] text-right w-12 pb-8 flex-shrink-0">
                    <span>{formatValue(maxVal)}</span>
                    <span>{formatValue(maxVal * 0.75)}</span>
                    <span>{formatValue(maxVal * 0.5)}</span>
                    <span>{formatValue(maxVal * 0.25)}</span>
                    <span>{formatValue(0)}</span>
                  </div>

                  {/* Chart Area */}
                  <div className="flex-1 relative">
                    <div
                      ref={chartRef}
                      className="relative w-full cursor-crosshair"
                      style={{ height: '380px' }}
                      onMouseMove={handleMove}
                      onMouseLeave={handleLeave}
                    >
                      <svg viewBox={`0 0 ${W} ${VIEW_H}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
                        {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
                          <line key={i} x1={PADDING_LEFT} y1={(t * H).toFixed(2)} x2={W - PADDING_RIGHT} y2={(t * H).toFixed(2)} stroke="rgba(255,255,255,0.05)" strokeWidth="1.5" />
                        ))}
                        <defs>
                          <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#c084fc" stopOpacity="0.4" />
                            <stop offset="50%" stopColor="#a855f7" stopOpacity="0.1" />
                            <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        <path d={`${linePath} L ${getX(dynamicChartData.length - 1, dynamicChartData.length).toFixed(2)} ${H} L ${getX(0, dynamicChartData.length).toFixed(2)} ${H} Z`} fill="url(#purpleGradient)" />
                        <path d={linePath} fill="none" stroke="#c084fc" strokeWidth="3" strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 8px rgba(192, 132, 252, 0.7))' }} />
                      </svg>

                      {hover.visible && activePoint && (
                        <>
                          <div className="absolute top-0 w-px bg-purple-500/30 pointer-events-none" style={{ left: hover.pointX, height: hover.pointY, transform: 'translateX(-50%)' }} />
                          <div className="absolute pointer-events-none" style={{ left: hover.pointX, top: hover.pointY, transform: 'translate(-50%, -50%)' }}>
                            <div className="w-[12px] h-[12px] rounded-full bg-[#c084fc] border-[3px] border-[#111] shadow-[0_0_12px_rgba(192,132,252,0.9)]" />
                          </div>
                          <div className="absolute pointer-events-none z-50 transition-transform duration-75" style={{ left: hover.cursorX, top: hover.cursorY, transform: placeLeft ? 'translate(calc(-100% - 20px), -50%)' : 'translate(20px, -50%)' }}>
                            <div className="bg-[#161616] border border-white/10 rounded-xl shadow-2xl overflow-hidden min-w-[160px]">
                              <div className="px-4 py-3 flex items-center gap-2 text-[12px] text-[#aaa] font-medium bg-[#1a1a1a] border-b border-white/5">
                                <span className="w-2 h-2 rounded-full bg-[#c084fc] shadow-[0_0_5px_rgba(192,132,252,0.8)] block" />
                                <span>{new Date(activePoint.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                              </div>
                              <div className="px-4 py-3">
                                <span className="text-[18px] font-bold text-white">{formatValue(activePoint.value)} <span className="text-[12px] text-[#666] font-normal ml-1">{activeMetric}</span></span>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="relative flex justify-between text-[12px] font-medium text-[#666] mt-4 px-[2px]">
                      {dynamicChartData.filter((_, i) => xLabelIndices.includes(i)).map((d: any, i) => (
                        <span key={i}>{d.label}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-center mt-8">
                  <div className="flex items-center gap-2 text-[13px] text-[#888] font-bold uppercase tracking-wider bg-[#1a1a1a] px-4 py-2 rounded-lg border border-white/5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#c084fc] shadow-[0_0_8px_rgba(192,132,252,0.8)]" />
                    Direct
                  </div>
                </div>
              </div>

              {/* INFO BANNER */}
              {showBanner && (
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-4 flex items-center justify-between mb-6 shadow-lg">
                  <div className="flex items-center gap-4 text-purple-100 text-[13px] font-medium">
                    <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Info className="w-4 h-4 text-purple-400" />
                    </div>
                    <span>Cost, click, and impression metrics are now available. <button className="underline font-bold text-purple-300 hover:text-purple-200">Learn more</button></span>
                  </div>
                  <button onClick={() => setShowBanner(false)} className="text-purple-400/50 hover:text-purple-300 ml-4 p-2 rounded-lg hover:bg-purple-500/10 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* DATA TABLE */}
              <div className="bg-[#111] rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
                <div className="p-4 border-b border-white/10 flex items-center justify-end gap-2 bg-[#161616]">
                  <button onClick={() => toast.success('Filters opened')} className="p-2 hover:bg-white/10 rounded-lg border border-white/10 transition-colors text-[#888] hover:text-white">
                    <Filter className="w-4 h-4" />
                  </button>
                </div>
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left whitespace-nowrap">
                    <thead>
                      <tr className="border-b border-white/10 bg-[#161616]">
                        {['Channel', 'Type', `${activeMetric} ↓`, 'Sales', 'Orders', 'Conversion rate', 'Cost', 'ROAS', 'CPA', 'CTR'].map((h) => (
                          <th key={h} className="px-6 py-4 text-[12px] font-bold text-[#888] uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                        <td className="px-6 py-4 text-[14px] font-bold text-white flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                            <Store className="w-4 h-4 text-purple-400" />
                          </div>
                          Direct
                        </td>
                        <td className="px-6 py-4 text-[13px] font-medium text-[#aaa]">direct</td>
                        <td className="px-6 py-4 text-[13px] font-bold text-white">0</td>
                        <td className="px-6 py-4 text-[13px] font-medium text-[#aaa]">₹0.00</td>
                        <td className="px-6 py-4 text-[13px] font-medium text-[#aaa]">0</td>
                        <td className="px-6 py-4 text-[13px] font-medium text-[#aaa]">0%</td>
                        {['—', '—', '—', '—'].map((v, i) => <td key={i} className="px-6 py-4 text-[13px] text-[#666] text-center">{v}</td>)}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* CONVERSION PATHS TAB */}
          {activeTab === 'Conversion Paths' && (
            <motion.div key="paths" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-[#111] rounded-2xl border border-white/10 shadow-2xl p-12 text-center flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-6">
                <Route className="w-8 h-8 text-purple-400" />
              </div>
              <h2 className="text-[20px] font-bold text-white mb-2">No conversion paths found</h2>
              <p className="text-[14px] text-[#888] max-w-md mx-auto mb-8">We haven't tracked any multi-touch conversion journeys in the selected date range ({dateRange}). As sales increase, you'll see the exact paths customers take before buying.</p>
              <button onClick={() => toast.success('Scanning for new data...')} className="bg-[#1a1a1a] hover:bg-white/10 border border-white/10 px-6 py-3 rounded-xl text-[14px] font-bold text-white transition-colors">
                Refresh Data
              </button>
            </motion.div>
          )}

          {/* MODEL COMPARISON TAB */}
          {activeTab === 'Model Comparison' && (
            <motion.div key="models" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-[#111] rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
              <div className="p-6 border-b border-white/10 bg-[#161616] flex items-center justify-between">
                <div>
                  <h2 className="text-[16px] font-bold text-white">Model Comparison</h2>
                  <p className="text-[13px] text-[#888] mt-1">Compare how different attribution models credit your channels.</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 bg-[#1a1a1a] px-3 py-1.5 rounded-lg border border-white/5"><div className="w-2 h-2 rounded-full bg-purple-400"/> <span className="text-[12px] font-bold text-white">{attrModel}</span></div>
                  <ArrowRightLeft className="w-4 h-4 text-[#666]" />
                  <div className="flex items-center gap-2 bg-[#1a1a1a] px-3 py-1.5 rounded-lg border border-white/5"><div className="w-2 h-2 rounded-full bg-blue-400"/> <span className="text-[12px] font-bold text-white">First click</span></div>
                </div>
              </div>
              <div className="p-12 text-center flex flex-col items-center">
                 <div className="w-16 h-16 rounded-full bg-[#1a1a1a] border border-white/5 flex items-center justify-center mb-6">
                  <GitBranch className="w-8 h-8 text-[#666]" />
                </div>
                <h3 className="text-[16px] font-bold text-white mb-2">Not enough data to compare</h3>
                <p className="text-[13px] text-[#888]">Drive more traffic and sales to see how First Click compares to {attrModel}.</p>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}} />
    </div>
  );
}