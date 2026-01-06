import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, UserRole, Product, InventoryItem, OrderItem, Order } from '../types';
import { mockService } from '../services/mockDataService';
import { 
  Store, MapPin, Tag, MessageSquare, ChevronDown, ChevronUp, ShoppingCart, 
  X, CheckCircle, Bell, DollarSign, Truck, Send, 
  TrendingUp, Loader2, Users, Zap, Star, AlertCircle, Package, ArrowRight,
  HelpCircle, BrainCircuit, ShieldCheck, Globe, Info, Search, Filter, 
  Lock, ShoppingBag, Plus, Sparkles, MessageCircle, Gavel, CreditCard, Banknote,
  Smartphone, Mail, Copy, Check, Sprout, Heart
} from 'lucide-react';
import { ChatDialog } from './ChatDialog';
import { triggerNativeSms, generateProductDeepLink } from '../services/smsService';

interface SupplierMarketProps {
  user: User;
}

const AddSupplierModal = ({ isOpen, onClose, prefilledName = '', prefilledEmail = '', prefilledMobile = '', buyerName = '' }: { 
    isOpen: boolean, 
    onClose: () => void,
    prefilledName?: string,
    prefilledEmail?: string,
    prefilledMobile?: string,
    buyerName: string
}) => {
    const [formData, setFormData] = useState({ name: '', email: '', mobile: '' });
    const [step, setStep] = useState<'form' | 'success'>('form');

    useEffect(() => {
        setFormData({ name: prefilledName, email: prefilledEmail, mobile: prefilledMobile });
    }, [prefilledName, prefilledEmail, prefilledMobile]);

    if (!isOpen) return null;

    const connectionNote = `Hi ${formData.name || 'Partner'}! 👋 ${buyerName} is looking to purchase from you. They'd love to connect and start trading on Platform Zero.`;

    const handleSendInvite = (method: 'SMS' | 'EMAIL') => {
        const link = `https://platformzero.com.au/join-partner?ref=${mockService.getAllUsers().find(u => u.businessName === buyerName)?.id || 'u2'}`;
        const msg = `${connectionNote} Sign up here to view their inquiry: ${link}`;
        
        if (method === 'SMS') triggerNativeSms(formData.mobile, msg);
        else window.location.href = `mailto:${formData.email}?subject=Inquiry from ${buyerName} via Platform Zero&body=${encodeURIComponent(msg)}`;
        
        setStep('success');
    };

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
                <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Add Supplier</h2>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Direct Network Expansion</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24}/></button>
                </div>
                <div className="p-10 space-y-6">
                    {step === 'form' ? (
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <input placeholder="Contact Name" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-indigo-50" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}/>
                                <input placeholder="Email Address" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-indigo-50" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}/>
                                <input placeholder="Mobile Number" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-indigo-50" value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})}/>
                            </div>

                            <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100/50 relative overflow-hidden group">
                                <span className="absolute -top-1 -right-1 opacity-[0.03] rotate-12 group-hover:scale-110 transition-transform"><MessageSquare size={80}/></span>
                                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2 flex items-center gap-1.5"><Heart size={10}/> Personal Connection Note</p>
                                <p className="text-xs text-emerald-800 font-medium italic leading-relaxed">
                                    "{connectionNote}"
                                </p>
                            </div>

                            <div className="pt-4 grid grid-cols-2 gap-3">
                                <button onClick={() => handleSendInvite('SMS')} className="py-5 bg-[#059669] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/10 active:scale-95 transition-all"><Smartphone size={18}/> Send SMS</button>
                                <button onClick={() => handleSendInvite('EMAIL')} className="py-5 bg-[#0F172A] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-slate-500/10 active:scale-95 transition-all"><Mail size={18}/> Send Email</button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-6 space-y-6">
                            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 border-4 border-white shadow-xl"><CheckCircle size={40}/></div>
                            <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Invitation Dispatched</h3>
                            <p className="text-sm text-gray-500 font-medium leading-relaxed">Your personalized connection request has been sent to <span className="font-black text-gray-900">{formData.name}</span>. Once they join, they will appear in your Partner Supply list.</p>
                            <button onClick={onClose} className="w-full py-5 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-black transition-all active:scale-95">Return to Market</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const NegotiateModal = ({ isOpen, onClose, item, product, supplier, user }: any) => {
    const [offerPrice, setOfferPrice] = useState(product?.defaultPricePerKg.toString() || '');
    const [offerQty, setOfferQty] = useState('100');
    const [isSending, setIsSending] = useState(false);

    if (!isOpen) return null;

    const handleSendNegotiation = () => {
        setIsSending(true);
        const link = generateProductDeepLink('quote', 'neg-' + Date.now());
        const msg = `Hi ${supplier.businessName}! 👋 ${user.businessName} is looking to purchase from you. They've sent a special offer for ${offerQty}kg of your ${product.name} at $${offerPrice}/kg. Check it out and respond here: ${link}`;
        triggerNativeSms(supplier.phone || '0400000000', msg);
        
        setTimeout(() => {
            setIsSending(false);
            alert("Negotiation dispatched to supplier!");
            onClose();
        }, 1000);
    };

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
                <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-indigo-50/30">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Negotiate Lot</h2>
                        <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest mt-1">Trading with {supplier.businessName}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24}/></button>
                </div>
                <div className="p-10 space-y-8">
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <img src={product.imageUrl} className="w-12 h-12 rounded-xl object-cover" alt=""/>
                        <div>
                            <p className="font-black text-gray-900 text-sm uppercase">{product.name}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Market Rate: ${product.defaultPricePerKg}/kg</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">YOUR OFFER PRICE ($/KG)</label>
                            <div className="relative">
                                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-600" size={24}/>
                                <input type="number" step="0.01" className="w-full pl-12 pr-6 py-6 bg-gray-50 border-2 border-transparent focus:border-indigo-500 rounded-[1.5rem] font-black text-4xl text-gray-900 outline-none transition-all shadow-inner-sm" value={offerPrice} onChange={e => setOfferPrice(e.target.value)}/>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">OFFER QUANTITY (KG)</label>
                            <div className="relative">
                                <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
                                <input type="number" className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-black text-xl text-gray-900 outline-none focus:ring-4 focus:ring-indigo-50" value={offerQty} onChange={e => setOfferQty(e.target.value)}/>
                            </div>
                        </div>
                    </div>

                    <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100/50">
                        <p className="text-[10px] text-emerald-800 font-medium leading-relaxed italic">
                            "Hi {supplier.businessName}! We'd like to connect and purchase this lot from you..."
                        </p>
                    </div>

                    <button 
                        onClick={handleSendNegotiation}
                        disabled={isSending || !offerPrice || !offerQty}
                        className="w-full py-5 bg-[#043003] text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3 active:scale-95"
                    >
                        {isSending ? <Loader2 className="animate-spin"/> : <><Gavel size={20}/> Send Offer to Supplier</>}
                    </button>
                </div>
            </div>
        </div>
    );
};

const SupplierCheckoutModal = ({ isOpen, onClose, item, product, supplier, user, onComplete }: any) => {
    const [paymentMethod, setPaymentMethod] = useState<'invoice' | 'pay_now'>('invoice');
    const [isProcessing, setIsProcessing] = useState(false);
    const [qty, setQty] = useState(item?.quantityKg || 100);

    if (!isOpen || !item) return null;

    const baseTotal = qty * product.defaultPricePerKg;
    const logisticsFee = item.logisticsPrice || 0;
    const subtotal = baseTotal + logisticsFee;
    const creditSurcharge = paymentMethod === 'pay_now' ? subtotal * 0.05 : 0;
    const finalTotal = subtotal + creditSurcharge;

    const handleConfirmPurchase = async () => {
        setIsProcessing(true);
        const order = mockService.createInstantOrder(user.id, item, qty, product.defaultPricePerKg);
        order.totalAmount = finalTotal;
        order.paymentMethod = paymentMethod;
        order.status = 'Confirmed';
        
        mockService.addAppNotification(user.id, 'Trade Finalized', `Invoice generated for ${product.name}. Total: $${finalTotal.toFixed(2)}`, 'ORDER');
        mockService.addAppNotification(supplier.id, 'New Sale Receipt', `Buyer ${user.businessName} purchased ${qty}kg of ${product.name}. Settlement in progress.`, 'ORDER');

        await new Promise(r => setTimeout(r, 1500));
        setIsProcessing(false);
        alert(`Purchase Confirmed!\n\nBuyer: INV-${order.id.split('-').pop()} generated.\nSupplier: Receipt sent to ${supplier.businessName}.\n\n${paymentMethod === 'pay_now' ? 'PZ will settle with supplier within 48 hours.' : 'Standard payment terms applied.'}`);
        onComplete();
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] animate-in zoom-in-95">
                <div className="w-full md:w-[360px] bg-gray-50 border-r border-gray-100 p-10 flex flex-col">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-emerald-600"><ShoppingCart size={24}/></div>
                        <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Market Trade</h2>
                    </div>

                    <div className="flex-1 space-y-6">
                        <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-inner-sm flex items-center gap-4">
                            <img src={product.imageUrl} className="w-12 h-12 rounded-xl object-cover" alt=""/>
                            <div>
                                <p className="font-black text-gray-900 text-xs uppercase leading-none">{product.name}</p>
                                <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">{qty}kg @ ${product.defaultPricePerKg}/kg</p>
                            </div>
                        </div>

                        <div className="space-y-4 pt-6 border-t border-gray-200">
                            <div className="flex justify-between items-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                <span>Subtotal</span>
                                <span className="text-gray-900">${baseTotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                <span>Logistics Fee</span>
                                <span className="text-gray-900">${logisticsFee.toFixed(2)}</span>
                            </div>
                            {creditSurcharge > 0 && (
                                <div className="flex justify-between items-center text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                                    <span>5% Credit Surcharge</span>
                                    <span>+${creditSurcharge.toFixed(2)}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="pt-10">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Payable</p>
                        <h3 className="text-5xl font-black text-[#043003] tracking-tighter">${finalTotal.toFixed(2)}</h3>
                    </div>
                </div>

                <div className="flex-1 p-10 overflow-y-auto space-y-12">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase leading-none">Instant Procurement</h2>
                            <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest mt-2">Trade Confirmation & Settlement</p>
                        </div>
                        <button onClick={onClose} className="text-gray-300 hover:text-gray-900 p-2"><X size={32}/></button>
                    </div>

                    <div className="space-y-8">
                        <div>
                            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                <DollarSign size={14}/> SETTLEMENT METHOD
                            </h3>
                            <div className="space-y-3">
                                <button 
                                    onClick={() => setPaymentMethod('invoice')}
                                    className={`w-full p-6 rounded-3xl border-2 transition-all text-left flex items-center justify-between group ${paymentMethod === 'invoice' ? 'border-[#043003] bg-emerald-50/20' : 'border-gray-100 bg-white hover:border-gray-300'}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${paymentMethod === 'invoice' ? 'border-[#043003] bg-[#043003] text-white' : 'border-gray-200'}`}>
                                            {paymentMethod === 'invoice' && <Check size={12} strokeWidth={4}/>}
                                        </div>
                                        <div>
                                            <p className="font-black text-gray-900 uppercase text-sm leading-none">Direct Invoice</p>
                                            <p className="text-[10px] text-gray-400 font-bold mt-1.5 uppercase tracking-widest">Standard terms per agreement</p>
                                        </div>
                                    </div>
                                    <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-indigo-100">Most Popular</span>
                                </button>

                                <button 
                                    onClick={() => setPaymentMethod('pay_now')}
                                    className={`w-full p-6 rounded-3xl border-2 transition-all text-left flex items-center justify-between group ${paymentMethod === 'pay_now' ? 'border-[#043003] bg-emerald-50/20' : 'border-gray-100 bg-white hover:border-gray-300'}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${paymentMethod === 'pay_now' ? 'border-[#043003] bg-[#043003] text-white' : 'border-gray-200'}`}>
                                            {paymentMethod === 'pay_now' && <Check size={12} strokeWidth={4}/>}
                                        </div>
                                        <div>
                                            <p className="font-black text-gray-900 uppercase text-sm leading-none">Credit Card</p>
                                            <p className="text-[10px] text-gray-400 font-bold mt-1.5 uppercase tracking-widest">5% Surcharge applies</p>
                                        </div>
                                    </div>
                                    <CreditCard size={20} className="text-gray-300 group-hover:text-indigo-500 transition-colors"/>
                                </button>
                            </div>
                        </div>

                        {paymentMethod === 'pay_now' && (
                            <div className="bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100 flex items-start gap-4 animate-in slide-in-from-top-2">
                                <div className="p-3 bg-white rounded-2xl text-indigo-600 shadow-sm border border-indigo-50"><ShieldCheck size={24}/></div>
                                <div>
                                    <p className="text-xs font-black text-indigo-900 uppercase tracking-tight">Escrow Fulfillment Protocol</p>
                                    <p className="text-[11px] text-indigo-700 font-medium leading-relaxed mt-1">PZ will collect the total amount and settle with the supplier within <span className="font-black text-indigo-900">48 hours</span> of confirmed arrival.</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <button 
                        onClick={handleConfirmPurchase}
                        disabled={isProcessing}
                        className="w-full py-6 bg-[#043003] text-white rounded-3xl font-black uppercase tracking-[0.25em] text-xs shadow-2xl shadow-emerald-900/10 hover:bg-black transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                    >
                        {isProcessing ? <Loader2 className="animate-spin"/> : <><CheckCircle size={20}/> Confirm Trade & Dispatch</>}
                    </button>
                </div>
            </div>
        </div>
    );
};

export const SupplierMarket: React.FC<SupplierMarketProps> = ({ user }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'PARTNERS' | 'DIRECTORY'>('PARTNERS');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'FARMER' | 'WHOLESALER'>('ALL');
  
  // Data State
  const [allSuppliers, setAllSuppliers] = useState<User[]>([]);
  const [inventoryMap, setInventoryMap] = useState<Record<string, InventoryItem[]>>({});
  
  // UI State
  const [expandedSupplierId, setExpandedSupplierId] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatTargetName, setChatTargetName] = useState('');
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [negotiateItem, setNegotiateItem] = useState<{item: InventoryItem, product: Product, supplier: User} | null>(null);
  const [checkoutItem, setCheckoutItem] = useState<{item: InventoryItem, product: Product, supplier: User} | null>(null);

  // Manual Invite Prefill
  const [prefill, setPrefill] = useState({ name: '', email: '', mobile: '' });

  const products = mockService.getAllProducts();

  useEffect(() => {
    loadMarketData();
    const interval = setInterval(loadMarketData, 10000);
    return () => clearInterval(interval);
  }, [user]);

  const loadMarketData = () => {
    const allUsers = mockService.getAllUsers();
    const allInventory = mockService.getAllInventory();

    const suppliers = allUsers.filter(u => 
        (u.role === UserRole.FARMER || u.role === UserRole.WHOLESALER) && u.id !== user.id
    );
    setAllSuppliers(suppliers);

    const dInvMap: Record<string, InventoryItem[]> = {};
    suppliers.forEach(s => {
        dInvMap[s.id] = allInventory.filter(i => i.ownerId === s.id && i.status === 'Available');
    });
    setInventoryMap(dInvMap);
  };

  const handleConnect = (s: User) => {
    setPrefill({ name: s.name, email: s.email, mobile: s.phone || '' });
    setIsAddModalOpen(true);
  };

  const myPartnerIds = ['u3']; // Mock direct partner logic
  const myPartners = allSuppliers.filter(s => myPartnerIds.includes(s.id));
  const globalNetwork = allSuppliers.filter(s => !myPartnerIds.includes(s.id));

  const displayedList = (activeTab === 'PARTNERS' ? myPartners : globalNetwork)
    .filter(s => (roleFilter === 'ALL' || s.role === roleFilter))
    .filter(s => s.businessName.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-gray-100 pb-8 px-2">
        <div>
            <h1 className="text-[44px] font-black text-[#0F172A] tracking-tighter uppercase leading-none">Partner Supply</h1>
            <p className="text-gray-400 font-bold text-sm tracking-tight mt-2 flex items-center gap-3 uppercase">
                Direct Procurement Hub <span className="w-1.5 h-1.5 rounded-full bg-gray-200"></span> {user.businessName}
            </p>
        </div>
        
        <div className="flex gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-80 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-600 transition-colors" size={20} />
                <input 
                    type="text" 
                    placeholder="Search by farm or variety..." 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                    className="w-full pl-12 pr-6 py-4 bg-white border-2 border-gray-100 rounded-2xl text-sm font-bold text-gray-900 outline-none focus:ring-4 focus:ring-indigo-50/5 transition-all shadow-sm"
                />
            </div>
            <button 
                onClick={() => { setPrefill({name:'',email:'',mobile:''}); setIsAddModalOpen(true); }}
                className="px-10 py-4 bg-[#043003] text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all active:scale-95 flex items-center gap-3"
            >
                <Plus size={18}/> Add Supplier
            </button>
        </div>
      </div>

      <div className="space-y-8 px-2">
          {/* TABS */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-indigo-50/50 rounded-[2.5rem] p-3 border border-indigo-100/50 shadow-sm">
              <div className="flex gap-2 p-1.5 bg-white/50 rounded-2xl border border-white w-full md:w-auto">
                  <button onClick={() => setActiveTab('PARTNERS')} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'PARTNERS' ? 'bg-white text-indigo-700 shadow-md ring-1 ring-black/5' : 'text-gray-400 hover:text-gray-600'}`}>My Partners ({myPartners.length})</button>
                  <button onClick={() => setActiveTab('DIRECTORY')} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'DIRECTORY' ? 'bg-white text-gray-900 shadow-md ring-1 ring-black/5' : 'text-gray-400 hover:text-gray-600'}`}><Globe size={14}/> Network Directory ({globalNetwork.length})</button>
              </div>

              {activeTab === 'DIRECTORY' && (
                  <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-gray-100 w-full md:w-auto overflow-x-auto no-scrollbar">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4 border-r border-gray-100">Filter</span>
                      <div className="flex gap-2">
                          {(['ALL', 'FARMER', 'WHOLESALER'] as const).map(role => (
                              <button 
                                  key={role}
                                  onClick={() => setRoleFilter(role)}
                                  className={`px-5 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${roleFilter === role ? 'bg-[#0F172A] text-white shadow-md' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                              >
                                  {role}
                              </button>
                          ))}
                      </div>
                  </div>
              )}
          </div>

          {/* SUPPLIER LIST */}
          <div className="space-y-6">
              {displayedList.length === 0 ? (
                  <div className="py-40 text-center bg-white rounded-[3rem] border border-gray-100 shadow-sm">
                      <Sprout size={64} className="mx-auto text-gray-100 mb-6" />
                      <p className="font-black text-gray-300 uppercase tracking-widest text-xs">No partners found matching your search.</p>
                  </div>
              ) : displayedList.map(supplier => {
                  const items = inventoryMap[supplier.id] || [];
                  const isExpanded = expandedSupplierId === supplier.id;
                  
                  return (
                      <div key={supplier.id} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden group transition-all hover:shadow-xl hover:border-emerald-100">
                          <div 
                              onClick={() => setExpandedSupplierId(isExpanded ? null : supplier.id)}
                              className="p-8 flex flex-col md:flex-row justify-between items-center gap-8 cursor-pointer hover:bg-gray-50/50 transition-colors"
                          >
                              <div className="flex items-center gap-8">
                                  <div className={`w-20 h-20 rounded-[1.75rem] flex items-center justify-center font-black text-4xl shadow-inner-sm border ${supplier.role === 'FARMER' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-blue-100 text-blue-700 border-blue-200'}`}>
                                      {supplier.businessName.charAt(0)}
                                  </div>
                                  <div>
                                      <div className="flex items-center gap-3 mb-2">
                                          <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight leading-none">{supplier.businessName}</h3>
                                          <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${supplier.role === 'FARMER' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>{supplier.role}</span>
                                      </div>
                                      <div className="flex items-center gap-6">
                                          <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><MapPin size={14} className="text-gray-300"/> {supplier.businessProfile?.businessLocation || 'Regional Market Hub'}</span>
                                          <span className="text-[11px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2"><Package size={14} className="text-emerald-400"/> {items.length} Products Live</span>
                                      </div>
                                  </div>
                              </div>
                              <div className="flex items-center gap-4 w-full md:w-auto">
                                  {activeTab === 'DIRECTORY' ? (
                                      <button 
                                          onClick={(e) => { e.stopPropagation(); handleConnect(supplier); }}
                                          className="flex-1 md:flex-none px-10 py-4 bg-[#043003] text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-black transition-all shadow-xl active:scale-95"
                                      >
                                          Connect to Partner
                                      </button>
                                  ) : (
                                      <button 
                                          onClick={(e) => { e.stopPropagation(); setChatTargetName(supplier.businessName); setIsChatOpen(true); }}
                                          className="px-8 py-4 bg-white border-2 border-gray-100 rounded-2xl text-gray-400 font-black uppercase text-[10px] tracking-widest hover:border-emerald-500 hover:text-emerald-600 transition-all flex items-center gap-2 active:scale-95 shadow-sm"
                                      >
                                          <MessageSquare size={18}/> Chat
                                      </button>
                                  )}
                                  <div className={`p-3 rounded-xl bg-gray-100 text-gray-300 transition-transform duration-500 ${isExpanded ? 'rotate-180 bg-emerald-50 text-emerald-600 shadow-inner' : ''}`}>
                                      <ChevronDown size={28}/>
                                  </div>
                              </div>
                          </div>

                          {isExpanded && (
                              <div className="border-t border-gray-50 bg-gray-50/20 p-10 animate-in slide-in-from-top-4 duration-500">
                                  <div className="mb-10 flex justify-between items-end">
                                      <div>
                                          <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-2">Live Availability Audit</h4>
                                          <p className="text-gray-900 font-bold text-lg uppercase tracking-tight">What they are selling now</p>
                                      </div>
                                      <div className="bg-white border border-gray-100 px-6 py-2 rounded-xl flex items-center gap-3">
                                          <Wind size={16} className="text-emerald-500"/>
                                          <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Verified Fresh</span>
                                      </div>
                                  </div>

                                  {items.length === 0 ? (
                                      <div className="py-20 text-center text-gray-400 italic font-medium">No active lots listed for this supplier today.</div>
                                  ) : (
                                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                          {items.map(item => {
                                              const p = products.find(prod => prod.id === item.productId);
                                              return (
                                                  <div key={item.id} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all group/item flex flex-col justify-between min-h-[420px]">
                                                      <div>
                                                          <div className="h-40 rounded-2xl overflow-hidden mb-6 border border-gray-50 shadow-inner-sm bg-gray-50">
                                                              <img src={p?.imageUrl} className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-700" alt=""/>
                                                          </div>
                                                          <h4 className="font-black text-gray-900 uppercase text-lg leading-tight mb-1 truncate">{p?.name}</h4>
                                                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.quantityKg}{p?.unit || 'kg'} available</p>
                                                      </div>

                                                      <div className="space-y-6">
                                                          <div className="flex justify-between items-end border-t border-gray-50 pt-6">
                                                              <div>
                                                                  <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest mb-1">Direct Partner Rate</p>
                                                                  <div className="flex items-baseline gap-1">
                                                                      <span className="text-2xl font-black text-emerald-600 tracking-tighter">${p?.defaultPricePerKg.toFixed(2)}</span>
                                                                      <span className="text-[10px] font-black text-gray-400 uppercase">/ kg</span>
                                                                  </div>
                                                              </div>
                                                              <div className="text-right">
                                                                  <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest mb-1">Lot ID</p>
                                                                  <p className="text-xs font-black text-gray-900 font-mono tracking-tighter uppercase">{item.lotNumber}</p>
                                                              </div>
                                                          </div>

                                                          <div className="grid grid-cols-1 gap-2">
                                                              <button 
                                                                  onClick={() => setCheckoutItem({item, product: p!, supplier})}
                                                                  className="w-full py-4 bg-[#043003] text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-emerald-900/10 hover:bg-black transition-all flex items-center justify-center gap-2 active:scale-95"
                                                              >
                                                                  <ShoppingCart size={16}/> Instant Buy
                                                              </button>
                                                              <button 
                                                                  onClick={() => setNegotiateItem({item, product: p!, supplier})}
                                                                  className="w-full py-3 bg-white border-2 border-indigo-100 text-indigo-600 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 active:scale-95"
                                                              >
                                                                  <Gavel size={16}/> Negotiate
                                                              </button>
                                                          </div>
                                                      </div>
                                                  </div>
                                              );
                                          })}
                                      </div>
                                  )}
                              </div>
                          )}
                      </div>
                  );
              })}
          </div>
      </div>

      <ChatDialog 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
        orderId="PARTNER-INQUIRY" 
        issueType={`Procurement Inquiry: Direct Network`} 
        repName={chatTargetName} 
      />

      <AddSupplierModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        prefilledName={prefill.name}
        prefilledEmail={prefill.email}
        prefilledMobile={prefill.mobile}
        buyerName={user.businessName}
      />

      <NegotiateModal 
        isOpen={!!negotiateItem}
        onClose={() => setNegotiateItem(null)}
        {...negotiateItem}
        user={user}
      />

      <SupplierCheckoutModal 
        isOpen={!!checkoutItem}
        onClose={() => setCheckoutItem(null)}
        {...checkoutItem}
        user={user}
        onComplete={loadMarketData}
      />
    </div>
  );
};

const Wind = ({ size = 24, ...props }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/><path d="M9.6 4.6A2 2 0 1 1 11 8H2"/><path d="M12.6 19.4A2 2 0 1 0 14 16H2"/></svg>
);
