import React, { useState, useEffect } from 'react';
import { 
  Globe2, 
  Search, 
  Plus, 
  X, 
  Sparkles, 
  TrendingUp, 
  LayoutGrid, 
  List, 
  Settings2, 
  DollarSign, 
  ArrowRight, 
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useMainWebsite } from '../hooks/useMainWebsite';

// ── Types & Demo Data ──
interface Market {
  id: string;
  name: string;
  flag: string;
  status: 'Active' | 'Draft';
  currency: string;
  revenue: string;
  growth: string;
  domain: string;
  priceAdjustment: number;
}

const INITIAL_SUGGESTIONS: { id: string; label: string; flag: string; currency: string }[] = [];

// Comprehensive Global Lists
const COUNTRIES = [
  { name: "Afghanistan", flag: "🇦🇫" }, { name: "Albania", flag: "🇦🇱" }, { name: "Algeria", flag: "🇩🇿" }, { name: "Andorra", flag: "🇦🇩" }, { name: "Angola", flag: "🇦🇴" }, 
  { name: "Antigua and Barbuda", flag: "🇦🇬" }, { name: "Argentina", flag: "🇦🇷" }, { name: "Armenia", flag: "🇦🇲" }, { name: "Australia", flag: "🇦🇺" }, { name: "Austria", flag: "🇦🇹" }, 
  { name: "Azerbaijan", flag: "🇦🇿" }, { name: "Bahamas", flag: "🇧🇸" }, { name: "Bahrain", flag: "🇧🇭" }, { name: "Bangladesh", flag: "🇧🇩" }, { name: "Barbados", flag: "🇧🇧" }, 
  { name: "Belarus", flag: "🇧🇾" }, { name: "Belgium", flag: "🇧🇪" }, { name: "Belize", flag: "🇧🇿" }, { name: "Benin", flag: "🇧🇯" }, { name: "Bhutan", flag: "🇧🇹" }, 
  { name: "Bolivia", flag: "🇧🇴" }, { name: "Bosnia and Herzegovina", flag: "🇧🇦" }, { name: "Botswana", flag: "🇧🇼" }, { name: "Brazil", flag: "🇧🇷" }, { name: "Brunei", flag: "🇧🇳" }, 
  { name: "Bulgaria", flag: "🇧🇬" }, { name: "Burkina Faso", flag: "🇧🇫" }, { name: "Burundi", flag: "🇧🇮" }, { name: "Cabo Verde", flag: "🇨🇻" }, { name: "Cambodia", flag: "🇰🇭" }, 
  { name: "Cameroon", flag: "🇨🇲" }, { name: "Canada", flag: "🇨🇦" }, { name: "Central African Republic", flag: "🇨🇫" }, { name: "Chad", flag: "🇹🇩" }, { name: "Chile", flag: "🇨🇱" }, 
  { name: "China", flag: "🇨🇳" }, { name: "Colombia", flag: "🇨🇴" }, { name: "Comoros", flag: "🇰🇲" }, { name: "Congo", flag: "🇨🇬" }, { name: "Costa Rica", flag: "🇨🇷" }, 
  { name: "Croatia", flag: "🇭🇷" }, { name: "Cuba", flag: "🇨🇺" }, { name: "Cyprus", flag: "🇨🇾" }, { name: "Czechia", flag: "🇨🇿" }, { name: "Denmark", flag: "🇩🇰" }, 
  { name: "Djibouti", flag: "🇩🇯" }, { name: "Dominica", flag: "🇩🇲" }, { name: "Dominican Republic", flag: "🇩🇴" }, { name: "Ecuador", flag: "🇪🇨" }, { name: "Egypt", flag: "🇪🇬" }, 
  { name: "El Salvador", flag: "🇸🇻" }, { name: "Equatorial Guinea", flag: "🇬🇶" }, { name: "Eritrea", flag: "🇪🇷" }, { name: "Estonia", flag: "🇪🇪" }, { name: "Eswatini", flag: "🇸🇿" }, 
  { name: "Ethiopia", flag: "🇪🇹" }, { name: "Fiji", flag: "🇫🇯" }, { name: "Finland", flag: "🇫🇮" }, { name: "France", flag: "🇫🇷" }, { name: "Gabon", flag: "🇬🇦" }, 
  { name: "Gambia", flag: "🇬🇲" }, { name: "Georgia", flag: "🇬🇪" }, { name: "Germany", flag: "🇩🇪" }, { name: "Ghana", flag: "🇬🇭" }, { name: "Greece", flag: "🇬🇷" }, 
  { name: "Grenada", flag: "🇬🇩" }, { name: "Guatemala", flag: "🇬🇹" }, { name: "Guinea", flag: "🇬🇳" }, { name: "Guinea-Bissau", flag: "🇬🇼" }, { name: "Guyana", flag: "🇬🇾" }, 
  { name: "Haiti", flag: "🇭🇹" }, { name: "Honduras", flag: "🇭🇳" }, { name: "Hungary", flag: "🇭🇺" }, { name: "Iceland", flag: "🇮🇸" }, { name: "India", flag: "🇮🇳" }, 
  { name: "Indonesia", flag: "🇮🇩" }, { name: "Iran", flag: "🇮🇷" }, { name: "Iraq", flag: "🇮🇶" }, { name: "Ireland", flag: "🇮🇪" }, { name: "Israel", flag: "🇮🇱" }, 
  { name: "Italy", flag: "🇮🇹" }, { name: "Jamaica", flag: "🇯🇲" }, { name: "Japan", flag: "🇯🇵" }, { name: "Jordan", flag: "🇯🇴" }, { name: "Kazakhstan", flag: "🇰🇿" }, 
  { name: "Kenya", flag: "🇰🇪" }, { name: "Kiribati", flag: "🇰🇮" }, { name: "Kuwait", flag: "🇰🇼" }, { name: "Kyrgyzstan", flag: "🇰🇬" }, { name: "Laos", flag: "🇱🇦" }, 
  { name: "Latvia", flag: "🇱🇻" }, { name: "Lebanon", flag: "🇱🇧" }, { name: "Lesotho", flag: "🇱🇸" }, { name: "Liberia", flag: "🇱🇷" }, { name: "Libya", flag: "🇱🇾" }, 
  { name: "Liechtenstein", flag: "🇱🇮" }, { name: "Lithuania", flag: "🇱🇹" }, { name: "Luxembourg", flag: "🇱🇺" }, { name: "Madagascar", flag: "🇲🇬" }, { name: "Malawi", flag: "🇲🇼" }, 
  { name: "Malaysia", flag: "🇲🇾" }, { name: "Maldives", flag: "🇲🇻" }, { name: "Mali", flag: "🇲🇱" }, { name: "Malta", flag: "🇲🇹" }, { name: "Marshall Islands", flag: "🇲🇭" }, 
  { name: "Mauritania", flag: "🇲🇷" }, { name: "Mauritius", flag: "🇲🇺" }, { name: "Mexico", flag: "🇲🇽" }, { name: "Micronesia", flag: "🇫🇲" }, { name: "Moldova", flag: "🇲🇩" }, 
  { name: "Monaco", flag: "🇲🇨" }, { name: "Mongolia", flag: "🇲🇳" }, { name: "Montenegro", flag: "🇲🇪" }, { name: "Morocco", flag: "🇲🇦" }, { name: "Mozambique", flag: "🇲🇿" }, 
  { name: "Myanmar", flag: "🇲🇲" }, { name: "Namibia", flag: "🇳🇦" }, { name: "Nauru", flag: "🇳🇷" }, { name: "Nepal", flag: "🇳🇵" }, { name: "Netherlands", flag: "🇳🇱" }, 
  { name: "New Zealand", flag: "🇳🇿" }, { name: "Nicaragua", flag: "🇳🇮" }, { name: "Niger", flag: "🇳🇪" }, { name: "Nigeria", flag: "🇳🇬" }, { name: "North Korea", flag: "🇰🇵" }, 
  { name: "North Macedonia", flag: "🇲🇰" }, { name: "Norway", flag: "🇳🇴" }, { name: "Oman", flag: "🇴🇲" }, { name: "Pakistan", flag: "🇵🇰" }, { name: "Palau", flag: "🇵🇼" }, 
  { name: "Panama", flag: "🇵🇦" }, { name: "Papua New Guinea", flag: "🇵🇬" }, { name: "Paraguay", flag: "🇵🇾" }, { name: "Peru", flag: "🇵🇪" }, { name: "Philippines", flag: "🇵🇭" }, 
  { name: "Poland", flag: "🇵🇱" }, { name: "Portugal", flag: "🇵🇹" }, { name: "Qatar", flag: "🇶🇦" }, { name: "Romania", flag: "🇷🇴" }, { name: "Russia", flag: "🇷🇺" }, 
  { name: "Rwanda", flag: "🇷🇼" }, { name: "Saint Kitts and Nevis", flag: "🇰🇳" }, { name: "Saint Lucia", flag: "🇱🇨" }, { name: "Saint Vincent and the Grenadines", flag: "🇻🇨" }, 
  { name: "Samoa", flag: "🇼🇸" }, { name: "San Marino", flag: "🇸🇲" }, { name: "Sao Tome and Principe", flag: "🇸🇹" }, { name: "Saudi Arabia", flag: "🇸🇦" }, { name: "Senegal", flag: "🇸🇳" }, 
  { name: "Serbia", flag: "🇷🇸" }, { name: "Seychelles", flag: "🇸🇨" }, { name: "Sierra Leone", flag: "🇸🇱" }, { name: "Singapore", flag: "🇸🇬" }, { name: "Slovakia", flag: "🇸🇰" }, 
  { name: "Slovenia", flag: "🇸🇮" }, { name: "Solomon Islands", flag: "🇸🇧" }, { name: "Somalia", flag: "🇸🇴" }, { name: "South Africa", flag: "🇿🇦" }, { name: "South Korea", flag: "🇰🇷" }, 
  { name: "South Sudan", flag: "🇸🇸" }, { name: "Spain", flag: "🇪🇸" }, { name: "Sri Lanka", flag: "🇱🇰" }, { name: "Sudan", flag: "🇸🇩" }, { name: "Suriname", flag: "🇸🇷" }, 
  { name: "Sweden", flag: "🇸🇪" }, { name: "Switzerland", flag: "🇨🇭" }, { name: "Syria", flag: "🇸🇾" }, { name: "Taiwan", flag: "🇹🇼" }, { name: "Tajikistan", flag: "🇹🇯" }, 
  { name: "Tanzania", flag: "🇹🇿" }, { name: "Thailand", flag: "🇹🇭" }, { name: "Timor-Leste", flag: "🇹🇱" }, { name: "Togo", flag: "🇹🇬" }, { name: "Tonga", flag: "🇹🇴" }, 
  { name: "Trinidad and Tobago", flag: "🇹🇹" }, { name: "Tunisia", flag: "🇹🇳" }, { name: "Turkey", flag: "🇹🇷" }, { name: "Turkmenistan", flag: "🇹🇲" }, { name: "Tuvalu", flag: "🇹🇻" }, 
  { name: "Uganda", flag: "🇺🇬" }, { name: "Ukraine", flag: "🇺🇦" }, { name: "United Arab Emirates", flag: "🇦🇪" }, { name: "United Kingdom", flag: "🇬🇧" }, { name: "United States", flag: "🇺🇸" }, 
  { name: "Uruguay", flag: "🇺🇾" }, { name: "Uzbekistan", flag: "🇺🇿" }, { name: "Vanuatu", flag: "🇻🇺" }, { name: "Vatican City", flag: "🇻🇦" }, { name: "Venezuela", flag: "🇻🇪" }, 
  { name: "Vietnam", flag: "🇻🇳" }, { name: "Yemen", flag: "🇾🇪" }, { name: "Zambia", flag: "🇿🇲" }, { name: "Zimbabwe", flag: "🇿🇼" },
  { name: "Global / Rest of World", flag: "🌍" }, { name: "European Union", flag: "🇪🇺" }
];

