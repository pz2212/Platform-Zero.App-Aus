
import React, { useState, useEffect, useMemo } from 'react';
import { mockService } from '../services/mockDataService';
import { Customer, Order, User, UserRole } from '../types';
import { 
  Building, DollarSign, FileText, ChevronRight, X, 
  AlertTriangle, CheckCircle, Clock, ShieldAlert,
  ArrowRight, Landmark, Receipt, UserCheck, Search,
  ArrowUpRight, BarChart3, Calculator, Link as LinkIcon
} from 'lucide-react';

export const AdminAccounts: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  useEffect(() => {
    const load = () => {
      setCustomers(mockService.getCustomers());
      setAllOrders(mockService.getOrders('u1'));
      setAllUsers(mockService.getAllUsers());
    };
    load();
  }, []);

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => 
      c.businessName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [customers, searchTerm]);

  const selectedCustomer = useMemo(() => 
    customers.find(c => c.id === selectedCustomerId)
  , [customers, selectedCustomerId]);

  const customerStats = useMemo(() => {
    const stats: Record<string, any> = {};
    customers.forEach(c => {
      const orders = allOrders.filter(o => o.buyerId === c.id);
      const owe = orders.reduce((sum, o) => sum + (o.supplierCost || o.totalAmount * 0.8), 0);
      const made = orders.reduce((sum, o) => sum + o.totalAmount, 0);
      const markup = made - owe;
      
      let commissionPaid = 0;
      if (c.assignedPzRepId) {
        const rate = c.repCommissionRate || 5;
        commissionPaid = made * (rate / 100);
      }

      const totalProfit = markup - commissionPaid;
      const isRestricted = orders.some(o => o.paymentStatus === 'Overdue');
      
      stats[c.id] = { owe, made, commissionPaid, totalProfit, isRestricted, orders };
    });
    return stats;
  }, [customers, allOrders]);

  const currentStats = selectedCustomerId ? customerStats[selectedCustomerId] : null;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-2">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase leading-none">Accounts Ledger</h1>
          <p className="text-gray-400 font-bold mt-2 uppercase text-[9px] tracking-[0.25em]">Financial Audit & Oversight</p>
        </div>
        <div className="relative w-full sm:w-80 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-600 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search accounts..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-6 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm font-bold text-gray-900 outline-none focus:ring-4 focus:ring-indigo-50/50 transition-all shadow-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden min-h-[500px]">
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-gray-50/30 border-b border-gray-100 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">
                    <tr>
                        <th className="px-6 py-6">Account Entity</th>
                        <th className="px-6 py-6 text-center">Status</th>
                        <th className="px-6 py-6 text-right">What we owe</th>
                        <th className="px-6 py-6 text-right">What we made</th>
                        <th className="px-6 py-6 text-right">Total Profit</th>
                        <th className="px-6 py-6 text-right">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {filteredCustomers.map(customer => {
                        const s = customerStats[customer.id];
                        return (
                            <tr key={customer.id} className="hover:bg-gray-50/50 transition-all group">
                                <td className="px-6 py-5">
                                    <div className="font-black text-gray-900 text-base uppercase tracking-tight leading-tight mb-1">{customer.businessName}</div>
                                    <div className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Rep: {customer.assignedPzRepName || 'HQ'}</div>
                                </td>
                                <td className="px-6 py-5 text-center">
                                    {s.isRestricted ? (
                                        <span className="bg-red-50 text-red-600 px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border border-red-100 inline-flex items-center gap-1.5">
                                            <ShieldAlert size={12}/> restricted
                                        </span>
                                    ) : (
                                        <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border border-emerald-100 inline-flex items-center gap-1.5">
                                            <CheckCircle size={12}/> Healthy
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-5 text-right font-black text-gray-400 tracking-tighter text-sm">${s.owe.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                <td className="px-6 py-5 text-right font-black text-gray-900 tracking-tighter text-sm">${s.made.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                <td className="px-6 py-5 text-right font-black text-emerald-600 tracking-tighter text-lg">${s.totalProfit.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                <td className="px-6 py-5 text-right">
                                    <button 
                                        onClick={() => setSelectedCustomerId(customer.id)}
                                        className="p-2.5 bg-gray-50 border border-gray-100 rounded-xl text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all shadow-sm active:scale-95"
                                    >
                                        <ArrowRight size={18}/>
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
      </div>

      {selectedCustomerId && selectedCustomer && currentStats && (
          <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
              <div className="bg-[#F8FAFC] rounded-[2.5rem] shadow-2xl w-full max-w-5xl h-[85vh] overflow-hidden border border-gray-200 flex flex-col animate-in zoom-in-95 duration-300">
                  <div className="p-6 md:p-8 border-b border-gray-100 bg-white flex justify-between items-center shrink-0">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 border border-indigo-100">
                            <Building size={24}/>
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tighter leading-none">{selectedCustomer.businessName}</h2>
                            <div className="flex items-center gap-3 mt-1.5">
                                <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border ${currentStats.isRestricted ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                                    {currentStats.isRestricted ? 'Purchasing Blocked' : 'Trading Active'}
                                </span>
                                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{selectedCustomer.category}</span>
                            </div>
                        </div>
                      </div>
                      <button onClick={() => setSelectedCustomerId(null)} className="p-3 bg-gray-50 text-gray-400 hover:text-gray-900 rounded-full transition-all">
                          <X size={24}/>
                      </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar space-y-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: 'Owe (Suppliers)', value: currentStats.owe, color: 'text-gray-400' },
                            { label: 'Made (Gross)', value: currentStats.made, color: 'text-gray-900' },
                            { label: 'Commission', value: currentStats.commissionPaid, color: 'text-indigo-600' },
                            { label: 'Net Profit', value: currentStats.totalProfit, color: 'text-emerald-600', hero: true },
                        ].map((kpi, i) => (
                            <div key={i} className={`bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between ${kpi.hero ? 'ring-2 ring-emerald-50' : ''}`}>
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3">{kpi.label}</p>
                                <h3 className={`text-xl font-black ${kpi.color} tracking-tighter`}>${kpi.value.toLocaleString(undefined, {minimumFractionDigits: 2})}</h3>
                            </div>
                        ))}
                    </div>

                    {selectedCustomer.assignedPzRepId && (
                        <div className="bg-[#131926] p-8 rounded-[2rem] text-white relative overflow-hidden shadow-xl">
                            <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                                <div>
                                    <h4 className="text-lg font-black uppercase tracking-tight flex items-center gap-3">
                                        <div className="p-2 bg-indigo-500 rounded-lg"><UserCheck size={18}/></div>
                                        Lead Attribution
                                    </h4>
                                    <p className="text-slate-400 text-xs mt-2">Source: <span className="text-white font-bold">{selectedCustomer.assignedPzRepName}</span>.</p>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Commission Split</span>
                                        <span className="text-xl font-black text-indigo-400">{selectedCustomer.repCommissionRate}%</span>
                                    </div>
                                    <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                                        <div className="h-full bg-indigo-500" style={{width: `${(selectedCustomer.repCommissionRate || 0) * 10}%`}}></div>
                                    </div>
                                </div>
                                <div className="bg-white/5 border border-white/10 p-5 rounded-2xl flex justify-between items-center">
                                    <div>
                                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Vesting Period</p>
                                        <p className="text-sm font-black text-white">12/20 Orders Remaining</p>
                                    </div>
                                    <Clock size={20} className="text-indigo-400"/>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
                            <h3 className="text-base font-black text-gray-900 uppercase tracking-tight flex items-center gap-3">
                                <Receipt size={20} className="text-gray-400"/> Dual-Invoice Audit
                            </h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="text-[8px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4">Date</th>
                                        <th className="px-6 py-4">Ref</th>
                                        <th className="px-6 py-4">PZ Invoice</th>
                                        <th className="px-6 py-4">Vendor Bill</th>
                                        <th className="px-6 py-4 text-right">Profit Gap</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {currentStats.orders.map((o: Order) => {
                                        const supplierOwe = o.supplierCost || (o.totalAmount * 0.85);
                                        const profit = o.totalAmount - supplierOwe;
                                        const isSupplierDue = o.supplierInvoiceDue && new Date(o.supplierInvoiceDue) < new Date();

                                        return (
                                            <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-5 text-xs font-bold text-gray-500">{new Date(o.date).toLocaleDateString()}</td>
                                                <td className="px-6 py-5 font-mono font-black text-[10px] text-indigo-600 uppercase">#{o.id.split('-').pop()}</td>
                                                <td className="px-6 py-5">
                                                    <span className="text-[10px] font-black uppercase text-gray-600">PZ-INV-00{o.id.split('-').pop()}</span>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className={`text-[10px] font-black uppercase px-2 py-1 rounded border ${isSupplierDue ? 'bg-red-50 text-red-600 border-red-100 animate-pulse' : 'text-gray-400 border-gray-100'}`}>
                                                        {isSupplierDue ? 'OVERDUE' : 'OPEN'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5 text-right font-black text-gray-900 text-sm">${profit.toFixed(2)}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                  </div>

                  <div className="p-6 bg-white border-t border-gray-100 flex justify-end gap-3 shrink-0">
                      <button className="px-8 py-3 bg-white border border-gray-200 text-gray-400 rounded-xl font-black text-[9px] uppercase tracking-widest hover:border-gray-900 hover:text-gray-900 transition-all">Export Audit</button>
                      <button className="px-10 py-3 bg-indigo-600 text-white rounded-xl font-black text-[9px] uppercase tracking-widest shadow-xl hover:bg-black transition-all">Contact Accounts</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
