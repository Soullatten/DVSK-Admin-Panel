import React, { useRef, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useTexture, Html } from '@react-three/drei';
import * as THREE from 'three';
import { Search, Eye, LayoutGrid, Maximize2, Plus } from 'lucide-react';

// ─── 3D Text Label Component ──────────────────────────────────────────────────
function GlobeLabel({ position, text, isOcean = false }: { position: [number, number, number], text: string, isOcean?: boolean }) {
    return (
        <Html
            position={position}
            center
            // occlude allows labels on the back side of the earth to be hidden
            occlude
            style={{
                transition: 'all 0.2s',
                opacity: 1,
                transform: 'scale(1)',
            }}
        >
            <div
                className={`px-2 py-0.5 rounded-md backdrop-blur-sm text-[11px] font-medium tracking-widest uppercase cursor-default select-none whitespace-nowrap
        ${isOcean
                        ? 'text-[#0ea5e9] bg-white/20 border border-white/30'
                        : 'text-[#166534] bg-white/40 border border-white/50 shadow-sm'}`}
            >
                {text}
            </div>
        </Html>
    );
}

// ─── Realistic Interactive Earth (Daytime with Labels) ────────────────────────
function Earth() {
    const earthRef = useRef<THREE.Group>(null);

    // Load high-res textures
    const [colorMap, normalMap, cloudsMap] = useTexture([
        'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg',
        'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_normal_2048.jpg',
        'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_clouds_1024.png'
    ]);

    return (
        <group ref={earthRef}>
            {/* Base Earth Sphere */}
            <mesh>
                <sphereGeometry args={[2.2, 64, 64]} />
                <meshStandardMaterial
                    map={colorMap}
                    normalMap={normalMap}
                    roughness={0.7}
                    metalness={0.05}
                />
            </mesh>

            {/* Cloud Layer */}
            <mesh scale={[1.015, 1.015, 1.015]}>
                <sphereGeometry args={[2.2, 64, 64]} />
                <meshStandardMaterial
                    map={cloudsMap}
                    transparent={true}
                    opacity={0.6}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* ── Continent Labels ── */}
            <GlobeLabel position={[1.4, 1.4, 0.9]} text="Europe" />
            <GlobeLabel position={[0.5, 0.5, 2.1]} text="Africa" />
            <GlobeLabel position={[-0.5, 1.5, -1.6]} text="North America" />
            <GlobeLabel position={[-1.2, -0.6, -1.5]} text="South America" />
            <GlobeLabel position={[2.0, 0.8, -0.6]} text="Asia" />
            <GlobeLabel position={[2.0, -0.9, -0.2]} text="Australia" />
            <GlobeLabel position={[0, -2.2, 0]} text="Antarctica" />

            {/* ── Ocean Labels ── */}
            <GlobeLabel position={[-2.2, 0, -0.2]} text="Pacific Ocean" isOcean />
            <GlobeLabel position={[-0.8, 0.5, 2.0]} text="Atlantic Ocean" isOcean />
            <GlobeLabel position={[1.6, -0.5, 1.2]} text="Indian Ocean" isOcean />
            <GlobeLabel position={[0, 2.2, 0]} text="Arctic Ocean" isOcean />
        </group>
    );
}

function GlobeCanvas() {
    return (
        <Canvas
            camera={{ position: [0, 0, 5.5], fov: 45 }}
            style={{ width: '100%', height: '100%', background: 'transparent' }}
            gl={{ alpha: true, antialias: true }}
        >
            {/* Studio Lighting Setup for "Daytime" look on all sides */}
            <ambientLight intensity={1.8} />
            <directionalLight position={[10, 10, 5]} intensity={1.5} color="#ffffff" />
            <directionalLight position={[-10, -10, -5]} intensity={1.2} color="#f8fafc" />
            <directionalLight position={[0, 0, 10]} intensity={0.5} color="#ffffff" />

            <Suspense fallback={null}>
                <Earth />
            </Suspense>

            {/* OrbitControls allows dragging, rotating, and zooming */}
            <OrbitControls
                enableZoom={true}
                enablePan={false}
                autoRotate={true}
                autoRotateSpeed={0.8}
                minDistance={2.8}
                maxDistance={8}
            />
        </Canvas>
    );
}

// ─── Stat Cards ───────────────────────────────────────────────────────────────
function SparkFlat({ color = '#3b82f6' }: { color?: string }) {
    return (
        <svg viewBox="0 0 72 18" className="w-16 h-4 flex-shrink-0">
            <line x1="0" y1="14" x2="72" y2="14" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    );
}

function StatCard({ label, value, spark = false }: { label: string; value: string; spark?: boolean }) {
    return (
        <div className="bg-white rounded-xl border border-[#e8e8e8] shadow-sm p-4">
            <div className="text-[12px] text-[#5c5f62] font-medium mb-2">{label}</div>
            <div className="flex items-end justify-between gap-2">
                <div className="flex items-baseline gap-1.5">
                    <span className="text-[22px] font-bold text-[#1a1a1a] leading-none">{value}</span>
                    {spark && <span className="text-[13px] text-[#9ca3af]">—</span>}
                </div>
                {spark && <SparkFlat />}
            </div>
        </div>
    );
}

