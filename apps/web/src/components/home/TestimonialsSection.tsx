'use client'

import { useState, useEffect } from 'react'
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react'

export default function TestimonialsSection() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0)

  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      title: "CEO, Fashion Forward Inc.",
      company: "Fashion Forward Inc.",
      location: "New York, USA",
      avatar: "👩‍💼",
      rating: 5,
      text: "YXLP has transformed our supply chain completely. The quality is exceptional, delivery is always on time, and their customer service is outstanding. We've increased our profit margins by 35% since partnering with them.",
      orderValue: "$250,000+",
      partnership: "3 years"
    },
    {
      id: 2,
      name: "Marcus Weber",
      title: "Purchasing Director",
      company: "European Style GmbH",
      location: "Berlin, Germany",
      avatar: "👨‍💼",
      rating: 5,
      text: "As a distributor serving 15 European countries, we need reliability and quality. YXLP delivers both consistently. Their B2B platform makes ordering seamless, and the multi-language support is excellent.",
      orderValue: "$500,000+",
      partnership: "5 years"
    },
    {
      id: 3,
      name: "Elena Rodriguez",
      title: "Boutique Owner",
      company: "Elegancia Boutique",
      location: "Madrid, Spain",
      avatar: "👩‍🦱",
      rating: 5,
      text: "The variety and quality of products is amazing. My customers love the designs, and the wholesale prices allow me to maintain healthy margins. The platform is so easy to use, even for small orders.",
      orderValue: "$50,000+",
      partnership: "2 years"
    },
    {
      id: 4,
      name: "James Chen",
      title: "Regional Manager",
      company: "Asia Pacific Retail",
      location: "Singapore",
      avatar: "👨‍💻",
      rating: 5,
      text: "Working with YXLP has been a game-changer for our business. Their understanding of Asian markets and quick adaptation to trends keeps us ahead of competition. Highly recommended!",
      orderValue: "$750,000+",
      partnership: "4 years"
    }
  ]

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  useEffect(() => {
    const timer = setInterval(nextTestimonial, 6000)
    return () => clearInterval(timer)
  }, [])

  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-4">
            What Our Customers Say
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join thousands of satisfied customers worldwide who trust YXLP for their fashion business needs.
          </p>
        </div>

        {/* Main Testimonial */}
        <div className="relative max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 relative overflow-hidden">
            {/* Quote Icon */}
            <div className="absolute top-8 right-8 opacity-10">
              <Quote className="w-24 h-24 text-blue-600" />
            </div>

            {/* Rating */}
            <div className="flex items-center justify-center mb-6">
              {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
              ))}
            </div>

            {/* Testimonial Text */}
            <blockquote className="text-xl md:text-2xl text-gray-700 text-center leading-relaxed mb-8 font-medium">
              "{testimonials[currentTestimonial].text}"
            </blockquote>

            {/* Customer Info */}
            <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-8">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-2xl">
                  {testimonials[currentTestimonial].avatar}
                </div>
                <div className="text-center md:text-left">
                  <div className="font-semibold text-gray-900 text-lg">
                    {testimonials[currentTestimonial].name}
                  </div>
                  <div className="text-gray-600">
                    {testimonials[currentTestimonial].title}
                  </div>
                  <div className="text-sm text-gray-500">
                    {testimonials[currentTestimonial].company}
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="flex space-x-8 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {testimonials[currentTestimonial].orderValue}
                  </div>
                  <div className="text-sm text-gray-600">Total Orders</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {testimonials[currentTestimonial].partnership}
                  </div>
                  <div className="text-sm text-gray-600">Partnership</div>
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-center space-x-4 mt-8">
              <button
                onClick={prevTestimonial}
                className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
              >
                <ChevronLeft className="w-6 h-6 text-gray-600" />
              </button>
              <button
                onClick={nextTestimonial}
                className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
              >
                <ChevronRight className="w-6 h-6 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Testimonial Indicators */}
          <div className="flex justify-center space-x-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTestimonial(index)}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  index === currentTestimonial ? 'bg-blue-600 w-8' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Customer Logos */}
        <div className="mt-16">
          <div className="text-center mb-8">
            <p className="text-gray-600 font-medium">Trusted by leading brands worldwide</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center opacity-60">
            {['🏢', '🏪', '🏬', '🏭', '🏢', '🏪'].map((icon, index) => (
              <div
                key={index}
                className="flex items-center justify-center h-16 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <span className="text-3xl">{icon}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="bg-white rounded-2xl p-8 shadow-lg max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Join Our Success Stories?
            </h3>
            <p className="text-gray-600 mb-6">
              Start your journey with YXLP today and experience the difference quality makes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                Start Free Trial
              </button>
              <button className="px-8 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors">
                Schedule Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
