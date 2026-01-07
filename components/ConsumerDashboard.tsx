
import React, { useState, useEffect, useMemo } from 'react';
import { User, Order, Product, OrderItem } from '../types';
import { mockService } from '../services/mockDataService';
import { 
  DollarSign, ShoppingBag, Truck, CheckCircle, Clock, Package, 
  Leaf, ArrowRight, ShoppingCart, Heart, Plus, Minus, TrendingDown,
  ChevronRight, Calendar, Search, X, Loader2, Check, RotateCcw, Pencil,
  Sparkles, Gift, ShieldCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { OrderManifestModal } from './CustomerOrders';

interface ConsumerDashboardProps {
  user: User;
}

interface QuickAddCardProps {
  product: Product;
  onQuickAdd: (p: Product, q: number) => void;
}

const QuickAddCard: React.FC<QuickAddCardProps> = ({ product, onQuickAdd }) => {
    const [qty, setQty] = useState(1);
    const [isAdded, setIsAdded] = useState(false);

    const handleAddClick = () => {
        onQuickAdd(product, qty);
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000);
    };

    return (
        <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-4 group hover:shadow-md transition-all relative">
            <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
                <img src={product.imageUrl} className="w-full h-full object-cover" alt={product.name} />
            </div>
            <div className="flex-1 min-w-0">
                <h4 className="font-black text-gray-900 uppercase text-[11px] truncate tracking-tight">{product.name}</h4>
                <p className="text-[10px] font-bold text-gray-400 mt-0.5">${product.defaultPricePerKg.toFixed(2)} <span className="text-[8px]">/ KG</span></p>
            </div>
            
            <div className="flex items-center bg-gray-50 rounded-xl px-1 py-1 border border-gray-100 shadow-inner-sm">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-1.5 text-gray-400 hover:text-red-500"><Minus size={14} strokeWidth={3}/></button>
                <span className="w-8 text-center font-black text-xs text-gray-900">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="p-1.5 text-gray-400 hover:text-emerald-500"><Plus size={14} strokeWidth={3}/></button>
            </div>

            <button onClick={handleAddClick} className={`p-3 rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center border ${isAdded ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-[#043003] text-white border-emerald-900/10 hover:bg-black'}`}>
                {isAdded ? <Check size={18} strokeWidth={4}/> : <ShoppingCart size={18} strokeWidth={2.5}/>}
            </button>
        </div>
    );
};

