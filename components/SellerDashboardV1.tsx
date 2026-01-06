import React, { useState, useEffect, useRef } from 'react';
import { User, Order, Lead, InventoryItem, Product, SupplierPriceRequest, SupplierPriceRequestItem, Driver, Packer, Customer, UserRole } from '../types';
import { mockService } from '../services/mockDataService';
import { triggerNativeSms, generateProductDeepLink } from '../services/smsService';
import { 
  X, CheckCircle, Send, Loader2, Users, Smartphone, Contact, Plus, MessageCircle, Copy, Check
} from 'lucide-react';

interface SellerDashboardV1Props {
  user: User;
  onLogout?: () => void;
  onSwitchVersion?: (version: 'v1' | 'v2') => void;
}

export const ShareModal: React.FC<{
  item: InventoryItem;
  onClose: () => void;
  onComplete: () => void;
  currentUser: User;
  overridePrice?: number;
}> = ({ item, onClose, onComplete, currentUser, overridePrice }) => {
  const product = mockService.getProduct(item.productId);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>([]);
  const [manualNumbers, setManualNumbers] = useState<string[]>([]);
  const [currentManualNumber, setCurrentManualNumber] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSyncingContacts, setIsSyncingContacts] = useState(false);

  useEffect(() => {
    // Only show customers belonging to this wholesaler
    const myCustomers = mockService.getCustomers().filter(c => c.connectedSupplierId === currentUser.id);
    setCustomers(myCustomers);
    // Auto-select first contact for demo parity with screenshot
    if (myCustomers.length > 0) {
        setSelectedCustomerIds([myCustomers[0].id]);
    }
  }, [currentUser.id]);

  const toggleCustomer = (id: string) => {
    setSelectedCustomerIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const addManualNumber = () => {
    if (currentManualNumber) {
      const cleaned = currentManualNumber.replace(/[^\d+]/g, '');
      if (cleaned.length < 8) {
        alert("Please enter a valid mobile number.");
        return;
      }
      if (!manualNumbers.includes(cleaned)) {
        setManualNumbers([...manualNumbers, cleaned]);
      }
      setCurrentManualNumber('');
    }
  };

  const handleConnectContacts = async () => {
    try {
      setIsSyncingContacts(true);
      // Simulate contact sync delay
      await new Promise(r => setTimeout(r, 1000));
      const mockContacts = ['0411 222 333', '0499 888 777'];
      setManualNumbers(prev => [...new Set([...prev, ...mockContacts])]);
    } catch (err) {
      console.error("Contact sync error:", err);
    } finally {
      setIsSyncingContacts(false);
    }
  };

  const getSmsContent = () => {
    const senderName = currentUser.businessName;
    const productName = product?.name || 'fresh produce';
    const priceValue = overridePrice !== undefined ? overridePrice : (product?.defaultPricePerKg || 0);
    const priceDisplay = priceValue > 0 ? `$${priceValue.toFixed(2)}` : 'market rates';
    const productLink = "https://pz.io/l/..." // Visual dummy for preview
    
    return {
        text: `Hey there! ${senderName} wants you to view this: fresh ${productName} at ${priceDisplay}. We'd like to connect and chat with you. View and trade here: `,
        shortLink: productLink
    };
  };

  const handleSendBlast = () => {
    const targetNumbers = [
      ...customers.filter(c => selectedCustomerIds.includes(c.id)).map(c => c.phone).filter(p => !!p),
      ...manualNumbers
    ];

    if (targetNumbers.length === 0) {
      alert("Please select or add at least one mobile number.");
      return;
    }

    setIsSending(true);
    const content = getSmsContent();
    const finalMsg = `${content.text} ${generateProductDeepLink('product', item.id)}`;

    // Trigger for the first recipient
    triggerNativeSms(targetNumbers[0] as string, finalMsg);
    
    setTimeout(() => {
      setIsSending(false);
      onComplete();
    }, 1200);
  };

  const smsContent = getSmsContent();
  const totalRecipients = selectedCustomerIds.length + manualNumbers.length;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-8 border-b border-gray-50 flex justify-between items-start bg-white">
          <div>
            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight leading-none">Blast to Network</h2>
            <p className="text-[13px] text-gray-400 font-bold mt-2">Generate produce links for your contacts</p>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-50 rounded-full text-gray-400 hover:text-gray-900 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 p-8 space-y-8 overflow-y-auto max-h-[70vh] no-scrollbar">
          
          {/* SMS Preview Box */}
          <div className="bg-[#ECFDF5] rounded-3xl p-6 border border-[#D1FAE5] relative">
            <div className="absolute -top-3 left-6 bg-[#059669] text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
              SMS PREVIEW
            </div>
            <p className="text-[13px] text-[#064E3B] font-medium leading-relaxed pt-2">
              "{smsContent.text}<span className="text-[#059669] underline font-bold cursor-pointer">{smsContent.shortLink}</span>"
            </p>
            <button className="flex items-center gap-2 text-[10px] font-black text-[#059669] uppercase tracking-widest mt-4 hover:underline">
              <Copy size={12}/> Copy Raw Link Instead
            </button>
          </div>

          {/* Saved Connections */}
          <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
               <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                 <Users size={16}/> Saved Connections ({customers.length})
               </h3>
               <button 
                  onClick={() => setSelectedCustomerIds(selectedCustomerIds.length === customers.length ? [] : customers.map(c => c.id))}
                  className="text-[11px] font-black text-[#4F46E5] uppercase tracking-widest hover:underline"
                >
                  {selectedCustomerIds.length === customers.length ? 'DESELECT ALL' : 'SELECT ALL'}
                </button>
            </div>
            
            <div className="space-y-2">
              {customers.map(customer => {
                const isSelected = selectedCustomerIds.includes(customer.id);
                return (
                  <div 
                    key={customer.id} 
                    onClick={() => toggleCustomer(customer.id)}
                    className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all cursor-pointer ${isSelected ? 'border-[#10B981] bg-white' : 'border-gray-100 bg-gray-50'}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-white text-xl shadow-sm ${isSelected ? 'bg-[#059669]' : 'bg-gray-300'}`}>
                        {customer.businessName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-gray-900 uppercase text-[15px]">{customer.businessName}</p>
                        <p className="text-xs text-gray-400 font-bold">{customer.phone || 'NO MOBILE'}</p>
                      </div>
                    </div>
                    {isSelected ? (
                      <div className="w-7 h-7 bg-[#ECFDF5] text-[#10B981] rounded-full flex items-center justify-center border border-[#10B981]">
                        <Check size={18} strokeWidth={4} />
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-full border-2 border-gray-200" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Manual Entry */}
          <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
               <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                 <Smartphone size={16}/> Add Manual Recipients
               </h3>
               <button 
                  onClick={handleConnectContacts}
                  className="text-[11px] font-black text-[#4F46E5] uppercase tracking-widest flex items-center gap-1.5 hover:underline"
                >
                  <Contact size={14}/> {isSyncingContacts ? 'SYNCING...' : 'SYNC DEVICE CONTACTS'}
                </button>
            </div>
            
            <div className="flex gap-3">
              <input 
                type="tel"
                placeholder="Enter mobile number..."
                className="flex-1 bg-gray-50 border-2 border-gray-100 rounded-2xl px-6 py-4 font-bold text-gray-900 outline-none focus:ring-4 focus:ring-[#10B981]/5 focus:border-[#10B981] transition-all"
                value={currentManualNumber}
                onChange={(e) => setCurrentManualNumber(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addManualNumber()}
              />
              <button 
                onClick={addManualNumber}
                className="bg-[#0F172A] text-white p-5 rounded-2xl shadow-lg hover:bg-black transition-all active:scale-95"
              >
                <Plus size={28} strokeWidth={3}/>
              </button>
            </div>

            {manualNumbers.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                    {manualNumbers.map((num, i) => (
                        <span key={i} className="bg-white border border-gray-200 px-3 py-1.5 rounded-xl text-[10px] font-black text-gray-600 flex items-center gap-2">
                            {num}
                            <button onClick={() => setManualNumbers(manualNumbers.filter((_, idx) => idx !== i))} className="text-gray-300 hover:text-red-500"><X size={12}/></button>
                        </span>
                    ))}
                </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-gray-100 bg-white grid grid-cols-2 gap-4">
          <button 
            onClick={onClose}
            className="py-5 bg-white border-2 border-gray-100 text-gray-400 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-gray-50 transition-all active:scale-95"
          >
            CANCEL
          </button>
          <button 
            onClick={handleSendBlast}
            disabled={isSending || totalRecipients === 0}
            className="py-5 bg-[#0F172A] text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl flex items-center justify-center gap-3 hover:bg-black transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {isSending ? (
                <Loader2 className="animate-spin" size={18}/>
            ) : (
                <><Smartphone size={18}/> OPEN SMS APP ({totalRecipients})</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export const SellerDashboardV1: React.FC<SellerDashboardV1Props> = ({ user, onSwitchVersion }) => {
    return <div className="p-10 text-center text-gray-400 uppercase font-black text-xs tracking-widest">Simplified Mobile Interface Placeholder</div>;
}