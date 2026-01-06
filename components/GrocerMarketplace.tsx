import React, { useState, useEffect } from 'react';
import { User, Product, InventoryItem, OrderItem, ProductUnit } from '../types';
import { mockService } from '../services/mockDataService';
import { 
  ShoppingCart, Search, Plus, X, Leaf, Minus, 
  Truck, Calendar, Clock, User as UserIcon, DollarSign, 
  Check, ChevronDown, Package, ShoppingBag, Sparkles, TrendingDown,
  Store, Loader2, Wind, Droplets, Recycle, Trash2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CartItem {
    productId: string;
    productName: string;
    price: number;
    qty: number;
    imageUrl: string;
    unit: string;
    lotId?: string;
}

const ProductCard: React.FC<any> = ({ product, item, onAdd }) => {
    const [qty, setQty] = useState(1);
    const unit = product.unit || 'KG';

    const pzRate = (item.discountPricePerKg || product.defaultPricePerKg * 0.6);

    return (
        <div className="bg-white rounded-[2.5rem] border border-gray-100 p-10 flex flex-col h-full shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
            <div className="mb-8">
                <div className="w-16 h-16 rounded-[1.25rem] overflow-hidden mb-6 border border-gray-100 shadow-sm">
                    <img src={product.imageUrl} className="w-full h-full object-cover" alt={product.name} />
                </div>
                <h3 className="text-2xl text-gray-900 font-black uppercase tracking-tight leading-none mb-1">{product.name}</h3>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">{product.variety}</p>
                
                <div className="flex flex-col gap-2 mt-4">
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] flex items-center gap-1.5">
                        <Wind size={14}/> Verified Fresh Lot
                    </p>
                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] flex items-center gap-1.5">
                        <Recycle size={14}/> {item.quantityKg}{unit} Available
                    </p>
                </div>
            </div>

            <div className="mt-auto space-y-6">
                <div className="bg-emerald-50/50 p-5 rounded-[1.75rem] border border-emerald-100 flex justify-between items-center">
                    <div>
                        <p className="text-[8px] font-black text-emerald-400 uppercase tracking-widest mb-1">Platform Zero Rate</p>
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-black text-emerald-600 tracking-tighter">${pzRate.toFixed(2)}</span>
                            <span className="text-[10px] font-black text-emerald-400 uppercase">/{unit}</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest mb-1">Market Standard</p>
                        <p className="text-sm font-bold text-gray-400 line-through">${product.defaultPricePerKg.toFixed(2)}</p>
                    </div>
                </div>

                <div className="flex justify-between items-center gap-4">
                    <div className="flex-1 flex items-center bg-gray-100 p-1.5 rounded-2xl border border-gray-200/50 h-14">
                        <button onClick={() => setQty(Math.max(1, qty - 1))} className="flex-1 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors"><Minus size={18} strokeWidth={3}/></button>
                        <span className="flex-1 text-center font-black text-lg text-gray-900">{qty}</span>
                        <button onClick={() => setQty(Math.min(item.quantityKg, qty + 1))} className="flex-1 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors"><Plus size={18} strokeWidth={3}/></button>
                    </div>
                </div>

                <button 
                    onClick={() => onAdd(product, item, qty, pzRate)} 
                    className="w-full py-5 bg-[#043003] text-white rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                >
                    <ShoppingCart size={18}/> Buy Wholesale Stock
                </button>
            </div>
        </div>
    );
};

