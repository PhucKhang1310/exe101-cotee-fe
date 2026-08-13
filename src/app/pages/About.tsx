export default function About() {
  return (
    <div className="w-full py-12">
      <div className="max-w-[1280px] mx-auto px-8">
        {/* Header */}
        <div className="text-center mb-20">
          <h1 className="text-6xl font-bold text-[#102a56] mb-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            About CoTee
          </h1>
          <p className="text-xl text-[#5a7899] max-w-3xl mx-auto">
            We're on a mission to democratize design creation with AI technology
          </p>
        </div>

        {/* Story Section */}
        <div className="bg-white rounded-3xl p-16 mb-16 shadow-lg">
          <div className="max-w-4xl mx-auto space-y-6 text-lg text-[#486f95] leading-relaxed">
            <p>
              CoTee was founded in 2024 with a simple vision: to make professional design accessible to everyone. We believe that great ideas shouldn't be limited by design skills or expensive software.
            </p>
            <p>
              Using cutting-edge AI technology, we've created a platform that transforms your ideas into stunning designs in seconds. Whether you're a small business owner, content creator, or just someone with a great idea, CoTee empowers you to bring your vision to life.
            </p>
            <p>
              Today, thousands of creators worldwide use CoTee to design custom apparel, generate marketing materials, and build their brands. We're proud to be part of their creative journey.
            </p>
          </div>
        </div>

        {/* Values */}
        <div className="mb-20">
          <h2 className="text-4xl font-bold text-center text-[#102a56] mb-12" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Our Values
          </h2>
          <div className="grid grid-cols-3 gap-8">
            {[
              {
                icon: '🎨',
                title: 'Creativity First',
                description: 'We believe everyone has creative potential. Our tools are designed to unlock it.'
              },
              {
                icon: '🚀',
                title: 'Innovation',
                description: 'We constantly push the boundaries of what\'s possible with AI and design technology.'
              },
              {
                icon: '🤝',
                title: 'Community',
                description: 'We\'re building a supportive community of creators who inspire and help each other.'
              }
            ].map((value, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 text-center border border-[#e4f3fc] hover:border-[#6ecdf0] hover:shadow-xl transition-all">
                <div className="text-6xl mb-4">{value.icon}</div>
                <h3 className="text-2xl font-bold text-[#102a56] mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {value.title}
                </h3>
                <p className="text-[#5a7899]">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Team */}
        <div className="mb-20">
          <h2 className="text-4xl font-bold text-center text-[#102a56] mb-12" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Our Team
          </h2>
          <div className="space-y-10">
            <div className="max-w-xs mx-auto text-center group">
              <div className="w-40 h-40 mx-auto mb-4 bg-gradient-to-br from-[#2563c9] to-[#8dc3f7] rounded-2xl flex items-center justify-center text-6xl group-hover:scale-105 transition-transform">
                👨‍💼
              </div>
              <h3 className="font-bold text-[#102a56] mb-1">Huynh Kha Tu</h3>
              <p className="text-sm font-semibold text-[#315fae]">CEO</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
              {[
                { name: 'Phan Tai Duc', role: 'Operations', avatar: '🧭' },
                { name: 'Nguyen Long Vu', role: 'Technology', avatar: '💻' },
                { name: 'Nguyen Phuc Khang', role: 'Technology', avatar: '⚙️' },
                { name: 'Tran Hoai Nam', role: 'Finance', avatar: '📊' },
                { name: 'Pham Quoc Duy', role: 'Marketing', avatar: '📣' }
              ].map((member, i) => (
                <div key={i} className="text-center group">
                  <div className="w-32 h-32 mx-auto mb-4 bg-gradient-to-br from-[#eaf7ff] to-[#dbeafe] rounded-2xl flex items-center justify-center text-5xl group-hover:scale-105 transition-transform">
                    {member.avatar}
                  </div>
                  <h3 className="font-bold text-[#102a56] mb-1">{member.name}</h3>
                  <p className="text-sm text-[#5a7899]">{member.role}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-gradient-to-br from-[#315fae] to-[#12315f] rounded-3xl p-16">
          <div className="grid grid-cols-4 gap-8 text-center text-white">
            {[
              { number: '10,000+', label: 'Designs Created' },
              { number: '5,000+', label: 'Active Users' },
              { number: '50+', label: 'Countries' },
              { number: '99%', label: 'Satisfaction' }
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-5xl font-bold mb-2">{stat.number}</div>
                <div className="text-lg opacity-90">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
