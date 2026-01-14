import React, { useState, useRef } from 'react';
import { 
  Upload, ArrowRight, CheckCircle, Calendar, DollarSign, 
  FileText, Loader2, MapPin, Mail, Phone, 
  Building, User, Clock, Star, X, Table, Rocket, 
  Sprout, Store, ShoppingCart, ChevronDown, UploadCloud, 
  TrendingDown, Sparkles, ArrowLeft, ClipboardCheck,
  CheckCircle2, Wind, ShieldCheck
} from 'lucide-react';
import { mockService, INDUSTRIES } from '../services/mockDataService';
import { UserRole, Industry } from '../types';
import { CompleteProfileModal } from './CompleteProfileModal';
import { extractInvoiceItems, InvoiceItem } from '../services/geminiService';

export const ConsumerLanding: React.FC<{ onLogin?: () => void }> = ({ onLogin }) => {
  const [step, setStep] = useState<1 | 2 | 4 | 5>(1);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  
  const [tempUserId, setTempUserId] = useState<string | null>(null);

  const [analysisItems, setAnalysisItems] = useState<InvoiceItem[]>([]);
  const [savingsMetrics, setSavingsMetrics] = useState({
    weekly: 0,
    monthly: 0,
    annual: 0,
    co2: 0
  });

  const [formData, setFormData] = useState({
    role: UserRole.CONSUMER as UserRole,
    industry: 'Cafe' as Industry,
    businessName: '',
    location: '',
    email: '',
    name: '',
    mobile: '',
    weeklySpend: '',
    orderFreq: '1-2 (Weekly)',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleSelect = (role: UserRole) => {
    setFormData({ ...formData, role });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleProfileComplete = () => {
    setStep(5);
  };

  const handleSubmitLead = async () => {
    if (!formData.businessName || !formData.email || !formData.name) {
        alert("Please complete the required fields.");
        return;
    }

    setIsSubmittingLead(true);
    
    try {
      const mockLeadId = `u-lead-${Date.now()}`;
      setTempUserId(mockLeadId);

      let invoiceBase64 = '';
      if (formData.role === UserRole.CONSUMER && file) {
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onload = (e) => resolve((e.target?.result as string).split(',')[1]);
          reader.readAsDataURL(file);
        });
        invoiceBase64 = await base64Promise;
        const items = await extractInvoiceItems(invoiceBase64, file.type);
        
        if (items && items.length > 0) {
          setAnalysisItems(items);
          const weeklySavings = items.reduce((sum, item) => sum + (item.marketRate - item.pzRate) * item.qty, 0);
          setSavingsMetrics({
            weekly: weeklySavings,
            monthly: weeklySavings * 4.33,
            annual: weeklySavings * 52,
            co2: weeklySavings * 1.4
          });
          
          setStep(2);
        } else {
          setStep(4);
        }
      } else {
        await new Promise(r => setTimeout(r, 1200));
        setStep(4);
      }

      mockService.submitConsumerSignup({
        ...formData,
        id: mockLeadId,
        orderFrequency: formData.orderFreq,
        weeklySpend: parseFloat(formData.weeklySpend) || 0,
        invoiceFile: file ? `data:${file.type};base64,${invoiceBase64}` : undefined,
        requestedRole: formData.role
      });

    } catch (err) {
      console.error("Analysis failed", err);
      setStep(4);
    } finally {
      setIsSubmittingLead(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] font-sans text-gray-900 flex flex-col relative overflow-x-hidden">
      <div className="max-w-[1440px] mx-auto px-6 py-12 flex-1 flex flex-col items-center justify-center w-full">
        
        {step === 1 && (
          <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-24 animate-in fade-in duration-700">
              
              {/* Left Column: Benefits & Value Prop */}
              <div className="flex-1 max-w-xl space-y-10">
                <div className="space-y-6">
                    <h1 className="text-6xl md:text-8xl font-black text-[#0F172A] tracking-tighter leading-[0.9]">
                        Stop<br/>overpaying for<br/>
                        <span className="text-[#10B981]">fresh produce.</span>
                    </h1>
                    <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-lg">
                        Join the marketplace connecting restaurants directly to farms and wholesalers. Upload your invoice, and we'll show you exactly how much you'll save.
                    </p>
                </div>

                <div className="space-y-6">
                    {[
                        "DIRECT-TO-SOURCE PRICING",
                        "CONSOLIDATED BILLING & LOGISTICS",
                        "REDUCE FOOD WASTE & CARBON FOOTPRINT"
                    ].map((benefit) => (
                        <div key={benefit} className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white border border-[#10B981] rounded-full flex items-center justify-center text-[#10B981] shadow-sm">
                                <CheckCircle2 size={24} strokeWidth={2.5} />
                            </div>
                            <span className="text-sm font-black text-[#0F172A] tracking-widest uppercase">{benefit}</span>
                        </div>
                    ))}
                </div>

                <div className="bg-[#EBFDF5] border border-[#D1FAE5] rounded-[2rem] p-8 max-w-md relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12 group-hover:rotate-0 transition-transform">
                        <Sparkles size={100} className="text-[#059669]"/>
                    </div>
                    <div className="flex items-center gap-3 mb-3">
                        <Star size={18} className="text-[#059669] fill-[#059669]"/>
                        <span className="text-[10px] font-black text-[#059669] uppercase tracking-[0.3em]">LIMITED OFFER</span>
                    </div>
                    <p className="text-lg font-bold text-[#064E3B] leading-snug">
                        Book an onboarding call today and receive <span className="text-[#10B981] font-black">$1,000 credit</span> in your portal.
                    </p>
                </div>
              </div>

              {/* Right Column: The Form Card */}
              <div className="bg-white p-8 md:p-12 rounded-[4rem] shadow-[0_30px_100px_-20px_rgba(0,0,0,0.1)] border border-gray-100 w-full max-w-2xl shrink-0">
                <h2 className="text-[28px] font-black text-[#0F172A] uppercase tracking-tight mb-8 text-center">Get Your Savings Analysis</h2>

                {/* Role Selector Tabs */}
                <div className="bg-gray-100/60 p-1.5 rounded-[2rem] flex mb-10 border border-gray-100">
                  <button 
                    onClick={() => handleRoleSelect(UserRole.CONSUMER)} 
                    className={`flex-1 flex flex-col items-center justify-center py-5 rounded-[1.75rem] transition-all gap-2 ${formData.role === UserRole.CONSUMER ? 'bg-white shadow-xl text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <ShoppingCart size={24} className={formData.role === UserRole.CONSUMER ? "text-blue-600" : "text-gray-300"} />
                    <span className="text-[11px] font-black uppercase tracking-[0.2em]">Buyer</span>
                  </button>
                  <button 
                    onClick={() => handleRoleSelect(UserRole.WHOLESALER)} 
                    className={`flex-1 flex flex-col items-center justify-center py-5 rounded-[1.75rem] transition-all gap-2 ${formData.role === UserRole.WHOLESALER ? 'bg-white shadow-xl text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <Building size={24} className={formData.role === UserRole.WHOLESALER ? "text-indigo-600" : "text-gray-300"} />
                    <span className="text-[11px] font-black uppercase tracking-[0.2em]">Supplier</span>
                  </button>
                  <button 
                    onClick={() => handleRoleSelect(UserRole.FARMER)} 
                    className={`flex-1 flex flex-col items-center justify-center py-5 rounded-[1.75rem] transition-all gap-2 ${formData.role === UserRole.FARMER ? 'bg-white shadow-xl text-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <Sprout size={24} className={formData.role === UserRole.FARMER ? "text-emerald-600" : "text-gray-300"} />
                    <span className="text-[11px] font-black uppercase tracking-[0.2em]">Farmer</span>
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Row 1: Name & Mobile */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">YOUR NAME</label>
                      <div className="relative group">
                        <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-500 transition-colors" size={18}/>
                        <input name="name" value={formData.name} onChange={handleInputChange} placeholder="John Doe" className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-900 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-50/10 transition-all text-sm" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">MOBILE</label>
                      <div className="relative group">
                        <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-500 transition-colors" size={18}/>
                        <input name="mobile" value={formData.mobile} onChange={handleInputChange} placeholder="0400 000 000" className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-900 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-50/10 transition-all text-sm" />
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Business Name */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">BUSINESS NAME</label>
                    <div className="relative group">
                      <Store className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-500 transition-colors" size={18}/>
                      <input name="businessName" value={formData.businessName} onChange={handleInputChange} placeholder="The Morning Cafe" className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-900 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-50/10 transition-all text-sm" />
                    </div>
                  </div>

                  {/* Row 3: Email & Location */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">EMAIL</label>
                      <div className="relative group">
                        <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-500 transition-colors" size={18}/>
                        <input name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="john@cafe.com" className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-900 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-50/10 transition-all text-sm" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">LOCATION</label>
                      <div className="relative group">
                        <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-500 transition-colors" size={18}/>
                        <input name="location" value={formData.location} onChange={handleInputChange} placeholder="Melbourne, VIC" className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-900 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-50/10 transition-all text-sm" />
                      </div>
                    </div>
                  </div>

                  {/* Row 4: Industry */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">INDUSTRY</label>
                    <div className="relative group">
                      <Building className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-500 transition-colors" size={18}/>
                      <select name="industry" value={formData.industry} onChange={handleInputChange} className="w-full pl-12 pr-10 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-900 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-50/10 transition-all text-sm appearance-none cursor-pointer">
                        {INDUSTRIES.map(ind => <option key={ind} value={ind}>{ind}</option>)}
                      </select>
                      <ChevronDown size={20} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Row 5: Spend & Freq */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">WEEKLY SPEND ($)</label>
                      <div className="relative group">
                        <DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-500 transition-colors" size={18}/>
                        <input name="weeklySpend" type="number" value={formData.weeklySpend} onChange={handleInputChange} placeholder="2500" className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-900 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-50/10 transition-all text-sm" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">ORDERS / MONTH</label>
                      <div className="relative group">
                        <Clock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-500 transition-colors" size={18}/>
                        <select name="orderFreq" value={formData.orderFreq} onChange={handleInputChange} className="w-full pl-12 pr-10 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-900 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-50/10 transition-all text-sm appearance-none cursor-pointer">
                          <option value="1-2 (Weekly)">1-2 (Weekly)</option>
                          <option value="3-5 (Bi-Weekly)">3-5 (Bi-Weekly)</option>
                          <option value="Daily">Daily</option>
                        </select>
                        <ChevronDown size={20} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  </div>

                  {/* Invoice Upload Area */}
                  {formData.role === UserRole.CONSUMER && (
                    <div className="space-y-2 animate-in slide-in-from-top-2">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">UPLOAD RECENT INVOICE</label>
                      <div 
                        onClick={() => fileInputRef.current?.click()} 
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }} 
                        onDragLeave={() => setIsDragging(false)} 
                        onDrop={(e) => { e.preventDefault(); setIsDragging(false); if(e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]); }} 
                        className={`border-2 border-dashed rounded-[2.5rem] p-8 text-center transition-all cursor-pointer bg-white group ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50/50'}`}
                      >
                          <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept=".pdf,image/*" />
                          {file ? (
                              <div className="flex flex-col items-center gap-1">
                                <CheckCircle size={40} className="text-[#10B981] mb-2" />
                                <span className="text-sm font-black text-gray-900 truncate max-w-full px-4">{file.name}</span>
                                <button onClick={(e) => { e.stopPropagation(); setFile(null); }} className="text-[10px] text-red-500 font-black uppercase mt-3 hover:underline tracking-widest">Remove</button>
                              </div>
                          ) : (
                              <div className="flex flex-col items-center">
                                <UploadCloud size={40} className="text-gray-300 mb-3 transition-transform group-hover:scale-110" />
                                <p className="text-xs font-black text-gray-900 uppercase tracking-[0.1em]">CLICK TO UPLOAD OR DRAG AND DROP</p>
                                <p className="text-[10px] text-gray-400 mt-1 font-bold uppercase tracking-widest">PDF or Image to compare prices</p>
                              </div>
                          )}
                      </div>
                    </div>
                  )}

                  <button 
                    onClick={handleSubmitLead} 
                    disabled={isSubmittingLead} 
                    className="w-full py-6 bg-[#0B1221] text-white rounded-[2.5rem] font-black text-sm uppercase tracking-[0.3em] flex items-center justify-center gap-4 shadow-[0_20px_40px_rgba(0,0,0,0.2)] hover:bg-black hover:scale-[1.02] transition-all active:scale-[0.98] disabled:opacity-50 mt-10 group"
                  >
                    {isSubmittingLead ? <Loader2 size={24} className="animate-spin" /> : <><span className="mt-0.5">ANALYZE & SEE SAVINGS</span><ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" /></>}
                  </button>

                  <div className="text-center mt-10">
                    <button onClick={onLogin} className="text-[11px] font-black text-gray-400 hover:text-[#10B981] uppercase tracking-[0.2em] transition-colors">ALREADY HAVE AN ACCOUNT? LOGIN</button>
                  </div>
                </div>
              </div>
          </div>
        )}
        
        {step === 2 && (
          <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in zoom-in-95 duration-500 w-full">
             <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-5 py-2 rounded-full border border-emerald-100 shadow-sm animate-bounce">
                    <Sparkles size={18}/>
                    <span className="text-xs font-black uppercase tracking-[0.15em]">Analysis Complete</span>
                </div>
                <h2 className="text-4xl md:text-[48px] font-black text-[#0F172A] tracking-tighter leading-none">Your Potential Savings</h2>
                <p className="text-gray-500 text-lg font-medium max-w-2xl mx-auto">We've matched your invoice against Platform Zero's source pricing floor.</p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl shadow-slate-200/50 flex flex-col justify-between group hover:border-emerald-200 transition-all">
                    <div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Weekly Savings</span>
                        <h3 className="text-4xl font-black text-[#0F172A] tracking-tighter">${savingsMetrics.weekly.toFixed(0)}</h3>
                    </div>
                </div>

                <div className="bg-[#043003] p-10 rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col justify-between transform md:scale-105 z-10 text-white">
                    <div className="absolute top-0 right-0 p-12 opacity-5 transform rotate-12 scale-150"><TrendingDown size={140} className="text-emerald-400"/></div>
                    <div className="relative z-10">
                        <span className="text-[10px] font-black text-emerald-400/60 uppercase tracking-widest block mb-2">Monthly Savings</span>
                        <h3 className="text-5xl md:text-6xl font-black text-white tracking-tighter">${savingsMetrics.monthly.toFixed(0)}</h3>
                    </div>
                </div>

                <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl shadow-slate-200/50 flex flex-col justify-between group hover:border-emerald-200 transition-all">
                    <div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Annual Savings</span>
                        <h3 className="text-4xl font-black text-[#0F172A] tracking-tighter">${savingsMetrics.annual.toLocaleString()}</h3>
                    </div>
                </div>
             </div>

             <div className="bg-white rounded-[3rem] border border-gray-100 p-10 shadow-sm overflow-hidden">
                <h4 className="font-black text-gray-900 text-lg uppercase tracking-tight mb-8 flex items-center gap-3">
                    <Table size={24} className="text-indigo-100"/> Itemized Quote Comparison
                </h4>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-b border-gray-100">
                            <tr className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
                                <th className="pb-6 pr-4">Product Identity</th>
                                <th className="pb-6 text-center">Qty</th>
                                <th className="pb-6 text-right px-4">Org Rate</th>
                                <th className="pb-6 text-right px-4 text-emerald-600">PZ Rate</th>
                                <th className="pb-6 text-right">Savings</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {analysisItems.map((item, idx) => (
                                <tr key={idx} className="group hover:bg-gray-50/50 transition-colors">
                                    <td className="py-6 font-black text-gray-900 uppercase text-xs tracking-tight">{item.name}</td>
                                    <td className="py-6 text-center font-black text-gray-500">{item.qty}</td>
                                    <td className="py-6 text-right px-4 font-bold text-gray-400 line-through">${item.marketRate.toFixed(2)}</td>
                                    <td className="py-6 text-right px-4 font-black text-emerald-600 text-lg">${item.pzRate.toFixed(2)}</td>
                                    <td className="py-6 text-right">
                                        <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-xl text-[10px] font-black uppercase border border-emerald-200 shadow-sm">
                                            -{(((item.marketRate - item.pzRate) / item.marketRate) * 100).toFixed(0)}%
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
             </div>

             <div className="flex flex-col sm:flex-row gap-6 pt-4">
                 <button onClick={() => setStep(1)} className="flex-1 py-6 bg-white border-2 border-gray-200 rounded-[2.5rem] font-black text-sm uppercase tracking-[0.2em] text-gray-400 hover:bg-gray-50 transition-all flex items-center justify-center gap-3">
                    <ArrowLeft size={20}/> Retake Analysis
                 </button>
                 <button onClick={() => setStep(4)} className="flex-[2] py-6 bg-[#0F172A] text-white rounded-[2.5rem] font-black text-sm uppercase tracking-[0.3em] shadow-2xl hover:bg-black transition-all flex items-center justify-center gap-4 group">
                    Claim Savings & Finalize Lead <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform"/>
                 </button>
             </div>
          </div>
        )}

        {step === 4 && (
          <div className="max-w-[800px] mx-auto text-center space-y-12 animate-in zoom-in-95 duration-500 w-full px-4">
             <div className="inline-flex items-center gap-2 bg-[#D1FAE5] text-[#065F46] px-6 py-3 rounded-full font-black uppercase text-[11px] tracking-widest shadow-sm">
                APPLICATION RECEIVED & LOGGED
             </div>
             
             <div className="space-y-4">
                <h2 className="text-[48px] font-black text-[#0F172A] tracking-tighter leading-tight">Identity Secured</h2>
                <p className="text-[#64748B] text-lg font-medium leading-relaxed max-w-[480px] mx-auto">
                    Your savings audit has been dispatched to the Platform Zero HQ. We'll be in touch shortly to activate your trading hub.
                </p>
             </div>

             <div className="space-y-6 max-w-[500px] mx-auto">
                <div className="bg-white rounded-[3rem] border-2 border-[#10B981] p-10 text-left relative overflow-hidden group shadow-sm hover:shadow-xl transition-all">
                    <div className="absolute top-0 right-0 bg-[#10B981] text-white px-8 py-3 text-[10px] font-black uppercase tracking-widest rounded-bl-[1.5rem] shadow-md">
                        HQ FAST TRACK
                    </div>
                    <div className="flex items-center gap-8">
                        <div className="w-20 h-20 bg-[#F0FDF4] rounded-3xl flex items-center justify-center text-[#10B981] border border-[#DCFCE7] shadow-inner-sm shrink-0">
                            <ClipboardCheck size={40} strokeWidth={2.5}/>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Setup Profile</h3>
                            <p className="text-sm text-slate-500 font-medium leading-relaxed mt-2">Finalise business and logistics details for immediate HQ verification.</p>
                            <button 
                                onClick={() => setIsProfileModalOpen(true)}
                                className="mt-6 flex items-center gap-3 text-[#10B981] font-black text-[12px] uppercase tracking-widest group-hover:gap-4 transition-all"
                            >
                                START ONBOARDING <ArrowRight size={18} strokeWidth={3}/>
                            </button>
                        </div>
                    </div>
                </div>
             </div>

             <div className="pt-12 border-t border-gray-100">
                <div className="flex items-center justify-center gap-2 text-gray-400 font-black text-[10px] uppercase tracking-[0.3em]">
                   Verified B2B Marketplace Protocol
                </div>
             </div>

             <div className="pt-6">
                <button onClick={() => setStep(1)} className="text-[11px] font-black text-gray-400 hover:text-slate-900 uppercase tracking-[0.4em] transition-colors">BACK TO START</button>
             </div>
          </div>
        )}

        {step === 5 && (
          <div className="max-w-2xl mx-auto text-center space-y-12 animate-in zoom-in-95 duration-500 py-12 w-full">
             <div className="w-28 h-28 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 shadow-inner-sm border-2 border-emerald-200">
                <CheckCircle size={56} />
             </div>
             <div>
                <h2 className="text-5xl font-black text-[#0F172A] tracking-tighter uppercase leading-none mb-8">Profile Submitted</h2>
                <div className="bg-white p-12 rounded-[3.5rem] border-2 border-gray-100 shadow-sm">
                    <p className="text-2xl text-[#043003] font-black leading-relaxed uppercase tracking-tight">
                        Identity verified. <br/>A PZ representative will contact you within the next business day.
                    </p>
                </div>
             </div>
             
             <div className="space-y-6">
                 <div className="flex items-center justify-center gap-3 text-[#64748B] font-black text-xs uppercase tracking-widest">
                    <Clock size={20} className="text-emerald-500" /> Awaiting Verification
                 </div>
                 <button onClick={() => setStep(1)} className="px-14 py-6 bg-[#0B1221] text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.4em] shadow-2xl hover:bg-black transition-all active:scale-95">Return to Marketplace</button>
             </div>
          </div>
        )}

      </div>

      <CompleteProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)}
        user={{
            id: tempUserId || 'u-new-lead',
            name: formData.name,
            businessName: formData.businessName,
            role: formData.role,
            email: formData.email,
            phone: formData.mobile,
            industry: formData.industry
        } as any}
        onComplete={handleProfileComplete}
      />
    </div>
  );
};
