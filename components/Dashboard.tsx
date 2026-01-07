
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
  TrendingDown, Pencil, Lock, Gift
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

export const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const navigate = useNavigate();
  const [orderSubTab, setOrderSubTab] = useState<'INCOMING' | 'PROCESSING' | 'ACTIVE' | 'HISTORY'>('PROCESSING');
  const [orders, setOrders] = useState<Order[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [pendingPriceRequests, setPendingPriceRequests] = useState<SupplierPriceRequest[]>([]);
  const [showPriceSync, setShowPriceSync] = useState(true);

  const products = mockService.getAllProducts();

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, [user]);

  const loadData = () => {
    const allSellingOrders = mockService.getOrders(user.id).filter(o => o.sellerId === user.id);
    setOrders(allSellingOrders);
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

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* WELCOME INCENTIVE WIDGET */}
      {user.bonusActivated && (
          <div className="bg-[#0B1221] rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group border border-white/5 mx-2">
              <div className="absolute top-0 right-0 p-12 opacity-5 transform rotate-12 scale-150 group-hover:rotate-0 transition-transform duration-700 pointer-events-none"><Gift size={180}/></div>
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
                  <div className="flex items-center gap-6">
                      <div className="w-20 h-20 bg-[#10B981] rounded-3xl flex items-center justify-center text-white shadow-xl shadow-emerald-500/10 shrink-0">
                          <CheckCircle size={40} strokeWidth={3} />
                      </div>
                      <div>
                          <div className="flex items-center gap-2 mb-3">
                             <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em]">Platform Incentive Active</span>
                          </div>
                          <h2 className="text-3xl md:text-4xl font-black tracking-tighter uppercase leading-none mb-3">Partner Growth Bonus</h2>
                          <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-xl">Congratulations! We've activated a <span className="text-white font-black">${user.pendingBonus?.toLocaleString()}</span> credit offset for your account. Start listing or sourcing to begin vesting these funds into your next payout cycles.</p>
                      </div>
                  </div>
                  <div className="bg-white/5 rounded-3xl p-8 border border-white/5 flex flex-col items-center justify-center min-w-[220px]">
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Staged Incentive</p>
                      <p className="text-5xl font-black text-emerald-400 tracking-tighter">${(user.pendingBonus || 0).toLocaleString()}</p>
                      <button onClick={() => navigate('/pricing')} className="mt-6 w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-[#0B1221] rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all">List Produce Now</button>
                  </div>
              </div>
          </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-2">
          {[
              { label: 'ORDERS TODAY', value: incomingQueue.length + processingQueue.length, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'PARTNERS', value: '12', icon: Globe, color: 'text-indigo-600', bg: 'bg-indigo-50' },
              { label: 'ON THE ROAD', value: activeFulfillment.length, icon: Truck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: 'PENDING REV', value: `$${processingQueue.reduce((s, o) => s + o.totalAmount, 0).toLocaleString()}`, icon: DollarSign, color: 'text-emerald-50', bg: 'bg-emerald-50' }
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
      
      {/* ... rest of Dashboard.tsx components ... */}
    </div>
  );
};
