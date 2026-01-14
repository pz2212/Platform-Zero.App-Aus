import React, { useState, useEffect } from 'react';
import { mockService } from '../services/mockDataService';
import { Order, OrderIssue, Customer, User, UserRole, Product } from '../types';
import { triggerNativeSms } from '../services/smsService';
import { 
  ShoppingCart, Package, Truck, CheckCircle, Clock, 
  Store, ChevronRight, Activity, 
  ArrowRight, ShieldCheck, Gavel, FileWarning,
  PackageCheck,
  History,
  X,
  MapPin,
  DollarSign,
  AlertTriangle,
  Smartphone,
  UserCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const DisputeDetailsModal = ({ isOpen, onClose, issue, order, products, users, customers }: { 
  isOpen: boolean, 
  onClose: () => void, 
  issue: OrderIssue | null,
  order: Order | null,
  products: Product[],
  users: User[],
  customers: Customer[]
}) => {
    if (!isOpen || !issue || !order) return null;

    const buyer = customers.find(c => c.id === order.buyerId);
    const supplier = users.find(u => u.id === order.sellerId);
    const rep = users.find(u => u.id === buyer?.assignedPzRepId);
    const product = products.find(p => p.id === issue.productId);

    const handleUrgentSms = (target: 'SUPPLIER' | 'REP') => {
        const person = target === 'SUPPLIER' ? supplier : rep;
        if (!person?.phone) {
            alert(`No mobile number on file for this ${target.toLowerCase()}.`);
            return;
        }

        const msg = `URGENT PZ ACTION REQUIRED: Dispute reported by ${buyer?.businessName} for ${product?.name || 'Produce'}. Manifest: #ORD-${order.id.split('-').pop()}. Please action immediately in your portal.`;
        triggerNativeSms(person.phone, msg);
    };

    return (
        <div className="fixed inset-0 z-[600] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[3.5rem] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 border border-gray-100 max-h-[90vh]">
                <div className="p-8 md:p-10 border-b border-gray-100 flex justify-between items-center bg-white shrink-0">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-red-500 rounded-2xl flex items-center justify-center text-white shadow-xl">
                            <FileWarning size={32} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter leading-none">Dispute Audit</h2>
                            <p className="text-[10px] text-red-600 font-black uppercase tracking-[0.25em] mt-2 flex items-center gap-2">
                                <Activity size={12}/> {buyer?.businessName}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-300 hover:text-gray-900 p-2 bg-gray-50 rounded-full border border-gray-100 shadow-sm transition-all active:scale-90">
                        <X size={28}/>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
                    <div className="bg-red-50 rounded-3xl p-8 border border-red-100">
                        <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-2">Issue Description</p>
                        <p className="text-xl font-black text-red-900 italic">"{issue.description}"</p>
                        {product && (
                            <div className="mt-6 flex items-center gap-4 bg-white p-4 rounded-2xl border border-red-100 shadow-sm">
                                <img src={product.imageUrl} className="w-12 h-12 rounded-xl object-cover" />
                                <div>
                                    <p className="font-black text-gray-900 uppercase text-xs">{product.name}</p>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{issue.type}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Supplier Section */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <Store size={14}/> Sourcing Supplier
                                </h3>
                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${issue.supplierStatus === 'PENDING' ? 'bg-orange-100 text-orange-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                    {issue.supplierStatus}
                                </span>
                            </div>
                            <div className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100">
                                <p className="font-black text-gray-900 uppercase text-sm mb-1">{supplier?.businessName}</p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase mb-6">{supplier?.name}</p>
                                {issue.supplierStatus === 'PENDING' && (
                                    <button 
                                        onClick={() => handleUrgentSms('SUPPLIER')}
                                        className="w-full py-4 bg-white border-2 border-orange-200 text-orange-600 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-orange-50 transition-all shadow-sm"
                                    >
                                        <Smartphone size={14}/> Urgent SMS Supplier
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Rep Section */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <UserCheck size={14}/> Sales Representative
                                </h3>
                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${issue.repStatus === 'UNSEEN' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                    {issue.repStatus}
                                </span>
                            </div>
                            <div className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100">
                                <p className="font-black text-gray-900 uppercase text-sm mb-1">{rep?.name || 'HQ Managed'}</p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase mb-6">Market Rep</p>
                                {issue.repStatus === 'UNSEEN' && rep && (
                                    <button 
                                        onClick={() => handleUrgentSms('REP')}
                                        className="w-full py-4 bg-[#131926] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-all shadow-xl"
                                    >
                                        <Smartphone size={14}/> Urgent SMS Rep
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-8 border-t border-gray-100 bg-gray-50 flex gap-4 shrink-0">
                    <button onClick={onClose} className="flex-1 py-5 bg-white border-2 border-gray-200 text-gray-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:border-gray-900 hover:text-gray-900 transition-all active:scale-95 shadow-sm">
                        Close Audit
                    </button>
                </div>
            </div>
        </div>
    );
};

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
                                // Corrected 'allProducts' to 'products' on line 220
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
