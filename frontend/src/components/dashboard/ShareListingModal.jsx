import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, Search, ExternalLink } from 'lucide-react';
import { toast } from 'react-toastify';

const ShareListingModal = ({ isOpen, onClose, listings }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const filteredListings = listings?.filter(l => 
    l.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.location?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleCopy = (id) => {
    const url = `${window.location.origin}/properties/single/${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           exit={{ opacity: 0, scale: 0.95 }}
           className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]"
        >
           <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-white z-10">
             <h3 className="text-xl font-bold text-gray-900">Share Listing</h3>
             <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
               <X className="w-5 h-5 text-gray-500" />
             </button>
           </div>
           
           <div className="p-4 border-b border-gray-50 bg-gray-50/50">
             <div className="relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
               <input 
                 type="text" 
                 placeholder="Search by title or location..." 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-white"
               />
             </div>
           </div>

           <div className="overflow-y-auto p-4 space-y-3 flex-1">
             {filteredListings.length > 0 ? (
               filteredListings.map(listing => (
                 <div key={listing._id} className="flex items-center gap-4 p-3 rounded-xl border border-gray-100 hover:border-purple-100 hover:bg-purple-50/30 transition-colors group">
                   <img 
                     src={listing.image?.[0] || '/placeholder.jpg'} 
                     alt={listing.title}
                     className="w-16 h-16 rounded-lg object-cover bg-gray-100" 
                   />
                   <div className="flex-1 min-w-0">
                     <h4 className="font-semibold text-gray-900 truncate">{listing.title}</h4>
                     <p className="text-sm text-gray-500 truncate">{listing.location}</p>
                   </div>
                   <div className="flex gap-2">
                     <button
                       onClick={() => window.open(`/properties/single/${listing._id}`, '_blank')}
                       className="p-2 text-gray-400 hover:text-purple-600 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-purple-100"
                       title="Open Listing"
                     >
                       <ExternalLink className="w-4 h-4" />
                     </button>
                     <button
                       onClick={() => handleCopy(listing._id)}
                       className={`p-2 rounded-lg transition-all border
                         ${copiedId === listing._id 
                           ? 'bg-green-50 text-green-600 border-green-200' 
                           : 'text-gray-400 hover:text-purple-600 hover:bg-white border-transparent hover:border-purple-100'
                         }`}
                       title="Copy Link"
                     >
                       {copiedId === listing._id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                     </button>
                   </div>
                 </div>
               ))
             ) : (
               <div className="text-center py-12 text-gray-500">
                 No listings found matching your search.
               </div>
             )}
           </div>
           
           <div className="p-6 border-t border-gray-100 bg-gray-50/50">
             <p className="text-xs text-center text-gray-500">
               Click the copy icon to copy the direct link to the property.
             </p>
           </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ShareListingModal;
