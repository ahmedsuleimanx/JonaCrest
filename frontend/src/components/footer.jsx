import { useState } from 'react';
import { 
  Home, 
  Twitter, 
  Facebook, 
  Instagram, 
  Github, 
  Mail, 
  Send, 
  MapPin, 
  Phone,
  ChevronRight,
  ArrowRight,
  ChevronDown,
  Sparkles,
  Heart,
  Star,
  Zap,
  Clock,
  Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { Backendurl } from '../App';
import PropTypes from 'prop-types';
import jonaLogo from '../assets/jona_crest_logo.png';

// Enhanced Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.2,
      staggerChildren: 0.1
    }
  }
};

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 20,
      duration: 0.6
    }
  }
};

const floatingAnimation = {
  y: [-2, 2, -2],
  transition: {
    duration: 4,
    repeat: Infinity,
    ease: "easeInOut"
  }
};

const glowAnimation = {
  boxShadow: [
    "0 0 20px rgba(0, 121, 107, 0.3)",
    "0 0 40px rgba(0, 121, 107, 0.5)",
    "0 0 20px rgba(0, 121, 107, 0.3)"
  ],
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: "easeInOut"
  }
};

// Mobile Collapsible Footer Section
const MobileFooterSection = ({ title, children, icon: Icon }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div 
      className="border border-white/20 bg-white/40 backdrop-blur-md rounded-xl p-4 hover:shadow-lg transition-all duration-300"
      whileHover={{ scale: 1.02 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between text-left"
      >
        <div className="flex items-center gap-3">
          {Icon && <Icon className="w-5 h-5 text-primary" />}
          <h3 className="text-base font-bold text-gray-800">
            {title}
          </h3>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown className="w-5 h-5 text-gray-500" />
        </motion.div>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="mt-4 pt-4 border-t border-gray-100/50">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Footer Column Component
const FooterColumn = ({ title, children, className = '', delay = 0, icon: Icon }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      className={`${className} group`}
    >
      {title && (
        <div className="flex items-center gap-2 mb-6">
          {Icon && (
            <motion.div 
              className="p-2 bg-gradient-to-br from-primary to-accent-dark rounded-lg shadow-sm"
              animate={floatingAnimation}
            >
              <Icon className="w-4 h-4 text-white" />
            </motion.div>
          )}
          <h3 className="text-lg font-bold text-gray-800 tracking-tight">
            {title}
          </h3>
        </div>
      )}
      {children}
    </motion.div>
  );
};

// Footer Link Component
const FooterLink = ({ href, children, icon: Icon }) => {
  return (
    <motion.a 
      href={href} 
      className="group flex items-center text-gray-600 transition-all duration-300 hover:text-primary hover:font-medium py-2.5 relative overflow-hidden"
      whileHover={{ x: 5 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
      <div className="relative z-10 flex items-center">
        {Icon && <Icon className="w-4 h-4 mr-3 text-primary opacity-60 group-hover:opacity-100 transition-opacity duration-300" />}
        <ChevronRight className="w-3 h-3 mr-2 text-primary opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-x-2 group-hover:translate-x-0" />
        <span>{children}</span>
      </div>
    </motion.a>
  );
};

// Social Links Component
const socialLinks = [
  { 
    icon: Twitter, 
    href: '#', 
    label: 'Twitter', 
    color: 'from-[#1DA1F2] to-[#0d8bd9]',
    hoverColor: 'hover:shadow-[#1DA1F2]/25' 
  },
  { 
    icon: Facebook, 
    href: '#', 
    label: 'Facebook', 
    color: 'from-[#1877F2] to-[#0d65d9]',
    hoverColor: 'hover:shadow-[#1877F2]/25' 
  },
  { 
    icon: Instagram, 
    href: '#', 
    label: 'Instagram', 
    color: 'from-[#fd5949] via-[#d6249f] to-[#285AEB]',
    hoverColor: 'hover:shadow-pink-500/25' 
  },
  { 
    icon: Github, 
    href: 'https://github.com/AAYUSH412/Real-Estate-Website', 
    label: 'GitHub', 
    color: 'from-gray-800 to-gray-600',
    hoverColor: 'hover:shadow-gray-800/25' 
  },
];

const SocialLinks = () => {
  return (
    <div className="flex items-center gap-4 mt-8">
      <span className="text-sm text-gray-600 font-medium">Connect with us:</span>
      <div className="flex gap-3">
        {socialLinks.map(({ icon: Icon, href, label, color, hoverColor }) => (
          <motion.a
            key={label}
            whileHover={{ scale: 1.15, y: -2 }}
            whileTap={{ scale: 0.95 }}
            href={href}
            title={label}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center justify-center text-white bg-gradient-to-br ${color} ${hoverColor} rounded-xl w-10 h-10 shadow-md hover:shadow-lg transition-all duration-300 relative overflow-hidden group`}
          >
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            <Icon className="w-5 h-5 relative z-10" />
          </motion.a>
        ))}
      </div>
    </div>
  );
};

// Newsletter Component
const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${Backendurl || 'http://localhost:4000'}/news/newsdata`, { email });
      if (response.status === 200) {
        toast.success('🎉 Successfully subscribed to our newsletter!');
        setEmail('');
      } else {
        toast.error('Failed to subscribe. Please try again.');
      }
    } catch (error) {
      console.error('Error subscribing to newsletter:', error);
      toast.error('Failed to subscribe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      className="relative p-7 bg-gradient-to-br from-white/80 via-white/40 to-white/20 backdrop-blur-xl rounded-3xl border border-white/50 shadow-xl"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Background decoration */}
      <div className="absolute top-3 right-3">
        <motion.div animate={glowAnimation}>
          <Sparkles className="w-5 h-5 text-secondary" />
        </motion.div>
      </div>
      
      <div className="flex items-center gap-3 mb-4">
        <motion.div 
          className="p-2.5 bg-gradient-to-br from-primary to-accent rounded-xl shadow-lg"
          animate={floatingAnimation}
        >
          <Mail className="w-5 h-5 text-white" />
        </motion.div>
        <div>
          <h3 className="text-lg font-bold text-gray-900 leading-tight">Newsletter</h3>
          <p className="text-xs text-primary font-medium uppercase tracking-wider">Stay Updated</p>
        </div>
      </div>
      
      <p className="text-gray-600 mb-6 text-sm leading-relaxed">
        Join our exclusive community for market insights and priority access to new listings.
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative group">
          <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors h-5 w-5" />
          <input
            type="email"
            name="email"
            id="newsletter-email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-12 pr-4 py-3.5 w-full text-gray-700 placeholder-gray-400 bg-white/60 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 shadow-sm hover:bg-white/80"
          />
        </div>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-primary to-accent-dark text-white px-6 py-3.5 rounded-xl flex items-center justify-center hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 disabled:opacity-70 font-semibold text-sm group"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Subscribing...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              <span>Subscribe Now</span>
            </div>
          )}
        </motion.button>
      </form>

      <p className="mt-4 text-[10px] text-gray-500 flex items-center gap-1 justify-center opacity-70">
        <Shield className="w-3 h-3" />
        Secure & spam-free. Unsubscribe anytime.
      </p>
    </motion.div>
  );
};

// Main Footer Component
const companyLinks = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Properties', href: '/properties', icon: MapPin },
  { name: 'About Us', href: '/about', icon: Star },
  { name: 'Contact', href: '/contact', icon: Mail },
  { name: 'Jona Crest AI', href: '/ai-property-hub', icon: Zap },
];

const helpLinks = [
  { name: 'Customer Support', href: '/', icon: Heart },
  { name: 'FAQs', href: '/', icon: Sparkles },
  { name: 'Terms & Conditions', href: '/', icon: Shield },
  { name: 'Privacy Policy', href: '/', icon: Clock },
];

const contactInfo = [
  { 
    icon: MapPin, 
    text: '123 Property Plaza, Silicon Valley, CA 94088',
    href: 'https://maps.google.com/?q=123+Property+Plaza,Silicon+Valley,CA+94088' 
  },
  { 
    icon: Phone, 
    text: '+1 (234) 567-890',
    href: 'tel:+1234567890'
  },
  { 
    icon: Mail, 
    text: 'support@jonacrestproperties.com',
    href: 'mailto:support@jonacrestproperties.com' 
  },
];

const Footer = () => {
  return (
    <footer className="relative mt-20">
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-50/50 to-gray-100/80 pointer-events-none"></div>
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
      
      {/* Main Footer */}
      <div className="relative pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Brand section */}
          <motion.div 
            className="text-center lg:text-left mb-16"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-center lg:justify-start mb-6">
              <motion.div 
                className="rounded-xl overflow-hidden shadow-xl"
                whileHover={{ scale: 1.05 }}
              >
                <img src={jonaLogo} alt="Jona Crest Properties" className="h-14 w-14 object-contain" />
              </motion.div>
              <div className="ml-4 text-left">
                <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-600 via-primary to-primary-dark">
                  Jona Crest Properties
                </span>
                <p className="text-xs text-amber-600 font-bold uppercase tracking-[0.2em] mt-1">Your Dream Home Awaits</p>
              </div>
            </div>
            
            <motion.p 
              className="text-gray-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed text-lg font-light"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              Your trusted partner in finding the perfect home. We blend cutting-edge AI technology with personalized service to make your property journey seamless and extraordinary.
            </motion.p>
            
            <div className="flex justify-center lg:justify-start">
              <SocialLinks />
            </div>
          </motion.div>

          {/* Desktop layout */}
          <div className="hidden lg:grid grid-cols-12 gap-10 mb-16">
            {/* Quick Links Column */}
            <FooterColumn 
              title="Quick Links" 
              className="col-span-3" 
              delay={0.2}
              icon={Home}
            >
              <ul className="space-y-1">
                {companyLinks.map(link => (
                  <li key={link.name}>
                    <FooterLink href={link.href} icon={link.icon}>
                      {link.name}
                    </FooterLink>
                  </li>
                ))}
              </ul>
            </FooterColumn>

            {/* Help Column */}
            <FooterColumn 
              title="Support Center" 
              className="col-span-3" 
              delay={0.3}
              icon={Heart}
            >
              <ul className="space-y-1">
                {helpLinks.map(link => (
                  <li key={link.name}>
                    <FooterLink href={link.href} icon={link.icon}>
                      {link.name}
                    </FooterLink>
                  </li>
                ))}
              </ul>
            </FooterColumn>

            {/* Contact Info */}
            <FooterColumn 
              title="Get in Touch" 
              className="col-span-3" 
              delay={0.4}
              icon={MapPin}
            >
              <ul className="space-y-4 pt-2">
                {contactInfo.map((item, index) => (
                  <li key={index}>
                    <motion.a 
                      href={item.href} 
                      className="group flex items-start text-gray-600 hover:text-primary transition-all duration-300 p-3 rounded-2xl hover:bg-white hover:shadow-md border border-transparent hover:border-gray-100"
                      target={item.icon === MapPin ? "_blank" : undefined}
                      rel={item.icon === MapPin ? "noopener noreferrer" : undefined}
                      whileHover={{ x: 5 }}
                    >
                      <div className="p-2.5 bg-primary/5 rounded-xl mr-4 group-hover:bg-primary/10 transition-colors duration-300">
                        <item.icon className="w-5 h-5 text-primary" />
                      </div>
                      <span className="text-sm font-medium leading-relaxed">{item.text}</span>
                    </motion.a>
                  </li>
                ))}
              </ul>
            </FooterColumn>
            
            {/* Newsletter */}
            <div className="col-span-3">
              <Newsletter />
            </div>
          </div>

          {/* Mobile Accordions */}
          <motion.div 
            className="lg:hidden space-y-4 mb-12"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <MobileFooterSection title="Quick Links" icon={Home}>
              <ul className="space-y-2">
                {companyLinks.map(link => (
                  <li key={link.name}>
                    <FooterLink href={link.href} icon={link.icon}>
                      {link.name}
                    </FooterLink>
                  </li>
                ))}
              </ul>
            </MobileFooterSection>

            <MobileFooterSection title="Support" icon={Heart}>
              <ul className="space-y-2">
                {helpLinks.map(link => (
                  <li key={link.name}>
                    <FooterLink href={link.href} icon={link.icon}>
                      {link.name}
                    </FooterLink>
                  </li>
                ))}
              </ul>
            </MobileFooterSection>

            <MobileFooterSection title="Contact Us" icon={MapPin}>
              <ul className="space-y-3">
                {contactInfo.map((item, index) => (
                  <li key={index}>
                    <motion.a 
                      href={item.href} 
                      className="flex items-start text-gray-600 hover:text-primary transition-colors duration-200 p-2 rounded-lg hover:bg-primary-50"
                      target={item.icon === MapPin ? "_blank" : undefined}
                      rel={item.icon === MapPin ? "noopener noreferrer" : undefined}
                    >
                      <item.icon className="w-4 h-4 mt-1 mr-3 flex-shrink-0 text-primary" />
                      <span className="text-sm">{item.text}</span>
                    </motion.a>
                  </li>
                ))}
              </ul>
            </MobileFooterSection>

            <div className="pt-6">
              <Newsletter />
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Bottom Bar */}
      <div className="relative bg-gray-900 text-white overflow-hidden">
        {/* Abstract background shape */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-accent/20 rounded-full blur-3xl opacity-30"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <motion.p 
              className="text-sm text-gray-400 text-center md:text-left flex items-center gap-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span>© {new Date().getFullYear()} Jona Crest Properties. All Rights Reserved.</span>
              <span className="hidden sm:inline text-gray-600">|</span>
              <span className="flex items-center gap-1.5">
                Made with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 animate-pulse" /> in Ghana
              </span>
            </motion.p>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-xs font-semibold rounded-xl transition-all duration-300 border border-white/5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <ArrowRight className="w-4 h-4 -rotate-90" />
              Back to Top
            </motion.button>
          </div>
        </div>
      </div>

      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        toastStyle={{
          borderRadius: '16px',
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(0, 121, 107, 0.1)',
          color: '#1a1a2e',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}
      />
    </footer>
  );
};

Footer.propTypes = {
  title: PropTypes.string,
  children: PropTypes.node,
  icon: PropTypes.elementType
};

MobileFooterSection.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  icon: PropTypes.elementType
};

FooterColumn.propTypes = {
  title: PropTypes.string,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  delay: PropTypes.number,
  icon: PropTypes.elementType
};

FooterLink.propTypes = {
  href: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  icon: PropTypes.elementType
};

export default Footer;