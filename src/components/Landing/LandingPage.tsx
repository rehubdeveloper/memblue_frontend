"use client"

import React, { useState, useContext } from "react"
import {
  ArrowRight,
  CheckCircle,
  Star,
  Calendar,
  Zap,
  Wrench,
  Droplets,
  Wind,
  Key,
  Building,
  MapPin,
  LogIn,
  Menu,
  X,
} from "lucide-react"
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AppContext';

interface LandingPageProps {
  onGetStarted?: () => void
  onLogin?: () => void
}

type FeatureKey = "electricians" | "plumbers" | "hvac" | "contractors" | "locksmiths"

const features: Record<FeatureKey, { icon: React.ReactElement; title: string; items: string[] }> = {
  electricians: {
    icon: <Zap className="text-yellow-500" size={24} />,
    title: "For Electricians",
    items: ["Job scheduling", "Estimate builder", "Photo invoicing", "Real Memphis leads"],
  },
  plumbers: {
    icon: <Droplets className="text-blue-500" size={24} />,
    title: "For Plumbers",
    items: ["Emergency alerts", "Service zones", "Upfront pricing tools", "Real Memphis leads"],
  },
  hvac: {
    icon: <Wind className="text-red-500" size={24} />,
    title: "For HVAC",
    items: ["Maintenance routes", "Repeat clients", "Seasonal tune-up plans", "Real Memphis leads"],
  },
  contractors: {
    icon: <Building className="text-orange-500" size={24} />,
    title: "For Contractors",
    items: ["Multi-crew calendars", "License tracking", "Site budgeting", "Real Memphis leads"],
  },
  locksmiths: {
    icon: <Key className="text-purple-500" size={24} />,
    title: "For Locksmiths",
    items: ["Quick quotes", "Key inventory", "Lockout lead forms", "Real Memphis leads"],
  },
}

const testimonials = [
  {
    quote: "Memblue gave me 8 jobs in my first month — more than my cousin's $300 site ever did.",
    author: "Marcus T.",
    trade: "Electrician, East Memphis",
  },
  {
    quote: "I'm not techy. But I'm making quotes in 2 minutes now.",
    author: "Linda R.",
    trade: "Plumber, Midtown",
  },
  {
    quote: "My crew's not texting me anymore — it's all in the system.",
    author: "Carlos M.",
    trade: "HVAC Contractor, Germantown",
  },
]

