import { useState } from 'react';
import { ShoppingBag, TrendingUp, Shield, Zap, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center shadow-md">
                <span className="text-2xl">🛍️</span>
              </div>
              <span className="text-2xl font-bold text-gray-800">
                My<span className="text-orange-500">Merch</span>
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-600 hover:text-orange-500 transition">Features</a>
              {/* <a href="#about" className="text-gray-600 hover:text-orange-500 transition">About</a>
              <a href="#contact" className="text-gray-600 hover:text-orange-500 transition">Contact</a> */}
              <Link to="/login" className="text-gray-600 hover:text-orange-500 transition">Login</Link>
              <Link to="/signup" className="bg-orange-500 text-white px-6 py-2 rounded-lg">Sign Up</Link>
            </div>

            {/* Mobile menu button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-gray-600"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 space-y-3">
              <a href="#features" className="block text-gray-600 hover:text-orange-500 transition">Features</a>
              <a href="#about" className="block text-gray-600 hover:text-orange-500 transition">About</a>
              <a href="#contact" className="block text-gray-600 hover:text-orange-500 transition">Contact</a>
              <a href="#" className="block text-gray-600 hover:text-orange-500 transition">Login</a>
              <a href="#" className="block bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition text-center">
                Sign Up
              </a>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-orange-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Your Merchandise,{' '}
              <span className="text-orange-500">Simplified</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Manage, track, and grow your merchandise business with ease. MyMerch provides everything you need in one powerful platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/signup" className="bg-orange-500 text-white px-8 py-4 rounded-lg hover:bg-orange-600 transition text-lg font-semibold shadow-lg">
                Get Started Free
              </a>
              <a href="#features" className="bg-white text-orange-500 px-8 py-4 rounded-lg hover:bg-gray-50 transition text-lg font-semibold border-2 border-orange-500">
                Learn More
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose MyMerch?</h2>
            <p className="text-xl text-gray-600">Everything you need to run your merchandise business</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gray-50 p-8 rounded-lg hover:shadow-lg transition">
              <div className="w-14 h-14 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <ShoppingBag className="w-7 h-7 text-orange-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Inventory Management</h3>
              <p className="text-gray-600">
                Keep track of all your products, stock levels, and variants in one centralized dashboard.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gray-50 p-8 rounded-lg hover:shadow-lg transition">
              <div className="w-14 h-14 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-7 h-7 text-orange-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Sales Analytics</h3>
              <p className="text-gray-600">
                Gain insights into your sales performance with detailed analytics and reports.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gray-50 p-8 rounded-lg hover:shadow-lg transition">
              <div className="w-14 h-14 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-7 h-7 text-orange-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Secure & Reliable</h3>
              <p className="text-gray-600">
                Your data is protected with enterprise-grade security and automatic backups.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-orange-500 to-orange-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-orange-100 mb-8">
            Join thousands of merchants who trust MyMerch to manage their business
          </p>
          <a href="#" className="inline-block bg-white text-orange-500 px-8 py-4 rounded-lg hover:bg-gray-100 transition text-lg font-semibold shadow-lg">
            Create Your Account
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🛍️</span>
                </div>
                <span className="text-xl font-bold">
                  My<span className="text-orange-500">Merch</span>
                </span>
              </div>
              <p className="text-gray-400">Your merchandise, simplified</p>
            </div>

            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-orange-500 transition">Features</a></li>
                <li><a href="#" className="hover:text-orange-500 transition">Pricing</a></li>
                <li><a href="#" className="hover:text-orange-500 transition">Security</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-orange-500 transition">About</a></li>
                <li><a href="#" className="hover:text-orange-500 transition">Blog</a></li>
                <li><a href="#" className="hover:text-orange-500 transition">Careers</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-orange-500 transition">Help Center</a></li>
                <li><a href="#" className="hover:text-orange-500 transition">Contact</a></li>
                <li><a href="#" className="hover:text-orange-500 transition">Terms</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2026 MyMerch. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}