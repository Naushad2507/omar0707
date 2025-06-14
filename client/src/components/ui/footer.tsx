import { Link } from "wouter";
import { Facebook, Twitter, Instagram, Linkedin, Shield } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div>
            <h3 className="text-2xl font-bold mb-4">Instoredealz</h3>
            <p className="text-gray-300 mb-4">
              Your ultimate destination for discovering amazing deals from local businesses across India.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* For Customers */}
          <div>
            <h4 className="font-semibold mb-4">For Customers</h4>
            <ul className="space-y-2 text-gray-300">
              <li>
                <Link href="/customer/deals" className="hover:text-white transition-colors">
                  Browse Deals
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-white transition-colors">
                  Membership Plans
                </Link>
              </li>
              <li>
                <Link href="/customer/dashboard" className="hover:text-white transition-colors">
                  My Account
                </Link>
              </li>
              <li>
                <a href="#help" className="hover:text-white transition-colors">
                  Help Center
                </a>
              </li>
            </ul>
          </div>

          {/* For Businesses */}
          <div>
            <h4 className="font-semibold mb-4">For Businesses</h4>
            <ul className="space-y-2 text-gray-300">
              <li>
                <Link href="/vendor/benefits" className="hover:text-white transition-colors">
                  Become a Vendor
                </Link>
              </li>
              <li>
                <Link href="/vendor/dashboard" className="hover:text-white transition-colors">
                  Vendor Dashboard
                </Link>
              </li>
              <li>
                <a href="#marketing" className="hover:text-white transition-colors">
                  Marketing Tools
                </a>
              </li>
              <li>
                <a href="#support" className="hover:text-white transition-colors">
                  Business Support
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-gray-300">
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <a href="#cookies" className="hover:text-white transition-colors">
                  Cookie Consent
                </a>
              </li>
              <li>
                <a href="#refund" className="hover:text-white transition-colors">
                  Refund Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-300">
            © 2024 Instoredealz. All rights reserved.
          </p>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <span className="text-gray-300">🇮🇳 Made in India</span>
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-success" />
              <span className="text-gray-300 text-sm">Secure & Trusted</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
