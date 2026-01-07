
import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { DriverManagement } from './DriverManagement';
import { PackerManagement } from './PackerManagement';
import { mockService } from '../services/mockDataService';
import { CompleteProfileModal } from './CompleteProfileModal';
import { 
  User as UserIcon, Truck, Building, Mail, Shield, Users, 
  Plus, X, Briefcase, LayoutTemplate, RefreshCw, ToggleLeft, 
  ToggleRight, CheckCircle, AlertTriangle, Smartphone, BellRing,
  Phone, ShieldAlert, CheckCircle2
} from 'lucide-react';

interface SettingsProps {
  user: User;
  onRefreshUser?: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ user, onRefreshUser }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'team' | 'employees' | 'partners'>('profile');
  const [teamSubTab, setTeamSubTab] = useState<'drivers' | 'packers'>('drivers');
  const [employees, setEmployees] = useState<User[]>([]);
  const [partners, setPartners] = useState<User[]>([]); 
  
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [newEmployee, setNewEmployee] = useState<Partial<User>>({ name: '', email: '', role: UserRole.PZ_REP });

  // SMS Preference State
  const [smsEnabled, setSmsEnabled] = useState(user.smsNotificationsEnabled || false);
  const [smsPhone, setSmsPhone] = useState(user.phone || '');

  useEffect(() => {
      if (user.role === UserRole.ADMIN) {
          setEmployees(mockService.getPzRepresentatives());
          setPartners(mockService.getAllUsers().filter(u => u.role === UserRole.WHOLESALER || u.role === UserRole.FARMER));
      }
      setSmsEnabled(user.smsNotificationsEnabled || false);
      setSmsPhone(user.phone || '');
  }, [user, activeTab]);

  const handleAddEmployee = (e: React.FormEvent) => {
      e.preventDefault();
      if (newEmployee.name && newEmployee.email) {
          const newUser: User = {
              id: `emp-${Date.now()}`,
              name: newEmployee.name,
              email: newEmployee.email,
              role: UserRole.PZ_REP,
              businessName: 'Platform Zero'
          };
          mockService.addEmployee(newUser);
          setEmployees(mockService.getPzRepresentatives());
          setIsEmployeeModalOpen(false);
          setNewEmployee({ name: '', email: '', role: UserRole.PZ_REP });
          alert("Employee added successfully!");
      }
  };

  const handleSwitchToV1 = () => {
      if (confirm('Switch to Simplified Dashboard (Version 1)?')) {
          mockService.updateUserVersion(user.id, 'v1');
          if (onRefreshUser) onRefreshUser();
      }
  };

  const togglePartnerVersion = (partnerId: string, currentVersion: 'v1' | 'v2' | undefined) => {
      const newVersion = currentVersion === 'v2' ? 'v1' : 'v2';
      mockService.updateUserVersion(partnerId, newVersion);
      setPartners(mockService.getAllUsers().filter(u => u.role === UserRole.WHOLESALER || u.role === UserRole.FARMER));
  };

  const handleProfileComplete = () => {
      if(onRefreshUser) onRefreshUser();
      alert("Trade Profile Submitted! Platform Zero Admin will review your registration shortly.");
  };

  const handleSaveSmsPreference = () => {
      mockService.updateUserSmsPreference(user.id, smsEnabled, smsPhone);
      alert("Notification preferences updated!");
      if(onRefreshUser) onRefreshUser();
  };

  const isProfileComplete = user.businessProfile?.isComplete;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Account Settings</h1>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('profile')}
            className={`whitespace-nowrap py-4 px-1 border-b-4 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all ${
              activeTab === 'profile'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-gray-400 hover:text-gray-700'
            }`}
          >
            <UserIcon size={14} strokeWidth={3} />
            My Identity
          </button>

          {user.role === UserRole.WHOLESALER && (
            <button
              onClick={() => setActiveTab('team')}
              className={`whitespace-nowrap py-4 px-1 border-b-4 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all ${
                activeTab === 'team'
                  ? 'border-emerald-600 text-emerald-600'
                  : 'border-transparent text-gray-400 hover:text-gray-700'
              }`}
            >
              <Truck size={14} strokeWidth={3} />
              Fleet & Crew
            </button>
          )}

          {user.role === UserRole.ADMIN && (
            <>
                <button
                onClick={() => setActiveTab('partners')}
                className={`whitespace-nowrap py-4 px-1 border-b-4 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all ${
                    activeTab === 'partners'
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-gray-400 hover:text-gray-700'
                }`}
                >
                <Briefcase size={14} strokeWidth={3} />
                Partner Network
                </button>
                <button
                onClick={() => setActiveTab('employees')}
                className={`whitespace-nowrap py-4 px-1 border-b-4 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all ${
                    activeTab === 'employees'
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-gray-400 hover:text-gray-700'
                }`}
                >
                <Users size={14} strokeWidth={3} />
                PZ Reps
                </button>
            </>
          )}
        </nav>
      </div>

      {/* Content */}
      <div className="mt-6">
        {activeTab === 'profile' && (
          <div className="space-y-8">
            
            {/* ENHANCED PROFILE COMPLETION STATUS */}
            <div className={`p-8 rounded-[2.5rem] border-2 transition-all flex flex-col md:flex-row items-center gap-8 ${isProfileComplete ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100 shadow-xl shadow-red-500/5'}`}>
                <div className={`w-20 h-20 rounded-[1.75rem] flex items-center justify-center shrink-0 shadow-lg ${isProfileComplete ? 'bg-white text-emerald-600' : 'bg-white text-red-500'}`}>
                    {isProfileComplete ? <CheckCircle2 size={40} strokeWidth={2.5}/> : <ShieldAlert size={40} strokeWidth={2.5} className="animate-pulse"/>}
                </div>
                <div className="flex-1 text-center md:text-left">
                    <h4 className={`text-xl font-black uppercase tracking-tight ${isProfileComplete ? 'text-emerald-900' : 'text-red-900'}`}>
                        {isProfileComplete ? 'Trade Profile Verified' : 'Action Required: Registration Incomplete'}
                    </h4>
                    <p className={`text-sm font-medium mt-1 ${isProfileComplete ? 'text-emerald-700' : 'text-red-700'}`}>
                        {isProfileComplete 
                          ? 'Your official marketplace identity is finalized. You have full access to all trade and clearing features.' 
                          : 'Marketplace logic is restricted. You must finalize your business setup and NDA before trading.'}
                    </p>
                </div>
                <button 
                    onClick={() => setIsProfileModalOpen(true)}
                    className={`px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95 whitespace-nowrap ${
                        isProfileComplete 
                        ? 'bg-white text-gray-400 border border-gray-100 hover:text-gray-900' 
                        : 'bg-red-600 text-white hover:bg-black'
                    }`}
                >
                    {isProfileComplete ? 'Modify Profile' : 'Finalize Registration'}
                </button>
            </div>

            <div className="bg-white shadow-sm rounded-[2.5rem] overflow-hidden border border-gray-100 p-10">
                <div className="flex items-center gap-8 mb-10">
                    <div className="h-24 w-24 bg-indigo-50 rounded-[2rem] flex items-center justify-center text-indigo-600 font-black text-4xl shadow-inner-sm border border-indigo-100/50">
                        {user.name.charAt(0)}
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase leading-none">{user.name}</h2>
                        <div className="flex items-center gap-3 mt-3">
                            <span className="text-gray-400 font-bold uppercase tracking-[0.2em] text-[10px]">{user.role}</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-200"></span>
                            <span className="text-gray-400 font-bold uppercase tracking-[0.2em] text-[10px]">{user.email}</span>
                        </div>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                    <div className="space-y-2">
                        <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Assigned Representative</label>
                        <div className="flex items-center gap-4 text-indigo-600 bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100 font-black uppercase text-sm">
                            <Users size={20} className="text-indigo-300"/>
                            Alex Johnson (Admin HQ)
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Business Trading Identity</label>
                        <div className="flex items-center gap-4 text-gray-900 bg-gray-50 p-5 rounded-2xl border border-gray-100 font-black text-sm uppercase">
                            <Building size={20} className="text-gray-300"/>
                            {user.businessName}
                        </div>
                    </div>
                </div>
            </div>

            {/* COMMUNICATION PREFERENCES */}
            <div className="bg-white shadow-sm rounded-[2.5rem] border border-gray-100 p-10 space-y-8">
                <div className="flex items-center gap-4 mb-2">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                        <BellRing size={24}/>
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Notification Engine</h3>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Real-time trade & logistics alerts</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="flex items-center justify-between p-6 bg-gray-50/50 rounded-3xl border border-gray-100">
                        <div className="flex items-center gap-4">
                            <div className={`p-4 rounded-2xl shadow-sm transition-all ${smsEnabled ? 'bg-emerald-600 text-white shadow-emerald-100' : 'bg-white text-gray-300 border border-gray-100'}`}>
                                <Smartphone size={24}/>
                            </div>
                            <div>
                                <p className="font-black text-gray-900 uppercase text-sm">SMS Market Alerts</p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Instant delivery arrival & dispute notifications</p>
                            </div>
                        </div>
                        <button onClick={() => setSmsEnabled(!smsEnabled)} className="transition-all active:scale-90">
                            {smsEnabled ? <ToggleRight size={48} className="text-emerald-500 fill-current"/> : <ToggleLeft size={48} className="text-gray-200"/>}
                        </button>
                    </div>

                    {smsEnabled && (
                        <div className="p-8 bg-indigo-50/30 rounded-[2rem] border border-indigo-100 animate-in slide-in-from-top-2">
                            <label className="block text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-2 ml-1">Verified Mobile (AUS)</label>
                            <div className="flex gap-3">
                                <div className="relative flex-1">
                                    <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-300"/>
                                    <input 
                                        type="tel" 
                                        placeholder="0400 000 000"
                                        className="w-full pl-12 pr-4 py-4 bg-white border border-indigo-100 rounded-2xl font-black text-indigo-900 outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                                        value={smsPhone}
                                        onChange={(e) => setSmsPhone(e.target.value)}
                                    />
                                </div>
                                <button 
                                    onClick={handleSaveSmsPreference}
                                    className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95"
                                >
                                    Verify Number
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* DASHBOARD VERSION TOGGLE */}
            {(user.role === UserRole.WHOLESALER || user.role === UserRole.FARMER) && (
                <div className="bg-[#0B1221] rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-10 opacity-5 transform rotate-12 scale-150 group-hover:rotate-0 transition-transform duration-700"><LayoutTemplate size={120}/></div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div>
                            <h3 className="text-2xl font-black tracking-tight flex items-center gap-3 uppercase">
                                <LayoutTemplate className="text-emerald-400" size={28}/> Interface Mode
                            </h3>
                            <p className="text-slate-400 text-sm font-medium mt-2 max-w-md">
                                Optimize your dashboard for high-volume trade. <span className="text-white font-black">Advanced (v2)</span> is currently active.
                            </p>
                        </div>
                        <button 
                            onClick={handleSwitchToV1}
                            className="w-full md:w-auto px-10 py-5 bg-white text-[#0B1221] font-black rounded-2xl shadow-xl hover:bg-emerald-400 transition-all active:scale-95 text-[10px] uppercase tracking-[0.2em]"
                        >
                            Simplified Mode
                        </button>
                    </div>
                </div>
            )}
          </div>
        )}

        {activeTab === 'team' && user.role === UserRole.WHOLESALER && (
          <div className="space-y-6">
              <div className="flex gap-4 border-b border-gray-200 pb-1">
                  <button 
                      onClick={() => setTeamSubTab('drivers')}
                      className={`pb-4 px-6 text-[10px] font-black uppercase tracking-widest transition-all border-b-4 ${teamSubTab === 'drivers' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-gray-400 hover:text-gray-700'}`}
                  >
                      Distribution Fleet
                  </button>
                  <button 
                      onClick={() => setTeamSubTab('packers')}
                      className={`pb-4 px-6 text-[10px] font-black uppercase tracking-widest transition-all border-b-4 ${teamSubTab === 'packers' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-gray-400 hover:text-gray-700'}`}
                  >
                      Warehouse Crew
                  </button>
              </div>
              
              {teamSubTab === 'drivers' ? (
                  <DriverManagement user={user} />
              ) : (
                  <PackerManagement user={user} />
              )}
          </div>
        )}

        {activeTab === 'partners' && user.role === UserRole.ADMIN && (
            <div className="space-y-8 animate-in fade-in duration-500">
                <div className="bg-white shadow-sm border border-gray-100 rounded-[2.5rem] overflow-hidden">
                    <div className="grid grid-cols-1 divide-y divide-gray-100">
                        {partners.map(p => (
                            <div key={p.id} className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-gray-50 transition-colors group">
                                <div className="flex items-center gap-6">
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black shadow-inner-sm border ${
                                        p.role === UserRole.FARMER ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                                    }`}>
                                        {p.businessName.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-black text-gray-900 text-lg uppercase tracking-tight flex items-center gap-3">
                                            {p.businessName}
                                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${
                                                p.role === UserRole.FARMER ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-blue-100 text-blue-700 border-blue-200'
                                            }`}>
                                                {p.role}
                                            </span>
                                        </div>
                                        <div className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">{p.name} • {p.email}</div>
                                        <div className="mt-2 flex items-center gap-2">
                                            {p.businessProfile?.isComplete ? (
                                                <span className="text-emerald-600 font-black text-[9px] uppercase tracking-widest flex items-center gap-1.5"><CheckCircle size={14}/> Verified Profile</span>
                                            ) : (
                                                <span className="text-red-500 font-black text-[9px] uppercase tracking-widest flex items-center gap-1.5"><AlertTriangle size={14}/> Incomplete Identity</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <button 
                                    onClick={() => togglePartnerVersion(p.id, p.dashboardVersion)}
                                    className={`flex items-center gap-3 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 ${
                                        p.dashboardVersion === 'v2' 
                                        ? 'bg-[#0F172A] text-white hover:bg-black' 
                                        : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100'
                                    }`}
                                >
                                    <RefreshCw size={14}/>
                                    Override to {p.dashboardVersion === 'v2' ? 'v1' : 'v2'}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'employees' && user.role === UserRole.ADMIN && (
            <div className="space-y-8 animate-in fade-in duration-500">
                <div className="flex justify-between items-center px-1">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Representatives</h2>
                        <p className="text-gray-500 font-medium text-sm">Manage HQ agents for sales and success.</p>
                    </div>
                    <button 
                        onClick={() => setIsEmployeeModalOpen(true)}
                        className="px-8 py-3 bg-[#043003] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-black transition-all flex items-center gap-2 active:scale-95"
                    >
                        <Plus size={18} strokeWidth={3}/> Add Agent
                    </button>
                </div>

                <div className="bg-white shadow-sm border border-gray-100 rounded-[2.5rem] overflow-hidden">
                    <div className="divide-y divide-gray-100">
                        {employees.map(emp => (
                            <div key={emp.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-5">
                                    <div className="h-14 w-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-black text-xl shadow-inner-sm border border-indigo-100/50">
                                        {emp.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-black text-gray-900 text-lg uppercase tracking-tight">{emp.name}</div>
                                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{emp.email}</div>
                                    </div>
                                </div>
                                <span className="px-5 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-[10px] font-black uppercase tracking-widest border border-indigo-100 shadow-inner-sm">
                                    Market Success Rep
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}
      </div>

      {/* Complete Profile Modal */}
      <CompleteProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)}
        user={user}
        onComplete={handleProfileComplete}
      />
    </div>
  );
};
