
import React, { useState, useEffect, useMemo } from 'react';
import { User, Order, Product, OrderItem } from '../types';
import { mockService } from '../services/mockDataService';
import { 
  DollarSign, ShoppingBag, Truck, CheckCircle, Clock, Package, 
  Leaf, ArrowRight, ShoppingCart, Heart, Plus, TrendingDown,
  ChevronRight, Calendar, Search, X, Loader2, Check, RotateCcw, Pencil
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ConsumerDashboardProps {
  user: User;
}

const QuickAddCard = ({ product, onQuickAdd }: { product: Product, onQuickAdd: (p: Product) => void, key?: React.Key }) => (
    <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-4 group hover:shadow-md transition-all">
        <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
            <img src={product.imageUrl} className="w-full h-full object-cover" alt={product.name} />
        </div>
        <div className="flex-1 min-w-0">
            <h4 className="font-black text-gray-900 uppercase text-[11px] truncate tracking-tight">{product.name}</h4>
            <p className="text-[10px] font-bold text-gray-400 mt-0.5">${product.defaultPricePerKg.toFixed(2)} <span className="text-[8px]">/ KG</span></p>
        </div>
        <button 
            onClick={() => onQuickAdd(product)}
            className="p-3 bg-gray-50 hover:bg-emerald-50 text-gray-400 hover:text-emerald-600 rounded-xl transition-all border border-transparent hover:border-emerald-100 active:scale-95"
            title="Quick Add 10kg"
        >
            <Plus size={18} strokeWidth={3}/>
        </button>
    </div>
);

const WeeklyOrderCalendar = ({ orders }: { orders: Order[] }) => {
    const navigate = useNavigate();
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    
    // Generate last 7 days including today
    const days = useMemo(() => {
        const result = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            result.push(d);
        }
        return result;
    }, []);

    const selectedDateOrders = useMemo(() => {
        return orders.filter(o => new Date(o.date).toDateString() === selectedDate.toDateString());
    }, [orders, selectedDate]);

    const handleReorder = (order: Order) => {
        alert(`Initiating one-tap re-order for Order #${order.id.split('-').pop()}. Items added to cart.`);
        navigate('/marketplace');
    };

    return (
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden flex flex-col animate-in slide-in-from-right-4 duration-500">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-white shrink-0">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-inner-sm">
                        <Calendar size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight leading-none">Weekly Order Calendar</h2>
                        <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest mt-1.5">Live History & Re-Ordering</p>
                    </div>
                </div>
            </div>

            <div className="p-8 space-y-10">
                {/* Day Selector */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 px-1">
                    {days.map((date, idx) => {
                        const isSelected = date.toDateString() === selectedDate.toDateString();
                        const dayName = date.toLocaleDateString('en-AU', { weekday: 'short' }).toUpperCase();
                        const dayNum = date.getDate();
                        const hasOrders = orders.some(o => new Date(o.date).toDateString() === date.toDateString());

                        return (
                            <button 
                                key={idx}
                                onClick={() => setSelectedDate(date)}
                                className={`flex-1 min-w-[85px] py-6 rounded-[1.75rem] transition-all flex flex-col items-center justify-center relative border-2 ${
                                    isSelected 
                                    ? 'bg-[#5c56d6] border-[#5c56d6] text-white shadow-xl shadow-indigo-100 scale-105 z-10' 
                                    : 'bg-white border-gray-50 text-gray-400 hover:border-gray-200'
                                }`}
                            >
                                <span className="text-[10px] font-black tracking-widest mb-1">{dayName}</span>
                                <span className="text-2xl font-black tracking-tight">{dayNum}</span>
                                {hasOrders && (
                                    <div className={`absolute bottom-3 w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-indigo-400 animate-pulse'}`}></div>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Selected Day Display */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <div>
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Selected Day</p>
                            <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">
                                {selectedDate.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'short' }).toUpperCase()}
                            </h3>
                        </div>
                        {selectedDateOrders.length > 0 && (
                            <span className="bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border border-emerald-100">
                                {selectedDateOrders.length} Orders
                            </span>
                        )}
                    </div>

                    <div className="space-y-4 max-h-[400px] overflow-y-auto no-scrollbar pr-1">
                        {selectedDateOrders.length === 0 ? (
                            <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-[2rem] opacity-30">
                                <Clock size={32} className="mx-auto mb-2" />
                                <p className="text-xs font-black uppercase tracking-widest">No trade activity recorded</p>
                            </div>
                        ) : selectedDateOrders.map(order => (
                            <div key={order.id} className="bg-white rounded-[1.75rem] border border-gray-100 p-6 shadow-sm group hover:shadow-md transition-all">
                                <div className="flex justify-between items-start mb-5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 border border-gray-100 shrink-0">
                                            <ShoppingCart size={20}/>
                                        </div>
                                        <div>
                                            <h4 className="font-black text-gray-900 uppercase text-sm tracking-tight">Order #{order.id.split('-').pop()}</h4>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase mt-0.5">
                                                {order.items.length} LINES • <span className="text-emerald-600">${order.totalAmount.toFixed(2)}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border border-emerald-100">
                                        {order.status.toUpperCase()}
                                    </span>
                                </div>

                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => navigate('/orders', { state: { openVerificationId: order.id } })}
                                        className="flex-[3] py-4 bg-[#0F172A] text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-all active:scale-95"
                                    >
                                        <Pencil size={14}/> Edit & Re-Order
                                    </button>
                                    <button 
                                        onClick={() => handleReorder(order)}
                                        className="flex-[2] py-4 bg-white border border-gray-200 text-gray-500 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:border-emerald-500 hover:text-emerald-600 transition-all active:scale-95 shadow-sm"
                                    >
                                        <RotateCcw size={14}/> One-Tap Re-Order
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

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
                <h2 className="text-[11px] font-black text-gray-900 uppercase tracking-[0.2em]">Active Incoming Delivery</h2>
                <button onClick={() => navigate('/orders')} className="text-emerald-600 font-black text-[9px] uppercase tracking-[0.2em] flex items-center gap-1">LIVE TRACKING <ArrowRight size={12}/></button>
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

                <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-[1.75rem] flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-50">
                        <CheckCircle size={24}/>
                    </div>
                    <div>
                        <p className="font-black text-gray-900 text-sm uppercase tracking-tight">Drop-off Confirmed</p>
                        <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest mt-1">Logged Delivery</p>
                    </div>
                </div>

                <button 
                    onClick={() => onOpenVerification(order)}
                    className="w-full py-5 bg-[#043003] text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all"
                >
                    <Clock size={16}/> ISSUE REPORTING WINDOW (OPEN)
                </button>
            </div>
        </div>
    );
};

export const ConsumerDashboard: React.FC<ConsumerDashboardProps> = ({ user }) => {
  const navigate = useNavigate();
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [favorites, setFavorites] = useState<Product[]>([]);

  useEffect(() => {
    const fetch = () => {
        const userOrders = mockService.getOrders(user.id).filter(o => o.buyerId === user.id);
        setAllOrders(userOrders);
        const allProds = mockService.getAllProducts();
        setProducts(allProds);
        setFavorites(allProds.filter(p => user.favorites?.includes(p.id)));
    };
    fetch();
    const interval = setInterval(fetch, 10000);
    return () => clearInterval(interval);
  }, [user.id, user.favorites]);

  const stats = useMemo(() => {
    const monthlyTotal = allOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const active = allOrders.filter(o => ['Pending', 'Confirmed', 'Ready for Delivery', 'Shipped'].includes(o.status)).length;
    const unpaid = allOrders.filter(o => o.paymentStatus !== 'Paid').length;
    let co2 = 0;
    allOrders.forEach(o => o.items.forEach(item => {
        const p = products.find(prod => prod.id === item.productId);
        co2 += item.quantityKg * (p?.co2SavingsPerKg || 0.8);
    }));
    return { monthlyTotal, active, unpaid, co2 };
  }, [allOrders, products]);

  const activeIncoming = allOrders.find(o => ['Confirmed', 'Ready for Delivery', 'Shipped', 'Delivered'].includes(o.status));

  const handleQuickAdd = (product: Product) => {
      mockService.createFullOrder(user.id, [{ productId: product.id, quantityKg: 10, pricePerKg: product.defaultPricePerKg, unit: 'KG' }], product.defaultPricePerKg * 10);
      alert(`10kg of ${product.name} added to your active order list!`);
  };

  const handleOpenVerification = (order: Order) => {
      navigate('/orders', { state: { openVerificationId: order.id } });
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      
      {/* KPI SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 px-2">
         {[
            { label: 'MONTHLY SPEND', value: `$${stats.monthlyTotal.toLocaleString()}`, color: 'text-emerald-500', trend: '14% Optimized', icon: DollarSign },
            { label: 'ACTIVE SHIPMENTS', value: stats.active, color: 'text-blue-500', trend: '1 Arriving Today', icon: Truck },
            { label: 'INVOICES DUE', value: stats.unpaid, color: 'text-orange-500', trend: '$0 Outstanding', icon: Clock },
            { label: 'CO2 DIVERTED', value: `${stats.co2.toFixed(0)}kg`, color: 'text-emerald-600', trend: 'Verified Impact', icon: Leaf }
         ].map((kpi, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between h-36 hover:shadow-md transition-all">
                <div className="flex justify-between items-start">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{kpi.label}</span>
                    <kpi.icon size={16} className={kpi.color}/>
                </div>
                <div className="mt-4">
                    <h3 className="text-3xl font-black text-gray-900 tracking-tighter leading-none">{kpi.value}</h3>
                    <p className={`text-[8px] font-black uppercase mt-2 flex items-center gap-1 ${kpi.trend.includes('Optimized') || kpi.trend.includes('Verified') ? 'text-emerald-500' : 'text-gray-400'}`}>
                       {kpi.trend.includes('Optimized') && <TrendingDown size={10}/>}
                       {kpi.trend.includes('Verified') && <CheckCircle size={10}/>}
                       {kpi.trend}
                    </p>
                </div>
            </div>
         ))}
      </div>

      {/* QUICK ADD FAVORITES */}
      <div className="space-y-4 px-2">
         <div className="flex items-center justify-between">
            <div>
               <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight flex items-center gap-2">
                   <Heart size={20} className="text-red-500 fill-red-500"/> Quick Add Favorites
               </h2>
               <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Tap to add 10kg to your daily procurement</p>
            </div>
            <button onClick={() => navigate('/marketplace')} className="text-emerald-600 font-black text-[10px] uppercase tracking-widest hover:underline">View Catalog</button>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {favorites.length === 0 ? (
                <div className="col-span-full py-8 text-center bg-white rounded-3xl border-2 border-dashed border-gray-100 text-gray-400 text-xs font-bold uppercase tracking-widest">
                    No favorites set. Heart products in the catalog to see them here.
                </div>
            ) : favorites.map(p => (
                <QuickAddCard key={p.id} product={p} onQuickAdd={handleQuickAdd} />
            ))}
         </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 px-2">
        {/* LEFT COLUMN */}
        <div className="xl:col-span-6 space-y-8">
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full">
                <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-white">
                    <h2 className="text-base font-black text-gray-900 uppercase tracking-tight">Recent Order History</h2>
                    <button onClick={() => navigate('/orders')} className="text-emerald-600 font-black text-[9px] uppercase tracking-widest hover:underline">VIEW ALL ORDERS</button>
                </div>
                <div className="divide-y divide-gray-50 max-h-[600px] overflow-y-auto no-scrollbar">
                    {allOrders.length === 0 ? (
                        <div className="py-20 text-center opacity-30">
                            <Clock size={32} className="mx-auto mb-2" />
                            <p className="text-xs font-black uppercase">No orders yet</p>
                        </div>
                    ) : allOrders.slice(0, 8).map(order => (
                        <div 
                            key={order.id} 
                            onClick={() => navigate('/orders')}
                            className="p-6 flex items-center justify-between hover:bg-gray-50/50 transition-colors group cursor-pointer"
                        >
                            <div className="flex items-center gap-5">
                                <div className="w-12 h-12 bg-gray-50 rounded-[1.25rem] flex items-center justify-center text-indigo-500 group-hover:bg-indigo-50 transition-colors border border-gray-100">
                                    <ShoppingCart size={20}/>
                                </div>
                                <div>
                                    <p className="font-black text-gray-900 text-sm uppercase tracking-tight">Order #{order.id.split('-').pop()}</p>
                                    <p className="text-[10px] font-bold text-gray-400 mt-0.5 uppercase tracking-widest">{new Date(order.date).toLocaleDateString()} • <span className="text-emerald-600">${order.totalAmount.toFixed(2)}</span></p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-gray-200 ${order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-50 text-gray-400'}`}>
                                    {order.status.toUpperCase()}
                                </span>
                                <ChevronRight size={16} className="text-gray-300 group-hover:text-indigo-500 transition-all group-hover:translate-x-1" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="xl:col-span-6 space-y-8">
            {activeIncoming ? (
                <ActiveRunStatus order={activeIncoming} onOpenVerification={handleOpenVerification} />
            ) : (
                <div className="bg-white rounded-[2.5rem] p-12 text-center border-2 border-dashed border-gray-100 opacity-60">
                    <Truck size={48} className="mx-auto text-gray-200 mb-4" />
                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">No active deliveries incoming</h3>
                </div>
            )}
            
            {/* Weekly Order Calendar (Requested Change 1) */}
            <WeeklyOrderCalendar orders={allOrders} />
        </div>
      </div>
    </div>
  );
};
