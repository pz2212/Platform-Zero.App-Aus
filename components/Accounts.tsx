import React, { useState, useEffect, useMemo } from 'react';
import { User, UserRole, Order, Product, Customer } from '../types';
import { mockService } from '../services/mockDataService';
import { 
  ArrowDownLeft, ArrowUpRight, FileText, Download, Filter, Search, 
  DollarSign, Calendar as CalendarIcon, ChevronLeft, ChevronRight, 
  Clock, Package, User as UserIcon, CreditCard, Banknote, ChevronDown,
  TrendingUp, ChevronUp, Wallet, ShieldCheck, CheckCircle2, AlertTriangle,
  ArrowRight, BarChart3, PieChart, LayoutDashboard, Plus, ShoppingCart
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface AccountsProps {
  user: User;
}

// Fix: Renamed ConsumerAccounts to Accounts and exported it to resolve the error in App.tsx (Module has no exported member 'Accounts')
export const Accounts: React.FC<AccountsProps> = ({ user }) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'invoices' | 'insights' | 'wallet'>('overview');
    const [orders, setOrders] = useState<Order[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    
    useEffect(() => {
        const fetch = () => {
            const userOrders = mockService.getOrders(user.id).filter(o => o.buyerId === user.id || o.sellerId === user.id);
            setOrders(userOrders);
            setProducts(mockService.getAllProducts());
        };
        fetch();
        const interval = setInterval(fetch, 5000);
        return () => clearInterval(interval);
    }, [user.id]);

    const outstandingBalance = useMemo(() => 
        orders.filter(o => o.paymentStatus !== 'Paid').reduce((sum, o) => sum + o.totalAmount, 0)
    , [orders]);

    const totalVolume = useMemo(() => 
        orders.reduce((sum, o) => sum + o.totalAmount, 0)
    , [orders]);

    const chartData = [
        { name: 'Jul', spend: 3200 },
        { name: 'Aug', spend: 2800 },
        { name: 'Sep', spend: 4500 },
        { name: 'Oct', spend: 3900 },
        { name: 'Nov', spend: 4100 },
        { name: 'Dec', spend: totalVolume > 5000 ? 5200 : totalVolume },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-2">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Financial Center</h1>
                    <p className="text-gray-500 font-medium mt-1">Manage billing, credits, and spending efficiency.</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <button className="flex-1 md:flex-none px-6 py-3 bg-white border border-gray-200 rounded-xl text-gray-400 font-black text-[10px] uppercase tracking-widest hover:text-indigo-600 transition-all flex items-center justify-center gap-2">
                        <Download size={16}/> Export Statement
                    </button>
                    <button className="flex-[1.5] md:flex-none px-8 py-3 bg-[#043003] text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg hover:bg-black transition-all">
                        Pay Balance
                    </button>
                </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-2">
                <div className="bg-[#0B1221] p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 transform rotate-12 scale-150 pointer-events-none group-hover:scale-[1.7] transition-transform duration-700"><DollarSign size={120}/></div>
                    <div className="relative z-10">
                        <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] mb-4">Total Payables</p>
                        <h3 className="text-5xl font-black tracking-tighter mb-4">${outstandingBalance.toLocaleString(undefined, {minimumFractionDigits: 2})}</h3>
                        <div className="flex items-center gap-2 text-emerald-400/80 text-[10px] font-black uppercase tracking-widest">
                            <Clock size={14}/> Next Payout: 12 Jan
                        </div>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-xl transition-all">
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4">Market Credit</p>
                        <h3 className="text-4xl font-black text-gray-900 tracking-tighter">$15,000<span className="text-lg text-gray-300 ml-1">/ limit</span></h3>
                    </div>
                    <div className="mt-8">
                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden mb-2">
                            <div className="h-full bg-indigo-600" style={{width: `${Math.min(100, (outstandingBalance / 15000) * 100)}%`}}></div>
                        </div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex justify-between">
                            <span>{((outstandingBalance / 15000) * 100).toFixed(0)}% Utilized</span>
                            <span className="text-indigo-600">${Math.max(0, 15000 - outstandingBalance).toLocaleString()} Available</span>
                        </p>
                    </div>
                </div>

                <div className="bg-emerald-600 p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden flex flex-col justify-between group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 transform -rotate-12 scale-150 pointer-events-none group-hover:rotate-0 transition-transform duration-700"><Wallet size={120}/></div>
                    <div>
                        <p className="text-[10px] font-black text-emerald-100 uppercase tracking-[0.3em] mb-4">PZ Credits</p>
                        <h3 className="text-4xl font-black tracking-tighter">$428.50</h3>
                    </div>
                    <button className="mt-8 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl font-black text-[9px] uppercase tracking-[0.2em] transition-all">
                        Earn More Credits
                    </button>
                </div>
            </div>

            {/* Main Tabs Container */}
            <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden flex flex-col min-h-[600px] mx-2">
                <div className="bg-gray-50/50 border-b border-gray-100 flex overflow-x-auto no-scrollbar whitespace-nowrap">
                    {[
                        { id: 'overview', label: 'Financial Overview', icon: LayoutDashboard },
                        { id: 'invoices', label: 'Invoices & Ledger', icon: FileText },
                        { id: 'insights', label: 'Spending Insights', icon: BarChart3 },
                        { id: 'wallet', label: 'Payment Settings', icon: CreditCard },
                    ].map((t) => (
                        <button
                            key={t.id} onClick={() => setActiveTab(t.id as any)}
                            className={`flex-1 min-w-[160px] py-6 px-4 text-center font-black text-[10px] uppercase tracking-[0.2em] transition-all border-b-4 shrink-0 flex items-center justify-center gap-3 ${
                                activeTab === t.id ? 'border-emerald-600 text-[#043003] bg-white shadow-inner-sm' : 'border-transparent text-gray-400 hover:text-gray-600'
                            }`}
                        >
                            <t.icon size={16}/> {t.label}
                        </button>
                    ))}
                </div>

                <div className="p-6 md:p-10 flex-1">
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="space-y-8">
                                <h4 className="text-xl font-black text-gray-900 uppercase tracking-tight flex items-center gap-3">
                                    <TrendingUp className="text-emerald-500" size={24}/> Transaction History
                                </h4>
                                <div className="space-y-4">
                                    {orders.slice(0, 8).map(order => (
                                        <div key={order.id} className="p-5 bg-gray-50/50 border border-gray-100 rounded-3xl flex items-center justify-between group hover:bg-white hover:shadow-lg transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 group-hover:text-indigo-600 transition-colors shadow-sm">
                                                    <ShoppingCart size={18}/>
                                                </div>
                                                <div>
                                                    <p className="font-black text-gray-900 uppercase text-xs tracking-tight">Order #{order.id.split('-').pop()}</p>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{new Date(order.date).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-black text-gray-900 text-sm tracking-tighter">${order.totalAmount.toFixed(2)}</p>
                                                <span className={`text-[8px] font-black uppercase tracking-[0.2em] ${order.paymentStatus === 'Paid' ? 'text-emerald-500' : 'text-orange-500'}`}>
                                                    {order.paymentStatus}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                    <button className="w-full py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-indigo-600 transition-colors">View All Transactions</button>
                                </div>
                            </div>

                            <div className="bg-gray-50/50 rounded-[2.5rem] p-8 border border-gray-100">
                                <h4 className="text-xl font-black text-gray-900 uppercase tracking-tight flex items-center gap-3 mb-8">
                                    <BarChart3 className="text-indigo-500" size={24}/> Volume Forecast
                                </h4>
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10, fontWeight: 800}} dy={10} />
                                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10}} />
                                            <Tooltip cursor={{fill: '#F1F5F9'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                                            <Bar dataKey="spend" radius={[8, 8, 0, 0]} barSize={40}>
                                                {chartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? '#10B981' : '#E2E8F0'} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {activeTab !== 'overview' && (
                        <div className="h-full flex flex-col items-center justify-center py-40 text-center text-gray-300 animate-in fade-in">
                            <Clock size={48} className="opacity-10 mb-4" />
                            <p className="font-black uppercase tracking-widest text-xs">Section under active refinement</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};