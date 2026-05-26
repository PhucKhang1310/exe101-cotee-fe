import { Link } from 'react-router';
import imgHeroHeaderImage from '../../imports/Group1/edd2e113f39d9ebb4369e972b767551b7af85794.png';
import imgImage from '../../imports/Group1/2b566c36d05a907327c0d36cfa12b303603c2c23.png';
import imgImage1 from '../../imports/Group1/854372afc0f292fd23f2cdd8eb1108f72ac54dff.png';
import imgImage2 from '../../imports/Group1/b5e7b01317ce2b1811adc522276d76e959198f02.png';

export default function Home() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#fff5eb] to-white overflow-hidden">
        <div className="max-w-[1280px] mx-auto px-8 py-24">
          <div className="grid grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-block px-4 py-2 bg-[#fff5eb] rounded-full border border-[#ffa62b]">
                <span className="text-sm font-semibold text-[#ff9429]">AI-Powered Design</span>
              </div>
              <h1 className="text-6xl font-bold text-[#0f172a] leading-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Create Amazing T-Shirt Designs with AI
              </h1>
              <p className="text-lg text-[#64748b] leading-relaxed">
                Transform your ideas into stunning custom apparel designs. Our AI-powered studio helps you create professional designs in minutes.
              </p>
              <div className="flex gap-4 pt-4">
                <Link
                  to="/browse"
                  className="px-8 py-4 bg-[#ff9429] text-white font-bold rounded-xl hover:bg-[#ff8c1a] transition-all shadow-lg hover:shadow-xl"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  Browse Designs
                </Link>
                <Link
                  to="/dashboard"
                  className="px-8 py-4 bg-white text-[#0f172a] font-bold rounded-xl border-2 border-[#e2e8f0] hover:border-[#ffa62b] transition-all"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  Start Creating
                </Link>
              </div>
              <div className="flex items-center gap-8 pt-8">
                <div>
                  <div className="text-3xl font-bold text-[#0f172a]">10K+</div>
                  <div className="text-sm text-[#64748b]">Designs Created</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-[#0f172a]">5K+</div>
                  <div className="text-sm text-[#64748b]">Happy Users</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-[#0f172a]">4.9★</div>
                  <div className="text-sm text-[#64748b]">User Rating</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-[#fff5eb] to-[#ffe5cc] rounded-3xl overflow-hidden shadow-2xl">
                <img src={imgHeroHeaderImage} alt="Hero" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-[#ffa62b] rounded-full opacity-20 blur-3xl" />
              <div className="absolute -top-6 -right-6 w-40 h-40 bg-[#ff9429] rounded-full opacity-10 blur-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="max-w-[1280px] mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#0f172a] mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Why Choose CoTee?
            </h2>
            <p className="text-lg text-[#64748b] max-w-2xl mx-auto">
              Everything you need to create, customize, and sell custom apparel designs
            </p>
          </div>

          <div className="grid grid-cols-3 gap-8">
            {[
              {
                icon: '🤖',
                title: 'AI-Powered Creation',
                description: 'Generate unique designs with advanced AI technology'
              },
              {
                icon: '🎨',
                title: 'Easy Customization',
                description: 'Customize colors, text, and layouts with simple tools'
              },
              {
                icon: '⚡',
                title: 'Instant Preview',
                description: 'See your designs on real mockups in real-time'
              },
              {
                icon: '💾',
                title: 'Cloud Storage',
                description: 'Save and access your designs from anywhere'
              },
              {
                icon: '📱',
                title: 'Mobile Friendly',
                description: 'Create and manage designs on any device'
              },
              {
                icon: '🚀',
                title: 'Quick Export',
                description: 'Download print-ready files instantly'
              }
            ].map((feature, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 border border-[#f1f5f9] hover:border-[#ffa62b] hover:shadow-lg transition-all">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-[#0f172a] mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {feature.title}
                </h3>
                <p className="text-[#64748b]">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Designs */}
      <section className="py-20 bg-white">
        <div className="max-w-[1280px] mx-auto px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl font-bold text-[#0f172a] mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Popular Designs
              </h2>
              <p className="text-lg text-[#64748b]">Trending creations from our community</p>
            </div>
            <Link
              to="/browse"
              className="px-6 py-3 bg-[#f8f7f5] text-[#0f172a] font-semibold rounded-xl hover:bg-[#ff9429] hover:text-white transition-all"
            >
              View All
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-8">
            {[imgImage, imgImage1, imgImage2].map((img, i) => (
              <Link key={i} to="/browse" className="group">
                <div className="bg-[#f8f7f5] rounded-2xl overflow-hidden border-2 border-transparent group-hover:border-[#ffa62b] transition-all">
                  <div className="aspect-square overflow-hidden">
                    <img src={img} alt={`Design ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-[#0f172a] mb-2">Design #{i + 1}</h3>
                    <p className="text-sm text-[#64748b]">Custom AI-generated design</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-[1280px] mx-auto px-8">
          <div className="bg-gradient-to-br from-[#ff9429] to-[#ff7b00] rounded-3xl p-16 text-center text-white">
            <h2 className="text-5xl font-bold mb-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Ready to Create Your Design?
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Join thousands of creators using CoTee to bring their ideas to life
            </p>
            <Link
              to="/register"
              className="inline-block px-12 py-5 bg-white text-[#ff9429] font-bold text-lg rounded-xl hover:bg-[#f8f7f5] transition-all shadow-xl"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
