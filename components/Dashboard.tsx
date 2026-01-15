import React, { useState, useEffect, useRef } from 'react';
import { User, Order, Product, Customer, InventoryItem, SupplierPriceRequest, UserRole, Driver, Packer, OrderItem } from '../types';
import { mockService } from '../services/mockDataService';
import { WholesalerPriceRequestModal } from './WholesalerPriceRequestModal';
import { AiOpportunityMatcher } from './AiOpportunityMatcher';
import { Settings as SettingsComponent } from './Settings';
import { InterestsModal } from './InterestsModal';
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
  UserCheck, User as UserIcon, Send, Calendar, Printer, Leaf, Sprout,
  ChevronUp
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
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md p-2 md:p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[2rem] md:rounded-[3.5rem] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 border border-gray-100 h-full max-h-[90vh]">
                <div className="p-6 md:p-10 border-b border-gray-100 flex justify-between items-center bg-gray-50/30 shrink-0">
                    <div className="flex items-center gap-3 md:gap-5">
                        <div className="w-10 h-10 md:w-14 md:h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0">
                            <Plus size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl md:text-2xl font-black text-gray-900 uppercase tracking-tight truncate max-w-[180px] md:max-w-none">Source {product.name}</h2>
                            <p className="text-[8px] md:text-[10px] text-indigo-600 font-black uppercase tracking-widest mt-1">Deficit: {currentDemand}kg</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 md:p-3 bg-white rounded-full text-gray-400 hover:text-gray-900 shadow-sm border border-gray-100 transition-all"><X size={20} /></button>
                </div>

                <div className="p-6 md:p-10 space-y-8 flex-1 overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <div className="space-y-2 md:space-y-4">
                            <label className="block text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Quantity Needed (KG)</label>
                            <div className="relative group">
                                <Package size={20} className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-600 transition-colors"/>
                                <input 
                                    type="number" 
                                    className="w-full pl-12 md:pl-16 pr-4 py-4 md:py-6 bg-gray-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl md:rounded-[2rem] font-black text-2xl md:text-3xl text-gray-900 outline-none transition-all shadow-inner-sm"
                                    value={qty}
                                    onChange={e => setQty(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-2 md:space-y-4">
                            <label className="block text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Date Needed By</label>
                            <div className="relative group">
                                <Calendar size={20} className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-600 transition-colors"/>
                                <input 
                                    type="date" 
                                    className="w-full pl-12 md:pl-16 pr-4 py-4 md:py-6 bg-gray-50 border border-gray-100 rounded-2xl md:rounded-[2rem] font-black text-base md:text-xl text-gray-900 outline-none transition-all shadow-inner-sm appearance-none"
                                    value={neededByDate}
                                    onChange={e => setNeededByDate(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-gray-100/50 p-1 rounded-xl flex border border-gray-200/50 shadow-inner-sm overflow-x-auto no-scrollbar whitespace-nowrap">
                            <button 
                                onClick={() => setView('PARTNERS')}
                                className={`flex-1 py-2.5 px-4 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${view === 'PARTNERS' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                Partners ({partnersWithStock.length})
                            </button>
                            <button 
                                onClick={() => setView('DIRECTORY')}
                                className={`flex-1 py-2.5 px-4 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${view === 'DIRECTORY' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                Directory
                            </button>
                        </div>

                        <div className="space-y-3">
                            {view === 'PARTNERS' ? (
                                partnersWithStock.length === 0 ? (
                                    <div className="py-12 text-center bg-gray-50 border-2 border-dashed border-gray-200 rounded-[2rem]">
                                        <AlertTriangle size={32} className="mx-auto text-gray-300 mb-3"/>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-tight px-4 leading-relaxed">No existing partners have this stock available.</p>
                                    </div>
                                ) : partnersWithStock.map(p => (
                                    <div key={p.owner?.id} className="bg-white p-4 md:p-6 rounded-[1.5rem] md:rounded-3xl border border-gray-100 flex flex-col sm:flex-row items-center justify-between shadow-sm hover:shadow-md transition-all gap-4">
                                        <div className="flex items-center gap-3 md:gap-4 w-full sm:w-auto">
                                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-700 font-black shrink-0">
                                                {p.owner?.businessName.charAt(0)}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-black text-gray-900 uppercase text-xs md:text-sm truncate">{p.owner?.businessName}</p>
                                                <p className="text-[9px] md:text-[10px] text-emerald-600 font-bold uppercase tracking-widest">{p.lot.quantityKg}kg Avail.</p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handlePing(p.owner!.id)}
                                            disabled={!!isPinging}
                                            className="w-full sm:w-auto px-6 py-3 bg-[#043003] text-white rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                                        >
                                            {isPinging === p.owner?.id ? <Loader2 size={14} className="animate-spin"/> : <Zap size={14}/>}
                                            Ping Partner
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="space-y-3">
                                    {SA_PRODUCE_MARKET_SUPPLIERS.map(s => (
                                        <div key={s.id} className="bg-white p-4 md:p-6 rounded-[1.5rem] md:rounded-3xl border border-gray-100 flex flex-col sm:flex-row items-center justify-between shadow-sm hover:shadow-md transition-all gap-4">
                                            <div className="flex items-center gap-3 md:gap-4 w-full sm:w-auto">
                                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 font-black shrink-0">
                                                    {s.name.charAt(0)}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-black text-gray-900 uppercase text-xs md:text-sm truncate">{s.name}</p>
                                                    <p className="text-[9px] md:text-[10px] text-gray-400 font-bold uppercase tracking-widest">{s.specialty}</p>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => handlePing(s.id, true)}
                                                disabled={!!isPinging}
                                                className="w-full sm:w-auto px-6 py-3 bg-indigo-600 text-white rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                                            >
                                                {isPinging === s.id ? <Loader2 size={14} className="animate-spin"/> : <Globe size={14}/>}
                                                Source
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-gray-100 bg-gray-50/50 shrink-0">
                    <p className="text-[9px] text-center text-gray-400 font-black uppercase tracking-widest">
                        Requests are marked <span className="text-red-500">Urgent</span>
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
    if (!current) return null;

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
        <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] border-2 border-indigo-100 shadow-xl p-6 md:p-8 mb-8 animate-in slide-in-from-top-4 duration-500 overflow-hidden relative group mx-2">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform pointer-events-none">
                <Sparkles size={140} className="text-indigo-900"/>
            </div>
            
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6 md:gap-10 relative z-10">
                <div className="flex items-center gap-4 md:gap-6 w-full lg:w-auto">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-indigo-600 rounded-2xl md:rounded-3xl flex items-center justify-center text-white shadow-xl shadow-indigo-200 border-4 border-white shrink-0">
                        <Lock size={22} strokeWidth={2.5}/>
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[8px] md:text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em]">Morning Lock</span>
                            <span className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-gray-200"></span>
                            <span className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">{currentIndex + 1} / {sellingProducts.length}</span>
                        </div>
                        <h3 className="text-lg md:text-2xl font-black text-gray-900 uppercase tracking-tight leading-none">Update daily rates?</h3>
                    </div>
                </div>

                <div className="w-full lg:flex-1 flex items-center gap-4 md:gap-8 bg-gray-50/80 p-4 md:p-5 rounded-[1.5rem] md:rounded-3xl border border-gray-100">
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-[1.25rem] md:rounded-2xl overflow-hidden border border-gray-100 shrink-0 shadow-sm bg-white">
                        <img src={current.imageUrl} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="font-black text-gray-900 uppercase text-sm md:text-lg truncate leading-none mb-1.5 md:mb-2">{current.name}</p>
                        <p className="text-[9px] md:text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                           <History size={10}/> Yesterday: <span className="text-indigo-600 font-black">${current.defaultPricePerKg.toFixed(2)}</span>
                        </p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                    {isEditing ? (
                        <div className="flex items-center gap-2 w-full animate-in slide-in-from-right-2">
                            <div className="relative flex-1 sm:w-32 md:w-40">
                                <DollarSign size={16} className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-gray-300"/>
                                <input 
                                    autoFocus
                                    type="number" 
                                    step="0.01"
                                    className="w-full pl-8 md:pl-10 pr-3 md:pr-4 py-3 md:py-4 bg-white border-2 border-indigo-600 rounded-xl md:rounded-2xl font-black text-lg md:text-xl text-gray-900 outline-none shadow-inner-sm"
                                    value={newPrice}
                                    onChange={e => setNewPrice(e.target.value)}
                                    placeholder="0.00"
                                />
                            </div>
                            <button onClick={handleUpdate} className="px-6 md:px-10 py-3 md:py-4 bg-indigo-600 text-white rounded-xl md:rounded-2xl font-black text-[9px] md:text-[11px] uppercase tracking-widest shadow-xl">Lock</button>
                            <button onClick={() => setIsEditing(false)} className="p-3 md:p-4 text-gray-400 hover:text-gray-900 transition-colors bg-gray-50 rounded-xl md:rounded-2xl"><X size={20}/></button>
                        </div>
                    ) : (
                        <>
                            <button 
                                onClick={handleNext}
                                className="w-full sm:w-auto px-6 md:px-10 py-4 md:py-5 bg-emerald-500 text-white rounded-xl md:rounded-2xl font-black text-[9px] md:text-[11px] uppercase tracking-widest shadow-xl shadow-emerald-100 transition-all flex items-center justify-center gap-2"
                            >
                                <CheckCircle size={16}/> No Change
                            </button>
                            <button 
                                onClick={() => setIsEditing(true)}
                                className="w-full sm:w-auto px-6 md:px-10 py-4 md:py-5 bg-[#0F172A] text-white rounded-xl md:rounded-2xl font-black text-[9px] md:text-[11px] uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-2"
                            >
                                <Pencil size={16}/> Update
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

const DemandMatrixItem = ({ product, item, demand, onSource }: { product: Product | undefined, item?: InventoryItem, demand: number, onSource: () => void }) => {
    if (!product) return null;
    const onHand = item?.quantityKg || 0;
    const deficit = demand - onHand;
    const progress = Math.min(100, (onHand / demand) * 100);

    return (
        <div 
            onClick={onSource}
            className="p-4 md:p-6 bg-white rounded-2xl md:rounded-3xl border border-gray-100 space-y-4 hover:shadow-md transition-all cursor-pointer group"
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 md:gap-4 min-w-0">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl overflow-hidden border border-gray-100 shadow-sm shrink-0">
                        <img src={product.imageUrl} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                        <h4 className="font-black text-gray-900 text-xs md:text-sm uppercase leading-none tracking-tight group-hover:text-indigo-600 transition-colors truncate">{product.name}</h4>
                        <p className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1 truncate">{product.variety}</p>
                    </div>
                </div>
                <button 
                    onClick={(e) => { e.stopPropagation(); onSource(); }}
                    className="p-1.5 md:p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0"
                >
                    <Plus size={16} strokeWidth={3}/>
                </button>
            </div>

            <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div className="p-2.5 md:p-3 bg-gray-50 rounded-xl md:rounded-2xl border border-gray-100">
                    <p className="text-[7px] md:text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5 md:mb-1">On Hand</p>
                    <p className="text-xs md:text-sm font-black text-gray-900">{onHand}kg</p>
                </div>
                <div className="p-2.5 md:p-3 bg-indigo-50/50 rounded-xl md:rounded-2xl border border-indigo-100">
                    <p className="text-[7px] md:text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-0.5 md:mb-1">Demand</p>
                    <p className="text-xs md:text-sm font-black text-indigo-900">{demand}kg</p>
                </div>
            </div>

            <div className="space-y-1.5 md:space-y-2">
                <div className="w-full bg-gray-100 h-1 md:h-1.5 rounded-full overflow-hidden shadow-inner-sm">
                    <div 
                        className={`h-full transition-all duration-1000 ${deficit > 0 ? 'bg-orange-500' : 'bg-emerald-500'}`} 
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
                {deficit > 0 && (
                    <p className="text-[8px] md:text-[9px] font-black text-orange-600 uppercase tracking-widest flex items-center gap-1">
                        <AlertTriangle size={10}/> Stock Deficit
                    </p>
                )}
            </div>
        </div>
    );
};

const OrderAssignmentModal = ({ isOpen, onClose, order, products, users, customers, onAssigned }: {
    isOpen: boolean,
    onClose: () => void,
    order: Order | null,
    products: Product[],
    users: User[],
    customers: Customer[],
    onAssigned: () => void
}) => {
    const [selectedPacker, setSelectedPacker] = useState('');
    const [selectedDriver, setSelectedDriver] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    if (!isOpen || !order) return null;

    const buyer = customers.find(c => c.id === order.buyerId);
    const wholesalersPackers = mockService.getPackers(order.sellerId);
    const wholesalersDrivers = mockService.getDrivers(order.sellerId);

    const handleAssign = async () => {
        if (!selectedPacker || !selectedDriver) {
            alert("Please select both a packer and a driver.");
            return;
        }
        setIsSaving(true);
        await new Promise(r => setTimeout(r, 800));
        mockService.assignOrderToTeam(order.id, selectedPacker, selectedDriver);
        setIsSaving(false);
        onAssigned();
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 border border-gray-100">
                <div className="p-8 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center bg-white gap-6 shrink-0">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-blue-50 rounded-[1.25rem] flex items-center justify-center text-blue-600 font-black text-2xl shadow-inner border border-blue-100">
                            {buyer?.businessName ? buyer.businessName.charAt(0) : 'B'}
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter leading-none">{buyer?.businessName || 'Market Buyer'}</h2>
                            <div className="flex items-center gap-4 mt-3">
                                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">Confirmed</span>
                                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5"><Clock size={12}/> Logged: {new Date(order.date).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-8">
                        <div className="text-right">
                            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Trade Total</p>
                            <p className="text-4xl font-black text-gray-900 tracking-tighter leading-none">${order.totalAmount.toFixed(2)}</p>
                        </div>
                        <button onClick={onClose} className="p-4 bg-gray-50 text-gray-400 hover:text-gray-900 rounded-2xl transition-all"><ChevronUp size={24} strokeWidth={3}/></button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-10 bg-white custom-scrollbar">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* LEFT: ORDER MANIFEST */}
                        <div className="space-y-6">
                            <h3 className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.3em] flex items-center gap-2">
                                <Boxes size={18}/> Order Manifest
                            </h3>
                            <div className="border border-gray-100 rounded-[2rem] overflow-hidden bg-gray-50/20 shadow-inner-sm">
                                <table className="w-full text-left">
                                    <thead className="bg-white border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                        <tr>
                                            <th className="px-8 py-5">Item</th>
                                            <th className="px-8 py-5">Qty</th>
                                            <th className="px-8 py-5 text-right">Price</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {order.items.map((item, idx) => {
                                            const p = products.find(prod => prod.id === item.productId);
                                            return (
                                                <tr key={idx} className="group hover:bg-white transition-colors">
                                                    <td className="px-8 py-6">
                                                        <div className="font-black text-gray-900 uppercase text-sm tracking-tight">{p?.name || 'Produce Item'}</div>
                                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{p?.variety || 'Standard'}</p>
                                                    </td>
                                                    <td className="px-8 py-6 font-black text-gray-600 text-sm">{item.quantityKg}{p?.unit || 'KG'}</td>
                                                    <td className="px-8 py-6 text-right font-black text-gray-900 text-sm">${(item.quantityKg * item.pricePerKg).toFixed(2)}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* RIGHT: TEAM ASSIGNMENT */}
                        <div className="space-y-10">
                            <div className="space-y-6">
                                <h3 className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.3em] flex items-center gap-2">
                                    Assign Operations Team
                                </h3>
                                
                                <div className="space-y-4">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Select Packer</label>
                                    <div className="relative group">
                                        <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-600 transition-colors" size={20}/>
                                        <select 
                                            className="w-full pl-12 pr-10 py-5 bg-gray-50 border-2 border-gray-100 rounded-2xl font-black text-sm text-gray-900 outline-none focus:bg-white focus:border-indigo-500 appearance-none transition-all shadow-inner-sm"
                                            value={selectedPacker}
                                            onChange={e => setSelectedPacker(e.target.value)}
                                        >
                                            <option value="">Select team member...</option>
                                            {wholesalersPackers.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                                        </select>
                                        <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none"/>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Select Driver</label>
                                    <div className="relative group">
                                        <Truck className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-600 transition-colors" size={20}/>
                                        <select 
                                            className="w-full pl-12 pr-10 py-5 bg-gray-50 border-2 border-gray-100 rounded-2xl font-black text-sm text-gray-900 outline-none focus:bg-white focus:border-indigo-500 appearance-none transition-all shadow-inner-sm"
                                            value={selectedDriver}
                                            onChange={e => setSelectedDriver(e.target.value)}
                                        >
                                            <option value="">Select team member...</option>
                                            {wholesalersDrivers.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                                        </select>
                                        <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none"/>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-indigo-50/50 p-8 rounded-[2rem] border border-indigo-100 flex items-start gap-5">
                                <Info size={24} className="text-indigo-600 shrink-0 mt-1"/>
                                <p className="text-xs text-indigo-800 font-medium leading-relaxed">
                                    Finalizing this assignment will notify both the <span className="font-black">Packer</span> and <span className="font-black">Driver</span> via their trade portals. The order will move to <span className="font-black text-indigo-900 italic">Processing</span> status.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-8 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row gap-4 shrink-0">
                    <button 
                        onClick={onClose} 
                        className="flex-1 py-5 bg-white border-2 border-gray-200 text-gray-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-100 transition-all active:scale-95 shadow-sm"
                    >
                        Discard
                    </button>
                    <button 
                        className="flex-1 py-5 bg-white border-2 border-gray-900 text-gray-900 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-gray-50 transition-all active:scale-95 shadow-sm flex items-center justify-center gap-3"
                    >
                        <Printer size={18}/> Print Slip
                    </button>
                    <button 
                        onClick={handleAssign}
                        disabled={isSaving || !selectedPacker || !selectedDriver}
                        className="flex-[2] py-5 bg-[#043003] text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 className="animate-spin" size={20}/> : <><CheckCircle size={20} strokeWidth={3}/> Commit Fulfillment Team</>}
                    </button>
                </div>
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
  const [isInterestsModalOpen, setIsInterestsModalOpen] = useState(false);
  
  const [sourcingProduct, setSourcingProduct] = useState<{product: Product, demand: number} | null>(null);
  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);

  // Refs for scrolling logic
  const pipelineRef = useRef<HTMLDivElement>(null);
  const demandRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    if ((user.role === UserRole.WHOLESALER || user.role === UserRole.FARMER) && 
        (!user.activeSellingInterests || user.activeSellingInterests.length === 0)) {
        setIsInterestsModalOpen(true);
    }
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
  };

  const scrollToPipeline = (tab: 'INCOMING' | 'PROCESSING' | 'ACTIVE') => {
    setOrderSubTab(tab);
    pipelineRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const scrollToDemand = () => {
    demandRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const incomingQueue = orders.filter(o => o.status === 'Pending');
  const processingQueue = orders.filter(o => ['Confirmed', 'Ready for Delivery'].includes(o.status));
  const activeFulfillment = orders.filter(o => o.status === 'Shipped');

  const currentList = orderSubTab === 'INCOMING' ? incomingQueue : 
                      orderSubTab === 'PROCESSING' ? processingQueue : activeFulfillment;

  const inventory = mockService.getInventory(user.id);
  const products = mockService.getAllProducts();
  const users = mockService.getAllUsers();

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-20 max-w-[1600px] mx-auto px-2">
      
      {/* HEADER SECTION - Responsive Layout */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tighter uppercase leading-none">Partner Operations</h1>
          <div className="flex flex-wrap items-center gap-3 md:gap-4">
              <p className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">Management Console</p>
              <span className="w-1 h-1 rounded-full bg-gray-200"></span>
              <p className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest truncate max-w-[120px] md:max-w-none">{user.businessName}</p>
              
              <div className="flex bg-gray-100 p-1 rounded-xl gap-1 border border-gray-200 shadow-inner-sm shrink-0">
                  <button onClick={() => setActiveView('OPS')} className={`px-3 md:px-5 py-1.5 rounded-lg text-[8px] md:text-[9px] font-black uppercase tracking-widest transition-all ${activeView === 'OPS' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>Ops</button>
                  <button onClick={() => setActiveView('PROCUREMENT')} className={`px-3 md:px-5 py-1.5 rounded-lg text-[8px] md:text-[9px] font-black uppercase tracking-widest transition-all ${activeView === 'PROCUREMENT' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>Procurement</button>
              </div>
          </div>
        </div>
        <button 
            onClick={() => setIsScannerModalOpen(true)}
            className="w-full lg:w-auto px-10 py-5 bg-[#3B82F6] hover:bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20 transition-all active:scale-95 flex items-center justify-center gap-3 group"
        >
            <ScannerIcon size={20} className="group-hover:rotate-12 transition-transform" /> Visual Scanner
        </button>
      </div>

      {/* KPI ROW - Responsive Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {[
              { id: 'ORDERS', label: 'ORDERS TODAY', value: incomingQueue.length + processingQueue.length, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50', action: () => scrollToPipeline('INCOMING') },
              { id: 'WHOLESALERS', label: 'WHOLESALERS', value: '2', icon: Globe, color: 'text-indigo-600', bg: 'bg-indigo-50', action: () => navigate('/contacts') },
              { id: 'ROAD', label: 'ON THE ROAD', value: activeFulfillment.length, icon: Truck, color: 'text-emerald-600', bg: 'bg-emerald-50', action: () => scrollToPipeline('ACTIVE') },
              { id: 'REVENUE', label: 'REVENUE', value: `$${processingQueue.reduce((s, o) => s + o.totalAmount, 0).toLocaleString()}`, icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-50', action: () => navigate('/accounts') }
          ].map((card, i) => (
              <button 
                key={i} 
                onClick={card.action}
                className="bg-white p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] shadow-sm border border-gray-100 flex flex-col justify-between h-32 md:h-40 group hover:shadow-md hover:border-emerald-100 transition-all text-left outline-none"
              >
                  <span className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] leading-none truncate">{card.label}</span>
                  <div className="flex justify-between items-end w-full">
                      <h3 className="text-xl md:text-4xl font-black text-gray-900 tracking-tighter truncate pr-2">{card.value}</h3>
                      <div className={`p-2 md:p-3 rounded-xl md:rounded-2xl ${card.bg} ${card.color} border border-white shadow-inner-sm shrink-0 group-hover:scale-110 transition-transform`}>
                          <card.icon size={16} />
                      </div>
                  </div>
              </button>
          ))}
      </div>

      {/* Market Alignment Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
          <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-gray-100 shadow-sm p-6 md:p-8 flex flex-col sm:flex-row items-center justify-between group hover:shadow-md transition-all gap-6">
            <div className="flex items-center gap-4 md:gap-6 w-full">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-indigo-50 text-[#4A3AFF] rounded-[1.25rem] md:rounded-[1.75rem] flex items-center justify-center border border-indigo-100 shadow-inner-sm shrink-0">
                    <Sparkles size={24}/>
                </div>
                <div className="min-w-0 flex-1">
                    <h3 className="text-lg md:text-xl font-black text-gray-900 uppercase tracking-tight leading-none">Market Focus</h3>
                    <div className="flex flex-wrap gap-1.5 md:gap-2 mt-3 md:mt-4">
                        {(user.activeSellingInterests || []).slice(0, 4).map(i => (
                            <span key={i} className="bg-indigo-50 text-[#4A3AFF] px-2 md:px-3 py-0.5 md:py-1 rounded-lg text-[7px] md:text-[9px] font-black uppercase border border-indigo-100">{i}</span>
                        ))}
                    </div>
                </div>
            </div>
            <button 
                onClick={() => setIsInterestsModalOpen(true)}
                className="w-full sm:w-auto px-6 py-3.5 bg-white border-2 border-[#4A3AFF] text-[#4A3AFF] rounded-xl md:rounded-2xl font-black text-[9px] md:text-[10px] uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-sm active:scale-95 whitespace-nowrap"
            >
                Edit
            </button>
          </div>

          <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-gray-100 shadow-sm p-6 md:p-8 flex items-center justify-between group hover:shadow-md transition-all gap-4">
             <div className="flex items-center gap-4 md:gap-6">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-emerald-50 text-emerald-600 rounded-[1.25rem] md:rounded-[1.75rem] flex items-center justify-center border border-emerald-100 shadow-inner-sm shrink-0">
                    <Sprout size={24}/>
                </div>
                <div>
                    <h3 className="text-lg md:text-xl font-black text-gray-900 uppercase tracking-tight leading-none">Impact</h3>
                    <p className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Carbon Offset: <span className="text-emerald-600 font-black">420kg</span></p>
                </div>
             </div>
             <button onClick={() => navigate('/impact')} className="p-3 md:p-4 rounded-xl md:rounded-2xl bg-gray-50 text-gray-300 group-hover:text-emerald-600 group-hover:bg-emerald-50 transition-all shadow-sm">
                <ArrowRight size={20} strokeWidth={3}/>
             </button>
          </div>
      </div>

      {showPriceLock && (
          <MorningPriceLock user={user} products={products} onComplete={() => setShowPriceLock(false)} />
      )}

      {/* MAIN TWO-COLUMN LAYOUT - Responsive Stack */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 md:gap-8">
          
          {/* LEFT: DEMAND MATRIX */}
          <div className="xl:col-span-4 h-fit" ref={demandRef}>
            <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                <div className="p-6 md:p-8 border-b border-gray-100 bg-gray-50/20 shrink-0">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-9 h-9 md:w-10 md:h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shrink-0"><LayoutGrid size={18}/></div>
                        <h2 className="text-lg md:text-xl font-black text-gray-900 uppercase tracking-tight">Demand Matrix</h2>
                    </div>
                </div>
                <div className="p-4 md:p-6 space-y-4 bg-gray-50/30">
                    <DemandMatrixItem 
                        product={products.find(p => p.name.includes('Tomatoes')) || products[0]} 
                        item={inventory.find(i => i.productId === 'p1')}
                        demand={50}
                        onSource={() => setSourcingProduct({ product: products.find(p => p.name.includes('Tomatoes')) || products[0] || null, demand: 50 })}
                    />
                    <DemandMatrixItem 
                        product={products.find(p => p.name.includes('Lettuce')) || products[1]} 
                        item={inventory.find(i => i.productId === 'p2')}
                        demand={50}
                        onSource={() => setSourcingProduct({ product: products.find(p => p.name.includes('Lettuce')) || products[1] || null, demand: 50 })}
                    />
                </div>
            </div>
          </div>

          {/* RIGHT: FULFILLMENT PIPELINE */}
          <div className="xl:col-span-8" ref={pipelineRef}>
            <div className="bg-white rounded-[2rem] md:rounded-[3.5rem] shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full min-h-[400px] md:min-h-[600px]">
                <div className="p-6 md:p-10 border-b border-gray-100 bg-white shrink-0">
                    <div className="flex flex-col lg:flex-row justify-between items-start gap-6 lg:gap-10">
                        <div className="flex items-center gap-4 md:gap-5">
                            <div className="w-12 h-12 md:w-14 md:h-14 bg-gray-50 rounded-[1.25rem] md:rounded-[1.5rem] flex items-center justify-center text-gray-900 border border-gray-100 shadow-inner-sm shrink-0">
                                <HistoryIcon size={24}/>
                            </div>
                            <div>
                                <h2 className="text-2xl md:text-3xl font-black text-gray-900 uppercase tracking-tighter leading-none">Fulfillment Pipeline</h2>
                                <p className="text-[9px] md:text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1.5 md:mt-2">Managing direct trade flow</p>
                            </div>
                        </div>

                        <div className="bg-gray-100/50 p-1 rounded-xl md:rounded-2xl flex border border-gray-200/50 shadow-inner-sm w-full lg:w-auto overflow-x-auto no-scrollbar">
                            {[
                                { id: 'INCOMING', label: 'INCOMING', icon: Bell, count: incomingQueue.length },
                                { id: 'PROCESSING', label: 'PROCESSING', icon: Package, count: processingQueue.length },
                                { id: 'ACTIVE', label: 'ACTIVE', icon: Truck, count: activeFulfillment.length }
                            ].map(t => (
                                <button 
                                    key={t.id}
                                    onClick={() => setOrderSubTab(t.id as any)}
                                    className={`flex-1 md:flex-none px-4 md:px-8 py-2.5 md:py-3.5 rounded-lg md:rounded-xl text-[8px] md:text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 md:gap-3 whitespace-nowrap ${orderSubTab === t.id ? 'bg-white text-gray-900 shadow-md ring-1 ring-black/5' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    <t.icon size={14}/> {t.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-4 md:p-10 flex-1 overflow-y-auto bg-gray-50/20 custom-scrollbar space-y-4 md:space-y-6">
                    {currentList.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center opacity-30 py-24 md:py-32 grayscale text-center px-6">
                            <Package size={48} className="text-gray-200 mb-6" />
                            <p className="text-[10px] md:text-sm font-black uppercase tracking-widest">No active trades in this category</p>
                        </div>
                    ) : currentList.map(order => {
                        const buyer = customers.find(c => c.id === order.buyerId);
                        return (
                            <div key={order.id} 
                                onClick={() => setSelectedOrderForAssignment(order)}
                                className="bg-white p-5 md:p-8 rounded-[1.75rem] md:rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group animate-in slide-in-from-bottom-2 duration-300 cursor-pointer"
                            >
                                <div className="flex flex-col lg:flex-row justify-between items-center gap-6 md:gap-8">
                                    <div className="flex items-center gap-4 md:gap-8 flex-1 w-full min-w-0">
                                        <div className="w-14 h-14 md:w-20 md:h-20 bg-blue-50 rounded-[1.25rem] md:rounded-[1.75rem] flex items-center justify-center text-blue-600 font-black text-xl md:text-3xl shadow-inner-sm border border-blue-100/50 shrink-0 uppercase">
                                            {buyer?.businessName ? buyer.businessName.charAt(0) : 'B'}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h4 className="font-black text-gray-900 text-lg md:text-2xl uppercase tracking-tighter leading-none mb-2 md:mb-3 truncate group-hover:text-blue-600 transition-colors">{buyer?.businessName || 'Market Buyer'}</h4>
                                            <div className="flex flex-wrap items-center gap-3 md:gap-6">
                                                <span className={`px-2 md:px-4 py-1 rounded-xl text-[8px] md:text-[10px] font-black uppercase tracking-widest border shadow-sm ${order.status === 'Pending' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>{order.status.toUpperCase()}</span>
                                                <span className="text-[9px] md:text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 md:gap-2"><Clock size={12}/> LOGGED: {new Date(order.date).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6 md:gap-14 w-full lg:w-auto justify-between lg:justify-end border-t lg:border-0 border-gray-50 pt-5 lg:pt-0">
                                        <div className="text-left lg:text-right min-w-[80px]">
                                            <p className="text-[8px] md:text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Total</p>
                                            <p className="text-xl md:text-4xl font-black text-gray-900 tracking-tighter leading-none">${order.totalAmount.toFixed(2)}</p>
                                        </div>
                                        {order.status === 'Pending' ? (
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleAcceptOrder(order.id); }}
                                                className="px-6 md:px-14 py-3.5 md:py-6 bg-[#043003] hover:bg-black text-white rounded-xl md:rounded-[1.75rem] font-black text-[9px] md:text-xs uppercase tracking-[0.15em] md:tracking-[0.2em] shadow-xl shadow-emerald-900/10 transition-all active:scale-95 flex-1 md:flex-none"
                                            >
                                                Accept
                                            </button>
                                        ) : (
                                            <div className="p-3 md:p-5 rounded-xl md:rounded-2xl bg-gray-50 border border-gray-100 text-gray-300 transition-all group-hover:text-blue-600 group-hover:bg-blue-50 group-hover:border-blue-100">
                                                <ChevronRight size={24} strokeWidth={3}/>
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

      <InterestsModal 
        user={user}
        isOpen={isInterestsModalOpen}
        onClose={() => setIsInterestsModalOpen(false)}
        onSaved={loadData}
      />

      <DemandSourcingModal 
        isOpen={!!sourcingProduct}
        onClose={() => setSourcingProduct(null)}
        product={sourcingProduct?.product || null}
        currentDemand={sourcingProduct?.demand || 0}
        user={user}
      />

      {isScannerModalOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/70 backdrop-blur-md p-2 md:p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] md:rounded-[3.5rem] w-full max-w-6xl h-full max-h-[90vh] overflow-hidden relative shadow-2xl flex flex-col border border-gray-100">
            <div className="p-6 md:p-10 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
              <h2 className="text-xl md:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3 md:gap-4 uppercase leading-none truncate">
                <Camera size={28} className="text-indigo-600 shrink-0"/> 
                Visual Scanner
              </h2>
              <button 
                onClick={() => setIsScannerModalOpen(false)} 
                className="text-gray-400 hover:text-gray-900 p-2 md:p-2 bg-white rounded-full shadow-sm border border-gray-100 transition-all active:scale-90"
              >
                <X size={24}/>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 md:p-12 custom-scrollbar">
              <AiOpportunityMatcher user={user} />
            </div>
          </div>
        </div>
      )}

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
          onAssigned={() => { loadData(); }}
      />
    </div>
  );
};
