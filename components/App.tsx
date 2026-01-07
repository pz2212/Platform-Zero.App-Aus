import React, { useState, useEffect, useRef } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { UserRole, User, AppNotification, RegistrationRequest } from '../types';
import { mockService, MockCartItem } from '../services/mockDataService';
import { Dashboard } from './Dashboard';
import { FarmerDashboard } from './FarmerDashboard';
import { ConsumerDashboard } from './ConsumerDashboard';
import { GrocerDashboard } from './GrocerDashboard';
import { GrocerMarketplace } from './GrocerMarketplace';
import { ProductPricing } from './ProductPricing';
import { Marketplace } from './Marketplace';
import { SupplierMarket } from './SupplierMarket';
import { AdminDashboard } from './AdminDashboard';
import { AdminAccounts } from './AdminAccounts';
import { Settings as SettingsComponent } from './Settings';
import { LoginRequests } from './LoginRequests';
import { ConsumerOnboarding } from './ConsumerOnboarding';
import { CustomerPortals } from './CustomerPortals';
import { Accounts } from './Accounts';
import { PricingRequests } from './PricingRequests';
import { AdminPriceRequests } from './AdminPriceRequests';
import { ConsumerLanding } from './ConsumerLanding';
import { CustomerOrders } from './CustomerOrders'; 
import { AdminRepManagement } from './AdminRepManagement';
import { AdminSuppliers } from './AdminSuppliers';
import { TradingInsights } from './TradingInsights';
import { Contacts } from './Contacts';
import { FarmerNetwork } from './FarmerNetwork';
import { Notifications } from './Notifications';
import { LiveActivity } from './LiveActivity';
import { Inventory } from './Inventory';
import { SharedProductLanding } from './SharedProductLanding';
import { AdminMarketOps } from './AdminMarketOps';
import { EnvironmentalImpact } from './EnvironmentalImpact';
import { CompleteProfileModal } from './CompleteProfileModal';
import { 
  LayoutDashboard, ShoppingCart, Users, Settings, LogOut, Tags, ChevronDown, UserPlus, 
  DollarSign, X, Lock, ArrowLeft, Bell, 
  ShoppingBag, ShieldCheck, TrendingUp, Target, Plus, ChevronUp, Layers, 
  Sparkles, User as UserIcon, Building, ChevronRight,
  Sprout, Globe, Users2, Circle, LogIn, ArrowRight, Menu, Search, Calculator, BarChart3,
  Wallet, FileText, CreditCard, Activity, Briefcase, Store, TrendingDown, Gavel, Leaf, BarChart4,
  Smartphone, Key, Shield, Loader2, Check, Landmark, ShieldAlert, FilePlus, FileWarning
} from 'lucide-react';

