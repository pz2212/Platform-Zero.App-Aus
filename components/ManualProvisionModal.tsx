
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
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  roleType: UserRole;
}

const ROLE_OPTIONS: RoleOption[] = [
  { id: 'FARMER', label: 'FARMER', icon: Sprout, color: 'text-emerald-500', roleType: UserRole.FARMER },
  { id: 'WHOLESALER', label: 'WHOLESALER', icon: Building, color: 'text-blue-500', roleType: UserRole.WHOLESALER },
  { id: 'GROCER', label: 'GROCER', icon: Store, color: 'text-orange-500', roleType: UserRole.GROCERY },
  { id: 'MARKETPLACE', label: 'MARKETPLACE', icon: ShoppingCart, color: 'text-indigo-600', roleType: UserRole.CONSUMER },
  { id: 'SALES_REP', label: 'SALES REP', icon: Briefcase, color: 'text-slate-400', roleType: UserRole.PZ_REP },
  { id: 'PZ_ADMIN', label: 'PZ ADMIN', icon: ShieldCheck, color: 'text-blue-600', roleType: UserRole.ADMIN },
];

export const ManualProvisionModal: React.FC<ManualProvisionModalProps> = ({ isOpen, onClose, onGenerated }) => {
  const [selectedRoleId, setSelectedRoleId] = useState<string>('MARKETPLACE');
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
        alert("Please fill in Business Name and Email.");
        return;
    }
    
    setIsGenerating(true);
    await new Promise(r => setTimeout(r, 1500));
    
    const selectedOption = ROLE_OPTIONS.find(o => o.id === selectedRoleId);
    const roleToProvision = selectedOption?.roleType || UserRole.CONSUMER;
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
    <div className="fixed inset-0 z-[500] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 border border-gray-100 max-h-[95vh]">
        
        {/* Header - Compacted padding */}
        <div className="p-8 pb-4 flex justify-between items-start">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 bg-[#043003] rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg">
              P
            </div>
            <div>
              <h2 className="text-2xl font-black text-[#0F172A] tracking-tighter uppercase leading-none">Manual Provision</h2>
              <p className="text-[10px] text-[#10B981] font-black uppercase tracking-widest mt-1.5">Onboarding Protocol</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-300 hover:text-gray-900 p-2 bg-gray-50 rounded-full transition-all">
            <X size={24} strokeWidth={2.5}/>
          </button>
        </div>

        {/* Scrollable Content - Tighter gaps */}
        <div className="flex-1 overflow-y-auto p-8 pt-4 space-y-8 no-scrollbar">
          
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-gray-400 mb-2">
               <User size={12} strokeWidth={3}/>
               <span className="text-[10px] font-black uppercase tracking-[0.2em]">Identity & Entity</span>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Trading Business Name</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-600 transition-colors">
                    <Building size={18}/>
                  </div>
                  <input 
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleInputChange}
                    placeholder="e.g. Green Valley Farms" 
                    className="w-full pl-12 pr-6 py-3.5 bg-[#F8FAFC] border border-gray-100 rounded-2xl font-bold text-gray-900 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-50/10 focus:border-indigo-200 transition-all placeholder:text-gray-300 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">First Name</label>
                  <input 
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="Alex" 
                    className="w-full px-5 py-3.5 bg-[#F8FAFC] border border-gray-100 rounded-2xl font-bold text-gray-900 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-50/10 focus:border-indigo-200 transition-all placeholder:text-gray-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Last Name</label>
                  <input 
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Johnson" 
                    className="w-full px-5 py-3.5 bg-[#F8FAFC] border border-gray-100 rounded-2xl font-bold text-gray-900 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-50/10 focus:border-indigo-200 transition-all placeholder:text-gray-300 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Business Email</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-600 transition-colors">
                      <Mail size={16}/>
                    </div>
                    <input 
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="name@business.com" 
                      className="w-full pl-12 pr-6 py-3.5 bg-[#F8FAFC] border border-gray-100 rounded-2xl font-bold text-gray-900 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-50/10 focus:border-indigo-200 transition-all placeholder:text-gray-300 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Mobile Number</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-600 transition-colors">
                      <Smartphone size={16}/>
                    </div>
                    <input 
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleInputChange}
                      placeholder="0400 000 000" 
                      className="w-full pl-12 pr-6 py-3.5 bg-[#F8FAFC] border border-gray-100 rounded-2xl font-bold text-gray-900 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-50/10 focus:border-indigo-200 transition-all placeholder:text-gray-300 text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-gray-400 mb-2">
               <ShieldCheck size={12} strokeWidth={3}/>
               <span className="text-[10px] font-black uppercase tracking-[0.2em]">Portal Access</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {ROLE_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setSelectedRoleId(option.id)}
                  className={`relative p-5 rounded-3xl border-2 transition-all flex flex-col items-center justify-center gap-2 group ${
                    selectedRoleId === option.id 
                    ? 'border-indigo-600 bg-white shadow-xl shadow-indigo-50 scale-[1.02]' 
                    : 'border-gray-50 bg-white hover:border-indigo-100 hover:bg-gray-50'
                  }`}
                >
                  <option.icon size={28} className={`${option.color}`} />
                  <span className={`text-[8px] font-black uppercase tracking-widest ${selectedRoleId === option.id ? 'text-indigo-600' : 'text-gray-400'}`}>
                    {option.label}
                  </span>
                  
                  {selectedRoleId === option.id && (
                    <div className="absolute top-3 right-3 bg-indigo-600 text-white rounded-full p-0.5 shadow-sm">
                      <Check size={10} strokeWidth={5}/>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-8 border-t border-gray-50 bg-white shrink-0">
          <button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full py-5 bg-[#0F172A] hover:bg-black text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50 shadow-xl shadow-slate-200"
          >
            {isGenerating ? (
              <Loader2 className="animate-spin" size={18}/>
            ) : (
              <><Sparkles size={18} /> Generate Access Code</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