const LandingPage: React.FC = () => {
  const context = useContext(AuthContext);
  const user = context?.user;
  const navigate = useNavigate();
  const [activeFeature, setActiveFeature] = useState<FeatureKey>("electricians")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    context?.logout();
    navigate('/login');
  };

  const handleGetStarted = () => {
    navigate('/signup');
  }

  const handleLogin = () => {
    navigate('/login');
  }

  const handleViewPricing = () => {
    // Scroll to pricing section or open pricing modal
    const pricingSection = document.getElementById("pricing-section")
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-50 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4 sm:py-6">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Wrench className="text-white" size={16} />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-white">Memphis Blue</h1>
                <p className="text-xs text-blue-200 hidden sm:block">Bluff City Trade Operations</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <>
                  <Link
                    to={user.role === 'admin' || (user.role === 'solo' && user.business_type === 'solo_operator') ? '/dashboard' : '/mobile-dashboard'}
                    className="flex items-center space-x-2 text-white hover:text-blue-200 transition-colors"
                  >
                    <span className="font-medium">Dashboard</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 text-white hover:text-blue-200 transition-colors"
                  >
                    <span className="font-medium">Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleLogin}
                    className="flex items-center space-x-2 text-white hover:text-blue-200 transition-colors"
                  >
                    <LogIn size={18} />
                    <span className="font-medium">Login</span>
                  </button>
                  <button
                    onClick={handleGetStarted}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-white p-2">
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden bg-slate-900 bg-opacity-95 backdrop-blur-sm rounded-lg mt-2 p-4">
              <div className="flex flex-col space-y-4">
                {user ? (
                  <>
                    <Link
                      to={user.role === 'admin' || user.role === 'solo' || user.business_type === 'solo_operator' ? '/dashboard' : '/mobile-dashboard'}
                      className="flex items-center space-x-2 text-white hover:text-blue-200 transition-colors py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span className="font-medium">Dashboard</span>
                    </Link>
                    <button
                      onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                      className="flex items-center space-x-2 text-white hover:text-blue-200 transition-colors py-2"
                    >
                      <span className="font-medium">Logout</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => { handleLogin(); setMobileMenuOpen(false); }}
                      className="flex items-center space-x-2 text-white hover:text-blue-200 transition-colors py-2"
                    >
                      <LogIn size={18} />
                      <span className="font-medium">Login</span>
                    </button>
                    <button
                      onClick={() => { handleGetStarted(); setMobileMenuOpen(false); }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors text-center"
                    >
                      Get Started
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 sm:mb-6">
                Built for the Hands That Built the <span className="text-blue-400">Bluff City</span>
              </h1>
              <p className="text-lg sm:text-xl lg:text-2xl text-slate-300 mb-6 sm:mb-8 leading-relaxed">
                Memphis Blue is the all-in-one software and job lead system for electricians, plumbers, HVAC techs, GCs,
                and locksmiths serving the 901.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-4 sm:mb-6 items-center lg:items-start">
                <button
                  onClick={handleGetStarted}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-base sm:text-lg font-semibold flex items-center justify-center space-x-2 transition-colors"
                >
                  <span>Start Free Today</span>
                  <ArrowRight size={20} />
                </button>
                <div className="text-center sm:text-left">
                  <p className="text-blue-300 font-medium text-sm sm:text-base">3 months free • No setup fees</p>
                </div>
              </div>
            </div>
            <div className="relative mt-8 lg:mt-0">
              <div className="bg-slate-800 rounded-lg p-4 sm:p-6 shadow-2xl border border-slate-700 max-w-md mx-auto lg:max-w-none">
                <div className="flex items-center space-x-2 sm:space-x-3 mb-4">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full"></div>
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
                  <span className="text-slate-400 text-xs sm:text-sm ml-2 sm:ml-4">memphisblue.com</span>
                </div>
                <div className="space-y-3">
                  <div className="bg-blue-600 text-white p-2 sm:p-3 rounded">
                    <div className="flex items-center space-x-2">
                      <Calendar size={14} className="sm:w-4 sm:h-4" />
                      <span className="text-xs sm:text-sm">Today's 901 Schedule</span>
                    </div>
                  </div>
                  <div className="bg-slate-700 p-2 sm:p-3 rounded">
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm text-slate-300">HVAC Repair - Beale St</span>
                      <span className="text-green-400 text-xs sm:text-sm">$450</span>
                    </div>
                  </div>
                  <div className="bg-slate-700 p-2 sm:p-3 rounded">
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm text-slate-300">Electrical - Cooper-Young</span>
                      <span className="text-green-400 text-xs sm:text-sm">$320</span>
                    </div>
                  </div>
                  <div className="bg-green-600 text-white p-2 rounded text-center text-xs sm:text-sm">
                    3 New Memphis Leads
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-12 sm:py-16 lg:py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-4 sm:mb-6">
            Memphis runs on trades.
            <br />
            <span className="text-blue-600">We're making sure the trades run on something reliable.</span>
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-slate-600 leading-relaxed">
            We're here to help the folks who wire our homes, unclog our pipes, cool our kitchens, and repair what
            breaks. Memphis Blue gives you scheduling, quoting, invoicing, messaging, and jobs — in one simple place. No
            bloat. Just tools that work for the 901.
          </p>
        </div>
      </section>

      {/* Promo Plan Section */}
      <section id="pricing-section" className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl sm:rounded-2xl p-6 sm:p-8 lg:p-12 text-white text-center shadow-2xl">
            <div className="inline-flex items-center bg-yellow-500 text-black px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-bold mb-4 sm:mb-6">
              🔥 MEMPHIS LAUNCH SPECIAL
            </div>
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">3 MONTHS FREE</h3>
            <p className="text-lg sm:text-xl mb-4 sm:mb-6 text-blue-100">
              No-cost access to the full platform. We even throw in your Memphis leads.
            </p>
            <div className="bg-white bg-opacity-10 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
              <h4 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">AFTER THAT: $199/mo</h4>
              <p className="text-base sm:text-lg text-blue-100 mb-3 sm:mb-4">
                Includes the software + 20 free verified Memphis leads every month.
              </p>
              <p className="text-sm sm:text-base text-blue-200">Extra leads just $9 each — no commissions, no games.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <button
                onClick={handleViewPricing}
                className="w-full sm:w-auto bg-white text-blue-600 px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-base sm:text-lg font-semibold hover:bg-slate-100 transition-colors"
              >
                See Full Pricing
              </button>
              <button
                onClick={handleGetStarted}
                className="w-full sm:w-auto bg-yellow-500 text-black px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-base sm:text-lg font-semibold hover:bg-yellow-400 transition-colors flex items-center justify-center space-x-2"
              >
                <span>Start Free Now</span>
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* What You Get - Feature Grid */}
      <section className="py-12 sm:py-16 lg:py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-3 sm:mb-4">
              Built for Your Memphis Trade
            </h2>
            <p className="text-base sm:text-lg text-slate-600">
              Every tool you need, organized the way you work in the 901
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4 mb-6 sm:mb-8">
            {Object.entries(features).map(([key, feature]) => (
              <button
                key={key}
                onClick={() => setActiveFeature(key as FeatureKey)}
                className={`p-3 sm:p-4 rounded-lg border-2 transition-all ${activeFeature === key
                  ? "border-blue-600 bg-blue-50"
                  : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="mb-2">
                    {React.cloneElement(feature.icon, { size: window.innerWidth < 640 ? 20 : 24 })}
                  </div>
                  <span className="font-medium text-slate-900 text-xs sm:text-sm lg:text-base leading-tight">
                    {feature.title}
                  </span>
                </div>
              </button>
            ))}
          </div>

          <div className="bg-white rounded-xl p-4 sm:p-6 lg:p-8 shadow-lg border border-slate-200">
            <div className="flex items-center space-x-3 mb-4 sm:mb-6">
              {features[activeFeature].icon}
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900">{features[activeFeature].title}</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {features[activeFeature].items.map((item, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                  <CheckCircle className="text-green-500 flex-shrink-0" size={18} />
                  <span className="text-slate-700 font-medium text-sm sm:text-base">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-3 sm:mb-4">
              How It Works in the 901
            </h2>
            <p className="text-base sm:text-lg text-slate-600">Get up and running in minutes, not weeks</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <span className="text-white text-xl sm:text-2xl font-bold">1</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2 sm:mb-3">
                Create your account in minutes
              </h3>
              <p className="text-sm sm:text-base text-slate-600">
                Quick setup with your Memphis trade info. No complicated onboarding or training needed.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <span className="text-white text-xl sm:text-2xl font-bold">2</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2 sm:mb-3">
                Start managing jobs + getting Memphis leads
              </h3>
              <p className="text-sm sm:text-base text-slate-600">
                Schedule work, send quotes, and receive qualified leads from folks across the Bluff City.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <span className="text-white text-xl sm:text-2xl font-bold">3</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2 sm:mb-3">
                Upgrade only if you love it (you will)
              </h3>
              <p className="text-sm sm:text-base text-slate-600">
                Three months free to try everything. No contracts, no hidden fees, no surprises.
              </p>
            </div>
          </div>

          <div className="text-center mt-8 sm:mt-12">
            <button
              onClick={handleGetStarted}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-base sm:text-lg font-semibold flex items-center justify-center space-x-2 mx-auto transition-colors"
            >
              <span>Start Free Today</span>
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 sm:py-16 lg:py-20 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">
              Memphis Trades Trust Memphis Blue
            </h2>
            <p className="text-base sm:text-lg text-slate-300">Real feedback from real 901 tradespeople</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-slate-800 rounded-lg p-4 sm:p-6 border border-slate-700">
                <div className="flex items-center space-x-1 mb-3 sm:mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="text-yellow-500 fill-current" size={14} />
                  ))}
                </div>
                <blockquote className="text-slate-200 mb-3 sm:mb-4 italic text-sm sm:text-base">
                  "{testimonial.quote}"
                </blockquote>
                <div>
                  <div className="font-semibold text-white text-sm sm:text-base">{testimonial.author}</div>
                  <div className="text-slate-400 text-xs sm:text-sm">{testimonial.trade}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Summary Banner */}
      <section className="py-8 sm:py-12 bg-gradient-to-r from-yellow-500 to-orange-500 text-black">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-3 sm:mb-4">
              <span className="text-xl sm:text-2xl">💥</span>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold">First 3 Months Free</h3>
            </div>
            <p className="text-base sm:text-lg lg:text-xl mb-4 sm:mb-6">
              Then $199/month — Includes 20 Memphis leads, every month.
              <br className="hidden sm:block" />
              $9/lead after that. No commissions. No shady stuff.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <button
                onClick={handleViewPricing}
                className="w-full sm:w-auto bg-black text-white px-6 sm:px-8 py-3 rounded-lg font-semibold hover:bg-slate-800 transition-colors"
              >
                See All Plans
              </button>
              <button
                onClick={handleGetStarted}
                className="w-full sm:w-auto bg-white text-black px-6 sm:px-8 py-3 rounded-lg font-semibold hover:bg-slate-100 transition-colors flex items-center justify-center space-x-2"
              >
                <span>Start Now</span>
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky Footer CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-blue-600 text-white p-3 sm:p-4 shadow-lg z-50 lg:hidden">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm sm:text-base truncate">Ready to get started?</div>
            <div className="text-xs sm:text-sm text-blue-200 truncate">3 months free + 20 Memphis leads/month</div>
          </div>
          <button
            onClick={handleGetStarted}
            className="ml-3 bg-white text-blue-600 px-4 sm:px-6 py-2 rounded-lg font-semibold hover:bg-slate-100 transition-colors text-sm sm:text-base flex-shrink-0"
          >
            Start Free
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-8 sm:py-12 pb-20 lg:pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div className="sm:col-span-2 md:col-span-2">
              <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Wrench className="text-white" size={16} />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-blue-400">Memphis Blue</h3>
                  <p className="text-xs sm:text-sm text-slate-400">Bluff City Trade Operations</p>
                </div>
              </div>
              <p className="text-slate-300 mb-3 sm:mb-4 text-sm sm:text-base">
                Built for the hands that built the Bluff City. Reliable software for reliable folks.
              </p>
              <div className="flex items-center space-x-2 text-slate-400 text-sm sm:text-base">
                <MapPin size={14} className="flex-shrink-0" />
                <span>Proudly serving Memphis, TN • 901 Strong</span>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Product</h4>
              <ul className="space-y-2 text-slate-300 text-sm sm:text-base">
                <li>
                  <button onClick={handleViewPricing} className="hover:text-white transition-colors">
                    Features
                  </button>
                </li>
                <li>
                  <button onClick={handleViewPricing} className="hover:text-white transition-colors">
                    Pricing
                  </button>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Memphis Leads
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Support
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Company</h4>
              <ul className="space-y-2 text-slate-300 text-sm sm:text-base">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Terms
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-slate-400 text-xs sm:text-sm">
            <p>&copy; 2024 Memphis Blue. Built with pride in the Bluff City. 901 Strong 💪</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
