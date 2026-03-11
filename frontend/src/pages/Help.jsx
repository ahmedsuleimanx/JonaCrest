import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HelpCircle, ChevronDown, Search, Mail, Phone, MessageSquare,
  Home, Building, Users, Calendar, FileText, Shield, Briefcase,
  Key, CreditCard, Settings, Eye, Bell, BookOpen, Video, ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import DashboardFooter from '../components/dashboard/DashboardFooter';

// Role-specific FAQ content
const faqContent = {
  tenant: {
    title: 'User Help Center',
    description: 'Find answers to common questions about searching, viewing, and renting properties.',
    categories: [
      {
        name: 'Property Search',
        icon: Search,
        faqs: [
          { q: 'How do I search for properties?', a: 'Use the search bar on the homepage or Properties page to search by location, price range, property type, and more. You can also use filters to narrow down your results.' },
          { q: 'Can I save properties for later?', a: 'Yes! Click the heart icon on any property to save it to your favorites. View all saved properties in your dashboard.' },
          { q: 'How do I set up property alerts?', a: 'Go to Settings > Notifications and enable "New Listing Alerts". You\'ll be notified when properties matching your criteria are listed.' }
        ]
      },
      {
        name: 'Viewings',
        icon: Eye,
        faqs: [
          { q: 'How do I schedule a viewing?', a: 'Click "Schedule Viewing" on any property page, select your preferred date and time, and submit your request. The landlord or agent will confirm your appointment.' },
          { q: 'Can I reschedule a viewing?', a: 'Yes, go to your dashboard and find the viewing you want to reschedule. Click the reschedule button and select a new time.' },
          { q: 'What if I need to cancel?', a: 'Please cancel at least 24 hours in advance. Go to your dashboard, find the viewing, and click Cancel. This helps landlords manage their schedules.' }
        ]
      },
      {
        name: 'Account & Security',
        icon: Shield,
        faqs: [
          { q: 'How do I update my profile?', a: 'Go to your Profile page from the user menu. You can update your name, photo, and preferences. Some fields like email are protected for security.' },
          { q: 'How do I change my password?', a: 'Go to Settings > Security and use the password change form. You\'ll need to enter your current password for verification.' }
        ]
      }
    ]
  },
  landlord: {
    title: 'Landlord Help Center',
    description: 'Learn how to list properties, manage viewings, and communicate with potential tenants.',
    categories: [
      {
        name: 'Property Listings',
        icon: Building,
        faqs: [
          { q: 'How do I list a new property?', a: 'From your dashboard, click "Add Property" and fill in the property details including photos, description, amenities, and pricing. Submit for review and it will be live within 24 hours.' },
          { q: 'How do I edit my listing?', a: 'Go to your Properties tab in the dashboard, find the property, and click the Edit icon. Make your changes and save.' },
          { q: 'Why is my listing not showing?', a: 'New listings require admin approval. If your listing has been pending for more than 24 hours, please contact support.' }
        ]
      },
      {
        name: 'Managing Viewings',
        icon: Calendar,
        faqs: [
          { q: 'How do I approve a viewing request?', a: 'Go to your Viewings tab and you\'ll see all pending requests. Click Approve to confirm or Decline if the time doesn\'t work.' },
          { q: 'Can I suggest alternative times?', a: 'Yes, when declining a viewing request, you can use the messaging feature to suggest alternative times to the interested party.' }
        ]
      },
      {
        name: 'Payments',
        icon: CreditCard,
        faqs: [
          { q: 'How do I receive rent payments?', a: 'Set up your payment details in Settings. Rent payments can be processed through the platform or arranged directly with tenants.' },
          { q: 'What fees do landlords pay?', a: 'Please refer to our pricing page or contact support for current fee structures.' }
        ]
      }
    ]
  },
  agent: {
    title: 'Agent Help Center',
    description: 'Resources for managing clients, leads, and property listings effectively.',
    categories: [
      {
        name: 'Lead Management',
        icon: Users,
        faqs: [
          { q: 'How do I add a new lead?', a: 'Click "Add Lead" in your Leads section. Enter the prospect\'s contact information, interests, and any notes. Set their status to track your progress.' },
          { q: 'What do the lead statuses mean?', a: 'New: Just added. Hot: Very interested, ready to move. Warm: Interested but not urgent. Cold: Low priority. Converted: Became a client. Lost: No longer interested.' },
          { q: 'How do I convert a lead to a client?', a: 'When a lead signs a contract or commits to a property, change their status to "Converted". They\'ll appear in your Clients section.' }
        ]
      },
      {
        name: 'Property Listings',
        icon: Building,
        faqs: [
          { q: 'How do I list properties for clients?', a: 'Use the "Add Listing" feature to create property listings. You can assign listings to specific landlord clients.' },
          { q: 'Can I manage listings for multiple landlords?', a: 'Yes, as an agent you can manage listings for all your landlord clients from your dashboard.' }
        ]
      },
      {
        name: 'Commission & Earnings',
        icon: Briefcase,
        faqs: [
          { q: 'How are commissions calculated?', a: 'Commission rates are set in your agent profile. Contact admin if you need to update your rate.' },
          { q: 'When do I get paid?', a: 'Commission payments are processed after successful property transactions. Contact support for payment schedule details.' }
        ]
      }
    ]
  },
  admin: {
    title: 'Admin Help Center',
    description: 'System administration guides and troubleshooting resources.',
    categories: [
      {
        name: 'User Management',
        icon: Users,
        faqs: [
          { q: 'How do I change a user\'s role?', a: 'Go to Users tab, find the user, and use the role dropdown to change their role. Changes take effect immediately.' },
          { q: 'How do I suspend a user?', a: 'Find the user in the Users list and click the Suspend button. They will not be able to login until reactivated.' }
        ]
      },
      {
        name: 'Property Approval',
        icon: Building,
        faqs: [
          { q: 'How do I approve pending properties?', a: 'Go to Properties tab and filter by "Pending". Review each listing and click Approve or Reject with a reason.' },
          { q: 'What should I check before approving?', a: 'Verify: accurate information, appropriate photos, correct pricing, valid contact details, and compliance with guidelines.' }
        ]
      },
      {
        name: 'System Settings',
        icon: Settings,
        faqs: [
          { q: 'How do I access system logs?', a: 'Contact your technical administrator for access to system logs and advanced diagnostics.' },
          { q: 'How do I update platform settings?', a: 'Go to Settings > System Settings. Be careful as changes affect all users.' }
        ]
      }
    ]
  }
};

