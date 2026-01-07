
import React, { useState, useEffect } from 'react';
import { mockService } from '../services/mockDataService';
import { Order, OrderIssue, Customer, User, UserRole, Product } from '../types';
import { triggerNativeSms } from '../services/smsService';
import { 
  ShoppingCart, Package, Truck, CheckCircle, Clock, AlertCircle, 
  MessageSquare, User as UserIcon, Store, ChevronRight, Activity, 
  ArrowRight, ShieldCheck, Timer, Gavel, Eye, AlertTriangle, Loader2,
  Check,
  PackageCheck,
  FileWarning,
  UserCheck,
  History,
  X,
  MapPin,
  Calendar,
  DollarSign,
  Smartphone,
  Bell,
  UserPlus
} from 'lucide-react';

const LiveOrderDetailsModal = ({ isOpen, onClose, order, products, users, customers }: { 
  isOpen: boolean, 
  onClose: () => void, 
  order: Order | null, 
  products: Product[],
  users: User[],
  customers: Customer[]
}) => {
    if (!isOpen || !order) return null;

    const buyer = customers.find(c => c.id === order.buyerId);
    const seller = users.find(u => u.id === order.sellerId);

    return (
        <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[3.5rem] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 border border-gray-100 max-h-[90vh]">
                
                {/* Header Section */}
                <div className="p-8 md:p-10 border-b border-gray-100 flex justify-between items-center bg-white shrink-0">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-[#0B1221] rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl">
                            {buyer?.businessName ? buyer.businessName.charAt(0) : 'B'}
                        </div>
                        <div>
                            <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tighter uppercase leading-none">{buyer?.businessName}</h2>
                            <p className="text-[10px] text-indigo-600 font-black uppercase tracking-[0.25em] mt-2 flex items-center gap-2">
                                <Activity size={12}/> Live Transaction Manifest
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-300 hover:text-gray-900 p-2 bg-gray-50 rounded-full border border-gray-100 shadow-sm transition-all active:scale-90">
                        <X size={28}/>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 md:p-10 space-y-10 no-scrollbar bg-white">
                    
                    {/* Status & ID Banner */}
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50 rounded-[2rem] p-6 border border-gray-100">
                        <div>
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Trade Reference</p>
                            <p className="text-xl font-mono font-black text-indigo-600 uppercase tracking-tighter">PZ-ORD-{order.id.split('-').pop()}</p>
                        </div>
                        <div className="text-right">
                             <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 text-center sm:text-right">Shipment Status</p>
                             <span className="bg-emerald-50 text-emerald-600 px-5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-100 shadow-sm">{order.status.toUpperCase()}</span>
                        </div>
                    </div>

                    {/* Partner Metadata */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-2">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-indigo-400 font-black text-[10px] uppercase tracking-widest">
                                <Store size={14}/> Sourcing Anchor
                            </div>
                            <div className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
                                <p className="font-black text-gray-900 uppercase text-sm">{seller?.businessName}</p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Market: Pooraka Produce Hub</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-indigo-400 font-black text-[10px] uppercase tracking-widest">
                                <Truck size={14}/> Logistics Detail
                            </div>
                            <div className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
                                <p className="font-black text-gray-900 uppercase text-sm">{order.logistics?.driverName || 'PZ Internal Fleet'}</p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 flex items-center gap-1.5">
                                    <MapPin size={10}/> {order.logistics?.deliveryLocation || 'Buyer Destination'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Itemized Table */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-2">
                                <Package size={14}/> Product Itemization
                            </h3>
                            <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{order.items.length} Varieties</span>
                        </div>
                        <div className="divide-y divide-gray-50 border border-gray-100 rounded-[2.5rem] overflow-hidden bg-white shadow-inner-sm">
                            {order.items.map((item, idx) => {
                                const p = products.find(prod => prod.id === item.productId);
                                return (
                                    <div key={idx} className="p-6 flex items-center justify-between hover:bg-gray-50/50 transition-all">
                                        <div className="flex items-center gap-5">
                                            <div className="w-14 h-14 rounded-2xl overflow-hidden border border-gray-100 shadow-sm bg-gray-50 shrink-0">
                                                <img src={p?.imageUrl} className="w-full h-full object-cover" alt="" />
                                            </div>
                                            <div>
                                                <p className="font-black text-gray-900 text-base uppercase tracking-tight leading-none">{p?.name || 'Unknown Item'}</p>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">{p?.variety || 'Standard Grading'}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-black text-gray-900 text-xl tracking-tighter leading-none">{item.quantityKg}{p?.unit || 'KG'}</p>
                                            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-1.5">${item.pricePerKg.toFixed(2)} / unit</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Financial Summary */}
                    <div className="pt-2 px-2">
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Trade Settlement Value</p>
                                <h3 className="text-6xl font-black text-gray-900 tracking-tighter">${order.totalAmount.toFixed(2)}</h3>
                            </div>
                            <div className="bg-indigo-50 p-4 rounded-2xl text-indigo-600 shadow-inner-sm border border-indigo-100 hidden sm:block">
                                <DollarSign size={24} strokeWidth={2.5}/>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-8 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row gap-4 shrink-0">
                    <button onClick={onClose} className="flex-1 py-5 bg-white border-2 border-gray-200 text-gray-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:border-gray-900 hover:text-gray-900 transition-all active:scale-95 shadow-sm">
                        Close Manifest
                    </button>
                    <button className="flex-[1.5] py-5 bg-[#0B1221] text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-black transition-all flex items-center justify-center gap-3 group active:scale-[0.98]">
                        <History size={18}/> View Full Audit Trail
                    </button>
                </div>
            </div>
        </div>
    );
};

export const AdminMarketOps: React.FC = () => {
  const [mobileTab, setMobileTab] = useState<'FLOW' | 'DISPUTES'>('FLOW');
  const [flowSubTab, setFlowSubTab] = useState<'TRANSIT' | 'DELIVERED'>('TRANSIT');
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [issues, setIssues] = useState<OrderIssue[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [now, setNow] = useState(new Date());
  
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isAlerting, setIsAlerting] = useState<string | null>(null);
  const [alertSelectorId, setAlertSelectorId] = useState<string | null>(null);

  useEffect(() => {
    const load = () => {
        setOrders(mockService.getOrders('u1'));
        setIssues(mockService.getTodayIssues());
        setCustomers(mockService.getCustomers());
        setUsers(mockService.getAllUsers());
        setAllProducts(mockService.getAllProducts());
    };
    load();
    const dataInterval = setInterval(load, 5000);
    const timeInterval = setInterval(() => setNow(new Date()), 1000);
    return () => {
        clearInterval(dataInterval);
        clearInterval(timeInterval);
    };
  }, []);

  const transitOrders = orders.filter(o => ['Pending', 'Confirmed', 'Ready for Delivery', 'Shipped'].includes(o.status));
  const deliveredOrders = orders.filter(o => o.status === 'Delivered');

  const getWholesalerName = (id: string) => users.find(u => u.id === id)?.businessName || 'PZ Partner';
  const getBuyerName = (id: string) => customers.find(c => c.id === id)?.businessName || 'Guest';

  const handleAlertStakeholders = async (issue: OrderIssue, target: 'REP' | 'WHOLESALER' | 'BOTH') => {
    const order = orders.find(o => o.id === issue.orderId);
    if (!order) return;

    const rep = users.find(u => u.id === issue.assignedRepId);
    const wholesaler = users.find(u => u.id === order.sellerId);
    const buyer = customers.find(c => c.id === order.buyerId);

    setIsAlerting(issue.id);
    setAlertSelectorId(null);

    const message = 'PZ PRIORITY ALERT: Urgent Dispute for ' + (buyer?.businessName || 'Client') + ' (Order #' + (order.id.split('-').pop() || 'N/A') + '). Issue: ' + issue.type + '. This report is currently UNSEEN. Action required immediately.';

    if (target === 'REP' || target === 'BOTH') {
        if (rep?.phone) triggerNativeSms(rep.phone, message);
    }
    
    if (target === 'WHOLESALER' || target === 'BOTH') {
        if (wholesaler?.phone) triggerNativeSms(wholesaler.phone, message);
    }

    await new Promise(r => setTimeout(r, 1000));
    setIsAlerting(null);
    const targetLabel = target === 'BOTH' ? 'Representative and Wholesaler' : (target === 'REP' ? 'Representative' : 'Wholesaler');
    alert('Priority Alert Dispatched to ' + targetLabel + ' via SMS.');
  };

  const getCountdown = (deliveredAt: string | undefined) => {
    if (!deliveredAt) return "00:00:00";
    const deliveredTime = new Date(deliveredAt).getTime();
    const expiryTime = deliveredTime + (90 * 60 * 1000);
    const diff = expiryTime - now.getTime();
    
    if (diff <= 0) return "PROCESSED";
    
    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);
    
    return h.toString().padStart(2, '0') + ':' + m.toString().padStart(2, '0') + ':' + s.toString().padStart(2, '0');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] -mt-4 animate-in fade-in duration-500">
      
      {/* MOBILE MAIN TAB SWITCHER */}
      <div className="lg:hidden sticky top-0 z-[60] bg-[#F8FAFC]/90 backdrop-blur-md px-6 py-4 border-b border-gray-100 mb-4">
        <div className="bg-gray-100 p-1 rounded-2xl flex gap-1 shadow-inner-sm">
            <button 
                onClick={() => setMobileTab('FLOW')}
                className={'flex-1 py-3.5 rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ' + (mobileTab === 'FLOW' ? 'bg-white text-gray-900 shadow-md ring-1 ring-black/5' : 'text-gray-400')}
            >
                <Activity size={16}/> Market Flow
            </button>
            <button 
                onClick={() => setMobileTab('DISPUTES')}
                className={'flex-1 py-3.5 rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ' + (mobileTab === 'DISPUTES' ? 'bg-white text-gray-900 shadow-md ring-1 ring-black/5' : 'text-gray-400')}
            >
                <FileWarning size={16}/> Disputes {issues.length > 0 && <span className="bg-red-50 text-white w-5 h-5 rounded-full flex items-center justify-center text-[9px]">{issues.length}</span>}
            </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden gap-8">
        
        {/* LEFT SIDE: LIVE TRANSACTIONS */}
        <div className={(mobileTab !== 'FLOW' ? 'hidden lg:flex' : 'flex') + ' flex-1 bg-white lg:rounded-[2.5rem] border-x lg:border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full'}>
            <div className="p-6 md:p-8 border-b border-gray-100 bg-gray-50/50 shrink-0">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight uppercase leading-none">Live Transactions</h2>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1.5">Marketplace Movement Feed</p>
                    </div>
                    <div className="bg-indigo-600 text-white px-4 py-1.5 rounded-full flex items-center gap-2 shadow-lg shadow-indigo-100">
                        <Activity size={14} className="animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Market Flow</span>
                    </div>
                </div>

                <div className="flex bg-gray-100 p-1.5 rounded-2xl gap-1 border border-gray-200 shadow-inner-sm">
                    <button 
                        onClick={() => setFlowSubTab('TRANSIT')}
                        className={'flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ' + (flowSubTab === 'TRANSIT' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600')}
                    >
                        <Truck size={14}/> Transit ({transitOrders.length})
                    </button>
                    <button 
                        onClick={() => setFlowSubTab('DELIVERED')}
                        className={'flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ' + (flowSubTab === 'DELIVERED' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600')}
                    >
                        <PackageCheck size={14}/> Verification ({deliveredOrders.length})
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 custom-scrollbar bg-gray-50/30">
                {(flowSubTab === 'TRANSIT' ? transitOrders : deliveredOrders).length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-30 text-center py-20">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 border border-gray-200">
                            <ShoppingCart size={32} className="text-gray-300" />
                        </div>
                        <p className="text-xs font-black uppercase tracking-widest">No active shipments in this category</p>
                    </div>
                ) : (flowSubTab === 'TRANSIT' ? transitOrders : deliveredOrders).map(order => (
                    <div 
                        key={order.id} 
                        onClick={() => setSelectedOrder(order)}
                        className="bg-white p-5 md:p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group cursor-pointer active:scale-[0.99]"
                    >
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div className="flex items-center gap-5 flex-1 w-full">
                                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 font-black text-xl shadow-inner-sm uppercase border border-gray-100 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-100 transition-all shrink-0">
                                    {getBuyerName(order.buyerId).charAt(0)}
                                </div>
                                <div className="min-w-0">
                                    <h4 className="font-black text-gray-900 text-base uppercase tracking-tight leading-none mb-2 truncate">{getBuyerName(order.buyerId)}</h4>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-1 shrink-0"><Store size={10}/> {getWholesalerName(order.sellerId)}</span>
                                        <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">• REF: #{order.id.split('-').pop()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end border-t border-gray-50 md:border-0 pt-4 md:pt-0">
                                {flowSubTab === 'DELIVERED' ? (
                                    <div className="text-right">
                                        <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest mb-1">Pre-Invoice Lock</p>
                                        <div className={'flex items-center gap-2 font-black text-base md:text-lg font-mono ' + (getCountdown(order.deliveredAt) === 'PROCESSED' ? 'text-gray-400' : 'text-emerald-600')}>
                                            <Timer size={16} className={getCountdown(order.deliveredAt) !== 'PROCESSED' ? "animate-pulse" : ""}/> {getCountdown(order.deliveredAt)}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-right">
                                        <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest mb-1">Fulfillment</p>
                                        <div className={'px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border shadow-sm ' + (
                                            order.status === 'Shipped' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                            order.status === 'Ready for Delivery' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                                            'bg-orange-50 text-orange-700 border-orange-100'
                                        )}>
                                            {order.status}
                                        </div>
                                    </div>
                                )}
                                
                                <div className="text-right">
                                    <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest">Amount</p>
                                    <p className="font-black text-gray-900 text-xl tracking-tighter leading-none">${order.totalAmount.toFixed(2)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* RIGHT SIDE: ISSUE RESOLUTION CENTER */}
        <div className={(mobileTab !== 'DISPUTES' ? 'hidden lg:flex' : 'flex') + ' w-full lg:w-[480px] bg-white lg:rounded-[2.5rem] border-x lg:border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full'}>
            <div className="p-8 border-b border-gray-100 bg-[#131926] text-white shrink-0 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-5 transform rotate-12 scale-150"><Gavel size={120} /></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-5 mb-2">
                        <div className="w-12 h-12 bg-red-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-red-500/30 border border-white/10 shrink-0"><FileWarning size={28} className="text-white" /></div>
                        <h2 className="text-2xl font-black uppercase tracking-tight leading-none">Market Quality<br/>Disputes</h2>
                    </div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em] mt-3">Active Produce & Delivery Reports</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50 custom-scrollbar">
                {issues.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-30 text-center py-32 grayscale">
                        <ShieldCheck size={56} className="text-gray-300 mb-4" />
                        <p className="text-sm font-black uppercase tracking-widest">All orders verified & settled</p>
                    </div>
                ) : issues.map(issue => {
                    const rep = users.find(u => u.id === issue.assignedRepId);
                    const isSelectingAlert = alertSelectorId === issue.id;

                    return (
                    <div key={issue.id} className="bg-white rounded-[2.5rem] border-2 border-red-50/50 p-7 md:p-8 shadow-sm hover:shadow-2xl hover:border-red-100 transition-all animate-in slide-in-from-right-4 duration-500 overflow-hidden relative group">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <span className="text-[10px] font-black bg-red-50 text-red-500 px-4 py-1.5 rounded-xl uppercase tracking-widest border border-red-100 shadow-inner-sm">Produce Dispute</span>
                                <h3 className="font-black text-gray-900 text-2xl uppercase tracking-tighter mt-4 leading-none">{getBuyerName(orders.find(o => o.id === issue.orderId)?.buyerId || '')}</h3>
                            </div>
                            <div className="text-right">
                                 <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Reported</p>
                                 <p className="text-lg font-black text-gray-900 tracking-tighter leading-none">{new Date(issue.reportedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false})}</p>
                            </div>
                        </div>

                        <div className="bg-red-50/20 p-6 rounded-3xl border border-red-50 mb-8">
                            <p className="text-red-900 font-bold text-[15px] italic leading-relaxed">{'"' + issue.description + '"'}</p>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between px-1">
                                    <div className="flex items-center gap-2">
                                         <Store size={18} className="text-indigo-400"/>
                                         <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Supplier Response</p>
                                    </div>
                                    <span className={'text-[9px] font-black uppercase px-3 py-1 rounded-lg border shadow-inner-sm ' + (
                                        issue.supplierStatus === 'PENDING' ? 'bg-orange-50 text-orange-600 border-orange-100' : 
                                        'bg-emerald-50 text-emerald-700 border-emerald-100'
                                    )}>
                                        {issue.supplierStatus}
                                    </span>
                                </div>
                                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 flex items-center justify-between">
                                    {issue.supplierStatus === 'PENDING' ? (
                                        <div className="flex items-center gap-3 text-gray-400 italic text-sm">
                                            <Loader2 size={16} className="animate-spin" /> Awaiting Partner Action
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3">
                                            <div className="p-2.5 bg-white rounded-xl shadow-sm border border-gray-100 text-emerald-600"><CheckCircle size={18} /></div>
                                            <div>
                                                <p className="text-[11px] font-black text-gray-900 uppercase">Action: {issue.supplierAction}</p>
                                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Resolved within SLA</p>
                                            </div>
                                        </div>
                                    )}
                                    <button className="p-3 bg-white rounded-xl shadow-sm border border-gray-100 text-gray-300 hover:text-indigo-600 transition-all hover:shadow-md active:scale-95"><MessageSquare size={20}/></button>
                                </div>
                            </div>

                            <div className="pt-2">
                                <div className="flex justify-between items-center px-1 mb-3">
                                     <div className="flex flex-col">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Escalation Status</p>
                                        <p className={'text-[9px] font-black mt-1 uppercase ' + (issue.repStatus === 'UNSEEN' ? 'text-red-500 animate-pulse' : 'text-indigo-500')}>
                                            {issue.repStatus === 'UNSEEN' ? 'Awaiting Rep Verification' : 
                                             issue.repStatus === 'ACTIONING' ? 'Investigation by ' + (rep?.name || 'Agent') : 'Case Closed'}
                                        </p>
                                     </div>
                                     <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Mediation Layer</p>
                                </div>
                                <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden mb-6">
                                    <div className={'h-full transition-all duration-1000 ' + (issue.repStatus === 'RESOLVED' ? 'bg-emerald-500' : 'bg-indigo-500')} style={{width: issue.repStatus === 'UNSEEN' ? '20%' : issue.repStatus === 'ACTIONING' ? '65%' : '100%'}}></div>
                                </div>

                                {issue.repStatus === 'UNSEEN' && !isSelectingAlert && (
                                    <button 
                                        onClick={() => setAlertSelectorId(issue.id)}
                                        disabled={isAlerting === issue.id}
                                        className="w-full py-4 bg-[#F43F5E] text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-red-100 hover:bg-[#E11D48] transition-all flex items-center justify-center gap-3 active:scale-[0.98] animate-in zoom-in duration-300"
                                    >
                                        {isAlerting === issue.id ? (
                                            <Loader2 size={18} className="animate-spin" />
                                        ) : (
                                            <><Smartphone size={18}/> Priority Alert Stakeholders</>
                                        )}
                                    </button>
                                )}

                                {isSelectingAlert && (
                                    <div className="space-y-2 animate-in slide-in-from-top-4 duration-300">
                                        <div className="grid grid-cols-2 gap-2">
                                            <button 
                                                onClick={() => handleAlertStakeholders(issue, 'REP')}
                                                className="py-3 bg-white border border-red-200 text-red-500 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                                            >
                                                <UserPlus size={14}/> Alert Rep
                                            </button>
                                            <button 
                                                onClick={() => handleAlertStakeholders(issue, 'WHOLESALER')}
                                                className="py-3 bg-white border border-red-200 text-red-500 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                                            >
                                                <Store size={14}/> Alert Seller
                                            </button>
                                        </div>
                                        <button 
                                            onClick={() => handleAlertStakeholders(issue, 'BOTH')}
                                            className="w-full py-4 bg-[#F43F5E] text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-red-600 transition-all flex items-center justify-center gap-2"
                                        >
                                            <Smartphone size={16}/> Alert Both Stakeholders
                                        </button>
                                        <button 
                                            onClick={() => setAlertSelectorId(null)}
                                            className="w-full py-2 text-gray-400 font-black text-[8px] uppercase tracking-widest hover:text-gray-900 transition-all"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )})}
            </div>

            <div className="p-6 md:p-8 border-t border-gray-100 bg-white sticky bottom-0 z-20">
                 <button className="w-full py-5 bg-white border-4 border-dashed border-gray-100 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.25em] text-gray-400 hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all flex items-center justify-center gap-3 group shadow-inner-sm">
                    <AlertTriangle size={20} className="group-hover:animate-shake"/> Open HQ Arbitration
                 </button>
            </div>
        </div>
      </div>

      <LiveOrderDetailsModal 
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        order={selectedOrder}
        products={allProducts}
        users={users}
        customers={customers}
      />
    </div>
  );
};

const TrendingUp = ({ size = 24, ...props }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
);