const CURRENCIES = {
  "North America": ["USD ($)", "CAD ($)", "MXN (R$)"],
  "Europe": ["EUR (€)", "GBP (£)", "CHF (CHF)", "SEK (kr)", "NOK (kr)", "DKK (kr)", "PLN (zł)", "CZK (Kč)", "HUF (Ft)", "RON (lei)", "BGN (лв)", "RSD (дин)", "ISK (kr)", "HRK (kn)", "BAM (KM)", "ALL (Lek)"],
  "Asia-Pacific": ["JPY (¥)", "CNY (¥)", "INR (₹)", "AUD ($)", "NZD ($)", "HKD ($)", "SGD ($)", "KRW (₩)", "TWD (NT$)", "IDR (Rp)", "MYR (RM)", "THB (฿)", "PHP (₱)", "VND (₫)", "PKR (₨)", "FJD ($)", "PGK (K)", "SBD ($)", "TOP (T$)", "WST (WS$)", "VUV (VT)"],
  "Middle East & Africa": ["AED (د.إ)", "SAR (ر.س)", "QAR (ر.ق)", "KWD (د.ك)", "OMR (ر.ع.)", "BHD (.د.ب)", "JOD (د.ا)", "ZAR (R)", "EGP (£)", "NGN (₦)", "KES (KSh)", "GHS (₵)", "UGX (USh)", "TZS (TSh)", "MAD (د.م.)", "DZD (د.ج)"],
  "South America": ["BRL (R$)", "ARS ($)", "CLP ($)", "COP ($)", "PEN (S/.)", "UYU ($U)"],
  "Others": ["AFN (؋)", "AMD (֏)", "ANG (ƒ)", "AOA (Kz)", "AWG (ƒ)", "AZN (₼)", "BBD ($)", "BDT (৳)", "BIF (Fr)", "BMD ($)", "BND ($)", "BOB (Bs.)", "BSD ($)", "BTN (Nu.)", "BWP (P)", "BYN (Br)", "BZD ($)", "CDF (Fr)", "CRC (₡)", "CUC ($)", "CVE (Esc)", "DJF (Fr)", "DOP (RD$)", "ERN (Nfk)", "ETB (Br)", "FKP (£)", "GEL (₾)", "GIP (£)", "GMD (D)", "GNF (Fr)", "GTQ (Q)", "GYD ($)", "HNL (L)", "HTG (G)", "ILS (₪)", "IQD (ع.د)", "IRR (﷼)", "JMD ($)", "KGS (с)", "KHR (៛)", "KMF (Fr)", "KPW (₩)", "KYD ($)", "KZT (₸)", "LAK (₭)", "LBP (ل.ل)", "LKR (₨)", "LRD ($)", "LSL (L)", "LYD (ل.د)", "MDL (L)", "MGA (Ar)", "MKD (ден)", "MMK (K)", "MNT (₮)", "MOP (P)", "MRU (UM)", "MUR (₨)", "MVR (Rf)", "MWK (MK)", "MZN (MT)", "NAD ($)", "NIO (C$)", "NPR (₨)", "PAB (B/.)", "PYG (₲)", "RUB (₽)", "RWF (Fr)", "SCR (₨)", "SDG (£)", "SHP (£)", "SLL (Le)", "SOS (Sh)", "SRD ($)", "SSP (£)", "STN (Db)", "SYP (£)", "SZL (L)", "TJS (ЅМ)", "TMT (m)", "TND (د.ت)", "TRY (₺)", "TTD ($)", "UAH (₴)", "UZS (so'm)", "VES (Bs.S)", "XAF (Fr)", "XCD ($)", "XOF (Fr)", "XPF (Fr)", "YER (﷼)", "ZMW (ZK)", "ZWL ($)"]
};

