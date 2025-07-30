import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/common/Header';
import Image from '../components/common/Image';

interface DistributorBenefit {
  icon: string;
  title: string;
  description: string;
}

interface PricingTier {
  name: string;
  minOrder: string;
  discount: string;
  features: string[];
  highlighted?: boolean;
}

const DistributorsPage: React.FC = () => {
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    country: '',
    businessType: '',
    annualVolume: '',
    message: '',
  });

  const benefits: DistributorBenefit[] = [
    {
      icon: '💰',
      title: 'Competitive Wholesale Pricing',
      description: 'Get exclusive wholesale rates with volume discounts up to 40% off retail prices.',
    },
    {
      icon: '🚚',
      title: 'Priority Shipping',
      description: 'Fast-track shipping with dedicated logistics support and tracking.',
    },
    {
      icon: '🎯',
      title: 'Dedicated Account Manager',
      description: 'Personal support from experienced account managers who understand your business.',
    },
    {
      icon: '📦',
      title: 'Custom Packaging',
      description: 'Private label options and custom packaging solutions for your brand.',
    },
    {
      icon: '🔄',
      title: 'Flexible Returns',
      description: 'Generous return policy and exchange options for unsold inventory.',
    },
    {
      icon: '📊',
      title: 'Market Intelligence',
      description: 'Access to trend reports, market analysis, and sales performance data.',
    },
  ];

  const pricingTiers: PricingTier[] = [
    {
      name: 'Starter',
      minOrder: '$5,000',
      discount: '15-20%',
      features: [
        'Wholesale pricing access',
        'Standard shipping rates',
        'Email support',
        'Basic product catalog',
        'Monthly trend reports',
      ],
    },
    {
      name: 'Professional',
      minOrder: '$15,000',
      discount: '25-30%',
      features: [
        'Enhanced wholesale pricing',
        'Priority shipping',
        'Dedicated account manager',
        'Custom product selection',
        'Bi-weekly trend reports',
        'Marketing materials support',
      ],
      highlighted: true,
    },
    {
      name: 'Enterprise',
      minOrder: '$50,000',
      discount: '35-40%',
      features: [
        'Maximum wholesale discount',
        'Express shipping included',
        'Senior account manager',
        'Private label options',
        'Weekly trend reports',
        'Custom packaging solutions',
        'Exclusive product access',
        'Trade show support',
      ],
    },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Distributor application:', formData);
    // Handle form submission
    alert('Thank you for your interest! We will contact you within 24 hours.');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Partner with YXLP
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              Join our global network of distributors and grow your business with premium clothing exports
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#application"
                className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Apply Now
              </a>
              <a
                href="#benefits"
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                Learn More
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">500+</div>
              <div className="text-gray-600">Active Distributors</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">60+</div>
              <div className="text-gray-600">Countries Served</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">$50M+</div>
              <div className="text-gray-600">Annual Revenue</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">98%</div>
              <div className="text-gray-600">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <section id="benefits" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose YXLP as Your Partner?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We provide comprehensive support to help our distributors succeed in their markets
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                <div className="text-4xl mb-4">{benefit.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {benefit.title}
                </h3>
                <p className="text-gray-600">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Tiers */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Distributor Pricing Tiers
            </h2>
            <p className="text-xl text-gray-600">
              Choose the tier that best fits your business volume and needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingTiers.map((tier, index) => (
              <div
                key={index}
                className={`bg-white rounded-lg shadow-lg overflow-hidden ${
                  tier.highlighted ? 'ring-4 ring-blue-500 transform scale-105' : ''
                }`}
              >
                {tier.highlighted && (
                  <div className="bg-blue-500 text-white text-center py-2 font-semibold">
                    Most Popular
                  </div>
                )}
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{tier.name}</h3>
                  <div className="mb-6">
                    <div className="text-sm text-gray-600 mb-1">Minimum Order</div>
                    <div className="text-3xl font-bold text-blue-600">{tier.minOrder}</div>
                    <div className="text-sm text-gray-600 mt-1">Discount: {tier.discount}</div>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {tier.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <a
                    href="#application"
                    className={`w-full block text-center py-3 px-6 rounded-lg font-semibold transition-colors ${
                      tier.highlighted
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    Get Started
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Success Stories
            </h2>
            <p className="text-xl text-gray-600">
              Hear from our successful distributor partners
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <div className="flex items-center mb-6">
                <Image
                  src="/api/placeholder/60/60?text=JM"
                  alt="John Martinez"
                  className="w-12 h-12 rounded-full mr-4"
                  fallbackText="JM"
                  width={48}
                  height={48}
                />
                <div>
                  <div className="font-semibold text-gray-900">John Martinez</div>
                  <div className="text-sm text-gray-600">Fashion Retail Group, Spain</div>
                </div>
              </div>
              <blockquote className="text-gray-700 mb-4">
                "Partnering with YXLP has transformed our business. Their quality products and reliable service have helped us expand to 15 stores across Spain. The wholesale pricing allows us to maintain healthy margins while offering competitive prices to our customers."
              </blockquote>
              <div className="text-sm text-gray-500">
                <strong>Results:</strong> 300% revenue growth in 18 months
              </div>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-lg">
              <div className="flex items-center mb-6">
                <Image
                  src="/api/placeholder/60/60?text=LW"
                  alt="Lisa Wang"
                  className="w-12 h-12 rounded-full mr-4"
                  fallbackText="LW"
                  width={48}
                  height={48}
                />
                <div>
                  <div className="font-semibold text-gray-900">Lisa Wang</div>
                  <div className="text-sm text-gray-600">Urban Fashion Co., Australia</div>
                </div>
              </div>
              <blockquote className="text-gray-700 mb-4">
                "The dedicated account manager and custom packaging options have been game-changers for our brand. YXLP doesn't just supply products; they're true partners in our success. The market intelligence reports help us stay ahead of trends."
              </blockquote>
              <div className="text-sm text-gray-500">
                <strong>Results:</strong> Launched private label, 250% profit increase
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section id="application" className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Apply to Become a Distributor
            </h2>
            <p className="text-xl text-gray-600">
              Fill out the form below and we'll get back to you within 24 hours
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Name *
                  </label>
                  <input
                    type="text"
                    name="contactName"
                    value={formData.contactName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country *
                  </label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Country</option>
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="UK">United Kingdom</option>
                    <option value="DE">Germany</option>
                    <option value="FR">France</option>
                    <option value="ES">Spain</option>
                    <option value="IT">Italy</option>
                    <option value="AU">Australia</option>
                    <option value="JP">Japan</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Type *
                  </label>
                  <select
                    name="businessType"
                    value={formData.businessType}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Business Type</option>
                    <option value="retailer">Retailer</option>
                    <option value="wholesaler">Wholesaler</option>
                    <option value="online">Online Store</option>
                    <option value="chain">Retail Chain</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expected Annual Volume *
                </label>
                <select
                  name="annualVolume"
                  value={formData.annualVolume}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Volume Range</option>
                  <option value="5k-15k">$5,000 - $15,000</option>
                  <option value="15k-50k">$15,000 - $50,000</option>
                  <option value="50k-100k">$50,000 - $100,000</option>
                  <option value="100k+">$100,000+</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Information
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Tell us about your business, target market, and any specific requirements..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center justify-between">
                <Link
                  to="/"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  ← Back to Home
                </Link>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DistributorsPage;
