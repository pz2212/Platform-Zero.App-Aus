import React, { useState, useEffect, useRef } from 'react';
import { User, UserRole, InventoryItem, Product } from '../types';
import { mockService } from '../services/mockDataService';
import { 
  Sprout, Search, MapPin, Package, ChevronDown, 
  MessageSquare, Plus, CheckCircle, ArrowRight,
  TrendingUp, Leaf, Star, Globe, Info, Clock,
  Filter, UserCheck, Wind, ShoppingBag, X, Loader2,
  Smartphone, Mail, Heart, Check
} from 'lucide-react';
import { triggerNativeSms, generateProductDeepLink } from '../services/smsService';

interface FarmerNetworkProps {
  user: User;
}

const ConnectFarmerModal = ({ isOpen, onClose, farmer, currentUser }: { 
    isOpen: boolean, 
    onClose: () => void, 
    farmer: User | null,
    currentUser: User
}) => {
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [step, setStep] = useState<'form' | 'success'>('form');

    useEffect(() => {
        if (farmer) {
            setMessage(`Hi ${farmer.businessName}! 👋 ${currentUser.businessName} is looking to purchase from you. We'd love to connect and see your current harvest availability.`);
        }
    }, [farmer, currentUser]);

    if (!isOpen || !farmer) return null;

    const handleSend = (method: 'SMS' | 'EMAIL') => {
        setIsSending(true);
        const link = `https://platformzero.com.au/join-partner?ref=${currentUser.id}`;
        const finalMsg = `${message} Start trading here: ${link}`;
        
        if (method === 'SMS') {
            triggerNativeSms(farmer.phone || '0400 000 000', finalMsg);
        } else {
            window.location.href = `mailto:${farmer.email}?subject=Trade Inquiry from ${currentUser.businessName}&body=${encodeURIComponent(finalMsg)}`;
        }
        
        setTimeout(() => {
            setIsSending(false);
            setStep('success');
        }, 800);
    };

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
                <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-emerald-50/30">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Connect to Farm</h2>
                        <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest mt-1">Expanding your supply lines</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 bg-white rounded-full border border-gray-100 shadow-sm"><X size={24}/></button>
                </div>
                
                <div className="p-10 space-y-6">
                    {step === 'form' ? (
                        <>
                            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center font-black text-xl">
                                    {farmer.businessName.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-black text-gray-900 uppercase text-sm">{farmer.businessName}</p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Regional Producer</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Your Connection Note</label>
                                <textarea 
                                    className="w-full p-5 bg-gray-50 border border-gray-100 rounded-[1.5rem] font-medium text-sm text-gray-700 h-32 resize-none outline-none focus:ring-4 focus:ring-emerald-500/5 focus:bg-white transition-all italic"
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                />
                            </div>

                            <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100/50 flex items-start gap-4">
                                <Info size={18} className="text-emerald-600 shrink-0 mt-0.5"/>
                                <p className="text-[11px] text-emerald-800 font-medium leading-relaxed">
                                    Your intent to purchase and business name are automatically included to build trust with the grower.
                                </p>
                            </div>

                            <div className="pt-4 grid grid-cols-2 gap-3">
                                <button onClick={() => handleSend('SMS')} className="py-5 bg-[#059669] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/10 active:scale-95 transition-all"><Smartphone size={18}/> Send SMS</button>
                                <button onClick={() => handleSend('EMAIL')} className="py-5 bg-[#0F172A] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all"><Mail size={18}/> Send Email</button>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-6 space-y-6">
                            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 border-4 border-white shadow-xl"><CheckCircle size={40}/></div>
                            <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Request Dispatched</h3>
                            <p className="text-sm text-gray-500 font-medium leading-relaxed">We've notified <span className="font-black text-gray-900">{farmer.businessName}</span> of your interest. They will appear in your Partner list once they verify the connection.</p>
                            <button onClick={onClose} className="w-full py-5 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-black transition-all active:scale-95">Back to Network</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export const FarmerNetwork: React.FC<FarmerNetworkProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'PARTNERS' | 'DISCOVER'>('PARTNERS');
  const [searchTerm, setSearchTerm] = useState('');
  const [farmers, setFarmers] = useState<User[]>([]);
  const [expandedFarmerId, setExpandedFarmerId] = useState<string | null>(null);
  const [inventoryMap, setInventoryMap] = useState<Record<string, InventoryItem[]>>({});
  const [products, setProducts] = useState<Product[]>([]);
  
  // Modal State
  const [connectionFarmer, setConnectionFarmer] = useState<User | null>(null);

  useEffect(() => {
    loadNetwork();
    setProducts(mockService.getAllProducts());
    const interval = setInterval(loadNetwork, 10000);
    return () => clearInterval(interval);
  }, [user.id]);

  const loadNetwork = () => {
    const allUsers = mockService.getAllUsers();
    const allFarmers = allUsers.filter(u => u.role === UserRole.FARMER);
    setFarmers(allFarmers);

    const invMap: Record<string, InventoryItem[]> = {};
    allFarmers.forEach(f => {
      invMap[f.id] = mockService.getInventory(f.id).filter(i => i.status === 'Available');
    });
    setInventoryMap(invMap);
  };

  const myPartnerIds = ['u3']; // Mock partner logic
  const myPartners = farmers.filter(f => myPartnerIds.includes(f.id));
  const discoveryFarms = farmers.filter(f => !myPartnerIds.includes(f.id));

  const displayedFarmers = (activeTab === 'PARTNERS' ? myPartners : discoveryFarms)
    .filter(f => f.businessName.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 px-2">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase leading-none">Farmer Network</h1>
          <p className="text-gray-400 font-bold text-xs uppercase tracking-[0.2em] mt-2">Source Direct • Origin Verified • Field-to-Market</p>
        </div>
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-emerald-500 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Search farms or varieties..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-6 py-5 bg-white border-2 border-gray-100 rounded-[1.5rem] text-sm font-bold text-gray-900 outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all shadow-sm"
          />
        </div>
      </div>

      <div className="flex gap-2 p-1.5 bg-gray-100/50 rounded-[1.5rem] border border-gray-200 shadow-sm w-fit mx-2">
        <button 
          onClick={() => setActiveTab('PARTNERS')}
          className={`px-10 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3 ${activeTab === 'PARTNERS' ? 'bg-white text-emerald-700 shadow-md ring-1 ring-black/5' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <UserCheck size={16}/> My Partners ({myPartners.length})
        </button>
        <button 
          onClick={() => setActiveTab('DISCOVER')}
          className={`px-10 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3 ${activeTab === 'DISCOVER' ? 'bg-white text-gray-900 shadow-md ring-1 ring-black/5' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <Globe size={16}/> Discover New Sources ({discoveryFarms.length})
        </button>
      </div>

      <div className="space-y-6 px-2">
        {displayedFarmers.length === 0 ? (
          <div className="py-40 text-center bg-white rounded-[3rem] border border-gray-100 shadow-sm">
            <Sprout size={64} className="mx-auto text-gray-100 mb-6" />
            <p className="font-black text-gray-300 uppercase tracking-widest text-xs">No farms found in this category.</p>
          </div>
        ) : displayedFarmers.map(farmer => {
          const inv = inventoryMap[farmer.id] || [];
          const isExpanded = expandedFarmerId === farmer.id;

          return (
            <div key={farmer.id} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden hover:shadow-xl hover:border-emerald-100 transition-all">
              <div 
                onClick={() => setExpandedFarmerId(isExpanded ? null : farmer.id)}
                className="p-8 flex flex-col md:flex-row items-center justify-between gap-8 cursor-pointer hover:bg-gray-50/50 transition-colors"
              >
                <div className="flex items-center gap-8">
                  <div className="w-20 h-20 bg-emerald-100 text-emerald-700 rounded-[1.75rem] flex items-center justify-center font-black text-4xl shadow-inner-sm border border-emerald-200">
                    {farmer.businessName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight leading-none">{farmer.businessName}</h3>
                      <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-emerald-100">Regional Producer</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-6">
                      <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <MapPin size={14} className="text-gray-300"/> Mildura, VIC
                      </span>
                      <span className="text-[11px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                        <Package size={14} className="text-emerald-400"/> {inv.length} Live Harvest Lots
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                  {activeTab === 'DISCOVER' ? (
                    <button 
                      onClick={(e) => { e.stopPropagation(); setConnectionFarmer(farmer); }}
                      className="flex-1 md:flex-none px-10 py-4 bg-[#043003] text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-black transition-all shadow-xl active:scale-95"
                    >
                      Connect to Farm
                    </button>
                  ) : (
                    <button 
                      onClick={(e) => { e.stopPropagation(); setConnectionFarmer(farmer); }}
                      className="flex-1 md:flex-none px-8 py-4 bg-white border-2 border-gray-100 rounded-2xl text-gray-400 font-black uppercase text-[10px] tracking-widest hover:border-emerald-500 hover:text-emerald-600 transition-all flex items-center justify-center gap-2 shadow-sm"
                    >
                      <MessageSquare size={18}/> Inquire
                    </button>
                  )}
                  <div className={`p-3 rounded-xl bg-gray-100 text-gray-300 transition-transform duration-500 ${isExpanded ? 'rotate-180 bg-emerald-50 text-emerald-600 shadow-inner' : ''}`}>
                    <ChevronDown size={28}/>
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-gray-50 bg-gray-50/20 p-10 animate-in slide-in-from-top-4 duration-500">
                  <div className="mb-10 flex justify-between items-end">
                    <div>
                      <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] mb-2">Source Audit: Active Stock</h4>
                      <p className="text-gray-900 font-bold text-lg uppercase tracking-tight">What {farmer.businessName} is selling now</p>
                    </div>
                    <div className="bg-white border border-gray-100 px-6 py-2 rounded-xl flex items-center gap-3">
                       <Wind size={16} className="text-emerald-500"/>
                       <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Verified Fresh</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {inv.length === 0 ? (
                      <div className="col-span-full py-12 text-center text-gray-400 italic">No available stock lots from this farm today.</div>
                    ) : inv.map(item => {
                      const p = products.find(prod => prod.id === item.productId);
                      return (
                        <div key={item.id} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm group/item hover:shadow-xl transition-all">
                          <div className="h-40 rounded-2xl overflow-hidden mb-6 border border-gray-50 shadow-inner-sm bg-gray-50">
                            <img src={p?.imageUrl} className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-700" alt=""/>
                          </div>
                          <div className="mb-6">
                            <h5 className="font-black text-gray-900 uppercase text-lg leading-tight mb-1">{p?.name}</h5>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.quantityKg}kg available</p>
                          </div>

                          <div className="space-y-4 pt-6 border-t border-gray-50">
                            <div className="flex justify-between items-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
                              <span>Market Rate</span>
                              <span className="text-emerald-600 text-sm tracking-tighter">${p?.defaultPricePerKg.toFixed(2)} / kg</span>
                            </div>
                            <button className="w-full py-4 bg-emerald-50 text-emerald-700 rounded-2xl font-black text-[9px] uppercase tracking-[0.2em] border border-emerald-100 hover:bg-emerald-600 hover:text-white transition-all active:scale-95">
                              Reserve Lot
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <ConnectFarmerModal 
        isOpen={!!connectionFarmer}
        onClose={() => setConnectionFarmer(null)}
        farmer={connectionFarmer}
        currentUser={user}
      />
    </div>
  );
};
