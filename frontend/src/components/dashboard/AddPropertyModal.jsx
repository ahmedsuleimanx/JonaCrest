import { useState, useEffect } from 'react';
import { X, Save, Building, MapPin, DollarSign, Upload, Loader2, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Backendurl } from '../../App';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet marker icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Map Click Component
function LocationMarker({ position, setPosition }) {
    useMapEvents({
        click(e) {
            setPosition(e.latlng);
        },
    });

    return position === null ? null : (
        <Marker position={position}></Marker>
    );
}

const AddPropertyModal = ({ isOpen, onClose, onSave, endpoint = `${Backendurl}/api/products/add`, method = 'POST', initialData = null }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    currency: 'GHS',
    location: '', // General text location (City/Region)
    type: 'Sale', // Property Type e.g Apartment
    listingType: 'Sale', // Sale vs Rent
    status: 'active',
    beds: '',
    baths: '',
    sqft: '',
    amenities: '',
    address: '', // Specific address text
    phone: '',
    videoUrl: ''
  });
  
  const [mapPosition, setMapPosition] = useState(null); // { lat, lng }
  
  const [images, setImages] = useState({
    image1: null,
    image2: null,
    image3: null,
    image4: null
  });

  const [previews, setPreviews] = useState({
    image1: null,
    image2: null,
    image3: null,
    image4: null
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      // Parse address if it is an object
      let addrStr = '';
      if (typeof initialData.address === 'object' && initialData.address !== null) {
          // Flatten address object to string for input
          if(initialData.address.street) addrStr = initialData.address.street;
          else addrStr = JSON.stringify(initialData.address);
      } else {
          addrStr = initialData.address || '';
      }

      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        price: initialData.price || '',
        currency: initialData.currency || 'GHS',
        location: initialData.location || '',
        type: initialData.type || 'Sale',
        listingType: initialData.listingType || 'Sale',
        status: initialData.status || 'active',
        beds: initialData.beds || '',
        baths: initialData.baths || '',
        sqft: initialData.sqft || '',
        amenities: Array.isArray(initialData.amenities) ? initialData.amenities.join(', ') : (initialData.amenities || ''),
        address: addrStr,
        phone: initialData.phone || '',
        videoUrl: initialData.videoUrl || ''
      });

      // Handle Map Position
      if (initialData.coordinates && initialData.coordinates.lat && initialData.coordinates.lng) {
          setMapPosition({ lat: initialData.coordinates.lat, lng: initialData.coordinates.lng });
      } else {
          // Default to Accra if no coords
           setMapPosition({ lat: 5.6037, lng: -0.1870 });
      }

      // Handle existing images
      if (initialData.image && initialData.image.length > 0) {
        setPreviews({
          image1: initialData.image[0] || null,
          image2: initialData.image[1] || null,
          image3: initialData.image[2] || null,
          image4: initialData.image[3] || null
        });
      }
    } else {
        // Reset if no initialData (Add Mode)
        setFormData({
            title: '', description: '', price: '', currency: 'GHS', location: '',
            type: 'Sale', listingType: 'Sale', status: 'active',
            beds: '', baths: '', sqft: '', amenities: '', address: '', phone: '', videoUrl: ''
        });
        setMapPosition({ lat: 5.6037, lng: -0.1870 }); // Default Accra
        setPreviews({ image1: null, image2: null, image3: null, image4: null });
        setImages({ image1: null, image2: null, image3: null, image4: null });
    }
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e, key) => {
    const file = e.target.files[0];
    if (file) {
      setImages(prev => ({ ...prev, [key]: file }));
      setPreviews(prev => ({ ...prev, [key]: URL.createObjectURL(file) }));
    }
  };

  const handleRemoveImage = (e, key) => {
    e.stopPropagation(); 
    e.preventDefault();
    setImages(prev => ({ ...prev, [key]: null }));
    setPreviews(prev => ({ ...prev, [key]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      
      // Append basic fields, ensuring complex types are handled
      Object.keys(formData).forEach(key => {
        if (key === 'amenities') {
            // Send as is; backend handles comma-separated string or array
             data.append(key, formData[key]);
        } else if (key === 'address') {
             // Backend schema expects an object structure for address
             // We construct a JSON string representing that object
             const addrObj = { 
                 street: formData.address, 
                 city: formData.location.split(',')[0] || formData.location, // Approximate city from location field
                 ghanaPostGps: '' // Could add a field for this if needed
             };
             data.append(key, JSON.stringify(addrObj));
        } else {
            data.append(key, formData[key]);
        }
      });

      // Append Map Coordinates
      if (mapPosition) {
          data.append('coordinates', JSON.stringify({ lat: mapPosition.lat, lng: mapPosition.lng }));
      }

      // Append Images (New Files)
      Object.keys(images).forEach(key => {
        if (images[key]) {
          data.append(key, images[key]);
        }
      });

      // Handle Retained Existing Images
      const existingImagesList = [];
      Object.keys(previews).forEach(key => {
          // If preview exists but NO new file, it is an existing image url
          if (previews[key] && !images[key]) {
              existingImagesList.push(previews[key]);
          }
      });
      data.append('existingImages', JSON.stringify(existingImagesList));

      const token = localStorage.getItem('token');
      
      const config = {
        method: method,
        url: endpoint,
        data: data,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      };

      const response = await axios(config);

      if (response.data.success) {
        toast.success(initialData ? 'Property updated successfully' : 'Property added successfully');
        if (onSave) onSave();
        onClose();
      }
    } catch (error) {
      console.error('Error saving property:', error);
      toast.error(error.response?.data?.message || 'Failed to save property');
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
          className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-5xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-gray-800 z-10">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{initialData ? 'Edit Property' : 'Add New Property'}</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-gray-50 dark:bg-gray-900/50">
            <div className="grid lg:grid-cols-2 gap-8">
                
                {/* LEFT COLUMN: BASIC INFO & IMAGES */}
                <div className="space-y-6">
                    {/* Images */}
                    <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-4 flex items-center gap-2">
                             <ImageIcon className="w-4 h-4 text-teal-500" /> Property Images (Max 4)
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            {['image1', 'image2', 'image3', 'image4'].map((key, index) => (
                            <div key={key} className="relative group aspect-[4/3]">
                                <input
                                type="file"
                                id={key}
                                name={key}
                                onChange={(e) => handleImageChange(e, key)}
                                className="hidden"
                                accept="image/*"
                                />
                                <label
                                htmlFor={key}
                                className={`flex flex-col items-center justify-center w-full h-full border-2 border-dashed rounded-xl cursor-pointer transition-all overflow-hidden relative
                                    ${previews[key] 
                                        ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20' 
                                        : 'border-gray-200 dark:border-gray-600 hover:border-teal-500 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                                >
                                {previews[key] ? (
                                    <>
                                     <img src={previews[key]} alt="Preview" className="w-full h-full object-cover" />
                                     
                                     {/* Remove Button */}
                                     <div className="absolute top-2 right-2 z-20">
                                         <button 
                                            type="button"
                                            onClick={(e) => handleRemoveImage(e, key)}
                                            className="p-1.5 bg-red-500 rounded-full text-white hover:bg-red-600 shadow-sm transition-colors"
                                         >
                                             <X className="w-3 h-3" />
                                         </button>
                                     </div>

                                     <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center pointer-events-none">
                                         {/* Optional overlay content if needed */}
                                     </div>
                                    </>
                                ) : (
                                    <>
                                    <Upload className="w-6 h-6 text-gray-400 mb-2" />
                                    <span className="text-xs text-gray-500 dark:text-gray-400">Image {index + 1}</span>
                                    </>
                                )}
                                </label>
                            </div>
                            ))}
                        </div>
                    </div>

                    {/* Basic Details */}
                    <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-medium placeholder:text-gray-400"
                                placeholder="e.g. Luxury Apartment in Osu"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="4"
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all placeholder:text-gray-400"
                                placeholder="Describe the property features, neighborhood..."
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: LOCATION, SPECS & MAP */}
                <div className="space-y-6">
                    {/* Price & Type */}
                    <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 text-xs font-bold">
                                    {formData.currency}
                                </span>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-bold"
                                    placeholder="0.00"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Listing Type</label>
                            <select
                                name="listingType"
                                value={formData.listingType}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all cursor-pointer"
                            >
                                <option value="Sale">For Sale</option>
                                <option value="Rent">For Rent</option>
                            </select>
                        </div>
                    </div>

                    {/* Specs */}
                    <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Beds</label>
                            <input type="number" name="beds" value={formData.beds} onChange={handleChange} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-center font-semibold" required />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Baths</label>
                            <input type="number" name="baths" value={formData.baths} onChange={handleChange} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-center font-semibold" required />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Sqft</label>
                            <input type="number" name="sqft" value={formData.sqft} onChange={handleChange} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-center font-semibold" required />
                        </div>
                    </div>

                    {/* Map & Location */}
                    <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                             <MapPin className="w-4 h-4 text-teal-500" /> Exact Location
                        </label>
                        
                        <div className="h-48 w-full rounded-xl overflow-hidden border border-gray-200 dark:border-gray-600 relative z-0">
                             <MapContainer 
                                center={mapPosition || [5.6037, -0.1870]} 
                                zoom={13} 
                                style={{ height: '100%', width: '100%' }}
                            >
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                />
                                <LocationMarker position={mapPosition} setPosition={setMapPosition} />
                             </MapContainer>
                             {!mapPosition && (
                                 <div className="absolute inset-0 flex items-center justify-center bg-black/5 pointer-events-none">
                                     <span className="bg-white/90 px-3 py-1 rounded text-xs font-bold text-gray-600">Click to set location</span>
                                 </div>
                             )}
                        </div>
                        <p className="text-xs text-gray-400 text-center">
                            {mapPosition ? `Selected: ${mapPosition.lat.toFixed(5)}, ${mapPosition.lng.toFixed(5)}` : 'Click on the map to pin the exact location'}
                        </p>

                         <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Street / Address</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm"
                                    placeholder="123 Main St"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">City / Area</label>
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm"
                                    placeholder="Accra"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Amenities & Contact */}
                    <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-3">
                         <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amenities</label>
                            <input
                                type="text"
                                name="amenities"
                                value={formData.amenities}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                                placeholder="Pool, Gym, WiFi..."
                            />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact Phone</label>
                            <input
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                                placeholder="+233..."
                                required
                            />
                        </div>
                    </div>

                </div>
            </div>

            {/* Footer Actions */}
            <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 p-4 -mx-6 -mb-6 mt-6 flex gap-4 z-20">
                <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-3 px-4 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl font-medium transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-teal-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {loading ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" /> {initialData ? 'Saving...' : 'Add Property'}
                    </>
                    ) : (
                    <>
                        <Save className="w-5 h-5" /> {initialData ? 'Save Changes' : 'Add Property'} 
                    </>
                    )}
                </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AddPropertyModal;
