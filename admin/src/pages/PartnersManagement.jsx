import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Handshake, Plus, Edit3, Trash2, X, Upload, Loader,
  ExternalLink, Image as ImageIcon, Check, AlertCircle
} from 'lucide-react';
import { backendurl } from '../config/constants';
import { TablePageShimmer } from '../components/ShimmerLoading';
import toast from 'react-hot-toast';

const PartnersManagement = () => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);
  const [formData, setFormData] = useState({ name: '', website: '', description: '' });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const fileInputRef = useRef(null);

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${backendurl}/api/partners`);
      if (res.data.success) {
        setPartners(res.data.partners || []);
      }
    } catch (err) {
      console.error('Error fetching partners:', err);
      toast.error('Failed to fetch partners');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPartners(); }, []);

  const resetForm = () => {
    setFormData({ name: '', website: '', description: '' });
    setLogoFile(null);
    setLogoPreview(null);
    setEditingPartner(null);
    setShowForm(false);
  };

  const handleEdit = (partner) => {
    setEditingPartner(partner);
    setFormData({
      name: partner.name || '',
      website: partner.website || '',
      description: partner.description || ''
    });
    setLogoPreview(partner.logo || null);
    setLogoFile(null);
    setShowForm(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Partner name is required');
      return;
    }

    try {
      setSubmitting(true);
      const data = new FormData();
      data.append('name', formData.name);
      data.append('website', formData.website);
      data.append('description', formData.description);
      if (logoFile) {
        data.append('logo', logoFile);
      }

      let res;
      if (editingPartner) {
        res = await axios.put(`${backendurl}/api/partners/${editingPartner._id}`, data, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        res = await axios.post(`${backendurl}/api/partners`, data, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      }

      if (res.data.success) {
        toast.success(editingPartner ? 'Partner updated successfully' : 'Partner added successfully');
        resetForm();
        fetchPartners();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save partner');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (partnerId) => {
    if (!window.confirm('Are you sure you want to delete this partner?')) return;
    try {
      setDeletingId(partnerId);
      const res = await axios.delete(`${backendurl}/api/partners/${partnerId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.data.success) {
        toast.success('Partner deleted successfully');
        setPartners(prev => prev.filter(p => p._id !== partnerId));
      }
    } catch (err) {
      toast.error('Failed to delete partner');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <TablePageShimmer />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Partners & Sponsors</h1>
          <p className="text-gray-500 mt-1">{partners.length} partners listed on homepage</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="glass-btn flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Partner
        </button>
      </div>

      {/* Partners Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {partners.map((partner, idx) => (
          <motion.div
            key={partner._id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="glass-card p-6 group relative"
          >
            {/* Logo */}
            <div className="w-full h-24 rounded-xl bg-gray-50/80 flex items-center justify-center mb-4 overflow-hidden">
              {partner.logo ? (
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className="max-h-20 max-w-full object-contain"
                />
              ) : (
                <Handshake className="w-10 h-10 text-gray-300" />
              )}
            </div>

            {/* Info */}
            <h3 className="font-bold text-gray-800 mb-1">{partner.name}</h3>
            {partner.description && (
              <p className="text-sm text-gray-500 line-clamp-2 mb-2">{partner.description}</p>
            )}
            {partner.website && (
              <a
                href={partner.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600 font-medium"
              >
                <ExternalLink className="w-3 h-3" />
                Visit website
              </a>
            )}

            {/* Actions */}
            <div className="absolute top-4 right-4 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => handleEdit(partner)}
                className="p-2 rounded-lg bg-white/80 hover:bg-blue-100 text-gray-500 hover:text-blue-600 transition-all shadow-sm"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDelete(partner._id)}
                disabled={deletingId === partner._id}
                className="p-2 rounded-lg bg-white/80 hover:bg-red-100 text-gray-500 hover:text-red-600 transition-all shadow-sm disabled:opacity-50"
              >
                {deletingId === partner._id ? (
                  <Loader className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {partners.length === 0 && !showForm && (
        <div className="glass-card p-16 text-center">
          <Handshake className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No partners yet</p>
          <p className="text-gray-400 text-sm mb-4">Add partners to display them on the homepage</p>
          <button
            onClick={() => setShowForm(true)}
            className="glass-btn inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add First Partner
          </button>
        </div>
      )}

      {/* Add/Edit Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={resetForm}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="glass-card p-8 max-w-md w-full"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">
                  {editingPartner ? 'Edit Partner' : 'Add Partner'}
                </h3>
                <button onClick={resetForm} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Logo Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Logo</label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-32 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all"
                  >
                    {logoPreview ? (
                      <img src={logoPreview} alt="Preview" className="max-h-24 max-w-full object-contain" />
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-gray-300 mb-2" />
                        <p className="text-sm text-gray-400">Click to upload logo</p>
                        <p className="text-xs text-gray-300">PNG, JPG, SVG (max 5MB)</p>
                      </>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Partner Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="glass-input w-full"
                    placeholder="e.g. Google"
                    required
                  />
                </div>

                {/* Website */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Website URL</label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                    className="glass-input w-full"
                    placeholder="https://example.com"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="glass-input w-full resize-none"
                    rows={3}
                    placeholder="Brief description of the partnership"
                  />
                </div>

                {/* Submit */}
                <div className="flex items-center gap-3 pt-2">
                  <button type="button" onClick={resetForm} className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-all">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 glass-btn flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {submitting ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    {editingPartner ? 'Update' : 'Add Partner'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PartnersManagement;
