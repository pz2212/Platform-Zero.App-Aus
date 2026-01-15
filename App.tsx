import React, { useState, useEffect, useRef } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { UserRole, User, AppNotification, RegistrationRequest } from './types';
import { mockService, MockCartItem } from './services/mockDataService';
import { Dashboard } from './components/Dashboard';
import { FarmerDashboard } from './components/FarmerDashboard';
import { ConsumerDashboard } from './components/ConsumerDashboard';
import { GrocerDashboard } from './components/GrocerDashboard';
import { GrocerMarketplace } from './components/GrocerMarketplace';
import { ProductPricing } from './components/ProductPricing';
import { Marketplace } from './components/Marketplace';
import { SupplierMarket } from './components/SupplierMarket';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminAccounts } from './components/AdminAccounts';
import { Settings as SettingsComponent } from './components/Settings';
import { LoginRequests } from './components/LoginRequests';
import { ConsumerOnboarding } from './components/ConsumerOnboarding';
import { CustomerPortals } from './components/CustomerPortals';
import { Accounts } from './components/Accounts';
import { PricingRequests } from './components/PricingRequests';
import { AdminPriceRequests } from './components/AdminPriceRequests';
import { ConsumerLanding } from './components/ConsumerLanding';
import { CustomerOrders } from './components/CustomerOrders'; 
import { AdminRepManagement } from './components/AdminRepManagement';
import { AdminSuppliers } from './components/AdminSuppliers';
import { TradingInsights } from './components/TradingInsights';
import { Contacts } from './components/Contacts';
import { FarmerNetwork } from './components/FarmerNetwork';
import { Notifications } from './components/Notifications';
import { LiveActivity } from './components/LiveActivity';
import { Inventory } from './components/Inventory';
import { SharedProductLanding } from './components/SharedProductLanding';
import { AdminMarketOps } from './components/AdminMarketOps';
import { EnvironmentalImpact } from './components/EnvironmentalImpact';
import { CompleteProfileModal } from './components/CompleteProfileModal';
import { InterestsModal } from './components/InterestsModal';
import { RepDashboard } from './components/RepDashboard';
import { 
  LayoutDashboard, ShoppingCart, Users, Settings, LogOut, Tags, ChevronDown, UserPlus, 
  DollarSign, X, Lock, ArrowLeft, Bell, 
  ShoppingBag, ShieldCheck, TrendingUp, Target, Plus, ChevronUp, Layers, 
  Sparkles, User as UserIcon, Building, ChevronRight,
  Sprout, Globe, Users2, Circle, LogIn, ArrowRight, Menu, Search, Calculator, BarChart3,
  Wallet, FileText, CreditCard, Activity, Briefcase, Store, TrendingDown, Gavel, Leaf, BarChart4,
  Smartphone, Key, Shield, Loader2, Check, Landmark, ShieldAlert, FilePlus, FileWarning,
  ShieldEllipsis
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

const MarketAlignmentSidebarWidget = ({ user, onUpdate }: { user: User, onUpdate: () => void }) => {
    const interests = [...(user.activeSellingInterests || []), ...(user.activeBuyingInterests || [])];
    const displayItems = interests.slice(0, 3);
    const hasMore = interests.length > 3;

    // Only show for Wholesalers and Farmers
    if (user.role !== UserRole.WHOLESALER && user.role !== UserRole.FARMER) return null;

    return (
        <div className="mx-4 mb-4 p-5 rounded-[1.75rem] bg-indigo-50/50 border border-indigo-100 shadow-sm relative overflow-hidden group">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-widest">
                    <Sparkles size={14}/> Market Alignment
                </div>
                <button onClick={onUpdate} className="text-indigo-400 hover:text-indigo-600 transition-colors">
                    <Settings size={14}/>
                </button>
            </div>
            
            <div className="flex flex-wrap gap-1.5 mb-5">
                {displayItems.length > 0 ? (
                    displayItems.map((item, i) => (
                        <span key={i} className="bg-white border border-indigo-100 px-2.5 py-1 rounded-lg text-[9px] font-black text-indigo-700 uppercase tracking-tighter shadow-sm">
                            {item}
                        </span>
                    ))
                ) : (
                    <span className="text-[10px] text-indigo-300 font-bold italic">No alignment set</span>
                )}
                {hasMore && <span className="text-[9px] text-indigo-400 font-black mt-1 ml-1">+{interests.length - 3}</span>}
            </div>

            <button 
                onClick={onUpdate}
                className="w-full py-3 bg-white hover:bg-indigo-600 hover:text-white border border-indigo-200 text-indigo-600 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all active:scale-95 shadow-sm flex items-center justify-center gap-2"
            >
                Update Alignment
            </button>
        </div>
    );
};

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

const AppLayout = ({ children, user, onLogout, onPasswordSet, onOpenInterests }: any) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
                <SidebarLink to="/impact" icon={Leaf} label="Impact Dashboard" active={isActive('/impact')} />
            </div>

            <div className="pt-4 mt-4 border-t border-gray-100">
                <p className="px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Leads</p>
                <SidebarLink to="/pricing-requests" icon={Calculator} label="Pricing Audits" active={isActive('/pricing-requests')} />
                <SidebarLink to="/negotiations" icon={Gavel} label="Negotiations" active={isActive('/negotiations')} />
            </div>

            <div className="pt-4 mt-4 border-t border-gray-100">
                <p className="px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Management</p>
                <SidebarLink to="/admin/accounts" icon={Landmark} label="Accounts Ledger" active={isActive('/admin/accounts')} />
                <SidebarLink to="/rep-management" icon={Briefcase} label="Rep Management" active={isActive('/rep-management')} />
                <SidebarLink to="/suppliers" icon={Store} label="Suppliers" active={isActive('/suppliers')} />
                <SidebarLink to="/marketplace" icon={Layers} label="Catalog Manager" active={isActive('/marketplace')} />
            </div>
          </div>
      ) : user.role === UserRole.CONSUMER ? (
        <div className="space-y-1">
            <SidebarLink to="/" icon={LayoutDashboard} label="Dashboard" active={isActive('/', true)} />
            <SidebarLink to="/orders" icon={ShoppingCart} label="Track Orders" active={isActive('/orders')} />
            <SidebarLink to="/marketplace" icon={ShoppingBag} label="Fresh Catalog" active={isActive('/marketplace')} />
            <SidebarLink to="/accounts" icon={Wallet} label="Accounts & Billing" active={isActive('/accounts')} />
        </div>
      ) : user.role === UserRole.GROCERY ? (
        <div className="space-y-1">
            <SidebarLink to="/" icon={LayoutDashboard} label="Wholesale Hub" active={isActive('/', true)} />
            <SidebarLink to="/grocer/marketplace" icon={TrendingDown} label="Market" active={isActive('/grocer/marketplace')} />
            <SidebarLink to="/orders" icon={ShoppingCart} label="My Orders" active={isActive('/orders')} />
            <SidebarLink to="/accounts" icon={Wallet} label="Financials" active={isActive('/accounts')} />
        </div>
      ) : user.role === UserRole.PZ_REP ? (
        <div className="space-y-1">
            <SidebarLink to="/" icon={LayoutDashboard} label="Sales Console" active={isActive('/', true)} />
            <SidebarLink to="/contacts" icon={Users} label="My Leads" active={isActive('/contacts')} />
            <SidebarLink to="/pricing-requests" icon={Calculator} label="Pricing Audits" active={isActive('/pricing-requests')} />
        </div>
      ) : isPartner ? (
        <div className="space-y-1">
            <SidebarLink to="/" icon={LayoutDashboard} label="Order Management" active={isActive('/', true)} />
            <SidebarLink to="/farmers" icon={Sprout} label="Farmer Network" active={isActive('/farmers')} />
            <SidebarLink to="/contacts" icon={Users} label="Buyer Network" active={isActive('/contacts')} />
            <SidebarLink to="/pricing" icon={Tags} label="Inventory & Price" active={isActive('/pricing')} />
            <SidebarLink to="/accounts" icon={DollarSign} label="Financials" active={isActive('/accounts')} />
            <SidebarLink to="/market" icon={Globe} label="Supplier Market" active={isActive('/market')} />
            <SidebarLink to="/market" icon={Globe} label="Supplier Market" active={isActive('/market')} />
        </div>
      ) : null}
    </>
  );
  
  return (
    <div className="flex min-h-screen bg-white">
      {isProfileIncomplete && (
          <BlockingOnboardingOverlay user={user} onStart={() => setIsProfileModalOpen(true)} />
      )}

      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-100 fixed inset-y-0 z-30">
        <div className="p-8 flex items-center gap-3">
          <div className="w-8 h-8 bg-[#043003] rounded-lg flex items-center justify-center text-white font-bold text-lg">P</div>
          <span className="font-black text-xl tracking-tighter text-gray-900 uppercase">Platform Zero</span>
        </div>
        
        <div className="flex-1 px-4 space-y-8 flex flex-col no-scrollbar">
            <NavContent />
        </div>

        {/* Market Alignment Widget */}
        <MarketAlignmentSidebarWidget user={user} onUpdate={onOpenInterests} />

        {/* Secure Account Widget */}
        {user.loginCode && !user.passwordSet && (
            <SecureAccountSidebarWidget onComplete={() => onPasswordSet(user.id)} />
        )}

        <div className="p-4 border-t border-gray-50 space-y-1">
            <SidebarLink to="/settings" icon={Settings} label="Settings" active={isActive('/settings')} />
            <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl text-sm font-bold transition-all uppercase">
                <LogOut size={20} />
                <span>Sign Out</span>
            </button>
        </div>
      </aside>

      <main className="flex-1 md:ml-64 w-full min-h-screen bg-[#F8FAFC]">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 md:px-8 flex items-center justify-between sticky top-0 z-50">
            <div className="flex items-center gap-4 flex-1">
              <div className="md:hidden w-8 h-8 bg-[#043003] rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm">P</div>
              <div className="hidden sm:flex items-center gap-4 flex-1">
                <div className="relative max-w-md w-full group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18}/>
                  <input type="text" placeholder="Search HQ records..." className="w-full pl-12 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all"/>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-4 relative">
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-black text-gray-900 leading-none mb-1 uppercase">{user.name}</p>
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest leading-none">{user.role}</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-black shadow-sm shrink-0">
                    {user.name.charAt(0)}
                  </div>
                </div>

                <div className="md:hidden ml-1" ref={dropdownRef}>
                  <button 
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl transition-all active:scale-95 border-2 ${
                      isMobileMenuOpen 
                        ? 'bg-white border-[#043003] text-[#043003]' 
                        : 'bg-[#043003] border-[#043003] text-white shadow-emerald-900/10'
                    }`}
                  >
                    <Menu size={16} strokeWidth={2.5}/>
                    <span>NAVIGATE</span>
                    <ChevronDown size={12} strokeWidth={3} className={`transition-transform duration-300 ${isMobileMenuOpen ? 'rotate-180' : ''}`}/>
                  </button>

                  {isMobileMenuOpen && (
                    <div className="absolute right-0 top-14 w-[280px] max-w-[90vw] bg-white rounded-3xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] border border-gray-100 py-4 px-3 z-[60] animate-in zoom-in-95 slide-in-from-top-2 duration-200 max-h-[calc(100vh-80px)] overflow-y-auto custom-scrollbar">
                        <div className="px-4 py-2 mb-4 border-b border-gray-50">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-0.5">Account</p>
                            <p className="font-black text-gray-900 uppercase truncate text-xs">{user.businessName}</p>
                        </div>
                        
                        <div className="space-y-1">
                            <NavContent />
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-100 space-y-1">
                            <SidebarLink to="/settings" icon={Settings} label="Settings" active={isActive('/settings')} />
                            <button onClick={onLogout} className="w-full flex items-center justify-between px-4 py-3.5 text-red-600 hover:bg-red-50 rounded-xl text-sm font-black transition-all uppercase">
                                <div className="flex items-center gap-3">
                                  <LogOut size={20} />
                                  <span>Sign Out</span>
                                </div>
                                <ArrowRight size={14}/>
                            </button>
                        </div>
                    </div>
                  )}
                </div>
            </div>
        </header>
        <div className="flex-1 p-6 md:p-8">{children}</div>
      </main>

      <CompleteProfileModal 
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          user={user}
          onComplete={() => {}}
      />
    </div>
  );
};

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authStep, setAuthStep] = useState<'category' | 'credentials'>('category');
  const [isInterestsModalOpen, setIsInterestsModalOpen] = useState(false);

  const checkInterests = (u: User) => {
    if ((u.role === UserRole.WHOLESALER || u.role === UserRole.FARMER) && 
        (!u.activeSellingInterests || u.activeSellingInterests.length === 0)) {
        setIsInterestsModalOpen(true);
    }
  };

  const handleAutoLogin = (email: string) => {
    const foundUser = mockService.getAllUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
    if (foundUser) { 
        setUser(foundUser); 
        setShowAuthModal(false);
        checkInterests(foundUser);
    } else { 
        alert("Account not found."); 
    }
  };

  const handleCodeLogin = (code: string) => {
      const foundUser = mockService.loginWithCode(code);
      if (foundUser) {
          setUser(foundUser);
          setShowAuthModal(false);
          checkInterests(foundUser);
      } else {
          alert("Invalid Access Code.");
      }
  };

  const handlePasswordSet = (userId: string) => {
      mockService.setUserPassword(userId, true);
      setUser(prev => prev ? { ...prev, passwordSet: true } : null);
  };

  const handleRefreshUser = () => {
      if (user) {
          const updated = mockService.getAllUsers().find(u => u.id === user.id);
          if (updated) setUser({ ...updated });
      }
  };

  const wrapLayout = (element: React.ReactElement) => (
    <Router>
        <Routes>
            <Route path="/l/:itemId" element={<SharedProductLanding user={user} onLogin={() => { setAuthStep('category'); setShowAuthModal(true); }} />} />
            <Route path="/*" element={
                user ? (
                    <AppLayout 
                        user={user} 
                        onLogout={() => setUser(null)} 
                        onPasswordSet={handlePasswordSet}
                        onOpenInterests={() => setIsInterestsModalOpen(true)}
                    >
                        {element}
                    </AppLayout>
                ) : (
                    <>
                        <ConsumerLanding onLogin={() => { setAuthStep('category'); setShowAuthModal(true); }} />
                        <AuthModal 
                            isOpen={showAuthModal} 
                            onClose={() => setShowAuthModal(false)} 
                            step={authStep} 
                            setStep={setAuthStep} 
                            onLogin={(e: any) => {e.preventDefault();}} 
                            onAutoLogin={handleAutoLogin} 
                            onCodeLogin={handleCodeLogin}
                        />
                    </>
                )
            } />
        </Routes>
        {user && (
            <InterestsModal 
                user={user} 
                isOpen={isInterestsModalOpen} 
                onClose={() => setIsInterestsModalOpen(false)}
                onSaved={handleRefreshUser}
            />
        )}
    </Router>
  );

  return wrapLayout(
    <Routes>
      <Route path="/" element={
        user?.role === UserRole.ADMIN ? <AdminDashboard /> : 
        user?.role === UserRole.CONSUMER ? <ConsumerDashboard user={user} /> : 
        user?.role === UserRole.GROCERY ? <GrocerDashboard user={user} /> :
        user?.role === UserRole.FARMER ? <FarmerDashboard user={user} /> :
        user?.role === UserRole.PZ_REP ? <RepDashboard user={user} /> :
        user ? <Dashboard user={user} /> : <Navigate to="/" />
      } />
      <Route path="/grocer/marketplace" element={user ? <GrocerMarketplace user={user} /> : <Navigate to="/" />} />
      <Route path="/login-requests" element={<LoginRequests />} />
      <Route path="/consumer-onboarding" element={<ConsumerOnboarding />} />
      <Route path="/customer-portal" element={<CustomerPortals />} />
      <Route path="/impact" element={<EnvironmentalImpact />} />
      <Route path="/live-ops" element={<AdminMarketOps />} />
      <Route path="/pricing-requests" element={user ? <PricingRequests user={user} /> : <Navigate to="/" />} />
      <Route path="/negotiations" element={user ? <AdminPriceRequests /> : <Navigate to="/" />} />
      <Route path="/rep-management" element={<AdminRepManagement />} />
      <Route path="/suppliers" element={<AdminSuppliers />} />
      <Route path="/marketplace" element={user ? <Marketplace user={user} /> : <Navigate to="/" />} />
      <Route path="/market" element={user ? <SupplierMarket user={user} /> : <Navigate to="/" />} />
      <Route path="/pricing" element={user ? <ProductPricing user={user} /> : <Navigate to="/" />} />
      <Route path="/inventory" element={<Inventory items={mockService.getAllInventory()} />} />
      <Route path="/accounts" element={user ? <Accounts user={user} /> : <Navigate to="/" />} />
      <Route path="/admin/accounts" element={user?.role === UserRole.ADMIN ? <AdminAccounts /> : <Navigate to="/" />} />
      <Route path="/settings" element={user ? <SettingsComponent user={user} onRefreshUser={handleRefreshUser} /> : <Navigate to="/" />} />
      <Route path="/orders" element={user ? <CustomerOrders user={user} /> : <Navigate to="/" />} />
      <Route path="/contacts" element={user ? <Contacts user={user} /> : <Navigate to="/" />} />
      <Route path="/farmers" element={user ? <FarmerNetwork user={user} /> : <Navigate to="/" />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const AuthModal = ({ isOpen, onClose, step, setStep, onAutoLogin, onCodeLogin }: any) => {
    const [accessCode, setAccessCode] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedDemo, setSelectedDemo] = useState<any>(null);
    const [demoPassword, setDemoPassword] = useState('');

    if (!isOpen) return null;

    const handleCodeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!accessCode) return;
        setIsProcessing(true);
        await new Promise(r => setTimeout(r, 600));
        onCodeLogin(accessCode);
        setIsProcessing(false);
    };

    const handleDemoSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (demoPassword === 'PZ2222') {
            onAutoLogin(selectedDemo.email);
            setDemoPassword('');
            setSelectedDemo(null);
        } else {
            alert("Incorrect password for authorized access.");
        }
    };

    const demoLogins = [
        { label: 'WHOLESALER', email: 'sarah@fresh.com', color: 'bg-[#F0F7FF] border-[#E0E7FF] hover:bg-[#E0E7FF]' },
        { label: 'FARMER', email: 'bob@greenvalley.com', color: 'bg-[#F0FFF4] border-[#DCFCE7] hover:bg-[#DCFCE7]' },
        { label: 'BUYER (CAFÉ)', email: 'alice@cafe.com', color: 'bg-[#F5F3FF] border-[#EDE9FE] hover:bg-[#EDE9FE]' },
        { label: 'BUYER (GROCERY)', email: 'gary@grocer.com', color: 'bg-[#FFF7ED] border-[#FFEDD5] hover:bg-[#FFEDD5]' },
    ];

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-6xl overflow-hidden animate-in zoom-in-95">
                <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-white shrink-0">
                    <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase leading-none">Portal Access</h2>
                    <button onClick={onClose} className="text-gray-300 hover:text-gray-600 transition-all p-1"><X size={28} /></button>
                </div>
                
                <div className="p-8 md:p-10 space-y-12">
                    
                    {selectedDemo ? (
                        /* PASSWORD PROTECTION VIEW (COMPACT CENTERED) */
                        <div className="max-w-md mx-auto space-y-8 animate-in slide-in-from-right-4">
                            <button 
                                onClick={() => { setSelectedDemo(null); setDemoPassword(''); }}
                                className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest hover:text-indigo-600 transition-colors"
                            >
                                <ArrowLeft size={14}/> Back to list
                            </button>

                            <div className="flex items-center gap-5 p-8 bg-gray-50 rounded-[2rem] border border-gray-100">
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-gray-900 text-2xl shadow-inner-sm border border-gray-200`}>
                                    {selectedDemo.label.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-black text-gray-900 uppercase text-xl leading-none tracking-tighter">{selectedDemo.label}</h3>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2">{selectedDemo.email}</p>
                                </div>
                            </div>

                            <form onSubmit={handleDemoSubmit} className="space-y-6">
                                <div className="space-y-3">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">AUTHORIZED PASSWORD</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-600 transition-colors" size={24}/>
                                        <input 
                                            autoFocus
                                            type="password"
                                            placeholder="••••••••" 
                                            className="w-full pl-14 pr-4 py-6 bg-white border-2 border-gray-100 rounded-3xl font-black text-2xl text-center text-gray-900 focus:ring-4 focus:ring-indigo-50/10 focus:border-indigo-500 outline-none transition-all placeholder:text-gray-100 shadow-inner-sm"
                                            value={demoPassword}
                                            onChange={e => setDemoPassword(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <button 
                                    type="submit"
                                    className="w-full py-6 bg-indigo-600 text-white rounded-3xl font-black text-xs uppercase tracking-[0.25em] shadow-xl hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-4"
                                >
                                    Verify & Access <ArrowRight size={20} />
                                </button>
                            </form>
                        </div>
                    ) : (
                        <>
                            {/* OFFICIAL HQ LOGIN SECTION */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-[11px] font-black text-gray-300 uppercase tracking-[0.4em]">Official Entry</p>
                                    <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-100">
                                        <Circle className="fill-emerald-500 w-1.5 h-1.5 animate-pulse" /> VERIFIED SYSTEM
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setSelectedDemo({ label: 'PLATFORM ZERO HQ', email: 'admin@pz.com', color: 'bg-[#0F172A] border-slate-800 hover:bg-black' })} 
                                    className="w-full flex items-center justify-between p-10 rounded-[2.5rem] bg-[#0F172A] text-white shadow-2xl hover:bg-black transition-all group active:scale-[0.99] border-2 border-slate-800"
                                >
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-white border border-white/5 shadow-inner group-hover:rotate-12 transition-transform duration-500">
                                            <ShieldEllipsis size={32} />
                                        </div>
                                        <div className="text-left">
                                            <h3 className="text-2xl font-black tracking-tight leading-none mb-1.5 uppercase">PLATFORM ZERO HQ</h3>
                                            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">Market Operations Terminal</p>
                                        </div>
                                    </div>
                                    <div className="bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                        <ArrowRight size={28} className="group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </button>
                            </div>

                            {/* FAST-TRACK LOGIN SECTION */}
                            <div className="bg-[#F8FAFF] p-10 rounded-[3rem] border border-[#E0E7FF] shadow-inner-sm relative group">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#5C56D6] shadow-sm border border-[#E0E7FF]"><Key size={24} strokeWidth={2.5}/></div>
                                    <div>
                                        <h3 className="font-black text-gray-900 uppercase text-sm tracking-tight leading-none">Fast-Track Login</h3>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1.5">Enter your 6-digit access code</p>
                                    </div>
                                </div>
                                <form onSubmit={handleCodeSubmit} className="flex gap-4">
                                    <input 
                                        placeholder="ABCDEF" 
                                        className="flex-1 bg-white border-2 border-[#E0E7FF] rounded-[1.75rem] px-8 py-6 font-black tracking-[0.5em] uppercase text-4xl text-center text-gray-900 focus:ring-4 focus:ring-[#5C56D6]/5 focus:border-[#5C56D6] outline-none transition-all placeholder:text-gray-100 shadow-sm"
                                        maxLength={6}
                                        value={accessCode}
                                        onChange={e => setAccessCode(e.target.value)}
                                    />
                                    <button 
                                        type="submit"
                                        disabled={isProcessing || !accessCode}
                                        className="bg-[#C7D2FE] text-white px-10 py-6 rounded-[1.75rem] shadow-xl hover:bg-[#5C56D6] transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center"
                                    >
                                        {isProcessing ? <Loader2 size={32} className="animate-spin" /> : <ArrowRight size={40} strokeWidth={3} />}
                                    </button>
                                </form>
                            </div>

                            {/* DEMO PERSPECTIVES GRID */}
                            <div className="space-y-6">
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
                                    <div className="relative flex justify-center text-[11px] font-black uppercase tracking-[0.4em]"><span className="px-8 bg-white text-gray-300">Demo Perspectives</span></div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    {demoLogins.map(demo => (
                                        <button 
                                            key={demo.label} 
                                            onClick={() => setSelectedDemo(demo)} 
                                            className={`flex items-center justify-between p-10 rounded-[2.5rem] border-2 transition-all group ${demo.color} text-left active:scale-[0.98] shadow-sm hover:shadow-xl`}
                                        >
                                            <div className="text-left">
                                                <span className="text-[13px] font-black text-gray-900 uppercase tracking-widest block mb-1">{demo.label}</span>
                                                <span className="text-[11px] text-gray-400 font-bold uppercase tracking-tight block opacity-60 group-hover:opacity-100 transition-opacity">{demo.email}</span>
                                            </div>
                                            <div className="p-3 rounded-xl bg-white/50 border border-white group-hover:bg-white transition-all shadow-sm">
                                                <ArrowRight size={20} className="text-gray-400 group-hover:text-gray-900 transition-all group-hover:translate-x-1" strokeWidth={3}/>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default App;