export default function Markets() {
  const { data: liveData } = useMainWebsite('/markets');
  
  // View State
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Data State
  const [markets, setMarkets] = useState<Market[]>([]);
  useEffect(() => {
    setMarkets(Array.isArray(liveData) ? (liveData as unknown as Market[]) : []);
  }, [liveData]);
  const [suggestions, setSuggestions] = useState(INITIAL_SUGGESTIONS);
  
  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewingMarket, setViewingMarket] = useState<Market | null>(null);

  // Form State
  const [newMarket, setNewMarket] = useState({ name: '', flag: '🌍', currency: 'USD ($)' });
  const [priceMarkup, setPriceMarkup] = useState<number>(0);

  // ── Handlers ──

  const dismissSuggestion = (id: string) => {
    setSuggestions(suggestions.filter(s => s.id !== id));
    toast.success("Suggestion dismissed.");
  };

  const acceptSuggestion = (suggestion: typeof INITIAL_SUGGESTIONS[0]) => {
    const marketToAdd: Market = {
      id: `M-${Math.random()}`,
      name: suggestion.label.split('Create ')[1].replace(' Market?', ''),
      flag: suggestion.flag,
      status: 'Active',
      currency: suggestion.currency,
      revenue: '0',
      growth: '0%',
      domain: `${suggestion.label.split('Create ')[1].split(' ')[0].toLowerCase().replace(' ', '')}.dvsk.com`,
      priceAdjustment: 0
    };
    setMarkets([marketToAdd, ...markets]);
    setSuggestions(suggestions.filter(s => s.id !== suggestion.id));
    toast.success(`${marketToAdd.name} market created successfully!`);
  };

  // Auto-update the emoji flag when selecting a country
  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedName = e.target.value;
    const selectedCountry = COUNTRIES.find(c => c.name === selectedName);
    
    setNewMarket({
      ...newMarket,
      name: selectedName,
      flag: selectedCountry ? selectedCountry.flag : newMarket.flag
    });
  };

  const handleCreateMarket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMarket.name) return toast.error("Please select a region/country.");
    
    const marketToAdd: Market = {
      id: `M-${Math.random()}`,
      name: newMarket.name,
      flag: newMarket.flag,
      status: 'Active',
      currency: newMarket.currency,
      revenue: '0',
      growth: '0%',
      domain: `${newMarket.name.toLowerCase().replace(/\s+/g, '')}.dvsk.com`,
      priceAdjustment: 0
    };
    
    setMarkets([marketToAdd, ...markets]);
    setIsCreateModalOpen(false);
    setNewMarket({ name: '', flag: '🌍', currency: 'USD ($)' });
    toast.success(`${marketToAdd.name} market is now active!`);
  };

  const handleSaveMarketSettings = () => {
    if (!viewingMarket) return;
    setMarkets(markets.map(m => m.id === viewingMarket.id ? { ...m, priceAdjustment: priceMarkup } : m));
    toast.success(`Settings for ${viewingMarket.name} saved!`);
    setViewingMarket(null);
  };

  const filteredMarkets = markets.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="min-h-full font-sans text-[#ececec] p-6 lg:p-8 max-w-[1200px] mx-auto flex flex-col h-[calc(100vh-60px)] relative overflow-hidden">
      
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 shrink-0 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <Globe2 className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-[24px] font-bold text-white tracking-tight">Global Markets</h1>
            <p className="text-[14px] text-[#888] mt-1">Control international pricing, currencies, and local domains.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-1 flex items-center">
            <button onClick={() => setViewMode('table')} className={`p-1.5 rounded-lg transition-all ${viewMode === 'table' ? 'bg-white/10 text-white shadow-sm' : 'text-[#666] hover:text-[#888]'}`}>
              <List className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white/10 text-white shadow-sm' : 'text-[#666] hover:text-[#888]'}`}>
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-[14px] font-medium transition-colors shadow-[0_0_15px_rgba(37,99,235,0.25)] flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Create Market
          </button>
        </div>
      </div>

      {/* ── AI SUGGESTIONS BAR ── */}
      <AnimatePresence>
        {suggestions.length > 0 && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-6 shrink-0 space-y-3">
            {suggestions.map((s) => (
              <div key={s.id} className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/20 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400"><Sparkles className="w-4 h-4" /></div>
                  <span className="text-[14px] font-medium text-blue-100"><span className="mr-2 text-[16px]">{s.flag}</span>{s.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => dismissSuggestion(s.id)} className="p-2 text-[#888] hover:text-white hover:bg-white/10 rounded-lg transition-colors"><X className="w-4 h-4" /></button>
                  <button onClick={() => acceptSuggestion(s)} className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 px-4 py-2 rounded-lg text-[13px] font-bold flex items-center gap-2 transition-colors">
                    <Plus className="w-4 h-4" /> Add Market
                  </button>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MAIN CONTENT AREA ── */}
      <div className="bg-[#111111] rounded-2xl border border-white/10 shadow-lg flex-1 flex flex-col overflow-hidden">
        <div className="p-5 border-b border-white/10 bg-[#161616] flex items-center justify-between shrink-0">
          <h2 className="text-[15px] font-semibold text-white">Configured Regions</h2>
          <div className="relative">
            <Search className="w-4 h-4 text-[#666] absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search markets..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#1a1a1a] border border-white/10 text-white text-[13px] rounded-xl pl-9 pr-4 py-2 w-[250px] outline-none focus:border-blue-500/50 transition-colors"
            />
          </div>
        </div>

        <div className="overflow-y-auto custom-scrollbar flex-1 p-6">
          {viewMode === 'table' ? (
            /* TABLE VIEW */
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead className="bg-[#161616] z-10 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 text-[12px] font-bold text-[#666] uppercase tracking-wider">Region</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-[#666] uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-[#666] uppercase tracking-wider">Currency</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-[#666] uppercase tracking-wider">Local Revenue</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-[#666] uppercase tracking-wider text-right">Settings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredMarkets.map((market) => (
                  <tr key={market.id} className="hover:bg-white/[0.03] transition-colors group cursor-pointer" onClick={() => { setViewingMarket(market); setPriceMarkup(market.priceAdjustment); }}>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <span className="text-[20px]">{market.flag}</span>
                        <div>
                          <div className="text-[14px] font-bold text-white">{market.name}</div>
                          <div className="text-[11px] text-[#888]">{market.domain}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border ${
                        market.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                      }`}>
                        {market.status === 'Active' && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                        {market.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-[13px] font-bold text-white">{market.currency}</td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <span className="text-[14px] font-bold text-white">{market.revenue}</span>
                        {market.growth !== '0%' && <span className="text-[11px] text-emerald-400 flex items-center"><TrendingUp className="w-3 h-3 mr-0.5"/> {market.growth}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button className="bg-[#1a1a1a] border border-white/10 hover:bg-white/10 text-white p-2 rounded-lg transition-colors">
                        <Settings2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            /* GRID / GRAPH VIEW */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredMarkets.map((market) => (
                <div key={market.id} onClick={() => { setViewingMarket(market); setPriceMarkup(market.priceAdjustment); }} className="bg-[#161616] border border-white/10 rounded-2xl p-5 hover:border-blue-500/30 transition-all cursor-pointer group relative overflow-hidden">
                  <div className="absolute right-0 top-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors" />
                  
                  <div className="flex justify-between items-start mb-6 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="text-[28px]">{market.flag}</div>
                      <div>
                        <h3 className="text-[16px] font-bold text-white">{market.name}</h3>
                        <div className="text-[12px] text-[#888]">{market.domain}</div>
                      </div>
                    </div>
                    <button className="text-[#666] group-hover:text-blue-400 transition-colors"><Settings2 className="w-5 h-5" /></button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 relative z-10">
                    <div className="bg-[#111] border border-white/5 rounded-xl p-3">
                      <div className="text-[11px] text-[#888] font-bold uppercase tracking-wider mb-1">Currency</div>
                      <div className="text-[14px] font-bold text-white">{market.currency}</div>
                    </div>
                    <div className="bg-[#111] border border-white/5 rounded-xl p-3">
                      <div className="text-[11px] text-[#888] font-bold uppercase tracking-wider mb-1">Status</div>
                      <div className={`text-[14px] font-bold ${market.status === 'Active' ? 'text-emerald-400' : 'text-yellow-400'}`}>{market.status}</div>
                    </div>
                  </div>

                  <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4 flex items-center justify-between relative z-10">
                    <div>
                      <div className="text-[11px] text-blue-300 font-bold uppercase tracking-wider mb-1">Local Sales</div>
                      <div className="text-[18px] font-bold text-white">{market.revenue}</div>
                    </div>
                    {market.growth !== '0%' && (
                      <div className="flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg text-[12px] font-bold">
                        <TrendingUp className="w-3 h-3" /> {market.growth}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── CREATE MARKET MODAL ── */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[#111111] border border-white/10 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-white/10 bg-[#161616]">
                <h2 className="text-[18px] font-bold text-white flex items-center gap-2"><Globe2 className="w-5 h-5 text-blue-400" /> New Market</h2>
                <button onClick={() => setIsCreateModalOpen(false)} className="text-[#888] hover:text-white transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleCreateMarket} className="p-6 space-y-5">
                
                <div>
                  <label className="block text-[12px] font-bold text-[#888] mb-1.5 uppercase tracking-wider">Region / Country Name</label>
                  <select 
                    required 
                    value={newMarket.name} 
                    onChange={handleCountryChange}
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-[14px] text-white outline-none focus:border-blue-500/50 cursor-pointer"
                  >
                    <option value="" disabled>Select a country...</option>
                    {COUNTRIES.map(c => <option key={c.name} value={c.name} className="bg-[#111]">{c.name}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12px] font-bold text-[#888] mb-1.5 uppercase tracking-wider">Base Currency</label>
                    <select value={newMarket.currency} onChange={e => setNewMarket({...newMarket, currency: e.target.value})} className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-[14px] text-white outline-none cursor-pointer custom-scrollbar max-h-48">
                      {Object.entries(CURRENCIES).map(([region, currencies]) => (
                        <optgroup key={region} label={region} className="bg-[#111] text-[#888] font-bold">
                          {currencies.map(c => (
                            <option key={c} value={c} className="bg-[#1a1a1a] text-white font-normal">{c}</option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold text-[#888] mb-1.5 uppercase tracking-wider">Emoji Flag</label>
                    <input 
                      type="text" 
                      readOnly 
                      value={newMarket.flag} 
                      className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-[18px] text-center text-white outline-none cursor-default opacity-80" 
                    />
                  </div>
                </div>
                
                <div className="pt-4 flex justify-end gap-3 border-t border-white/10 mt-4">
                  <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2.5 rounded-xl text-[13px] font-bold text-[#888] hover:text-white hover:bg-white/5">Cancel</button>
                  <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl text-[13px] font-bold shadow-[0_0_15px_rgba(37,99,235,0.25)] flex items-center gap-2">
                    Initialize Region
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MARKET SETTINGS DRAWER ── */}
      <AnimatePresence>
        {viewingMarket && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setViewingMarket(null)} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed top-0 right-0 bottom-0 w-full max-w-[500px] bg-[#111] border-l border-white/10 shadow-2xl z-50 flex flex-col">
              
              <div className="p-6 border-b border-white/10 bg-[#161616] flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="text-[32px]">{viewingMarket.flag}</div>
                  <div>
                    <h2 className="text-[20px] font-bold text-white">{viewingMarket.name}</h2>
                    <div className="text-[12px] text-blue-400 font-mono mt-0.5">{viewingMarket.domain}</div>
                  </div>
                </div>
                <button onClick={() => setViewingMarket(null)} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-[#888] hover:text-white transition-colors"><ArrowRight className="w-5 h-5" /></button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
                
                {/* Pricing Section */}
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <DollarSign className="w-5 h-5 text-blue-400" />
                    <h3 className="text-[15px] font-bold text-white">Pricing Rules</h3>
                  </div>
                  <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-5">
                    <p className="text-[13px] text-[#888] mb-4">Adjust base product prices for this specific region to account for local taxes, shipping, or purchasing power.</p>
                    
                    <label className="block text-[12px] font-bold text-white mb-3">Price Adjustment: {priceMarkup > 0 ? '+' : ''}{priceMarkup}%</label>
                    <input 
                      type="range" min="-20" max="50" step="1" 
                      value={priceMarkup} onChange={(e) => setPriceMarkup(Number(e.target.value))}
                      className="w-full accent-blue-500 mb-2"
                    />
                    <div className="flex justify-between text-[11px] font-bold text-[#666]">
                      <span>-20%</span>
                      <span>Base Price</span>
                      <span>+50%</span>
                    </div>

                    <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-between">
                      <span className="text-[12px] text-blue-300">Example: ₹1,000 Product →</span>
                      <span className="text-[14px] font-bold text-white">
                        {viewingMarket.currency} {((1000 * (1 + priceMarkup/100)) / (viewingMarket.currency.includes('USD') ? 83 : viewingMarket.currency.includes('EUR') ? 90 : 1)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </section>

                {/* Operations Section */}
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <Settings2 className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-[15px] font-bold text-white">Operations</h3>
                  </div>
                  <div className="space-y-3">
                    <button onClick={() => {toast.loading("Syncing catalogs..."); setTimeout(()=>toast.success("Inventory synced!"), 1500)}} className="w-full bg-[#1a1a1a] border border-white/10 hover:bg-white/5 text-white p-4 rounded-2xl flex items-center justify-between transition-colors">
                      <div className="flex items-center gap-3">
                        <RefreshCw className="w-5 h-5 text-[#888]" />
                        <div className="text-left"><div className="text-[13px] font-bold">Sync Inventory</div><div className="text-[11px] text-[#666]">Force update stock levels</div></div>
                      </div>
                    </button>
                    
                    <button className="w-full bg-[#1a1a1a] border border-white/10 hover:bg-white/5 text-white p-4 rounded-2xl flex items-center justify-between transition-colors">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        <div className="text-left"><div className="text-[13px] font-bold">Local Taxes (Active)</div><div className="text-[11px] text-[#666]">Automatically calculating duties</div></div>
                      </div>
                    </button>
                  </div>
                </section>

              </div>

              <div className="p-6 border-t border-white/10 bg-[#161616] shrink-0">
                <button onClick={handleSaveMarketSettings} className="w-full bg-blue-600 hover:bg-blue-500 text-white text-[14px] font-bold py-3.5 rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all">
                  Save Region Settings
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
      `}} />
    </div>
  );
}