const Help = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const userRole = user?.role || 'tenant';
  const content = faqContent[userRole] || faqContent.tenant;

  // Filter FAQs based on search
  const filteredCategories = content.categories.map(category => ({
    ...category,
    faqs: category.faqs.filter(
      faq => 
        faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.faqs.length > 0);

  const displayCategories = selectedCategory 
    ? filteredCategories.filter(c => c.name === selectedCategory)
    : filteredCategories;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col transition-colors duration-300">
      <DashboardHeader />
      
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{content.title}</h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">{content.description}</p>
        </div>

        {/* Search */}
        <div className="max-w-xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for help..."
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              !selectedCategory
                ? 'bg-emerald-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            All Topics
          </button>
          {content.categories.map(category => (
            <button
              key={category.name}
              onClick={() => setSelectedCategory(category.name)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category.name
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <category.icon className="w-4 h-4" />
              {category.name}
            </button>
          ))}
        </div>

        {/* FAQ Sections */}
        <div className="space-y-8">
          {displayCategories.map((category, catIdx) => (
            <div key={category.name} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                  <category.icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{category.name}</h2>
              </div>

              <div className="space-y-3">
                {category.faqs.map((faq, faqIdx) => {
                  const faqId = `${catIdx}-${faqIdx}`;
                  const isExpanded = expandedFaq === faqId;

                  return (
                    <div
                      key={faqIdx}
                      className="border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden"
                    >
                      <button
                        onClick={() => setExpandedFaq(isExpanded ? null : faqId)}
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <span className="font-medium text-gray-900 dark:text-white">{faq.q}</span>
                        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </button>
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="p-4 pt-0 text-gray-600 dark:text-gray-400">
                              {faq.a}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Links */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 text-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">Contact Support</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Get help from our support team</p>
            <Link
              to="/tickets"
              className="inline-flex items-center gap-2 text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              Create Ticket <ExternalLink className="w-4 h-4" />
            </Link>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 text-center">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Mail className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">Email Us</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Send us an email directly</p>
            <a
              href="mailto:support@jonacrest.com"
              className="inline-flex items-center gap-2 text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              support@jonacrest.com <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 text-center">
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Phone className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">Call Us</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Mon - Fri: 8AM - 6PM GMT</p>
            <a
              href="tel:+233548000000"
              className="inline-flex items-center gap-2 text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              +233 548 000 000 <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </main>

      <DashboardFooter />
    </div>
  );
};

export default Help;
