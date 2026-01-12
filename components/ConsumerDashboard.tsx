import React, { useState, useEffect, useMemo } from 'react';
import { User, Order, Product, OrderItem } from '../types';
import { mockService } from '../services/mockDataService';
import { 
  DollarSign, ShoppingBag, Truck, CheckCircle, Clock, Package, 
  Leaf, ArrowRight, ShoppingCart, Heart, Plus, Minus,
  ChevronRight, Calendar, X, Loader2, Check, RotateCcw,
  CheckCircle2, MapPin, AlertCircle, Pencil, RefreshCw,
  Wind, Droplets, Recycle, Globe, Search, ChevronDown, TrendingUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { OrderManifestModal, LiveTrackingModal, DeliveryVerificationModal } from './CustomerOrders';

interface ConsumerDashboardProps {
  user: User;
}

const EssentialsProductCard: React.FC<{ 
  product: Product, 
  onAddToCart: (p: Product, q: number) => void
}> = ({ product, onAddToCart }) => {
    const [qty, setQty] = useState(1);

    return (
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-4 flex items-center justify-between group hover:shadow-md transition-all animate-in zoom-in-95">
            <div className="flex items-center gap-4 flex-1">
                <div className="w-14 h-14 rounded-2xl overflow-hidden border border-gray-50 shadow-inner-sm bg-gray-50 shrink-0">
                    <img src={product.imageUrl} className="w-full h-full object-cover" alt={product.name} />
                </div>
                <div className="min-w-0">
                    <h4 className="font-black text-gray-900 text-sm uppercase tracking-tight truncate leading-none mb-1">{product.name}</h4>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">${product.defaultPricePerKg.toFixed(2)} / KG</p>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center bg-gray-50 border border-gray-100 rounded-xl px-1 py-1">
                    <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors">
                        <Minus size={14} strokeWidth={3}/>
                    </button>
                    <span className="w-8 text-center font-black text-sm text-gray-900">{qty}</span>
                    <button onClick={() => setQty(qty + 1)} className="p-1.5 text-gray-400 hover:text-emerald-500 transition-colors">
                        <Plus size={14} strokeWidth={3}/>
                    </button>
                </div>

                <button 
                    onClick={() => onAddToCart(product, qty)}
                    className="w-10 h-10 bg-[#043003] text-white rounded-xl flex items-center justify-center shadow-lg shadow-emerald-900/10 hover:bg-black transition-all active:scale-90"
                >
                    <ShoppingCart size={18} strokeWidth={2.5}/>
                </button>
            </div>
        </div>
    );
};

export const ConsumerDashboard: React.FC<ConsumerDashboardProps> = ({ user }) => {
  const navigate = useNavigate();
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  // Modal states
  const [viewingOrderDetails, setViewingOrderDetails] = useState<Order | null>(null);
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);
  const [reorderingOrder, setReorderingOrder] = useState<Order | null>(null);

  useEffect(() => {
    const fetch = () => {
        const userOrders = mockService.getOrders(user.id).filter(o => o.buyerId === user.id);
        setAllOrders(userOrders);
        setProducts(mockService.getAllProducts());
    };
    fetch();
    const interval = setInterval(fetch, 10000);
    return () => clearInterval(interval);
  }, [user.id]);

  const handleAddToCart = (product: Product, quantity: number) => {
      mockService.addToCart({
          productId: product.id, productName: product.name,
          price: product.defaultPricePerKg, qty: quantity,
          imageUrl: product.imageUrl, unit: product.unit || 'KG'
      });
      alert(`Added ${quantity} ${product.unit || 'KG'} of ${product.name} to cart.`);
  };

  const activeOrders = useMemo(() => 
    allOrders.filter(o => ['Pending', 'Confirmed', 'Ready for Delivery', 'Shipped'].includes(o.status))
  , [allOrders]);

  const essentialsList = useMemo(() => 
    products.filter(p => (user.favorites || []).includes(p.id)).slice(0, 4) || products.slice(0, 4)
  , [products, user.favorites]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-24 max-w-[1600px] mx-auto">
      
      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-2">
        <div className="bg-[#5c56d6] p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 transform rotate-12 scale-150"><DollarSign size={140} /></div>
            <div className="relative z-10">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-4 opacity-70">Trade Volume</p>
                <h3 className="text-6xl font-black tracking-tighter mb-2">$0</h3>
                <div className="flex items-center gap-2 text-white/60 text-[10px] font-black uppercase tracking-widest">
                    <CheckCircle size={14} className="text-emerald-400"/> 14% Optimized
                </div>
            </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col justify-between group hover:shadow-md transition-all relative overflow-hidden">
            <div className="absolute top-8 right-8 text-indigo-50 group-hover:text-indigo-100 transition-colors">
                <Truck size={64} strokeWidth={2.5}/>
            </div>
            <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4">Active Shipments</p>
                <h3 className="text-6xl font-black text-gray-900 tracking-tighter">{activeOrders.length}</h3>
            </div>
            <div className="mt-8 flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-widest">
                <Clock size={14}/> {activeOrders.length > 0 ? 'In Transit' : 'No Active Runs'}
            </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col justify-between group hover:shadow-md transition-all relative overflow-hidden">
            <div className="absolute top-8 right-8 text-emerald-50 group-hover:text-emerald-100 transition-colors">
                <Leaf size={64} strokeWidth={2.5}/>
            </div>
            <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4">CO2 Diverted</p>
                <h3 className="text-6xl font-black text-gray-900 tracking-tighter">0kg</h3>
            </div>
            <div className="mt-8 flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-widest">
                <CheckCircle size={14}/> Impact Score
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 px-2">
        {/* Left Column: Catalog & Orders */}
        <div className="xl:col-span-8 space-y-12">
            
            {/* Essentials Catalog */}
            <div className="space-y-6">
                <div className="flex justify-between items-center px-2">
                    <div className="flex items-center gap-3">
                        <div className="bg-red-50 p-1.5 rounded-lg text-red-500">
                           <Heart size={20} fill="currentColor"/>
                        </div>
                        <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Essentials Catalog</h2>
                    </div>
                    <button onClick={() => navigate('/marketplace')} className="text-emerald-600 font-black text-[9px] uppercase tracking-widest flex items-center gap-1.5 hover:underline">
                        Full Market <ArrowRight size={12}/>
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {essentialsList.length === 0 ? (
                        <div className="col-span-2 py-10 bg-white border border-dashed rounded-3xl text-center text-gray-400 font-bold uppercase text-xs">No favorites set yet</div>
                    ) : essentialsList.map(p => (
                        <EssentialsProductCard key={p.id} product={p} onAddToCart={handleAddToCart} />
                    ))}
                </div>
            </div>

            {/* All Active Orders */}
            <div className="space-y-6">
                <div className="flex items-center gap-3 px-2">
                    <ShoppingCart className="text-indigo-600" size={24}/>
                    <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">All Active Orders</h2>
                </div>
                
                {activeOrders.length === 0 ? (
                    <div className="bg-white rounded-[3rem] border-2 border-dashed border-gray-100 min-h-[300px] flex flex-col items-center justify-center text-center p-12 group hover:bg-gray-50/50 transition-all">
                        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-200 mb-4 transition-transform group-hover:scale-110">
                            <Package size={32}/>
                        </div>
                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">No Active Orders</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {activeOrders.map(order => (
                            <div 
                                key={order.id} 
                                onClick={() => setViewingOrderDetails(order)}
                                className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all cursor-pointer"
                            >
                                <div className="flex items-center gap-6">
                                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner-sm">
                                        <Truck size={24}/>
                                    </div>
                                    <div>
                                        <h4 className="font-black text-gray-900 uppercase text-sm leading-none">Order #{order.id.split('-').pop()}</h4>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1.5">{order.items.length} items • ${order.totalAmount.toFixed(2)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border ${order.status === 'Shipped' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                        {order.status}
                                    </span>
                                    {(order.status === 'Shipped' || order.status === 'Ready for Delivery') && (
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setTrackingOrder(order); }}
                                            className="p-3 bg-[#043003] text-white rounded-xl shadow-lg active:scale-95 transition-all"
                                        >
                                            <MapPin size={18}/>
                                        </button>
                                    )}
                                    <ChevronRight size={20} className="text-gray-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all"/>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>

        {/* Right Column: Weekly Order Calendar */}
        <div className="xl:col-span-4 h-full">
            <WeeklyOrderCalendar 
                orders={allOrders} 
                onReorder={(order) => setReorderingOrder(order)}
            />
        </div>
      </div>

      <OrderManifestModal 
        isOpen={!!viewingOrderDetails}
        onClose={() => setViewingOrderDetails(null)}
        order={viewingOrderDetails}
        products={products}
      />

      <LiveTrackingModal 
        isOpen={!!trackingOrder}
        onClose={() => setTrackingOrder(null)}
        order={trackingOrder}
        onVerify={() => { setTrackingOrder(null); }}
      />

      <ReorderManifestModal 
        isOpen={!!reorderingOrder}
        onClose={() => setReorderingOrder(null)}
        order={reorderingOrder}
        products={products}
        onConfirm={(items) => {
            items.forEach(item => {
                const product = products.find(p => p.id === item.productId);
                if (product) handleAddToCart(product, item.quantityKg);
            });
            setReorderingOrder(null);
        }}
      />
    </div>
  );
};

