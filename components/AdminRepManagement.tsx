
import React, { useState, useEffect, useMemo } from 'react';
import { User, UserRole, Customer, Order } from '../types';
import { mockService } from '../services/mockDataService';
// Added UserCheck and Eye to the imports from lucide-react to fix errors on lines 99 and 159
import { 
  Users, TrendingUp, DollarSign, Award, ArrowRight, 
  BarChart, PieChart, Activity, UserPlus, ChevronDown,
  Building, Calendar, Package, Receipt, ArrowUpRight,
  ShieldCheck, Clock, X, UserCheck, Eye
} from 'lucide-react';

export const AdminRepManagement: React.FC = () => {
  const [reps, setReps] = useState<User[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [selectedRepId, setSelectedRepId] = useState<string | null>(null);

  useEffect(() => {
    setReps(mockService.getPzRepresentatives());
    setCustomers(mockService.getCustomers());
    setAllOrders(mockService.getOrders('u1'));
  }, []);

  const repPerformance = useMemo(() => {
    const data: Record<string, any> = {};
    reps.forEach(rep => {
      const assignedCustomers = customers.filter(c => c.assignedPzRepId === rep.id);
      let totalSales = 0;
      let totalCommission = 0;
      let orderCount = 0;

      const customerBreakdown = assignedCustomers.map(c => {
        const cOrders = allOrders.filter(o => o.buyerId === c.id);
        const start = c.commissionStartOrder || 1;
        const limit = c.commissionTotalOrders || 20;
        
        let cSales = 0;
        let cComm = 0;
        let cOrderCount = 0;

        cOrders.forEach((o, idx) => {
            const orderNum = idx + 1;
            cSales += o.totalAmount;
            if (orderNum >= start && orderNum < (start + limit)) {
                cComm += o.totalAmount * ((c.repCommissionRate || 5) / 100);
            }
            cOrderCount++;
        });

        totalSales += cSales;
        totalCommission += cComm;
        orderCount += cOrderCount;

        return {
            id: c.id,
            name: c.businessName,
            orders: cOrderCount,
            sales: cSales,
            commission: cComm,
            rate: c.repCommissionRate || 5,
            vesting: `${start} to ${start + limit}`
        };
      });

      data[rep.id] = {
        totalSales,
        totalCommission,
        orderCount,
        customerCount: assignedCustomers.length,
        breakdown: customerBreakdown
      };
    });
    return data;
  }, [reps, customers, allOrders]);

  const selectedRep = reps.find(r => r.id === selectedRepId);
  const selectedStats = selectedRepId ? repPerformance[selectedRepId] : null;

  const totalCommissions = Object.values(repPerformance).reduce((sum, s: any) => sum + s.totalCommission, 0);
  const totalSales = Object.values(repPerformance).reduce((sum, s: any) => sum + s.totalSales, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-2">
        <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Representatives</h1>
            <p className="text-gray-500 font-medium">Performance monitoring and automated commission settlement.</p>
        </div>
        <button className="px-8 py-3.5 bg-[#043003] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-black transition-all">
            + Provision New Rep
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-2">
        {[
            { label: 'Network Sales', value: `$${totalSales.toLocaleString()}`, color: 'text-gray-900', icon: TrendingUp, bg: 'bg-emerald-50 text-emerald-600' },
            { label: 'Settled Comm.', value: `$${totalCommissions.toLocaleString()}`, color: 'text-indigo-600', icon: DollarSign, bg: 'bg-indigo-50 text-indigo-600' },
            { label: 'Active Agents', value: reps.length, color: 'text-gray-900', icon: Users, bg: 'bg-blue-50 text-blue-600' },
            // Fix line 99: icon: UserCheck is now available via import
            { label: 'Total Leads', value: customers.filter(c => c.assignedPzRepId).length, color: 'text-gray-900', icon: UserCheck, bg: 'bg-orange-50 text-orange-600' }
        ].map((kpi, idx) => (
            <div key={idx} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between h-32">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{kpi.label}</p>
                <div className="flex justify-between items-end">
                    <h3 className={`text-2xl font-black ${kpi.color} tracking-tighter`}>{kpi.value}</h3>
                    <div className={`p-2 rounded-lg ${kpi.bg}`}><kpi.icon size={16}/></div>
                </div>
            </div>
        ))}
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-200 shadow-sm overflow-hidden mx-2">
          <div className="p-8 border-b border-gray-100 bg-gray-50/30 flex justify-between items-center">
              <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight flex items-center gap-3">
                  <Award size={24} className="text-yellow-500"/> Team Leaderboard
              </h2>
          </div>
          <div className="overflow-x-auto">
              <table className="w-full text-left">
                  <thead className="bg-white text-[9px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                      <tr>
                          <th className="px-8 py-6">Representative</th>
                          <th className="px-8 py-6 text-center">Portfolio</th>
                          <th className="px-8 py-6 text-right">Total GMV</th>
                          <th className="px-8 py-6 text-right text-indigo-600">Earned Commission</th>
                          <th className="px-8 py-6 text-right">Action</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                      {reps.map(rep => {
                          const stats = repPerformance[rep.id];
                          return (
                              <tr key={rep.id} className="hover:bg-gray-50/50 transition-all group">
                                  <td className="px-8 py-5">
                                      <div className="flex items-center gap-4">
                                          <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-700 font-black text-lg shadow-inner-sm">
                                              {rep.name.charAt(0)}
                                          </div>
                                          <div>
                                              <div className="font-black text-gray-900 uppercase text-sm">{rep.name}</div>
                                              <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{rep.email}</div>
                                          </div>
                                      </div>
                                  </td>
                                  <td className="px-8 py-5 text-center">
                                      <span className="font-black text-gray-700 text-sm">{stats.customerCount}</span>
                                      <p className="text-[8px] text-gray-400 font-black uppercase tracking-widest">Connected Leads</p>
                                  </td>
                                  <td className="px-8 py-5 text-right font-black text-gray-900 text-base tracking-tighter">
                                      ${stats.totalSales.toLocaleString(undefined, {minimumFractionDigits: 2})}
                                  </td>
                                  <td className="px-8 py-5 text-right font-black text-indigo-600 text-xl tracking-tighter">
                                      ${stats.totalCommission.toLocaleString(undefined, {minimumFractionDigits: 2})}
                                  </td>
                                  <td className="px-8 py-5 text-right">
                                      <button 
                                        onClick={() => setSelectedRepId(rep.id)}
                                        className="p-3 bg-white border border-gray-100 rounded-2xl text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all shadow-sm active:scale-95"
                                      >
                                          {/* Fix line 159: Eye is now available via import */}
                                          <Eye size={20}/>
                                      </button>
                                  </td>
                              </tr>
                          );
                      })}
                  </tbody>
              </table>
          </div>
      </div>

      {/* DETAILED DRILLDOWN MODAL */}
      {selectedRepId && selectedRep && selectedStats && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-300">
              <div className="bg-[#F8FAFC] rounded-[3rem] shadow-2xl w-full max-w-5xl h-[85vh] overflow-hidden flex flex-col border border-gray-200 animate-in zoom-in-95 duration-300">
                  <div className="p-8 border-b border-gray-100 bg-white flex justify-between items-center shrink-0">
                      <div className="flex items-center gap-5">
                          <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-50 flex items-center justify-center text-indigo-700 text-3xl font-black shadow-inner-sm border border-indigo-100">
                              {selectedRep.name.charAt(0)}
                          </div>
                          <div>
                              <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter leading-none">{selectedRep.name}</h2>
                              <div className="flex items-center gap-4 mt-2">
                                  <span className="text-xs font-black text-indigo-600 uppercase tracking-[0.2em] bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100">Assigned Agent</span>
                                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{selectedRep.email}</span>
                              </div>
                          </div>
                      </div>
                      <button onClick={() => setSelectedRepId(null)} className="p-3 bg-gray-50 text-gray-400 hover:text-gray-900 rounded-full transition-all">
                          <X size={32}/>
                      </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-10 custom-scrollbar space-y-10">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between h-40 group hover:shadow-md transition-all">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Aggregate GMV</p>
                                <div className="flex justify-between items-end">
                                    <h3 className="text-4xl font-black text-gray-900 tracking-tighter">${selectedStats.totalSales.toLocaleString()}</h3>
                                    <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600"><TrendingUp size={24}/></div>
                                </div>
                          </div>
                          <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between h-40 group hover:shadow-md transition-all">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Total Commission</p>
                                <div className="flex justify-between items-end">
                                    <h3 className="text-4xl font-black text-indigo-600 tracking-tighter">${selectedStats.totalCommission.toLocaleString()}</h3>
                                    <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600"><DollarSign size={24}/></div>
                                </div>
                          </div>
                          <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between h-40 group hover:shadow-md transition-all">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Active Leads</p>
                                <div className="flex justify-between items-end">
                                    <h3 className="text-4xl font-black text-gray-900 tracking-tighter">{selectedStats.customerCount}</h3>
                                    <div className="p-3 rounded-2xl bg-orange-50 text-orange-600"><Users size={24}/></div>
                                </div>
                          </div>
                      </div>

                      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                          <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                              <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight flex items-center gap-3">
                                  <Receipt size={24} className="text-gray-400"/> Lead Distribution Audit
                              </h3>
                          </div>
                          <div className="overflow-x-auto">
                              <table className="w-full text-left">
                                  <thead className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                      <tr>
                                          <th className="px-8 py-6">Customer Entity</th>
                                          <th className="px-8 py-6 text-center">Orders</th>
                                          <th className="px-8 py-6 text-right">LTV Sales</th>
                                          <th className="px-8 py-6 text-center">Rate</th>
                                          <th className="px-8 py-6">Vesting Window</th>
                                          <th className="px-8 py-6 text-right text-indigo-600">Earnings</th>
                                      </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-50">
                                      {selectedStats.breakdown.map((c: any) => (
                                          <tr key={c.id} className="hover:bg-gray-50/80 transition-colors group">
                                              <td className="px-8 py-5">
                                                  <div className="font-black text-gray-900 uppercase text-[15px] tracking-tight">{c.name}</div>
                                                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">Lead ID: {c.id}</p>
                                              </td>
                                              <td className="px-8 py-5 text-center font-black text-gray-900 text-sm">{c.orders}</td>
                                              <td className="px-8 py-5 text-right font-black text-gray-900 text-sm">${c.sales.toLocaleString()}</td>
                                              <td className="px-8 py-5 text-center">
                                                  <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-indigo-100">{c.rate}%</span>
                                              </td>
                                              <td className="px-8 py-5">
                                                  <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                      <Clock size={12} className="text-gray-300"/> Order {c.vesting}
                                                  </div>
                                              </td>
                                              <td className="px-8 py-5 text-right font-black text-indigo-600 text-lg tracking-tighter">${c.commission.toFixed(2)}</td>
                                          </tr>
                                      ))}
                                  </tbody>
                              </table>
                          </div>
                      </div>
                  </div>

                  <div className="p-8 bg-white border-t border-gray-100 flex justify-between items-center shrink-0">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Settlement cycle: weekly on Tuesdays</p>
                      <div className="flex gap-3">
                          <button className="px-8 py-3 bg-white border border-gray-200 text-gray-400 rounded-xl font-black text-[9px] uppercase tracking-widest hover:border-gray-900 hover:text-gray-900 transition-all shadow-sm">Audit Reports</button>
                          <button className="px-12 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-black transition-all">Approve Payout</button>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
