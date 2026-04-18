import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Activity, Calendar, ChevronDown, BarChart2, Info, Store } from 'lucide-react';

const chartData = [
    { label: 'Mar 18', date: '2026-03-18T18:30:00.000Z', value: 0 },
    { label: 'Mar 19', date: '2026-03-19T18:30:00.000Z', value: 0 },
    { label: 'Mar 20', date: '2026-03-20T18:30:00.000Z', value: 0 },
    { label: 'Mar 21', date: '2026-03-21T18:30:00.000Z', value: 0 },
    { label: 'Mar 22', date: '2026-03-22T18:30:00.000Z', value: 0 },
    { label: 'Mar 23', date: '2026-03-23T18:30:00.000Z', value: 0 },
    { label: 'Mar 24', date: '2026-03-24T18:30:00.000Z', value: 0 },
    { label: 'Mar 25', date: '2026-03-25T18:30:00.000Z', value: 0 },
    { label: 'Mar 26', date: '2026-03-26T18:30:00.000Z', value: 0 },
    { label: 'Mar 27', date: '2026-03-27T18:30:00.000Z', value: 0 },
    { label: 'Mar 28', date: '2026-03-28T18:30:00.000Z', value: 0 },
    { label: 'Mar 29', date: '2026-03-29T18:30:00.000Z', value: 0 },
    { label: 'Mar 30', date: '2026-03-30T18:30:00.000Z', value: 0 },
    { label: 'Mar 31', date: '2026-03-31T18:30:00.000Z', value: 0 },
    { label: 'Apr 1', date: '2026-04-01T18:30:00.000Z', value: 0 },
    { label: 'Apr 2', date: '2026-04-02T18:30:00.000Z', value: 0 },
    { label: 'Apr 3', date: '2026-04-03T18:30:00.000Z', value: 0 },
    { label: 'Apr 4', date: '2026-04-04T18:30:00.000Z', value: 0 },
    { label: 'Apr 5', date: '2026-04-05T18:30:00.000Z', value: 0 },
    { label: 'Apr 6', date: '2026-04-06T18:30:00.000Z', value: 0 },
    { label: 'Apr 7', date: '2026-04-07T18:30:00.000Z', value: 0 },
    { label: 'Apr 8', date: '2026-04-08T18:30:00.000Z', value: 0 },
    { label: 'Apr 9', date: '2026-04-09T18:30:00.000Z', value: 0 },
    { label: 'Apr 10', date: '2026-04-10T18:30:00.000Z', value: 0 },
    { label: 'Apr 11', date: '2026-04-11T18:30:00.000Z', value: 0 },
    { label: 'Apr 12', date: '2026-04-12T18:30:00.000Z', value: 0 },
    { label: 'Apr 13', date: '2026-04-13T18:30:00.000Z', value: 0 },
    { label: 'Apr 14', date: '2026-04-14T18:30:00.000Z', value: 0.3 },
    { label: 'Apr 15', date: '2026-04-15T18:30:00.000Z', value: 2 },
    { label: 'Apr 16', date: '2026-04-16T18:30:00.000Z', value: 0.1 },
    { label: 'Apr 17', date: '2026-04-17T18:30:00.000Z', value: 0 },
];

const W = 1600;
const H = 380;
const VIEW_H = 392;
const PADDING_LEFT = 10;
const PADDING_RIGHT = 10;
const MAX_VAL = 2;
const xLabelIndices = [0, 4, 8, 12, 16, 20, 24, 28, 30];

function getX(index: number, total: number) {
    return PADDING_LEFT + (index / (total - 1)) * (W - PADDING_LEFT - PADDING_RIGHT);
}

function getY(value: number) {
    return H - (value / MAX_VAL) * H;
}

function buildSmoothPath(data: { value: number }[]) {
    const points = data.map((d, i) => ({
        x: getX(i, data.length),
        y: getY(d.value),
    }));

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
}

type HoverState = {
    visible: boolean;
    cursorX: number;
    cursorY: number;
    pointX: number;
    pointY: number;
    index: number;
};

