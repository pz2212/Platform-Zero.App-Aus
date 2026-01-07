
import React, { useState, useEffect, useMemo } from 'react';
import { User, Order, Product, InventoryItem } from '../types';
import { mockService } from '../services/mockDataService';
import { 
  DollarSign, ShoppingBag, Truck, MapPin, 
  CheckCircle, Clock, Package, Leaf, ArrowRight,
  Sparkles, ShoppingCart, TrendingUp, History, ChevronRight,
  ArrowUpRight, Wind, Store, Check,
  // Fix line 7: Added AlertCircle to imports
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { OrderManifestModal } from './CustomerOrders';

interface GrocerDashboardProps {
  user: User;
}

const ActiveRunStatus = ({ order, onOpenVerification }: { order: Order, onOpenVerification: (o: Order) => void }) => {
    const navigate = useNavigate();
    const steps = [
        { label: 'PENDING', active: true },
        { label: 'PROCESSING', active: !!order.preparedAt || order.status === 'Confirmed' || order.status === 'Delivered' },
        { label: 'TRANSIT', active: !!order.shippedAt || order.status === 'Delivered' },
        { label: 'DELIVERED', active: order.status === 'Delivered' }
    ];

    const currentStepIndex = steps.filter(s => s.active).length - 1;

    return (
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden flex flex-col animate-in slide-in-from-left-4 h-fit">
            <div className="p-8 border-b border-gray-100 flex justify-between items-start bg-gray-50/20">
                <h2 className="text-[11px] font-black text-gray-900 uppercase tracking-[0.2em]">Live Inbound Shipment</h2>
                <button onClick={() => navigate('/orders')} className="text-emerald-600 font-black text-[9px] uppercase tracking-[0.2em] flex items-center gap-1">FULL LOGISTICS <ArrowRight size={12}/></button>
            </div>

            <div className="p-10 space-y-12">
                <div className="bg-indigo-50/40 rounded-[2rem] p-8 flex flex-col sm:flex-row justify-between items-center border border-indigo-100/30">
                    <div className="text-center sm:text-left">
                        <p className="font-black text-gray-900 text-3xl tracking-tighter mb-2 uppercase leading-none">Order #{order.id.split('-').pop()}</p>
                        <p className="text-[11px] font-bold text-indigo-600 uppercase tracking-widest">
                            {order.status === 'Delivered' ? `DELIVERED AT ${order.logistics?.deliveryTime || '13:46'}` : `ETA: ${order.logistics?.deliveryTime || 'SCHEDULING'}`}
                        </p>
                    </div>
                    <span className="mt-6 sm:mt-0 px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] bg-indigo-600 text-white shadow-xl">{order.status.toUpperCase()}</span>
                </div>

                <div className="flex justify-between items-center w-full px-6 relative">
                    <div className="absolute top-1/2 left-10 right-10 h-0.5 bg-gray-100 -translate-y-1/2 z-0"></div>
                    <div 
                        className="absolute top-1/2 left-10 h-0.5 bg-emerald-500 -translate-y-1/2 z-0 transition-all duration-1000 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                        style={{ width: `${(currentStepIndex / (steps.length - 1)) * 82}%` }}
                    ></div>

                    {steps.map((step, idx) => (
                        <div key={idx} className="flex flex-col items-center flex-1 relative z-10">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-500 ${
                                idx <= currentStepIndex ? 'bg-emerald-500 text-white shadow-lg' : 'bg-white text-gray-200 border border-gray-100'
                            }`}>
                                {idx <= currentStepIndex ? <Check size={16} strokeWidth={4}/> : <div className="w-1.5 h-1.5 rounded-full bg-gray-200"/>}
                            </div>
                            <span className={`text-[8px] font-black uppercase tracking-[0.2em] mt-3 ${idx <= currentStepIndex ? 'text-gray-900' : 'text-gray-300'}`}>
                                {step.label}
                            </span>
                        </div>
                    ))}
                </div>

                {order.status === 'Delivered' && (
                    <button 
                        onClick={() => onOpenVerification(order)}
                        className="w-full py-5 bg-[#043003] text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all"
                    >
                        <Clock size={16}/> VERIFY ARRIVAL (90m WINDOW)
                    </button>
                )}
            </div>
        </div>
    );
};

export const GrocerDashboard: React.FC<GrocerDashboardProps> = ({ user }) => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [marketLots, setMarketLots] = useState<{product: Product, item: InventoryItem}[]>([]);
  
  // Modal States for Syncing with Cafe workflow
  const [viewingOrderDetails, setViewingOrderDetails] = useState<Order | null>(null);

  useEffect(() => {
    const fetch = () => {
        const userOrders = mockService.getOrders(user.id).filter(o => o.buyerId === user.id);
        setOrders(userOrders);
        
        const allProducts = mockService.getAllProducts();
        setProducts(allProducts);

        // Get active market lots for the snapshot
        const inventory = mockService.getAllInventory().filter(item => item.status === 'Available');
        const mapped = inventory.map(item => ({
            item,
            product: allProducts.find(p => p.id === item.productId)!
        })).filter(x => !!x.product);
        setMarketLots(mapped);
    };
    fetch();
    const interval = setInterval(fetch, 10000);
    return () => clearInterval(interval);
  }, [user.id]);

  const activeDeliveries = useMemo(() => 
    orders.filter(o => ['Confirmed', 'Ready for Delivery', 'Shipped'].includes(o.status))
  , [orders]);

  const activeIncoming = useMemo(() => 
    orders.find(o => ['Confirmed', 'Ready for Delivery', 'Shipped', 'Delivered'].includes(o.status))
  , [orders]);

  const stats = useMemo(() => {
    const deliveredCount = orders.filter(o => o.status === 'Delivered').length;
    return { deliveredCount };
  }, [orders]);

  const handleOpenVerification = (order: Order) => {
      navigate('/orders', { state: { openVerificationId: order.id } });
  };

  const handleManifestReport = (order: Order) => {
      setViewingOrderDetails(null);
      navigate('/orders', { state: { openVerificationId: order.id } });
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      {/* HEADER & KPIs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 px-2">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase leading-none">Wholesale Hub</h1>
          <p className="text-gray-500 font-medium mt-2 uppercase text-[10px] tracking-widest flex items-center gap-2">
              <Store size={14} className="text-emerald-500"/> Managing {user.businessName} • Operational Overview
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-2">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col justify-between group hover:shadow-xl transition-all">
            <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Total Procurement Savings</p>
                <h3 className="text-4xl font-black text-gray-900 tracking-tighter">$4,280</h3>
            </div>
            <div className="mt-8 flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-widest">
                <TrendingUp size={14}/> +18% Efficiency vs Retail
            </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col justify-between group hover:shadow-xl transition-all">
            <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Successful Deliveries</p>
                <h3 className="text-4xl font-black text-gray-900 tracking-tighter">{stats.deliveredCount}</h3>
            </div>
            <div className="mt-8 flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-widest">
                <CheckCircle size={14}/> Reliable Supply Line
            </div>
        </div>

        <div className="bg-[#043003] p-8 rounded-[2.5rem] shadow-2xl text-white flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 transform rotate-12 scale-150 group-hover:scale-[1.7] transition-transform duration-700"><ShoppingCart size={120}/></div>
            <div className="relative z-10">
                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] mb-4">Market Balance</p>
                <h3 className="text-3xl font-black tracking-tight leading-none mb-1">PZ Credits</h3>
                <p className="text-emerald-400/80 text-xl font-black tracking-tighter">$428.50</p>
            </div>
            <button 
                onClick={() => navigate('/grocer/marketplace')}
                className="mt-8 w-full py-4 bg-white text-[#043003] rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-emerald-50 transition-all shadow-xl shadow-black/20 relative z-10"
            >
                TOP UP CREDITS <ChevronRight size={16}/>
            </button>
        </div>
      </div>

      {/* DUAL COLUMN SNAPSHOT */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 px-2">
        
        {/* LEFT COLUMN: TODAY'S MARKET PRODUCTS */}
        <div className="xl:col-span-7 space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight flex items-center gap-3">
                    <Sparkles className="text-emerald-500" size={24}/> Today's Market Snapshot
                </h2>
                <button onClick={() => navigate('/grocer/marketplace')} className="text-emerald-600 font-black text-[10px] uppercase tracking-widest hover:underline flex items-center gap-1">
                    BROWSE ALL LOTS <ArrowRight size={14}/>
                </button>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full min-h-[500px]">
                <div className="divide-y divide-gray-50 overflow-y-auto no-scrollbar max-h-[600px]">
                    {marketLots.length === 0 ? (
                        <div className="py-32 text-center opacity-30">
                            <Package size={48} className="mx-auto mb-4" />
                            <p className="text-sm font-black uppercase tracking-widest">No active lots listed currently</p>
                        </div>
                    ) : marketLots.slice(0, 10).map(({product, item}) => (
                        <div 
                            key={item.id} 
                            onClick={() => navigate('/grocer/marketplace')}
                            className="p-6 flex items-center justify-between hover:bg-emerald-50/30 transition-all group cursor-pointer"
                        >
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 rounded-2xl overflow-hidden border border-gray-100 shadow-sm shrink-0">
                                    <img src={product.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={product.name}/>
                                </div>
                                <div>
                                    <h4 className="font-black text-gray-900 text-base uppercase tracking-tight leading-none mb-1 group-hover:text-emerald-700 transition-colors">{product.name}</h4>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em]">{product.variety} • {item.quantityKg}kg available</p>
                                    <div className="mt-2 flex items-center gap-2">
                                        <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border border-emerald-100">Live fresh Lot</span>
                                        <span className="text-[9px] text-indigo-500 font-bold uppercase tracking-widest flex items-center gap-1"><Wind size={10}/> Verified Source</span>
                                    </div>
                                </div>
                            </div>

                            <div className="text-right">
                                <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-1">PZ Rate</p>
                                <p className="text-2xl font-black text-emerald-600 tracking-tighter leading-none">${(item.discountPricePerKg || product.defaultPricePerKg * 0.7).toFixed(2)}</p>
                                <p className="text-[10px] font-bold text-gray-400 line-through mt-1.5 uppercase tracking-widest">Std: ${product.defaultPricePerKg.toFixed(2)}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="p-6 bg-gray-50/50 border-t border-gray-100 mt-auto">
                    <button 
                        onClick={() => navigate('/grocer/marketplace')}
                        className="w-full py-4 bg-white border border-gray-200 text-gray-400 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:text-emerald-600 hover:border-emerald-100 transition-all shadow-sm active:scale-95"
                    >
                        View More Market Opportunities
                    </button>
                </div>
            </div>
        </div>

        {/* RIGHT COLUMN: ACTIVE DELIVERIES */}
        <div className="xl:col-span-5 space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight flex items-center gap-3">
                    <Truck className="text-indigo-600" size={24}/> Incoming Deliveries
                </h2>
                <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100 shadow-inner-sm">
                    {activeDeliveries.length} Active
                </span>
            </div>

            <div className="space-y-6">
                {activeIncoming ? (
                    <ActiveRunStatus order={activeIncoming} onOpenVerification={handleOpenVerification} />
                ) : (
                    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full min-h-[400px] items-center justify-center text-center p-12">
                         <Truck size={48} className="text-gray-200 mb-4" />
                         <p className="text-sm font-black text-gray-400 uppercase tracking-widest">No active inbound shipments</p>
                    </div>
                )}

                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-8 border-b border-gray-100 bg-gray-50/20 flex items-center justify-between">
                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight">Recent Trade History</h3>
                        <button onClick={() => navigate('/orders')} className="text-emerald-600 font-black text-[9px] uppercase tracking-widest hover:underline">View Ledger</button>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {orders.slice(0, 4).map(o => (
                            <div key={o.id} onClick={() => setViewingOrderDetails(o)} className="p-6 flex items-center justify-between hover:bg-gray-50/50 transition-colors cursor-pointer group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                        <ShoppingCart size={18}/>
                                    </div>
                                    <div>
                                        <p className="font-black text-gray-900 text-xs uppercase">Order #{o.id.split('-').pop()}</p>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase">{new Date(o.date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-gray-900 text-sm tracking-tighter">${o.totalAmount.toFixed(2)}</p>
                                    {o.issue ? (
                                        <span className="text-[7px] font-black text-red-500 uppercase tracking-widest flex items-center justify-end gap-1">
                                            <AlertCircle size={8}/> PAYMENT HELD
                                        </span>
                                    ) : (
                                        <span className="text-[7px] font-black text-emerald-500 uppercase tracking-widest">Verified</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      </div>

      <OrderManifestModal 
        isOpen={!!viewingOrderDetails}
        onClose={() => setViewingOrderDetails(null)}
        order={viewingOrderDetails}
        products={products}
        onReportIssue={handleManifestReport}
      />
    </div>
  );
};

const ShieldCheck = ({ size = 24, ...props }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>
);
