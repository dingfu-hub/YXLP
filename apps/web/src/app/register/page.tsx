import { Metadata } from 'next'
import RegisterForm from '@/components/auth/RegisterForm'

export const metadata: Metadata = {
  title: 'Create Account - YXLP Platform',
  description: 'Join YXLP platform and start your fashion business journey. Access premium clothing exports and wholesale opportunities.',
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <RegisterForm />
      </div>
      
      {/* Benefits Section */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-4xl">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="text-center mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Why Join YXLP Platform?
            </h3>
            <p className="text-gray-600">
              Trusted by 10,000+ businesses worldwide
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🌍</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Global Reach</h4>
              <p className="text-sm text-gray-600">
                Ship to 50+ countries with reliable logistics partners and real-time tracking.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💎</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Premium Quality</h4>
              <p className="text-sm text-gray-600">
                ISO 9001 certified manufacturing with rigorous quality control at every step.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🤝</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">B2B Solutions</h4>
              <p className="text-sm text-gray-600">
                Dedicated account management, bulk pricing, and custom solutions for your business.
              </p>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">10,000+</div>
                <div className="text-sm text-gray-600">Global Customers</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">50+</div>
                <div className="text-sm text-gray-600">Countries Served</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">99.8%</div>
                <div className="text-sm text-gray-600">Satisfaction Rate</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">4.9/5</div>
                <div className="text-sm text-gray-600">Average Rating</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
