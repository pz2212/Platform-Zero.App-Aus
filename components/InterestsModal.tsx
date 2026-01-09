
import React, { useState } from 'react';
import { X, Sprout, ShoppingCart, Check, Sparkles, ArrowRight } from 'lucide-react';
import { User } from '../types';
import { mockService } from '../services/mockDataService';

interface InterestsModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

const COMMON_PRODUCE = [
  'TOMATOES', 'EGGPLANT', 'POTATOES', 'ONIONS', 'LETTUCE', 
  'APPLES', 'BANANAS', 'CARROTS', 'BROCCOLI', 'AVOCADOS', 
  'MANGOES', 'BERRIES', 'CITRUS', 'STONEFRUIT', 'HERBS'
];

export const InterestsModal: React.FC<InterestsModalProps> = ({ user, isOpen, onClose, onSaved }) => {
  const [selling, setSelling] = useState<string[]>(user.activeSellingInterests || []);
  const [buying, setBuying] = useState<string[]>(user.activeBuyingInterests || []);
  const [step, setStep] = useState<1 | 2>(1);

  if (!isOpen) return null;

  const toggleInterest = (list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>, item: string) => {
    const upperItem = item.toUpperCase();
    if (list.includes(upperItem)) {
      setList(list.filter(i => i !== upperItem));
    } else {
      setList([...list, upperItem]);
    }
  };

  const handleSave = () => {
    mockService.updateUserInterests(user.id, selling, buying);
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[3.5rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100">
        
        {/* Header - Styled as per screenshot */}
        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-white">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-[#4A3AFF] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 border-2 border-white">
              <Sparkles size={28} strokeWidth={2.5}/>
            </div>
            <div>
              <h2 className="text-2xl font-black text-[#0F172A] tracking-tighter leading-none uppercase">Market Alignment</h2>
              <p className="text-[10px] font-black text-[#4A3AFF] uppercase tracking-[0.2em] mt-1.5">Configure your network visibility</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-200 hover:text-gray-400 transition-all p-2">
            <X size={28} strokeWidth={3}/>
          </button>
        </div>

        <div className="p-10 space-y-10">
          {step === 1 ? (
             <div className="space-y-8 animate-in slide-in-from-right-4">
               <div className="flex items-center gap-4 text-[#10B981]">
                 <Sprout size={28} strokeWidth={2.5}/>
                 <h3 className="font-black uppercase text-base tracking-widest text-[#4A3AFF]">What are you SELLING?</h3>
               </div>
               
               <p className="text-sm text-gray-500 font-medium leading-relaxed">
                 Select items you currently have in stock or grow. We'll match you with buyers looking for these.
               </p>
               
               <div className="flex flex-wrap gap-2.5">
                 {COMMON_PRODUCE.map(item => {
                   const isSelected = selling.includes(item);
                   return (
                       <button
                         key={item}
                         onClick={() => toggleInterest(selling, setSelling, item)}
                         className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
                           isSelected 
                           ? 'bg-[#4A3AFF] border-[#4A3AFF] text-white shadow-lg' 
                           : 'bg-white border-gray-50 text-gray-400 hover:border-emerald-100 hover:text-emerald-600'
                         }`}
                       >
                         {isSelected && <Check size={14} className="inline mr-2" strokeWidth={4}/>}
                         {item}
                       </button>
                   );
                 })}
               </div>

               <button 
                 onClick={() => setStep(2)}
                 className="w-full py-6 bg-[#0B1221] text-white rounded-2xl font-black text-xs uppercase tracking-[0.25em] shadow-2xl hover:bg-black transition-all flex items-center justify-center gap-4 active:scale-[0.98]"
               >
                 NEXT SECTION <ArrowRight size={20} />
               </button>
             </div>
          ) : (
            <div className="space-y-8 animate-in slide-in-from-right-4">
              <div className="flex items-center gap-4 text-[#4A3AFF]">
                <ShoppingCart size={28} strokeWidth={2.5}/>
                <h3 className="font-black uppercase text-base tracking-widest text-[#4A3AFF]">What are you looking to BUY?</h3>
              </div>
              <p className="text-sm text-gray-500 font-medium leading-relaxed">
                Select items you frequently source. We'll find network partners who grow or wholesale these.
              </p>

              <div className="flex flex-wrap gap-2.5">
                {COMMON_PRODUCE.map(item => {
                  const isSelected = buying.includes(item);
                  return (
                      <button
                        key={item}
                        onClick={() => toggleInterest(buying, setBuying, item)}
                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
                          isSelected 
                          ? 'bg-[#4A3AFF] border-[#4A3AFF] text-white shadow-lg' 
                          : 'bg-white border-gray-50 text-gray-400 hover:border-indigo-100 hover:text-[#4A3AFF]'
                        }`}
                      >
                        {isSelected && <Check size={14} className="inline mr-2" strokeWidth={4}/>}
                        {item}
                      </button>
                  );
                })}
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => setStep(1)}
                  className="flex-1 py-6 bg-[#F1F5F9] text-gray-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all"
                >
                  BACK
                </button>
                <button 
                  onClick={handleSave}
                  className="flex-[2] py-6 bg-[#043003] text-white rounded-2xl font-black text-xs uppercase tracking-[0.25em] shadow-2xl hover:bg-[#064004] transition-all flex items-center justify-center gap-4 active:scale-95"
                >
                  SAVE & MATCH MARKET <Sparkles size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
