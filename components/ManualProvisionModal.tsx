
import React, { useState } from 'react';
import { 
  X, Building, User, Mail, Smartphone, Sprout, Store, 
  ShoppingCart, Briefcase, ShieldCheck, Sparkles, Loader2, Check
} from 'lucide-react';
import { UserRole } from '../types';
import { mockService } from '../services/mockDataService';

interface ManualProvisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerated: (code: string, businessName: string) => void;
}

interface RoleOption {
  id: UserRole | 'MARKETPLACE';
  label: string;
  icon: React.ElementType;
  color: string;
}

const ROLE_OPTIONS: RoleOption[] = [
  { id: UserRole.FARMER, label: 'FARMER', icon: Sprout, color: 'text-emerald-500' },
  { id: UserRole.WHOLESALER, label: 'WHOLESALER', icon: Building, color: 'text-blue-500' },
  { id: UserRole.GROCERY, label: 'GROCER', icon: Store, color: 'text-orange-500' },
  { id: 'MARKETPLACE' as any, label: 'MARKETPLACE', icon: ShoppingCart, color: 'text-indigo-600' },
  { id: UserRole.PZ_REP, label: 'SALES REP', icon: Briefcase, color: 'text-slate-500' },
  { id: UserRole.ADMIN, label: 'PZ ADMIN', icon: ShieldCheck, color: 'text-blue-600' },
];

export const ManualProvisionModal: React.FC<ManualProvisionModalProps> = ({ isOpen, onClose, onGenerated }) => {
  const [selectedRole, setSelectedRole] = useState<string>('MARKETPLACE');
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    businessName: '',
    firstName: '',
    lastName: '',
    email: '',
    mobile: ''
  });

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGenerate = async () => {
    if (!formData.businessName || !formData.email) {
        alert("Please fill in Business Name and Email at minimum.");
        return;
    }
    
    setIsGenerating(true);
    await new Promise(r => setTimeout(r, 1200));
    
    const roleToProvision = selectedRole === 'MARKETPLACE' ? UserRole.CONSUMER : (selectedRole as UserRole);
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    mockService.submitConsumerSignup({
        businessName: formData.businessName,
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        mobile: formData.mobile,
        requestedRole: roleToProvision,
        id: `u-manual-${Date.now()}`
    });
    
    mockService.dispatchAccess(`manual-${Date.now()}`);
    
    setIsGenerating(false);
    onGenerated(code, formData.businessName);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-[#0F172A]/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 border border-gray-100 max-h-[90vh]">
        
        {/* Header - Compact */}
        <div className="p-6 md:p-8 pb-4 flex justify-between items-center border-b border-gray-50">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#043003] rounded-xl flex items-center justify-center text-white font-black text-lg shadow-md">
              P
            </div>
            <div>
              <h2 className="text-xl font-black text-[#0F172A] tracking-tight uppercase leading-none">Manual Provision</h2>
              <p className="text-[9px] text-emerald-600 font-black uppercase tracking-[0.15em] mt-1">Onboarding Protocol</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-300 hover:text-gray-900 p-2 bg-gray-50 rounded-full transition-all">
            <X size={20} strokeWidth={2.5}/>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar">
          
          {/* Identity Section - Tighter inputs */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-gray-400 mb-2">
               <User size={12} strokeWidth={3}/>
               <span className="text-[10px] font-black uppercase tracking-[0.2em]">Identity & Entity</span>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Trading Business Name</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-600 transition-colors">
                    <Building size={16}/>
                  </div>
                  <input 
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleInputChange}
                    placeholder="e.g. Green Valley Farms" 
                    className="w-full pl-10 pr-4 py-3 bg-[#F8FAFC] border border-gray-100 rounded-xl font-bold text-sm text-gray-900 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-50/10 focus:border-indigo-200 transition-all placeholder:text-gray-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">First Name</label>
                  <input 
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="Alex" 
                    className="w-full px-4 py-3 bg-[#F8FAFC] border border-gray-100 rounded-xl font-bold text-sm text-gray-900 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-50/10 focus:border-indigo-200 transition-all placeholder:text-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Last Name</label>
                  <input 
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Johnson" 
                    className="w-full px-4 py-3 bg-[#F8FAFC] border border-gray-100 rounded-xl font-bold text-sm text-gray-900 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-50/10 focus:border-indigo-200 transition-all placeholder:text-gray-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Business Email</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-600 transition-colors">
                      <Mail size={14}/>
                    </div>
                    <input 
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="name@business.com" 
                      className="w-full pl-10 pr-4 py-3 bg-[#F8FAFC] border border-gray-100 rounded-xl font-bold text-sm text-gray-900 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-50/10 focus:border-indigo-200 transition-all placeholder:text-gray-300"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Mobile Number</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-600 transition-colors">
                      <Smartphone size={14}/>
                    </div>
                    <input 
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleInputChange}
                      placeholder="0400 000 000" 
                      className="w-full pl-10 pr-4 py-3 bg-[#F8FAFC] border border-gray-100 rounded-xl font-bold text-sm text-gray-900 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-50/10 focus:border-indigo-200 transition-all placeholder:text-gray-300"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Portal Access Selection - Compact Grid */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-gray-400 mb-2">
               <ShieldCheck size={12} strokeWidth={3}/>
               <span className="text-[10px] font-black uppercase tracking-[0.2em]">Portal Access</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {ROLE_OPTIONS.map((option) => (
                <button
                  key={option.label}
                  onClick={() => setSelectedRole(option.id)}
                  className={`relative p-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-2 group ${
                    selectedRole === option.id 
                    ? 'border-indigo-600 bg-indigo-50/50 shadow-sm' 
                    : 'border-gray-50 bg-white text-gray-400 hover:border-indigo-100 hover:bg-gray-50'
                  }`}
                >
                  <option.icon size={24} className={`${selectedRole === option.id ? 'text-indigo-600' : option.color}`} />
                  <span className={`text-[9px] font-black uppercase tracking-widest ${selectedRole === option.id ? 'text-indigo-600' : ''}`}>{option.label}</span>
                  
                  {selectedRole === option.id && (
                    <div className="absolute top-2 right-2 bg-indigo-600 text-white rounded-full p-0.5 shadow-sm">
                      <Check size={8} strokeWidth={5}/>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Button - Scaled down */}
        <div className="p-6 md:p-8 border-t border-gray-50 bg-white">
          <button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full py-4 bg-[#0F172A] hover:bg-black text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-slate-200"
          >
            {isGenerating ? (
              <Loader2 className="animate-spin" size={16}/>
            ) : (
              <><Sparkles size={16} /> Generate Access Code</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
