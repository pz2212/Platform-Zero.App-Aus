
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { User, Order, Product } from '../types';
import { mockService } from '../services/mockDataService';
import { 
  Package, Clock, CheckCircle, Truck, X, Calendar, MapPin, 
  DollarSign, ChevronRight, AlertTriangle, MessageSquare, 
  Leaf, Info, FileText, Share2, Download, Timer, ShieldCheck, 
  ChevronDown, ArrowRight, Check, History, Camera, Loader2,
  AlertCircle, ThumbsUp
} from 'lucide-react';
import { ChatDialog } from './ChatDialog';

interface CustomerOrdersProps {
  user: User;
}

const ReportIssueModal = ({ isOpen, onClose, product, orderId, onSubmit }: any) => {
    const [issueType, setIssueType] = useState('');
    const [replacement, setReplacement] = useState('');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen || !product) return null;

    const handleSubmit = async () => {
        if (!issueType || !replacement) {
            alert("Please select issue type and replacement timing.");
            return;
        }
        setIsSubmitting(true);
        await onSubmit({
            productId: product.id,
            issueType,
            replacementRequired: replacement,
            description
        });
        setIsSubmitting(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight leading-none">Report Issue - {product.name}</h2>
                    <button onClick={onClose} className="text-gray-300 hover:text-gray-900"><X size={20}/></button>
                </div>
                <div className="p-8 space-y-6">
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Issue Type</label>
                        <select 
                            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 outline-none focus:ring-4 focus:ring-red-500/5 transition-all"
                            value={issueType}
                            onChange={(e) => setIssueType(e.target.value)}
                        >
                            <option value="">Select issue type</option>
                            <option value="Missing Items">Missing Items</option>
                            <option value="Quality Issues">Quality Issues</option>
                            <option value="Extra Items Received">Extra Items Received</option>
                            <option value="Damaged Packaging">Damaged Packaging</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Photo Evidence (max 3 photos)</label>
                        <div className="border-2 border-dashed border-gray-200 rounded-2xl p-10 text-center bg-gray-50/50 group hover:border-red-400 transition-all cursor-pointer">
                            <Camera size={40} className="mx-auto text-gray-300 mb-3 group-hover:text-red-500 transition-colors"/>
                            <p className="text-sm font-black text-gray-500">Click to upload photos or drag and drop</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">PNG, JPG up to 10MB each</p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Replacement Required?</label>
                        <select 
                            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 outline-none focus:ring-4 focus:ring-red-500/5 transition-all"
                            value={replacement}
                            onChange={(e) => setReplacement(e.target.value)}
                        >
                            <option value="">Select replacement timing</option>
                            <option value="URGENT">Urgent - Same day</option>
                            <option value="NEXT_DELIVERY">Next scheduled delivery</option>
                            <option value="NONE">No replacement needed</option>
                        </select>
                    </div>

                    <div className="pt-4 grid grid-cols-2 gap-4">
                        <button onClick={onClose} className="py-4 bg-white border-2 border-gray-100 text-gray-400 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-gray-50">Cancel</button>
                        <button onClick={handleSubmit} disabled={isSubmitting} className="py-4 bg-[#043003] text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50">
                            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : 'Submit Issue Report'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const DeliveryVerificationModal = ({ isOpen, onClose, order, products, onSubmitIssue }: any) => {
    const [now, setNow] = useState(new Date());
    const [verifiedItems, setVerifiedItems] = useState<Record<string, boolean>>({});
    const [reportingItem, setReportingItem] = useState<Product | null>(null);

    useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    if (!isOpen || !order) return null;

    const getTimerData = () => {
        if (!order.deliveredAt) return { expired: false, diffText: '00:00' };
        const deliveredTime = new Date(order.deliveredAt).getTime();
        const expiryTime = deliveredTime + (90 * 60 * 1000);
        const diff = expiryTime - now.getTime();
        if (diff <= 0) return { expired: true, diffText: '00:00' };
        const m = Math.floor(diff / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        return { expired: false, diffText: `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}` };
    };

    const timer = getTimerData();

    const handleVerify = (productId: string) => {
        setVerifiedItems(prev => ({ ...prev, [productId]: true }));
    };

    const handleIssue = (productId: string) => {
        const p = products.find((prod: any) => prod.id === productId);
        if (p) setReportingItem(p);
    };

    const handleComplete = () => {
        const allChecked = order.items.every((i: any) => verifiedItems[i.productId] || order.issue);
        if (!allChecked) {
            alert("Please verify all items or report an issue for any discrepancies.");
            return;
        }
        alert("Verification checklist complete. All verified items are now locked for invoicing.");
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 border border-gray-100">
                <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-white">
                    <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase leading-none">Delivery Verification - Order #{order.id.split('-').pop()}</h2>
                    <button onClick={onClose} className="text-gray-300 hover:text-gray-900 p-2"><X size={24}/></button>
                </div>

                <div className="flex-1 overflow-y-auto p-10 space-y-8 no-scrollbar bg-white">
                    {/* Verification Timer Box */}
                    <div className="bg-[#FFF1F2] rounded-3xl p-6 border-2 border-red-50 flex items-start gap-5">
                        <div className="p-3 bg-white rounded-2xl text-red-500 shadow-sm border border-red-50 shrink-0"><Timer size={32} className="animate-pulse" /></div>
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <p className="text-[11px] font-black text-red-500 uppercase tracking-[0.2em]">Verification Timer: {timer.diffText} remaining</p>
                            </div>
                            <p className="text-[13px] text-red-900 font-bold leading-relaxed">
                                Please verify all items within 90 minutes to report any issues.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight flex items-center gap-2">Product Checklist</h3>
                        <div className="space-y-3">
                            {order.items.map((item: any) => {
                                const p = products.find((prod: any) => prod.id === item.productId);
                                const isVerified = verifiedItems[item.productId];
                                const hasIssue = order.issue?.productId === item.productId;

                                return (
                                    <div key={item.productId} className={`p-6 rounded-[1.75rem] border-2 transition-all flex items-center justify-between ${isVerified ? 'bg-emerald-50/50 border-emerald-200' : hasIssue ? 'bg-red-50/50 border-red-200' : 'bg-gray-50 border-gray-100'}`}>
                                        <div>
                                            <p className="font-black text-gray-900 uppercase text-[15px]">{p?.name || 'Produce Item'}</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Ordered: {item.quantityKg}kg | Price: ${(item.quantityKg * item.pricePerKg).toFixed(2)}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            {isVerified ? (
                                                <div className="flex items-center gap-2 text-emerald-600 font-black text-xs uppercase px-4 py-2"><Check size={18} strokeWidth={4}/> Verified</div>
                                            ) : hasIssue ? (
                                                <div className="flex items-center gap-2 text-red-600 font-black text-xs uppercase px-4 py-2"><AlertCircle size={18} strokeWidth={3}/> Issue Logged</div>
                                            ) : (
                                                <>
                                                    <button 
                                                        onClick={() => handleVerify(item.productId)}
                                                        className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-emerald-600 hover:border-emerald-200 transition-all shadow-sm active:scale-95"
                                                    >
                                                        <Check size={14} strokeWidth={4}/> Verify
                                                    </button>
                                                    <button 
                                                        onClick={() => handleIssue(item.productId)}
                                                        className="flex items-center gap-2 px-5 py-2.5 bg-red-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-100 hover:bg-red-600 transition-all active:scale-95"
                                                    >
                                                        <AlertTriangle size={14}/> Issue
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="p-8 border-t border-gray-100 bg-gray-50/50 flex flex-col gap-4">
                    <button 
                        onClick={handleComplete}
                        className="w-full py-5 bg-[#043003] text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                    >
                        Complete Order Checklist
                    </button>
                </div>
            </div>

            <ReportIssueModal 
                isOpen={!!reportingItem}
                onClose={() => setReportingItem(null)}
                product={reportingItem}
                orderId={order.id}
                onSubmit={(data: any) => onSubmitIssue(order.id, data)}
            />
        </div>
    );
};

export const OrderManifestModal = ({ isOpen, onClose, order, products, onReportIssue }: { 
    isOpen: boolean, 
    onClose: () => void, 
    order: Order | null, 
    products: Product[],
    onReportIssue: (order: Order, item?: any) => void
}) => {
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    if (!isOpen || !order) return null;

    const seller = mockService.getAllUsers().find(u => u.id === order.sellerId);
    const buyer = mockService.getCustomers().find(c => c.id === order.buyerId);
    
    // Status Logic
    const steps = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];
    const getStatusIndex = (s: string) => {
        if (s === 'Delivered') return 3;
        if (s === 'Shipped' || s === 'Ready for Delivery') return 2;
        if (s === 'Confirmed') return 1;
        return 0;
    };
    const currentIdx = getStatusIndex(order.status);

    // Timer Logic
    const getTimerData = () => {
        if (!order.deliveredAt) return { expired: false, diffText: '--:--' };
        const deliveredTime = new Date(order.deliveredAt).getTime();
        const expiryTime = deliveredTime + (90 * 60 * 1000); // 90 minutes
        const diff = expiryTime - now.getTime();
        
        if (diff <= 0) return { expired: true, diffText: '00:00' };
        
        const m = Math.floor(diff / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        return { expired: false, diffText: `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}` };
    };

    const timer = getTimerData();

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 border border-gray-100">
                {/* Header */}
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
                    {/* Progress Bar */}
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

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 gap-y-8 px-2">
                        <div>
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Order Placed</p>
                            <p className="text-sm font-black text-gray-900">{new Date(order.date).toLocaleDateString()} @ {new Date(order.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false})}</p>
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Authorized Buyer</p>
                            <p className="text-sm font-black text-gray-900">{buyer?.contactName || 'Alice Consumer'}</p>
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Supplier Anchor</p>
                            <p className="text-sm font-black text-indigo-600 uppercase">{seller?.businessName || 'Fresh Wholesalers Adelaide'}</p>
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Current Status</p>
                            <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-emerald-100 shadow-sm">{order.status.toUpperCase()}</span>
                        </div>
                    </div>

                    {/* Fulfillment Coordinates Box */}
                    <div className="bg-gray-50/50 rounded-[2rem] p-8 border border-gray-100 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:scale-110 transition-transform pointer-events-none"><Truck size={120}/></div>
                        <div className="flex items-center gap-3 text-indigo-400 mb-6 font-black text-[9px] uppercase tracking-[0.2em]">
                            <Truck size={14}/> Fulfillment Coordinates
                        </div>
                        <div className="grid grid-cols-2 gap-8 relative z-10">
                            <div>
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Expected Delivery</p>
                                <p className="text-sm font-black text-gray-900">TBD <span className="text-indigo-600">@Scheduling</span></p>
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Destination Address</p>
                                <p className="text-sm font-black text-gray-900">{order.logistics?.deliveryLocation || 'Adelaide CBD'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Product Manifest */}
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
                                            <p className="font-black text-gray-900 text-lg leading-none">{item.quantityKg}{p?.unit || 'KG'}</p>
                                            <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest mt-1.5">${item.pricePerKg.toFixed(2)}/u</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Totals */}
                    <div className="pt-2 px-2">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Aggregate Total</p>
                        <div className="flex items-center gap-4">
                            <span className="bg-indigo-50 text-indigo-500 px-3 py-1 rounded text-[8px] font-black uppercase tracking-widest border border-indigo-100">INVOICE</span>
                            <h3 className="text-5xl font-black text-gray-900 tracking-tighter">${order.totalAmount.toFixed(2)}</h3>
                        </div>
                    </div>

                    {/* Reporting Window Message Box */}
                    {order.status === 'Delivered' && (
                        <div className={`p-8 rounded-[2rem] border-2 transition-all duration-700 animate-in slide-in-from-bottom-4 ${timer.expired ? 'bg-gray-50 border-gray-100 opacity-80' : 'bg-[#043003] border-emerald-900 shadow-xl shadow-emerald-500/5'}`}>
                            <div className="flex items-start gap-5">
                                <div className={`p-3 rounded-2xl ${timer.expired ? 'bg-white text-gray-400' : 'bg-white text-emerald-700 shadow-sm'} shrink-0`}>
                                    {timer.expired ? <Info size={24}/> : <Clock size={24} className="animate-pulse"/>}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className={`text-[10px] font-black uppercase tracking-widest ${timer.expired ? 'text-gray-400' : 'text-emerald-400'}`}>
                                            Reporting Window {timer.expired ? 'Expired' : '(OPEN)'}
                                        </p>
                                        {!timer.expired && (
                                            <span className="font-mono font-black text-lg text-white">{timer.diffText}</span>
                                        )}
                                    </div>
                                    <p className={`text-xs font-medium leading-relaxed ${timer.expired ? 'text-gray-500' : 'text-emerald-100'}`}>
                                        {timer.expired 
                                            ? "The Standard Reporting Window for this order has expired. For urgent inquiries, please contact your PZ Representative Alex directly."
                                            : "Please verify all items against the physical manifest. You have 90 minutes from the confirmed delivery time to report any discrepancies via the portal."}
                                    </p>
                                    {!timer.expired && (
                                        <button 
                                            onClick={() => onReportIssue(order)}
                                            className="mt-6 px-8 py-3 bg-white text-[#043003] rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-emerald-50 transition-all active:scale-95"
                                        >
                                            Start Verification Process
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-8 border-t border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Platform Zero Official Trade Manifest</p>
                    <button onClick={onClose} className="px-10 py-3.5 bg-white border-2 border-gray-100 text-gray-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-100 transition-all active:scale-95 shadow-sm">Close</button>
                </div>
            </div>
        </div>
    );
};

export const CustomerOrders: React.FC<CustomerOrdersProps> = ({ user }) => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedOrderForManifest, setSelectedOrderForManifest] = useState<Order | null>(null);
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);
  const [issueModalOpen, setIssueModalOpen] = useState(false);

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 5000); 
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
      // Handle deep linking from dashboard verification button
      if (location.state?.openVerificationId) {
          const target = orders.find(o => o.id === location.state.openVerificationId);
          if (target) {
              setSelectedOrderForManifest(target);
              setIsVerificationOpen(true);
          }
      }
  }, [location.state, orders]);

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

  const handleReportIssue = (order: Order) => {
      setSelectedOrderForManifest(order);
      setIsVerificationOpen(true);
  };

  const handleSubmitIssue = (orderId: string, issueData: any) => {
      mockService.submitOrderIssue(orderId, issueData);
      loadOrders();
      setIsVerificationOpen(false);
      setSelectedOrderForManifest(null);
      setIssueModalOpen(true); // Open support chat to confirm
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
                                
                                <div className="p-4 rounded-2xl bg-gray-50 text-gray-300 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all shadow-sm">
                                    <ChevronRight size={24} strokeWidth={3}/>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })
        )}
      </div>

      <OrderManifestModal 
        isOpen={!!selectedOrderForManifest && !isVerificationOpen}
        onClose={() => setSelectedOrderForManifest(null)}
        order={selectedOrderForManifest}
        products={products}
        onReportIssue={handleReportIssue}
      />

      <DeliveryVerificationModal 
        isOpen={isVerificationOpen}
        onClose={() => setIsVerificationOpen(false)}
        order={selectedOrderForManifest}
        products={products}
        onSubmitIssue={handleSubmitIssue}
      />

      {issueModalOpen && (
          <ChatDialog 
              isOpen={issueModalOpen}
              onClose={() => setIssueModalOpen(false)}
              orderId="RECENT"
              issueType="Produce Quality"
              repName="Alex Johnson (Admin Support)"
          />
      )}
    </div>
  );
};