const SidebarLink = ({ to, icon: Icon, label, active, onClick, badge = 0, isSubItem = false }: any) => (
  <Link 
    to={to} 
    onClick={onClick}
    className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all group ${
      active 
        ? 'bg-emerald-50 text-[#043003] shadow-sm' 
        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
    } ${isSubItem ? 'ml-6 py-2' : ''}`}
  >
    <div className="flex items-center space-x-3 min-w-0">
        <Icon size={isSubItem ? 16 : 20} className={active ? 'text-emerald-600' : 'text-gray-400 group-hover:text-emerald-500 transition-colors'} />
        <span className={`${isSubItem ? 'text-[13px]' : 'text-sm'} truncate font-bold tracking-tight uppercase`}>{label}</span>
    </div>
    {badge > 0 && (
        <span className="bg-red-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
            {badge}
        </span>
    )}
  </Link>
);

const SecureAccountSidebarWidget = ({ onComplete }: { onComplete: () => void }) => {
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (!password || password !== confirm) {
            alert("Passwords must match.");
            return;
        }
        setIsSaving(true);
        await new Promise(r => setTimeout(r, 1000));
        onComplete();
        setIsSaving(false);
    };

    return (
        <div className="mx-4 mb-4 p-5 rounded-[1.5rem] bg-[#0B1221] text-white border border-white/5 shadow-xl relative overflow-hidden group animate-in slide-in-from-left-4 duration-500">
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] transform rotate-12 scale-150 pointer-events-none group-hover:rotate-0 transition-transform duration-700">
                <Shield size={80} />
            </div>
            
            <div className="flex items-start gap-3 relative z-10 mb-5">
                <div className="bg-[#10B981] p-2 rounded-xl shrink-0 shadow-lg shadow-emerald-500/20">
                    <Lock size={18} className="text-white" />
                </div>
                <div>
                    <h4 className="text-[11px] font-black uppercase tracking-widest leading-none">Secure Your Account</h4>
                    <p className="text-[10px] text-slate-400 font-medium mt-2 leading-relaxed">
                        First-time login detected. Create a password to replace your access code.
                    </p>
                </div>
            </div>

            <div className="space-y-2 relative z-10">
                <input 
                    type="password" 
                    placeholder="New Password" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-500"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                />
                <div className="flex gap-2">
                    <input 
                        type="password" 
                        placeholder="Confirm" 
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-500"
                        value={confirm}
                        onChange={e => setConfirm(e.target.value)}
                    />
                    <button 
                        onClick={handleSave}
                        disabled={isSaving || !password}
                        className="bg-[#10B981] text-white w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/10 active:scale-95 transition-all disabled:opacity-30 disabled:grayscale"
                    >
                        {isSaving ? <Loader2 size={16} className="animate-spin"/> : <Check size={18} strokeWidth={3} />}
                    </button>
                </div>
            </div>
        </div>
    );
};

const BlockingOnboardingOverlay = ({ user, onStart }: { user: User, onStart: () => void }) => {
    return (
        <div className="fixed inset-0 z-[1000] bg-slate-900/60 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-500">
            <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-xl p-12 text-center border-4 border-white/20 animate-in zoom-in-95 duration-300">
                <div className="w-24 h-24 bg-red-50 text-red-500 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner-sm">
                    <ShieldAlert size={48} strokeWidth={2.5}/>
                </div>
                <h2 className="text-4xl font-black text-gray-900 tracking-tighter uppercase leading-none mb-6">Trade Verification Required</h2>
                <p className="text-lg text-gray-500 font-medium leading-relaxed mb-10">
                    To maintain market integrity and security, <span className="font-black text-gray-900">{user.businessName}</span> must complete the official trade setup and sign the Platform Zero NDA before accessing the marketplace.
                </p>
                <div className="space-y-4">
                    <button 
                        onClick={onStart}
                        className="w-full py-6 bg-[#043003] hover:bg-black text-white rounded-3xl font-black uppercase tracking-[0.2em] text-sm shadow-2xl shadow-emerald-900/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                    >
                        <FilePlus size={24}/> Complete Trade Setup
                    </button>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest flex items-center justify-center gap-2">
                        <Lock size={12}/> Secure B2B Onboarding Protocol
                    </p>
                </div>
            </div>
        </div>
    );
};

const AppLayout = ({ children, user, onLogout, onPasswordSet, onProfileRefresh }: any) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isCustomerActivityOpen, setIsCustomerActivityOpen] = useState(
    location.pathname === '/login-requests' || 
    location.pathname === '/customer-portal' || 
    location.pathname === '/consumer-onboarding'
  );
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string, exact: boolean = false) => {
      if (exact) return location.pathname === path;
      return location.pathname.startsWith(path);
  };
  
  const isPartner = user.role === UserRole.WHOLESALER || user.role === UserRole.FARMER;
  const isProfileIncomplete = !user.businessProfile?.isComplete && user.role !== UserRole.ADMIN;

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const unsubscribe = mockService.subscribeToCart((cart) => {
        setCartCount(cart.length);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };
    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen]);

  const NavContent = () => (
    <>
      {user.role === UserRole.ADMIN ? (
          <div className="space-y-1">
            <p className="px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">HQ Admin</p>
            <SidebarLink to="/" icon={LayoutDashboard} label="Dashboard" active={isActive('/', true)} />
            <SidebarLink to="/live-ops" icon={BarChart4} label="Live Operations" active={isActive('/live-ops')} />
            
            <div className="pt-4 mt-4 border-t border-gray-50 space-y-1">
                <p className="px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Market Data</p>
                
                {/* Customer Activity Dropdown */}
                <div className="space-y-1">
                    <button 
                        onClick={() => setIsCustomerActivityOpen(!isCustomerActivityOpen)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all group ${
                            isActive('/login-requests') || isActive('/customer-portal') || isActive('/consumer-onboarding')
                            ? 'bg-emerald-50/50 text-[#043003]' 
                            : 'text-gray-500 hover:bg-gray-50'
                        }`}
                    >
                        <div className="flex items-center space-x-3">
                            <Activity size={20} className="text-gray-400" />
                            <span className="text-sm font-bold tracking-tight uppercase">Customer Activity</span>
                        </div>
                        <ChevronDown size={14} className={`transition-transform duration-300 ${isCustomerActivityOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {isCustomerActivityOpen && (
                        <div className="space-y-1 mt-1 animate-in slide-in-from-top-2 duration-200">
                            <SidebarLink to="/login-requests" icon={UserPlus} label="Login Requests" active={isActive('/login-requests')} isSubItem />
                            <SidebarLink to="/customer-portal" icon={Store} label="Customer Portal" active={isActive('/customer-portal')} isSubItem />
                            <SidebarLink to="/consumer-onboarding" icon={Users} label="Onboarding Feed" active={isActive('/consumer-onboarding')} isSubItem />
                        </div>
                    )}
                </div>
                <SidebarLink to="/impact" icon={Leaf} label="Impact Dashboard" active={isActive('/