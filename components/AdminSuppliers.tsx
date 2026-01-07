
import React, { useState, useEffect, useRef } from 'react';
import { User, UserRole, Order } from '../types';
import { mockService } from '../services/mockDataService';
import { ManualProvisionModal } from './ManualProvisionModal';
import { DispatchCodeModal } from './AdminDashboard';
import { 
  Store, Search, Plus, MoreVertical, MapPin, Phone, Mail, 
  ChevronRight, ArrowRight, TrendingUp, CheckCircle, Clock, 
  X, Building, Link as LinkIcon, Copy, Filter, Star, Truck, AlertTriangle,
  DollarSign,
  Eye,
  Trash2,
  Sprout
} from 'lucide-react';

export const AdminSuppliers: React.FC = () => {
  const [suppliers, setSuppliers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // New Provision Modal State
  const [isProvisionModalOpen, setIsProvisionModalOpen] = useState(false);
  const [provisionedCodeData, setProvisionedCodeData] = useState<{code: string, name: string} | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 5000);
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        clearInterval(interval);
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const refreshData = () => {
    const allUsers = mockService.getAllUsers();
    setSuppliers(allUsers.filter(u => u.role === UserRole.WHOLESALER || u.role === UserRole.FARMER));
    setOrders(mockService.getOrders('u1'));
  };

  const getSupplierStats = (supplierId: string) => {
    const supplierOrders = orders.filter(o => o.sellerId === supplierId);
    const delivered = supplierOrders.filter(o => o.status === 'Delivered').length;
    const rate = supplierOrders.length > 0 ? (delivered / supplierOrders.length) * 100 : 0;
    const volume = supplierOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    return { count: supplierOrders.length, rate, volume };
  };

  const handleDeleteSupplier = (id: string, name: string) => {
      if (confirm(`Permanently remove ${name} from the platform? This action cannot be undone.`)) {
          mockService.deleteUser(id);
          refreshData();
          setActiveMenuId(null);
      }
  };

  const handleManualGenerated = (code: string, name: string) => {
      setProvisionedCodeData({ code, name });
      refreshData();
  };

  const filteredSuppliers = suppliers.filter(s => 
    s.businessName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-2">
        <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Suppliers</h1>
            <p className="text-gray-500 font-medium">Manage network wholesalers and farmers and review fulfillment performance.</p>
        </div>
        <button 
            onClick={() => setIsProvisionModalOpen(true)}
            className="px-8 py-4 bg-[#043003] hover:bg-black text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl shadow-xl flex items-center justify-center gap-3 transition-all active:scale-95"
        >
            <Plus size={20}/> Add New Supplier
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-2">
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col group hover:shadow-md transition-all">
            <div className="flex items-center gap-3 text-emerald-600 mb-4">
                <Truck size={24}/>
                <span className="text-[10px] font-black uppercase tracking-widest">Active Partners</span>
            </div>
            <div className="text-4xl font-black text-gray-900 tracking-tighter">{suppliers.length}</div>
            <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-widest">Farmers & Wholesalers combined</p>
        </div>
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col group hover:shadow-md transition-all">
            <div className="flex items-center gap-3 text-blue-600 mb-4">
                <CheckCircle size={24}/>
                <span className="text-[10px] font-black uppercase tracking-widest">Avg fulfillment Rate</span>
            </div>
            <div className="text-4xl font-black text-gray-900 tracking-tighter">94.2%</div>
            <p className="text-[10px] text-emerald-500 mt-2 font-black flex items-center gap-1 uppercase tracking-widest">
                <TrendingUp size={12}/> +2.1% from last month
            </p>
        </div>
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col group hover:shadow-md transition-all">
            <div className="flex items-center gap-3 text-indigo-600 mb-4">
                <DollarSign size={24}/>
                <span className="text-[10px] font-black uppercase tracking-widest">Partner GMV</span>
            </div>
            <div className="text-4xl font-black text-gray-900 tracking-tighter">${orders.reduce((sum, o) => sum + o.totalAmount, 0).toLocaleString()}</div>
            <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-widest">Total transaction volume processed</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-[2.5rem] shadow-sm overflow-visible mx-2">
        <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6 bg-gray-50/30">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-900 shadow-sm border border-gray-100">
                    <Store size={24}/>
                </div>
                <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Partner List</h2>
            </div>
            <div className="flex gap-4 w-full md:w-auto">
                <div className="relative flex-1 md:w-80 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-600 transition-colors" size={20} />
                    <input 
                        type="text" 
                        placeholder="Search partners..." 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-6 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm font-bold text-slate-900 focus:ring-4 focus:ring-indigo-50/5 outline-none transition-all" 
                    />
                </div>
                <button className="p-3.5 bg-white border border-gray-200 rounded-2xl hover:bg-gray-100 text-gray-400 transition-all shadow-sm">
                    <Filter size={20}/>
                </button>
            </div>
        </div>

        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead className="bg-white border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                    <tr>
                        <th className="px-8 py-7">Partner / Business</th>
                        <th className="px-8 py-7">Role</th>
                        <th className="px-8 py-7">Location</th>
                        <th className="px-8 py-7 text-center">Fulfillment</th>
                        <th className="px-8 py-7 text-center">Orders</th>
                        <th className="px-8 py-7 text-right">Volume</th>
                        <th className="px-8 py-7 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {filteredSuppliers.map(supplier => {
                        const stats = getSupplierStats(supplier.id);
                        return (
                            <tr key={supplier.id} className="hover:bg-gray-50/50 transition-colors group">
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm shadow-sm ${
                                            supplier.role === 'FARMER' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'
                                        }`}>
                                            {supplier.businessName.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-black text-gray-900 uppercase text-[15px] tracking-tight">{supplier.businessName}</div>
                                            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">{supplier.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border shadow-sm ${
                                        supplier.role === 'FARMER' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-blue-50 text-blue-700 border-blue-100'
                                    }`}>
                                        {supplier.role}
                                    </span>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-black uppercase tracking-widest">
                                        <MapPin size={12} className="text-gray-300"/> {supplier.businessProfile?.businessLocation || 'Australia'}
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex flex-col items-center">
                                        <span className={`text-xs font-black ${stats.rate > 90 ? 'text-emerald-600' : 'text-orange-600'}`}>{stats.rate.toFixed(1)}%</span>
                                        <div className="w-16 bg-gray-100 h-1 rounded-full mt-1.5 overflow-hidden">
                                            <div className={`h-full ${stats.rate > 90 ? 'bg-emerald-500' : 'bg-orange-500'}`} style={{width: `${stats.rate}%`}}></div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-center font-black text-gray-900 text-sm">{stats.count}</td>
                                <td className="px-8 py-6 text-right font-black text-emerald-600 text-base tracking-tighter">${stats.volume.toLocaleString()}</td>
                                <td className="px-8 py-6 text-right relative">
                                    <button onClick={() => setActiveMenuId(activeMenuId === supplier.id ? null : supplier.id)} className="p-3 rounded-xl hover:bg-white hover:shadow-md hover:border-gray-100 border border-transparent text-gray-300 transition-all active:scale-95">
                                        <MoreVertical size={22}/>
                                    </button>
                                    {activeMenuId === supplier.id && (
                                        <div ref={menuRef} className="absolute right-8 top-12 w-60 bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-gray-100 z-50 animate-in fade-in zoom-in-95 duration-150 origin-top-right overflow-hidden py-2">
                                            <button className="w-full text-left px-6 py-4 text-[11px] font-black uppercase tracking-widest text-gray-700 hover:bg-gray-50 flex items-center gap-4"><Eye size={18} className="text-gray-300"/> View Dashboard</button>
                                            <button className="w-full text-left px-6 py-4 text-[11px] font-black uppercase tracking-widest text-gray-700 hover:bg-gray-50 flex items-center gap-4"><TrendingUp size={18} className="text-indigo-600"/> Performance</button>
                                            <button className="w-full text-left px-6 py-4 text-[11px] font-black uppercase tracking-widest text-gray-700 hover:bg-gray-50 flex items-center gap-4"><Clock size={18} className="text-orange-500"/> Order History</button>
                                            <div className="h-px bg-gray-50 mx-4 my-2"></div>
                                            <button 
                                                onClick={() => handleDeleteSupplier(supplier.id, supplier.businessName)}
                                                className="w-full text-left px-6 py-4 text-[11px] font-black uppercase tracking-widest text-red-600 hover:bg-red-50 flex items-center gap-4"
                                            >
                                                <Trash2 size={18}/> Remove Partner
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
      </div>

      {/* Manual Provision Modal */}
      <ManualProvisionModal 
        isOpen={isProvisionModalOpen} 
        onClose={() => setIsProvisionModalOpen(false)}
        onGenerated={handleManualGenerated}
      />

      {/* Success Modal */}
      <DispatchCodeModal 
        isOpen={!!provisionedCodeData}
        onClose={() => setProvisionedCodeData(null)}
        code={provisionedCodeData?.code || ''}
        businessName={provisionedCodeData?.name || ''}
      />
    </div>
  );
};
