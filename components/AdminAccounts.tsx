
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
      
      // Commission logic
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
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-end px-2">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase leading-none">Accounts Ledger</h1>
          <p className="text-gray-400 font-bold mt-2 uppercase text-[10px] tracking-[0.3em]">Customer Financial Oversight & Invoicing</p>
        </div>
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-600 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Search accounts..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-8 py-5 bg-white border-2 border-gray-100 rounded-[1.5rem] text-sm font-bold text-gray-900 outline-none focus:ring-8 focus:ring-indigo-50/50 transition-all shadow-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden min-h-[600px]">
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-gray-50/50 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                    <tr>
                        <th className="px-8 py-8">Account Entity</th>
                        <th className="px-8 py-8 text-center">Status</th>
                        <th className="px-8 py-8 text-right">What we owe</th>
                        <th className="px-8 py-8 text-right">What we made</th>
                        <th className="px-8 py-8 text-right">Total Profit</th>
                        <th className="px-8 py-8 text-right">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {filteredCustomers.map(customer => {
                        const s = customerStats[customer.id];
                        return (
                            <tr key={customer.id} className="hover:bg-gray-50/30 transition-all group">
                                <td className="px-8 py-7">
                                    <div className="font-black text-gray-900 text-lg uppercase tracking-tight">{customer.businessName}</div>
                                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Rep: {customer.assignedPzRepName || 'None'}</div>
                                </td>
                                <td className="px-8 py-7 text-center">
                                    {s.isRestricted ? (
                                        <span className="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border border-red-100 flex items-center justify-center gap-2">
                                            <ShieldAlert size={14}/> restricted
                                        </span>
                                    ) : (
                                        <span className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border border-emerald-100 flex items-center justify-center gap-2">
                                            <CheckCircle size={14}/> Healthy
                                        </span>
                                    )}
                                </td>
                                <td className="px-8 py-7 text-right font-black text-gray-400 tracking-tighter">${s.owe.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                <td className="px-8 py-7 text-right font-black text-gray-900 tracking-tighter">${s.made.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                <td className="px-8 py-7 text-right font-black text-emerald-600 tracking-tighter text-xl">${s.totalProfit.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                <td className="px-8 py-7 text-right">
                                    <button 
                                        onClick={() => setSelectedCustomerId(customer.id)}
                                        className="p-3 bg-white border border-gray-100 rounded-2xl text-indigo-600 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all shadow-sm group-hover:scale-110 active:scale-95"
                                    >
                                        <ArrowRight size={20} strokeWidth={3}/>
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
      </div>

      {/* Account Detail Overlay */}
      {selectedCustomerId && selectedCustomer && currentStats && (
          <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
              <div className="bg-[#F8FAFC] rounded-[3.5rem] shadow-2xl w-full max-w-6xl h-[90vh] overflow-hidden border border-gray-200 flex flex-col animate-in zoom-in-95 duration-300">
                  {/* Modal Header */}
                  <div className="p-10 border-b border-gray-100 bg-white flex justify-between items-center shrink-0">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 border border-indigo-100">
                            <Building size={32}/>
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter leading-none">{selectedCustomer.businessName}</h2>
                            <div className="flex items-center gap-4 mt-2">
                                <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${currentStats.isRestricted ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                                    {currentStats.isRestricted ? 'Purchasing Blocked' : 'Trading Active'}
                                </span>
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{selectedCustomer.category}</span>
                            </div>
                        </div>
                      </div>
                      <button onClick={() => setSelectedCustomerId(null)} className="p-4 bg-gray-50 text-gray-400 hover:text-gray-900 rounded-full transition-all hover:rotate-90 duration-300">
                          <X size={28}/>
                      </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-10 custom-scrollbar space-y-10">
                    
                    {/* Financial KPI Strip */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {[
                            { label: 'We Owe (Suppliers)', value: currentStats.owe, color: 'text-gray-400', sub: 'Vendor Liability' },
                            { label: 'We Made (Gross)', value: currentStats.made, color: 'text-gray-900', sub: 'Total Billing' },
                            { label: 'Commission Paid', value: currentStats.commissionPaid, color: 'text-indigo-600', sub: 'Acquisition Cost' },
                            { label: 'Total Net Profit', value: currentStats.totalProfit, color: 'text-emerald-600', sub: 'Operating Income', hero: true },
                        ].map((kpi, i) => (
                            <div key={i} className={`bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between ${kpi.hero ? 'ring-4 ring-emerald-50' : ''}`}>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">{kpi.label}</p>
                                <div>
                                    <h3 className={`text-3xl font-black ${kpi.color} tracking-tighter`}>${kpi.value.toLocaleString(undefined, {minimumFractionDigits: 2})}</h3>
                                    <p className="text-[9px] font-bold text-gray-300 uppercase tracking-tight mt-1">{kpi.sub}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Sales Rep Section */}
                    {selectedCustomer.assignedPzRepId && (
                        <div className="bg-[#131926] p-10 rounded-[2.5rem] text-white relative overflow-hidden shadow-2xl group">
                            <div className="absolute top-0 right-0 p-8 opacity-5 transform rotate-12 scale-150"><Calculator size={140}/></div>
                            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
                                <div>
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="p-3 bg-indigo-500 rounded-2xl"><UserCheck size={24}/></div>
                                        <h4 className="text-xl font-black uppercase tracking-tight">Lead Attribution</h4>
                                    </div>
                                    <p className="text-slate-400 text-sm font-medium">Lead introduced by <span className="text-white font-black underline decoration-indigo-500 decoration-4">{selectedCustomer.assignedPzRepName}</span>.</p>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Commission Split</span>
                                        <span className="text-2xl font-black text-indigo-400">{selectedCustomer.repCommissionRate}%</span>
                                    </div>
                                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                        <div className="h-full bg-indigo-500" style={{width: `${(selectedCustomer.repCommissionRate || 0) * 10}%`}}></div>
                                    </div>
                                </div>
                                <div className="bg-white/5 border border-white/10 p-6 rounded-3xl flex justify-between items-center group-hover:border-indigo-500/50 transition-colors">
                                    <div>
                                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Commission Horizon</p>
                                        <p className="text-lg font-black text-white">8/20 Orders Remaining</p>
                                    </div>
                                    <Clock className="text-indigo-400 animate-pulse"/>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Invoice Mirroring Table */}
                    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight flex items-center gap-3">
                                <Receipt size={24} className="text-gray-400"/> Transaction & Invoice Mirroring
                            </h3>
                            <div className="flex gap-4">
                                <span className="flex items-center gap-2 text-[9px] font-black text-gray-400 uppercase tracking-widest"><div className="w-2 h-2 rounded-full bg-red-500"></div> Supplier Due</span>
                                <span className="flex items-center gap-2 text-[9px] font-black text-gray-400 uppercase tracking-widest"><div className="w-2 h-2 rounded-full bg-gray-200"></div> Customer Invoiced</span>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="text-[9px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                    <tr>
                                        <th className="px-8 py-5">Fulfillment Date</th>
                                        <th className="px-8 py-5">Order Reference</th>
                                        <th className="px-8 py-5">PZ Invoice (Out)</th>
                                        <th className="px-8 py-5">Supplier Invoice (In)</th>
                                        <th className="px-8 py-5 text-right">Invoice Gap (Profit)</th>
                                        <th className="px-8 py-5 text-right">Rep Share</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {currentStats.orders.length === 0 ? (
                                        <tr><td colSpan={6} className="py-20 text-center text-gray-300 font-bold uppercase tracking-widest">No transaction history</td></tr>
                                    ) : currentStats.orders.map((o: Order) => {
                                        const supplierOwe = o.supplierCost || (o.totalAmount * 0.85);
                                        const profit = o.totalAmount - supplierOwe;
                                        const repSplit = profit * ((selectedCustomer.repCommissionRate || 5) / 100);
                                        const isSupplierDue = o.supplierInvoiceDue && new Date(o.supplierInvoiceDue) < new Date();

                                        return (
                                            <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-8 py-6 text-sm font-bold text-gray-500">{new Date(o.date).toLocaleDateString()}</td>
                                                <td className="px-8 py-6 font-mono font-black text-xs text-indigo-600 uppercase tracking-tighter">ORD-{o.id.split('-').pop()}</td>
                                                <td className="px-8 py-6">
                                                    <button className="flex items-center gap-3 group text-gray-700 hover:text-indigo-600">
                                                        <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-indigo-50"><LinkIcon size={14}/></div>
                                                        <span className="text-xs font-black uppercase">PZ-INV-4242</span>
                                                    </button>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <button className={`flex items-center gap-3 group px-4 py-2 rounded-xl border transition-all ${isSupplierDue ? 'bg-red-50 border-red-100 text-red-700 animate-pulse' : 'bg-white border-gray-100 text-gray-400 hover:text-indigo-600'}`}>
                                                        <FileText size={14}/>
                                                        <span className="text-[10px] font-black uppercase">{isSupplierDue ? 'OVERDUE: OPEN' : 'SUP-INV-001'}</span>
                                                    </button>
                                                </td>
                                                <td className="px-8 py-6 text-right font-black text-gray-900 tracking-tighter text-lg">${profit.toFixed(2)}</td>
                                                <td className="px-8 py-6 text-right">
                                                    <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                                                        ${repSplit.toFixed(2)}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="p-8 bg-white border-t border-gray-100 flex justify-between items-center shrink-0">
                      <div className="flex items-center gap-3">
                          <ShieldAlert className="text-red-500" size={20}/>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Settlement Audit: Verified via Platform Zero Clearing</p>
                      </div>
                      <div className="flex gap-3">
                          <button className="px-8 py-3 bg-white border-2 border-gray-200 text-gray-400 rounded-xl font-black text-[10px] uppercase tracking-widest hover:border-gray-900 hover:text-gray-900 transition-all">Download Audit</button>
                          <button className="px-10 py-3 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-black transition-all">Dispatch Reminder</button>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