// ─── Empty Chart Card ─────────────────────────────────────────────────────────
function EmptyCard({ title }: { title: string }) {
    return (
        <div className="bg-white rounded-xl border border-[#e8e8e8] shadow-sm p-4">
            <div className="text-[13px] font-semibold text-[#1a1a1a] mb-4 border-b border-dashed border-[#d1d5db] pb-1 w-fit">
                {title}
            </div>
            <div className="flex items-center justify-center h-[120px] text-[13px] text-[#9ca3af]">
                No data for this date range
            </div>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function LiveView() {
    return (
        <div className="h-screen flex flex-col font-sans overflow-hidden" style={{ background: '#f1f2f4' }}>

            {/* ── Top bar ── */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-[#e8e8e8] bg-[#f1f2f4] flex-shrink-0 z-10">
                <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-[#1a1a1a]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M22 12h-4l-3 9L9 3l-3 9H2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <h1 className="text-[18px] font-bold text-[#1a1a1a]">Live View</h1>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
                        <span className="text-[12px] text-[#5c5f62]">Just now</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 bg-white border border-[#d1d5db] rounded-lg px-3 py-1.5 w-[230px] shadow-sm">
                        <Search className="w-3.5 h-3.5 text-[#9ca3af] flex-shrink-0" />
                        <input
                            placeholder="Search location"
                            className="flex-1 text-[13px] bg-transparent focus:outline-none placeholder-[#9ca3af]"
                        />
                    </div>
                    <button className="p-1.5 hover:bg-white hover:border-[#e3e3e3] border border-transparent rounded-md transition-colors text-[#5c5f62]">
                        <Eye className="w-5 h-5" />
                    </button>
                    <button className="p-1.5 hover:bg-white hover:border-[#e3e3e3] border border-transparent rounded-md transition-colors text-[#5c5f62]">
                        <LayoutGrid className="w-5 h-5" />
                    </button>
                    <button className="p-1.5 hover:bg-white hover:border-[#e3e3e3] border border-transparent rounded-md transition-colors text-[#5c5f62]">
                        <Maximize2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* ── Body ── */}
            <div className="flex flex-1 overflow-hidden">

                {/* ── Left panel ── */}
                <div className="flex-shrink-0 overflow-y-auto border-r border-[#e8e8e8] p-4 space-y-3 relative z-10 bg-[#f1f2f4]" style={{ width: '460px' }}>
                    <div className="grid grid-cols-2 gap-3">
                        <StatCard label="Visitors right now" value="0" />
                        <StatCard label="Total sales" value="₹0" spark />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <StatCard label="Sessions" value="0" spark />
                        <StatCard label="Orders" value="0" spark />
                    </div>
                    <div className="bg-white rounded-xl border border-[#e8e8e8] shadow-sm p-4">
                        <div className="text-[13px] font-semibold text-[#1a1a1a] mb-4">Customer behavior</div>
                        <div className="grid grid-cols-3 divide-x divide-[#f0f0f0]">
                            {[['Active carts', '0'], ['Checking out', '0'], ['Purchased', '0']].map(([label, val]) => (
                                <div key={label} className="px-3 first:pl-0 last:pr-0">
                                    <div className="text-[11px] text-[#5c5f62] mb-1.5 leading-snug">{label}</div>
                                    <div className="text-[22px] font-bold text-[#1a1a1a]">{val}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <EmptyCard title="Sessions by location" />
                    <EmptyCard title="New vs returning customers" />
                </div>

                {/* ── Right panel — Interactive Realistic Globe ── */}
                <div className="flex-1 relative overflow-hidden bg-transparent flex items-center justify-center cursor-move">

                    {/* Subtle soft glow behind the globe to separate it from the background */}
                    <div className="absolute w-[500px] h-[500px] bg-white rounded-full blur-[80px] opacity-40 pointer-events-none" />

                    <GlobeCanvas />

                    {/* Floating Action Buttons */}
                    <div className="absolute bottom-5 right-5 flex items-center gap-5 bg-white/70 backdrop-blur-md border border-[#e5e7eb] rounded-xl px-4 py-2.5 shadow-sm">
                        <div className="flex items-center gap-1.5 text-[12px] text-[#5c5f62]">
                            <div className="w-2.5 h-2.5 rounded-full bg-[#7c3aed]" /> Orders
                        </div>
                        <div className="flex items-center gap-1.5 text-[12px] text-[#5c5f62]">
                            <div className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]" /> Visitors right now
                        </div>
                    </div>

                    {/* Plus button */}
                    <button className="absolute bottom-5 left-1/2 -translate-x-1/2 w-8 h-8 bg-white border border-[#e3e3e3] rounded-full flex items-center justify-center shadow-md hover:bg-[#f5f5f5] transition-colors">
                        <Plus className="w-4 h-4 text-[#1a1a1a]" />
                    </button>

                    {/* Hint instruction */}
                    <div className="absolute top-5 right-5 text-[#9ca3af] text-[11px] font-medium tracking-wide pointer-events-none bg-white/50 px-2 py-1 rounded-md backdrop-blur-sm">
                        DRAG TO ROTATE • SCROLL TO ZOOM
                    </div>
                </div>
            </div>
        </div>
    );
}