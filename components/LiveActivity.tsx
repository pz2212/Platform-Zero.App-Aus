
import React, { useState, useEffect } from 'react';
import { Truck, Package, CheckCircle2, X, MapPin, Sprout, Building2, Bell, ShieldCheck, ShoppingCart, Info, Check, Zap, AlertTriangle } from 'lucide-react';
import { AppNotification, User, UserRole } from '../types';

interface LiveActivityProps {
  notification: AppNotification | null;
  user: User;
  onClose: () => void;
}

export const LiveActivity: React.FC<LiveActivityProps> = ({ notification, user, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (notification) {
      setIsVisible(true);
      const timeout = setTimeout(() => setIsVisible(false), 12000);
      return () => clearTimeout(timeout);
    } else {
      setIsVisible(false);
    }
  }, [notification]);

  if (!notification || !isVisible) return null;

  const isPriceRequest = notification.type === 'PRICE_REQUEST';
  const isDemandPing = notification.type === 'DEMAND_PING';
  
  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[1000] w-[95%] max-w-[420px] animate-in slide-in-from-top-20 duration-700 ease-out">
      <div className={`rounded-[2.5rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)] border-4 p-8 overflow-hidden relative group transition-all ${
        isDemandPing ? 'bg-[#EEF2FF] border-indigo-200 text-indigo-900' : 'bg-[#0B1221] border-white/10 text-white'
      }`}>
        <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-1/4 -translate-y-1/4 group-hover:scale-110 transition-transform duration-700">
           {isDemandPing ? <Zap size={240} className="text-indigo-500"/> : <TrendingUp size={240} className="text-emerald-500"/>}
        </div>

        {/* Status Header */}
        <div className="flex justify-between items-center mb-8 relative z-10">
          <div className="flex items-center gap-4">
             <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xs shadow-2xl border-2 border-white/20 ${
                 isDemandPing ? 'bg-indigo-600 text-white' : 'bg-emerald-500 text-white'
             }`}>
                PZ
             </div>
             <div>
                <span className={`block text-[11px] font-black uppercase tracking-[0.3em] leading-none ${
                    isDemandPing ? 'text-indigo-500' : 'text-emerald-400'
                }`}>
                    {isDemandPing ? 'Priority Demand' : isPriceRequest ? 'Procurement Lead' : 'Live Update'}
                </span>
                <span className={`block text-xl font-black tracking-tight mt-1 ${isDemandPing ? 'text-[#1E1B4B]' : 'text-white'}`}>
                    {isDemandPing ? 'Stock Deficit Alert' : 'Market Intelligence'}
                </span>
             </div>
          </div>
          <button onClick={() => setIsVisible(false)} className="text-gray-400 hover:text-gray-900 transition-colors p-2 rounded-full">
            <X size={20}/>
          </button>
        </div>

        {/* Content Box */}
        <div className={`rounded-[1.75rem] p-6 border-2 mb-8 flex items-center justify-between relative z-10 group/box transition-all ${
            isDemandPing ? 'bg-white border-indigo-100' : 'bg-white/5 border-white/5 hover:bg-white/10'
        }`}>
            <div className="flex flex-col flex-1 mr-4">
                <p className={`text-lg font-black tracking-tight leading-tight group-hover/box:text-indigo-600 transition-colors ${isDemandPing ? 'text-gray-900' : 'text-white'}`}>{notification.title}</p>
                <p className={`text-xs font-medium mt-2 leading-relaxed ${isDemandPing ? 'text-gray-500' : 'text-slate-400'}`}>{notification.message}</p>
            </div>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xl border-2 border-white/20 shrink-0 transform group-hover/box:rotate-12 transition-transform ${
                isDemandPing ? 'bg-indigo-600 text-white shadow-indigo-100' : 'bg-emerald-500 text-white shadow-emerald-500/20'
            }`}>
                {isDemandPing ? <Zap size={24} strokeWidth={4} /> : <Check size={24} strokeWidth={4} />}
            </div>
        </div>

        {/* Interactive Footer */}
        <div className="flex gap-3 relative z-10">
            <button 
              onClick={() => setIsVisible(false)}
              className={`flex-1 py-5 rounded-[1.25rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all border-2 ${
                  isDemandPing ? 'bg-white border-indigo-100 text-gray-400' : 'bg-white/5 border-white/5 text-white hover:bg-white/10'
              }`}
            >
                Dismiss
            </button>
            <button 
              onClick={() => { setIsVisible(false); isDemandPing && window.location.hash === '#/' }}
              className={`flex-[2] rounded-[1.25rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-2xl active:scale-95 group/btn py-5 ${
                  isDemandPing ? 'bg-[#1E1B4B] text-white hover:bg-black' : 'bg-white text-slate-950 hover:bg-emerald-400'
              }`}
            >
                Fulfill Request <ArrowRight size={14} className="inline ml-2 group-hover/btn:translate-x-1 transition-transform" />
            </button>
        </div>

      </div>
    </div>
  );
};

const TrendingUp = ({ size = 24, ...props }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
);

const ArrowRight = ({ size = 24, ...props }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
);
