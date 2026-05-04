import React, { useState, useRef, useEffect } from 'react';
import { 
  Workflow, 
  Search, 
  Plus, 
  X, 
  Mail, 
  Clock, 
  ShoppingCart, 
  Users2, 
  Zap,
  Save,
  MousePointer2,
  GitBranch,
  Move,
  ArrowLeft,
  Smartphone,
  Split,
  Globe,
  Settings2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { automationsApi } from '../api/marketingService';
import { useAdminDataRefresh } from '../lib/useAdminDataRefresh';

// ── Types ──
type FlowStatus = 'Active' | 'Draft' | 'Paused';
type NodeType = 'trigger' | 'email' | 'sms' | 'delay' | 'condition' | 'ab_test' | 'webhook';

interface NodePosition { x: number; y: number }

interface AutomationStep {
  id: string;
  type: NodeType;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  position: NodePosition;
}

interface Automation {
  id: string;
  name: string;
  description: string;
  status: FlowStatus;
  metrics: { sent: number; clicked: string; revenue: string };
  steps: AutomationStep[];
  icon: React.ReactNode;
  color: string;
}

const FLOW_STATUS_FROM_API: Record<string, FlowStatus> = {
  ACTIVE: 'Active', PAUSED: 'Paused', DRAFT: 'Draft',
};
const FLOW_STATUS_TO_API: Record<FlowStatus, string> = {
  Active: 'ACTIVE', Paused: 'PAUSED', Draft: 'DRAFT',
};

const apiToAutomation = (a: any): Automation => ({
  id: a.id,
  name: a.name,
  description: a.description || '',
  status: FLOW_STATUS_FROM_API[a.status] ?? 'Draft',
  metrics: {
    sent: a.metricsSent || 0,
    clicked: `${a.metricsClicked || 0}%`,
    revenue: `₹${Number(a.metricsRevenue || 0).toLocaleString('en-IN')}`,
  },
  icon: <Workflow className="w-5 h-5 text-purple-400" />,
  color: 'bg-purple-500/10 border-purple-500/20',
  steps: Array.isArray(a.steps) ? a.steps : [],
});

const stripIcons = (steps: AutomationStep[]) =>
  steps.map(s => ({ ...s, icon: undefined }));

export default function Automations() {
  const [automations, setAutomations] = useState<Automation[]>([]);

  const refresh = async () => {
    try {
      const list = await automationsApi.list();
      setAutomations(list.map(apiToAutomation));
    } catch (err) {
      console.error('[Automations] failed to load', err);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  useAdminDataRefresh('automations', refresh);
  const [searchQuery, setSearchQuery] = useState('');

  // Canvas Builder State
  const [isCanvasOpen, setIsCanvasOpen] = useState(false);
  const [editingFlow, setEditingFlow] = useState<Automation | null>(null);

  // Drag & Drop State
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  // ── Handlers ──

  const toggleFlowStatus = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const current = automations.find(a => a.id === id);
    if (!current) return;
    const next: FlowStatus = current.status === 'Active' ? 'Paused' : 'Active';
    try {
      const updated = await automationsApi.update(id, { status: FLOW_STATUS_TO_API[next] });
      const view = apiToAutomation(updated);
      setAutomations(prev => prev.map(a => (a.id === id ? view : a)));
      toast.success(`Workflow "${view.name}" is now ${view.status}.`);
    } catch {
      toast.error('Failed to update status');
    }
  };

  const deleteFlow = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await automationsApi.remove(id);
      setAutomations(prev => prev.filter(a => a.id !== id));
      toast.success('Automation deleted.');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const openNewCanvas = () => {
    setEditingFlow({
      id: `FLOW-${Math.floor(Math.random() * 900) + 100}`,
      name: 'Untitled Automation',
      description: 'Custom workflow built from scratch.',
      status: 'Draft',
      metrics: { sent: 0, clicked: '0%', revenue: '$0' },
      icon: <Workflow className="w-5 h-5 text-purple-400" />,
      color: 'bg-purple-500/10 border-purple-500/20',
      steps: []
    });
    setPanOffset({ x: 0, y: 0 });
    setIsCanvasOpen(true);
  };

  const openExistingCanvas = (flow: Automation) => {
    setEditingFlow({ ...flow });
    setPanOffset({ x: 0, y: 0 });
    setIsCanvasOpen(true);
  };

  const handleGoBack = () => {
    setIsCanvasOpen(false);
    setEditingFlow(null);
  };

  const handleSaveCanvas = async () => {
    if (!editingFlow) return;
    if (editingFlow.steps.length === 0) return toast.error("Cannot save an empty workflow. Add nodes.");

    if (!editingFlow.name || editingFlow.name === 'Untitled Automation') {
      editingFlow.name = "Custom Workflow";
    }

    const exists = automations.find(a => a.id === editingFlow.id);
    const payload = {
      name: editingFlow.name,
      description: editingFlow.description,
      status: FLOW_STATUS_TO_API[editingFlow.status],
      steps: stripIcons(editingFlow.steps),
    };
    try {
      if (exists) {
        const updated = await automationsApi.update(editingFlow.id, payload);
        setAutomations(prev => prev.map(a => (a.id === editingFlow.id ? apiToAutomation(updated) : a)));
      } else {
        const created = await automationsApi.create(payload);
        setAutomations(prev => [apiToAutomation(created), ...prev]);
      }
      toast.success("Workflow saved successfully!");
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || 'Failed to save');
      return;
    }
    setIsCanvasOpen(false);
    setEditingFlow(null);
  };

  // Add node to center of current view
  const addStepToCanvas = (type: NodeType) => {
    if (!editingFlow) return;

    const centerX = 200 - panOffset.x;
    const centerY = (editingFlow.steps.length * 150) + 50 - panOffset.y;

    let newStep: AutomationStep;
    switch(type) {
      case 'trigger': newStep = { id: `s-${Date.now()}`, type, title: 'New Event Trigger', description: 'Configure starting event', icon: <Zap className="w-4 h-4"/>, color: 'text-purple-400 bg-purple-500/10', position: { x: centerX, y: centerY } }; break;
      case 'email': newStep = { id: `s-${Date.now()}`, type, title: 'Send Email', description: 'Configure email template', icon: <Mail className="w-4 h-4"/>, color: 'text-emerald-400 bg-emerald-500/10', position: { x: centerX, y: centerY } }; break;
      case 'sms': newStep = { id: `s-${Date.now()}`, type, title: 'Send SMS', description: 'Configure text message', icon: <Smartphone className="w-4 h-4"/>, color: 'text-green-400 bg-green-500/10', position: { x: centerX, y: centerY } }; break;
      case 'delay': newStep = { id: `s-${Date.now()}`, type, title: 'Wait Period', description: 'Configure time delay', icon: <Clock className="w-4 h-4"/>, color: 'text-[#888] bg-[#222]', position: { x: centerX, y: centerY } }; break;
      case 'condition': newStep = { id: `s-${Date.now()}`, type, title: 'Condition Check', description: 'If/Else logic branch', icon: <GitBranch className="w-4 h-4"/>, color: 'text-blue-400 bg-blue-500/10', position: { x: centerX, y: centerY } }; break;
      case 'ab_test': newStep = { id: `s-${Date.now()}`, type, title: 'A/B Split Test', description: 'Split traffic 50/50', icon: <Split className="w-4 h-4"/>, color: 'text-pink-400 bg-pink-500/10', position: { x: centerX, y: centerY } }; break;
      case 'webhook': newStep = { id: `s-${Date.now()}`, type, title: 'Trigger Webhook', description: 'Send data to external app', icon: <Globe className="w-4 h-4"/>, color: 'text-orange-400 bg-orange-500/10', position: { x: centerX, y: centerY } }; break;
    }

    setEditingFlow({ ...editingFlow, steps: [...editingFlow.steps, newStep] });
    toast.success(`${type.toUpperCase()} node added!`);
  };

  const removeStep = (e: React.MouseEvent, stepId: string) => {
    e.stopPropagation();
    if (!editingFlow) return;
    setEditingFlow({ ...editingFlow, steps: editingFlow.steps.filter(s => s.id !== stepId) });
  };

  const openNodeSettings = (e: React.MouseEvent, stepTitle: string) => {
    e.stopPropagation();
    toast(`Opening settings panel for: ${stepTitle}`, { icon: '⚙️' });
  };

  // ── Drag & Drop Logic ──
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isPanning) {
        setPanOffset(prev => ({ x: prev.x + e.movementX, y: prev.y + e.movementY }));
      } else if (draggingNodeId && editingFlow) {
        setEditingFlow(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            steps: prev.steps.map(step => 
              step.id === draggingNodeId 
                ? { ...step, position: { x: step.position.x + e.movementX, y: step.position.y + e.movementY } }
                : step
            )
          };
        });
      }
    };

    const handleMouseUp = () => {
      setDraggingNodeId(null);
      setIsPanning(false);
    };

    if (draggingNodeId || isPanning) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingNodeId, isPanning, editingFlow]);

  // SVG Connection Lines Logic
  const renderConnections = () => {
    if (!editingFlow || editingFlow.steps.length < 2) return null;
    const paths = [];
    
    for (let i = 0; i < editingFlow.steps.length - 1; i++) {
      const source = editingFlow.steps[i];
      const target = editingFlow.steps[i+1];
      
      const startX = source.position.x + 160 + panOffset.x;
      const startY = source.position.y + 80 + panOffset.y;
      const endX = target.position.x + 160 + panOffset.x;
      const endY = target.position.y + panOffset.y;
      
      const ctrlY = startY + (endY - startY) / 2;

      paths.push(
        <path 
          key={`edge-${source.id}-${target.id}`}
          d={`M ${startX} ${startY} C ${startX} ${ctrlY}, ${endX} ${ctrlY}, ${endX} ${endY}`}
          fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3" strokeDasharray="6 6"
        />
      );
    }
    return <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">{paths}</svg>;
  };

  const filteredAutomations = automations.filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="min-h-full font-sans text-[#ececec] p-6 lg:p-8 w-full max-w-[1600px] mx-auto flex flex-col h-[calc(100vh-60px)] relative overflow-hidden select-none">
      
      <AnimatePresence mode="wait">
        
        {/* ── VIEW 1: DASHBOARD ── */}
        {!isCanvasOpen ? (
          <motion.div 
            key="dashboard"
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="flex flex-col h-full w-full"
          >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 shrink-0 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <Workflow className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h1 className="text-[24px] font-bold text-white tracking-tight">Automations</h1>
                  <p className="text-[14px] text-[#888] mt-1">Build workflows to trigger emails, SMS, and internal tasks automatically.</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={openNewCanvas}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-[14px] font-medium transition-colors shadow-[0_0_15px_rgba(37,99,235,0.25)] flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Create Workflow
                </button>
              </div>
            </div>

            {/* List Header */}
            <div className="bg-[#111111] rounded-t-2xl border border-white/10 border-b-0 p-5 flex items-center justify-between shrink-0">
              <h2 className="text-[15px] font-semibold text-white flex items-center gap-2"><Zap className="w-4 h-4 text-blue-400" /> Saved Workflows</h2>
              <div className="relative">
                <Search className="w-4 h-4 text-[#666] absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" placeholder="Search flows..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-[#1a1a1a] border border-white/10 text-white text-[13px] rounded-xl pl-9 pr-4 py-2 w-[250px] outline-none focus:border-blue-500/50"
                />
              </div>
            </div>

            <div className="bg-[#111111] rounded-b-2xl border border-white/10 shadow-lg flex-1 overflow-y-auto custom-scrollbar p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredAutomations.map((flow) => (
                  <div 
                    key={flow.id} onClick={() => openExistingCanvas(flow)}
                    className="bg-[#161616] border border-white/10 rounded-2xl p-5 hover:border-blue-500/30 transition-all cursor-pointer group relative shadow-md hover:shadow-xl flex flex-col"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${flow.color}`}>{flow.icon}</div>
                        <div>
                          <h3 className="text-[15px] font-bold text-white">{flow.name}</h3>
                          <div className="text-[11px] text-[#888] font-mono mt-0.5">ID: {flow.id}</div>
                        </div>
                      </div>
                      <button onClick={(e) => toggleFlowStatus(e, flow.id)} className={`w-10 h-5 rounded-full relative transition-colors ${flow.status === 'Active' ? 'bg-blue-500' : 'bg-[#333]'}`}>
                        <motion.div layout className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full ${flow.status === 'Active' ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                    </div>
                    <p className="text-[13px] text-[#888] mb-6 flex-1">{flow.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          
          /* ── VIEW 2: SPLIT INLINE CANVAS ── */
          <motion.div 
            key="canvas"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
            className="flex flex-1 w-full bg-[#111] border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
          >
            
            {/* Left Side: Navigation & Tools Panel */}
            <div className="w-[320px] bg-[#161616] border-r border-white/10 flex flex-col shrink-0 z-30">
              
              {/* Header Actions */}
              <div className="p-5 border-b border-white/10 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <button 
                    onClick={handleGoBack} 
                    className="flex items-center gap-2 px-3 py-2 text-[#888] hover:text-white bg-[#1a1a1a] rounded-lg border border-white/5 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-[13px] font-bold">Back</span>
                  </button>
                  <button 
                    onClick={handleSaveCanvas} 
                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-[13px] font-bold shadow-[0_0_15px_rgba(37,99,235,0.3)] flex items-center gap-2 transition-all"
                  >
                    <Save className="w-4 h-4" /> Save
                  </button>
                </div>
                <div>
                  <input 
                    type="text" value={editingFlow?.name || ''} onChange={(e) => editingFlow && setEditingFlow({...editingFlow, name: e.target.value})}
                    className="bg-transparent text-[18px] font-bold text-white outline-none w-full border-b border-transparent hover:border-white/20 focus:border-blue-500 pb-1"
                    placeholder="Name your workflow..."
                  />
                </div>
              </div>

              {/* Tools List */}
              <div className="p-5 border-b border-white/10 shrink-0">
                <h3 className="text-[12px] font-bold text-[#888] uppercase tracking-wider flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Add Elements
                </h3>
              </div>
              
              <div className="p-4 space-y-3 overflow-y-auto custom-scrollbar flex-1">
                {[
                  { type: 'trigger' as NodeType, icon: <Zap className="w-4 h-4 shrink-0"/>, title: 'Start Trigger', desc: 'When this happens...', color: 'text-purple-400 bg-purple-500/10 hover:border-purple-500/50' },
                  { type: 'email' as NodeType, icon: <Mail className="w-4 h-4 shrink-0"/>, title: 'Send Email', desc: 'Marketing or transactional', color: 'text-emerald-400 bg-emerald-500/10 hover:border-emerald-500/50' },
                  { type: 'sms' as NodeType, icon: <Smartphone className="w-4 h-4 shrink-0"/>, title: 'Send SMS', desc: 'Text message notification', color: 'text-green-400 bg-green-500/10 hover:border-green-500/50' },
                  { type: 'delay' as NodeType, icon: <Clock className="w-4 h-4 shrink-0"/>, title: 'Time Delay', desc: 'Wait X days or hours', color: 'text-[#888] bg-[#222] hover:border-white/30' },
                  { type: 'condition' as NodeType, icon: <GitBranch className="w-4 h-4 shrink-0"/>, title: 'Condition Split', desc: 'True/False logic branch', color: 'text-blue-400 bg-blue-500/10 hover:border-blue-500/50' },
                  { type: 'ab_test' as NodeType, icon: <Split className="w-4 h-4 shrink-0"/>, title: 'A/B Test', desc: 'Split traffic randomly', color: 'text-pink-400 bg-pink-500/10 hover:border-pink-500/50' },
                  { type: 'webhook' as NodeType, icon: <Globe className="w-4 h-4 shrink-0"/>, title: 'Webhook', desc: 'Send data to APIs', color: 'text-orange-400 bg-orange-500/10 hover:border-orange-500/50' },
                ].map(tool => (
                  <button 
                    key={tool.type} 
                    onClick={() => addStepToCanvas(tool.type)} 
                    className={`w-full bg-[#1a1a1a] border border-white/10 p-4 rounded-xl flex items-start gap-3 transition-all text-left ${tool.color.split(' ')[2]}`}
                  >
                    <div className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center ${tool.color.split(' ').slice(0,2).join(' ')}`}>{tool.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-bold text-white truncate">{tool.title}</div>
                      <div className="text-[11px] text-[#666] truncate">{tool.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Right Side: Interactive Grid Canvas */}
            <div 
              ref={canvasRef}
              onMouseDown={(e) => { if ((e.target as HTMLElement).id === 'grid-bg') setIsPanning(true); }}
              className={`flex-1 relative overflow-hidden bg-[#0a0a0a] ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
            >
              {/* Dotted Grid Background */}
              <div 
                id="grid-bg"
                className="absolute inset-0"
                style={{ 
                  backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)', 
                  backgroundSize: '40px 40px',
                  backgroundPosition: `${panOffset.x}px ${panOffset.y}px` 
                }}
              />

              {/* Connection Lines (SVG) */}
              {renderConnections()}

              {/* Nodes Container */}
              <div className="absolute inset-0 pointer-events-none">
                <div style={{ transform: `translate(${panOffset.x}px, ${panOffset.y}px)` }} className="relative w-full h-full">
                  
                  {editingFlow?.steps.map((step) => (
                    <div
                      key={step.id}
                      onMouseDown={(e) => { e.stopPropagation(); setDraggingNodeId(step.id); }}
                      style={{ left: step.position.x, top: step.position.y }}
                      className={`absolute w-[320px] bg-[#161616] border border-white/20 rounded-2xl p-4 flex flex-col shadow-2xl pointer-events-auto transition-transform ${draggingNodeId === step.id ? 'scale-105 border-blue-500 z-50 cursor-grabbing' : 'cursor-grab hover:border-white/40 z-10'}`}
                    >
                      <button 
                        onClick={(e) => removeStep(e, step.id)} 
                        className="absolute -top-3 -right-3 bg-red-500 hover:bg-red-400 text-white p-1.5 rounded-full shadow-lg z-20"
                        title="Delete Node"
                      >
                        <X className="w-3 h-3" />
                      </button>

                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${step.color}`}>{step.icon}</div>
                          <div>
                            <div className="text-[11px] text-[#666] font-bold uppercase tracking-wider mb-0.5">{step.type}</div>
                            <div className="text-[15px] font-bold text-white">{step.title}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={(e) => openNodeSettings(e, step.title)} 
                            className="p-2 text-[#666] hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                            title="Node Settings"
                          >
                            <Settings2 className="w-4 h-4" />
                          </button>
                          <div className="p-2 text-[#444] cursor-move" title="Drag to move"><Move className="w-4 h-4" /></div>
                        </div>
                      </div>
                      
                      {/* Handles for aesthetics */}
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#222] border border-white/30 rounded-full" />
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#222] border border-white/30 rounded-full" />
                    </div>
                  ))}

                </div>
              </div>

              {editingFlow?.steps.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="bg-[#111] border border-white/10 p-6 rounded-2xl text-center shadow-2xl max-w-sm">
                    <MousePointer2 className="w-10 h-10 text-[#444] mx-auto mb-4 animate-bounce" />
                    <h3 className="text-white font-bold mb-2">Canvas is empty</h3>
                    <p className="text-[#888] text-[14px]">Click the tools on the left to spawn nodes, then drag them around the canvas.</p>
                  </div>
                </div>
              )}
              
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}} />
    </div>
  );
}