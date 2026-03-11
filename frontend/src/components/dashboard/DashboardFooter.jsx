import { Link } from 'react-router-dom';
import { 
  HelpCircle, FileText, Shield, Mail, Phone,
  MessageSquare, Clock, ExternalLink
} from 'lucide-react';

const DashboardFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white mt-auto">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/help" className="text-gray-400 hover:text-white text-sm flex items-center gap-2 transition-colors">
                  <HelpCircle className="w-4 h-4" />
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/tickets" className="text-gray-400 hover:text-white text-sm flex items-center gap-2 transition-colors">
                  <MessageSquare className="w-4 h-4" />
                  Support Tickets
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-400 hover:text-white text-sm flex items-center gap-2 transition-colors">
                  <FileText className="w-4 h-4" />
                  FAQs
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-4">
              Legal
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/terms" className="text-gray-400 hover:text-white text-sm flex items-center gap-2 transition-colors">
                  <FileText className="w-4 h-4" />
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-400 hover:text-white text-sm flex items-center gap-2 transition-colors">
                  <Shield className="w-4 h-4" />
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/guidelines" className="text-gray-400 hover:text-white text-sm flex items-center gap-2 transition-colors">
                  <FileText className="w-4 h-4" />
                  Community Guidelines
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Support */}
          <div>
            <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-4">
              Need Help?
            </h3>
            <div className="space-y-3">
              <a 
                href="mailto:support@jonacrest.com" 
                className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors"
              >
                <Mail className="w-4 h-4" />
                support@jonacrest.com
              </a>
              <a 
                href="tel:+233548000000" 
                className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors"
              >
                <Phone className="w-4 h-4" />
                +233 548 000 000
              </a>
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <Clock className="w-4 h-4" />
                Mon - Fri: 8AM - 6PM GMT
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <span className="text-white text-xs font-bold">JC</span>
              </div>
              <div>
                <p className="text-sm text-gray-400">
                  © {currentYear} Jona Crest Properties. All rights reserved.
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">
                Dashboard v2.0
              </span>
              <Link 
                to="/" 
                className="text-sm text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
              >
                Visit Main Site
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default DashboardFooter;
