
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { mockService } from '../services/mockDataService';
import { Customer, Order, User, UserRole, Product } from '../types';
import { 
  Building, DollarSign, FileText, ChevronRight, X, 
  AlertTriangle, CheckCircle, Clock, ShieldAlert,
  ArrowRight, Landmark, Receipt, UserCheck, Search,
  ArrowUpRight, BarChart3, Calculator, Link as LinkIcon,
  Package, Leaf, Droplets, Wind, Upload, Download, Eye,
  Check, Loader2, ShoppingCart, TreePine, FileSpreadsheet,
  FileSearch, Printer, Share2, ShieldCheck, Calendar,
  Filter, FileDown
} from 'lucide-react';

// Simulated Document Viewer Component
const DocumentViewer = ({ title, type, order, onClose }: { title: string, type: 'BILL' | 'INVOICE', order: Order, onClose: () => void }) => {
    const products = mockService.getAllProducts();
    return (
        <div className="fixed inset-0 z-[350] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
                <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter">{title}</h3>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Ref: {type === 'BILL' ? 'VB-' : 'PZ-INV-'}{order.id.split('-').pop()}</p>
                    </div>
                    <button onClick={onClose} className="p-2 bg-white rounded-full border border-gray-100 text-gray-400 hover:text-gray-900 transition-all shadow-sm"><X size={24}/></button>
                </div>
                <div className="flex-1 overflow-y-auto p-10 space-y-8 bg-white font-mono text-sm no-scrollbar">
                    <div className="flex justify-between border-b-2 border-gray-900 pb-8 font-sans">
                        <div className="w-12 h-12 bg-[#043003] rounded-xl flex items-center justify-center text-white font-black text-xl">P</div>
                        <div className="text-right">
                            <p className="font-black uppercase tracking-widest text-[10px]">Date of issue</p>
                            <p className="font-bold text-gray-900">{new Date(order.date).toLocaleDateString()}</p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-10 font-sans">
                        <div>
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">From</p>
                            <p className="font-black text-gray-900 uppercase">{type === 'BILL' ? 'Wholesale Partner Network' : 'Platform Zero Aus'}</p>
                            <p className="text-xs text-gray-500 mt-1">ABN: 53 667 679 003</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Bill To</p>
                            <p className="font-black text-gray-900 uppercase">{type === 'BILL' ? 'Platform Zero Hub' : mockService.getCustomers().find(c => c.id === order.buyerId)?.businessName}</p>
                        </div>
                    </div>

                    <table className="w-full mt-10">
                        <thead className="border-b border-gray-200">
                            <tr className="text-[9px] font-black text-gray-400 uppercase tracking-widest text-left">
                                <th className="pb-4">Description</th>
                                <th className="pb-4 text-center">Qty</th>
                                <th className="pb-4 text-right">Rate</th>
                                <th className="pb-4 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {order.items.map((item, i) => {
                                const p = products.find(prod => prod.id === item.productId);
                                const price = type === 'BILL' ? (item.pricePerKg * 0.85) : item.pricePerKg;
                                return (
                                    <tr key={i} className="text-gray-700">
                                        <td className="py-4 font-bold">{p?.name}</td>
                                        <td className="py-4 text-center">{item.quantityKg}kg</td>
                                        <td className="py-4 text-right">${price.toFixed(2)}</td>
                                        <td className="py-4 text-right font-black text-gray-900">${(item.quantityKg * price).toFixed(2)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                        <tfoot className="border-t-2 border-gray-900 font-sans">
                            <tr>
                                <td colSpan={3} className="pt-6 text-right font-black uppercase text-[10px] tracking-widest">Aggregate Total</td>
                                <td className="pt-6 text-right font-black text-xl tracking-tighter">${type === 'BILL' ? (order.supplierCost || (order.totalAmount * 0.85)).toFixed(2) : order.totalAmount.toFixed(2)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
                <div className="p-8 bg-gray-50 border-t border-gray-100 flex gap-3">
                    <button className="flex-1 py-4 bg-white border border-gray-200 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gray-100 transition-all"><Printer size={16}/> Print PDF</button>
                    <button className="flex-1 py-4 bg-[#043003] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-all shadow-lg shadow-emerald-500/10"><Download size={16}/> Download Record</button>
                </div>
            </div>
        </div>
    );
};

export const AdminAccounts: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<string | null>(null);
  
  // Daily Export Logic
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [exportDate, setExportDate] = useState(new Date().toISOString().split('T')[0]);
  const [isExporting, setIsExporting] = useState(false);
  
  // Document Viewer states
  const [viewingBill, setViewingBill] = useState<Order | null>(null);
  const [viewingInvoice, setViewingInvoice] = useState<Order | null>(null);
  const [showEcoAudit, setShowEcoAudit] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const customerStats = useMemo(() => {
    const stats: Record<string, any> = {};
    const products = mockService.getAllProducts();

    customers.forEach(c => {
      const orders = allOrders.filter(o => o.buyerId === c.id);
      const owe = orders.reduce((sum, o) => sum + (o.supplierCost || o.totalAmount * 0.85), 0);
      const made = orders.reduce((sum, o) => sum + o.totalAmount, 0);
      const markup = made - owe;
      
      let commissionPaid = 0;
      if (c.assignedPzRepId) {
        const rate = c.repCommissionRate || 5;
        commissionPaid = made * (rate / 100);
      }

      const totalProfit = markup - commissionPaid;
      const isRestricted = orders.some(o => o.paymentStatus === 'Overdue');
      
      // Impact calculations
      let totalKg = 0;
      let totalCo2 = 0;
      let totalWater = 0;
      const productMap: Record<string, any> = {};

      orders.forEach(o => {
          o.items.forEach(item => {
              const p = products.find(prod => prod.id === item.productId);
              const kg = item.quantityKg;
              const co2 = kg * (p?.co2SavingsPerKg || 0.8);
              const water = kg * 50;

              totalKg += kg;
              totalCo2 += co2;
              totalWater += water;

              if (!productMap[item.productId]) {
                  productMap[item.productId] = { 
                      name: p?.name || 'Produce Item', 
                      variety: p?.variety || 'Standard',
                      qty: 0, co2: 0, water: 0, waste: 0 
                  };
              }
              productMap[item.productId].qty += kg;
              productMap[item.productId].co2 += co2;
              productMap[item.productId].water += water;
              productMap[item.productId].waste += kg;
          });
      });
      
      stats[c.id] = { 
        owe, made, commissionPaid, totalProfit, isRestricted, orders,
        impact: { totalKg, totalCo2, totalWater, breakdown: Object.values(productMap) }
      };
    });
    return stats;
  }, [customers, allOrders]);

  const handleUploadReceipt = (orderId: string) => {
      setIsUploading(orderId);
      fileInputRef.current?.click();
  };

  const handleFileUploaded = (e: React.ChangeEvent<HTMLInputElement>, orderId: string) => {
      if (e.target.files && e.target.files[0]) {
          setTimeout(() => {
              setIsUploading(null);
              alert(`Success: Settlement document uploaded and verified for Order #${orderId.split('-').pop()}`);
          }, 1500);
      }
  };

  const exportDailyOrdersCsv = async () => {
    setIsExporting(true);
    await new Promise(r => setTimeout(r, 1200));

    const selectedOrders = allOrders.filter(o => 
      new Date(o.date).toISOString().split('T')[0] === exportDate
    );

    if (selectedOrders.length === 0) {
        alert("No orders found for the selected date.");
        setIsExporting(false);
        return;
    }

    const headers = ["Order Date", "Order ID", "Buyer Entity", "Wholesaler Entity", "Total Amount ($)", "Status", "Assigned Rep", "Items Count"].join(",");
    const rows = selectedOrders.map(o => {
        const buyer = customers.find(c => c.id === o.buyerId);
        const supplier = allUsers.find(u => u.id === o.sellerId);
        return [
            new Date(o.date).toLocaleDateString(),
            `PZ-${o.id.split('-').pop()}`,
            buyer?.businessName || "Unknown Buyer",
            supplier?.businessName || "Unknown Wholesaler",
            o.totalAmount.toFixed(2),
            o.status,
            buyer?.assignedPzRepName || "HQ",
            o.items.length
        ].join(",");
    }).join("\n");

    const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + rows;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `PlatformZero_Trade_Audit_${exportDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setIsExporting(false);
    setShowExportOptions(false);
  };

  const exportImpactCsv = (customerName: string, data: any[]) => {
      const headers = "Product,Variety,Total Qty (kg),CO2 Avoided (kg),Water Saved (L),Landfill Diverted (kg)\n";
      const rows = data.map(i => `${i.name},${i.variety},${i.qty},${i.co2.toFixed(2)},${i.water.toFixed(0)},${i.qty}`).join("\n");
      const blob = new Blob([headers + rows], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Enviromental_Impact_Report_${customerName.replace(/\s+/g, '_')}.csv`;
      link.click();
  };

  const currentStats = selectedCustomerId ? customerStats[selectedCustomerId] : null;
  const selectedCustomer = useMemo(() => 
    customers.find(c => c.id === selectedCustomerId)
  , [customers, selectedCustomerId]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-2">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase leading-none">Accounts Ledger</h1>
          <p className="text-gray-400 font-bold mt-2 uppercase text-[9px] tracking-[0.25em]">Financial Audit & Oversight</p>
        </div>
        <div className="flex gap-2">
            <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-600 transition-colors" size={18} />
                <input 
                    type="text" 
                    placeholder="Search accounts..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:w-80 pl-11 pr-4 py-3.5 bg-white border border-gray-100 rounded-2xl text-sm font-bold text-gray-900 outline-none focus:ring-4 focus:ring-indigo-50/50 transition-all shadow-sm"
                />
            </div>
            
            <div className="relative">
                <button 
                    onClick={() => setShowExportOptions(!showExportOptions)}
                    className={`px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] transition-all flex items-center gap-2 shadow-sm ${showExportOptions ? 'bg-indigo-600 text-white shadow-indigo-100' : 'bg-white border border-gray-200 text-gray-400 hover:text-indigo-600 hover:border-indigo-100'}`}
                >
                    <FileSpreadsheet size={16}/> Daily Audit
                </button>

                {showExportOptions && (
                    <div className="absolute right-0 top-full mt-3 w-80 bg-white rounded-[2rem] shadow-2xl border border-gray-100 p-6 z-[100] animate-in slide-in-from-top-2">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><Calendar size={18}/></div>
                            <h4 className="text-sm font-black text-gray-900 uppercase">Export Reconciliation</h4>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1.5 block">Audit Target Date</label>
                                <input 
                                    type="date" 
                                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl font-bold text-gray-900 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-50"
                                    value={exportDate}
                                    onChange={e => setExportDate(e.target.value)}
                                />
                            </div>
                            <div className="pt-2 flex flex-col gap-2">
                                <button 
                                    onClick={exportDailyOrdersCsv}
                                    disabled={isExporting}
                                    className="w-full py-4 bg-[#0F172A] hover:bg-black text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {isExporting ? <Loader2 size={16} className="animate-spin"/> : <FileDown size={16}/>}
                                    Download CSV Trade Ledger
                                </button>
                                <button 
                                    onClick={() => { window.print(); setShowExportOptions(false); }}
                                    className="w-full py-3 bg-white border border-gray-100 text-gray-400 hover:text-gray-900 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
                                >
                                    Print Ledger View
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
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
              <div className="bg-[#F8FAFC] rounded-[2.5rem] shadow-2xl w-[95vw] max-w-7xl h-[90vh] overflow-hidden border border-gray-200 flex flex-col animate-in zoom-in-95 duration-300">
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
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {[
                            { label: 'Owe (Suppliers)', value: currentStats.owe, color: 'text-gray-400' },
                            { label: 'Made (Gross)', value: currentStats.made, color: 'text-gray-900' },
                            { label: 'Commission', value: currentStats.commissionPaid, color: 'text-indigo-600' },
                            { label: 'Net Profit', value: currentStats.totalProfit, color: 'text-emerald-600', hero: true },
                            { label: 'Enviromental Impact', value: `${currentStats.impact.totalKg.toLocaleString()}kg`, color: 'text-[#10B981]', icon: Leaf, clickable: true },
                        ].map((kpi: any, i: number) => (
                            <button 
                                key={i} 
                                onClick={() => kpi.clickable && setShowEcoAudit(true)}
                                className={`bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between text-left transition-all ${kpi.hero ? 'ring-2 ring-emerald-50' : ''} ${kpi.clickable ? 'hover:border-emerald-300 active:scale-95 group' : 'cursor-default'}`}
                            >
                                <div className="flex justify-between items-start">
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3">{kpi.label}</p>
                                    {kpi.icon && <kpi.icon size={14} className={`${kpi.color} group-hover:scale-125 transition-transform`}/>}
                                </div>
                                <h3 className={`text-xl font-black ${kpi.color} tracking-tighter`}>
                                    {typeof kpi.value === 'number' ? `$${kpi.value.toLocaleString(undefined, {minimumFractionDigits: 2})}` : kpi.value}
                                </h3>
                            </button>
                        ))}
                    </div>

                    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
                            <h3 className="text-base font-black text-gray-900 uppercase tracking-tight flex items-center gap-3">
                                <Receipt size={20} className="text-gray-400"/> Order Lifecycle & Dual-Invoice Audit
                            </h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="text-[8px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 bg-gray-50/50">
                                    <tr>
                                        <th className="px-4 py-4">DATES (ORD/DEL)</th>
                                        <th className="px-4 py-4">VENDOR BILL</th>
                                        <th className="px-4 py-4">PZ INVOICE</th>
                                        <th className="px-4 py-4 text-right">COMMISSION</th>
                                        <th className="px-4 py-4 text-right">NET PROFIT</th>
                                        <th className="px-4 py-4 text-center">ENVIROMENTAL IMPACT</th>
                                        <th className="px-4 py-4 text-right">SETTLEMENTS</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {currentStats.orders.map((o: Order) => {
                                        const supplierOwe = o.supplierCost || (o.totalAmount * 0.85);
                                        const commission = o.totalAmount * ((selectedCustomer.repCommissionRate || 5) / 100);
                                        const netProfit = o.totalAmount - supplierOwe - commission;
                                        const isSupplierDue = o.supplierInvoiceDue && new Date(o.supplierInvoiceDue) < new Date();
                                        
                                        // Mock Impact calculation
                                        const kgDiverted = o.items.reduce((sum, i) => sum + i.quantityKg, 0);
                                        const waterSaved = kgDiverted * 50;
                                        const co2Diverted = kgDiverted * 0.8;

                                        return (
                                            <tr key={o.id} className="hover:bg-gray-50 transition-colors group">
                                                <td className="px-4 py-5">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-1.5 text-gray-900 font-bold text-[10px]">
                                                            <ShoppingCart size={10} className="text-gray-400"/> {new Date(o.date).toLocaleDateString()}
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-emerald-600 font-black text-[10px]">
                                                            <Package size={10} className="text-emerald-400"/> {o.deliveredAt ? new Date(o.deliveredAt).toLocaleDateString() : 'In Transit'}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-5">
                                                    <button 
                                                        onClick={() => setViewingBill(o)}
                                                        className="text-left group/bill"
                                                    >
                                                        <p className="font-mono font-black text-[10px] text-indigo-600 uppercase group-hover/bill:underline decoration-2">VB-{o.id.split('-').pop()}</p>
                                                        <p className="font-black text-gray-900 text-xs group-hover/bill:text-indigo-600 transition-colors">${supplierOwe.toFixed(2)}</p>
                                                    </button>
                                                </td>
                                                <td className="px-4 py-5">
                                                    <button 
                                                        onClick={() => setViewingInvoice(o)}
                                                        className="text-left group/inv"
                                                    >
                                                        <p className="text-[10px] font-black uppercase text-gray-400 group-hover/inv:text-gray-600">PZ-INV-00{o.id.split('-').pop()}</p>
                                                        <p className="font-black text-gray-900 text-xs group-hover/inv:underline decoration-2 transition-all">${o.totalAmount.toFixed(2)}</p>
                                                    </button>
                                                </td>
                                                <td className="px-4 py-5 text-right font-black text-indigo-600 text-xs">
                                                    ${commission.toFixed(2)}
                                                </td>
                                                <td className="px-4 py-5 text-right">
                                                    <span className="font-black text-emerald-600 text-sm">${netProfit.toFixed(2)}</span>
                                                </td>
                                                <td className="px-4 py-5">
                                                    <div className="flex flex-wrap justify-center gap-1.5">
                                                        <div className="flex items-center gap-1 bg-blue-50 px-2 py-1 rounded text-[8px] font-black text-blue-700 border border-blue-100">
                                                            <Package size={8}/> {kgDiverted}kg
                                                        </div>
                                                        <div className="flex items-center gap-1 bg-indigo-50 px-2 py-1 rounded text-[8px] font-black text-indigo-700 border border-indigo-100">
                                                            <Droplets size={8}/> {waterSaved}L
                                                        </div>
                                                        <div className="flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded text-[8px] font-black text-emerald-700 border border-emerald-100">
                                                            <Wind size={8}/> {co2Diverted.toFixed(1)}kg
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-5 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button 
                                                            className={`p-2 rounded-lg border transition-all ${o.paymentStatus === 'Paid' ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-white border-gray-100 text-gray-300'}`}
                                                            title="Customer Receipt"
                                                        >
                                                            <FileText size={14}/>
                                                        </button>
                                                        
                                                        <div className="relative">
                                                            {isUploading === o.id ? (
                                                                <div className="p-2 bg-gray-50 border border-gray-100 rounded-lg">
                                                                    <Loader2 size={14} className="animate-spin text-indigo-600"/>
                                                                </div>
                                                            ) : (
                                                                <button 
                                                                    onClick={() => handleUploadReceipt(o.id)}
                                                                    className={`p-2 rounded-lg border transition-all ${isSupplierDue ? 'bg-red-50 border-red-200 text-red-600 animate-pulse' : 'bg-gray-900 border-gray-900 text-white hover:bg-emerald-600 hover:border-emerald-600'}`}
                                                                    title="Upload Settlement Document"
                                                                >
                                                                    <Upload size={14}/>
                                                                </button>
                                                            )}
                                                            <input 
                                                                type="file" 
                                                                className="hidden" 
                                                                ref={fileInputRef} 
                                                                onChange={(e) => isUploading && handleFileUploaded(e, isUploading)}
                                                            />
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                  </div>

                  <div className="p-6 bg-white border-t border-gray-100 flex justify-between items-center shrink-0">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em]">Aggregate Financial Integrity Check: 100% Matching</p>
                      <div className="flex gap-3">
                        <button className="px-8 py-3 bg-white border border-gray-200 text-gray-400 rounded-xl font-black text-[9px] uppercase tracking-widest hover:border-gray-900 hover:text-gray-900 transition-all">Export Detailed Audit</button>
                        <button className="px-10 py-3 bg-indigo-600 text-white rounded-xl font-black text-[9px] uppercase tracking-widest shadow-xl hover:bg-black transition-all">Settle Outstanding</button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Enviromental Impact Details Modal */}
      {showEcoAudit && selectedCustomer && currentStats && (
          <div className="fixed inset-0 z-[400] flex items-center justify-center bg-[#0B1221]/95 backdrop-blur-xl p-4 animate-in fade-in duration-300">
              <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-4xl h-[85vh] overflow-hidden flex flex-col border border-white/20 animate-in zoom-in-95 duration-200">
                  <div className="p-10 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 relative">
                      <div className="absolute top-0 right-20 p-8 opacity-[0.03] pointer-events-none transform -rotate-12"><Leaf size={240}/></div>
                      <div className="relative z-10 flex items-center gap-6">
                        <div className="w-16 h-16 bg-emerald-500 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-emerald-500/20">
                            <TreePine size={32} />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter leading-none">Enviromental Impact Audit</h2>
                            <p className="text-xs text-emerald-600 font-bold uppercase tracking-widest mt-2">Verified lifecycle savings for {selectedCustomer.businessName}</p>
                        </div>
                      </div>
                      <button onClick={() => setShowEcoAudit(false)} className="text-gray-300 hover:text-gray-900 p-2 bg-white rounded-full border border-gray-100 shadow-sm transition-all active:scale-90"><X size={32}/></button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-10 custom-scrollbar space-y-10 bg-white">
                      <div className="grid grid-cols-3 gap-6">
                          <div className="bg-emerald-50 p-6 rounded-[2rem] border border-emerald-100">
                              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2 flex items-center gap-1.5"><Wind size={14}/> Carbon Offset</p>
                              <h3 className="text-4xl font-black text-emerald-700 tracking-tighter">{currentStats.impact.totalCo2.toFixed(1)}kg</h3>
                          </div>
                          <div className="bg-blue-50 p-6 rounded-[2rem] border border-blue-100">
                              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2 flex items-center gap-1.5"><Droplets size={14}/> Freshwater Conserved</p>
                              <h3 className="text-4xl font-black text-blue-700 tracking-tighter">{currentStats.impact.totalWater.toLocaleString()}L</h3>
                          </div>
                          <div className="bg-indigo-50 p-6 rounded-[2rem] border border-indigo-100">
                              <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2 flex items-center gap-1.5"><Package size={14}/> Landfill Diversion</p>
                              <h3 className="text-4xl font-black text-indigo-700 tracking-tighter">{currentStats.impact.totalKg.toLocaleString()}kg</h3>
                          </div>
                      </div>

                      <div className="bg-white border border-gray-100 rounded-[2.5rem] shadow-inner-sm overflow-hidden">
                          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/20">
                              <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Product-Level Enviromental Impact Breakdown</h4>
                          </div>
                          <table className="w-full text-left">
                              <thead className="text-[9px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 bg-gray-50/50">
                                  <tr>
                                      <th className="px-8 py-5">Variety Identity</th>
                                      <th className="px-8 py-5 text-right">Volume (kg)</th>
                                      <th className="px-8 py-5 text-right text-emerald-600">CO2 Impact</th>
                                      <th className="px-8 py-5 text-right text-blue-600">Water Preservation</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-50">
                                  {currentStats.impact.breakdown.map((item: any, i: number) => (
                                      <tr key={i} className="hover:bg-gray-50/80 transition-all group">
                                          <td className="px-8 py-6">
                                              <div className="font-black text-gray-900 uppercase text-sm tracking-tight">{item.name}</div>
                                              <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest mt-0.5">{item.variety}</p>
                                          </td>
                                          <td className="px-8 py-6 text-right font-black text-gray-900">{item.qty}kg</td>
                                          <td className="px-8 py-6 text-right font-black text-emerald-600">-{item.co2.toFixed(1)}kg</td>
                                          <td className="px-8 py-6 text-right font-black text-blue-600">{item.water.toLocaleString()}L</td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                      </div>
                  </div>

                  <div className="p-8 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center shrink-0">
                      <div className="flex items-center gap-3 text-emerald-600 font-black text-[10px] uppercase tracking-widest">
                          <ShieldCheck size={16}/> Verification Status: AUDITED
                      </div>
                      <button 
                        onClick={() => exportImpactCsv(selectedCustomer.businessName, currentStats.impact.breakdown)}
                        className="px-12 py-5 bg-[#0F172A] text-white rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3 active:scale-95"
                      >
                          <FileSpreadsheet size={18}/> Generate CSV Enviromental Impact Report
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Bill/Invoice Viewers */}
      {viewingBill && (
          <DocumentViewer 
            title="Vendor Purchase Order Bill" 
            type="BILL" 
            order={viewingBill} 
            onClose={() => setViewingBill(null)} 
          />
      )}
      {viewingInvoice && (
          <DocumentViewer 
            title="Platform Zero Trade Invoice" 
            type="INVOICE" 
            order={viewingInvoice} 
            onClose={() => setViewingInvoice(null)} 
          />
      )}
    </div>
  );
};
