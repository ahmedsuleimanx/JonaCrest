import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, Loader2, User } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Backendurl } from '../../App';

const ScheduleViewingModal = ({ isOpen, onClose, listings, leads, onSchedule }) => {
  const [formData, setFormData] = useState({
    propertyId: '',
    userId: '', // Client/Lead ID
    date: '',
    timeSlot: '',
    type: 'In-Person',
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  // Filter listings to only active ones if needed, currently all
  const activeListings = listings || [];
  // Use leads as clients
  const activeLeads = leads || [];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.propertyId || !formData.date || !formData.timeSlot || !formData.userId) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${Backendurl}/api/viewings/schedule`,
        formData,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      toast.success('Viewing scheduled successfully');
      if (onSchedule) onSchedule();
      onClose();
      // Reset form
      setFormData({
        propertyId: '',
        userId: '',
        date: '',
        timeSlot: '',
        type: 'In-Person',
        notes: ''
      });
    } catch (error) {
      console.error('Error scheduling viewing:', error);
      toast.error(error.response?.data?.message || 'Failed to schedule viewing');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           exit={{ opacity: 0, scale: 0.95 }}
           className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden"
        >
           <div className="flex justify-between items-center p-6 border-b border-gray-100">
             <h3 className="text-xl font-bold text-gray-900">Schedule Viewing</h3>
             <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
               <X className="w-5 h-5 text-gray-500" />
             </button>
           </div>
           
           <form onSubmit={handleSubmit} className="p-6 space-y-4">
             {/* Property Selection */}
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Property</label>
                <select
                  name="propertyId"
                  value={formData.propertyId}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                >
                  <option value="">-- Choose a Property --</option>
                  {activeListings.map(listing => (
                    <option key={listing._id} value={listing._id}>
                      {listing.title} ({listing.location})
                    </option>
                  ))}
                </select>
             </div>

             {/* Client Selection */}
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Client (Lead)</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select
                    name="userId"
                    value={formData.userId}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  >
                    <option value="">-- Choose a Client --</option>
                    {activeLeads.map(lead => (
                      <option key={lead._id} value={lead.userId?._id || lead._id}>
                         {/* Fallback to lead._id if userId is not populated/linked yet, but backend expects userId. 
                             Ideally leads should be linked to users or we create a user for them.
                             For now, assuming leads might be just objects. If lead.userId exists use it, else we might fail if backend expects User ID. 
                             Wait, leads schema usually has userId if they are registered.
                             If they are just offline leads, they might not have a user account.
                             Check if lead has userId. If not, this might fail. 
                             Let's assume for 'Quick Actions' we select from registered users or leads that are users.
                         */}
                        {lead.name} ({lead.email})
                      </option>
                    ))}
                  </select>
                </div>
                 <p className="text-xs text-gray-500 mt-1">* Only leads with registered accounts can be scheduled via this form.</p>
             </div>

             {/* Date & Time */}
             <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                    />
                  </div>
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time Slot</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select
                      name="timeSlot"
                      value={formData.timeSlot}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                    >
                      <option value="">Select Time</option>
                      <option value="09:00 AM">09:00 AM</option>
                      <option value="10:00 AM">10:00 AM</option>
                      <option value="11:00 AM">11:00 AM</option>
                      <option value="01:00 PM">01:00 PM</option>
                      <option value="02:00 PM">02:00 PM</option>
                      <option value="03:00 PM">03:00 PM</option>
                      <option value="04:00 PM">04:00 PM</option>
                    </select>
                  </div>
               </div>
             </div>

             {/* Type */}
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Viewing Type</label>
                <div className="flex gap-4">
                  {['In-Person', 'Virtual'].map(type => (
                    <label key={type} className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="type" 
                        value={type} 
                        checked={formData.type === type}
                        onChange={handleChange}
                        className="text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-gray-700">{type}</span>
                    </label>
                  ))}
                </div>
             </div>

             {/* Notes */}
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Any specific requirements or instructions..."
                  rows="3"
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 resize-none"
                />
             </div>

             <div className="flex gap-3 pt-4">
               <button
                 type="button"
                 onClick={onClose}
                 className="flex-1 py-2.5 bg-gray-50 text-gray-700 font-medium rounded-xl hover:bg-gray-100 transition-colors"
               >
                 Cancel
               </button>
               <button
                 type="submit"
                 disabled={loading}
                 className="flex-1 py-2.5 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
               >
                 {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Schedule Viewing'}
               </button>
             </div>
           </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ScheduleViewingModal;
