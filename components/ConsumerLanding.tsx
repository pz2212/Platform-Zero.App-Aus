import React, { useState, useRef } from 'react';
import { 
  Upload, ArrowRight, CheckCircle, Calendar, DollarSign, 
  TrendingUp, FileText, Loader2, MapPin, Mail, Phone, 
  Building, User, Clock, Star, X, Table, ArrowDown, Rocket, ClipboardList, ShieldCheck, CreditCard, Truck, Users, BookOpen, FilePlus, Sprout, Store, ShoppingCart, ChevronDown, UploadCloud, Leaf, TrendingDown, Sparkles, ArrowLeft, ClipboardCheck
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
  
  // Internal tracking for the temporary lead user
  const [tempUserId, setTempUserId] = useState<string | null>(null);

  // Analysis Data
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
    setIsSubmittingLead(true);
    
    try {
      const mockLeadId = `u-lead-${Date.now()}`;
      setTempUserId(mockLeadId);

      if (formData.role === UserRole.CONSUMER && file) {
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onload = (e) => resolve((e.target?.result as string).split(',')[1]);
          reader.readAsDataURL(file);
        });
        const base64 = await base64Promise;
        const items = await extractInvoiceItems(base64, file.type);
        
        if (items && items.length > 0) {
          setAnalysisItems(items);
          const weeklySavings = items.reduce((sum, item) => sum + (item.marketRate - item.pzRate) * item.qty, 0);
          setSavingsMetrics({
            weekly: weeklySavings,
            monthly: weeklySavings * 4.33,
            annual: weeklySavings * 52,
            co2: weeklySavings * 1.4
          });

          mockService.submitConsumerSignup({
              ...formData,
              id: mockLeadId,
              orderFrequency: formData.orderFreq,
              weeklySpend: parseFloat(formData.weeklySpend) || 0,
              invoiceFile: `data:${file.type};base64,${base64}`
          });

          setStep(2);
        } else {
          setStep(4);
        }
      } else {
        await new Promise(r => setTimeout(r, 1200));
        setStep(4);
      }
    } catch (err) {
      console.error("Analysis failed", err);
      setStep(4);
    } finally {
      setIsSubmittingLead(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] font-sans text-gray-900 flex flex-col relative overflow-x-hidden">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-12 flex-1 flex flex-col justify-center w-full">
        
        {step === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center w-full animate-in fade-in duration-700">
            {/* Left side: Value Proposition */}
            <div className="space-y-10">
              <div className="space-y-6">
                <h1 className="text-5xl lg:text-[72px] font-black text-[#0F172A] leading-[1.05] tracking-tight">
                  Stop <br/>overpaying for <br/><span className="text-[#10B981]">fresh produce.</span>
                </h1>
                <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-lg">
                  Join the marketplace connecting restaurants directly to farms and wholesalers. Upload your invoice, and we'll show you exactly how much you'll save.
                </p>
              </div>

              <div className="space-y-5">
                {[
                  "Direct-to-source pricing",
                  "Consolidated billing & logistics",
                  "Reduce food waste & carbon footprint"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 text-lg font-black text-slate-700 uppercase tracking-tight">
                    <div className="w-8 h-8 rounded-full bg-white border-2 border-emerald-500 text-emerald-500 flex items-center justify-center shrink-0">
                      <CheckCircle size={20} />
                    </div>
                    {item}
                  </div>
                ))}
              </div>

              <div className="bg-[#E6F9F1] rounded-[1.5rem] p-8 max-w-md relative overflow-hidden border border-emerald-100">
                <div className="flex items-center gap-3 text-emerald-700 font-black uppercase text-xs tracking-widest mb-3">
                  <Star size={16} fill="currentColor" /> LIMITED OFFER
                </div>
                <p className="text-emerald-900 text-sm font-bold leading-relaxed relative z-10">
                  Book an onboarding call today and receive <span className="font-black text-emerald-600">$1,000 credit</span> in your portal.
                </p>
              </div>
            </div>

            {/* Right side: Lead Card */}
            <div className="w-full flex justify-center lg:justify-end">
              <div className="bg-white p-8 md:p-10 rounded-[3rem] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.08)] border border-gray-100 w-full max-w-xl">
                <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-8">Get Your Savings Analysis</h2>

                {/* Role Selector Tabs */}
                <div className="bg-gray-100/80 p-1.5 rounded-2xl flex mb-10 border border-gray-100">
                  <button onClick={() => handleRoleSelect(UserRole.CONSUMER)} className={`flex-1 flex flex-col items-center py-4 rounded-xl transition-all ${formData.role === UserRole.CONSUMER ? 'bg-white shadow-md text-blue-600' : 'text-gray-400'}`}>
                    <ShoppingCart size={20} className="mb-1.5"/>
                    <span className="text-[10px] font-black uppercase tracking-widest">Buyer</span>
                  </button>
                  <button onClick={() => handleRoleSelect(UserRole.WHOLESALER)} className={`flex-1 flex flex-col items-center py-4 rounded-xl transition-all ${formData.role === UserRole.WHOLESALER ? 'bg-white shadow-md text-indigo-600' : 'text-gray-400'}`}>
                    <Building size={20} className="mb-1.5"/>
                    <span className="text-[10px] font-black uppercase tracking-widest">Supplier</span>
                  </button>
                  <button onClick={() => handleRoleSelect(UserRole.FARMER)} className={`flex-1 flex flex-col items-center py-4 rounded-xl transition-all ${formData.role === UserRole.FARMER ? 'bg-white shadow-md text-emerald-600' : 'text-gray-400'}`}>
                    <Sprout size={20} className="mb-1.5"/>
                    <span className="text-[10px] font-black uppercase tracking-widest">Farmer</span>
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">YOUR NAME</label>
                      <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-500 transition-colors" size={16}/>
                        <input name="name" value={formData.name} onChange={handleInputChange} placeholder="John Doe" className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-900 outline-none focus:bg-white transition-all text-sm" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">MOBILE</label>
                      <div className="relative group">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-500 transition-colors" size={16}/>
                        <input name="mobile" value={formData.mobile} onChange={handleInputChange} placeholder="0400 000 000" className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-900 outline-none focus:bg-white transition-all text-sm" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">BUSINESS NAME</label>
                    <div className="relative group">
                      <Store className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-500 transition-colors" size={16}/>
                      <input name="businessName" value={formData.businessName} onChange={handleInputChange} placeholder="The Morning Cafe" className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-900 outline-none focus:bg-white transition-all text-sm" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">EMAIL</label>
                      <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-500 transition-colors" size={16}/>
                        <input name="email" value={formData.email} onChange={handleInputChange} placeholder="john@cafe.com" className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-900 outline-none focus:bg-white transition-all text-sm" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">LOCATION</label>
                      <div className="relative group">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-500 transition-colors" size={16}/>
                        <input name="location" value={formData.location} onChange={handleInputChange} placeholder="Melbourne, VIC" className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-900 outline-none focus:bg-white transition-all text-sm" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">INDUSTRY</label>
                    <div className="relative group">
                      <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-500 transition-colors" size={16}/>
                      <select name="industry" value={formData.industry} onChange={handleInputChange} className="w-full pl-11 pr-10 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-900 outline-none focus:bg-white transition-all text-sm appearance-none cursor-pointer">
                        {INDUSTRIES.map(ind => <option key={ind} value={ind}>{ind}</option>)}
                      </select>
                      <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">WEEKLY SPEND ($)</label>
                      <div className="relative group">
                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-500 transition-colors" size={16}/>
                        <input name="weeklySpend" value={formData.weeklySpend} onChange={handleInputChange} placeholder="2500" className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-900 outline-none focus:bg-white transition-all text-sm" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">ORDERS / MONTH</label>
                      <div className="relative group">
                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-500 transition-colors" size={16}/>
                        <select name="orderFreq" value={formData.orderFreq} onChange={handleInputChange} className="w-full pl-11 pr-10 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-900 outline-none focus:bg-white transition-all text-sm appearance-none cursor-pointer">
                          <option value="1-2 (Weekly)">1-2 (Weekly)</option>
                          <option value="3-5 (Bi-Weekly)">3-5 (Bi-Weekly)</option>
                          <option value="Daily">Daily</option>
                        </select>
                        <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  </div>

                  {formData.role === UserRole.CONSUMER && (
                    <div className="space-y-2 animate-in slide-in-from-top-2">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">UPLOAD RECENT INVOICE</label>
                      <div onClick={() => fileInputRef.current?.click()} onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} onDrop={(e) => { e.preventDefault(); setIsDragging(false); if(e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]); }} className={`border-2 border-dashed rounded-[1.5rem] p-10 text-center transition-all cursor-pointer bg-white group ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'}`}>
                          <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
                          {file ? (
                              <div className="flex flex-col items-center gap-1"><CheckCircle size={32} className="text-emerald-500" /><span className="text-sm font-bold text-gray-900 truncate max-w-full px-4">{file.name}</span><button onClick={(e) => { e.stopPropagation(); setFile(null); }} className="text-[10px] text-red-500 font-black uppercase mt-2">Remove</button></div>
                          ) : (
                              <div className="flex flex-col items-center"><UploadCloud size={32} className="text-gray-300 mb-3" /><p className="text-sm font-black text-gray-900 uppercase tracking-tight">Click to upload or drag and drop</p><p className="text-[10px] text-gray-400 mt-1 font-medium">PDF or Image to compare prices</p></div>
                          )}
                      </div>
                    </div>
                  )}

                  <button onClick={handleSubmitLead} disabled={isSubmittingLead} className="w-full py-6 bg-[#0B1221] text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl hover:bg-black transition-all active:scale-[0.98] disabled:opacity-70 mt-8 group">
                    {isSubmittingLead ? <Loader2 size={24} className="animate-spin" /> : <><span className="mt-0.5">ANALYZE & SEE SAVINGS</span><ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /></>}
                  </button>

                  <div className="text-center mt-8">
                    <button onClick={onLogin} className="text-[11px] font-black text-gray-400 hover:text-emerald-600 uppercase tracking-widest transition-colors">Already have an account? Login</button>
                  </div>
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
                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-slate-200/50 flex flex-col justify-between group hover:border-emerald-200 transition-all">
                    <div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Weekly Savings</span>
                        <h3 className="text-4xl font-black text-[#0F172A] tracking-tighter">${savingsMetrics.weekly.toFixed(0)}</h3>
                    </div>
                </div>

                <div className="bg-[#043003] p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col justify-between transform md:scale-105 z-10 text-white">
                    <div className="absolute top-0 right-0 p-12 opacity-5 transform rotate-12 scale-150"><TrendingDown size={140} className="text-emerald-400"/></div>
                    <div className="relative z-10">
                        <span className="text-[10px] font-black text-emerald-400/60 uppercase tracking-widest block mb-1">Monthly Savings</span>
                        <h3 className="text-5xl md:text-6xl font-black text-white tracking-tighter">${savingsMetrics.monthly.toFixed(0)}</h3>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-slate-200/50 flex flex-col justify-between group hover:border-emerald-200 transition-all">
                    <div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Annual Savings</span>
                        <h3 className="text-4xl font-black text-[#0F172A] tracking-tighter">${savingsMetrics.annual.toLocaleString()}</h3>
                    </div>
                </div>
             </div>

             <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm overflow-hidden">
                <h4 className="font-black text-gray-900 text-lg uppercase tracking-tight mb-6 flex items-center gap-2">
                    <Table size={20} className="text-indigo-50"/> Itemized Quote Comparison
                </h4>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-b border-gray-100">
                            <tr className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                                <th className="pb-4 pr-4">Product</th>
                                <th className="pb-4 text-center">Qty</th>
                                <th className="pb-4 text-right">Your Rate</th>
                                <th className="pb-4 text-right text-emerald-600">PZ Rate</th>
                                <th className="pb-4 text-right">Savings</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {analysisItems.map((item, idx) => (
                                <tr key={idx} className="group hover:bg-gray-50/50 transition-colors">
                                    <td className="py-4 font-bold text-gray-900 uppercase text-xs">{item.name}</td>
                                    <td className="py-4 text-center font-bold text-gray-500">{item.qty}</td>
                                    <td className="py-4 text-right font-medium text-gray-400 line-through">${item.marketRate.toFixed(2)}</td>
                                    <td className="py-4 text-right font-black text-emerald-600">${item.pzRate.toFixed(2)}</td>
                                    <td className="py-4 text-right">
                                        <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg text-[10px] font-black uppercase">
                                            -{(((item.marketRate - item.pzRate) / item.marketRate) * 100).toFixed(0)}%
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
             </div>

             <div className="flex flex-col sm:flex-row gap-4">
                 <button onClick={() => setStep(1)} className="flex-1 py-5 bg-white border-2 border-gray-200 rounded-[2rem] font-black text-sm uppercase tracking-[0.15em] text-gray-400 hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
                    <ArrowLeft size={18}/> Retake Analysis
                 </button>
                 <button onClick={() => setStep(4)} className="flex-[2] py-5 bg-[#0F172A] text-white rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl hover:bg-black transition-all flex items-center justify-center gap-3 group">
                    Claim My Savings & Continue <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform"/>
                 </button>
             </div>
          </div>
        )}

        {step === 4 && (
          <div className="max-w-[800px] mx-auto text-center space-y-12 animate-in zoom-in-95 duration-500 w-full px-4">
             <div className="inline-flex items-center gap-2 bg-[#D1FAE5] text-[#065F46] px-5 py-2.5 rounded-full font-black uppercase text-[10px] tracking-widest shadow-sm">
                APPLICATION RECEIVED
             </div>
             
             <div className="space-y-4">
                <h2 className="text-[44px] font-black text-[#0F172A] tracking-tighter leading-tight">What's next?</h2>
                <p className="text-[#64748B] text-base font-medium leading-relaxed max-w-[420px] mx-auto">
                    Your request has been placed in our <span className="font-bold text-slate-900">Pending Review</span> queue. You can continue setting up your profile now to speed up the approval process.
                </p>
             </div>

             <div className="space-y-6 max-w-[500px] mx-auto">
                {/* Complete Profile Card */}
                <div className="bg-white rounded-[2rem] border-2 border-[#10B981] p-8 text-left relative overflow-hidden group shadow-sm">
                    <div className="absolute top-0 right-0 bg-[#10B981] text-white px-6 py-2.5 text-[9px] font-black uppercase tracking-widest rounded-bl-2xl shadow-md">
                        FAST TRACK
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-[#F0FDF4] rounded-2xl flex items-center justify-center text-[#10B981] border border-[#DCFCE7] shadow-inner-sm">
                            <ClipboardCheck size={32} strokeWidth={2.5}/>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">COMPLETE PROFILE</h3>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1">Finalise your business and logistics details for the admin to review.</p>
                            <button 
                                onClick={() => setIsProfileModalOpen(true)}
                                className="mt-4 flex items-center gap-2 text-[#10B981] font-black text-[11px] uppercase tracking-widest group-hover:gap-3 transition-all"
                            >
                                START SETUP <ArrowRight size={14} strokeWidth={3}/>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Book Demo Card */}
                <div className="bg-white rounded-[2rem] border border-gray-100 p-8 text-left relative overflow-hidden group shadow-sm hover:border-blue-100 transition-all">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-[#EFF6FF] rounded-2xl flex items-center justify-center text-[#2563EB] border border-[#DBEAFE] shadow-inner-sm">
                            <Calendar size={32} strokeWidth={2.5}/>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">BOOK A DEMO</h3>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1">Schedule a 15-min call with our specialist for a guided tour.</p>
                            <button 
                                onClick={() => window.open('https://calendly.com/alex-platformzerosolutions/45min', '_blank')}
                                className="mt-4 flex items-center gap-2 text-[#2563EB] font-black text-[11px] uppercase tracking-widest group-hover:gap-3 transition-all"
                            >
                                SELECT TIME <ArrowRight size={14} strokeWidth={3}/>
                            </button>
                        </div>
                    </div>
                </div>
             </div>

             {/* Testimonials Section */}
             <div className="pt-12 border-t border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                   {/* V2 Foods */}
                   <div className="space-y-4 text-left">
                      <div className="rounded-[2rem] overflow-hidden aspect-[1.6/1] bg-gray-100 border border-gray-100 shadow-sm">
                         <img src="https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&q=80&w=400&h=250" className="w-full h-full object-cover" alt="V2 Foods"/>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed font-medium italic">
                         "We've never needed a credit or product replacement. Every delivery from Platform Zero has met our standards."
                      </p>
                      <p className="text-xs font-black text-gray-900 uppercase tracking-tight">
                         V2 Foods <span className="font-medium text-gray-400">— Head of Procurement</span>
                      </p>
                   </div>

                   {/* Emirates */}
                   <div className="space-y-4 text-left">
                      <div className="rounded-[2rem] overflow-hidden aspect-[1.6/1] bg-gray-100 border border-gray-100 shadow-sm">
                         <img src="https://images.unsplash.com/photo-1520437358207-323b43b50729?auto=format&fit=crop&q=80&w=400&h=250" className="w-full h-full object-cover" alt="Emirates"/>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed font-medium italic">
                         "As a company, we’re always looking for partners who help us make an impact. Platform Zero not only delivers exceptional quality fresh produce but also provides sustainability and impact reporting that goes beyond anyone else in the market."
                      </p>
                      <p className="text-xs font-black text-gray-900 uppercase tracking-tight">
                         Emirates <span className="font-medium text-gray-400">— Head of Procurement</span>
                      </p>
                   </div>

                   {/* Chargrill Charlie's */}
                   <div className="space-y-4 text-left">
                      <div className="rounded-[2rem] overflow-hidden aspect-[1.6/1] bg-gray-100 border border-gray-100 shadow-sm">
                         <img src="https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&q=80&w=400&h=250" className="w-full h-full object-cover" alt="Chargrill Charlie's"/>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed font-medium italic">
                         "We trialled Platform Zero and never looked back. Now, nearly all Chargrill Charlie’s sites are supplied by PZ. Each location keeps recommending them to others because it’s a no-brainer."
                      </p>
                      <p className="text-xs font-black text-gray-900 uppercase tracking-tight">
                         Chargrill Charlie's <span className="font-medium text-gray-400">— Merrickville Business Owner</span>
                      </p>
                   </div>
                </div>
             </div>

             <div className="pt-6">
                <button onClick={() => setStep(1)} className="text-[11px] font-black text-gray-400 hover:text-slate-900 uppercase tracking-[0.3em] transition-colors">BACK TO START</button>
             </div>
          </div>
        )}

        {step === 5 && (
          <div className="max-w-xl mx-auto text-center space-y-12 animate-in zoom-in-95 duration-500 py-12 w-full">
             <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 shadow-inner-sm border-2 border-emerald-200">
                <CheckCircle size={48} />
             </div>
             <div>
                <h2 className="text-4xl md:text-5xl font-black text-[#0F172A] tracking-tighter uppercase leading-none mb-6">Profile Submitted</h2>
                <div className="bg-white p-8 rounded-[2rem] border-2 border-gray-100 shadow-sm">
                    <p className="text-xl text-[#043003] font-black leading-relaxed">
                        Thank you for completing your profile. We will be in contact within the next business day to activate your trade account.
                    </p>
                </div>
             </div>
             
             <div className="space-y-4">
                 <div className="flex items-center justify-center gap-2 text-[#64748B] font-bold text-xs uppercase tracking-widest">
                    <Clock size={16} /> Awaiting Verification
                 </div>
                 <button onClick={() => setStep(1)} className="px-10 py-5 bg-[#0F172A] text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-xl hover:bg-black transition-all active:scale-95">Return to Marketplace</button>
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