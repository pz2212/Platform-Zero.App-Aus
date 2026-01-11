import React, { useState, useEffect, useRef, useMemo } from 'react';
import { InventoryItem, User, UserRole, Order, Customer, Product } from '../types';
import { mockService } from '../services/mockDataService';
import { 
  LayoutDashboard, ShoppingCart, DollarSign, Box, Users, 
  ArrowRight, Store, Search, MoreVertical, CheckCircle, TrendingUp,
  Leaf, Activity, Globe, Zap, Clock, Package, ChevronRight, X,
  Eye, Pencil, Percent, Settings, UserPlus, FileText, ChevronDown,
  UserCheck, AlertTriangle, Wallet, BarChart3, TrendingDown, Info, Loader2,
  Filter, ArrowLeft, Receipt, ChevronUp, Smartphone, Link as LinkIcon,
  ShieldCheck, Share2, Copy, Check, Calendar
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type DrillDownType = 'ORDERS' | 'WHOLESALERS' | 'REVENUE' | 'LEDGER' | null;

const VestingModal = ({ isOpen, onClose, customer, onUpdate }: { isOpen: boolean, onClose: () => void, customer: Customer | null, onUpdate: () => void }) => {
    const [start, setStart] = useState(1);
    const [total, setTotal] = useState(20);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (customer) {
            setStart(customer.commissionStartOrder || 1);
            setTotal(customer.commissionTotalOrders || 20);
        }
    }, [customer]);

    if (!isOpen || !customer) return null;

    const handleSave = async () => {
        setIsSaving(true);
        // Simulate updating the mock service
        const c = mockService.getCustomers().find(c => c.id === customer.id);
        if (c) {
            c.commissionStartOrder = start;
            c.commissionTotalOrders = total;
        }
        await new Promise(r => setTimeout(r, 600));
        setIsSaving(false);
        onUpdate();
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[400] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight leading-none">Commission Vesting</h2>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1.5">{customer.businessName}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
                </div>
                <div className="p-8 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Start Order #</label>
                            <input type="number" className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl font-bold" value={start} onChange={e => setStart(parseInt(e.target.value))} />
                        </div>
                        <div>
                            <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Total Orders</label>
                            <input type="number" className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl font-bold" value={total} onChange={e => setTotal(parseInt(e.target.value))} />
                        </div>
                    </div>
                    <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 flex items-start gap-3">
                        <Info size={16} className="text-indigo-500 shrink-0 mt-0.5" />
                        <p className="text-[10px] text-indigo-700 font-medium leading-relaxed">
                            Commission will be calculated for {total} orders starting from order #{start}.
                        </p>
                    </div>
                    <button 
                        onClick={handleSave}
                        disabled={isSaving}
                        className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg hover:bg-black transition-all flex items-center justify-center gap-2"
                    >
                        {isSaving ? <Loader2 size={16} className="animate-spin"/> : 'Lock Vesting Schedule'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const RepAssignmentModal = ({ isOpen, onClose, customer, reps, onUpdate }: { isOpen: boolean, onClose: () => void, customer: Customer | null, reps: User[], onUpdate: () => void }) => {
    const [isSaving, setIsSaving] = useState(false);

    if (!isOpen || !customer) return null;

    const handleAssign = async (repId: string) => {
        setIsSaving(true);
        mockService.updateCustomerRep(customer.id, repId);
        await new Promise(r => setTimeout(r, 600));
        setIsSaving(false);
        onUpdate();
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">Assign Sales Rep</h2>
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-0.5">{customer.businessName}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2"><X size={20}/></button>
                </div>
                
                <div className="p-4 space-y-2 max-h-[350px] overflow-y-auto custom-scrollbar">
                    {reps.map(rep => (
                        <button 
                            key={rep.id}
                            onClick={() => handleAssign(rep.id)}
                            disabled={isSaving}
                            className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all group ${customer.assignedPzRepId === rep.id ? 'border-indigo-600 bg-indigo-50/30' : 'border-gray-50 hover:border-indigo-100 bg-white'}`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${customer.assignedPzRepId === rep.id ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                    {rep.name.charAt(0)}
                                </div>
                                <div className="text-left">
                                    <p className="font-black text-gray-900 uppercase text-[11px]">{rep.name}</p>
                                    <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">Market Rep</p>
                                </div>
                            </div>
                            {customer.assignedPzRepId === rep.id && <Check size={14} className="text-indigo-600" strokeWidth={4}/>}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

const MarkupEditorModal = ({ isOpen, onClose, customer, onUpdate }: { isOpen: boolean, onClose: () => void, customer: Customer | null, onUpdate: () => void }) => {
    const [markup, setMarkup] = useState<string>('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (customer) setMarkup((customer.pzMarkup || 15).toString());
    }, [customer]);

    if (!isOpen || !customer) return null;

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        mockService.updateCustomerMarkup(customer.id, parseFloat(markup));
        await new Promise(r => setTimeout(r, 600));
        setIsSaving(false);
        onUpdate();
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">Configure Markup</h2>
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-0.5">{customer.businessName}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2"><X size={20}/></button>
                </div>
                
                <form onSubmit={handleSave} className="p-8 space-y-6">
                    <div>
                        <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Platform Margin (%)</label>
                        <div className="relative group">
                            <Percent className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-emerald-500 transition-colors" size={20}/>
                            <input 
                                required 
                                type="number" 
                                step="0.1"
                                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-black text-3xl text-gray-900 outline-none focus:bg-white focus:border-emerald-500 transition-all shadow-inner-sm" 
                                value={markup} 
                                onChange={e => setMarkup(e.target.value)} 
                            />
                        </div>
                    </div>

                    <button 
                        type="submit"
                        disabled={isSaving}
                        className="w-full py-4 bg-[#043003] text-white rounded-xl font-black uppercase tracking-[0.2em] text-[10px] shadow-lg hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 className="animate-spin" size={16}/> : <><Check size={16} strokeWidth={4}/> Update Markup</>}
                    </button>
                </form>
            </div>
        </div>
    );
};

export const DispatchCodeModal = ({ isOpen, onClose, code, businessName }: { isOpen: boolean, onClose: () => void, code: string, businessName: string }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 p-8 text-center border border-gray-100">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner-sm">
                    <Smartphone size={32} />
                </div>
                <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-1">Access Dispatched</h2>
                <p className="text-xs text-gray-500 font-medium mb-8">Login code for <span className="font-black text-gray-900">{businessName}</span></p>
                
                <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-6 mb-8 relative group">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">UNIQUE CODE</p>
                    <div className="text-4xl font-black text-indigo-600 tracking-[0.2em] font-mono">{code}</div>
                    <button 
                        onClick={() => { navigator.clipboard.writeText(code); alert("Code copied!"); }}
                        className="absolute right-3 bottom-3 p-2 bg-white rounded-lg text-gray-400 hover:text-indigo-600 shadow-sm border border-gray-100 transition-all"
                    >
                        <Copy size={14}/>
                    </button>
                </div>

                <button onClick={onClose} className="w-full py-4 bg-gray-900 text-white rounded-xl font-black uppercase tracking-[0.2em] text-[10px] shadow-lg hover:bg-black transition-all active:scale-95">
                    Close Manifest
                </button>
            </div>
        </div>
    );
};

const ActionDropdown = ({ customer, onEditMarkup, onAssignRep, onDispatch }: { customer: Customer, onEditMarkup: (c: Customer) => void, onAssignRep: (c: Customer) => void, onDispatch: (c: Customer) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAction = (label: string) => {
      setIsOpen(false);
      if (label === 'Configure Markup') onEditMarkup(customer);
      if (label === 'Assign Sales Rep') onAssignRep(customer);
  };

  const menuItems = [
    { label: 'View Operations', icon: Eye, color: 'text-indigo-600' },
    { label: 'Edit Profile', icon: Pencil, color: 'text-emerald-600' },
    { label: 'Configure Markup', icon: Settings, color: 'text-orange-500' },
    { label: 'Assign Sales Rep', icon: UserPlus, color: 'text-slate-500' },
  ];

  return (
    <div className="relative flex items-center justify-end gap-2" ref={dropdownRef}>
      <button 
        onClick={() => onDispatch(customer)}
        className="hidden sm:flex items-center gap-1.5 bg-[#059669] text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-sm hover:bg-[#047857] transition-all"
      >
        <Smartphone size={12}/> Dispatch
      </button>

      <div className="relative">
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className={`p-2 rounded-lg transition-all border shrink-0 ${isOpen ? 'bg-indigo-50 border-indigo-600 text-indigo-600' : 'bg-white border-gray-100 text-gray-400 hover:text-indigo-600 shadow-sm'}`}
          >
            <MoreVertical size={18}/>
          </button>
          
          {isOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 z-[100] py-2 animate-in zoom-in-95 duration-150 origin-top-right">
              {menuItems.map((item) => (
                <button 
                  key={item.label}
                  onClick={() => handleAction(item.label)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className={item.color}><item.icon size={16} /></div>
                  <span className="text-[11px] font-black text-gray-700 tracking-tight uppercase">{item.label}</span>
                </button>
              ))}
            </div>
          )}
      </div>
    </div>
  );
};

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    gmv: 0,
    ordersToday: 0,
    wholesalers: 0,
    wasteDiverted: 0,
    co2Saved: 0
  });
  const [activeDrillDown, setActiveDrillDown] = useState<DrillDownType>(null);
  const [drillDownCustomerId, setDrillDownCustomerId] = useState<string | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [wholesalers, setWholesalers] = useState<User[]>([]);
  const [pzReps, setPzReps] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [pendingCount, setPendingCount] = useState(0);

  // Modal States
  const [editingMarkupCustomer, setEditingMarkupCustomer] = useState<Customer | null>(null);
  const [editingRepCustomer, setEditingRepCustomer] = useState<Customer | null>(null);
  const [editingVestingCustomer, setEditingVestingCustomer] = useState<Customer | null>(null);
  const [dispatchCodeData, setDispatchCodeData] = useState<{code: string, name: string} | null>(null);

  const loadStats = () => {
      const orders = mockService.getOrders('u1');
      const users = mockService.getAllUsers();
      const products = mockService.getAllProducts();
      const reqs = mockService.getRegistrationRequests().filter(r => r.status === 'Pending');
      const customersList = mockService.getCustomers();
      const reps = mockService.getPzRepresentatives();
      const suppliers = users.filter(u => u.role === UserRole.WHOLESALER || u.role === UserRole.FARMER);
      
      setAllOrders(orders);
      setAllProducts(products);
      setPzReps(reps);
      setWholesalers(suppliers);

      const today = new Date().toDateString();
      const todaysOrders = orders.filter(o => new Date(o.date).toDateString() === today);
      const totalGmv = orders.reduce((sum, o) => sum + o.totalAmount, 0);

      let totalWaste = 0;
      let totalCo2 = 0;
      orders.forEach(order => {
          order.items.forEach(item => {
              const p = products.find(prod => prod.id === item.productId);
              totalWaste += item.quantityKg;
              totalCo2 += item.quantityKg * (p?.co2SavingsPerKg || 0.8);
          });
      });
      
      setPendingCount(reqs.length);
      setStats({
        gmv: totalGmv,
        ordersToday: todaysOrders.length,
        wholesalers: suppliers.length,
        wasteDiverted: totalWaste,
        co2Saved: totalCo2
      });
      setCustomers(customersList);
  };

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleAssignSupplier = (customerId: string, supplierId: string) => {
      mockService.updateCustomerSupplier(customerId, supplierId);
      loadStats();
  };

  const handleAssignPortal = (customerId: string, portal: UserRole) => {
      mockService.updateCustomerPortal(customerId, portal);
      loadStats();
  };

  const handleUpdateCommission = (customerId: string, rate: number) => {
      const c = customers.find(c => c.id === customerId);
      if (c) c.repCommissionRate = rate;
      loadStats();
  };

  const handleDispatchAccess = (customer: Customer) => {
      const code = mockService.dispatchAccess(customer.id);
      setDispatchCodeData({ code, name: customer.businessName });
      loadStats();
  };

  const customerFinancials = useMemo(() => {
    const map: Record<string, { orders: number, outstanding: number, ltv: number, profit: number, commissionEarned: number }> = {};
    
    allOrders.forEach(o => {
        if (!map[o.buyerId]) map[o.buyerId] = { orders: 0, outstanding: 0, ltv: 0, profit: 0, commissionEarned: 0 };
        const m = map[o.buyerId];
        m.orders += 1;
        m.ltv += o.totalAmount;
        if (o.paymentStatus !== 'Paid') {
            m.outstanding += o.totalAmount;
        }
        const customer = customers.find(c => c.id === o.buyerId);
        
        // Markup (Admin Profit)
        const markup = customer?.pzMarkup || 15; 
        m.profit += o.totalAmount * (markup / 100);

        // Rep Commission
        if (customer?.assignedPzRepId) {
            const start = customer.commissionStartOrder || 1;
            const total = customer.commissionTotalOrders || 20;
            if (m.orders >= start && m.orders < (start + total)) {
                const rate = customer.repCommissionRate || 5;
                m.commissionEarned += o.totalAmount * (rate / 100);
            }
        }
    });

    return map;
  }, [allOrders, customers]);

  const filteredCustomers = customers.filter(c => 
    c.businessName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const kpis = [
    { id: 'ORDERS', label: 'Orders Today', value: stats.ordersToday, icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'WHOLESALERS', label: 'Partners', value: stats.wholesalers, icon: Globe, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { id: 'REVENUE', label: 'GMV', value: `$${stats.gmv.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { id: 'IMPACT', label: 'Waste Saved', value: `${stats.wasteDiverted.toLocaleString()}kg`, icon: Leaf, color: 'text-emerald-500', bg: 'bg-emerald-50' }
  ];

  const handleKpiClick = (id: string) => {
    if (id === 'IMPACT') navigate('/impact');
    else setActiveDrillDown(id as DrillDownType);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 max-w-[1600px] mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-2">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase leading-none">HQ Control</h1>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Market Operations Oversight</p>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={() => navigate('/login-requests')} 
                className="relative px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 font-black text-[9px] uppercase tracking-widest shadow-sm hover:shadow-md transition-all active:scale-95"
            >
                Review Requests {pendingCount > 0 && <span className="ml-1 bg-red-500 text-white px-1.5 py-0.5 rounded-full text-[8px]">{pendingCount}</span>}
            </button>
            <button 
                onClick={() => navigate('/negotiations')} 
                className="px-5 py-2.5 bg-[#043003] text-white rounded-xl font-black text-[9px] uppercase tracking-[0.15em] shadow-lg hover:bg-black transition-all active:scale-95"
            >
                Negotiations
            </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 px-2">
        {kpis.map((kpi, idx) => (
            <button 
              key={idx} 
              onClick={() => handleKpiClick(kpi.id)}
              className={`text-left bg-white p-5 rounded-2xl shadow-sm border transition-all active:scale-[0.98] ${activeDrillDown === kpi.id ? 'border-indigo-400 ring-4 ring-indigo-50 shadow-md' : 'border-gray-100 hover:shadow-md'}`}
            >
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3">{kpi.label}</p>
                <div className="flex justify-between items-end">
                    <h3 className="text-2xl font-black text-gray-900 tracking-tighter">{kpi.value}</h3>
                    <div className={`p-2 rounded-lg ${kpi.bg} ${kpi.color} border border-white shadow-inner-sm`}><kpi.icon size={16} /></div>
                </div>
            </button>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-[2rem] shadow-sm overflow-visible mx-2">
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6 bg-gray-50/30">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-900 shadow-sm border border-gray-100">
                    <Store size={20}/>
                </div>
                <h2 className="text-lg font-black text-gray-900 tracking-tight uppercase leading-none">Market Management</h2>
            </div>
            <div className="relative w-full md:w-80 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-600 transition-colors" size={18} />
                <input 
                    type="text" 
                    placeholder="Search accounts..." 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-4 focus:ring-indigo-50/5 outline-none transition-all" 
                />
            </div>
        </div>

        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead className="bg-white border-b border-gray-100 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                    <tr>
                        <th className="px-6 py-6">Customer Entity</th>
                        <th className="px-6 py-6">Status</th>
                        <th className="px-6 py-6">Assigned Supplier</th>
                        <th className="px-6 py-6">Assigned Portal</th>
                        <th className="px-6 py-6">Assigned Rep</th>
                        <th className="px-6 py-6 text-center">%/Order</th>
                        <th className="px-6 py-6">Commission Scope</th>
                        <th className="px-6 py-6 text-right">Markup</th>
                        <th className="px-6 py-6 text-right">Lifetime Comm.</th>
                        <th className="px-6 py-6 text-right text-emerald-600">Profit</th>
                        <th className="px-6 py-6 text-right">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {filteredCustomers.map(customer => {
                        const m = customerFinancials[customer.id] || { orders: 0, outstanding: 0, ltv: 0, profit: 0, commissionEarned: 0 };
                        return (
                            <tr key={customer.id} className="hover:bg-gray-50/50 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="font-black text-gray-900 text-[13px] uppercase tracking-tight leading-none mb-1">{customer.businessName}</div>
                                    <div className="text-[8px] text-gray-300 font-black uppercase tracking-widest">{customer.category}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`text-[8px] font-black uppercase tracking-widest ${customer.connectionStatus === 'Active' ? 'text-emerald-600' : 'text-orange-600'}`}>
                                        {customer.connectionStatus}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <select 
                                        value={customer.connectedSupplierId || ''}
                                        onChange={(e) => handleAssignSupplier(customer.id, e.target.value)}
                                        className="max-w-[120px] bg-white border border-gray-100 rounded-lg px-2 py-1 font-black text-[9px] uppercase tracking-widest text-gray-600 outline-none truncate"
                                    >
                                        <option value="">Direct Node</option>
                                        {wholesalers.map(w => <option key={w.id} value={w.id}>{w.businessName}</option>)}
                                    </select>
                                </td>
                                <td className="px-6 py-4">
                                    <select 
                                        value={customer.assignedPortal || ''}
                                        onChange={(e) => handleAssignPortal(customer.id, e.target.value as UserRole)}
                                        className="max-w-[120px] bg-white border border-gray-100 rounded-lg px-2 py-1 font-black text-[9px] uppercase tracking-widest text-gray-600 outline-none truncate"
                                    >
                                        <option value="">Portal...</option>
                                        <option value={UserRole.CONSUMER}>Buyer</option>
                                        <option value={UserRole.GROCERY}>Grocer</option>
                                        <option value={UserRole.WHOLESALER}>Wholesaler</option>
                                        <option value={UserRole.FARMER}>Farmer</option>
                                    </select>
                                </td>
                                <td className="px-6 py-4">
                                    <button 
                                        onClick={() => setEditingRepCustomer(customer)}
                                        className="flex items-center gap-2 group/rep text-[11px] font-black text-indigo-600 uppercase tracking-tight"
                                    >
                                        <UserCheck size={14} className="text-indigo-400 group-hover/rep:scale-110 transition-transform" />
                                        {customer.assignedPzRepName || 'Unassigned'}
                                    </button>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <input 
                                        type="number"
                                        className="w-12 bg-gray-50 border border-gray-100 rounded px-1 py-0.5 text-[11px] font-black text-center outline-none focus:border-indigo-400"
                                        value={customer.repCommissionRate || 5}
                                        onChange={(e) => handleUpdateCommission(customer.id, parseFloat(e.target.value))}
                                    />
                                </td>
                                <td className="px-6 py-4">
                                    <button 
                                        onClick={() => setEditingVestingCustomer(customer)}
                                        className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 hover:bg-indigo-50 border border-gray-100 rounded-lg transition-all"
                                    >
                                        <Calendar size={12} className="text-gray-400" />
                                        <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">
                                            {customer.commissionStartOrder || 1} to {(customer.commissionStartOrder || 1) + (customer.commissionTotalOrders || 20)}
                                        </span>
                                    </button>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => setEditingMarkupCustomer(customer)} className="font-black text-gray-900 text-xs hover:text-indigo-600">{customer.pzMarkup || 15}%</button>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <span className="text-indigo-600 font-black text-xs tracking-tighter">${m.commissionEarned.toFixed(2)}</span>
                                </td>
                                <td className="px-6 py-4 text-right font-black text-emerald-600 text-sm">${m.profit.toLocaleString()}</td>
                                <td className="px-6 py-4 text-right">
                                    <ActionDropdown 
                                        customer={customer} 
                                        onEditMarkup={setEditingMarkupCustomer} 
                                        onAssignRep={setEditingRepCustomer}
                                        onDispatch={handleDispatchAccess}
                                    />
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
      </div>

      <VestingModal 
        isOpen={!!editingVestingCustomer}
        onClose={() => setEditingVestingCustomer(null)}
        customer={editingVestingCustomer}
        onUpdate={loadStats}
      />

      <MarkupEditorModal 
        isOpen={!!editingMarkupCustomer} 
        onClose={() => setEditingMarkupCustomer(null)}
        customer={editingMarkupCustomer}
        onUpdate={loadStats}
      />

      <RepAssignmentModal 
        isOpen={!!editingRepCustomer}
        onClose={() => setEditingRepCustomer(null)}
        customer={editingRepCustomer}
        reps={pzReps}
        onUpdate={loadStats}
      />

      <DispatchCodeModal 
        isOpen={!!dispatchCodeData}
        onClose={() => setDispatchCodeData(null)}
        code={dispatchCodeData?.code || ''}
        businessName={dispatchCodeData?.name || ''}
      />
    </div>
  );
};
