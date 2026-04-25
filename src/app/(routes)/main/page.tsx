"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { 
  ArrowRight, 
  FileText, 
  Shield, 
  Users, 
  TrendingUp, 
  Star, 
  CheckCircle, 
  Building, 
  Clock,
  Zap,
  DollarSign,
  Globe,
  LogOut,
  User,
} from "lucide-react";
import { 
  removeToken, 
  UserPayload,
  getCurrentUser,
  isAuthenticated as checkIsAuthenticated,
  canAccessAdminRoutes,
} from "@/helper/helper";
import PricingSection from "./components/PricingSection";

const MainPage: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState<UserPayload | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = checkIsAuthenticated();
      setIsAuthenticated(authenticated);
      
      if (authenticated) {
        const currentUser = getCurrentUser();
        setUserInfo(currentUser);
      }
    };

    checkAuth();
  }, []);



  const handleSignOut = () => {
    removeToken();
    setIsAuthenticated(false);
    setUserInfo(null);
    router.push('/main');
  };

  const features = [
    {
      icon: FileText,
      title: "Digital Invoicing",
      description: "Create and manage invoices digitally with ease and precision",
      color: "from-primary-600 to-primary-700"
    },
    {
      icon: Shield,
      title: "Secure & Compliant",
      description: "Full compliance with tax regulations and security standards",
      color: "from-primary-500 to-primary-600"
    },
    {
      icon: Users,
      title: "Multi-user Support",
      description: "Collaborate with your team and clients seamlessly",
      color: "from-primary-400 to-primary-500"
    },
    {
      icon: TrendingUp,
      title: "Analytics & Reports",
      description: "Track your business performance with detailed insights",
      color: "from-primary-600 to-primary-800"
    }
  ];

  const benefits = [
    { icon: Clock, text: "Save 80% time on invoice creation" },
    { icon: CheckCircle, text: "Automatic tax compliance" },
    { icon: TrendingUp, text: "Real-time payment tracking" },
    { icon: Globe, text: "Cloud-based storage" },
    { icon: Users, text: "24/7 customer support" },
    { icon: DollarSign, text: "Multi-currency support" }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      company: "TechCorp Solutions",
      rating: 5,
      text: "E-Invoice Pro transformed our billing process. We've cut invoice processing time by 75%!",
      avatar: "SJ"
    },
    {
      name: "Michael Chen",
      company: "Green Energy Ltd",
      rating: 5,
      text: "The compliance features are outstanding. Never worried about tax regulations again.",
      avatar: "MC"
    },
    {
      name: "Emma Rodriguez",
      company: "Creative Studio",
      rating: 5,
      text: "Simple, intuitive, and powerful. Perfect for growing businesses like ours.",
      avatar: "ER"
    }
  ];

  const stats = [
    { number: "50K+", label: "Active Users" },
    { number: "1M+", label: "Invoices Processed" },
    { number: "99.9%", label: "Uptime" },
    { number: "24/7", label: "Support" }
  ];

  return (
    <div className="min-h-screen bg-brand-gradient-soft">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="relative h-12 w-auto" style={{ width: '200px' }}>
                <Image
                  src="/Logo/header-logo.svg"
                  alt="E-Invoice Pro"
                  fill
                  className="object-contain object-left"
                  priority
                />
              </div>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">
                Features
              </a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">
                Pricing
              </a>
              <a href="#benefits" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">
                Benefits
              </a>
              <a href="#testimonials" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">
                Reviews
              </a>
            </nav>
            
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <Link
                    href={canAccessAdminRoutes() ? "/admin" : "/dashboard"}
                    className="flex items-center space-x-2 text-gray-700 hover:text-primary transition-colors cursor-pointer"
                  >
                    <User className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {userInfo?.firstName ? `Welcome, ${userInfo.firstName}!` : 'Welcome back!'}
                    </span>
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-2 text-gray-700 hover:text-red-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/authentication"
                    className="text-gray-700 hover:text-primary px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/authentication?mode=signup"
                    className="bg-gradient-to-r from-primary via-blue-600 to-indigo-700 hover:from-indigo-700 hover:via-blue-600 hover:to-primary text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="pt-20 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="mb-8">
              <span className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary-200 via-blue-200 to-indigo-200 text-primary-800 text-sm font-medium rounded-full shadow-md border border-primary-300 animate-pulse">
                <Zap className="w-4 h-4 mr-2 text-yellow-500" />
                New: AI-Powered Invoice Generation
              </span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Modern E-Invoicing
              <span className="text-brand-gradient block mt-2 animate-gradient">Made Simple</span>
            </h1>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Streamline your invoicing process with our comprehensive digital solution. 
              Create, manage, and track invoices while staying compliant with tax regulations.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              {isAuthenticated ? (
                <>
                  <Link
                    href={canAccessAdminRoutes() ? "/admin" : "/dashboard"}
                    className="bg-gradient-to-r from-primary via-blue-600 to-indigo-700 hover:from-indigo-700 hover:via-blue-600 hover:to-primary text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-500 flex items-center gap-2 shadow-xl hover:shadow-2xl hover:scale-105"
                  >
                    {canAccessAdminRoutes() ? "Go to Dashboard" : "View Profile"}
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <a
                    href="#pricing"
                    className="border-2 border-primary hover:border-primary-700 text-gray-700 hover:text-primary px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
                  >
                    View Plans
                  </a>
                </>
              ) : (
                <>
                  <Link
                    href="/authentication?mode=signup"
                    className="bg-gradient-to-r from-primary via-blue-600 to-indigo-700 hover:from-indigo-700 hover:via-blue-600 hover:to-primary text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-500 flex items-center gap-2 shadow-xl hover:shadow-2xl hover:scale-105"
                  >
                    Start Free Trial
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <a
                    href="#pricing"
                    className="border-2 border-primary hover:border-primary-700 text-gray-700 hover:text-primary px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
                  >
                    View Plans
                  </a>
                </>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                  className="text-center"
                >
                  <div className="text-3xl font-bold text-primary">{stat.number}</div>
                  <div className="text-gray-600 text-sm">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Features Section */}
        <div id="features" className="py-20">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features designed to make your invoicing process efficient and compliant
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                className="bg-gradient-to-br from-white via-primary-50 to-blue-100 rounded-2xl p-6 shadow-lg border border-primary-200 hover:shadow-2xl hover:border-primary-400 transition-all duration-300 group hover:-translate-y-2 hover:scale-105"
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg group-hover:shadow-xl`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Pricing Section */}
        <PricingSection isAuthenticated={isAuthenticated} />

        {/* Benefits Section */}
        <div id="benefits" className="py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Why Choose E-Invoice Pro?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Join thousands of businesses that have transformed their invoicing process with our platform.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 * index }}
                    className="flex items-center space-x-3"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-100 via-blue-100 to-primary-200 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                      <benefit.icon className="w-4 h-4 text-primary-700" />
                    </div>
                    <span className="text-gray-700 font-medium">{benefit.text}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-brand-gradient-deep-br rounded-2xl p-8 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-white/10 to-white/5"></div>
                <div className="absolute inset-0 animate-pulse bg-gradient-to-bl from-transparent via-white/5 to-transparent"></div>
                <div className="relative z-10">
                <Building className="w-12 h-12 mb-4" />
                <h3 className="text-2xl font-bold mb-4">Ready to Transform Your Business?</h3>
                <p className="text-primary-100 mb-6">
                  Start your free trial today and see the difference our platform can make.
                </p>
                <Link
                  href={isAuthenticated ? (canAccessAdminRoutes() ? "/admin" : "/dashboard") : "/authentication?mode=signup"}
                  className="bg-gradient-to-r from-white via-blue-50 to-indigo-100 hover:from-yellow-100 hover:via-white hover:to-blue-100 text-primary px-6 py-3 rounded-lg font-semibold transition-all duration-300 inline-flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  {isAuthenticated ? (canAccessAdminRoutes() ? "Go to Dashboard" : "View Profile") : "Get Started Now"}
                  <ArrowRight className="w-4 h-4" />
                </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Testimonials Section */}
        <div id="testimonials" className="py-20">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Customers Say
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Don&apos;t just take our word for it - hear from businesses that have transformed their invoicing
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                className="bg-gradient-to-br from-white via-blue-50 to-primary-100 rounded-2xl p-6 shadow-md border border-primary-200 hover:shadow-xl hover:border-primary-300 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">{testimonial.text}</p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-200 via-blue-200 to-indigo-300 rounded-full flex items-center justify-center text-primary-800 font-semibold mr-3 shadow-md">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-gray-600 text-sm">{testimonial.company}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="bg-brand-gradient-deep rounded-2xl p-8 md:p-12 text-center text-white mt-16 relative overflow-hidden shadow-2xl"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-white/10 to-white/5"></div>
          <div className="absolute inset-0 animate-pulse bg-gradient-to-tl from-transparent via-white/10 to-transparent"></div>
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of businesses already using our platform
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <>
                  <Link
                    href={canAccessAdminRoutes() ? "/admin" : "/dashboard"}
                    className="bg-gradient-to-r from-white via-yellow-100 to-blue-100 hover:from-yellow-200 hover:via-white hover:to-indigo-100 text-primary px-8 py-3 rounded-lg text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105"
                  >
                    {canAccessAdminRoutes() ? "Go to Dashboard" : "View Profile"}
                  </Link>
                  <Link
                    href={canAccessAdminRoutes() ? "/admin/profile" : "/dashboard"}
                    className="border-2 border-white hover:bg-white/10 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors"
                  >
                    View Profile
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/authentication?mode=signup"
                    className="bg-gradient-to-r from-white via-yellow-100 to-blue-100 hover:from-yellow-200 hover:via-white hover:to-indigo-100 text-primary px-8 py-3 rounded-lg text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105"
                  >
                    Start Free Trial
                  </Link>
                  <Link
                    href="/authentication"
                    className="border-2 border-white hover:bg-white/10 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
            <p className="text-sm opacity-75 mt-4">
              No credit card required • 30-day free trial • Cancel anytime
            </p>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="mb-4 inline-block">
                <div className="relative h-14 w-auto" style={{ width: '220px' }}>
                  <Image
                    src="/Logo/footer-logo.svg"
                    alt="E-Invoice Pro"
                    fill
                    className="object-contain object-left"
                  />
                </div>
              </div>
              <p className="text-gray-400 max-w-md">
                Your trusted partner for digital invoicing solutions. Streamline your business operations with our comprehensive platform.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#benefits" className="hover:text-white transition-colors">Benefits</a></li>
                <li><a href="#testimonials" className="hover:text-white transition-colors">Reviews</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">
              &copy; 2025 E-Invoice Pro. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainPage;