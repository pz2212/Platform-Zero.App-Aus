import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { User, Order, Product, OrderItem } from '../types';
import { mockService } from '../services/mockDataService';
import { 
  Package, Clock, CheckCircle, Truck, X, Calendar, MapPin, 
  DollarSign, ChevronRight, AlertTriangle, MessageSquare, 
  Info, Share2, Download, Check, History, Camera, Loader2,
  AlertCircle, CheckCircle2, ChevronDown, Upload, Plus
} from 'lucide-react';
import { ChatDialog } from './ChatDialog';

interface CustomerOrdersProps {
  user: User;
}

export const ReportIssueModal = ({ isOpen, onClose, product, orderId, onSubmit }: {
    isOpen: boolean,
    onClose: () => void,
    product: Product | null,
    orderId: string,
    onSubmit: (data: any) => void
}) => {
    const [issueType, setIssueType] = useState('');
    const [description, setDescription] = useState('');
    const [replacementRequired, setReplacementRequired] = useState('');
    const [images, setImages] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen || !product) return null;

    const issueTypes = ['Missing Items', 'Quality Issues', 'Extra Items Received', 'Damaged Packaging'];
    const replacementOptions = ['Urgent - Same day', 'Next scheduled delivery', 'No replacement needed'];

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0] && images.length < 3) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                setImages(prev => [...prev, ev.target?.result as string]);
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleReportSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!issueType || !replacementRequired) {
            alert("Please fill in all required fields.");
            return;
        }
        setIsSubmitting(true);
        await new Promise(r => setTimeout(r, 1000));
        onSubmit({
            productId: product.id,
            type: issueType,
            description,
            replacementRequired,
            images
        });
        setIsSubmitting(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[400] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white shrink-0">
                    <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Report Issue - {product.name}</h2>
                    <button onClick={onClose} className="text-gray-300 hover:text-gray-900 transition-colors p-1"><X size={24}/></button>
                </div>

                <form onSubmit={handleReportSubmit} className="p-8 space-y-6 overflow-y-auto max-h-[75vh] custom-scrollbar">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-2">Issue Type</label>
                            <div className="relative">
                                <select 
                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
                                    value={issueType}
                                    onChange={e => setIssueType(e.target.value)}
                                    required
                                >
                                    <option value="">Select issue type</option>
                                    {issueTypes.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                                <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-2">Description</label>
                            <textarea 
                                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium text-gray-700 h-28 resize-none outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Describe the issue in detail..."
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-2">Photo Evidence (max 3 photos)</label>
                            <div 
                                onClick={() => images.length < 3 && fileInputRef.current?.click()}
                                className={`border-2 border-dashed rounded-2xl h-40 flex flex-col items-center justify-center cursor-pointer transition-all bg-gray-50 ${images.length < 3 ? 'border-gray-200 hover:border-indigo-400' : 'border-emerald-500 cursor-default'}`}
                            >
                                {images.length > 0 ? (
                                    <div className="flex gap-2 p-2">
                                        {images.map((img, i) => (
                                            <div key={i} className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200 relative">
                                                <img src={img} className="w-full h-full object-cover" />
                                                <button onClick={(e) => { e.stopPropagation(); setImages(prev => prev.filter((_, idx) => idx !== i)); }} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5"><X size={12}/></button>
                                            </div>
                                        ))}
                                        {/* Fixed: Plus icon added to lucide-react imports above */}
                                        {images.length < 3 && <div className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300"><Plus size={20}/></div>}
                                    </div>
                                ) : (
                                    <>
                                        <Camera size={32} className="text-gray-300 mb-2"/>
                                        <p className="text-xs font-bold text-gray-500">Click to upload photos or drag and drop</p>
                                        <p className="text-[10px] text-gray-400">PNG, JPG up to 10MB each</p>
                                    </>
                                )}
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange}/>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-2">Replacement Required?</label>
                            <div className="relative">
                                <select 
                                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl font-medium text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
                                    value={replacementRequired}
                                    onChange={e => setReplacementRequired(e.target.value)}
                                    required
                                >
                                    <option value="">Select replacement timing</option>
                                    {replacementOptions.map(o => <option key={o} value={o}>{o}</option>)}
                                </select>
                                <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
                            </div>
                        </div>
                    </div>
                </form>

                <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-3 shrink-0">
                    <button 
                        onClick={handleReportSubmit}
                        disabled={isSubmitting || !issueType || !replacementRequired}
                        className="flex-1 py-4 bg-[#043003] text-white rounded-xl font-black uppercase text-xs tracking-widest shadow-lg hover:bg-black transition-all active:scale-95 disabled:opacity-50"
                    >
                        {isSubmitting ? <Loader2 className="animate-spin mx-auto" size={20}/> : 'Submit Issue Report'}
                    </button>
                    <button 
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-4 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold text-xs uppercase hover:bg-gray-100 transition-all"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export const DeliveryVerificationModal = ({ isOpen, onClose, order, products, onComplete }: {
    isOpen: boolean,
    onClose: () => void,
    order: Order | null,
    products: Product[],
    onComplete: () => void
}) => {
    const [verifiedItems, setVerifiedItems] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Issue state
    const [reportingItem, setReportingItem] = useState<Product | null>(null);

    if (!isOpen || !order) return null;

    const toggleVerify = (productId: string) => {
        setVerifiedItems(prev => 
            prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
        );
    };

    const handleFinish = async () => {
        setIsSubmitting(true);
        await new Promise(r => setTimeout(r, 1000));
        setIsSubmitting(false);
        onComplete();
        onClose();
    };

    const handleIssueSubmit = (issueData: any) => {
        mockService.submitOrderIssue(order.id, issueData);
        setVerifiedItems(prev => prev.filter(id => id !== issueData.productId));
        setReportingItem(null);
        alert("Issue report submitted! Platform Zero Admin will investigate immediately.");
    };

    return (
        <>
            <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
                <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                    <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-white shrink-0">
                        <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Delivery Verification - Order #{order.id.split('-').pop()}</h2>
                        <button onClick={onClose} className="text-gray-300 hover:text-gray-900 transition-colors"><X size={24}/></button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                        <div className="bg-red-50 border border-red-100 p-6 rounded-2xl">
                            <div className="flex items-center gap-3 text-red-600 mb-2 font-black text-xs uppercase tracking-widest">
                                <Clock size={16}/> Verification Timer: 59:45 remaining
                            </div>
                            <p className="text-red-900 text-sm font-medium">Please verify all items within 60 minutes to report any issues.</p>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Product Checklist</h3>
                            <div className="space-y-3">
                                {order.items.map((item, idx) => {
                                    const p = products.find(prod => prod.id === item.productId);
                                    const isVerified = verifiedItems.includes(item.productId);
                                    const hasIssue = order.issue?.productId === item.productId;

                                    return (
                                        <div key={idx} className={`p-6 bg-white border rounded-2xl flex items-center justify-between shadow-sm group hover:border-indigo-100 transition-all ${hasIssue ? 'border-red-200 bg-red-50/10' : 'border-gray-100'}`}>
                                            <div>
                                                <p className="font-black text-gray-900 uppercase text-sm mb-1">{p?.name || 'Produce Item'}</p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ordered: {item.quantityKg}{p?.unit || 'KG'} | Price: ${ (item.quantityKg * item.pricePerKg).toFixed(2) }</p>
                                                {hasIssue && <p className="text-[9px] font-black text-red-500 uppercase tracking-widest mt-2 flex items-center gap-1"><AlertTriangle size={10}/> ISSUE REPORTED</p>}
                                            </div>
                                            <div className="flex gap-2">
                                                {!hasIssue && (
                                                    <button 
                                                        onClick={() => toggleVerify(item.productId)}
                                                        className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest border transition-all flex items-center gap-2 ${
                                                            isVerified ? 'bg-emerald-500 border-emerald-50 text-white shadow-lg' : 'bg-white border-gray-100 text-gray-400 hover:border-emerald-500 hover:text-emerald-500'
                                                        }`}
                                                    >
                                                        <Check size={14}/> {isVerified ? 'Verified' : 'Verify'}
                                                    </button>
                                                )}
                                                <button 
                                                    onClick={() => p && setReportingItem(p)}
                                                    className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 ${
                                                        hasIssue 
                                                        ? 'bg-red-100 text-red-600 border border-red-200' 
                                                        : 'bg-red-500 text-white shadow-lg shadow-red-100 hover:bg-red-600'
                                                    }`}
                                                >
                                                    <AlertTriangle size={14}/> {hasIssue ? 'Reported' : 'Issue'}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="p-8 border-t border-gray-100 bg-gray-50 shrink-0">
                        <button 
                            onClick={handleFinish}
                            disabled={isSubmitting}
                            className="w-full py-5 bg-[#043003] text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : 'Complete Order Checklist'}
                        </button>
                    </div>
                </div>
            </div>

            <ReportIssueModal 
                isOpen={!!reportingItem} 
                onClose={() => setReportingItem(null)} 
                product={reportingItem} 
                orderId={order.id} 
                onSubmit={handleIssueSubmit}
            />
        </>
    );
};

export const LiveTrackingModal = ({ isOpen, onClose, order, onVerify }: {
    isOpen: boolean,
    onClose: () => void,
    order: Order | null,
    onVerify: () => void
}) => {
    if (!isOpen || !order) return null;

    const steps = [
        { label: 'Order Confirmed', time: '10:30 AM', detail: 'Green Valley Farms', done: true },
        { label: 'Order Prepared', time: '1:15 PM', detail: 'Quality checked and packed', done: true },
        { label: 'Out for Delivery', time: '2:00 PM', detail: 'Driver en route', done: order.status === 'Shipped' || order.status === 'Delivered', active: order.status === 'Shipped' },
        { label: 'Delivered', time: '2:28 PM', detail: 'Driver confirmed delivery', done: order.status === 'Delivered' }
    ];

    return (
        <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 border border-gray-100">
                <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-white shrink-0">
                    <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Live Order Tracking</h2>
                    <button onClick={onClose} className="text-gray-300 hover:text-gray-900 transition-colors"><X size={24}/></button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar bg-white">
                    {/* Order Meta Match */}
                    <div className="bg-indigo-50/50 p-8 rounded-[2rem] border border-indigo-100 flex justify-between items-start">
                        <div>
                            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-2">Order #{order.id.split('-').pop()}</h3>
                            <div className="space-y-1.5">
                                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">Driver: Marcus Thompson</p>
                                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">ETA: 2:30 PM today</p>
                                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">Vehicle: White Toyota Hiace - Plate ABC123</p>
                            </div>
                        </div>
                        <span className="bg-[#052C05] text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg">
                            {order.status === 'Delivered' ? 'Delivered' : 'In Transit'}
                        </span>
                    </div>

                    {/* Timeline Match */}
                    <div className="space-y-8 pl-4">
                        {steps.map((step, idx) => (
                            <div key={idx} className="flex gap-6 relative">
                                {idx < steps.length - 1 && (
                                    <div className={`absolute left-4 top-8 bottom-[-2rem] w-0.5 ${step.done && steps[idx+1].done ? 'bg-emerald-500' : 'bg-gray-100'}`}></div>
                                )}
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 border-4 ${
                                    step.done ? 'bg-emerald-500 border-emerald-50 text-white shadow-md' : 
                                    step.active ? 'bg-blue-50 border-blue-100 text-blue-500 animate-pulse' : 'bg-white border-gray-100 text-gray-300'
                                }`}>
                                    {step.done ? <Check size={16} strokeWidth={4}/> : idx === 2 ? <Truck size={14}/> : <div className="w-1.5 h-1.5 rounded-full bg-current"/>}
                                </div>
                                <div className="flex-1 pb-2">
                                    <h4 className={`text-sm font-black uppercase tracking-tight ${step.done ? 'text-gray-900' : 'text-gray-400'}`}>{step.label}</h4>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{step.time} - {step.detail}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Delivery Instructions Match */}
                    <div className="bg-yellow-50 p-6 rounded-2xl border border-yellow-100">
                        <p className="text-[10px] font-black text-yellow-600 uppercase tracking-widest mb-2">Delivery Instructions</p>
                        <p className="text-sm text-yellow-900 font-medium leading-relaxed">Please deliver to rear kitchen entrance. Ring bell twice.</p>
                    </div>

                    {/* Footer Call to Action Match */}
                    {order.status === 'Delivered' && (
                        <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 animate-in slide-in-from-bottom-2">
                            <div className="flex items-center gap-3 text-emerald-600 mb-6">
                                <CheckCircle size={20}/>
                                <div>
                                    <p className="font-black uppercase text-[11px] tracking-tight">Delivery Confirmed by Driver</p>
                                    <p className="text-[10px] font-medium text-emerald-700">Marcus Thompson confirmed delivery at 2:28 PM. Verification countdown started automatically.</p>
                                </div>
                            </div>
                            <button 
                                onClick={onVerify}
                                className="w-full py-4 bg-[#052C05] hover:bg-black text-white rounded-xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl flex items-center justify-center gap-3 transition-all"
                            >
                                <Clock size={16}/> Verify Products (59:45 remaining)
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export const OrderManifestModal = ({ isOpen, onClose, order, products, onReportIssue }: { 
    isOpen: boolean, 
    onClose: () => void, 
    order: Order | null, 
    products: Product[],
    onReportIssue?: (order: Order) => void
}) => {
    if (!isOpen || !order) return null;

    const seller = mockService.getAllUsers().find(u => u.id === order.sellerId);
    const buyer = mockService.getCustomers().find(c => c.id === order.buyerId);
    
    const steps = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];
    const getStatusIndex = (s: string) => {
        if (s === 'Delivered') return 3;
        if (s === 'Shipped' || s === 'Ready for Delivery') return 2;
        if (s === 'Confirmed') return 1;
        return 0;
    };
    const currentIdx = getStatusIndex(order.status);

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 border border-gray-100">
                <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-white shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#043003] rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg">P</div>
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight leading-none">Order Details</h2>
                            <p className="text-[10px] text-indigo-600 font-black uppercase tracking-[0.2em] mt-1.5">Manifest Reference: #{order.id.split('-').pop()}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-300 hover:text-gray-900 p-2 bg-gray-50 rounded-full border border-gray-100 shadow-sm transition-all"><X size={24}/></button>
                </div>

                <div className="flex-1 overflow-y-auto p-10 space-y-10 no-scrollbar bg-white">
                    <div className="flex justify-between items-center px-4 relative mb-12">
                        <div className="absolute top-1/2 left-8 right-8 h-0.5 bg-gray-100 -translate-y-1/2 z-0"></div>
                        <div 
                            className="absolute top-1/2 left-8 h-0.5 bg-emerald-500 -translate-y-1/2 z-0 transition-all duration-1000 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                            style={{ width: `${(currentIdx / (steps.length - 1)) * 92}%` }}
                        ></div>

                        {steps.map((step, idx) => (
                            <div key={step} className="flex flex-col items-center z-10">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${
                                    idx <= currentIdx ? 'bg-emerald-500 border-emerald-50 text-white shadow-lg' : 'bg-white border-gray-100 text-gray-300'
                                }`}>
                                    {idx === 0 ? <Clock size={14} strokeWidth={3}/> : 
                                     idx === 1 ? <Check size={14} strokeWidth={4}/> :
                                     idx === 2 ? <Truck size={14} strokeWidth={3}/> : 
                                     <Package size={14} strokeWidth={3}/>}
                                </div>
                                <span className={`text-[8px] font-black uppercase tracking-widest mt-3 ${idx <= currentIdx ? 'text-gray-900' : 'text-gray-300'}`}>{step}</span>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 gap-y-8 px-2">
                        <div>
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Order Placed</p>
                            <p className="text-sm font-black text-gray-900">{new Date(order.date).toLocaleDateString()}</p>
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Authorized Buyer</p>
                            <p className="text-sm font-black text-gray-900">{buyer?.contactName || 'Alice Consumer'}</p>
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Supplier Anchor</p>
                            <p className="text-sm font-black text-indigo-600 uppercase">{seller?.businessName || 'Fresh Wholesalers'}</p>
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Current Status</p>
                            <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-emerald-100 shadow-sm">{order.status.toUpperCase()}</span>
                        </div>
                    </div>

                    <div className="bg-gray-50/50 rounded-[2rem] p-8 border border-gray-100 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:scale-110 transition-transform pointer-events-none"><Truck size={120}/></div>
                        <div className="flex items-center gap-3 text-indigo-400 mb-6 font-black text-[9px] uppercase tracking-[0.2em]">
                            <Truck size={14}/> Fulfillment Coordinates
                        </div>
                        <div className="grid grid-cols-2 gap-8 relative z-10">
                            <div>
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Expected Delivery</p>
                                <p className="text-sm font-black text-gray-900">{order.logistics?.deliveryTime || 'TBD'}</p>
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Destination Address</p>
                                <p className="text-sm font-black text-gray-900">{order.logistics?.deliveryLocation || 'Adelaide CBD'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-emerald-500 font-black text-[9px] uppercase tracking-[0.2em] mb-4">
                            <Package size={14}/> Product Manifest
                        </div>
                        <div className="divide-y divide-gray-50 border border-gray-100 rounded-3xl overflow-hidden bg-white shadow-sm">
                            {order.items.map((item, idx) => {
                                const p = products.find(prod => prod.id === item.productId);
                                return (
                                    <div key={idx} className="p-6 flex items-center justify-between hover:bg-gray-50/50 transition-all">
                                        <div className="flex items-center gap-5">
                                            <div className="w-12 h-12 rounded-xl overflow-hidden border border-gray-100 shadow-sm bg-gray-50">
                                                <img src={p?.imageUrl} className="w-full h-full object-cover" alt="" />
                                            </div>
                                            <div>
                                                <p className="font-black text-gray-900 text-sm uppercase">{p?.name || 'Produce Item'}</p>
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-0.5">{p?.variety || 'Standard'}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-black text-gray-900 text-xl tracking-tighter leading-none">{item.quantityKg}{p?.unit || 'KG'}</p>
                                            <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mt-1.5">${item.pricePerKg.toFixed(2)}/u</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="pt-2 px-2">
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Aggregate Total</p>
                                <div className="flex items-center gap-4">
                                    <span className="bg-indigo-50 text-indigo-500 px-3 py-1 rounded text-[8px] font-black uppercase tracking-widest border border-indigo-100">INVOICE</span>
                                    <h3 className="text-5xl font-black text-gray-900 tracking-tighter">${order.totalAmount.toFixed(2)}</h3>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Reporting Window Expired Warning - AS SEEN IN SCREENSHOT 2 */}
                    <div className="bg-gray-50 rounded-[2rem] p-6 border border-gray-100 flex items-start gap-5">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-400 shadow-sm shrink-0 border border-gray-100">
                            <Info size={20} />
                        </div>
                        <p className="text-[13px] text-gray-500 font-medium leading-relaxed">
                            The <span className="font-black text-gray-800">Standard Reporting Window</span> for this order has expired. For urgent inquiries, please contact your PZ Representative Alex directly.
                        </p>
                    </div>
                </div>

                <div className="p-8 border-t border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Platform Zero Official Trade Manifest</p>
                    <div className="flex gap-3">
                        <button onClick={onClose} className="px-10 py-3.5 bg-white border-2 border-gray-100 text-gray-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-100 transition-all active:scale-95 shadow-sm">Close</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const CustomerOrders: React.FC<CustomerOrdersProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedOrderForManifest, setSelectedOrderForManifest] = useState<Order | null>(null);
  
  // LIVE TRACKING STATES
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);
  const [verifyingOrder, setVerifyingOrder] = useState<Order | null>(null);

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 5000); 
    return () => clearInterval(interval);
  }, [user]);

  const loadOrders = () => {
    const allOrders = mockService.getOrders(user.id).filter(o => o.buyerId === user.id);
    setOrders(allOrders);
    setProducts(mockService.getAllProducts());
  };

  const activeOrders = orders.filter(o => ['Pending', 'Confirmed', 'Ready for Delivery', 'Shipped'].includes(o.status));
  const historyOrders = orders.filter(o => ['Delivered', 'Cancelled'].includes(o.status));

  const displayedOrders = activeTab === 'active' ? activeOrders : historyOrders;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Confirmed': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Ready for Delivery': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Shipped': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'Delivered': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-2">
        <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase leading-none">Trade History</h1>
            <p className="text-gray-500 font-medium mt-1">Live status updates for your direct market shipments.</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-1 inline-flex shadow-sm mx-2">
          <button
            onClick={() => setActiveTab('active')}
            className={`whitespace-nowrap py-3 px-8 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all ${
              activeTab === 'active'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Package size={18}/>
            Active Orders
            {activeOrders.length > 0 && (
                <span className="bg-emerald-500 text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                    {activeOrders.length}
                </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`whitespace-nowrap py-3 px-8 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all ${
              activeTab === 'history'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <History size={18}/>
            Past Orders
          </button>
      </div>

      <div className="space-y-4 px-2">
        {displayedOrders.length === 0 ? (
            <div className="text-center py-40 bg-white rounded-[3rem] border-2 border-dashed border-gray-200 shadow-inner-sm">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Package size={40} className="text-gray-200" />
                </div>
                <h3 className="text-xl font-black text-gray-300 uppercase tracking-tight">Manifest Empty</h3>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-2">
                    {activeTab === 'active' ? "No active shipments in transit." : "No previous trade history found."}
                </p>
            </div>
        ) : (
            displayedOrders.map(order => {
                const seller = mockService.getAllUsers().find(u => u.id === order.sellerId);
                return (
                    <div 
                        key={order.id} 
                        onClick={() => setSelectedOrderForManifest(order)}
                        className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all group cursor-pointer animate-in slide-in-from-bottom-2"
                    >
                        <div className="flex flex-col lg:flex-row justify-between items-center gap-8">
                            <div className="flex items-center gap-8 flex-1 w-full">
                                <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 font-black text-xl shadow-inner-sm border border-gray-100 shrink-0 uppercase group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-100 transition-colors">
                                    {seller?.businessName.charAt(0)}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h4 className="font-black text-gray-900 text-xl uppercase tracking-tight leading-none mb-2 truncate group-hover:text-indigo-600 transition-colors">{seller?.businessName}</h4>
                                    <div className="flex items-center gap-4">
                                        <span className={`px-4 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest border shadow-sm ${getStatusColor(order.status)}`}>
                                            {order.status}
                                        </span>
                                        <span className="text-[10px] text-gray-300 font-bold uppercase tracking-widest leading-none">REF: #{order.id.split('-').pop()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-12 w-full lg:w-auto justify-between lg:justify-end border-t lg:border-0 border-gray-50 pt-6 lg:pt-0">
                                <div className="text-left lg:text-right shrink-0">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Trade Value</p>
                                    <p className="text-2xl font-black text-gray-900 tracking-tighter leading-none">${order.totalAmount.toFixed(2)}</p>
                                </div>

                                {order.status === 'Shipped' || order.status === 'Delivered' ? (
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); setTrackingOrder(order); }}
                                        className="px-8 py-3 bg-emerald-600 hover:bg-black text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl transition-all active:scale-95 flex items-center gap-2"
                                    >
                                        Live Tracking <Truck size={14}/>
                                    </button>
                                ) : (
                                    <div className="p-4 rounded-2xl bg-gray-50 text-gray-300 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all shadow-sm">
                                        <ChevronRight size={24} strokeWidth={3}/>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })
        )}
      </div>

      <OrderManifestModal 
        isOpen={!!selectedOrderForManifest}
        onClose={() => setSelectedOrderForManifest(null)}
        order={selectedOrderForManifest}
        products={products}
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
        onComplete={() => alert('Verification Complete! Payment settled.')}
      />
    </div>
  );
};
