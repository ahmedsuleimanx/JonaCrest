import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, MapPin, Building, Briefcase, Calendar, 
  Shield, Mail, Phone, Flag, Star, ArrowLeft
} from 'lucide-react';
import axios from 'axios';
import { Backendurl } from '../App';
import { useAuth } from '../context/AuthContext';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import DashboardFooter from '../components/dashboard/DashboardFooter';
import ReviewSection from '../components/reviews/ReviewSection';
import CreateTicketModal from '../components/dashboard/CreateTicketModal';
import { useCurrency } from '../context/CurrencyContext';

const PublicProfile = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('about');
  const [listings, setListings] = useState([]);
  const [loadingListings, setLoadingListings] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  
  const { formatPrice, getCurrencySymbol } = useCurrency();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${Backendurl}/api/profile/${id}`);
        if (response.data.success) {
          setProfile(response.data.user);
          // If user is landlord or agent, fetch their listings
          if (['landlord', 'agent'].includes(response.data.user.role)) {
             fetchListings(response.data.user._id);
          }
        } else {
          setError('Profile not found');
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  const fetchListings = async (userId) => {
      try {
          setLoadingListings(true);
          // Now supported by backend: ownerId query param
          const response = await axios.get(`${Backendurl}/api/products/list?ownerId=${userId}&limit=8`);
          if (response.data.success) {
              setListings(response.data.products);
          }
      } catch (err) {
          console.error("Error fetching listings:", err);
      } finally {
          setLoadingListings(false);
      }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  const getRoleBadge = (role) => {
    const badges = {
      admin: { color: 'bg-purple-100 text-purple-700', label: 'Administrator' },
      landlord: { color: 'bg-emerald-100 text-emerald-700', label: 'Property Owner' },
      agent: { color: 'bg-amber-100 text-amber-700', label: 'Real Estate Agent' },
      tenant: { color: 'bg-blue-100 text-blue-700', label: 'Member' }
    };
    return badges[role] || badges.tenant;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 flex justify-center">
         <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 flex flex-col items-center justify-center p-4">
        <User className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{error || 'Profile Not Found'}</h2>
        <Link to="/" className="text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-2">
           <ArrowLeft className="w-4 h-4" /> Return Home
        </Link>
      </div>
    );
  }

  const roleBadge = getRoleBadge(profile.role);
  const isAgentOrLandlord = ['agent', 'landlord'].includes(profile.role);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <DashboardHeader />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        
        {/* Profile Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mb-8">
           <div className="h-32 bg-gradient-to-r from-emerald-500 to-teal-600 dark:from-emerald-900 dark:to-teal-900"></div>
           <div className="px-8 pb-8 relative">
              <div className="absolute -top-16 left-8">
                 <div className="w-32 h-32 rounded-2xl bg-white dark:bg-gray-800 p-1 shadow-lg">
                    <div className="w-full h-full rounded-xl bg-gray-100 dark:bg-gray-700 overflow-hidden flex items-center justify-center text-4xl font-bold text-gray-400">
                       {profile.image ? (
                           <img src={profile.image} alt={profile.name} className="w-full h-full object-cover" />
                       ) : (
                           profile.name?.charAt(0)?.toUpperCase()
                       )}
                    </div>
                 </div>
              </div>

              <div className="pl-0 sm:pl-40 pt-16 sm:pt-4 flex flex-col sm:flex-row justify-between items-start gap-4">
                 <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                       {profile.name}
                       {profile.role === 'verified' && <Shield className="w-6 h-6 text-blue-500" fill="currentColor" />}
                    </h1>
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                       <span className={`px-3 py-1 rounded-full text-sm font-medium ${roleBadge.color}`}>
                          {roleBadge.label}
                       </span>
                       <span className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
                          <MapPin className="w-4 h-4 mr-1" />
                          {profile.city || 'Accra'}, {profile.country || 'Ghana'}
                       </span>
                       <span className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
                          <Calendar className="w-4 h-4 mr-1" />
                          Joined {formatDate(profile.createdAt)}
                       </span>
                    </div>
                 </div>

                 <div className="flex gap-3">
                    {/* Only show contact if user is logged in (optional logic, keeping simple for now) */}
                    {currentUser && (
                        <button 
                           onClick={() => setShowReportModal(true)}
                           className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors font-medium text-sm"
                        >
                           <Flag className="w-4 h-4" /> Report
                        </button>
                    )}
                 </div>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Left Column (Sidebar-ish) */}
           <div className="lg:col-span-1 space-y-6">
              {/* Info Card */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                 <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">About</h3>
                 <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                    {profile.bio || `No bio added yet.`}
                 </p>
                 
                 <div className="space-y-4">
                    {profile.companyName && (
                        <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                           <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                              <Building className="w-5 h-5" />
                           </div>
                           <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Company</p>
                              <p className="font-medium">{profile.companyName}</p>
                           </div>
                        </div>
                    )}
                    {profile.agencyName && (
                        <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                           <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
                              <Briefcase className="w-5 h-5" />
                           </div>
                           <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Agency</p>
                              <p className="font-medium">{profile.agencyName}</p>
                           </div>
                        </div>
                    )}
                    {(profile.email || profile.phone) && (
                        <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                           <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Contact Info</p>
                           {profile.email && (
                               <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2 truncate">
                                   <Mail className="w-4 h-4" /> {profile.email}
                               </div>
                           )}
                           {profile.phone && (
                               <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                   <Phone className="w-4 h-4" /> {profile.phone}
                               </div>
                           )}
                        </div>
                    )}
                 </div>
              </div>
           </div>

           {/* Right Column (Tabs Content) */}
           <div className="lg:col-span-2">
              {/* Tabs */}
              <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
                 {isAgentOrLandlord && (
                     <button
                        onClick={() => setActiveTab('listings')}
                        className={`px-6 py-2 rounded-full font-medium transition-colors whitespace-nowrap
                           ${activeTab === 'listings' 
                              ? 'bg-emerald-600 text-white' 
                              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/10'}`}
                     >
                        Properties ({listings.length})
                     </button>
                 )}
                 <button
                    onClick={() => setActiveTab('reviews')}
                    className={`px-6 py-2 rounded-full font-medium transition-colors whitespace-nowrap
                       ${activeTab === 'reviews' 
                          ? 'bg-emerald-600 text-white' 
                          : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/10'}`}
                 >
                    Reviews & Ratings
                 </button>
                 <button
                    onClick={() => setActiveTab('about')}
                    className={`lg:hidden px-6 py-2 rounded-full font-medium transition-colors whitespace-nowrap
                       ${activeTab === 'about' 
                          ? 'bg-emerald-600 text-white' 
                          : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}
                 >
                    About
                 </button>
              </div>

              {/* Tab Content */}
              <div className="space-y-6">
                 {/* Listings Tab */}
                 {activeTab === 'listings' && isAgentOrLandlord && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                       {loadingListings ? (
                           [...Array(4)].map((_, i) => (
                               <div key={i} className="bg-white dark:bg-gray-800 rounded-xl h-64 animate-pulse"></div>
                           ))
                       ) : listings.length > 0 ? (
                           listings.map(property => (
                               <Link key={property._id} to={`/properties/single/${property._id}`} className="group bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-gray-700">
                                   <div className="h-48 relative overflow-hidden">
                                       <img src={property.image[0]} alt={property.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                       <div className="absolute top-3 left-3 bg-emerald-600 text-white text-xs font-bold px-2 py-1 rounded">
                                           {property.listingType}
                                       </div>
                                       <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-lg text-sm font-bold">
                                           {getCurrencySymbol()}{formatPrice(property.price, { showSymbol: false })}
                                       </div>
                                   </div>
                                   <div className="p-4">
                                       <h4 className="font-bold text-gray-900 dark:text-white truncate mb-1">{property.title}</h4>
                                       <p className="text-gray-500 dark:text-gray-400 text-sm truncate flex items-center">
                                           <MapPin className="w-3 h-3 mr-1" /> {property.location}
                                       </p>
                                       <div className="flex gap-3 mt-3 text-xs text-gray-500 dark:text-gray-400">
                                           <span className='flex items-center gap-1'><span className='font-bold text-gray-900 dark:text-white'>{property.beds}</span> Beds</span>
                                           <span className='flex items-center gap-1'><span className='font-bold text-gray-900 dark:text-white'>{property.baths}</span> Baths</span>
                                       </div>
                                   </div>
                               </Link>
                           ))
                       ) : (
                           <div className="col-span-full py-12 text-center text-gray-500 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                               No properties listed yet.
                           </div>
                       )}
                    </div>
                 )}

                 {/* Reviews Tab */}
                 {activeTab === 'reviews' && (
                    <ReviewSection 
                        targetId={profile._id} 
                        targetType={profile.role === 'admin' ? 'Agent' : (profile.role.charAt(0).toUpperCase() + profile.role.slice(1))} 
                        targetModel="User"
                    />
                 )}
                 
                 {/* Mobile About Tab (Only visible on mobile via state, but content duplicated here if I strictly follow tabs for responsive)
                     Actually, I already show "About" in left column. On mobile left column stacks. 
                     The 'About' tab button is only for mobile if I hide the sidebar on mobile.
                     Let's keep it simple: Show sidebar always first.
                 */}
              </div>
           </div>
        </div>
      </main>

      <DashboardFooter />

      {/* Report Modal */}
      <CreateTicketModal
         isOpen={showReportModal}
         onClose={() => setShowReportModal(false)}
         initialData={{
             subject: `Reporting User: ${profile.name}`,
             description: `I would like to report suspicious activity regarding user ${profile.name} (ID: ${profile._id}).\n\nDetails:\n`,
             category: 'other',
             type: 'complaint',
             priority: 'high'
         }}
      />
    </div>
  );
};

export default PublicProfile;
