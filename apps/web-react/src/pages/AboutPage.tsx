import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/common/Header';
import Image from '../components/common/Image';

const AboutPage: React.FC = () => {
  const milestones = [
    { year: '2020', title: 'Company Founded', description: 'YXLP was established in Guangzhou, China' },
    { year: '2021', title: 'First International Order', description: 'Expanded to serve customers in 10 countries' },
    { year: '2022', title: 'ISO Certification', description: 'Achieved ISO 9001 quality management certification' },
    { year: '2023', title: 'Global Expansion', description: 'Reached 50+ countries with 500+ distributors' },
    { year: '2024', title: 'Sustainability Initiative', description: 'Launched eco-friendly product lines' },
  ];

  const team = [
    {
      name: 'David Chen',
      position: 'CEO & Founder',
      image: '/api/placeholder/200/200?text=DC',
      bio: '15+ years in textile industry, former VP at major fashion conglomerate',
    },
    {
      name: 'Sarah Liu',
      position: 'Head of Operations',
      image: '/api/placeholder/200/200?text=SL',
      bio: 'Expert in supply chain management and quality control systems',
    },
    {
      name: 'Michael Zhang',
      position: 'International Sales Director',
      image: '/api/placeholder/200/200?text=MZ',
      bio: 'Specialized in global market expansion and distributor relations',
    },
    {
      name: 'Emma Wang',
      position: 'Design Director',
      image: '/api/placeholder/200/200?text=EW',
      bio: 'Fashion design graduate from Parsons, trend forecasting specialist',
    },
  ];

  const values = [
    {
      icon: '🎯',
      title: 'Quality First',
      description: 'We never compromise on quality. Every product undergoes rigorous testing and quality control.',
    },
    {
      icon: '🌍',
      title: 'Global Mindset',
      description: 'We understand diverse markets and adapt our products to meet local preferences and standards.',
    },
    {
      icon: '🤝',
      title: 'Partnership',
      description: 'We build long-term relationships with our clients, supporting their growth and success.',
    },
    {
      icon: '♻️',
      title: 'Sustainability',
      description: 'We are committed to sustainable practices and environmentally responsible manufacturing.',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              About YXLP
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              Your trusted partner in premium clothing exports since 2020
            </p>
            <Link
              to="/"
              className="text-blue-100 hover:text-white font-medium"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>

      {/* Mission & Vision */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-600 mb-8">
                To bridge the gap between premium Chinese manufacturing and global fashion markets, 
                providing high-quality clothing exports that meet international standards while 
                supporting sustainable business growth for our partners worldwide.
              </p>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Vision</h2>
              <p className="text-lg text-gray-600">
                To become the world's most trusted platform for clothing exports, known for 
                exceptional quality, innovative designs, and sustainable practices that benefit 
                both our partners and the environment.
              </p>
            </div>
            <div className="relative">
              <Image
                src="/api/placeholder/600/400?text=Factory"
                alt="YXLP Factory"
                className="w-full h-96 object-cover rounded-lg shadow-lg"
                fallbackText="Factory"
                width={600}
                height={384}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Company Stats */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              YXLP by the Numbers
            </h2>
            <p className="text-xl text-gray-600">
              Our growth reflects the trust our partners place in us
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">500+</div>
              <div className="text-gray-600">Global Partners</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">60+</div>
              <div className="text-gray-600">Countries Served</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">2M+</div>
              <div className="text-gray-600">Products Shipped</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">98%</div>
              <div className="text-gray-600">Customer Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* Company Timeline */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Our Journey
            </h2>
            <p className="text-xl text-gray-600">
              Key milestones in our company's growth
            </p>
          </div>

          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-blue-200"></div>
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div key={index} className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                  <div className={`w-1/2 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                      <div className="text-2xl font-bold text-blue-600 mb-2">{milestone.year}</div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{milestone.title}</h3>
                      <p className="text-gray-600">{milestone.description}</p>
                    </div>
                  </div>
                  <div className="relative z-10 flex items-center justify-center w-12 h-12 bg-blue-600 rounded-full border-4 border-white shadow-lg">
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </div>
                  <div className="w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Our Core Values
            </h2>
            <p className="text-xl text-gray-600">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-white p-8 rounded-lg shadow-lg text-center hover:shadow-xl transition-shadow">
                <div className="text-4xl mb-4">{value.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {value.title}
                </h3>
                <p className="text-gray-600">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership Team */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Leadership Team
            </h2>
            <p className="text-xl text-gray-600">
              Meet the experienced professionals leading YXLP
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <Image
                  src={member.image}
                  alt={member.name}
                  className="w-full h-64 object-cover"
                  fallbackText={member.name.split(' ').map(n => n.charAt(0)).join('')}
                  width={200}
                  height={256}
                />
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {member.name}
                  </h3>
                  <div className="text-blue-600 font-medium mb-4">
                    {member.position}
                  </div>
                  <p className="text-gray-600 text-sm">
                    {member.bio}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Certifications & Standards
            </h2>
            <p className="text-xl text-gray-600">
              We maintain the highest industry standards and certifications
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-lg text-center">
              <div className="text-4xl mb-4">🏆</div>
              <h3 className="font-semibold text-gray-900 mb-2">ISO 9001</h3>
              <p className="text-sm text-gray-600">Quality Management System</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-lg text-center">
              <div className="text-4xl mb-4">🌿</div>
              <h3 className="font-semibold text-gray-900 mb-2">OEKO-TEX</h3>
              <p className="text-sm text-gray-600">Textile Safety Standard</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-lg text-center">
              <div className="text-4xl mb-4">🤝</div>
              <h3 className="font-semibold text-gray-900 mb-2">BSCI</h3>
              <p className="text-sm text-gray-600">Social Compliance</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-lg text-center">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="font-semibold text-gray-900 mb-2">WRAP</h3>
              <p className="text-sm text-gray-600">Workplace Standards</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Partner with Us?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join hundreds of successful businesses who trust YXLP for their clothing export needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/distributors"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Become a Distributor
            </Link>
            <Link
              to="/contact"
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
