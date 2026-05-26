import { Link } from 'react-router';
import imgCoffee from '../../imports/Group1/50a898234962deeacff9129872033d1355cd6f9e.png';
import imgCoffee1 from '../../imports/Group1/c7c8817b3119b5c6e62023be109fb137c820a601.png';
import imgImage from '../../imports/Group1/2b566c36d05a907327c0d36cfa12b303603c2c23.png';
import imgImage1 from '../../imports/Group1/854372afc0f292fd23f2cdd8eb1108f72ac54dff.png';
import imgImage2 from '../../imports/Group1/b5e7b01317ce2b1811adc522276d76e959198f02.png';
import imgImage3 from '../../imports/Group1/bacdb8e0ee09ccd05d1a47710f095a138d18f73b.png';
import imgImage4 from '../../imports/Group1/b862ae571867a625e1ea9be65ffbc2dc8057bebd.png';

export default function Browse() {
  const categories = ['All Designs', 'T-Shirts', 'Hoodies', 'Mugs', 'Posters', 'Stickers'];
  const designs = [imgImage, imgImage1, imgImage2, imgImage3, imgImage4, imgCoffee, imgCoffee1, imgImage, imgImage1];

  return (
    <div className="w-full py-12">
      <div className="max-w-[1280px] mx-auto px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-[#0f172a] mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Browse Designs
          </h1>
          <p className="text-lg text-[#64748b]">
            Discover thousands of unique AI-generated designs
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-8 overflow-x-auto pb-4">
          {categories.map((category, i) => (
            <button
              key={i}
              className={`px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition-all ${
                i === 0
                  ? 'bg-[#ff9429] text-white shadow-lg'
                  : 'bg-white text-[#64748b] hover:bg-[#f8f7f5] border border-[#e2e8f0]'
              }`}
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Search and Sort */}
        <div className="flex gap-4 mb-8">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search designs..."
              className="w-full px-6 py-4 bg-white border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#ffa62b] transition-colors"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            />
            <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94a3b8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <select className="px-6 py-4 bg-white border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#ffa62b]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <option>Most Popular</option>
            <option>Newest First</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
          </select>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-3 gap-8">
          {designs.map((img, i) => (
            <Link key={i} to={`/product/${i + 1}`} className="group">
              <div className="bg-white rounded-2xl overflow-hidden border-2 border-transparent group-hover:border-[#ffa62b] transition-all shadow-sm hover:shadow-xl">
                <div className="aspect-square bg-[#f8f7f5] overflow-hidden relative">
                  <img src={img} alt={`Design ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold text-[#ff9429]">
                    ${(Math.random() * 30 + 15).toFixed(2)}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-[#0f172a] mb-2 group-hover:text-[#ff9429] transition-colors">
                    Design #{i + 1}
                  </h3>
                  <p className="text-sm text-[#64748b] mb-4">Custom AI-generated design</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-400">★</span>
                      <span className="text-sm font-semibold text-[#0f172a]">4.{Math.floor(Math.random() * 9)}</span>
                      <span className="text-xs text-[#94a3b8]">({Math.floor(Math.random() * 500)})</span>
                    </div>
                    <button className="text-[#ff9429] hover:text-[#ff8c1a]">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <button className="px-8 py-4 bg-white border-2 border-[#e2e8f0] text-[#0f172a] font-bold rounded-xl hover:border-[#ffa62b] hover:bg-[#fff5eb] transition-all">
            Load More Designs
          </button>
        </div>
      </div>
    </div>
  );
}