const CheckoutModal = ({ isOpen, onClose, cart, onPlaceOrder, onUpdateCart }: { 
    isOpen: boolean, 
    onClose: () => void, 
    cart: CartItem[], 
    onPlaceOrder: (details: any) => void,
    onUpdateCart: (lotId: string, delta: number) => void
}) => {
    const [deliveryDate, setDeliveryDate] = useState('');
    const [deliveryTime, setDeliveryTime] = useState('');
    const [contactName, setContactName] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'pay_now' | 'invoice'>('invoice');

    if (!isOpen) return null;

    const subtotal = cart.reduce((sum, i) => sum + (i.qty * i.price), 0);
    const discount = paymentMethod === 'pay_now' ? subtotal * 0.1 : 0;
    const total = subtotal - discount;

    const handleSubmit = () => {
        if (!deliveryDate || !contactName) {
            alert("Please complete delivery information and contact name.");
            return;
        }
        onPlaceOrder({
            items: cart.map(i => ({ productId: i.productId, quantityKg: i.qty, pricePerKg: i.price, unit: i.unit })),
            total,
            deliveryDate,
            deliveryTime,
            contactName,
            paymentMethod
        });
    };

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] animate-in zoom-in-95">
                <div className="w-full md:w-[360px] bg-[#F8FAFC] border-r border-gray-100 p-10 flex flex-col">
                    <div className="flex items-center gap-3 mb-10">
                        <ShoppingCart size={24} className="text-gray-900" />
                        <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Market Order</h2>
                    </div>

                    <div className="flex-1 space-y-6 overflow-y-auto no-scrollbar mb-10">
                        {cart.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
                                <ShoppingCart size={48} className="mb-4" />
                                <p className="font-black uppercase tracking-widest text-xs">Cart Empty</p>
                            </div>
                        ) : cart.map((item, idx) => (
                            <div key={`${item.productId}-${idx}`} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-black text-gray-900 uppercase text-sm leading-tight truncate pr-2">{item.productName}</p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                                            {item.qty} X {item.unit}
                                        </p>
                                    </div>
                                    <span className="font-black text-gray-900 text-sm">${(item.qty * item.price).toFixed(2)}</span>
                                </div>
                                <div className="flex items-center justify-between gap-3 pt-3 border-t border-gray-50">
                                    <div className="flex items-center bg-gray-50 rounded-xl border border-gray-100 overflow-hidden">
                                        <button 
                                            onClick={() => onUpdateCart(item.lotId!, -1)}
                                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            <Minus size={14} strokeWidth={3}/>
                                        </button>
                                        <span className="w-8 text-center font-black text-xs text-gray-900">{item.qty}</span>
                                        <button 
                                            onClick={() => onUpdateCart(item.lotId!, 1)}
                                            className="p-2 text-gray-400 hover:text-emerald-500 transition-colors"
                                        >
                                            <Plus size={14} strokeWidth={3}/>
                                        </button>
                                    </div>
                                    <button 
                                        onClick={() => onUpdateCart(item.lotId!, -item.qty)}
                                        className="p-2 text-gray-300 hover:text-red-500 transition-colors rounded-xl hover:bg-red-50"
                                    >
                                        <Trash2 size={16}/>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-4 pt-8 border-t border-gray-200">
                        <div className="flex justify-between items-center text-gray-500 font-bold text-sm">
                            <span className="uppercase tracking-widest text-[11px]">Subtotal</span>
                            <span>${subtotal.toFixed(2)}</span>
                        </div>
                        {discount > 0 && (
                            <div className="flex justify-between items-center text-emerald-600 font-bold text-sm">
                                <span className="uppercase tracking-widest text-[11px]">Cash Discount (10%)</span>
                                <span>-${discount.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between items-end pt-2">
                            <span className="font-black text-gray-900 text-xl uppercase tracking-tighter leading-none">Total</span>
                            <span className="font-black text-gray-900 text-4xl tracking-tighter leading-none">${total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <div className="flex-1 bg-white p-10 flex flex-col overflow-y-auto">
                    <div className="flex justify-between items-start mb-12">
                        <div>
                            <h2 className="text-3xl font-black text-[#0F172A] tracking-tighter uppercase leading-none">Checkout Details</h2>
                            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mt-2">Logistics & Payment Config</p>
                        </div>
                        <button onClick={onClose} className="text-gray-300 hover:text-gray-900 transition-colors">
                            <X size={32} />
                        </button>
                    </div>

                    <div className="space-y-10 flex-1">
                        <div className="space-y-6">
                            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Truck size={14}/> DELIVERY INFORMATION
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-900 uppercase tracking-widest mb-2 ml-1">Delivery Date</label>
                                    <div className="relative">
                                        <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
                                        <input 
                                            type="date" 
                                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-900 outline-none focus:ring-4 focus:ring-emerald-500/5 focus:bg-white transition-all"
                                            value={deliveryDate}
                                            onChange={e => setDeliveryDate(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-900 uppercase tracking-widest mb-2 ml-1">Delivery Time</label>
                                    <div className="relative">
                                        <Clock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
                                        <input 
                                            type="time" 
                                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-900 outline-none focus:ring-4 focus:ring-emerald-500/5 focus:bg-white transition-all"
                                            value={deliveryTime}
                                            onChange={e => setDeliveryTime(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-900 uppercase tracking-widest mb-2 ml-1">Authorized Receiver</label>
                                <div className="relative">
                                    <UserIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"/>
                                    <input 
                                        placeholder="Contact Name"
                                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-900 outline-none focus:ring-4 focus:ring-emerald-500/5 focus:bg-white transition-all"
                                        value={contactName}
                                        onChange={e => setContactName(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <DollarSign size={14}/> PAYMENT METHOD
                            </h3>
                            <div className="space-y-4">
                                <button 
                                    onClick={() => setPaymentMethod('pay_now')}
                                    className={`w-full p-6 rounded-[2rem] border-2 transition-all text-left flex items-center justify-between group ${paymentMethod === 'pay_now' ? 'border-indigo-600 bg-indigo-50/20' : 'border-gray-50 bg-[#F8FAFC] hover:border-gray-200'}`}
                                >
                                    <div className="flex items-center gap-6">
                                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${paymentMethod === 'pay_now' ? 'border-[#0F172A] bg-[#0F172A]' : 'border-gray-300 bg-white'}`}>
                                            {paymentMethod === 'pay_now' && <div className="w-3 h-3 bg-white rounded-full"></div>}
                                        </div>
                                        <div>
                                            <p className="font-black text-[#0F172A] uppercase text-base leading-none">Pay Now</p>
                                            <p className="text-[11px] text-gray-400 font-bold mt-1.5 uppercase tracking-widest">Instant credit card payment</p>
                                        </div>
                                    </div>
                                    <span className="bg-[#D1FAE5] text-[#065F46] px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-[#A7F3D0]">Save 10%</span>
                                </button>

                                <button 
                                    onClick={() => setPaymentMethod('invoice')}
                                    className={`w-full p-6 rounded-[2rem] border-2 transition-all text-left flex items-center group ${paymentMethod === 'invoice' ? 'border-indigo-600 bg-indigo-50/20' : 'border-gray-50 bg-[#F8FAFC] hover:border-gray-200'}`}
                                >
                                    <div className="flex items-center gap-6">
                                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${paymentMethod === 'invoice' ? 'border-[#0F172A] bg-[#0F172A]' : 'border-gray-300 bg-white'}`}>
                                            {paymentMethod === 'invoice' && <div className="w-3 h-3 bg-white rounded-full"></div>}
                                        </div>
                                        <div>
                                            <p className="font-black text-[#0F172A] uppercase text-base leading-none">Invoice</p>
                                            <p className="text-[11px] text-gray-400 font-bold mt-1.5 uppercase tracking-widest">Standard 7-day terms</p>
                                        </div>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="pt-12 flex gap-4">
                        <button 
                            onClick={onClose}
                            className="flex-1 py-5 bg-gray-50 border border-gray-100 text-gray-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-100 transition-all active:scale-95"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleSubmit}
                            disabled={cart.length === 0}
                            className="flex-[2] py-5 bg-[#043003] text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-black transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            <Check size={20}/> Confirm & Pay
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const GrocerMarketplace: React.FC<{ user: User }> = ({ user }) => {
  const navigate = useNavigate();
  const [marketInventory, setMarketInventory] = useState<{product: Product, item: InventoryItem}[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  useEffect(() => {
    const products = mockService.getAllProducts();
    const inventory = mockService.getAllInventory();
    
    const aged = inventory.filter(item => {
        if (item.status !== 'Available') return false;
        return true;
    }).map(item => ({
        item,
        product: products.find(p => p.id === item.productId)!
    })).filter(x => !!x.product);

    setMarketInventory(aged);
  }, []);

  const addToCart = (product: Product, item: InventoryItem, qty: number, price: number) => {
      setCart(prev => {
          const existing = prev.find(i => i.lotId === item.id);
          if (existing) return prev.map(i => i.lotId === item.id ? { ...i, qty: i.qty + qty } : i);
          
          return [...prev, { 
              productId: product.id, 
              productName: product.name, 
              price: price, 
              qty, 
              imageUrl: product.imageUrl,
              unit: product.unit || 'KG',
              lotId: item.id
          }];
      });
      alert(`${product.name} added to cart!`);
  };

  const updateCartItem = (lotId: string, delta: number) => {
    setCart(prev => {
        const itemIdx = prev.findIndex(i => i.lotId === lotId);
        if (itemIdx === -1) return prev;
        
        const newCart = [...prev];
        const newQty = newCart[itemIdx].qty + delta;
        
        if (newQty <= 0) {
            return newCart.filter((_, i) => i !== itemIdx);
        } else {
            // Check inventory limit
            const inventorySource = marketInventory.find(m => m.item.id === lotId);
            const maxAvailable = inventorySource?.item.quantityKg || 9999;
            const finalQty = Math.min(maxAvailable, newQty);
            
            newCart[itemIdx] = { ...newCart[itemIdx], qty: finalQty };
            return newCart;
        }
    });
  };

  const handlePlaceOrder = (details: any) => {
      const newOrder = mockService.createFullOrder(user.id, details.items, details.total);
      newOrder.logistics = {
          deliveryLocation: user.businessName,
          deliveryTime: details.deliveryTime,
          deliveryDate: details.deliveryDate,
          instructions: `Grocer Procurement: ${details.contactName}`
      };
      newOrder.paymentMethod = details.paymentMethod;
      newOrder.source = 'Marketplace';
      
      setCart([]); 
      setIsCheckoutOpen(false); 
      alert("Market Order Placed Successfully!"); 
      navigate('/orders');
  };

  return (
    <div className="space-y-12 pb-24 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 px-2">
            <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-white rounded-[1.5rem] shadow-sm border border-gray-100 flex items-center justify-center text-indigo-600"><Store size={36} /></div>
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase leading-none">Procurement Market</h1>
                    <p className="text-gray-400 font-bold text-xs uppercase tracking-[0.2em] mt-2">Direct Wholesale Lots • Dynamic Sourcing • Verified Quality</p>
                </div>
            </div>
            <div className="flex gap-4 w-full md:w-auto">
                <div className="relative flex-1 md:w-80 group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-500 transition-colors" size={20} />
                    <input 
                        type="text" 
                        placeholder="Search wholesale lots..." 
                        className="w-full pl-14 pr-8 py-5 bg-white border border-gray-100 rounded-[1.5rem] text-sm font-bold shadow-sm outline-none focus:ring-4 focus:ring-indigo-50/5 transition-all" 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                    />
                </div>
                <button 
                    onClick={() => setIsCheckoutOpen(true)} 
                    disabled={cart.length === 0}
                    className="relative px-8 bg-[#043003] text-white rounded-[1.5rem] font-black uppercase text-xs tracking-widest hover:bg-black transition-all disabled:bg-gray-100 disabled:text-gray-300 shadow-xl"
                >
                    Review Cart ({cart.length})
                    {cart.length > 0 && (
                        <span className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-md animate-in zoom-in">
                            {cart.length}
                        </span>
                    )}
                </button>
            </div>
        </div>

        <div className="bg-indigo-50 border border-indigo-100 p-10 rounded-[3rem] flex items-center gap-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 transform rotate-12 scale-150 pointer-events-none group-hover:scale-[1.7] transition-transform duration-1000"><Sparkles size={160} className="text-indigo-900"/></div>
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm shrink-0 border border-indigo-100"><TrendingDown size={28}/></div>
            <div>
                <h3 className="text-xl font-black text-indigo-900 uppercase tracking-tight mb-1">Direct Wholesale Marketplace</h3>
                <p className="text-indigo-800 text-sm font-medium leading-relaxed max-w-3xl">Access real-time inventory from regional wholesalers and farmers. Platform Zero secures the best rates by bypassing traditional distribution markups, giving you the edge on fresh produce margins.</p>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 px-2">
            {marketInventory.filter(x => x.product.name.toLowerCase().includes(searchTerm.toLowerCase())).map((pair, idx) => (
                <ProductCard key={idx} product={pair.product} item={pair.item} onAdd={addToCart} />
            ))}
            {marketInventory.length === 0 && (
                <div className="col-span-full py-40 text-center text-gray-300">
                    <ShoppingBag size={64} className="mx-auto mb-4 opacity-10" />
                    <p className="font-black uppercase tracking-widest">No active market lots available right now.</p>
                </div>
            )}
        </div>

        <CheckoutModal 
            isOpen={isCheckoutOpen}
            onClose={() => setIsCheckoutOpen(false)}
            cart={cart}
            onPlaceOrder={handlePlaceOrder}
            onUpdateCart={updateCartItem}
        />
    </div>
  );
};