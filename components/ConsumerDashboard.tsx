
import React, { useState, useEffect, useMemo } from 'react';
import { User, Order, Product, OrderItem } from '../types';
import { mockService } from '../services/mockDataService';
import { 
  DollarSign, ShoppingBag, Truck, CheckCircle, Clock, Package, 
  Leaf, ArrowRight, ShoppingCart, Heart, Plus, Minus,
  ChevronRight, Calendar, X, Loader2, Check, RotateCcw,
  CheckCircle2, MapPin, AlertCircle, Pencil, RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { OrderManifestModal, LiveTrackingModal, DeliveryVerificationModal } from './CustomerOrders';

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

const ActiveIncomingDelivery = ({ order, onTrack }: { order: Order, onTrack: () => void }) => {
    const steps = [
        { label: 'PENDING', icon: Clock, active: true },
        { label: 'PROCESSING', icon: Package, active: true },
        { label: 'TRANSIT', icon: Truck, active: order.status === 'Shipped' || order.status === 'Delivered' },
        { label: 'DELIVERED', icon: CheckCircle2, active: order.status === 'Delivered' }
    ];

    const currentStepIndex = steps.filter(s => s.active).length - 1;

    return (
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden mb-10 animate-in slide-in-from-top-4 duration-500">
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white">
                <h2 className="text-[13px] font-black text-gray-900 uppercase tracking-[0.2em]">Active Incoming Delivery</h2>
                <button onClick={onTrack} className="text-emerald-500 font-black text-[11px] uppercase tracking-widest flex items-center gap-1.5 hover:underline">
                    LIVE TRACKING <ArrowRight size={14} strokeWidth={3}/>
                </button>
            </div>

            <div className="p-10 space-y-12">
                {/* Header Match */}
                <div className="bg-[#F6F8FF] rounded-[2rem] p-10 flex justify-between items-center border border-[#E0E7FF]">
                    <div>
                        <h3 className="text-[32px] font-black text-gray-900 tracking-tighter uppercase leading-none mb-2">Order #{order.id.split('-').pop()}</h3>
                        <p className="text-[12px] font-bold text-indigo-600 uppercase tracking-widest">
                            {order.status === 'Delivered' ? `Delivered at ${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false})}` : 'Arriving Today'}
                        </p>
                    </div>
                    <div className="bg-[#4F46E5] text-white px-10 py-3.5 rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-indigo-100">
                        {order.status.toUpperCase()}
                    </div>
                </div>

                {/* Progress Bar Match */}
                <div className="flex justify-between items-center px-6 relative max-w-4xl mx-auto py-4">
                    <div className="absolute top-1/2 left-10 right-10 h-0.5 bg-gray-100 -translate-y-1/2 z-0"></div>
                    <div 
                        className="absolute top-1/2 left-10 h-0.5 bg-emerald-500 -translate-y-1/2 z-0 transition-all duration-1000"
                        style={{ width: `${(currentStepIndex / (steps.length - 1)) * 94}%` }}
                    ></div>

                    {steps.map((step, idx) => (
                        <div key={idx} className="flex flex-col items-center z-10 w-24">
                            <div className={`w-12 h-12 rounded-[1.25rem] flex items-center justify-center border-2 transition-all duration-500 ${
                                idx <= currentStepIndex ? 'bg-emerald-500 border-emerald-50 text-white shadow-xl' : 'bg-white border-gray-100 text-gray-200'
                            }`}>
                                <step.icon size={22} strokeWidth={idx <= currentStepIndex ? 3 : 2} />
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-[0.2em] mt-5 ${idx <= currentStepIndex ? 'text-gray-900' : 'text-gray-300'}`}>
                                {step.label}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Drop off Confirm Match */}
                <div className="bg-[#E6F9F1] rounded-[2rem] p-8 flex items-center gap-6 border border-[#D1FAE5]">
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm border border-[#D1FAE5]">
                        <CheckCircle2 size={32} strokeWidth={2.5}/>
                    </div>
                    <div>
                        <p className="font-black text-gray-900 text-sm uppercase tracking-tight leading-none mb-1.5">Drop-off Confirmed</p>
                        <p className="text-[11px] font-black text-emerald-600 uppercase tracking-widest">Logged Delivery</p>
                    </div>
                </div>

                {/* Reporting Window Match */}
                <div className="bg-[#051C05] text-white p-6 rounded-[1.75rem] flex items-center justify-center gap-4">
                    <Clock size={22} className="text-emerald-400" />
                    <span className="font-black text-[12px] uppercase tracking-[0.3em]">Issue Reporting Window (00:00)</span>
                </div>
            </div>
        </div>
    );
};

const WeeklyOrderCalendar = ({ orders, onReorder }: { orders: Order[], onReorder: (order: Order) => void }) => {
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    
    // Generate last 7 days including today
    const days = useMemo(() => {
        const result = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setHours(0, 0, 0, 0);
            d.setDate(d.getDate() - i);
            result.push(d);
        }
        return result;
    }, []);

    const selectedDateOrders = useMemo(() => 
        orders.filter(o => {
            const orderDate = new Date(o.date);
            orderDate.setHours(0,0,0,0);
            return orderDate.getTime() === selectedDate.getTime();
        })
    , [orders, selectedDate]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Pending': return 'bg-blue-100 text-blue-600';
            case 'Delivered': return 'bg-emerald-100 text-emerald-600';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    return (
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden flex flex-col animate-in slide-in-from-right-4 duration-500 h-full">
            <div className="p-8 border-b border-gray-100 bg-white shrink-0">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white text-emerald-500 rounded-2xl flex items-center justify-center shadow-inner-sm border border-gray-100">
                        <Calendar size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight leading-none">Weekly Order Calendar</h2>
                        <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest mt-1.5">Live History & Re-ordering</p>
                    </div>
                </div>
            </div>
            
            <div className="p-8 space-y-10">
                {/* Horizontal Day Selector Match */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                    {days.map((date, idx) => {
                        const isSelected = date.getTime() === selectedDate.getTime();
                        return (
                            <button 
                                key={idx} 
                                onClick={() => setSelectedDate(date)} 
                                className={`flex-1 min-w-[90px] py-6 rounded-2xl transition-all flex flex-col items-center justify-center border-2 ${
                                    isSelected 
                                    ? 'bg-[#5c56d6] border-[#5c56d6] text-white shadow-xl scale-105 z-10' 
                                    : 'bg-white border-gray-50 text-gray-400 hover:border-gray-100'
                                }`}
                            >
                                <span className={`text-[10px] font-black uppercase mb-2 ${isSelected ? 'text-indigo-100' : 'text-gray-300'}`}>
                                    {date.toLocaleDateString('en-AU', { weekday: 'short' }).toUpperCase()}
                                </span>
                                <span className="text-2xl font-black">{date.getDate()}</span>
                                {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full mt-2 animate-pulse"></div>}
                            </button>
                        );
                    })}
                </div>

                {/* Selected Day Info Match */}
                <div className="space-y-6">
                    <div className="flex justify-between items-end px-2">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Selected Day</p>
                            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">
                                {selectedDate.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'short' }).toUpperCase()}
                            </h3>
                        </div>
                        <span className="bg-emerald-50 text-emerald-600 px-4 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                            {selectedDateOrders.length} Orders
                        </span>
                    </div>

                    <div className="space-y-4">
                        {selectedDateOrders.length === 0 ? (
                            <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-[2.5rem] bg-gray-50/50">
                                <Clock size={40} className="mx-auto mb-3 text-gray-200" />
                                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">No trade activity recorded</p>
                            </div>
                        ) : selectedDateOrders.map(order => (
                            <div key={order.id} className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm group hover:shadow-md transition-all">
                                <div className="flex justify-between items-start mb-8">
                                    <div className="flex items-center gap-5">
                                        <div className="w-14 h-14 bg-gray-50 text-gray-400 rounded-2xl flex items-center justify-center border border-gray-100 shadow-inner-sm">
                                            <ShoppingBag size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-gray-900 uppercase text-base tracking-tight leading-none mb-2">Order #{order.id.split('-').pop()}</h4>
                                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                                                {order.items.length} Lines • <span className="text-emerald-500">${order.totalAmount.toFixed(2)}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.15em] border ${getStatusColor(order.status)}`}>
                                        {order.status.toUpperCase()}
                                    </span>
                                </div>
                                
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <button 
                                        onClick={() => onReorder(order)} 
                                        className="flex-[2.5] py-4 bg-[#0F172A] text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg hover:bg-black transition-all flex items-center justify-center gap-3"
                                    >
                                        <Pencil size={14}/> Edit & Re-Order
                                    </button>
                                    <button 
                                        className="flex-1 py-4 bg-white border border-gray-200 text-gray-400 hover:text-indigo-600 hover:border-indigo-100 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-sm"
                                    >
                                        <RefreshCw size={14}/> One-Tap
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

const ReorderManifestModal = ({ isOpen, onClose, order, products, onConfirm }: { 
    isOpen: boolean, 
    onClose: () => void, 
    order: Order | null, 
    products: Product[],
    onConfirm: (updatedItems: OrderItem[]) => void
}) => {
    const [localItems, setLocalItems] = useState<OrderItem[]>([]);

    useEffect(() => {
        if (order) {
            setLocalItems(order.items.map(item => ({ ...item })));
        }
    }, [order]);

    if (!isOpen || !order) return null;

    const handleQtyChange = (productId: string, delta: number) => {
        setLocalItems(prev => prev.map(item => {
            if (item.productId === productId) {
                return { ...item, quantityKg: Math.max(0, item.quantityKg + delta) };
            }
            return item;
        }));
    };

    const finalTotal = localItems.reduce((sum, item) => sum + (item.quantityKg * item.pricePerKg), 0);

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 border border-gray-100">
                <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-white shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                            <RotateCcw size={24} strokeWidth={3}/>
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight leading-none">Re-order Manifest</h2>
                            <p className="text-[10px] text-indigo-600 font-black uppercase tracking-[0.2em] mt-1.5">Adjust quantities for your new order</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-300 hover:text-gray-900 p-2 bg-gray-50 rounded-full border border-gray-100 shadow-sm transition-all"><X size={24}/></button>
                </div>

                <div className="flex-1 overflow-y-auto p-10 space-y-6 no-scrollbar bg-white">
                    <div className="divide-y divide-gray-50 border border-gray-100 rounded-[2.5rem] overflow-hidden bg-white shadow-inner-sm">
                        {localItems.map((item, idx) => {
                            const p = products.find(prod => prod.id === item.productId);
                            return (
                                <div key={idx} className="p-6 flex items-center justify-between hover:bg-gray-50/50 transition-all group">
                                    <div className="flex items-center gap-5">
                                        <div className="w-14 h-14 rounded-2xl overflow-hidden border border-gray-100 shadow-sm bg-gray-50 shrink-0">
                                            <img src={p?.imageUrl} className="w-full h-full object-cover" alt="" />
                                        </div>
                                        <div>
                                            <p className="font-black text-gray-900 text-base uppercase tracking-tight leading-none mb-1.5">{p?.name || 'Produce Item'}</p>
                                            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">${item.pricePerKg.toFixed(2)} / unit</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center bg-gray-50 rounded-xl p-1 border border-gray-200/50 shadow-inner-sm">
                                        <button onClick={() => handleQtyChange(item.productId, -1)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><Minus size={18} strokeWidth={3}/></button>
                                        <div className="px-6 text-center min-w-[60px]">
                                            <p className="font-black text-gray-900 text-lg leading-none">{item.quantityKg}</p>
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mt-1">{p?.unit || 'KG'}</p>
                                        </div>
                                        <button onClick={() => handleQtyChange(item.productId, 1)} className="p-2 text-gray-400 hover:text-emerald-500 transition-colors"><Plus size={18} strokeWidth={3}/></button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="p-8 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-6 shrink-0">
                    <div className="text-left">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] mb-1">New Order Estimated Total</p>
                        <h3 className="text-4xl font-black text-gray-900 tracking-tighter">${finalTotal.toFixed(2)}</h3>
                    </div>
                    <div className="flex gap-3 w-full sm:w-auto">
                        <button onClick={onClose} className="flex-1 sm:flex-none px-10 py-5 bg-white border-2 border-gray-100 text-gray-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-100 transition-all active:scale-95 shadow-sm">Cancel</button>
                        <button onClick={() => onConfirm(localItems)} className="flex-[1.5] sm:flex-none px-12 py-5 bg-[#043003] text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all active:scale-[0.98] flex items-center justify-center gap-3"><ShoppingCart size={18}/> Add Adjusted to Cart</button>
                    </div>
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
  const [reorderingOrder, setReorderingOrder] = useState<Order | null>(null);
  
  // LIVE TRACKING STATES
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);
  const [verifyingOrder, setVerifyingOrder] = useState<Order | null>(null);

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

  const activeOrders = useMemo(() => 
    allOrders.filter(o => ['Pending', 'Confirmed', 'Ready for Delivery', 'Shipped'].includes(o.status))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  , [allOrders]);

  const featuredIncomingOrder = useMemo(() => {
      // Prioritize recently delivered or shipped orders for the hero tracking feature
      return allOrders.find(o => ['Delivered', 'Shipped', 'Confirmed', 'Ready for Delivery'].includes(o.status));
  }, [allOrders]);

  const handleQuickAdd = (product: Product, quantity: number) => {
      mockService.addToCart({
          productId: product.id, productName: product.name,
          price: product.defaultPricePerKg, qty: quantity,
          imageUrl: product.imageUrl, unit: product.unit || 'KG'
      });
  };

  const handleConfirmReorder = (updatedItems: OrderItem[]) => {
      updatedItems.filter(i => i.quantityKg > 0).forEach(item => {
          const product = products.find(p => p.id === item.productId);
          if (product) {
              mockService.addToCart({
                  productId: item.productId,
                  productName: product.name,
                  price: item.pricePerKg,
                  qty: item.quantityKg,
                  imageUrl: product.imageUrl,
                  unit: item.unit || product.unit || 'KG'
              });
          }
      });
      setReorderingOrder(null);
      navigate('/marketplace');
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-orange-50 text-orange-600 border-orange-100';
      case 'Confirmed': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Ready for Delivery': return 'bg-purple-50 text-purple-600 border-purple-100';
      case 'Shipped': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      default: return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
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
        <div className="xl:col-span-7 space-y-12">
            <section className="space-y-6">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight flex items-center gap-2">
                        <Heart size={20} className="text-red-500 fill-red-500"/> Essentials Catalog
                    </h2>
                    <button onClick={() => navigate('/marketplace')} className="text-emerald-600 font-black text-[10px] uppercase tracking-widest hover:underline">Full Market <ArrowRight size={12}/></button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {favorites.length === 0 ? (
                        <div className="col-span-full py-12 text-center bg-white rounded-[2rem] border-2 border-dashed border-gray-100 text-gray-400 text-xs font-bold uppercase">Heart items in the market to see them here.</div>
                    ) : favorites.slice(0, 4).map(p => (
                        <QuickAddCard key={p.id} product={p} onQuickAdd={handleQuickAdd} />
                    ))}
                </div>
            </section>

            <section className="space-y-6">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight flex items-center gap-2">
                        <ShoppingCart size={20} className="text-indigo-600"/> All Active Orders
                    </h2>
                </div>
                
                <div className="space-y-3">
                    {activeOrders.length === 0 ? (
                        <div className="py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-gray-100 shadow-inner-sm">
                            <Package size={32} className="text-gray-200 mx-auto mb-4" />
                            <p className="text-xs font-black text-gray-300 uppercase tracking-widest">No active orders</p>
                        </div>
                    ) : activeOrders.slice(0, 3).map(order => (
                        <div key={order.id} onClick={() => setViewingOrderDetails(order)} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all group cursor-pointer animate-in slide-in-from-bottom-2">
                            <div className="flex items-center justify-between gap-6">
                                <div className="flex items-center gap-6">
                                    <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-black text-xl shadow-inner-sm group-hover:bg-indigo-600 group-hover:text-white transition-all shrink-0">
                                        {mockService.getWholesalers().find(u => u.id === order.sellerId)?.businessName.charAt(0) || 'P'}
                                    </div>
                                    <div>
                                        <h4 className="font-black text-gray-900 text-lg uppercase tracking-tight leading-none mb-2">Order #{order.id.split('-').pop()}</h4>
                                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border shadow-sm ${getStatusBadgeColor(order.status)}`}>{order.status}</span>
                                    </div>
                                </div>
                                <div className="text-right flex items-center gap-6">
                                    <div>
                                        <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Total</p>
                                        <p className="text-xl font-black text-gray-900 tracking-tighter">${order.totalAmount.toFixed(2)}</p>
                                    </div>
                                    <ChevronRight size={24} className="text-gray-300 group-hover:text-indigo-600"/>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* FEATURED INCOMING DELIVERY - MOVED BELOW ACTIVE ORDERS PER USER REQUEST */}
            {featuredIncomingOrder && (
                <div className="mt-12">
                    <ActiveIncomingDelivery 
                        order={featuredIncomingOrder} 
                        onTrack={() => setTrackingOrder(featuredIncomingOrder)}
                    />
                </div>
            )}
        </div>

        <div className="xl:col-span-5">
            <WeeklyOrderCalendar orders={allOrders} onReorder={(order) => setReorderingOrder(order)} />
        </div>
      </div>

      <OrderManifestModal 
        isOpen={!!viewingOrderDetails}
        onClose={() => setViewingOrderDetails(null)}
        order={viewingOrderDetails}
        products={products}
        onReportIssue={() => {}}
      />

      <ReorderManifestModal 
        isOpen={!!reorderingOrder}
        onClose={() => setReorderingOrder(null)}
        order={reorderingOrder}
        products={products}
        onConfirm={handleConfirmReorder}
      />

      <LiveTrackingModal 
        isOpen={!!trackingOrder}
        onClose={() => setTrackingOrder(null)}
        order={trackingOrder}
        onVerify={() => { setTrackingOrder(null); setVerifyingOrder(trackingOrder); }}
      />

      <DeliveryVerificationModal 
        isOpen={!!verifyingOrder}
        onClose={() => setVerifyingOrder(null)}
        order={verifyingOrder}
        products={products}
        onComplete={() => alert('Order verified. Transitioning to history.')}
      />
    </div>
  );
};
