import React, { useState, useEffect, useRef, useMemo } from 'react';
import { User, Product, OrderItem, ProductUnit, UserRole } from '../types';
import { mockService, MockCartItem } from '../services/mockDataService';
import { generateEnvironmentalImpact, extractProductsFromPdf } from '../services/geminiService';
import { 
  ShoppingCart, Search, Plus, X, Leaf, Minus, 
  ArrowRight, ShoppingBag, Trash2, Truck, Calendar, Clock, 
  User as UserIcon, DollarSign, Check, CheckCircle, ChevronDown, Package,
  Sparkles, Loader2, ImagePlus, Wind, Droplets, Recycle, Heart, Globe, LayoutGrid,
  FilePlus, UserPlus, FileUp, FileCheck, Settings, Upload
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MarketplaceProps {
  user: User | null;
}

const ProductCard: React.FC<{ 
  product: Product, 
  isCatalog: boolean, 
  isFavorite: boolean,
  onToggleCatalog: (id: string) => void,
  onToggleFavorite: (id: string) => void,
  onAddToCart: (p: Product, q: number) => void
}> = ({ product, isCatalog, isFavorite, onToggleCatalog, onToggleFavorite, onAddToCart }) => {
    const [qty, setQty] = useState(1);

    return (
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 md:p-8 flex flex-col h-full animate-in zoom-in-95 group hover:shadow-lg transition-all">
            {/* Header: Name/Variety + Icons (NO IMAGES ATTACHED) */}
            <div className="flex justify-between items-start mb-6">
                <div className="min-w-0 pr-2">
                    <h3 className="font-black text-gray-900 text-lg md:text-xl tracking-tight uppercase leading-tight truncate">{product.name}</h3>
                    <p className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1 truncate">{product.variety}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                    <button 
                        onClick={() => onToggleFavorite(product.id)}
                        className={`p-2 md:p-2.5 rounded-xl border transition-all active:scale-90 ${isFavorite ? 'bg-red-50 border-red-100 text-red-500' : 'bg-gray-50 border-gray-100 text-gray-300 hover:text-red-400'}`}
                    >
                        {/* Fixed: removed md:size */}
                        <Heart size={16} fill={isFavorite ? "currentColor" : "none"} />
                    </button>
                    <button 
                        onClick={() => onToggleCatalog(product.id)}
                        className={`p-2 md:p-2.5 rounded-xl border transition-all active:scale-90 ${isCatalog ? 'bg-emerald-50 border-emerald-200 text-emerald-500' : 'bg-gray-50 border-gray-100 text-gray-300 hover:text-emerald-500'}`}
                    >
                        {/* Fixed: removed md:size */}
                        <Check size={16} strokeWidth={4} />
                    </button>
                </div>
            </div>

            {/* Impact Metrics - Matching Dashboard Style */}
            <div className="space-y-2 mb-8">
                <div className="flex items-center gap-2 text-emerald-500 font-black text-[9px] md:text-[10px] uppercase tracking-widest">
                    {/* Fixed: removed md:size */}
                    <Wind size={14} /> Saves {product.co2SavingsPerKg || 0.8}kg CO2/kg
                </div>
                <div className="flex items-center gap-2 text-blue-500 font-black text-[9px] md:text-[10px] uppercase tracking-widest">
                    {/* Fixed: removed md:size */}
                    <Droplets size={14} /> Saves {product.waterSavingsPerKg || 50}L Water/kg
                </div>
                <div className="flex items-center gap-2 text-indigo-500 font-black text-[9px] md:text-[10px] uppercase tracking-widest">
                    {/* Fixed: removed md:size */}
                    <Recycle size={14} /> {product.wasteDivertedPerKg || 1.0}kg Diverted/kg
                </div>
            </div>

            {/* Selectors */}
            <div className="space-y-4 mt-auto">
                <div className="space-y-2">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Purchase Unit</label>
                    <div className="relative">
                        <Package size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
                        <select className="w-full pl-10 pr-4 py-3 bg-[#F8FAFC] border border-gray-100 rounded-xl text-xs font-black text-gray-900 appearance-none outline-none focus:ring-2 focus:ring-emerald-500/10">
                            <option>{product.unit || 'KG'}</option>
                            <option>Tray</option>
                            <option>Box</option>
                            <option>Tonne</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                </div>

                <div className="flex items-center bg-[#F8FAFC] border border-gray-100 rounded-xl p-1 shadow-inner-sm">
                    {/* Fixed: removed md:size */}
                    <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-3 text-gray-400 hover:text-red-500 transition-colors"><Minus size={16} strokeWidth={3}/></button>
                    <span className="flex-1 text-center font-black text-base md:text-lg text-gray-900">{qty}</span>
                    {/* Fixed: removed md:size */}
                    <button onClick={() => setQty(qty + 1)} className="p-3 text-gray-400 hover:text-emerald-500 transition-colors"><Plus size={16} strokeWidth={3}/></button>
                </div>

                <button 
                    onClick={() => onAddToCart(product, qty)}
                    className="w-full py-4 md:py-5 bg-[#043003] text-white rounded-2xl font-black text-[10px] md:text-[11px] uppercase tracking-[0.2em] shadow-lg hover:bg-black transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                    <Plus size={16} strokeWidth={3}/> Add to Cart
                </button>
            </div>
        </div>
    );
};

const BulkUploadModal = ({ isOpen, onClose, onComplete }: { 
    isOpen: boolean, 
    onClose: () => void, 
    onComplete: () => void 
}) => {
    const [file, setFile] = useState<File | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [extractedItems, setExtractedItems] = useState<any[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const processFile = async (selectedFile: File) => {
        let mimeType = selectedFile.type || (selectedFile.name.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/jpeg');

        setFile(selectedFile);
        setIsAnalyzing(true);
        setExtractedItems([]);

        try {
            const reader = new FileReader();
            const base64Promise = new Promise<string>((resolve, reject) => {
                reader.onload = (ev) => resolve((ev.target?.result as string).split(',')[1]);
                reader.onerror = (err) => reject(err);
                reader.readAsDataURL(selectedFile);
            });
            
            const base64 = await base64Promise;
            const items = await extractProductsFromPdf(base64, mimeType);
            setExtractedItems(items);
        } catch (err) {
            console.error("Bulk extraction failed", err);
            alert("Failed to analyze document. Please ensure it's a clear PDF or image.");
            setFile(null);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            processFile(e.target.files[0]);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processFile(e.dataTransfer.files[0]);
        }
    };

    const handleConfirm = async () => {
        setIsSaving(true);
        try {
            for (const item of extractedItems) {
                const newProd: Product = {
                    id: `p-bulk-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                    name: item.name,
                    variety: item.variety || 'Standard',
                    category: item.category || 'Vegetable',
                    imageUrl: '', 
                    defaultPricePerKg: 2.50,
                    co2SavingsPerKg: 0.8,
                    waterSavingsPerKg: 50,
                    wasteDivertedPerKg: 1.0
                };
                mockService.addProduct(newProd);
            }
            onComplete();
            onClose();
            alert(`Successfully added ${extractedItems.length} varieties to the marketplace directory!`);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[400] flex items-center justify-center bg-black/70 backdrop-blur-md p-2 md:p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[2rem] md:rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100 flex flex-col h-full max-h-[90vh]">
                <div className="p-6 md:p-8 border-b border-gray-100 flex justify-between items-center bg-white shrink-0">
                    <div>
                        <h2 className="text-lg md:text-xl font-black text-[#0F172A] tracking-tight uppercase leading-none">Bulk Catalog Import</h2>
                        <p className="text-[9px] md:text-[10px] text-indigo-600 font-black uppercase tracking-[0.2em] mt-2">Gemini 3 Pro Processor</p>
                    </div>
                    <button onClick={onClose} className="text-gray-300 hover:text-gray-900 p-2 bg-gray-50 rounded-full transition-all">
                        {/* Fixed: removed md:size */}
                        <X size={20} strokeWidth={2.5} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 custom-scrollbar">
                    {!file ? (
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={`h-64 md:h-72 border-[3px] border-dashed rounded-[2rem] md:rounded-[2.5rem] flex flex-col items-center justify-center cursor-pointer transition-all bg-white shadow-inner-sm text-center p-6 ${isDragging ? 'border-indigo-600 bg-indigo-50/50' : 'border-gray-100 hover:border-indigo-300 hover:bg-gray-50/30'}`}
                        >
                            <div className="bg-indigo-50 w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mb-6 text-indigo-600 shadow-sm transition-transform group-hover:scale-110">
                                {/* Fixed: removed md:size */}
                                <FileUp size={32} strokeWidth={2.5}/>
                            </div>
                            <h3 className="text-xl md:text-2xl font-black text-gray-900 uppercase tracking-tight">Upload Product PDF</h3>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2">Extract Varieties Automatically</p>
                            <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,image/*" onChange={handleFileChange}/>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between p-4 md:p-6 bg-gray-50 rounded-[1.5rem] md:rounded-[2rem] border border-gray-100">
                                <div className="flex items-center gap-4 min-w-0">
                                    {/* Fixed: removed md:size */}
                                    <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm shrink-0">
                                        <FileCheck size={20} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-black text-gray-900 uppercase text-xs md:text-sm leading-none truncate">{file.name}</p>
                                        <p className="text-[9px] md:text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1.5">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
                                </div>
                                {!isAnalyzing && <button onClick={() => { setFile(null); setExtractedItems([]); }} className="p-2 text-gray-400 hover:text-red-500 transition-colors shrink-0"><Trash2 size={20}/></button>}
                            </div>

                            {isAnalyzing ? (
                                <div className="py-20 md:py-24 text-center space-y-6 animate-pulse">
                                    <div className="relative inline-block">
                                        {/* Fixed: removed md:size */}
                                        <Loader2 className="animate-spin text-indigo-600 mx-auto" size={48} strokeWidth={2} />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            {/* Fixed: removed md:size */}
                                            <Sparkles size={18} className="text-indigo-400 animate-bounce" />
                                        </div>
                                    </div>
                                    <div className="space-y-2 px-4">
                                        <p className="font-black text-[#0F172A] uppercase tracking-[0.2em] text-[10px] md:text-xs">AI Reasoning in Progress</p>
                                        <p className="text-[9px] md:text-[10px] text-gray-400 font-bold uppercase tracking-widest">Parsing multi-page manifest...</p>
                                    </div>
                                </div>
                            ) : extractedItems.length > 0 ? (
                                <div className="space-y-4 animate-in fade-in duration-500">
                                    <div className="flex items-center justify-between px-2">
                                        <h4 className="text-[10px] md:text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Audit ({extractedItems.length} items)</h4>
                                        <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg text-[8px] font-black border border-emerald-100 uppercase tracking-widest">Parsed</span>
                                    </div>
                                    <div className="bg-white border border-gray-100 rounded-[2rem] shadow-inner-sm overflow-hidden border-2">
                                        <div className="max-h-[300px] md:max-h-[400px] overflow-y-auto no-scrollbar">
                                            <table className="w-full text-left border-collapse">
                                                <thead className="bg-gray-50 border-b border-gray-100 text-[8px] md:text-[9px] font-black text-gray-400 uppercase tracking-widest sticky top-0 z-10">
                                                    <tr>
                                                        <th className="px-6 md:px-8 py-4 md:py-5">Identity</th>
                                                        <th className="px-6 md:px-8 py-4 md:py-5">Cat</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-50">
                                                    {extractedItems.map((item, idx) => (
                                                        <tr key={idx} className="hover:bg-gray-50 transition-colors group">
                                                            <td className="px-6 md:px-8 py-4 md:py-5">
                                                                <div className="font-black text-gray-900 text-xs md:text-sm uppercase tracking-tight leading-none mb-1.5">{item.name}</div>
                                                                <div className="text-[9px] md:text-[10px] text-gray-400 font-bold uppercase tracking-widest">{item.variety || 'Standard'}</div>
                                                            </td>
                                                            <td className="px-6 md:px-8 py-4 md:py-5">
                                                                <span className={`px-2 py-0.5 rounded text-[7px] md:text-[8px] font-black uppercase tracking-widest border ${item.category === 'Fruit' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                                                                    {item.category.slice(0,1)}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    )}
                </div>

                <div className="p-6 md:p-8 border-t border-gray-100 bg-white flex gap-3 md:gap-4 shrink-0">
                    <button onClick={onClose} className="flex-1 py-4 md:py-5 bg-white text-gray-400 rounded-2xl md:rounded-[1.25rem] font-black text-[10px] md:text-[11px] uppercase tracking-widest hover:bg-gray-50 transition-all active:scale-95 border-2 border-gray-50">Cancel</button>
                    <button 
                        onClick={handleConfirm}
                        disabled={isSaving || extractedItems.length === 0 || isAnalyzing}
                        className="flex-[2] py-4 md:py-5 bg-[#93A393] text-white rounded-2xl md:rounded-[1.25rem] font-black text-[10px] md:text-[11px] uppercase tracking-widest shadow-lg hover:bg-[#043003] transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        {/* Fixed: removed md:size */}
                        {isSaving ? <Loader2 className="animate-spin" size={18}/> : <><Check size={18} strokeWidth={4}/> Import Catalog</>}
                    </button>
                </div>
            </div>
        </div>
    );
};

export const Marketplace: React.FC<MarketplaceProps> = ({ user }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<'ALL' | 'Fruit' | 'Vegetable'>('ALL');
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'MY CATALOG' | 'DIRECTORY'>('MY CATALOG');
  const [favorites, setFavorites] = useState<string[]>(user?.favorites || []);

  useEffect(() => {
    loadProducts();
    const interval = setInterval(loadProducts, 10000);
    return () => clearInterval(interval);
  }, [user]);

  const loadProducts = () => {
    const all = mockService.getAllProducts().sort((a, b) => a.name.localeCompare(b.name));
    setProducts(all);
    if (user) {
        const u = mockService.getAllUsers().find(usr => usr.id === user.id);
        setFavorites(u?.favorites || []);
    }
  };

  const handleToggleFavorite = (productId: string) => {
    if (!user) return;
    mockService.toggleFavorite(user.id, productId);
    loadProducts();
  };

  const handleToggleCatalog = (productId: string) => {
    if (!user) return;
    mockService.toggleCatalogProduct(user.id, productId);
    loadProducts();
  };

  const handleAddToCart = (product: Product, quantity: number) => {
    mockService.addToCart({
        productId: product.id,
        productName: product.name,
        price: product.defaultPricePerKg,
        qty: quantity,
        imageUrl: '', 
        unit: product.unit || 'KG'
    });
    alert(`${quantity} ${product.unit || 'KG'} of ${product.name} added to cart!`);
  };

  const filteredProducts = useMemo(() => {
    let baseList = products;
    if (viewMode === 'MY CATALOG' && user) {
        const catalogIds = mockService.getAllUsers().find(u => u.id === user.id)?.catalogProducts || [];
        baseList = baseList.filter(p => catalogIds.includes(p.id));
    }
    if (activeCategory !== 'ALL') {
        baseList = baseList.filter(p => p.category === activeCategory);
    }
    if (searchTerm) {
        baseList = baseList.filter(p => 
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            p.variety.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }
    return baseList;
  }, [products, viewMode, activeCategory, searchTerm, user]);

  const isAdmin = user?.role === UserRole.ADMIN;
  const userCatalogIds = mockService.getAllUsers().find(u => u.id === user?.id)?.catalogProducts || [];

  return (
    <div className="space-y-6 md:space-y-10 pb-20 animate-in fade-in duration-500 px-2">
      {/* Header with Switcher Matches Screenshot Style */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tighter uppercase leading-none">Marketplace Catalog</h1>
          <p className="text-gray-400 font-bold text-[10px] md:text-sm tracking-tight mt-2 flex items-center gap-2 md:gap-3 uppercase">
            {isAdmin ? 'Global Inventory' : 'Direct Sourcing Hub'} <span className="w-1.5 h-1.5 rounded-full bg-gray-200"></span> {user?.businessName}
          </p>
        </div>
        
        <div className="flex gap-4 w-full md:w-auto">
            {/* View Mode Switcher Matches Requested Visual - Responsive Container */}
            <div className="bg-gray-100/50 p-1 rounded-2xl border border-gray-200 shadow-inner-sm flex gap-1 w-full md:w-auto overflow-x-auto no-scrollbar">
                <button 
                    onClick={() => setViewMode('MY CATALOG')}
                    className={`flex-1 md:flex-none px-4 md:px-8 py-3 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 whitespace-nowrap ${viewMode === 'MY CATALOG' ? 'bg-white text-emerald-600 shadow-md border border-gray-100' : 'text-gray-400'}`}
                >
                    <Check size={14} strokeWidth={4}/> CATALOG
                </button>
                <button 
                    onClick={() => setViewMode('DIRECTORY')}
                    className={`flex-1 md:flex-none px-4 md:px-8 py-3 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 whitespace-nowrap ${viewMode === 'DIRECTORY' ? 'bg-white text-gray-900 shadow-md border border-gray-100' : 'text-gray-400'}`}
                >
                    {/* Fixed: removed md:size */}
                    <Globe size={14}/> DIRECTORY
                </button>
            </div>

            <div className="relative group flex-1 md:w-64">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                <input 
                    type="text" 
                    placeholder="Search varieties..." 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                    className="w-full pl-10 pr-4 py-3.5 bg-white border border-gray-100 rounded-2xl text-[10px] font-bold outline-none focus:ring-4 focus:ring-indigo-50 transition-all shadow-sm"
                />
            </div>
            {isAdmin && (
                <button 
                    onClick={() => setIsBulkModalOpen(true)}
                    className="flex-none p-3.5 bg-[#043003] text-white rounded-2xl font-black shadow-xl hover:bg-black transition-all active:scale-95 flex items-center gap-2"
                >
                    <FilePlus size={20}/>
                </button>
            )}
        </div>
      </div>

      <div className="flex gap-2 p-1.5 bg-gray-100/50 rounded-2xl border border-gray-200 w-fit mx-2">
        {(['ALL', 'Fruit', 'Vegetable'] as const).map(cat => (
            <button 
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 md:px-10 py-3 md:py-4 rounded-xl md:rounded-2xl text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap ${activeCategory === cat ? 'bg-white text-gray-900 shadow-md ring-1 ring-black/5' : 'text-gray-400 hover:text-gray-600'}`}
            >
                {cat}
            </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
        {filteredProducts.map(product => (
          <ProductCard 
            key={product.id}
            product={product}
            isCatalog={userCatalogIds.includes(product.id)}
            isFavorite={favorites.includes(product.id)}
            onToggleCatalog={handleToggleCatalog}
            onToggleFavorite={handleToggleFavorite}
            onAddToCart={handleAddToCart}
          />
        ))}
        {filteredProducts.length === 0 && (
          <div className="col-span-full py-24 md:py-40 text-center opacity-30">
            {/* Fixed: removed md:size */}
            <Search size={48} className="mx-auto text-gray-200 mb-6" />
            <p className="font-black uppercase tracking-widest text-[10px] md:text-xs">No matching varieties found</p>
          </div>
        )}
      </div>

      <BulkUploadModal 
        isOpen={isBulkModalOpen} 
        onClose={() => setIsBulkModalOpen(false)}
        onComplete={loadProducts}
      />
    </div>
  );
};