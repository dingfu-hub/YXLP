'use client'

import { Shield, Truck, Users, Award, Clock, Globe2 } from 'lucide-react'

export default function FeaturesSection() {
  const features = [
    {
      icon: Shield,
      title: "Quality Guaranteed",
      description: "ISO 9001 certified manufacturing with rigorous quality control at every step. 100% satisfaction guarantee on all products.",
      color: "bg-blue-500"
    },
    {
      icon: Truck,
      title: "Global Shipping",
      description: "Fast and reliable shipping to 50+ countries. Real-time tracking and insurance coverage on all international orders.",
      color: "bg-green-500"
    },
    {
      icon: Users,
      title: "B2B Solutions",
      description: "Dedicated account management, bulk pricing, and custom solutions for distributors and retailers worldwide.",
      color: "bg-purple-500"
    },
    {
      icon: Award,
      title: "Industry Leader",
      description: "15+ years of experience in fashion export. Trusted by major brands and retailers across the globe.",
      color: "bg-orange-500"
    },
    {
      icon: Clock,
      title: "Fast Turnaround",
      description: "Quick order processing and production. Most orders shipped within 3-5 business days with express options available.",
      color: "bg-red-500"
    },
    {
      icon: Globe2,
      title: "Multi-Language Support",
      description: "Platform available in 12 languages with local customer support. Currency conversion and regional pricing.",
      color: "bg-indigo-500"
    }
  ]

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-4">
            Why Choose YXLP Platform?
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            We provide comprehensive solutions for fashion businesses worldwide, from small retailers to large distributors. 
            Our platform is designed to streamline your operations and maximize your success.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-8 rounded-2xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Icon */}
              <div className={`inline-flex items-center justify-center w-12 h-12 ${feature.color} rounded-lg mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>

              {/* Hover Effect */}
              <div className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-12 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center px-6 py-3 bg-gray-100 rounded-full text-gray-600 text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-3 animate-pulse"></span>
            Trusted by 10,000+ businesses worldwide
          </div>
          <div className="space-x-4">
            <button className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
              Start Your Business
            </button>
            <button className="px-8 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
