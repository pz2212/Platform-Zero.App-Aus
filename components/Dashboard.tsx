import React, { useState, useEffect } from 'react';
import { User, Order, Product, Customer, InventoryItem, SupplierPriceRequest, UserRole } from '../types';
import { mockService } from '../services/mockDataService';
import { WholesalerPriceRequestModal } from './WholesalerPriceRequestModal';
import { triggerNativeSms } from '../services/smsService';
import { 
  Package, Truck, MapPin, LayoutDashboard, 
  Users, Clock, CheckCircle, X, DollarSign,
  LayoutGrid, Bell, History, ArrowRight, Loader2,
  ChevronDown, Gavel, BarChart3, TrendingUp,
  Boxes, Check, Globe, ShoppingCart, AlertTriangle,
  ArrowUpRight, Store, ShieldCheck, Zap, Handshake,
  Search, Filter, Info, RefreshCw, Sparkles, ChevronRight,
  TrendingDown, Pencil, Lock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DashboardProps {
  user: User;
}

const MorningPriceLock = ({ user, products, onComplete }: { user: User, products: Product[], onComplete: () => void }) => {
    const sellingProducts = products.filter(p => user.activeSellingInterests?.some(interest => p.name.includes(interest)));
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
        <div className="bg-white rounded-[2rem] border-2 border-indigo-100 shadow-xl p-6 md:p-8 animate-in slide-in-from-top-4 duration-500 overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:scale-110 transition-transform pointer-events-none">
                <Sparkles size={120} className="text-indigo-900"/>
            </div>
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0">
                        <Lock size={24} strokeWidth={2.5}/>
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em]">Morning Price Lock</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-200"></span>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{currentIndex + 1} / {sellingProducts.length}</span>
                        </div>
                        <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight leading-none">Has the price changed?</h3>
                    </div>
                </div>

                <div className="flex-1 flex items-center gap-6 bg-gray-50/50 p-4 rounded-2xl border border-gray-100 min-w-0 max-w-md">
                    <div className="w-12 h-12 rounded-xl overflow-hidden border border-gray-100 shrink-0 shadow-sm">
                        <img src={current.imageUrl} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                        <p className="font-black text-gray-900 uppercase text-sm truncate">{current.name}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Yesterday: ${current.defaultPricePerKg.toFixed(2)}/kg</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    {isEditing ? (
                        <div className="flex items-center gap-3 w-full animate-in slide-in-from-right-2">
                            <div className="relative flex-1 md:w-32">
                                <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300"/>
                                <input 
                                    autoFocus
                                    type="number" 
                                    step="0.01"
                                    className="w-full pl-8 pr-3 py-3 bg-white border-2 border-indigo-600 rounded-xl font-black text-sm text-gray-900 outline-none"
                                    value={newPrice}
                                    onChange={e => setNewPrice(e.target.value)}
                                    placeholder="0.00"
                                />
                            </div>
                            <button onClick={handleUpdate} className="px-6 py-3.5 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-black transition-all">Lock</button>
                            <button onClick={() => setIsEditing(false)} className="p-3 text-gray-400 hover:text-gray-900 transition-colors"><X size={20}/></button>
                        </div>
                    ) : (
                        <>
                            <button 
                                onClick={handleNext}
                                className="flex-1 md:flex-none px-10 py-4 bg-emerald-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-emerald-600 transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                <CheckCircle size={14}/> No
                            </button>
                            <button 
                                onClick={() => setIsEditing(true)}
                                className="flex-1 md:flex-none px-10 py-4 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                <Pencil size={14}/> Yes
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

const SourcingModal = ({ isOpen, onClose, product, currentUser, onPurchase }: { 
    isOpen: boolean, 
    onClose: () => void, 
    product: Product | null,
    currentUser: User,
    onPurchase: () => void
}) => {
    const [partners, setPartners] = useState<any[]>([]);
    const [network, setNetwork] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen && product) {
            setLoading(true);
            const allUsers = mockService.getAllUsers();
            const allInventory = mockService.getAllInventory();
            
            const myPartnerIds = ['u3'];
            
            const suppliersWithStock = allUsers.filter(u => 
                (u.role === UserRole.FARMER || u.role === UserRole.WHOLESALER) && 
                u.id !== currentUser.id
            ).map(s => ({
                ...s,
                stock: allInventory.filter(i => i.ownerId === s.id && i.productId === product.id && i.status === 'Available')
            })).filter(s => s.stock.length > 0);

            setPartners(suppliersWithStock.filter(s => myPartnerIds.includes(s.id)));
            setNetwork(suppliersWithStock.filter(s => !myPartnerIds.includes(s.id)));
            
            setTimeout(() => setLoading(false), 600);
        }
    }, [isOpen, product, currentUser.id]);

    if (!isOpen || !product) return null;

    return (
        <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100 flex flex-col max-h-[90vh]">
                <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-white relative">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner-sm">
                            <Store size={28} strokeWidth={2.5}/>
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight leading-none">Sourcing Audit</h2>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1.5">Procurement targets for {product.name}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-300 hover:text-gray-900 p-2 bg-white rounded-full border border-gray-100 shadow-sm transition-all active:scale-90"><X size={24}/></button>
                </div>

                <div className="flex-1 overflow-y-auto p-10 space-y-12 bg-gray-50/30 custom-scrollbar">
                    {loading ? (
                        <div className="py-20 text-center space-y-4">
                            <Loader2 size={48} className="animate-spin text-indigo-600 mx-auto" />
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Scanning Partner Network...</p>
                        </div>
                    ) : (
                        <>
                            <section className="space-y-6">
                                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                                    <h3 className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em] flex items-center gap-2">
                                        <ShieldCheck size={14}/> Verified Partners ({partners.length})
                                    </h3>
                                </div>
                                
                                {partners.length === 0 ? (
                                    <div className="p-10 bg-white rounded-[2rem] border border-gray-100 text-center opacity-40">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">No active stock from current partners</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {partners.map(p => (
                                            <div key={p.id} className="bg-white p-6 rounded-[2.5rem] border-2 border-emerald-50 shadow-sm hover:shadow-xl transition-all group">
                                                <div className="flex justify-between items-start mb-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-black text-lg shadow-sm border border-emerald-100">
                                                            {p.businessName.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-black text-gray-900 uppercase text-sm tracking-tight">{p.businessName}</h4>
                                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Regional Producer</p>
                                                        </div>
                                                    </div>
                                                    <span className="bg-emerald-500 text-white px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20">Direct Node</span>
                                                </div>
                                                
                                                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex justify-between items-center mb-6">
                                                    <div>
                                                        <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest mb-1">Lot Available</p>
                                                        <p className="font-black text-gray-900 text-lg">{p.stock[0].quantityKg}kg</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest mb-1">Partner Rate</p>
                                                        <p className="font-black text-emerald-600 text-lg">${product.defaultPricePerKg.toFixed(2)}/kg</p>
                                                    </div>
                                                </div>

                                                <button 
                                                    onClick={() => {
                                                        const item = p.stock[0];
                                                        mockService.createInstantOrder(currentUser.id, item, item.quantityKg, product.defaultPricePerKg);
                                                        alert(`Order INV-${Date.now().toString().slice(-4)} created! Stock is now inbound.`);
                                                        onPurchase();
                                                        onClose();
                                                    }}
                                                    className="w-full py-4 bg-[#043003] text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                                                >
                                                    <Zap size={14}/> Procure Inbound
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>

                            <section className="space-y-6">
                                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                                    <h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] flex items-center gap-2">
                                        <Globe size={14}/> Network Opportunities ({network.length})
                                    </h3>
                                    <p className="text-[8px] font-bold text-gray-300 uppercase tracking-widest italic">Expanded market discovery</p>
                                </div>

                                {network.length === 0 ? (
                                    <div className="p-20 bg-white rounded-[2rem] border border-gray-100 text-center opacity-30">
                                        <Search size={40} className="mx-auto mb-4 text-gray-300" />
                                        <p className="text-[10px] font-black uppercase tracking-widest">No matching lots found in global network</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {network.map(n => (
                                            <div key={n.id} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
                                                <div className="flex justify-between items-start mb-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-black text-lg shadow-sm border border-indigo-100">
                                                            {n.businessName.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-black text-gray-900 uppercase text-sm tracking-tight">{n.businessName}</h4>
                                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1"><MapPin size={8}/> {n.businessProfile?.businessLocation || 'Australia'}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-3 mb-6">
                                                    <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                                                        <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest mb-1">Available</p>
                                                        <p className="font-black text-gray-900 text-sm">{n.stock[0].quantityKg}kg</p>
                                                    </div>
                                                    <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                                                        <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest mb-1">Market Rate</p>
                                                        <p className="font-black text-gray-900 text-sm">${product.defaultPricePerKg.toFixed(2)}</p>
                                                    </div>
                                                </div>

                                                <button 
                                                    onClick={() => {
                                                        const link = `https://platformzero.com.au/connect?ref=${currentUser.id}`;
                                                        triggerNativeSms(n.phone || '0400 123 456', `Hi ${n.businessName}! Sarah from ${currentUser.businessName} is looking to source ${product.name} from you. Connect here: ${link}`);
                                                        alert(`Connection request dispatched to ${n.businessName}!`);
                                                        onClose();
                                                    }}
                                                    className="w-full py-4 bg-white border-2 border-indigo-100 text-indigo-600 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-sm hover:bg-indigo-50 transition-all flex items-center justify-center gap-2"
                                                >
                                                    <Handshake size={14}/> Request Connection
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

const OrderFulfillmentModal = ({ isOpen, onClose, order, products, customers, onUpdate }: any) => {
    const [selectedPacker, setSelectedPacker] = useState('');
    const [selectedDriver, setSelectedDriver] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    if (!isOpen || !order) return null;

    const buyer = customers.find((c: any) => c.id === order.buyerId);
    
    const handleAccept = async () => {
        setIsProcessing(true);
        mockService.acceptOrderV2(order.id);
        await new Promise(r => setTimeout(r, 600));
        setIsProcessing(false);
        onUpdate();
    };

    const handlePack = async () => {
        if (!selectedPacker) return alert("Assign a packer first.");
        setIsProcessing(true);
        mockService.packOrder(order.id, selectedPacker);
        await new Promise(r => setTimeout(r, 600));
        setIsProcessing(false);
        onUpdate();
    };

    const handleDispatch = async () => {
        if (!selectedDriver) return alert("Assign a driver first.");
        setIsProcessing(true);
        const targetOrder = mockService.getOrders('u1').find(o => o.id === order.id);
        if (targetOrder) {
            targetOrder.status = 'Shipped';
            targetOrder.shippedAt = new Date().toISOString();
            targetOrder.logistics = { ...targetOrder.logistics, driverName: selectedDriver };
        }
        await new Promise(r => setTimeout(r, 600));
        setIsProcessing(false);
        onUpdate();
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100 flex flex-col max-h-[90vh]">
                <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#043003] rounded-2xl flex items-center justify-center text-white font-black shadow-lg">P</div>
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight leading-none">Order Fulfillment</h2>
                            <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest mt-1.5">REF: #{order.id.split('-').pop()} • {buyer?.businessName}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-300 hover:text-gray-900 p-2 bg-white rounded-full border border-gray-100 shadow-sm transition-all"><X size={24}/></button>
                </div>

                <div className="flex-1 overflow-y-auto p-10 grid grid-cols-1 lg:grid-cols-2 gap-10 bg-white">
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                                <FileText className="w-4 h-4"/> PRODUCT PACKING LIST
                            </h3>
                            <div className="divide-y divide-gray-50 border border-gray-100 rounded-3xl overflow-hidden bg-gray-50/30">
                                {order.items.map((item: any, idx: number) => {
                                    const p = products.find((prod: any) => prod.id === item.productId);
                                    return (
                                        <div key={idx} className="p-4 flex items-center justify-between hover:bg-white transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl overflow-hidden border border-gray-100 shrink-0">
                                                    <img src={p?.imageUrl} className="w-full h-full object-cover" />
                                                </div>
                                                <div>
                                                    <p className="font-black text-gray-900 text-sm uppercase truncate max-w-[120px]">{p?.name}</p>
                                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{p?.variety}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-black text-gray-900 text-lg tracking-tighter">{item.quantityKg}{p?.unit || 'kg'}</p>
                                                <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">${item.pricePerKg.toFixed(2)}/u</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        {order.status === 'Pending' ? (
                            <div className="space-y-6 animate-in slide-in-from-bottom-4">
                                <div className="bg-orange-50 border border-orange-100 p-8 rounded-[2rem] text-center space-y-4">
                                    <Clock size={40} className="mx-auto text-orange-400 animate-pulse" />
                                    <h4 className="text-xl font-black text-orange-900 uppercase tracking-tight">Market Acceptance Required</h4>
                                    <button onClick={handleAccept} disabled={isProcessing} className="w-full py-5 bg-[#043003] hover:bg-black text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl flex items-center justify-center gap-3 transition-all">
                                        {isProcessing ? <Loader2 className="animate-spin" /> : <><CheckCircle size={20}/> Confirm Availability</>}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                <div className={`p-8 rounded-[2rem] border transition-all ${order.status === 'Confirmed' ? 'bg-white border-indigo-200 shadow-lg' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${order.status === 'Confirmed' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
                                            <Boxes size={24}/>
                                        </div>
                                        <h4 className="font-black text-gray-900 uppercase text-sm tracking-widest">Assign Packing</h4>
                                    </div>
                                    <select disabled={order.status !== 'Confirmed'} className="w-full p-4 bg-white border border-gray-200 rounded-xl font-black text-[10px] uppercase tracking-widest mb-4" value={selectedPacker} onChange={(e) => setSelectedPacker(e.target.value)}>
                                        <option value="">Choose Personnel...</option>
                                        <option value="Alex Packer">Alex Packer</option>
                                        <option value="Sam Sort">Sam Sort</option>
                                    </select>
                                    {order.status === 'Confirmed' && (
                                        <button onClick={handlePack} disabled={!selectedPacker} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2">Mark as Packed</button>
                                    )}
                                </div>
                                <div className={`p-8 rounded-[2rem] border transition-all ${order.status === 'Ready for Delivery' ? 'bg-white border-emerald-200 shadow-lg' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${order.status === 'Ready for Delivery' ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
                                            <Truck size={24}/>
                                        </div>
                                        <h4 className="font-black text-gray-900 uppercase text-sm tracking-widest">Dispatch Fleet</h4>
                                    </div>
                                    <select disabled={order.status !== 'Ready for Delivery'} className="w-full p-4 bg-white border border-gray-200 rounded-xl font-black text-[10px] uppercase tracking-widest mb-4" value={selectedDriver} onChange={(e) => setSelectedDriver(e.target.value)}>
                                        <option value="">Assign Driver...</option>
                                        <option value="Dave Transit">Dave Transit</option>
                                        <option value="Route Hub">External: PZ Hub</option>
                                    </select>
                                    {order.status === 'Ready for Delivery' && (
                                        <button handleDispatch={handleDispatch} disabled={!selectedDriver} className="w-full py-4 bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">Confirm Dispatch</button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const navigate = useNavigate();
  const [orderSubTab, setOrderSubTab] = useState<'INCOMING' | 'PROCESSING' | 'ACTIVE' | 'HISTORY'>('PROCESSING');
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [pendingPriceRequests, setPendingPriceRequests] = useState<SupplierPriceRequest[]>([]);
  const [selectedPriceRequest, setSelectedPriceRequest] = useState<SupplierPriceRequest | null>(null);
  
  const [showPriceSync, setShowPriceSync] = useState(true);
  const [selectedSourcingProduct, setSelectedSourcingProduct] = useState<Product | null>(null);

  const products = mockService.getAllProducts();

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, [user]);

  const loadData = () => {
    const allSellingOrders = mockService.getOrders(user.id).filter(o => o.sellerId === user.id);
    setOrders(allSellingOrders);
    setCustomers(mockService.getCustomers());
    setInventory(mockService.getInventory(user.id));
    const requests = mockService.getSupplierPriceRequests(user.id).filter(r => r.status === 'PENDING');
    setPendingPriceRequests(requests);
  };

  const incomingQueue = orders.filter(o => o.status === 'Pending');
  const processingQueue = orders.filter(o => ['Confirmed', 'Ready for Delivery'].includes(o.status));
  const activeFulfillment = orders.filter(o => o.status === 'Shipped');
  const pastOrders = orders.filter(o => ['Delivered', 'Cancelled'].includes(o.status));

  const currentSellingList = orderSubTab === 'INCOMING' ? incomingQueue : 
                           orderSubTab === 'PROCESSING' ? processingQueue :
                           orderSubTab === 'ACTIVE' ? activeFulfillment : pastOrders;

  const ordersToday = orders.filter(o => new Date(o.date).toDateString() === new Date().toDateString()).length;
  const onTheRoadCount = activeFulfillment.length;
  const revenueToday = orders.filter(o => new Date(o.date).toDateString() === new Date().toDateString()).reduce((sum, o) => sum + o.totalAmount, 0);

  const demandMatrix = products.filter(p => user.activeSellingInterests?.some(interest => p.name.includes(interest))).map(p => {
      const onHand = inventory.filter(i => i.productId === p.id && i.status === 'Available').reduce((sum, i) => sum + i.quantityKg, 0);
      const todayDemand = orders.filter(o => ['Pending', 'Confirmed', 'Ready for Delivery'].includes(o.status))
                              .reduce((sum, o) => sum + o.items.filter(item => item.productId === p.id).reduce((s, i) => s + i.quantityKg, 0), 0);
      return { product: p, onHand, todayDemand };
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-2">
          {[
              { label: 'ORDERS TODAY', value: ordersToday, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'WHOLESALERS', value: '0', icon: Globe, color: 'text-indigo-600', bg: 'bg-indigo-50' },
              { label: 'ON THE ROAD', value: onTheRoadCount, icon: Truck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: 'REVENUE', value: `$${revenueToday.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-50', bg: 'bg-emerald-50' }
          ].map((card, i) => (
              <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between h-32 group hover:shadow-md transition-all">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">{card.label}</span>
                  <div className="flex justify-between items-end">
                      <h3 className="text-3xl font-black text-gray-900 tracking-tighter">{card.value}</h3>
                      <div className={`p-2.5 rounded-xl ${card.bg} ${card.color} border border-white shadow-inner-sm group-hover:scale-110 transition-transform`}>
                          <card.icon size={20} />
                      </div>
                  </div>
              </div>
          ))}
      </div>

      {showPriceSync && (
          <div className="px-2">
              <MorningPriceLock user={user} products={products} onComplete={() => setShowPriceSync(false)} />
          </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 px-2">
          
          <div className="xl:col-span-4 space-y-6">
              <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full min-h-[600px]">
                  <div className="p-8 border-b border-gray-100 bg-gray-50/30 flex items-center gap-4">
                      <div className="w-10 h-10 bg-[#5c56d6] rounded-xl flex items-center justify-center text-white shadow-lg">
                          <LayoutGrid size={20}/>
                      </div>
                      <div>
                          <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight leading-none">Demand Matrix</h2>
                          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1.5">Inventory vs. Today's Fulfillment</p>
                      </div>
                  </div>

                  <div className="p-8 space-y-10 overflow-y-auto custom-scrollbar">
                      {demandMatrix.length === 0 ? (
                          <div className="py-20 text-center opacity-20 flex flex-col items-center">
                              <Boxes size={48} className="mb-4" />
                              <p className="text-xs font-black uppercase tracking-widest">No active sales interests set</p>
                          </div>
                      ) : demandMatrix.map(({ product, onHand, todayDemand }) => {
                          const deficit = Math.max(0, todayDemand - onHand);
                          const progress = todayDemand > 0 ? Math.min(100, (onHand / todayDemand) * 100) : 100;

                          return (
                              <div 
                                key={product.id} 
                                className={`space-y-5 group cursor-pointer p-4 rounded-3xl transition-all border-2 ${deficit > 0 ? 'bg-orange-50/20 border-orange-50' : 'bg-transparent border-transparent hover:bg-gray-50'}`}
                                onClick={() => setSelectedSourcingProduct(product)}
                              >
                                  <div className="flex justify-between items-start">
                                      <div className="flex items-center gap-4">
                                          <div className="w-12 h-12 rounded-2xl overflow-hidden border border-gray-100 shadow-sm shrink-0">
                                              <img src={product.imageUrl} className="w-full h-full object-cover" alt={product.name}/>
                                          </div>
                                          <div>
                                              <p className="text-sm font-black text-gray-900 uppercase tracking-tight leading-none mb-1.5">{product.name}</p>
                                              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em]">{product.variety}</p>
                                          </div>
                                      </div>
                                      <button className="p-3 bg-white border border-gray-100 text-gray-300 group-hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all shadow-sm">
                                          <ShoppingCart size={16}/>
                                      </button>
                                  </div>

                                  <div className="grid grid-cols-2 gap-4">
                                      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-inner-sm">
                                          <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1.5">On Hand</p>
                                          <p className="text-xl font-black text-gray-900 leading-none">{onHand}kg</p>
                                      </div>
                                      <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/50 shadow-inner-sm">
                                          <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-1.5">Demand</p>
                                          <p className="text-xl font-black text-indigo-700 leading-none">{todayDemand}kg</p>
                                      </div>
                                  </div>

                                  <div className="space-y-3">
                                      <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden shadow-inner-sm">
                                          <div 
                                              className={`h-full transition-all duration-1000 ${deficit > 0 ? 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.4)]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]'}`} 
                                              style={{ width: `${progress}%` }}
                                          ></div>
                                      </div>
                                      {deficit > 0 && (
                                          <div className="flex items-center gap-1.5 text-orange-600 animate-in slide-in-from-left-2">
                                              <AlertTriangle size={12}/>
                                              <span className="text-[10px] font-black uppercase tracking-widest">Deficit: {deficit}kg</span>
                                          </div>
                                      )}
                                  </div>
                              </div>
                          );
                      })}
                  </div>
              </div>
          </div>

          <div className="xl:col-span-8 space-y-6">
              
              {pendingPriceRequests.length > 0 && (
                <div className="bg-red-50 border-2 border-red-100 rounded-[2.5rem] p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 animate-in slide-in-from-top-4">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-red-500 text-white rounded-2xl flex items-center justify-center shadow-xl border-4 border-white animate-pulse">
                            <Gavel size={28}/>
                        </div>
                        <div>
                            <h4 className="text-lg font-black text-red-900 uppercase leading-none">Urgent Price Audit</h4>
                            <p className="text-sm text-red-700 font-medium mt-2">Platform Zero HQ assigned a live procurement lead for <span className="font-black underline">{pendingPriceRequests[0].customerContext}</span>.</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setSelectedPriceRequest(pendingPriceRequests[0])}
                        className="px-10 py-4 bg-[#131926] hover:bg-black text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95 whitespace-nowrap"
                    >
                        Review Audit Now
                    </button>
                </div>
              )}

              <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full min-h-[600px]">
                  <div className="p-8 border-b border-gray-100 bg-white flex flex-col md:flex-row justify-between items-center gap-8 shrink-0">
                      <div className="flex items-center gap-5">
                          <div className="w-12 h-12 bg-[#0F172A] rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0">
                              <Boxes size={24}/>
                          </div>
                          <div>
                              <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight leading-none">Fulfillment Pipeline</h2>
                              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1.5">Direct sales trade flow management</p>
                          </div>
                      </div>

                      <div className="flex bg-gray-100 p-1.5 rounded-2xl gap-1 border border-gray-200 shadow-inner-sm overflow-x-auto no-scrollbar max-w-full shrink-0">
                          {[
                              { id: 'INCOMING', label: 'INCOMING', count: incomingQueue.length },
                              { id: 'PROCESSING', label: 'PROCESSING', count: processingQueue.length },
                              { id: 'ACTIVE', label: 'ACTIVE RUNS', count: null },
                              { id: 'HISTORY', label: 'HISTORY', count: null }
                          ].map((tab) => (
                              <button 
                                  key={tab.id}
                                  onClick={() => setOrderSubTab(tab.id as any)}
                                  className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 whitespace-nowrap ${orderSubTab === tab.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                              >
                                  {tab.label} {tab.count !== null && tab.count > 0 && <span className="bg-orange-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black">{tab.count}</span>}
                              </button>
                          ))}
                      </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-6">
                      {currentSellingList.length === 0 ? (
                          <div className="h-full flex flex-col items-center justify-center opacity-30 py-40">
                              <Package size={64} className="mb-6 text-gray-200" />
                              <p className="text-sm font-black uppercase tracking-widest text-gray-400">Current queue empty</p>
                          </div>
                      ) : (
                          currentSellingList.map(order => {
                              const buyer = customers.find(c => c.id === order.buyerId);
                              return (
                                  <div key={order.id} className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all group animate-in slide-in-from-bottom-2">
                                      <div className="flex flex-col lg:flex-row justify-between items-center gap-8">
                                          <div className="flex items-center gap-8 flex-1 w-full">
                                              <div className="w-20 h-20 rounded-[1.75rem] bg-gray-50 flex items-center justify-center text-gray-400 font-black text-2xl shadow-inner-sm border border-gray-100 shrink-0 uppercase group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-100 transition-colors">
                                                  {buyer?.businessName.charAt(0)}
                                              </div>
                                              <div className="min-w-0 flex-1">
                                                  <h4 className="font-black text-gray-900 text-2xl uppercase tracking-tighter leading-none mb-2 truncate">{buyer?.businessName}</h4>
                                                  <div className="flex items-center gap-4">
                                                      <span className={`px-4 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest border border-gray-100 bg-gray-50 text-gray-400`}>
                                                          {order.status}
                                                      </span>
                                                      <span className="text-[10px] text-gray-300 font-bold uppercase tracking-widest leading-none">REF: #{order.id.split('-').pop()}</span>
                                                  </div>
                                              </div>
                                          </div>

                                          <div className="flex items-center gap-12 w-full lg:w-auto justify-between lg:justify-end border-t lg:border-0 border-gray-50 pt-6 lg:pt-0">
                                              <div className="text-left lg:text-right shrink-0">
                                                  <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] mb-1.5">Total</p>
                                                  <p className="text-4xl font-black text-gray-900 tracking-tighter leading-none">${order.totalAmount.toFixed(2)}</p>
                                              </div>
                                              
                                              <button 
                                                onClick={() => setSelectedOrder(order)} 
                                                className={`px-12 py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl transition-all active:scale-[0.98] whitespace-nowrap ${order.status === 'Pending' ? 'bg-[#043003] text-white hover:bg-black shadow-emerald-900/10' : 'bg-white border-2 border-indigo-100 text-indigo-700 hover:bg-indigo-50 shadow-indigo-100/10'}`}
                                              >
                                                  {order.status === 'Pending' ? 'Accept Order' : 'Manage Ops'}
                                              </button>
                                          </div>
                                      </div>
                                  </div>
                              );
                          })
                      )}
                  </div>
              </div>
          </div>
      </div>

      <OrderFulfillmentModal 
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        order={selectedOrder}
        products={products}
        customers={customers}
        onUpdate={loadData}
      />

      {selectedPriceRequest && (
        <WholesalerPriceRequestModal 
            isOpen={!!selectedPriceRequest}
            onClose={() => setSelectedPriceRequest(null)}
            request={selectedPriceRequest}
            onComplete={loadData}
        />
      )}

      <SourcingModal 
        isOpen={!!selectedSourcingProduct}
        onClose={() => setSelectedSourcingProduct(null)}
        product={selectedSourcingProduct}
        currentUser={user}
        onPurchase={loadData}
      />
    </div>
  );
};

const FileText = ({ size = 24, ...props }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
);
