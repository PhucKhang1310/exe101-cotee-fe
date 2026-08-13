import { Link } from 'react-router';
import imgAiContentImage from '../../assets/cotee-tee-hero.png';

export default function Features() {
  return (
    <div className="w-full py-12">
      <div className="max-w-[1280px] mx-auto px-8">
        {/* Header */}
        <div className="text-center mb-20">
          <h1 className="text-6xl font-bold text-[#102a56] mb-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Powerful Features
          </h1>
          <p className="text-xl text-[#5a7899] max-w-3xl mx-auto">
            Everything you need to create stunning designs and build your custom apparel business
          </p>
        </div>

        {/* AI Design Feature */}
        <div className="grid grid-cols-2 gap-16 items-center mb-32">
          <div className="space-y-6">
            <div className="inline-block px-4 py-2 bg-[#eaf7ff] rounded-full">
              <span className="text-sm font-bold text-[#315fae]">AI-POWERED</span>
            </div>
            <h2 className="text-4xl font-bold text-[#102a56]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Generate Unique Designs with AI
            </h2>
            <p className="text-lg text-[#5a7899] leading-relaxed">
              Our advanced AI technology transforms your ideas into professional designs in seconds. Simply describe what you want, and watch as our AI creates unique, high-quality designs tailored to your vision.
            </p>
            <ul className="space-y-4">
              {[
                'Instant design generation from text prompts',
                'Multiple style variations to choose from',
                'Professional-quality vector outputs',
                'Unlimited iterations and refinements'
              ].map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-[#315fae] shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-[#486f95]">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative">
            <div className="aspect-square bg-gradient-to-br from-[#eaf7ff] to-white rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
              <img src={imgAiContentImage} alt="AI Design" className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-8 -right-8 w-64 h-64 bg-[#6ecdf0] rounded-full opacity-10 blur-3xl" />
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-3 gap-8 mb-32">
          {[
            {
              icon: (
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              ),
              title: 'Easy Customization',
              description: 'Customize every aspect of your design with intuitive tools. Change colors, adjust text, and modify layouts with simple drag-and-drop controls.'
            },
            {
              icon: (
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              ),
              title: 'Real-time Preview',
              description: 'See your designs on realistic mockups instantly. Preview how your designs will look on t-shirts, hoodies, and other products in real-time.'
            },
            {
              icon: (
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                </svg>
              ),
              title: 'Cloud Storage',
              description: 'All your designs are automatically saved to the cloud. Access your creations from any device, anytime, anywhere.'
            },
            {
              icon: (
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              ),
              title: 'Mobile Responsive',
              description: 'Create and manage your designs on the go. Our platform works seamlessly on desktop, tablet, and mobile devices.'
            },
            {
              icon: (
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              ),
              title: 'High-Quality Export',
              description: 'Download your designs in multiple formats. Get print-ready files optimized for professional production.'
            },
            {
              icon: (
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              ),
              title: 'Collaboration',
              description: 'Work together with your team. Share designs, get feedback, and collaborate in real-time on your projects.'
            }
          ].map((feature, i) => (
            <div key={i} className="bg-white rounded-2xl p-8 border border-[#e4f3fc] hover:border-[#6ecdf0] hover:shadow-xl transition-all group">
              <div className="w-16 h-16 bg-gradient-to-br from-[#eaf7ff] to-[#d8effc] rounded-2xl flex items-center justify-center mb-6 text-[#315fae] group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-[#102a56] mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {feature.title}
              </h3>
              <p className="text-[#5a7899] leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-br from-[#315fae] to-[#12315f] rounded-3xl p-16 text-center text-white">
          <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Ready to Experience the Power?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Start creating amazing designs with our AI-powered platform today
          </p>
          <Link to="/dashboard" className="inline-block px-12 py-5 bg-white text-[#315fae] font-bold text-lg rounded-xl hover:bg-[#f3faff] transition-all shadow-xl">
            Start Free Trial
          </Link>
        </div>
      </div>
    </div>
  );
}