export default function Attribution() {
    const [showBanner, setShowBanner] = useState(true);
    const chartRef = useRef<HTMLDivElement | null>(null);

    const points = useMemo(
        () =>
            chartData.map((d, i) => ({
                ...d,
                x: getX(i, chartData.length),
                y: getY(d.value),
            })),
        []
    );

    const linePath = useMemo(() => buildSmoothPath(chartData), []);

    const targetRef = useRef<HoverState>({
        visible: false,
        cursorX: 0,
        cursorY: 0,
        pointX: 0,
        pointY: 0,
        index: 0,
    });

    const [hover, setHover] = useState<HoverState>({
        visible: false,
        cursorX: 0,
        cursorY: 0,
        pointX: 0,
        pointY: 0,
        index: 0,
    });

    useEffect(() => {
        let raf = 0;

        const animate = () => {
            setHover((prev) => {
                const t = targetRef.current;
                const ease = 0.14;

                return {
                    visible: t.visible,
                    index: t.index,
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
        const index = Math.round(ratio * (chartData.length - 1));
        const p = points[index];

        targetRef.current = {
            visible: true,
            index,
            cursorX: localX,
            cursorY: localY,
            pointX: (p.x / W) * rect.width,
            pointY: (p.y / VIEW_H) * rect.height,
        };
    };

    const handleLeave = () => {
        targetRef.current.visible = false;
    };

    const activePoint = points[hover.index];
    const chartWidth = chartRef.current?.clientWidth ?? 1;
    const placeLeft = hover.cursorX > chartWidth * 0.75;

    return (
        <div className="min-h-full font-sans pb-10">
            <div className="w-full px-8 py-8 mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-2.5">
                        <Activity className="w-6 h-6 text-[#1a1a1a]" strokeWidth={2} />
                        <h1 className="text-[26px] font-bold text-[#1a1a1a] tracking-tight">Attribution</h1>
                        <button className="flex items-center gap-1 bg-[#f1f1f1] hover:bg-[#e5e5e5] px-3 py-1.5 rounded-md text-[14px] font-semibold text-[#1a1a1a] transition-colors ml-3 shadow-sm">
                            Channels <ChevronDown className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="bg-white border border-[#d1d5db] text-[#1a1a1a] text-[14px] font-semibold px-4 py-2 rounded-lg hover:bg-[#f7f7f7] shadow-sm transition-colors">
                            Print
                        </button>
                        <button className="bg-white border border-[#d1d5db] text-[#1a1a1a] text-[14px] font-semibold px-4 py-2 rounded-lg hover:bg-[#f7f7f7] shadow-sm transition-colors">
                            Export
                        </button>
                    </div>
                </div>

                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 bg-white border border-[#d1d5db] text-[#1a1a1a] text-[14px] font-semibold px-4 py-2 rounded-lg hover:bg-[#f7f7f7] shadow-sm transition-colors">
                            <Calendar className="w-4 h-4 text-[#5c5f62]" /> Last 30 days
                        </button>
                        <button className="flex items-center gap-1 bg-white border border-[#d1d5db] text-[#1a1a1a] text-[14px] font-semibold px-4 py-2 rounded-lg hover:bg-[#f7f7f7] shadow-sm transition-colors">
                            Daily <ChevronDown className="w-4 h-4" />
                        </button>
                    </div>

                    <button className="flex items-center gap-2 bg-white border border-[#d1d5db] text-[#1a1a1a] text-[14px] font-semibold px-4 py-2 rounded-lg hover:bg-[#f7f7f7] shadow-sm transition-colors">
                        <BarChart2 className="w-4 h-4 text-[#5c5f62]" /> Last non-direct click ▾
                    </button>
                </div>

                <div className="bg-white rounded-xl border border-[#e8e8e8] shadow-md p-8 mb-6">
                    <div className="flex items-center gap-1 mb-8">
                        <span className="text-[16px] font-semibold text-[#1a1a1a]">Sessions by top 5 channels over time</span>
                        <ChevronDown className="w-4 h-4 text-[#5c5f62]" />
                    </div>

                    <div className="flex gap-4 relative">
                        <div className="flex flex-col justify-between text-[13px] text-[#9ca3af] text-right w-8 pb-8 flex-shrink-0">
                            <span>2</span>
                            <span>1.5</span>
                            <span>1</span>
                            <span>0.5</span>
                            <span>0</span>
                        </div>

                        <div className="flex-1 relative">
                            <div
                                ref={chartRef}
                                className="relative w-full cursor-crosshair"
                                style={{ height: '420px' }}
                                onMouseMove={handleMove}
                                onMouseLeave={handleLeave}
                            >
                                <svg
                                    viewBox={`0 0 ${W} ${VIEW_H}`}
                                    className="w-full h-full overflow-visible"
                                    preserveAspectRatio="none"
                                >
                                    {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
                                        <line
                                            key={i}
                                            x1={PADDING_LEFT}
                                            y1={(t * H).toFixed(2)}
                                            x2={W - PADDING_RIGHT}
                                            y2={(t * H).toFixed(2)}
                                            stroke="#f0f0f0"
                                            strokeWidth="1.5"
                                        />
                                    ))}

                                    <defs>
                                        <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.22" />
                                            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                                        </linearGradient>
                                    </defs>

                                    <path
                                        d={`${linePath} L ${getX(chartData.length - 1, chartData.length).toFixed(2)} ${H} L ${getX(0, chartData.length).toFixed(2)} ${H} Z`}
                                        fill="url(#blueGradient)"
                                    />

                                    <path
                                        d={linePath}
                                        fill="none"
                                        stroke="#2ba5cc"
                                        strokeWidth="2.5"
                                        strokeLinecap="round"
                                    />
                                </svg>

                                {hover.visible && (
                                    <>
                                        <div
                                            className="absolute top-0 w-[1px] bg-[#d1d5db] pointer-events-none"
                                            style={{
                                                left: hover.pointX,
                                                height: hover.pointY,
                                                transform: 'translateX(-50%)',
                                            }}
                                        />

                                        <div
                                            className="absolute pointer-events-none"
                                            style={{
                                                left: hover.pointX,
                                                top: hover.pointY,
                                                transform: 'translate(-50%, -50%)',
                                            }}
                                        >
                                            <div className="w-[10px] h-[10px] rounded-full bg-[#2ba5cc] border-2 border-white shadow-sm" />
                                        </div>

                                        <div
                                            className="absolute pointer-events-none z-50"
                                            style={{
                                                left: hover.cursorX,
                                                top: hover.cursorY,
                                                transform: placeLeft
                                                    ? 'translate(calc(-100% - 18px), 12px)'
                                                    : 'translate(18px, 12px)',
                                            }}
                                        >
                                            <div className="bg-white border border-[#e5e7eb] rounded-lg shadow-[0_8px_24px_rgba(0,0,0,0.10)] min-w-[180px] overflow-hidden">
                                                <div className="px-3 py-3 flex items-center gap-2 text-[13px] text-[#4b5563]">
                                                    <span className="w-2.5 h-2.5 rounded-full bg-[#2ba5cc] block" />
                                                    <span>{activePoint.date}</span>
                                                </div>
                                                <div className="px-3 py-2 bg-[#f8fafc] border-t border-[#eef2f7]">
                                                    <span className="text-[14px] text-[#111827]">{activePoint.value}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="relative flex justify-between text-[13px] text-[#9ca3af] mt-2 px-[2px]">
                                {chartData
                                    .filter((_, i) => xLabelIndices.includes(i))
                                    .map((d) => (
                                        <span key={d.label}>{d.label}</span>
                                    ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center mt-8">
                        <div className="flex items-center gap-2 text-[14px] text-[#5c5f62] font-medium">
                            <div className="w-3 h-3 rounded-full bg-[#2ba5cc]" />
                            Direct
                        </div>
                    </div>
                </div>

                {showBanner && (
                    <div className="bg-[#eef6ff] border border-[#bfdbfe] rounded-xl p-4 flex items-center justify-between mb-6 shadow-sm">
                        <div className="flex items-center gap-3 text-[#1a1a1a] text-[14px]">
                            <div className="w-6 h-6 bg-[#dbeafe] rounded-full flex items-center justify-center flex-shrink-0">
                                <Info className="w-4 h-4 text-[#2563eb]" />
                            </div>
                            <span>
                                Cost, click, and impression metrics are now available for supported marketing apps.{' '}
                                <a href="#" className="underline font-semibold">Learn more</a>
                            </span>
                        </div>
                        <button onClick={() => setShowBanner(false)} className="text-[#9ca3af] hover:text-[#1a1a1a] ml-4">
                            ✕
                        </button>
                    </div>
                )}

                <div className="bg-white rounded-xl border border-[#e8e8e8] shadow-md overflow-hidden">
                    <div className="p-3 border-b border-[#f0f0f0] flex items-center justify-between">
                        <button className="p-2 hover:bg-[#f5f5f5] rounded-md border border-[#e3e3e3] transition-colors">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                            </svg>
                        </button>
                        <button className="p-2 hover:bg-[#f5f5f5] rounded-md border border-[#e3e3e3] transition-colors">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left whitespace-nowrap">
                            <thead>
                                <tr className="border-b border-[#e8e8e8] bg-[#fafafa]">
                                    {[
                                        'Channel',
                                        'Type',
                                        'Sessions ↓',
                                        'Sales',
                                        'Orders',
                                        'Conversion rate',
                                        'Cost',
                                        'ROAS',
                                        'CPA',
                                        'CTR',
                                        'AOV',
                                        'Orders from new customers',
                                        'Orders from returning customers',
                                    ].map((h) => (
                                        <th key={h} className="px-6 py-4 text-[13px] font-semibold text-[#5c5f62] tracking-wide">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-[#f5f5f5] hover:bg-[#f9fafb] transition-colors">
                                    <td className="px-6 py-4 text-[14px] font-semibold text-[#1a1a1a]">
                                        <div className="flex items-center gap-2">
                                            <Store className="w-4 h-4 text-[#5c5f62]" /> Direct
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-[14px] text-[#1a1a1a]">direct</td>
                                    <td className="px-6 py-4 text-[14px] text-[#1a1a1a]">2</td>
                                    <td className="px-6 py-4 text-[14px] text-[#1a1a1a]">₹0.00</td>
                                    <td className="px-6 py-4 text-[14px] text-[#1a1a1a]">0</td>
                                    <td className="px-6 py-4 text-[14px] text-[#1a1a1a]">0%</td>
                                    {['—', '—', '—', '—', '—'].map((v, i) => (
                                        <td key={i} className="px-6 py-4 text-[14px] text-[#9ca3af] text-center">
                                            {v}
                                        </td>
                                    ))}
                                    <td className="px-6 py-4 text-[14px] text-[#1a1a1a]">0</td>
                                    <td className="px-6 py-4 text-[14px] text-[#1a1a1a]">0</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}   