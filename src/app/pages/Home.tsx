import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import imgHeroHeaderImage from '../../assets/cotee-tee-hero.png';
import { getProducts, type ApiProduct } from '../lib/api';
import { formatVnd, getTeeProductImage } from '../lib/commerce';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<ApiProduct[]>([]);

  useEffect(() => {
    let isMounted = true;

    getProducts()
      .then((products) => {
        if (isMounted) setFeaturedProducts(products.slice(0, 3));
      })
      .catch(() => {
        if (isMounted) setFeaturedProducts([]);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#eaf7ff] to-white overflow-hidden">
        <div className="max-w-[1280px] mx-auto px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="grid grid-cols-1 gap-10 items-center lg:grid-cols-2 lg:gap-12">
            <div className="space-y-6">
              <div className="inline-block px-4 py-2 bg-[#eaf7ff] rounded-full border border-[#6ecdf0]">
                <span className="text-sm font-semibold text-[#315fae]">AI-Powered Design</span>
              </div>
              <h1 className="text-4xl font-bold text-[#102a56] leading-tight sm:text-5xl lg:text-6xl" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Create Amazing T-Shirt Designs with AI
              </h1>
              <p className="text-lg text-[#5a7899] leading-relaxed">
                Transform your ideas into stunning custom apparel designs. Our AI-powered studio helps you create professional designs in minutes.
              </p>
              <div className="flex flex-col gap-4 pt-4 sm:flex-row">
                <Link
                  to="/browse"
                  className="px-8 py-4 text-center bg-[#315fae] text-white font-bold rounded-xl hover:bg-[#244f92] transition-all shadow-lg hover:shadow-xl"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  Browse Designs
                </Link>
                <Link
                  to="/dashboard"
                  className="px-8 py-4 text-center bg-white text-[#102a56] font-bold rounded-xl border-2 border-[#c9deef] hover:border-[#6ecdf0] transition-all"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  Start Creating
                </Link>
              </div>
              <div className="grid grid-cols-3 gap-4 pt-8 sm:flex sm:items-center sm:gap-8">
                <div>
                  <div className="text-3xl font-bold text-[#102a56]">10K+</div>
                  <div className="text-sm text-[#5a7899]">Designs Created</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-[#102a56]">5K+</div>
                  <div className="text-sm text-[#5a7899]">Happy Users</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-[#102a56]">4.9★</div>
                  <div className="text-sm text-[#5a7899]">User Rating</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-[#eaf7ff] to-[#d8effc] rounded-3xl overflow-hidden shadow-2xl">
                <img src={imgHeroHeaderImage} alt="Hero" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-[#6ecdf0] rounded-full opacity-20 blur-3xl" />
              <div className="absolute -top-6 -right-6 w-40 h-40 bg-[#315fae] rounded-full opacity-10 blur-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#102a56] mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Why Choose CoTee?
            </h2>
            <p className="text-lg text-[#5a7899] max-w-2xl mx-auto">
              Everything you need to create, customize, and sell custom apparel designs
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
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
              <div key={i} className="bg-white rounded-2xl p-8 border border-[#e4f3fc] hover:border-[#6ecdf0] hover:shadow-lg transition-all">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-[#102a56] mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {feature.title}
                </h3>
                <p className="text-[#5a7899]">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Designs */}
      <section className="py-20 bg-white">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 mb-12 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-4xl font-bold text-[#102a56] mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Popular Designs
              </h2>
              <p className="text-lg text-[#5a7899]">Trending creations from our community</p>
            </div>
            <Link
              to="/browse"
              className="px-6 py-3 bg-[#f3faff] text-[#102a56] font-semibold rounded-xl hover:bg-[#315fae] hover:text-white transition-all"
            >
              View All
            </Link>
          </div>

          {featuredProducts.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {featuredProducts.map((product) => (
              <Link key={product.id} to={`/product/${product.id}`} className="group">
                <div className="bg-[#f3faff] rounded-2xl overflow-hidden border-2 border-transparent group-hover:border-[#6ecdf0] transition-all">
                  <div className="aspect-square overflow-hidden">
                    <img src={getTeeProductImage(product.id)} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-[#102a56] mb-2">{product.name}</h3>
                    <p className="text-sm text-[#5a7899]">{formatVnd(product.price)} · {product.stock} in stock</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          ) : (
            <div className="rounded-2xl border border-[#c9deef] bg-[#f3faff] p-10 text-center text-[#5a7899]">
              Featured products will appear when the catalog API is available.
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-[#315fae] to-[#12315f] rounded-3xl p-8 text-center text-white sm:p-12 lg:p-16">
            <h2 className="text-3xl font-bold mb-6 sm:text-4xl lg:text-5xl" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Ready to Create Your Design?
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Join thousands of creators using CoTee to bring their ideas to life
            </p>
            <Link
              to="/register"
              className="inline-block px-12 py-5 bg-white text-[#315fae] font-bold text-lg rounded-xl hover:bg-[#f3faff] transition-all shadow-xl"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
