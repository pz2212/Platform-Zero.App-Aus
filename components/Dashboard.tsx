
import React, { useState, useEffect, useRef } from 'react';
import { User, Order, Product, Customer, InventoryItem, SupplierPriceRequest, UserRole, Driver, Packer } from '../types';
import { mockService } from '../services/mockDataService';
import { WholesalerPriceRequestModal } from './WholesalerPriceRequestModal';
import { AiOpportunityMatcher } from './AiOpportunityMatcher';
import { Settings as SettingsComponent } from './Settings';
import { 
  Package, Truck, MapPin, LayoutDashboard, 
  Users, Clock, CheckCircle, X, DollarSign,
  LayoutGrid, Bell, History, ArrowRight, Loader2,
  ChevronDown, Gavel, BarChart3, TrendingUp,
  Boxes, Check, Globe, ShoppingCart, AlertTriangle,
  ArrowUpRight, Store, ShieldCheck, Zap, Handshake,
  Search, Filter, Info, RefreshCw, Sparkles, ChevronRight,
  TrendingDown, Pencil, Lock, Gift, Camera, Settings, Plus,
  Layout, History as HistoryIcon, Camera as ScannerIcon,
  UserCheck, User as UserIcon, Send, Calendar
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DashboardProps {
  user: User;
}

const SA_PRODUCE_MARKET_SUPPLIERS = [
    { id: 'dir-1', name: 'Advent Produce', mobile: '0412 888 333', email: 'advent@saproducemarket.com.au', specialty: 'General Produce', type: 'Wholesaler' },
    { id: 'dir-2', name: 'Ceravolo Orchards', mobile: '0455 444 777', email: 'info@ceravolo.com.au', specialty: 'Fruit & Pears', type: 'Farmer' },
    { id: 'dir-3', name: 'GD Produce', mobile: '0488 111 000', email: 'sales@gdproduce.com.au', specialty: 'Leafy Greens', type: 'Wholesaler' },
];

const DemandSourcingModal = ({ isOpen, onClose, product, user, currentDemand }: { 
    isOpen: boolean, 
    onClose: () => void, 
    product: Product | null, 
    user: User,
    currentDemand: number
}) => {
    const [qty, setQty] = useState(currentDemand.toString());
    const [neededByDate, setNeededByDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        return d.toISOString().split('T')[0];
    });
    const [isPinging, setIsPinging] = useState<string | null>(null);
    const [view, setView] = useState<'PARTNERS' | 'DIRECTORY'>('PARTNERS');

    if (!isOpen || !product) return null;

    const allInventory = mockService.getAllInventory();
    const allUsers = mockService.getAllUsers();

    // Find partners who have this stock available
    const partnerLots = allInventory.filter(i => 
        i.productId === product.id && 
        i.ownerId !== user.id && 
        i.status === 'Available'
    );

    const partnersWithStock = partnerLots.map(lot => ({
        lot,
        owner: allUsers.find(u => u.id === lot.ownerId)
    })).filter(x => !!x.owner);

    const handlePing = async (targetId: string, isDirectory: boolean = false) => {
        setIsPinging(targetId);
        await new Promise(r => setTimeout(r, 1200));
        
        if (isDirectory) {
            alert(`Connection request and urgent stock inquiry sent to ${SA_PRODUCE_MARKET_SUPPLIERS.find(s => s.id === targetId)?.name} for ${qty}kg of ${product.name} needed by ${neededByDate}`);
        } else {
            mockService.sendDemandPing(user.id, targetId, product.id, parseFloat(qty), neededByDate);
            alert("Urgent notification sent to " + allUsers.find(u => u.id === targetId)?.businessName);
        }
        
        setIsPinging(null);
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[3.5rem] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 border border-gray-100">
                <div className="p-8 md:p-10 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                            <Plus size={28}/>
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Source {product.name}</h2>
                            <p className="text-[10px] text-indigo-600 font-black uppercase tracking-widest mt-1">Filling Stock Deficit • Requirement: {currentDemand}kg</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 bg-white rounded-full text-gray-400 hover:text-gray-900 shadow-sm border border-gray-100 transition-all"><X size={24}/></button>
                </div>

                <div className="p-8 md:p-10 space-y-10 flex-1 overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Quantity Needed (KG)</label>
                            <div className="relative group">
                                <Package size={24} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-600 transition-colors"/>
                                <input 
                                    type="number" 
                                    className="w-full pl-16 pr-8 py-6 bg-gray-50 border-2 border-transparent focus:border-indigo-500 rounded-[2rem] font-black text-3xl text-gray-900 outline-none transition-all shadow-inner-sm"
                                    value={qty}
                                    onChange={e => setQty(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Date Needed By</label>
                            <div className="relative group">
                                <Calendar size={24} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-600 transition-colors"/>
                                <input 
                                    type="date" 
                                    className="w-full pl-16 pr-8 py-6 bg-gray-50 border-2 border-transparent focus:border-indigo-500 rounded-[2rem] font-black text-xl text-gray-900 outline-none transition-all shadow-inner-sm appearance-none"
                                    value={neededByDate}
                                    onChange={e => setNeededByDate(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-gray-100/50 p-1.5 rounded-2xl flex border border-gray-200/50 shadow-inner-sm">
                            <button 
                                onClick={() => setView('PARTNERS')}
                                className={`flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'PARTNERS' ? 'bg-white text-gray-900 shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                Existing Partners ({partnersWithStock.length})
                            </button>
                            <button 
                                onClick={() => setView('DIRECTORY')}
                                className={`flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'DIRECTORY' ? 'bg-white text-gray-900 shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                Market Directory
                            </button>
                        </div>

                        <div className="space-y-3">
                            {view === 'PARTNERS' ? (
                                partnersWithStock.length === 0 ? (
                                    <div className="py-12 text-center bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl">
                                        <AlertTriangle size={32} className="mx-auto text-gray-300 mb-3"/>
                                        <p className="text-sm font-black text-gray-400 uppercase tracking-tight">None of your current partners have this stock available.</p>
                                        <button onClick={() => setView('DIRECTORY')} className="mt-4 text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">Check Market Directory instead</button>
                                    </div>
                                ) : partnersWithStock.map(p => (
                                    <div key={p.owner?.id} className="bg-white p-6 rounded-3xl border border-gray-100 flex items-center justify-between shadow-sm hover:shadow-md transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-700 font-black">
                                                {p.owner?.businessName.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-black text-gray-900 uppercase text-sm">{p.owner?.businessName}</p>
                                                <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">{p.lot.quantityKg}kg Avail. @ ${p.lot.discountPricePerKg || product.defaultPricePerKg}/kg</p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handlePing(p.owner!.id)}
                                            disabled={!!isPinging}
                                            className="px-8 py-3.5 bg-[#043003] text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg flex items-center gap-2 active:scale-95 disabled:opacity-50"
                                        >
                                            {isPinging === p.owner?.id ? <Loader2 size={14} className="animate-spin"/> : <Zap size={14}/>}
                                            Ping Partner
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="space-y-3">
                                    {SA_PRODUCE_MARKET_SUPPLIERS.map(s => (
                                        <div key={s.id} className="bg-white p-6 rounded-3xl border border-gray-100 flex items-center justify-between shadow-sm hover:shadow-md transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 font-black">
                                                    {s.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-black text-gray-900 uppercase text-sm">{s.name}</p>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{s.type} • {s.specialty}</p>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => handlePing(s.id, true)}
                                                disabled={!!isPinging}
                                                className="px-8 py-3.5 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg flex items-center gap-2 active:scale-95 disabled:opacity-50"
                                            >
                                                {isPinging === s.id ? <Loader2 size={14} className="animate-spin"/> : <Globe size={14}/>}
                                                Connect & Source
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-8 border-t border-gray-100 bg-gray-50/50">
                    <p className="text-[10px] text-center text-gray-400 font-black uppercase tracking-widest">
                        Requests are marked as <span className="text-red-500">Urgent Priority</span> on the supplier's terminal.
                    </p>
                </div>
            </div>
        </div>
    );
};

const MorningPriceLock = ({ user, products, onComplete }: { user: User, products: Product[], onComplete: () => void }) => {
    const sellingProducts = products.filter(p => user.activeSellingInterests?.some(interest => p.name.includes(interest)) || p.id === 'p1' || p.id === 'p2');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isEditing, setIsEditing] = useState(false);
    const [newPrice, setNewPrice] = useState('');
    const [isFinished, setIsFinished] = useState(false);

    if (sellingProducts.length === 0 || isFinished) return null;

    const current = sellingProducts[currentIndex];

    const handleNext = () => {
        if (currentIndex < sellingProducts.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setIsEditing(false);
            setNewPrice('');
        } else {
            setIsFinished(true);
            onComplete();
        }
    };

    const handleUpdate = () => {
        if (!newPrice) return;
        mockService.updateProductPrice(current.id, parseFloat(newPrice));
        handleNext();
    };

    return (
        <div className="bg-white rounded-[2.5rem] border-2 border-indigo-100 shadow-xl p-8 mb-8 animate-in slide-in-from-top-4 duration-500 overflow-hidden relative group mx-2">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform pointer-events-none">
                <Sparkles size={140} className="text-indigo-900"/>
            </div>
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-10 relative z-10">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-indigo-200 border-4 border-white shrink-0">
                        <Lock size={28} strokeWidth={2.5}/>
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em]">Morning Price Lock</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-200"></span>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{currentIndex + 1} / {sellingProducts.length}</span>
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight leading-none">Has the price changed?</h3>
                    </div>
                </div>

                <div className="flex-1 flex items-center gap-8 bg-gray-50/80 p-5 rounded-3xl border border-gray-100 min-w-0 max-w-xl">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden border border-gray-100 shrink-0 shadow-sm">
                        <img src={current.imageUrl} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="font-black text-gray-900 uppercase text-lg truncate leading-none mb-2">{current.name}</p>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                           <History size={12}/> Yesterday: <span className="text-indigo-600 font-black">${current.defaultPricePerKg.toFixed(2)}/kg</span>
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    {isEditing ? (
                        <div className="flex items-center gap-3 w-full animate-in slide-in-from-right-2">
                            <div className="relative flex-1 md:w-40">
                                <DollarSign size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"/>
                                <input 
                                    autoFocus
                                    type="number" 
                                    step="0.01"
                                    className="w-full pl-10 pr-4 py-4 bg-white border-2 border-indigo-600 rounded-2xl font-black text-xl text-gray-900 outline-none shadow-inner-sm"
                                    value={newPrice}
                                    onChange={e => setNewPrice(e.target.value)}
                                    placeholder="0.00"
                                />
                            </div>
                            <button onClick={handleUpdate} className="px-10 py-5 bg-indigo-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl hover:bg-black transition-all">Lock Price</button>
                            <button onClick={() => setIsEditing(false)} className="p-4 text-gray-400 hover:text-gray-900 transition-colors bg-gray-50 rounded-2xl"><X size={24}/></button>
                        </div>
                    ) : (
                        <>
                            <button 
                                onClick={handleNext}
                                className="flex-1 md:flex-none px-14 py-5 bg-emerald-500 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-emerald-100 hover:bg-emerald-600 transition-all active:scale-95 flex items-center justify-center gap-3"
                            >
                                <CheckCircle size={18}/> No Change
                            </button>
                            <button 
                                onClick={() => setIsEditing(true)}
                                className="flex-1 md:flex-none px-14 py-5 bg-[#0F172A] text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-3"
                            >
                                <Pencil size={18}/> Update Rate
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

const OrderAssignmentModal = ({ isOpen, onClose, order, products, users, onAssigned }: any) => {
    const [selectedPackerId, setSelectedPackerId] = useState(order?.packedAt ? 'assigned' : '');
    const [selectedDriverId, setSelectedDriverId] = useState(order?.logistics?.driverName ? 'assigned' : '');
    const [isSaving, setIsSaving] = useState(false);

    if (!isOpen || !order) return null;

    const packers = mockService.getPackers(order.sellerId);
    const drivers = mockService.getDrivers(order.sellerId);

    const handleSave = async () => {
        setIsSaving(true);
        await new Promise(r => setTimeout(r, 1000));
        // In real app, we'd call mockService to update assignments
        onAssigned(order.id);
        setIsSaving(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[3.5rem] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 border border-gray-100">
                <div className="p-10 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Assignment manifest</h2>
                        <p className="text-[10px] text-indigo-600 font-black uppercase tracking-widest mt-1">Order Ref: #{order.id.split('-').pop()}</p>
                    </div>
                    <button onClick={onClose} className="p-3 bg-white rounded-full text-gray-400 hover:text-gray-900 shadow-sm border border-gray-100 transition-all"><X size={24}/></button>
                </div>

                <div className="p-10 space-y-10 overflow-y-auto max-h-[60vh] custom-scrollbar">
                    {/* Item Review */}
                    <div className="space-y-4">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Products to pack</p>
                        <div className="divide-y divide-gray-50 border border-gray-100 rounded-3xl overflow-hidden bg-white shadow-inner-sm">
                            {order.items.map((item: any, i: number) => {
                                const p = products.find((prod: any) => prod.id === item.productId);
                                return (
                                    <div key={i} className="p-6 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <img src={p?.imageUrl} className="w-12 h-12 rounded-xl object-cover" />
                                            <div>
                                                <p className="font-black text-gray-900 text-sm uppercase">{p?.name}</p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{p?.variety}</p>
                                            </div>
                                        </div>
                                        <p className="font-black text-gray-900">{item.quantityKg}{p?.unit || 'KG'}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Packer Assignment */}
                        <div className="space-y-4">
                            <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                                <Package size={14} className="text-orange-500"/> Select Packer
                            </label>
                            <div className="space-y-2">
                                {packers.length === 0 ? (
                                    <div className="p-4 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 text-center text-[10px] font-bold text-gray-400">No Packers Registered</div>
                                ) : packers.map((p: any) => (
                                    <button 
                                        key={p.id}
                                        onClick={() => setSelectedPackerId(p.id)}
                                        className={`w-full p-4 rounded-2xl border-2 flex items-center justify-between transition-all ${selectedPackerId === p.id ? 'bg-indigo-50 border-indigo-600 text-indigo-700' : 'bg-white border-gray-100 text-gray-500 hover:border-indigo-100'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 font-black text-xs uppercase">{p.name.charAt(0)}</div>
                                            <span className="text-xs font-black uppercase">{p.name}</span>
                                        </div>
                                        {selectedPackerId === p.id && <Check size={16} strokeWidth={4}/>}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Driver Assignment */}
                        <div className="space-y-4">
                            <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                                <Truck size={14} className="text-blue-500"/> Select Driver
                            </label>
                            <div className="space-y-2">
                                {drivers.length === 0 ? (
                                    <div className="p-4 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 text-center text-[10px] font-bold text-gray-400">No Drivers Registered</div>
                                ) : drivers.map((d: any) => (
                                    <button 
                                        key={d.id}
                                        onClick={() => setSelectedDriverId(d.id)}
                                        className={`w-full p-4 rounded-2xl border-2 flex items-center justify-between transition-all ${selectedDriverId === d.id ? 'bg-indigo-50 border-indigo-600 text-indigo-700' : 'bg-white border-gray-100 text-gray-500 hover:border-indigo-100'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-black text-xs uppercase">{d.name.charAt(0)}</div>
                                            <span className="text-xs font-black uppercase">{d.name}</span>
                                        </div>
                                        {selectedDriverId === d.id && <Check size={16} strokeWidth={4}/>}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-10 border-t border-gray-100 bg-gray-50/50 flex gap-4">
                    <button onClick={onClose} className="flex-1 py-5 bg-white border-2 border-gray-100 text-gray-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-100 transition-all">Cancel</button>
                    <button 
                        onClick={handleSave}
                        disabled={isSaving || !selectedPackerId || !selectedDriverId}
                        className="flex-[2] py-5 bg-[#043003] text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                        {isSaving ? <Loader2 className="animate-spin" size={20}/> : <><UserCheck size={20}/> Dispatch To Team</>}
                    </button>
                </div>
            </div>
        </div>
    );
};

const DemandMatrixItem = ({ product, item, demand, onSource }: { product: Product, item?: InventoryItem, demand: number, onSource: () => void }) => {
    const onHand = item?.quantityKg || 0;
    const deficit = demand - onHand;
    const progress = Math.min(100, (onHand / demand) * 100);

    return (
        <div 
            onClick={onSource}
            className="p-6 bg-white rounded-3xl border border-gray-100 space-y-4 hover:shadow-md transition-all cursor-pointer group"
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl overflow-hidden border border-gray-100 shadow-sm shrink-0">
                        <img src={product.imageUrl} className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <h4 className="font-black text-gray-900 text-sm uppercase leading-none tracking-tight group-hover:text-indigo-600 transition-colors">{product.name}</h4>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{product.variety}</p>
                    </div>
                </div>
                <button 
                    onClick={(e) => { e.stopPropagation(); onSource(); }}
                    className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors shadow-sm"
                >
                    <Plus size={16} strokeWidth={3}/>
                </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">On Hand</p>
                    <p className="text-sm font-black text-gray-900">{onHand}kg</p>
                </div>
                <div className="p-3 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                    <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-1">Demand</p>
                    <p className="text-sm font-black text-indigo-900">{demand}kg</p>
                </div>
            </div>

            <div className="space-y-2">
                <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden shadow-inner-sm">
                    <div 
                        className={`h-full transition-all duration-1000 ${deficit > 0 ? 'bg-orange-500' : 'bg-emerald-500'}`} 
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
                {deficit > 0 && (
                    <p className="text-[9px] font-black text-orange-600 uppercase tracking-widest flex items-center gap-1.5">
                        <AlertTriangle size={10}/> Stock Deficit Identified • Click to Source
                    </p>
                )}
            </div>
        </div>
    );
};

export const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<'OPS' | 'PROCUREMENT'>('OPS');
  const [orderSubTab, setOrderSubTab] = useState<'INCOMING' | 'PROCESSING' | 'ACTIVE'>('INCOMING');
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [pendingPriceRequests, setPendingPriceRequests] = useState<SupplierPriceRequest[]>([]);
  const [activeAudit, setActiveAudit] = useState<SupplierPriceRequest | null>(null);
  const [showPriceLock, setShowPriceLock] = useState(true);
  const [selectedOrderForAssignment, setSelectedOrderForAssignment] = useState<Order | null>(null);
  
  // Sourcing Modal State
  const [sourcingProduct, setSourcingProduct] = useState<{product: Product, demand: number} | null>(null);

  // Enabled Scanner State
  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [user]);

  const loadData = () => {
    const allSellingOrders = mockService.getOrders(user.id).filter(o => o.sellerId === user.id);
    setOrders(allSellingOrders);
    setCustomers(mockService.getCustomers());
    const requests = mockService.getSupplierPriceRequests(user.id).filter(r => r.status === 'PENDING');
    setPendingPriceRequests(requests);
  };

  const handleAcceptOrder = (orderId: string) => {
    mockService.acceptOrderV2(orderId);
    loadData();
    alert("Order Accepted!");
  };

  const incomingQueue = orders.filter(o => o.status === 'Pending');
  const processingQueue = orders.filter(o => ['Confirmed', 'Ready for Delivery'].includes(o.status));
  const activeFulfillment = orders.filter(o => o.status === 'Shipped');

  const currentList = orderSubTab === 'INCOMING' ? incomingQueue : 
                      orderSubTab === 'PROCESSING' ? processingQueue : activeFulfillment;

  const inventory = mockService.getInventory(user.id);
  const products = mockService.getAllProducts();
  const users = mockService.getAllUsers();

  const handleVisualScanner = () => {
      setIsScannerModalOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 max-w-[1600px] mx-auto">
      
      {/* HEADER SECTION - REVERTED TO SCREENSHOT */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-2">
        <div className="space-y-2">
          <h1 className="text-5xl font-black text-gray-900 tracking-tighter uppercase leading-none">Partner Operations</h1>
          <div className="flex items-center gap-4">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Management Console</p>
              <span className="w-1 h-1 rounded-full bg-gray-300"></span>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{user.businessName} Adelaide</p>
              
              <div className="ml-4 flex bg-gray-100 p-1 rounded-xl gap-1 border border-gray-200 shadow-inner-sm">
                  <button onClick={() => setActiveView('OPS')} className={`px-5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${activeView === 'OPS' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>Ops View</button>
                  <button onClick={() => setActiveView('PROCUREMENT')} className={`px-5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${activeView === 'PROCUREMENT' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>Procurement Hub</button>
              </div>
          </div>
        </div>
        <button 
            onClick={handleVisualScanner}
            className="px-10 py-5 bg-[#3B82F6] hover:bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20 transition-all active:scale-95 flex items-center gap-3 group"
        >
            <ScannerIcon size={20} className="group-hover:rotate-12 transition-transform" /> Visual Scanner
        </button>
      </div>

      {/* KPI ROW */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-2">
          {[
              { label: 'ORDERS TODAY', value: incomingQueue.length + processingQueue.length, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'WHOLESALERS', value: '2', icon: Globe, color: 'text-indigo-600', bg: 'bg-indigo-50' },
              { label: 'ON THE ROAD', value: activeFulfillment.length, icon: Truck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: 'REVENUE', value: `$${processingQueue.reduce((s, o) => s + o.totalAmount, 0).toLocaleString()}`, icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-50' }
          ].map((card, i) => (
              <div key={i} className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col justify-between h-40 group hover:shadow-md transition-all">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] leading-none">{card.label}</span>
                  <div className="flex justify-between items-end">
                      <h3 className="text-4xl font-black text-gray-900 tracking-tighter">{card.value}</h3>
                      <div className={`p-3 rounded-2xl ${card.bg} ${card.color} border border-white shadow-inner-sm group-hover:scale-110 transition-transform`}>
                          <card.icon size={20} />
                      </div>
                  </div>
              </div>
          ))}
      </div>

      {/* MORNING PRICE LOCK FEATURE (Restored) */}
      {showPriceLock && (
          <MorningPriceLock user={user} products={products} onComplete={() => setShowPriceLock(false)} />
      )}

      {/* PRICE AUDIT ALERTS - MAINTAINED WORKFLOW */}
      {pendingPriceRequests.map(req => (
          <div key={req.id} className="bg-[#EEF2FF] border-2 border-indigo-200 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center justify-between gap-8 mx-2 animate-in slide-in-from-top-4 duration-700">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-indigo-100 border-4 border-white shrink-0">
                    <Handshake size={32} />
                </div>
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="bg-indigo-600 text-white px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">Urgent Negotiation</span>
                        <span className="text-indigo-400 font-bold text-xs uppercase tracking-widest">• 2 Hour SLA</span>
                    </div>
                    <h3 className="text-2xl font-black text-[#1E1B4B] uppercase tracking-tight leading-none">Price Audit for {req.customerContext}</h3>
                    <p className="text-indigo-700/70 text-sm font-medium mt-2">Platform Zero Admin has assigned a competitive pricing audit. Respond to secure the account.</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveAudit(req)}
                className="w-full md:w-auto px-12 py-5 bg-indigo-600 hover:bg-[#1E1B4B] text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-200 transition-all flex items-center justify-center gap-3 active:scale-95"
              >
                  Respond to Audit <ChevronRight size={18}/>
              </button>
          </div>
      ))}

      {/* MAIN TWO-COLUMN LAYOUT - MATCHED TO SCREENSHOT */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 px-2">
          
          {/* LEFT: DEMAND MATRIX (Enabled) */}
          <div className="xl:col-span-4 space-y-6">
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
                <div className="p-8 border-b border-gray-100 bg-gray-50/20 shrink-0">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg"><LayoutGrid size={20}/></div>
                        <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Demand Matrix</h2>
                    </div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Inventory vs. Today's Fulfillment</p>
                </div>
                <div className="p-6 space-y-4 flex-1 overflow-y-auto custom-scrollbar bg-gray-50/30">
                    <DemandMatrixItem 
                        product={products.find(p => p.name.includes('Tomatoes')) || products[0]} 
                        item={inventory.find(i => i.productId === 'p1')}
                        demand={50}
                        onSource={() => setSourcingProduct({ product: products.find(p => p.name.includes('Tomatoes')) || products[0], demand: 50 })}
                    />
                    <DemandMatrixItem 
                        product={products.find(p => p.name.includes('Lettuce')) || products[1]} 
                        item={inventory.find(i => i.productId === 'p2')}
                        demand={50}
                        onSource={() => setSourcingProduct({ product: products.find(p => p.name.includes('Lettuce')) || products[1], demand: 50 })}
                    />
                    <DemandMatrixItem 
                        product={products.find(p => p.name.includes('Eggplant')) || products[3]} 
                        item={inventory.find(i => i.productId === 'p4')}
                        demand={30}
                        onSource={() => setSourcingProduct({ product: products.find(p => p.name.includes('Eggplant')) || products[3], demand: 30 })}
                    />
                </div>
            </div>
          </div>

          {/* RIGHT: FULFILLMENT PIPELINE */}
          <div className="xl:col-span-8">
            <div className="bg-white rounded-[3.5rem] shadow-sm border border-gray-100 overflow-hidden min-h-[600px] flex flex-col h-full">
                <div className="p-10 border-b border-gray-100 bg-white shrink-0">
                    <div className="flex justify-between items-start mb-10">
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 bg-gray-50 rounded-[1.5rem] flex items-center justify-center text-gray-900 border border-gray-100 shadow-inner-sm shrink-0">
                                <HistoryIcon size={28}/>
                            </div>
                            <div>
                                <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter leading-none">Fulfillment Pipeline</h2>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2">Managing your direct sales trade flow</p>
                            </div>
                        </div>

                        <div className="bg-gray-100/50 p-1.5 rounded-2xl flex border border-gray-200/50 shadow-inner-sm">
                            {[
                                { id: 'INCOMING', label: 'INCOMING', icon: Bell, count: incomingQueue.length },
                                { id: 'PROCESSING', label: 'PROCESSING', icon: Package, count: processingQueue.length },
                                { id: 'ACTIVE', label: 'ACTIVE RUNS', icon: Truck, count: activeFulfillment.length }
                            ].map(t => (
                                <button 
                                    key={t.id}
                                    onClick={() => setOrderSubTab(t.id as any)}
                                    className={`px-8 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 ${orderSubTab === t.id ? 'bg-white text-gray-900 shadow-md ring-1 ring-black/5' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    <t.icon size={16}/> {t.label} {t.count > 0 && <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] ${orderSubTab === t.id ? 'bg-[#3B82F6] text-white' : 'bg-gray-200 text-gray-500'}`}>{t.count}</span>}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-10 flex-1 overflow-y-auto bg-gray-50/20 custom-scrollbar space-y-6">
                    {currentList.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center opacity-30 py-32 grayscale text-center">
                            <Package size={64} className="text-gray-200 mb-6" />
                            <p className="text-sm font-black uppercase tracking-widest">No active trades in this category</p>
                        </div>
                    ) : currentList.map(order => {
                        const buyer = customers.find(c => c.id === order.buyerId);
                        return (
                            <div key={order.id} 
                                onClick={() => setSelectedOrderForAssignment(order)}
                                className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group animate-in slide-in-from-bottom-2 duration-300 cursor-pointer"
                            >
                                <div className="flex flex-col lg:flex-row justify-between items-center gap-8">
                                    <div className="flex items-center gap-8 flex-1 w-full">
                                        <div className="w-20 h-20 bg-blue-50 rounded-[1.75rem] flex items-center justify-center text-blue-600 font-black text-3xl shadow-inner-sm border border-blue-100/50 shrink-0 uppercase">
                                            {buyer?.businessName ? buyer.businessName.charAt(0) : 'B'}
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="font-black text-gray-900 text-2xl uppercase tracking-tighter leading-none mb-3 truncate group-hover:text-blue-600 transition-colors">{buyer?.businessName || 'Market Buyer'}</h4>
                                            <div className="flex flex-wrap items-center gap-6">
                                                <span className="bg-orange-50 text-orange-600 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-orange-100 shadow-sm">{order.status.toUpperCase()}</span>
                                                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2"><Clock size={14}/> LOGGED: {new Date(order.date).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-14 w-full lg:w-auto justify-between lg:justify-end border-t lg:border-0 border-gray-50 pt-8 lg:pt-0">
                                        <div className="text-left lg:text-right">
                                            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1.5">Trade Total</p>
                                            <p className="text-4xl font-black text-gray-900 tracking-tighter">${order.totalAmount.toFixed(2)}</p>
                                        </div>
                                        {order.status === 'Pending' ? (
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleAcceptOrder(order.id); }}
                                                className="px-14 py-6 bg-[#043003] hover:bg-black text-white rounded-[1.75rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-emerald-900/10 transition-all active:scale-95"
                                            >
                                                Accept Order
                                            </button>
                                        ) : (
                                            <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100 text-gray-300 transition-all group-hover:text-blue-600 group-hover:bg-blue-50 group-hover:border-blue-100">
                                                <ChevronRight size={32} strokeWidth={3}/>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
          </div>
      </div>

      {/* Sourcing Modal */}
      <DemandSourcingModal 
        isOpen={!!sourcingProduct}
        onClose={() => setSourcingProduct(null)}
        product={sourcingProduct?.product || null}
        currentDemand={sourcingProduct?.demand || 0}
        user={user}
      />

      {/* Visual Scanner Modal */}
      {isScannerModalOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[3.5rem] w-full max-w-6xl h-[90vh] overflow-hidden relative shadow-2xl flex flex-col border border-gray-100">
            <div className="p-10 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-4 uppercase">
                <Camera size={36} className="text-indigo-600"/> 
                Visual Market Capture
              </h2>
              <button 
                onClick={() => setIsScannerModalOpen(false)} 
                className="text-gray-400 hover:text-gray-900 p-2 bg-white rounded-full shadow-sm border border-gray-100 transition-all active:scale-90"
              >
                <X size={32}/>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
              <AiOpportunityMatcher user={user} />
            </div>
          </div>
        </div>
      )}

      {/* WH-ONLY MODALS */}
      <WholesalerPriceRequestModal 
          isOpen={!!activeAudit} 
          onClose={() => setActiveAudit(null)} 
          request={activeAudit!} 
          onComplete={loadData}
      />

      <OrderAssignmentModal 
          isOpen={!!selectedOrderForAssignment}
          onClose={() => setSelectedOrderForAssignment(null)}
          order={selectedOrderForAssignment}
          products={products}
          users={users}
          customers={customers}
          onAssigned={() => { loadData(); alert("Order assigned to fulfillment team."); }}
      />
    </div>
  );
};
