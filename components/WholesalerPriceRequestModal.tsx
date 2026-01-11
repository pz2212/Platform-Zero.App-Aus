import React, { useState, useEffect } from 'react';
import { 
  X, Check, DollarSign, Loader2, Sparkles, TrendingUp, AlertTriangle, 
  ChevronRight, Info, Target, Calculator, Package,
  Send,
  CheckCircle
} from 'lucide-react';
import { SupplierPriceRequest, SupplierPriceRequestItem } from '../types';
import { mockService } from '../services/mockDataService';
import { calculateAcceptanceProbability } from '../services/geminiService';

interface WholesalerPriceRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: SupplierPriceRequest;
  onComplete: () => void;
}

export const WholesalerPriceRequestModal: React.FC<WholesalerPriceRequestModalProps> = ({ isOpen, onClose, request, onComplete }) => {
    const [items, setItems] = useState<SupplierPriceRequestItem[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [aiProbabilities, setAiProbabilities] = useState<Record<string, { probability: number, rationale: string }>>({});
    const [loadingAIPId, setLoadingAIPId] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && request) {
            setItems(request.items.map(i => ({ ...i })));
            setAiProbabilities({});
        }
    }, [isOpen, request]);

    if (!isOpen || !request) return null;

    const handleMatch = (idx: number) => {
        const newItems = [...items];
        newItems[idx].offeredPrice = newItems[idx].targetPrice;
        newItems[idx].isMatchingTarget = true;
        setItems(newItems);
        // Reset probability for this item
        const newProbs = { ...aiProbabilities };
        delete newProbs[newItems[idx].productId];
        setAiProbabilities(newProbs);
    };

    const handlePriceChange = async (idx: number, val: string) => {
        const newItems = [...items];
        const price = parseFloat(val) || 0;
        newItems[idx].offeredPrice = price;
        newItems[idx].isMatchingTarget = price <= newItems[idx].targetPrice;
        setItems(newItems);

        // Call AI for probability if price is higher than target
        if (price > newItems[idx].targetPrice) {
            setLoadingAIPId(newItems[idx].productId);
            try {
                const result = await calculateAcceptanceProbability(
                    newItems[idx].productName,
                    newItems[idx].invoicePrice,
                    newItems[idx].targetPrice,
                    price
                );
                setAiProbabilities(prev => ({ ...prev, [newItems[idx].productId]: result }));
            } finally {
                setLoadingAIPId(null);
            }
        } else {
            const newProbs = { ...aiProbabilities };
            delete newProbs[newItems[idx].productId];
            setAiProbabilities(newProbs);
        }
    };

    const handleSubmit = async () => {
        const allFilled = items.every(i => i.offeredPrice !== undefined);
        if (!allFilled) {
            alert("Please provide a quote for all items.");
            return;
        }

        setIsSubmitting(true);
        await new Promise(r => setTimeout(r, 1200));
        mockService.updateSupplierPriceRequestResponse(request.id, items);
        setIsSubmitting(false);
        onComplete();
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[250] flex items-center justify-center bg-[#0F172A]/90 backdrop-blur-xl p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-6xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100 flex flex-col max-h-[95vh]">
                
                <div className="p-8 md:p-12 border-b border-gray-100 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 bg-white relative">
                    <div className="relative z-10 flex items-center gap-6">
                        <div className="w-16 h-16 bg-[#F43F5E] rounded-3xl flex items-center justify-center text-white shadow-xl shadow-red-500/20 animate-pulse border-4 border-white shrink-0">
                           <AlertTriangle size={32} strokeWidth={2.5}/>
                        </div>
                        <div>
                             <div className="flex items-center gap-3">
                                <h2 className="text-4xl font-black text-gray-900 tracking-tighter uppercase leading-none">Urgent Price Audit</h2>
                                <span className="bg-[#FFF1F2] text-[#E11D48] px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border border-red-100">SLA: 2 Hours</span>
                             </div>
                             <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-3">Ref: #{request.id.split('-').pop()} • Customer Lead: {request.customerContext}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-300 hover:text-gray-900 p-4 bg-white rounded-full shadow-lg border border-gray-50 transition-all active:scale-90"><X size={32}/></button>
                </div>
                
                <div className="p-8 md:p-12 overflow-y-auto flex-1 custom-scrollbar bg-[#F8FAFC]">
                    <div className="bg-[#EFF6FF] border-2 border-[#DBEAFE] p-8 rounded-[2rem] mb-12 flex items-start gap-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-[0.03] transform rotate-12 scale-150 group-hover:rotate-0 transition-transform duration-1000 pointer-events-none"><Calculator size={140}/></div>
                        <div className="p-4 bg-white rounded-2xl text-blue-600 shadow-sm border border-blue-50 shrink-0 relative z-10">
                            <Info size={32} strokeWidth={2.5} />
                        </div>
                        <div className="relative z-10">
                            <p className="text-sm font-black text-[#1E3A8A] uppercase tracking-widest mb-1">Trade Opportunity</p>
                            <p className="text-base text-[#2563EB] font-medium leading-relaxed max-w-4xl">
                                Provide your best wholesale rates to secure this new customer. Matching the <span className="font-black">PZ Target</span> ensures immediate lead progression and automated contract mapping.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.4em] mb-4 ml-1">Market Comparison Audit ({items.length} Varieties)</h3>
                        {items.map((item, idx) => {
                            const aiResult = aiProbabilities[item.productId];
                            const isLoadingAI = loadingAIPId === item.productId;

                            return (
                                <div key={idx} className={`p-8 bg-white rounded-[2.5rem] border-2 transition-all group shadow-sm hover:shadow-xl ${item.offeredPrice && !item.isMatchingTarget ? 'border-orange-100' : item.isMatchingTarget ? 'border-emerald-100' : 'border-gray-50'}`}>
                                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-center">
                                        
                                        <div className="xl:col-span-4">
                                            <h4 className="font-black text-gray-900 text-3xl uppercase tracking-tighter leading-none mb-3 group-hover:text-indigo-600 transition-colors">{item.productName}</h4>
                                            <div className="flex items-center gap-4">
                                                <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-gray-200">Weekly Requirement</span>
                                                <span className="text-sm font-black text-gray-900 uppercase tracking-tight">{item.qty} units</span>
                                            </div>
                                        </div>

                                        <div className="xl:col-span-4 grid grid-cols-1">
                                            <div className="p-5 bg-emerald-50/40 rounded-[1.75rem] border-2 border-emerald-50 shadow-sm">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">PZ Target</span>
                                                    <Target size={14} className="text-emerald-400"/>
                                                </div>
                                                <div className="text-3xl font-black text-emerald-600 tracking-tighter animate-in fade-in duration-500">${item.targetPrice.toFixed(2)}</div>
                                            </div>
                                        </div>

                                        <div className="xl:col-span-4 flex flex-col gap-4">
                                            <div className="flex gap-3 h-16">
                                                <button 
                                                    onClick={() => handleMatch(idx)}
                                                    className={`px-8 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border-2 flex items-center justify-center gap-3 flex-1 active:scale-[0.98] ${item.isMatchingTarget ? 'bg-emerald-600 border-emerald-600 text-white shadow-xl shadow-emerald-500/20' : 'bg-white border-gray-200 text-gray-400 hover:border-emerald-500 hover:text-emerald-600'}`}
                                                >
                                                    {item.isMatchingTarget ? <CheckCircle size={18} strokeWidth={3}/> : <Target size={18}/>}
                                                    {item.isMatchingTarget ? 'MATCHED' : 'MATCH'}
                                                </button>
                                                <div className="relative flex-[1.5] group h-full">
                                                    <DollarSign size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-600 transition-colors"/>
                                                    <input 
                                                        type="number" 
                                                        step="0.01"
                                                        placeholder="Custom Rate"
                                                        className={`w-full h-full pl-12 pr-6 rounded-2xl font-black text-2xl outline-none transition-all shadow-inner-sm ${item.offeredPrice && !item.isMatchingTarget ? 'bg-orange-50 border-orange-200 focus:bg-white focus:border-orange-400' : 'bg-gray-50 border-gray-100 focus:bg-white focus:border-indigo-500'}`}
                                                        value={item.offeredPrice || ''}
                                                        onChange={e => handlePriceChange(idx, e.target.value)}
                                                    />
                                                </div>
                                            </div>

                                            {(aiResult || isLoadingAI) && (
                                                <div className="animate-in slide-in-from-top-2 duration-300">
                                                    <div className="bg-[#0F172A] rounded-2xl p-4 flex items-center justify-between border border-white/5 relative overflow-hidden group/ai shadow-2xl">
                                                        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none transform rotate-12 scale-125 group-hover/ai:rotate-0 transition-transform duration-700"><Sparkles size={40} className="text-emerald-400"/></div>
                                                        <div className="flex items-center gap-4 relative z-10">
                                                            <div className="text-center min-w-[50px]">
                                                                {isLoadingAI ? (
                                                                    <Loader2 size={24} className="text-emerald-400 animate-spin mx-auto"/>
                                                                ) : (
                                                                    <div className={`text-2xl font-black tracking-tighter ${aiResult.probability > 70 ? 'text-emerald-400' : aiResult.probability > 40 ? 'text-orange-400' : 'text-red-400'}`}>
                                                                        {aiResult.probability}%
                                                                    </div>
                                                                )}
                                                                <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest mt-0.5 leading-none">Acceptance</p>
                                                            </div>
                                                            <div className="h-10 w-px bg-white/10 shrink-0"></div>
                                                            <div className="min-w-0">
                                                                <p className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em] flex items-center gap-1.5 mb-0.5">
                                                                    <Sparkles size={10}/> AI Strategy
                                                                </p>
                                                                <p className="text-[10px] text-slate-400 font-medium italic truncate max-w-[180px]">
                                                                    {isLoadingAI ? "Processing market data..." : `"${aiResult.rationale}"`}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        {!isLoadingAI && (
                                                            <div className={`p-2 rounded-lg shrink-0 transition-all ${aiResult.probability > 60 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                                                                <TrendingUp size={16}/>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="p-8 md:p-12 border-t border-gray-100 bg-white sticky bottom-0 z-20 flex flex-col sm:flex-row justify-between items-center gap-10 shadow-[0_-30px_60px_rgba(0,0,0,0.03)] backdrop-blur-md">
                    <div className="text-left w-full sm:w-auto">
                        <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.4em] mb-3 ml-1">Aggregate Quote Value</p>
                        <div className="flex items-baseline gap-3">
                             <p className="text-6xl font-black text-gray-900 tracking-tighter leading-none">${items.reduce((sum, i) => sum + (i.offeredPrice || 0) * i.qty, 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                             <span className="text-sm font-black text-gray-400 uppercase tracking-widest">/ Per Week</span>
                        </div>
                    </div>
                    
                    <div className="flex gap-4 w-full sm:w-auto">
                        <button onClick={onClose} className="flex-1 sm:flex-none px-12 py-6 bg-white border-2 border-gray-100 text-gray-400 rounded-3xl font-black text-[11px] uppercase tracking-[0.25em] hover:bg-gray-50 transition-all active:scale-95 shadow-sm">Decline Request</button>
                        <button 
                            onClick={handleSubmit}
                            disabled={isSubmitting || !items.every(i => i.offeredPrice !== undefined)}
                            className="flex-[2] sm:flex-none px-16 py-6 bg-[#EF4444] hover:bg-[#DC2626] text-white rounded-3xl font-black text-[11px] uppercase tracking-[0.3em] shadow-[0_20px_40px_-10px_rgba(239,68,68,0.3)] transition-all flex items-center justify-center gap-4 active:scale-[0.98] disabled:opacity-50 group overflow-hidden relative"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out"></div>
                            {isSubmitting ? <Loader2 size={24} className="animate-spin"/> : <><Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"/> Submit Final Quote</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};