const WeeklyOrderCalendar = ({ orders, onReorder }: { orders: Order[], onReorder: (order: Order) => void }) => {
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    
    const days = useMemo(() => {
        const result = [];
        const today = new Date();
        today.setHours(0,0,0,0);
        // Generate a strip of 7 days ending today
        for (let i = -6; i <= 0; i++) {
            const d = new Date();
            d.setDate(today.getDate() + i);
            d.setHours(0, 0, 0, 0);
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

    return (
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full min-h-[600px]">
            <div className="p-8 border-b border-gray-100 bg-gray-50/10 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white text-emerald-600 rounded-2xl flex items-center justify-center shadow-inner-sm border border-gray-100">
                        <Calendar size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight leading-none">Weekly Order Calendar</h2>
                        <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest mt-1.5">Live History & Re-ordering</p>
                    </div>
                </div>
            </div>
            
            <div className="p-8 space-y-12 flex-1 overflow-y-auto no-scrollbar">
                <div className="flex gap-2 overflow-x-auto no-scrollbar shrink-0">
                    {days.map((date, idx) => {
                        const isSelected = date.getTime() === selectedDate.getTime();
                        return (
                            <button 
                                key={idx} 
                                onClick={() => setSelectedDate(date)} 
                                className={`flex-1 min-w-[72px] py-4 rounded-2xl transition-all flex flex-col items-center justify-center border-2 ${
                                    isSelected 
                                    ? 'bg-white border-emerald-500 text-emerald-600 shadow-md' 
                                    : 'bg-white border-gray-50 text-gray-300 hover:border-emerald-100'
                                }`}
                            >
                                <span className={`text-[9px] font-black uppercase mb-1 ${isSelected ? 'text-emerald-500' : 'text-gray-300'}`}>
                                    {date.toLocaleDateString('en-AU', { weekday: 'short' }).toUpperCase()}
                                </span>
                                <span className="text-2xl font-black">{date.getDate()}</span>
                            </button>
                        );
                    })}
                </div>

                <div className="space-y-6">
                    <div className="flex justify-between items-end px-2">
                        <div className="space-y-1">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Selected Day</p>
                            <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight leading-none">
                                {selectedDate.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'short' }).toUpperCase()}
                            </h3>
                        </div>
                        <span className="bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border border-emerald-100 shadow-sm">
                            {selectedDateOrders.length} ORDERS
                        </span>
                    </div>

                    <div className="space-y-3">
                        {selectedDateOrders.length === 0 ? (
                            <div className="min-h-[260px] flex flex-col items-center justify-center bg-gray-50/50 rounded-[2.5rem] border-2 border-dashed border-gray-100 text-center p-10 group transition-all hover:bg-gray-50">
                                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-gray-200 mb-4 shadow-sm transition-transform group-hover:scale-110">
                                    <Clock size={32} />
                                </div>
                                <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">No Trade Activity Recorded</p>
                            </div>
                        ) : (
                            selectedDateOrders.map(order => (
                                <div key={order.id} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm group hover:shadow-md transition-all">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center border border-gray-100">
                                                <ShoppingBag size={18} />
                                            </div>
                                            <div>
                                                <h4 className="font-black text-gray-900 uppercase text-xs tracking-tight">ORD-{order.id.split('-').pop()}</h4>
                                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">${order.totalAmount.toFixed(2)}</p>
                                            </div>
                                        </div>
                                        <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border ${order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                            {order.status.toUpperCase()}
                                        </span>
                                    </div>
                                    <button 
                                        onClick={() => onReorder(order)} 
                                        className="w-full py-4 bg-[#0F172A] text-white rounded-2xl font-black text-[9px] uppercase tracking-[0.2em] shadow-lg hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        <RotateCcw size={14} strokeWidth={3}/> Edit & Re-Order
                                    </button>
                                </div>
                            ))
                        )}
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
        <div className="fixed inset-0 z-[400] flex items-center justify-center bg-black/40 backdrop-blur-md p-4 animate-in fade-in duration-300">
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
                        <button 
                            onClick={() => onConfirm(localItems)} 
                            className="flex-[1.5] sm:flex-none px-12 py-5 bg-[#043003] text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                        >
                            <ShoppingCart size={18}/> Add Adjusted to Cart
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
