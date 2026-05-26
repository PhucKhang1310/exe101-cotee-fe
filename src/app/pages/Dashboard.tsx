import { useState } from 'react';
import imgMockupImageLayer from '../../imports/Group1/24416f7e05d30707ba776bf3f9d518cc0b0feb93.png';
import imgAiContentImage from '../../imports/Group1/34aa2522d02cc0844a881c632b21d1859df4cbc0.png';

export default function Dashboard() {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      content: "Hello! I've loaded your workspace. What kind of design should we apply to the T-shirt today?"
    }
  ]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setMessages([...messages, { role: 'user', content: prompt }]);
    setPrompt('');

    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: 'ai',
        content: `Generating "${prompt}" concepts... I'll place the first draft on the canvas for you.`
      }]);
    }, 1000);
  };

  return (
    <div className="flex h-[calc(100vh-200px)] bg-[#f8f7f5]">
      {/* Left Sidebar - AI Chat */}
      <div className="w-[384px] bg-[rgba(248,250,252,0.5)] border-r border-[#e2e8f0] flex flex-col">
        {/* Chat Header */}
        <div className="bg-white border-b border-[#e2e8f0] px-4 py-4">
          <h2 className="text-sm font-bold text-[#64748b] uppercase tracking-wide">
            AI Design Assistant
          </h2>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {messages.map((message, i) => (
            <div key={i} className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
              {message.role === 'ai' ? (
                <div className="w-8 h-8 bg-[#2e5aa7] rounded-full flex items-center justify-center shrink-0">
                  <span className="text-white text-xs">AI</span>
                </div>
              ) : (
                <div className="w-8 h-8 bg-[#f8e6a0] rounded-full flex items-center justify-center shrink-0">
                  <span className="text-xs">You</span>
                </div>
              )}
              <div className={`flex-1 ${message.role === 'user' ? 'text-right' : ''}`}>
                <div className="text-[11px] font-semibold text-[#94a3b8] mb-1">
                  {message.role === 'ai' ? 'CoTee AI' : 'You'}
                </div>
                <div className={`inline-block rounded-2xl px-4 py-3 ${
                  message.role === 'ai'
                    ? 'bg-white border border-[#f1f5f9] rounded-tl-sm'
                    : 'bg-[#ff9429] text-white rounded-tr-sm'
                }`}>
                  <p className="text-sm">{message.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="bg-white border-t border-[#e2e8f0] p-4 space-y-3">
          <form onSubmit={handleSendMessage} className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Type a design prompt..."
              className="w-full bg-[#f1f5f9] rounded-xl px-4 py-3 pr-12 resize-none focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#ffa62b] transition-all"
              rows={2}
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            />
            <button
              type="submit"
              className="absolute right-2 top-2 bg-[#ff9429] text-white p-2 rounded-lg hover:bg-[#ff8c1a] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
          <div className="flex gap-4 text-xs">
            <button className="flex items-center gap-1 text-[#94a3b8] hover:text-[#ff9429]">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
              <span className="font-bold uppercase">Attach</span>
            </button>
            <button className="flex items-center gap-1 text-[#94a3b8] hover:text-[#ff9429]">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              <span className="font-bold uppercase">Voice</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col bg-[#f1f5f9]">
        {/* Toolbar */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-[#e2e8f0] px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="font-semibold text-[#0f172a]">T-Shirt Mockup v1.2</span>
            <div className="h-4 w-px bg-[#cbd5e1]" />
            <div className="bg-[#f1f5f9] rounded-lg p-1 flex gap-1">
              <button className="px-3 py-1 bg-white rounded text-xs font-bold text-[#0f172a] shadow-sm">
                Front
              </button>
              <button className="px-3 py-1 text-xs font-bold text-[#64748b] hover:bg-white/50 rounded">
                Back
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-[#f1f5f9] rounded-lg transition-colors">
              <svg className="w-5 h-5 text-[#64748b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <button className="p-2 hover:bg-[#f1f5f9] rounded-lg transition-colors">
              <svg className="w-5 h-5 text-[#64748b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            <button className="px-4 py-2 bg-[#2e5aa7] text-white rounded-lg hover:bg-[#2648] transition-colors flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span className="font-bold text-sm">Export</span>
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div
          className="flex-1 flex items-center justify-center p-12"
          style={{
            backgroundImage: `radial-gradient(circle at 50% 50%, rgba(229,231,235,1) 0%, rgba(229,231,235,0) 70%)`,
            backgroundSize: 'cover'
          }}
        >
          <div className="relative max-w-[672px] w-full aspect-[4/5] bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Mockup */}
            <div className="absolute inset-0 opacity-90 mix-blend-multiply">
              <img src={imgMockupImageLayer} alt="Mockup" className="w-full h-[80%] object-cover mt-[10%]" />
            </div>

            {/* Design Overlay */}
            <div className="absolute top-1/4 left-1/4 right-1/4 bottom-1/3 flex items-center justify-center">
              <div className="relative w-full aspect-square border-2 border-dashed border-[rgba(255,148,41,0.4)] rounded-lg">
                <div className="absolute inset-[10px] rounded-lg overflow-hidden shadow-inner">
                  <img src={imgAiContentImage} alt="Design" className="w-full h-full object-cover" />
                </div>
                {/* Transform handles */}
                <div className="absolute -top-2 -left-2 w-4 h-4 bg-[#ff9429] rounded-full border-2 border-white shadow-lg" />
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-[#ff9429] rounded-full border-2 border-white shadow-lg" />
                <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-[#ff9429] rounded-full border-2 border-white shadow-lg" />
                <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-[#ff9429] rounded-full border-2 border-white shadow-lg" />
              </div>
            </div>

            {/* Shadow overlay */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'linear-gradient(51.34deg, rgba(0, 0, 0, 0.05) 0%, rgba(0, 0, 0, 0) 100%)'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
