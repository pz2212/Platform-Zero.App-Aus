import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Building2, ShieldAlert, CheckCircle2, Mail, Phone, MapPin, 
  ChevronRight, Landmark, Users2, PackageSearch, HelpCircle,
  TrendingUp, Sparkles, Sprout, ShoppingCart, CheckCircle, Truck, BookOpen,
  Check, Loader2, Info
} from 'lucide-react';
import { User, UserRole, BusinessProfile } from '../types';
import { mockService } from '../services/mockDataService';

interface CompleteProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onComplete: () => void;
}

const TermsModal = ({ isOpen, onClose, onAccept }: { isOpen: boolean, onClose: () => void, onAccept: () => void }) => {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const isAtBottom = scrollHeight - scrollTop <= clientHeight + 50;
      if (isAtBottom) {
        setHasScrolledToBottom(true);
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => handleScroll(), 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200 border border-gray-100">
        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-white shrink-0">
          <div>
            <h2 className="text-2xl font-black text-[#0F172A] tracking-tight uppercase leading-none">Terms of Trade & NDA</h2>
            <p className="text-[10px] text-indigo-600 font-black uppercase tracking-widest mt-1">Platform Zero Legal Protocol</p>
          </div>
          <button onClick={onClose} className="text-gray-300 hover:text-gray-900 p-2 bg-gray-50 rounded-full">
            <X size={24} strokeWidth={2.5} />
          </button>
        </div>

        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-10 space-y-6 text-sm text-gray-600 leading-relaxed custom-scrollbar bg-white"
        >
          <div className="space-y-8">
            <section>
              <h3 className="font-black text-gray-900 text-lg uppercase tracking-tight mb-4">1. TRADE COMMITMENT</h3>
              <p>The user agrees that Platform Zero is a B2B procurement environment. All orders placed are binding. Standard payment terms are 7 days from the date of delivery unless using an approved third-party credit provider (e.g. American Express).</p>
            </section>

            <section>
              <h3 className="font-black text-gray-900 text-lg uppercase tracking-tight mb-4">2. QUALITY VERIFICATION</h3>
              <p>Platform Zero utilizes a high-trust verification system. The Buyer must verify all delivered goods within 1 hour of arrival. Issues reported after the 1-hour window or without photographic evidence may not be eligible for credit.</p>
            </section>

            <section className="bg-[#0F172A] p-8 rounded-3xl text-white">
              <h3 className="font-black text-emerald-400 text-lg uppercase tracking-tight mb-4 flex items-center gap-2">
                <ShieldAlert size={20}/> 3. NON-CIRCUMVENTION & NDA
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed mb-4">
                The User acknowledges that the Platform Zero Marketplace software, its design, supplier relationships, and operational logic are the exclusive intellectual property of Platform Zero Solutions.
              </p>
              <p className="text-slate-300 text-sm leading-relaxed">
                Users agree not to directly contact or trade with partners discovered via the platform outside of Platform Zero's clearing systems. Any attempt to circumvent Platform Zero's service fees results in immediate account termination and legal recovery for lost income.
              </p>
            </section>

            <section>
              <h3 className="font-black text-gray-900 text-lg uppercase tracking-tight mb-4">4. DATA PRIVACY</h3>
              <p>Business data and transaction history are utilized for market intelligence and logistics optimization. Platform Zero does not share individual pricing strategies with competitors.</p>
            </section>
          </div>
        </div>

        <div className="p-8 bg-gray-50 border-t border-gray-100 shrink-0">
          {!hasScrolledToBottom ? (
            <div className="text-center text-gray-400 font-black text-xs uppercase tracking-widest animate-pulse">
              Scroll to end of agreement to accept
            </div>
          ) : (
            <button 
              onClick={onAccept}
              className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-emerald-100 transition-all flex items-center justify-center gap-3"
            >
              <Check size={20} strokeWidth={4}/> Accept Terms & NDA
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Fix: Move helper components outside to fix React/TS scope and children inference errors
const SectionHeader = ({ icon: Icon, title, sub }: any) => (
  <div className="flex items-center gap-4 mb-6">
    <div className="w-12 h-12 bg-[#F0FDF4] rounded-2xl flex items-center justify-center text-[#10B981] shadow-inner-sm">
      <Icon size={24} strokeWidth={2.5}/>
    </div>
    <div>
      <h3 className="font-black text-[#0F172A] text-lg uppercase tracking-tight leading-none">{title}</h3>
      <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1.5">{sub}</p>
    </div>
  </div>
);

// Fix: Properly type InputLabel and define it outside the main component
const InputLabel: React.FC<React.PropsWithChildren<{}>> = ({ children }) => (
  <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">{children}</label>
);

// Fix: Define StyledInput outside the main component for better type safety and scope management
const StyledInput = ({ name, value, onChange, placeholder, required = true, type = "text" }: any) => (
  <input 
    name={name}
    value={value}
    onChange={onChange}
    type={type}
    placeholder={placeholder}
    required={required}
    className="w-full px-5 py-3.5 bg-[#F8FAFC] border border-gray-100 rounded-2xl font-bold text-gray-900 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-50/10 focus:border-indigo-200 transition-all placeholder:text-gray-300 text-sm"
  />
);

export const CompleteProfileModal: React.FC<CompleteProfileModalProps> = ({ isOpen, onClose, user, onComplete }) => {
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    businessName: user.businessName || '',
    abn: '',
    address: '',
    bankName: '',
    bsb: '',
    accountNumber: '',
    directorName: user.name || '',
    directorEmail: user.email || '',
    accountsName: '',
    accountsEmail: '',
    acceptTerms: false
  });

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAcceptTerms = () => {
    setFormData(prev => ({ ...prev, acceptTerms: true }));
    setIsTermsOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.acceptTerms) {
      alert("Please review and accept the Terms of Trade to proceed.");
      return;
    }
    
    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 1500));

    mockService.updateBusinessProfile(user.id, {
      ...formData,
      isComplete: true,
    } as any);

    setIsSubmitting(false);
    onComplete();
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-[500] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
        <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-3xl my-8 animate-in zoom-in-95 duration-200 overflow-hidden border border-gray-100 flex flex-col max-h-[95vh]">
          
          <div className="p-8 pb-4 flex justify-between items-start shrink-0 bg-white">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 bg-[#043003] rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg">
                P
              </div>
              <div>
                <h2 className="text-2xl font-black text-[#0F172A] tracking-tighter uppercase leading-none">Marketplace Registration</h2>
                <p className="text-[10px] text-[#10B981] font-black uppercase tracking-widest mt-1.5">Official Trade Setup • B2B Protocol</p>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-300 hover:text-gray-900 p-2 bg-gray-50 rounded-full transition-all">
              <X size={24} strokeWidth={2.5} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-10 pt-4 space-y-10 custom-scrollbar">
            
            <section>
              <SectionHeader icon={Building2} title="Identity & Entity" sub="Business Identification" />
              <div className="space-y-4">
                <div>
                  <InputLabel>Full Trading Name</InputLabel>
                  <StyledInput name="businessName" value={formData.businessName} onChange={handleInputChange} placeholder="e.g. Fresh Wholesalers Pty Ltd" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <InputLabel>ABN</InputLabel>
                    <StyledInput name="abn" value={formData.abn} onChange={handleInputChange} placeholder="53 667 679 003" />
                  </div>
                  <div>
                    <InputLabel>Registered Business Address</InputLabel>
                    <StyledInput name="address" value={formData.address} onChange={handleInputChange} placeholder="e.g. Unit 4, 12 Market St, Pooraka SA" />
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-[#F0FDF4]/30 p-8 rounded-[2.5rem] border border-[#DCFCE7] relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-[0.03] rotate-12 group-hover:rotate-0 transition-transform duration-1000 pointer-events-none"><Landmark size={120}/></div>
              <SectionHeader icon={Landmark} title="Settlement Details" sub="For automated marketplace clearing" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <InputLabel>Bank Institution</InputLabel>
                  <StyledInput name="bankName" value={formData.bankName} onChange={handleInputChange} placeholder="e.g. CommBank" />
                </div>
                <div>
                  <InputLabel>BSB</InputLabel>
                  <StyledInput name="bsb" value={formData.bsb} onChange={handleInputChange} placeholder="000-000" />
                </div>
                <div>
                  <InputLabel>Account No.</InputLabel>
                  <StyledInput name="accountNumber" value={formData.accountNumber} onChange={handleInputChange} placeholder="12345678" />
                </div>
              </div>
            </section>

            <section>
              <SectionHeader icon={Users2} title="Decision Makers" sub="Director & Accounts Contacts" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[#4F46E5] font-black text-[9px] uppercase tracking-widest border-b border-indigo-50 pb-2 mb-4">
                    <CheckCircle size={14}/> Managing Director
                  </div>
                  <div>
                    <InputLabel>Full Name</InputLabel>
                    <StyledInput name="directorName" value={formData.directorName} onChange={handleInputChange} placeholder="Director's Name" />
                  </div>
                  <div>
                    <InputLabel>Business Email</InputLabel>
                    <StyledInput name="directorEmail" type="email" value={formData.directorEmail} onChange={handleInputChange} placeholder="director@company.com" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[#4F46E5] font-black text-[9px] uppercase tracking-widest border-b border-indigo-50 pb-2 mb-4">
                    <CheckCircle size={14}/> Accounts Payable
                  </div>
                  <div>
                    <InputLabel>Contact Name</InputLabel>
                    <StyledInput name="accountsName" value={formData.accountsName} onChange={handleInputChange} placeholder="AP Contact Name" />
                  </div>
                  <div>
                    <InputLabel>AP Email</InputLabel>
                    <StyledInput name="accountsEmail" type="email" value={formData.accountsEmail} onChange={handleInputChange} placeholder="accounts@company.com" />
                  </div>
                </div>
              </div>
            </section>

            <section className="pt-6 border-t border-gray-100">
               <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-slate-900 rounded-xl text-emerald-400"><ShieldAlert size={20}/></div>
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Legal Agreement</h3>
                  </div>
                  {formData.acceptTerms && <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-emerald-200">Authorized</span>}
               </div>
               
               <div 
                  onClick={() => setIsTermsOpen(true)}
                  className={`p-6 rounded-[2rem] border-2 transition-all cursor-pointer flex items-center justify-between group ${formData.acceptTerms ? 'border-emerald-200 bg-emerald-50/30' : 'border-gray-100 bg-gray-50 hover:border-indigo-100 hover:bg-white'}`}
               >
                  <div className="flex items-center gap-5">
                    <div className={`w-10 h-10 rounded-full border-4 flex items-center justify-center transition-all ${formData.acceptTerms ? 'bg-emerald-500 border-emerald-100 text-white' : 'bg-white border-gray-200 text-transparent'}`}>
                        <Check size={24} strokeWidth={4}/>
                    </div>
                    <div>
                        <p className="font-black text-gray-900 text-base leading-none mb-1.5 uppercase">Market Terms & NDA</p>
                        <p className="text-[11px] text-gray-400 font-medium">I verify that I am authorized to bind this business entity.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                      {formData.acceptTerms ? 'Review Again' : 'Read & Sign'} <ChevronRight size={14} strokeWidth={3}/>
                  </div>
               </div>
            </section>
          </form>

          <div className="p-8 border-t border-gray-100 bg-white shrink-0 flex gap-4">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-5 bg-gray-50 text-gray-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-100 transition-all active:scale-95"
            >
              Cancel
            </button>
            <button 
              onClick={handleSubmit}
              disabled={!formData.acceptTerms || isSubmitting}
              className="flex-[2] py-5 bg-[#0F172A] hover:bg-black text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-slate-200 transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={20}/> : <><CheckCircle2 size={20}/> Finalize Trade Identity</>}
            </button>
          </div>
        </div>
      </div>

      <TermsModal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} onAccept={handleAcceptTerms} />
    </>
  );
};
