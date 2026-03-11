import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, MapPin, Bed, Bath, Square, Calendar, 
  User, Phone, Mail, Share2, Heart, Star, 
  Map as MapIcon, Video, CheckCircle, Shield,
  Currency, DollarSign, Clock
} from 'lucide-react';
import axios from 'axios';
import { Backendurl } from '../../App';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../context/CurrencyContext';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import ReviewSection from '../../components/reviews/ReviewSection';

// Fix Leaflet Icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const DashboardPropertyView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { formatPrice } = useCurrency();
    
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState(0);
    const [showMap, setShowMap] = useState(false);

    useEffect(() => {
        fetchPropertyDetails();
    }, [id]);

    const fetchPropertyDetails = async () => {
        try {
            const response = await axios.get(`${Backendurl}/api/products/get/${id}`);
            if (response.data.product) {
                setProperty(response.data.product);
            }
        } catch (error) {
            console.error("Error fetching property:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
         return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
            </div>
        );
    }

    if (!property) return null;

    const images = property.image || [];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 lg:p-10 transition-colors duration-200">
            {/* Navigation Header */}
            <div className="max-w-7xl mx-auto mb-8 flex justify-between items-center">
                <button 
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors font-medium px-4 py-2 rounded-xl hover:bg-white dark:hover:bg-gray-800"
                >
                    <ArrowLeft className="w-5 h-5" /> Back to Dashboard
                </button>
                <div className="flex gap-3">
                    <button className="p-3 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-xl hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all shadow-sm">
                        <Heart className="w-5 h-5" />
                    </button>
                    <button className="p-3 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-xl hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-all shadow-sm">
                        <Share2 className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-8">
                
                {/* Left Column: Visuals & Details (8 cols) */}
                <div className="lg:col-span-8 space-y-8">
                    
                    {/* Hero Image / Gallery */}
                    <div className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-700 relative group">
                        <AnimatePresence mode="wait">
                            <motion.img 
                                key={activeImage}
                                src={images[activeImage] || '/placeholder.jpg'}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.5 }}
                                className="w-full h-[500px] object-cover"
                            />
                        </AnimatePresence>
                        
                        {/* Status Badge */}
                        <div className="absolute top-6 left-6 flex gap-3">
                            <span className={`px-4 py-1.5 rounded-lg text-sm font-bold backdrop-blur-md shadow-lg ${
                                property.listingType === 'Sale' ? 'bg-blue-600/90 text-white' : 'bg-teal-600/90 text-white'
                            }`}>
                                For {property.listingType}
                            </span>
                            {property.featured && (
                                <span className="px-4 py-1.5 bg-amber-500/90 text-white rounded-lg text-sm font-bold backdrop-blur-md shadow-lg flex items-center gap-1">
                                    <Star className="w-3 h-3 fill-current" /> Featured
                                </span>
                            )}
                        </div>

                         {/* Thumbnail Selector Overlay */}
                        <div className="absolute bottom-6 left-6 right-6 flex gap-3 overflow-x-auto pb-2 scrollbar-none z-10">
                            {images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveImage(idx)}
                                    className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                                        activeImage === idx ? 'border-white scale-110 shadow-xl' : 'border-white/50 opacity-70 hover:opacity-100 hover:scale-105'
                                    }`}
                                >
                                    <img src={img} className="w-full h-full object-cover" alt={`View ${idx}`} />
                                </button>
                            ))}
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                    </div>

                    {/* Property Title & Header Info */}
                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{property.title}</h1>
                                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                                    <MapPin className="w-5 h-5 text-teal-500" />
                                    <span>{property.location}</span>
                                    {property.address?.street && <span className="text-gray-300 mx-2">|</span>}
                                    {property.address?.street && <span>{property.address.street}</span>}
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-4xl font-extrabold text-teal-600 dark:text-teal-400">
                                    {formatPrice(property.price)}
                                </p>
                                <p className="text-gray-400 text-sm mt-1">{property.listingType === 'Rent' ? '/ Month' : 'Total Price'}</p>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-3 md:grid-cols-6 gap-4 py-6 border-y border-gray-100 dark:border-gray-700">
                            <div className="flex flex-col items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-2xl">
                                <Bed className="w-6 h-6 text-indigo-500 mb-1" />
                                <span className="font-bold text-gray-900 dark:text-white text-lg">{property.beds}</span>
                                <span className="text-xs text-gray-500">Beds</span>
                            </div>
                            <div className="flex flex-col items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-2xl">
                                <Bath className="w-6 h-6 text-blue-500 mb-1" />
                                <span className="font-bold text-gray-900 dark:text-white text-lg">{property.baths}</span>
                                <span className="text-xs text-gray-500">Baths</span>
                            </div>
                            <div className="flex flex-col items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-2xl md:col-span-2">
                                <Square className="w-6 h-6 text-emerald-500 mb-1" />
                                <span className="font-bold text-gray-900 dark:text-white text-lg">{property.sqft}</span>
                                <span className="text-xs text-gray-500">Sq Ft</span>
                            </div>
                             <div className="flex flex-col items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-2xl md:col-span-2">
                                <Calendar className="w-6 h-6 text-amber-500 mb-1" />
                                <span className="font-bold text-gray-900 dark:text-white text-lg">{property.type}</span>
                                <span className="text-xs text-gray-500">Type</span>
                            </div>
                        </div>

                         {/* Description */}
                         <div className="mt-8">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">About this property</h3>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                                {property.description}
                            </p>
                        </div>

                        {/* Amenities */}
                        <div className="mt-8">
                             <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Amenities</h3>
                             <div className="flex flex-wrap gap-3">
                                 {property.amenities?.map((amenity, idx) => (
                                     <span key={idx} className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-medium border border-gray-100 dark:border-gray-600">
                                         <CheckCircle className="w-4 h-4 text-teal-500" />
                                         {amenity}
                                     </span>
                                 ))}
                                 {(!property.amenities || property.amenities.length === 0) && (
                                     <span className="text-gray-400 italic">No amenities listed.</span>
                                 )}
                             </div>
                        </div>

                        {/* Location / Map Toggle */}
                        {property.coordinates && property.coordinates.lat && (
                            <div className="mt-8">
                                <div className="flex justify-between items-center mb-4">
                                     <h3 className="text-xl font-bold text-gray-900 dark:text-white">Location</h3>
                                     <button 
                                        onClick={() => setShowMap(!showMap)}
                                        className="text-teal-600 font-medium flex items-center gap-1 hover:underline"
                                     >
                                         <MapIcon className="w-4 h-4" /> {showMap ? 'Hide Map' : 'Show on Map'}
                                     </button>
                                </div>
                                {showMap && (
                                    <motion.div 
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 300 }}
                                        className="rounded-2xl overflow-hidden shadow-inner border border-gray-200 dark:border-gray-600"
                                    >
                                        <MapContainer 
                                            center={[property.coordinates.lat, property.coordinates.lng]} 
                                            zoom={14} 
                                            style={{ height: '100%', width: '100%' }}
                                        >
                                            <TileLayer
                                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                                attribution='&copy; OpenStreetMap'
                                            />
                                            <Marker position={[property.coordinates.lat, property.coordinates.lng]}>
                                                <Popup>{property.title}</Popup>
                                            </Marker>
                                        </MapContainer>
                                    </motion.div>
                                )}
                            </div>

                        )}

                        {/* Reviews Section */}
                        <div className="mt-8">
                             <ReviewSection targetId={id} targetType="Property" targetModel="Product" />
                        </div>
                    </div>
                </div>

                {/* Right Column: Key Details & Owner Info (4 cols) */}
                <div className="lg:col-span-4 space-y-8">
                    
                    {/* Owner/Landlord Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Property Owner</h3>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-2xl font-bold text-teal-600 dark:text-teal-400">
                                {property.ownerId?.firstName ? property.ownerId.firstName[0] : (property.ownerId?.name ? property.ownerId.name[0] : 'U')}
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 dark:text-white text-lg">
                                    {property.ownerId?.firstName || property.ownerId?.name || 'Unknown Owner'}
                                </h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Verified Landlord</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <a href={`tel:${property.phone}`} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-teal-50 dark:hover:bg-teal-900/10 transition-colors group">
                                <div className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-sm text-teal-600 group-hover:text-teal-500">
                                    <Phone className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Call Agent</p>
                                    <p className="font-semibold text-gray-900 dark:text-white">{property.phone || 'N/A'}</p>
                                </div>
                            </a>
                             
                             <button className="w-full flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-teal-50 dark:hover:bg-teal-900/10 transition-colors group text-left">
                                <div className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-sm text-teal-600 group-hover:text-teal-500">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Send Message</p>
                                    <p className="font-semibold text-gray-900 dark:text-white">In-App Chat</p>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Verification Status */}
                    <div className="bg-gradient-to-br from-teal-500 to-emerald-600 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-white/20 rounded-full blur-xl" />
                        <Shield className="w-10 h-10 mb-4 opacity-90" />
                        <h3 className="text-xl font-bold mb-2">Verified Listing</h3>
                        <p className="text-teal-50 opacity-90 text-sm mb-6">
                            This property has been verified by Jona Crest Properties for authenticity and accuracy.
                        </p>
                        <div className="flex items-center gap-2 text-xs font-bold bg-white/20 backdrop-blur rounded-lg px-3 py-2 w-fit">
                            <CheckCircle className="w-4 h-4" /> VERIFIED ID: {id.substring(0,8).toUpperCase()}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default DashboardPropertyView;
