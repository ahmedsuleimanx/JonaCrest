import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  Search, 
  MapPin, 
  Home, 
  Building, 
  Building2, 
  TrendingUp,
  Users,
  Play,
  Pause,
  Volume2,
  VolumeX,
} from "lucide-react";

// Premium CDN video URLs for real estate
const HERO_VIDEO_URL = "https://player.vimeo.com/external/434045526.hd.mp4?s=c27eeaa34f32e2d8f996e0d5d3d7c8c8a3f3f3f3&profile_id=175";
const HERO_FALLBACK_IMAGE = "https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop";

// Enhanced Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 20
    }
  }
};

const Hero = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [activeTab, setActiveTab] = useState("buy");
  const [searchQuery, setSearchQuery] = useState("");
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => setVideoError(true));
    }
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsVideoPlaying(!isVideoPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/properties?search=${encodeURIComponent(searchQuery)}&type=${activeTab}`);
    } else {
      navigate(`/properties?type=${activeTab}`);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  const popularLocations = ["Accra", "Kumasi", "Takoradi", "Tema"];
  const stats = [
    { label: "Happy Customers", value: "15k+", icon: Users },
    { label: "Properties Listed", value: "8k+", icon: Building },
    { label: "Cities Covered", value: "25+", icon: MapPin },
  ];

  return (
    <div className="relative min-h-[100vh] flex items-center justify-center overflow-hidden pt-16">
      {/* Video/Image Background */}
      <div className="absolute inset-0 z-0">
        {!videoError ? (
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            onLoadedData={() => setVideoLoaded(true)}
            onError={() => setVideoError(true)}
            className="absolute inset-0 w-full h-full object-cover"
            poster={HERO_FALLBACK_IMAGE}
          >
            <source src={HERO_VIDEO_URL} type="video/mp4" />
          </video>
        ) : (
          <img 
            src={HERO_FALLBACK_IMAGE}
            alt="Luxury Real Estate"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        
        {/* Gradient Overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
      </div>

      {/* Video Controls */}
      {!videoError && (
        <div className="absolute bottom-8 right-8 z-30 flex gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={togglePlay}
            className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-colors"
          >
            {isVideoPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleMute}
            className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-colors"
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </motion.button>
        </div>
      )}

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          
          {/* Left Content */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex-1 text-center lg:text-left pt-10"
          >
            {/* Badge */}
            <motion.div 
              variants={itemVariants}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-8"
            >
              <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-sm font-semibold text-white/90 tracking-wide uppercase">
                #1 Real Estate Platform in Ghana
              </span>
            </motion.div>

            <motion.h1 
              variants={itemVariants}
              className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6 leading-[1.1] tracking-tight text-white"
            >
              Discover Life at
              <span className="block mt-2 bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-200">
                Jona Crest
              </span>
            </motion.h1>

            <motion.p 
              variants={itemVariants}
              className="text-lg sm:text-xl text-white/80 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-light"
            >
              Experience the pinnacle of luxury living. We connect you with exclusive properties that match your lifestyle and aspirations.
            </motion.p>

            {/* Search Card */}
            <motion.div 
              variants={itemVariants}
              className="bg-white rounded-3xl p-3 shadow-xl shadow-gray-200/50 border border-gray-100 max-w-2xl mx-auto lg:mx-0"
            >
              {/* Tabs */}
              <div className="flex gap-2 mb-3 bg-gray-50/80 p-1.5 rounded-2xl w-fit">
                {[
                  { id: 'buy', label: 'Buy', icon: Home },
                  { id: 'rent', label: 'Rent', icon: Building2 },
                  { id: 'sell', label: 'Sell', icon: TrendingUp }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                      activeTab === tab.id
                        ? "bg-white text-primary shadow-sm ring-1 ring-black/5"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Search Inputs */}
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative group">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                  <input 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Search location, property type..." 
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                  />
                </div>
                <button 
                  onClick={handleSearch}
                  className="bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white p-4 rounded-2xl font-semibold shadow-lg shadow-primary/25 transition-all active:scale-95 flex items-center justify-center gap-2 min-w-[140px]"
                >
                  <Search className="w-5 h-5" />
                  Search
                </button>
              </div>

               {/* Popular Tags */}
               <div className="mt-4 flex items-center gap-2 text-sm text-gray-500 overflow-x-auto pb-2 scrollbar-hide px-2">
                <span className="font-semibold whitespace-nowrap">Popular:</span>
                <div className="flex gap-2">
                    {popularLocations.map(loc => (
                        <button 
                          key={loc} 
                          onClick={() => navigate(`/properties?location=${encodeURIComponent(loc)}`)}
                          className="px-3 py-1 bg-gray-50 hover:bg-primary/5 hover:text-primary rounded-full transition-colors whitespace-nowrap border border-transparent hover:border-primary/10"
                        >
                            {loc}
                        </button>
                    ))}
                </div>
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div 
              variants={itemVariants}
              className="flex items-center gap-8 mt-12 mb-8 justify-center lg:justify-start"
            >
              {stats.map((stat, index) => (
                <div key={index} className="flex flex-col bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                  <span className="text-2xl font-bold text-white">{stat.value}</span>
                  <span className="text-sm text-white/70 font-medium">{stat.label}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Side - Floating Property Cards */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex-1 relative hidden lg:flex flex-col gap-4 items-end"
          >
            {/* Featured Property Card */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="bg-white/95 backdrop-blur-md rounded-3xl p-6 shadow-2xl max-w-sm"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-amber-500 rounded-xl flex items-center justify-center">
                  <Home className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Featured Property</p>
                  <p className="text-sm text-gray-500">Just Listed</p>
                </div>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <p className="font-medium text-gray-900">Luxury Villa in East Legon</p>
                <p>5 Beds • 4 Baths • 4,500 sqft</p>
                <p className="text-primary font-bold text-lg">$850,000</p>
              </div>
            </motion.div>

            {/* Market Stats Card */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xl flex items-center gap-4"
            >
              <div className="bg-green-100 p-3 rounded-full">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Market Trending</p>
                <p className="text-xs text-gray-500">+12% value increase</p>
              </div>
            </motion.div>

            {/* Trust Indicator */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1 }}
              className="bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xl flex items-center gap-3"
            >
              <div className="flex -space-x-2">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-amber-400 border-2 border-white flex items-center justify-center text-white text-xs font-bold">
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">15k+ Happy Clients</p>
                <p className="text-xs text-gray-500">Trusted across Ghana</p>
              </div>
            </motion.div>
          </motion.div>
        
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2"
        >
          <motion.div className="w-1.5 h-3 bg-white/50 rounded-full" />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Hero;