const WeeklyOrderCalendar = ({ orders }: { orders: Order[] }) => {
    const navigate = useNavigate();
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const days = useMemo(() => {
        const result = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date(); d.setDate(d.getDate() - i); result.push(d);
        }
        return result;
    }, []);

    const selectedDateOrders = useMemo(() => orders.filter(o => new Date(o.date).toDateString() === selectedDate.toDateString()), [orders, selectedDate]);

    return (
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden flex flex-col animate-in slide-in-from-right-4 duration-500 h-full">
            <div className="p-8 border-b border-gray-100 bg-white shrink-0">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-inner-sm"><Calendar size={24} /></div>
                    <div>
                        <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight leading-none">Order Calendar</h2>
                        <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest mt-1.5">Quick re-order from history</p>
                    </div>
                </div>
            </div>
            <div className="p-8 space-y-6">
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 px-1">
                    {days.map((date, idx) => (
                        <button key={idx} onClick={() => setSelectedDate(date)} className={`flex-1 min-w-[80px] py-4 rounded-2xl transition-all flex flex-col items-center justify-center border-2 ${date.toDateString() === selectedDate.toDateString() ? 'bg-[#5c56d6] border-[#5c56d6] text-white shadow-lg' : 'bg-white border-gray-50 text-gray-400'}`}>
                            <span className="text-[9px] font-black uppercase mb-1">{date.toLocaleDateString('en-AU', { weekday: 'short' })}</span>
                            <span className="text-xl font-black">{date.getDate()}</span>
                        </button>
                    ))}
                </div>
                <div className="space-y-4">
                    {selectedDateOrders.length === 0 ? (
                        <div className="py-12 text-center border-2 border-dashed border-gray-100 rounded-3xl opacity-30"><Clock size={32} className="mx-auto mb-2" /><p className="text-[10px] font-black uppercase">No trade activity</p></div>
                    ) : selectedDateOrders.map(order => (
                        <div key={order.id} className="bg-gray-50 rounded-2xl p-5 border border-gray-100 flex justify-between items-center">
                            <div>
                                <p className="font-black text-gray-900 uppercase text-xs">Order #{order.id.split('-').pop()}</p>
                                <p className="text-[10px] font-bold text-emerald-600 mt-1">${order.totalAmount.toFixed(2)}</p>
                            </div>
                            <button onClick={() => navigate('/marketplace')} className="bg-white border border-gray-200 px-4 py-2 rounded-xl text-[10px] font-black uppercase text-gray-600 hover:border-emerald-500 hover:text-emerald-600 transition-all">Re-order</button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export const ConsumerDashboard: React.FC<ConsumerDashboardProps> = ({ user }) => {
  const navigate = useNavigate();
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [viewingOrderDetails, setViewingOrderDetails] = useState<Order | null>(null);

  useEffect(() => {
    const fetch = () => {
        const userOrders = mockService.getOrders(user.id).filter(o => o.buyerId === user.id);
        setAllOrders(userOrders);
        const allProds = mockService.getAllProducts();
        setProducts(allProds);
        const userFavorites = mockService.getAllUsers().find(u => u.id === user.id)?.favorites || [];
        setFavorites(allProds.filter(p => userFavorites.includes(p.id)));
    };
    fetch();
    const interval = setInterval(fetch, 10000);
    return () => clearInterval(interval);
  }, [user.id]);

  const stats = useMemo(() => {
    const monthlyTotal = allOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const active = allOrders.filter(o => ['Pending', 'Confirmed', 'Ready for Delivery', 'Shipped'].includes(o.status)).length;
    let co2 = 0;
    allOrders.forEach(o => o.items.forEach(item => {
        const p = products.find(prod => prod.id === item.productId);
        co2 += item.quantityKg * (p?.co2SavingsPerKg || 0.8);
    }));
    return { monthlyTotal, active, co2 };
  }, [allOrders, products]);

  const handleQuickAdd = (product: Product, quantity: number) => {
      mockService.addToCart({
          productId: product.id, productName: product.name,
          price: product.defaultPricePerKg, qty: quantity,
          imageUrl: product.imageUrl, unit: product.unit || 'KG'
      });
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      
      {/* BONUS ACTIVATION WIDGET (Requested Change) */}
      {user.bonusActivated && (
          <div className="bg-[#043003] rounded-[2.5rem] p-8 md:p-10 text-white shadow-2xl relative overflow-hidden group border border-emerald-900/50">
              <div className="absolute top-0 right-0 p-10 opacity-5 transform rotate-12 scale-150 group-hover:rotate-0 transition-transform duration-700 pointer-events-none"><Gift size={200}/></div>
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
                  <div className="flex items-center gap-6">
                      <div className="w-20 h-20 bg-emerald-500/20 rounded-[2rem] border-2 border-emerald-400 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-900/20 shrink-0">
                          <Sparkles size={40} />
                      </div>
                      <div>
                          <div className="flex items-center gap-3 mb-2">
                             <span className="bg-emerald-500 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-emerald-500/20">Signup Bonus Activated</span>
                             <span className="text-emerald-400 font-black text-xs uppercase tracking-widest">• Verified Profile</span>
                          </div>
                          <h2 className="text-3xl md:text-4xl font-black tracking-tighter uppercase leading-none">Welcome to Platform Zero</h2>
                          <p className="text-emerald-100/70 text-sm font-medium mt-3 max-w-xl">We've credited <span className="text-white font-black">${user.pendingBonus?.toLocaleString()}</span> to your trade account. This will be automatically applied to your next <span className="text-white font-black">{user.bonusVestingWeeks} weeks</span> of trade procurement.</p>
                      </div>
                  </div>
                  <div className="flex flex-col items-center gap-4 w-full md:w-auto">
                      <div className="bg-white/10 rounded-2xl px-6 py-4 border border-white/10 text-center w-full min-w-[200px]">
                          <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-1">Available Credits</p>
                          <p className="text-3xl font-black tracking-tighter">${(user.pendingBonus || 0).toLocaleString()}</p>
                      </div>
                      <button onClick={() => navigate('/marketplace')} className="w-full py-4 bg-white text-[#043003] rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-xl hover:bg-emerald-50 transition-all flex items-center justify-center gap-2">
                          Start Procurement <ArrowRight size={16}/>
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* KPI SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-2">
         {[
            { label: 'TRADE VOLUME', value: `$${stats.monthlyTotal.toLocaleString()}`, color: 'text-emerald-50', trend: '14% Optimized', icon: DollarSign, bg: 'bg-[#5c56d6]' },
            { label: 'ACTIVE SHIPMENTS', value: stats.active, color: 'text-blue-500', trend: 'In Transit', icon: Truck, bg: 'bg-white' },
            { label: 'CO2 DIVERTED', value: `${stats.co2.toFixed(0)}kg`, color: 'text-emerald-600', trend: 'Impact Score', icon: Leaf, bg: 'bg-white' }
         ].map((kpi, i) => (
            <div key={i} className={`p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col justify-between h-40 hover:shadow-xl transition-all ${kpi.bg === 'bg-[#5c56d6]' ? 'bg-[#5c56d6] text-white' : 'bg-white'}`}>
                <div className="flex justify-between items-start">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${kpi.bg === 'bg-[#5c56d6]' ? 'text-indigo-200' : 'text-gray-400'}`}>{kpi.label}</span>
                    <kpi.icon size={20} className={kpi.bg === 'bg-[#5c56d6]' ? 'text-white' : kpi.color}/>
                </div>
                <div>
                    <h3 className="text-4xl font-black tracking-tighter leading-none">{kpi.value}</h3>
                    <p className={`text-[9px] font-black uppercase mt-3 flex items-center gap-1.5 ${kpi.bg === 'bg-[#5c56d6]' ? 'text-indigo-200' : 'text-gray-400'}`}>
                       <CheckCircle size={12}/> {kpi.trend}
                    </p>
                </div>
            </div>
         ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 px-2">
        <div className="xl:col-span-7 space-y-8">
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight flex items-center gap-2">
                    <Heart size={20} className="text-red-500 fill-red-500"/> Essentials Catalog
                </h2>
                <button onClick={() => navigate('/marketplace')} className="text-emerald-600 font-black text-[10px] uppercase tracking-widest hover:underline">Full Market <ArrowRight size={12}/></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {favorites.length === 0 ? (
                    <div className="col-span-full py-12 text-center bg-white rounded-[2rem] border-2 border-dashed border-gray-100 text-gray-400 text-xs font-bold uppercase">
                        Heart items in the market to see them here.
                    </div>
                ) : favorites.slice(0, 6).map(p => (
                    <QuickAddCard key={p.id} product={p} onQuickAdd={handleQuickAdd} />
                ))}
            </div>
        </div>

        <div className="xl:col-span-5">
            <WeeklyOrderCalendar orders={allOrders} />
        </div>
      </div>

      <OrderManifestModal 
        isOpen={!!viewingOrderDetails}
        onClose={() => setViewingOrderDetails(null)}
        order={viewingOrderDetails}
        products={products}
        onReportIssue={(o) => navigate('/orders', { state: { openVerificationId: o.id } })}
      />
    </div>
  );
};
