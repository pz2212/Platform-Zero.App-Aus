
import React, { useState, useEffect, useRef } from 'react';
import { User, Product, OrderItem, ProductUnit, UserRole } from '../types';
import { mockService, MockCartItem } from '../services/mockDataService';
import { generateEnvironmentalImpact } from '../services/geminiService';
import { 
  ShoppingCart, Search, Plus, X, Leaf, Minus, 
  ArrowRight, ShoppingBag, Trash2, Truck, Calendar, Clock, 
  User as UserIcon, DollarSign, Check, CheckCircle, ChevronDown, Package,
  Sparkles, Loader2, ImagePlus, Wind, Droplets, Recycle, Heart, Globe, LayoutGrid
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MarketplaceProps {
  user: User | null;
}

const AddProductModal = ({ isOpen, onClose, onComplete }: { 
    isOpen: boolean, 
    onClose: () => void, 
    onComplete: () => void 
}) => {
    const [image, setImage] = useState<string | null>(null);
    const [name, setName] = useState('');
    const [variety, setVariety] = useState('');
    const [category, setCategory] = useState<'Vegetable' | 'Fruit'>('Vegetable');
    const [isSaving, setIsSaving] = useState(false);
    const [impactLoading, setImpactLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => setImage(e.target?.result as string);
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setImpactLoading(true);
        
        const impact = await generateEnvironmentalImpact(name, variety || 'Standard');
        
        const newProd: Product = {
            id: `p-man-${Date.now()}`,
            name,
            variety: variety || 'Standard',
            category,
            imageUrl: image || 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&q=80&w=400&h=400',
            defaultPricePerKg: 2.50,
            co2SavingsPerKg: impact.co2,
            waterSavingsPerKg: impact.water,
            wasteDivertedPerKg: impact.waste
        };

        mockService.addProduct(newProd);

        setTimeout(() => {
            setImpactLoading(false);
            setIsSaving(false);
            onComplete();
            onClose();
            setName('');
            setVariety('');
            setImage(null);
        }, 800);
    };

    return (
        <div className="fixed inset-0 z-[400] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100">
                <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h2 className="text-2xl font-black text-[#0F172A] tracking-tight uppercase">Add New Product</h2>
                        <p className="text-[10px] text-emerald-500 font-black uppercase tracking-[0.2em] mt-1">Direct Market Catalog Creation</p>
                    </div>
                    <button onClick={onClose} className="text-gray-300 hover:text-gray-900 transition-colors p-2 bg-white rounded-full border border-gray-100 shadow-sm">
                        <X size={24} strokeWidth={2.5} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-10 space-y-8">
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className={`h-48 border-4 border-dashed rounded-[2rem] flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden bg-white shadow-inner-sm ${image ? 'border-emerald-300 shadow-none' : 'border-gray-100 hover:border-indigo-300 hover:bg-gray-50/50'}`}
                    >
                        {image ? (
                            <img src={image} className="w-full h-full object-cover" alt="Preview"/>
                        ) : (
                            <div className="text-center">
                                <div className="bg-indigo-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-600 shadow-sm">
                                    <ImagePlus size={32} strokeWidth={2.5}/>
                                </div>
                                <h3 className="text-lg font-black text-gray-900 mb-1">Upload Catalog Image</h3>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Hi-Res JPEG or PNG</p>
                            </div>
                        )}
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange}/>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Produce Name</label>
                            <input required className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-900 outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/5 transition-all" placeholder="e.g. Heirloom Carrots" value={name} onChange={e => setName(e.target.value)}/>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Variety</label>
                            <input required className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-900 outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/5 transition-all" placeholder="e.g. Nantes" value={variety} onChange={e => setVariety(e.target.value)}/>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Category</label>
                            <select className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl font-bold text-gray-900 outline-none focus:bg-white transition-all appearance-none" value={category} onChange={e => setCategory(e.target.value as any)}>
                                <option value="Vegetable">Vegetable</option>
                                <option value="Fruit">Fruit</option>
                            </select>
                        </div>
                    </div>

                    <button 
                        disabled={isSaving || !name}
                        className="w-full py-5 bg-[#043003] hover:bg-black text-white rounded-[1.5rem] font-black uppercase tracking-[0.15em] text-xs shadow-2xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95 overflow-hidden"
                    >
                        {isSaving ? (
                            <div className="flex items-center gap-3">
                                <Loader2 className="animate-spin" size={24}/>
                                {impactLoading ? "Analyzing Impact..." : "Finalizing Catalog Entry..."}
                            </div>
                        ) : (
                            <><Sparkles size={20}/> Add to Global Catalog</>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

const CheckoutModal = ({ isOpen, onClose, cart, onUpdateCart, onPlaceOrder }: { 
    isOpen: boolean, 
    onClose: () => void, 
    cart: MockCartItem[], 
    onUpdateCart: (id: string, qty: number) => void,
    onPlaceOrder: (details: any) => void
}) => {
    const [deliveryDate, setDeliveryDate] = useState('');
    const [deliveryTime, setDeliveryTime] = useState('');
    const [contactName, setContactName] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'pay_now' | 'invoice'>('invoice');

    if (!isOpen) return null;

    const subtotal = cart.reduce((sum, i) => sum + (i.qty * i.price), 0);
    const total = subtotal - (paymentMethod === 'pay_now' ? subtotal * 0.1 : 0);

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
                {/* Left Side: Order Summary */}
                <div className="w-full md:w-[360px] bg-[#F8FAFC] border-r border-gray-100 p-10 flex flex-col">
                    <div className="flex items-center gap-3 mb-10">
                        <ShoppingCart size={24} className="text-gray-900" />
                        <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Order Summary</h2>
                    </div>

                    <div className="flex-1 space-y-6 overflow-y-auto no-scrollbar mb-10">
                        {cart.length === 0 ? (
                          <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
                            <ShoppingCart size={48} className="mb-4" />
                            <p className="font-black uppercase tracking-widest text-xs">Cart Empty</p>
                          </div>
                        ) : cart.map((item, idx) => (
                            <div key={`${item.productId}-${idx}`} className="flex flex-col py-4 border-b border-gray-100 last:border-0 group">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-black text-gray-900 uppercase text-[14px] leading-tight tracking-tight mb-1">{item.productName}</p>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.1em]">
                                            {item.qty} X {item.unit}
                                        </p>
                                    </div>
                                    <button 
                                        onClick={() => onUpdateCart(item.productId, 0)}
                                        className="text-gray-300 hover:text-red-500 transition-colors p-1"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <div className="flex items-center gap-3 mt-4">
                                    <div className="flex items-center bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                                        <button 
                                            onClick={() => onUpdateCart(item.productId, item.qty - 1)}
                                            className="px-3 py-1.5 hover:bg-gray-50 text-gray-500 transition-colors"
                                        >
                                            <Minus size={14} strokeWidth={3} />
                                        </button>
                                        <div className="px-3 text-xs font-black text-gray-900 border-x border-gray-100 min-w-[32px] text-center">
                                            {item.qty}
                                        </div>
                                        <button 
                                            onClick={() => onUpdateCart(item.productId, item.qty + 1)}
                                            className="px-3 py-1.5 hover:bg-gray-50 text-gray-500 transition-colors"
                                        >
                                            <Plus size={14} strokeWidth={3} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="pt-8 border-t border-gray-200">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] text-center italic">Financials hidden for manifest review</p>
                    </div>
                </div>

                {/* Right Side: Checkout Workflow */}
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
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Who made the order?</label>
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
                                {/* PAY NOW OPTION */}
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

                                {/* INVOICE OPTION */}
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
                            <Check size={20}/> Place Order
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ProductCard: React.FC<any> = ({ product, onAdd, isOutOfStock, isFavorited, isInCatalog, onToggleFavorite, onToggleCatalog }) => {
    const [qty, setQty] = useState(1);
    const [unit, setUnit] = useState('KG');
    
    const units = ['KG', 'Tray', '5kg Bag', '10kg Bag', 'Ea'];

    return (
        <div className={`bg-white rounded-[2.5rem] border border-gray-100 p-10 flex flex-col h-full shadow-sm hover:shadow-xl transition-all group relative ${isOutOfStock ? 'opacity-75 grayscale-[0.5]' : ''}`}>
            {/* Tagging Buttons (Top Right) */}
            <div className="absolute top-8 right-8 flex gap-2">
                {/* Heart -> Dashboard Favorites */}
                <button 
                    onClick={(e) => { e.stopPropagation(); onToggleFavorite(product.id); }}
                    className={`p-3 rounded-2xl border transition-all active:scale-90 ${isFavorited ? 'bg-red-50 border-red-200 text-red-500 shadow-md' : 'bg-gray-50 border-gray-100 text-gray-300 hover:text-red-500'}`}
                    title={isFavorited ? "Remove from Dashboard" : "Heart to Dashboard"}
                >
                    <Heart size={20} className={isFavorited ? "fill-red-500" : ""} />
                </button>
                {/* Tick -> Marketplace My Catalog */}
                <button 
                    onClick={(e) => { e.stopPropagation(); onToggleCatalog(product.id); }}
                    className={`p-3 rounded-2xl border transition-all active:scale-90 ${isInCatalog ? 'bg-emerald-50 border-emerald-200 text-emerald-600 shadow-md' : 'bg-gray-50 border-gray-100 text-gray-300 hover:text-emerald-500'}`}
                    title={isInCatalog ? "Remove from My Catalog" : "Tick into My Catalog"}
                >
                    <Check size={20} strokeWidth={isInCatalog ? 4 : 2} />
                </button>
            </div>

            <div className="mb-8 pr-20">
                <h3 className="text-2xl text-gray-900 font-black uppercase tracking-tight leading-none mb-1">{product.name}</h3>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">{product.variety}</p>
                <div className="flex flex-col gap-2 mt-4">
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] flex items-center gap-1.5">
                        <Wind size={14}/> Saves {product.co2SavingsPerKg?.toFixed(1) || '0.8'}kg CO2/kg
                    </p>
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] flex items-center gap-1.5">
                        <Droplets size={14}/> Saves {product.waterSavingsPerKg?.toFixed(0) || '50'}L Water/kg
                    </p>
                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] flex items-center gap-1.5">
                        <Recycle size={14}/> {product.wasteDivertedPerKg?.toFixed(1) || '1.0'}kg Diverted/kg
                    </p>
                </div>
            </div>

            <div className="mt-auto space-y-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 block">Purchase Unit</label>
                    <div className="relative group">
                        <Package size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none group-focus-within:text-emerald-500 transition-colors"/>
                        <select 
                            className="w-full pl-11 pr-10 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm text-gray-900 outline-none focus:ring-4 focus:ring-emerald-500/5 focus:bg-white transition-all appearance-none"
                            value={unit}
                            onChange={(e) => setUnit(e.target.value)}
                        >
                            {units.map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                        <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none"/>
                    </div>
                </div>

                <div className="flex justify-between items-center gap-4">
                    <div className="flex-1 flex items-center bg-gray-100 p-1.5 rounded-2xl border border-gray-200/50 h-14">
                        <button onClick={() => setQty(Math.max(1, qty - 1))} className="flex-1 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors"><Minus size={18} strokeWidth={3}/></button>
                        <span className="flex-1 text-center font-black text-lg text-gray-900">{qty}</span>
                        <button onClick={() => setQty(qty + 1)} className="flex-1 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors"><Plus size={18} strokeWidth={3}/></button>
                    </div>
                </div>

                <button 
                    onClick={() => onAdd(qty, unit)} 
                    disabled={isOutOfStock} 
                    className="w-full py-5 bg-[#043003] text-white rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                >
                    <Plus size={18}/> Add to Cart
                </button>
            </div>
        </div>
    );
};

export const Marketplace: React.FC<MarketplaceProps> = ({ user }) => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'MY_CATALOG' | 'GLOBAL'>('MY_CATALOG');
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<MockCartItem[]>(mockService.getCart());
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  
  // Tracking states local to view for fast UI updates
  const [favorites, setFavorites] = useState<string[]>(user?.favorites || []);
  const [catalogItems, setCatalogItems] = useState<string[]>(user?.catalogProducts || []);

  const canAddProducts = user?.role === UserRole.ADMIN || user?.role === UserRole.WHOLESALER || user?.role === UserRole.FARMER;

  useEffect(() => {
    const load = () => {
        setProducts(mockService.getAllProducts());
        if (user) {
            const userData = mockService.getAllUsers().find(u => u.id === user.id);
            setFavorites(userData?.favorites || []);
            setCatalogItems(userData?.catalogProducts || []);
        }
    };
    load();
    
    // Subscribe to global cart
    const unsubscribe = mockService.subscribeToCart(setCart);
    return () => unsubscribe();
  }, [user]);

  const addToCart = (product: Product, qty: number, unit: string) => {
      mockService.addToCart({ 
          productId: product.id, 
          productName: product.name, 
          price: product.defaultPricePerKg, 
          qty, 
          imageUrl: product.imageUrl,
          unit: unit
      });
  };

  const updateCartItem = (productId: string, newQty: number) => {
      mockService.updateCart(productId, newQty);
  };

  const handleToggleFavorite = (productId: string) => {
      if (!user) {
          alert("Please log in to heart items for your Dashboard.");
          return;
      }
      mockService.toggleFavorite(user.id, productId);
      setFavorites(mockService.getAllUsers().find(u => u.id === user.id)?.favorites || []);
  };

  const handleToggleCatalog = (productId: string) => {
      if (!user) {
          alert("Please log in to tick items for your Catalog.");
          return;
      }
      mockService.toggleCatalogProduct(user.id, productId);
      setCatalogItems(mockService.getAllUsers().find(u => u.id === user.id)?.catalogProducts || []);
  };

  const handlePlaceOrder = (details: any) => {
      if (!user) return alert("Please sign in.");
      const newOrder = mockService.createFullOrder(user.id, details.items, details.total);
      newOrder.logistics = {
          deliveryLocation: user.businessName,
          deliveryTime: details.deliveryTime,
          deliveryDate: details.deliveryDate,
          instructions: `Order placed by ${details.contactName}`
      };
      newOrder.paymentMethod = details.paymentMethod;
      
      mockService.clearCart();
      setIsCheckoutOpen(false); 
      alert("Order Placed Successfully!"); 
      navigate('/orders');
  };

  const CATEGORIES = ['ALL', 'VEGETABLES', 'FRUIT'];
  
  const filtered = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'ALL' || p.category.toString().toUpperCase() === activeCategory;
    const matchesView = viewMode === 'GLOBAL' || catalogItems.includes(p.id);
    return matchesSearch && matchesCategory && matchesView;
  });

  return (
    <div className="space-y-12 relative pb-24 animate-in fade-in duration-500">
        {/* Header and Toggle */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 px-2">
            <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-white rounded-[1.5rem] shadow-sm border border-gray-100 flex items-center justify-center text-[#043003]"><ShoppingBag size={36} /></div>
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase leading-none">Fresh Market</h1>
                    <p className="text-gray-400 font-bold text-xs uppercase tracking-[0.2em] mt-2">Personalized Procurement Console</p>
                </div>
            </div>

            <div className="bg-gray-100/50 p-1.5 rounded-[1.5rem] flex border border-gray-200 shadow-inner-sm min-w-[340px]">
                <button 
                    onClick={() => setViewMode('MY_CATALOG')}
                    className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.15em] transition-all ${viewMode === 'MY_CATALOG' ? 'bg-white text-[#043003] shadow-md ring-1 ring-black/5' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    <Check size={16} strokeWidth={4} className={viewMode === 'MY_CATALOG' ? 'text-emerald-500' : ''} /> My Catalog
                </button>
                <button 
                    onClick={() => setViewMode('GLOBAL')}
                    className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.15em] transition-all ${viewMode === 'GLOBAL' ? 'bg-white text-gray-900 shadow-md ring-1 ring-black/5' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    <Globe size={16} /> Directory
                </button>
            </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 w-full px-2">
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 flex-1">
                {CATEGORIES.map(cat => (
                    <button 
                        key={cat} 
                        onClick={() => setActiveCategory(cat)} 
                        className={`px-10 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] whitespace-nowrap transition-all border ${activeCategory === cat ? 'bg-[#043003] text-white border-[#043003] shadow-lg scale-105 z-10' : 'bg-white text-gray-400 border-gray-100 hover:bg-gray-50'}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>
            <div className="flex gap-4">
                <div className="relative w-full md:w-80 group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-emerald-500 transition-colors" size={20} />
                    <input 
                        type="text" 
                        placeholder="Search varieties..." 
                        className="w-full pl-14 pr-8 py-5 bg-white border border-gray-100 rounded-[1.5rem] text-sm font-bold text-gray-900 shadow-sm outline-none focus:ring-4 focus:ring-indigo-50/5 focus:border-emerald-100 transition-all" 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                    />
                </div>
                {canAddProducts && (
                    <button 
                        onClick={() => setIsAddProductModalOpen(true)}
                        className="px-6 bg-white text-emerald-600 border-2 border-emerald-600 rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest hover:bg-emerald-50 transition-all flex items-center justify-center gap-2 active:scale-95"
                    >
                        <Plus size={20}/>
                    </button>
                )}
                <button 
                    onClick={() => setIsCheckoutOpen(true)} 
                    disabled={cart.length === 0}
                    className="relative px-6 bg-[#043003] text-white border border-[#043003] rounded-[1.5rem] shadow-xl hover:bg-black transition-all disabled:bg-white disabled:text-gray-200 disabled:border-gray-50 disabled:shadow-none active:scale-95 flex items-center justify-center"
                >
                    <ShoppingCart size={28}/>
                    {cart.length > 0 && (
                        <span className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[11px] font-black w-7 h-7 rounded-full flex items-center justify-center border-4 border-white shadow-lg animate-in zoom-in">
                            {cart.length}
                        </span>
                    )}
                </button>
            </div>
        </div>

        {/* Catalog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 px-2">
            {filtered.map(p => (
                <ProductCard 
                    key={p.id} 
                    product={p} 
                    onAdd={(qty: number, unit: string) => addToCart(p, qty, unit)} 
                    isFavorited={favorites.includes(p.id)}
                    isInCatalog={catalogItems.includes(p.id)}
                    onToggleFavorite={handleToggleFavorite}
                    onToggleCatalog={handleToggleCatalog}
                />
            ))}
            
            {/* Empty States */}
            {filtered.length === 0 && viewMode === 'MY_CATALOG' && (
                <div className="col-span-full py-32 text-center bg-white rounded-[3rem] border-2 border-dashed border-gray-100 group transition-all">
                    <CheckCircle size={64} className="mx-auto text-gray-100 mb-6 group-hover:scale-110 transition-transform" />
                    <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Your ordering catalog is empty</h3>
                    <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mt-4 mb-8">Tick items in the Directory to add them to your personalized daily catalog.</p>
                    <button 
                        onClick={() => setViewMode('GLOBAL')}
                        className="px-10 py-4 bg-[#043003] text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all"
                    >
                        Browse All Produce
                    </button>
                </div>
            )}
            {filtered.length === 0 && viewMode === 'GLOBAL' && (
                <div className="col-span-full py-40 text-center text-gray-300">
                    <Search size={64} className="mx-auto mb-4 opacity-10" />
                    <p className="font-black uppercase tracking-widest text-xs">No matching products found in the directory.</p>
                </div>
            )}
        </div>

        <CheckoutModal 
            isOpen={isCheckoutOpen}
            onClose={() => setIsCheckoutOpen(false)}
            cart={cart}
            onUpdateCart={updateCartItem}
            onPlaceOrder={handlePlaceOrder}
        />

        <AddProductModal 
            isOpen={isAddProductModalOpen}
            onClose={() => setIsAddProductModalOpen(false)}
            onComplete={() => setProducts(mockService.getAllProducts())}
        />
    </div>
  );
};
