
import React, { useState, useEffect } from 'react';
import { mockService } from '../services/mockDataService';
import { Order, OrderIssue, Customer, User, UserRole, Product } from '../types';
import { 
  ShoppingCart, Package, Truck, CheckCircle, Clock, 
  Store, ChevronRight, Activity, 
  ArrowRight, ShieldCheck, Gavel, FileWarning,
  PackageCheck,
  History,
  X,
  MapPin,
  DollarSign
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-2">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-indigo-400 font-black text-[10px] uppercase tracking-widest">
                                <Store size={14}/> Sourcing Anchor
                            </div>
                            <div className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
                                <p className="font-black text-gray-900 uppercase text-sm">{seller?.businessName}</p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Market Hub</p>
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

                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-2">
                                <Package size={14}/> Product Itemization
                            </h3>
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
                                                <p className="font-black text-gray-900 text-base uppercase tracking-tight leading-none">{p?.name || 'Item'}</p>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">{p?.variety}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-black text-gray-900 text-xl tracking-tighter leading-none">{item.quantityKg}{p?.unit || 'KG'}</p>
                                            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-1.5">${item.pricePerKg.toFixed(2)} / u</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

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

                <div className="p-8 border-t border-gray-100 bg-gray-50 flex gap-4 shrink-0">
                    <button onClick={onClose} className="flex-1 py-5 bg-white border-2 border-gray-200 text-gray-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:border-gray-900 hover:text-gray-900 transition-all active:scale-95 shadow-sm">
                        Close Manifest
                    </button>
                </div>
            </div>
        </div>
    );
};

export const AdminMarketOps: React.FC = () => {
  const [mobileTab, setMobileTab] = useState<'FLOW' | 'DISPUTES'>('FLOW');
  const [orders, setOrders] = useState<Order[]>([]);
  const [issues, setIssues] = useState<OrderIssue[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    const load = () => {
        setOrders(mockService.getOrders('u1'));
        setIssues(mockService.getTodayIssues());
        setCustomers(mockService.getCustomers());
        setUsers(mockService.getAllUsers());
        setAllProducts(mockService.getAllProducts());
    };
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);

  const transitOrders = orders.filter(o => ['Pending', 'Confirmed', 'Ready for Delivery', 'Shipped'].includes(o.status));
  const deliveredOrders = orders.filter(o => o.status === 'Delivered');

  const getWholesalerName = (id: string) => users.find(u => u.id === id)?.businessName || 'Partner';
  const getBuyerName = (id: string) => customers.find(c => c.id === id)?.businessName || 'Buyer';

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] -mt-4 animate-in fade-in duration-500">
      <div className="lg:hidden sticky top-0 z-[60] bg-[#F8FAFC]/90 backdrop-blur-md px-6 py-4 border-b border-gray-100 mb-4">
        <div className="bg-gray-100 p-1 rounded-2xl flex gap-1 shadow-inner-sm">
            <button onClick={() => setMobileTab('FLOW')} className={`flex-1 py-3.5 rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${mobileTab === 'FLOW' ? 'bg-white text-gray-900 shadow-md ring-1 ring-black/5' : 'text-gray-400'}`}>
                <Activity size={16}/> Market Flow
            </button>
            <button onClick={() => setMobileTab('DISPUTES')} className={`flex-1 py-3.5 rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${mobileTab === 'DISPUTES' ? 'bg-white text-gray-900 shadow-md ring-1 ring-black/5' : 'text-gray-400'}`}>
                <FileWarning size={16}/> Disputes {issues.length > 0 && <span className="bg-red-50 text-white w-5 h-5 rounded-full flex items-center justify-center text-[9px]">{issues.length}</span>}
            </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden gap-8">
        <div className={`${mobileTab !== 'FLOW' ? 'hidden lg:flex' : 'flex'} flex-1 bg-white lg:rounded-[2.5rem] border-x lg:border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full`}>
            <div className="p-6 md:p-8 border-b border-gray-100 bg-gray-50/50 shrink-0">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight uppercase leading-none">Live Transactions</h2>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1.5">Marketplace Movement Feed</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 custom-scrollbar bg-gray-50/30">
                {orders.map(order => (
                    <div key={order.id} onClick={() => setSelectedOrder(order)} className="bg-white p-5 md:p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group cursor-pointer active:scale-[0.99]">
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
                            <div className="text-right">
                                <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest">Amount</p>
                                <p className="font-black text-gray-900 text-xl tracking-tighter leading-none">${order.totalAmount.toFixed(2)}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        <div className={`${mobileTab !== 'DISPUTES' ? 'hidden lg:flex' : 'flex'} w-full lg:w-[480px] bg-white lg:rounded-[2.5rem] border-x lg:border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full`}>
            <div className="p-8 border-b border-gray-100 bg-[#131926] text-white shrink-0 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-5 transform rotate-12 scale-150"><Gavel size={120} /></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-5 mb-2">
                        <div className="w-12 h-12 bg-red-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-red-500/30 border border-white/10 shrink-0"><FileWarning size={28} className="text-white" /></div>
                        <h2 className="text-2xl font-black uppercase tracking-tight leading-none">Market Quality<br/>Disputes</h2>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50 custom-scrollbar">
                {issues.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-30 text-center py-32 grayscale">
                        <ShieldCheck size={56} className="text-gray-300 mb-4" />
                        <p className="text-sm font-black uppercase tracking-widest">All orders verified & settled</p>
                    </div>
                ) : issues.map(issue => (
                    <div key={issue.id} className="bg-white rounded-[2.5rem] border-2 border-red-50/50 p-7 md:p-8 shadow-sm hover:shadow-2xl transition-all">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <span className="text-[10px] font-black bg-red-50 text-red-500 px-4 py-1.5 rounded-xl uppercase tracking-widest border border-red-100">Produce Dispute</span>
                                <h3 className="font-black text-gray-900 text-2xl uppercase tracking-tighter mt-4 leading-none">{getBuyerName(orders.find(o => o.id === issue.orderId)?.buyerId || '')}</h3>
                            </div>
                        </div>
                        <p className="text-red-900 font-bold text-[15px] italic leading-relaxed">{`"${issue.description}"`}</p>
                    </div>
                ))}
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

const Activity = ({ size = 24, ...props }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
);
