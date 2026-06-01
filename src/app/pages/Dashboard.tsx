import { type FormEvent, type KeyboardEvent, type PointerEvent, type WheelEvent, useEffect, useRef, useState } from 'react';
import imgAiContentImage from '../../imports/Group1/34aa2522d02cc0844a881c632b21d1859df4cbc0.png';
import { createChatCompletion, createImagePrompt, generateImage, type ChatMessage } from '../lib/aiApi';
import { frontMockupOptions } from '../lib/cloudinaryMockups';

type DashboardMessage = ChatMessage;

type DragState = {
  pointerId: number;
  startClientX: number;
  startClientY: number;
  startOffsetX: number;
  startOffsetY: number;
  minOffsetX: number;
  maxOffsetX: number;
  minOffsetY: number;
  maxOffsetY: number;
};

type ResizeHandle =
  | 'top'
  | 'right'
  | 'bottom'
  | 'left'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right';

type ResizeState = {
  pointerId: number;
  handle: ResizeHandle;
  startClientX: number;
  startClientY: number;
  startLeft: number;
  startTop: number;
  startRight: number;
  startBottom: number;
  startWidth: number;
  startHeight: number;
  startOffsetX: number;
  startOffsetY: number;
  canvasLeft: number;
  canvasTop: number;
  canvasRight: number;
  canvasBottom: number;
};

type CropDragState = {
  pointerId: number;
  startClientX: number;
  startClientY: number;
  startOffsetX: number;
  startOffsetY: number;
  maxOffsetX: number;
  maxOffsetY: number;
};

const MIN_DESIGN_SIZE = 96;
const MIN_CROP_SCALE = 1;
const CROP_MODE_SCALE = 1.15;
const MAX_CROP_SCALE = 3;
const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
const getCropBounds = (scale: number, width: number, height: number) => ({
  x: Math.max(0, ((scale - 1) * width) / 2),
  y: Math.max(0, ((scale - 1) * height) / 2),
});
const mockupOptions = frontMockupOptions;

export default function Dashboard() {
  const promptRef = useRef<HTMLTextAreaElement>(null);
  const shouldRefocusPromptRef = useRef(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const designBoxRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef<DragState | null>(null);
  const resizeStateRef = useRef<ResizeState | null>(null);
  const cropDragStateRef = useRef<CropDragState | null>(null);
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<DashboardMessage[]>([
    {
      role: 'assistant',
      content: "Hello! I've loaded your workspace. What kind of design should we apply to the T-shirt today?"
    }
  ]);
  const [generatedImageSrc, setGeneratedImageSrc] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [selectedMockupSrc, setSelectedMockupSrc] = useState(mockupOptions[0]?.src ?? '');
  const [designOffset, setDesignOffset] = useState({ x: 0, y: 0 });
  const [designSize, setDesignSize] = useState<{ width: number; height: number } | null>(null);
  const [isDesignSelected, setIsDesignSelected] = useState(true);
  const [isCropMode, setIsCropMode] = useState(false);
  const [cropOffset, setCropOffset] = useState({ x: 0, y: 0 });
  const [cropScale, setCropScale] = useState(MIN_CROP_SCALE);

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt || isSubmitting) return;

    const nextMessages: DashboardMessage[] = [...messages, { role: 'user', content: trimmedPrompt }];
    setMessages(nextMessages);
    setPrompt('');
    setIsSubmitting(true);

    try {
      const assistantContent = await createChatCompletion(nextMessages);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: assistantContent
      }]);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown API error';
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Sorry, I couldn't finish that request. ${message}`
      }]);
    } finally {
      shouldRefocusPromptRef.current = true;
      setIsSubmitting(false);
      setIsGeneratingImage(false);
    }
  };

  const handleGenerateImage = async () => {
    if (isSubmitting) return;

    const trimmedPrompt = prompt.trim();
    const nextMessages: DashboardMessage[] = trimmedPrompt
      ? [...messages, { role: 'user', content: trimmedPrompt }]
      : messages;

    if (trimmedPrompt) {
      setMessages(nextMessages);
      setPrompt('');
    }

    setIsSubmitting(true);
    setIsGeneratingImage(true);

    try {
      const imagePrompt = await createImagePrompt(nextMessages);
      const imageSrc = await generateImage(imagePrompt);
      setGeneratedImageSrc(imageSrc);
      setIsDesignSelected(true);
      setIsCropMode(false);
      setCropOffset({ x: 0, y: 0 });
      setCropScale(MIN_CROP_SCALE);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Generated the design on the mockup.'
      }]);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown API error';
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Sorry, I couldn't generate the image. ${message}`
      }]);
    } finally {
      shouldRefocusPromptRef.current = true;
      setIsSubmitting(false);
      setIsGeneratingImage(false);
    }
  };

  useEffect(() => {
    if (isSubmitting || !shouldRefocusPromptRef.current) return;

    shouldRefocusPromptRef.current = false;
    promptRef.current?.focus();
  }, [isSubmitting]);

  useEffect(() => {
    if (!isDesignSelected && !isCropMode) return;

    const handlePointerDownOutsideDesign = (event: globalThis.PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node) || !designBoxRef.current?.contains(target)) {
        setIsDesignSelected(false);
        setIsCropMode(false);
      }
    };

    window.addEventListener('pointerdown', handlePointerDownOutsideDesign);
    return () => {
      window.removeEventListener('pointerdown', handlePointerDownOutsideDesign);
    };
  }, [isDesignSelected, isCropMode]);

  const handlePromptKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (
      e.key !== 'Enter' ||
      e.shiftKey ||
      e.ctrlKey ||
      e.altKey ||
      e.metaKey ||
      e.nativeEvent.isComposing
    ) {
      return;
    }

    e.preventDefault();
    e.currentTarget.form?.requestSubmit();
  };

  const handleDesignPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    const canvas = canvasRef.current;
    const designBox = designBoxRef.current;
    if (!canvas || !designBox) return;

    setIsDesignSelected(true);

    if (isCropMode) {
      const boxRect = designBox.getBoundingClientRect();
      const cropBounds = getCropBounds(cropScale, boxRect.width, boxRect.height);
      cropDragStateRef.current = {
        pointerId: e.pointerId,
        startClientX: e.clientX,
        startClientY: e.clientY,
        startOffsetX: cropOffset.x,
        startOffsetY: cropOffset.y,
        maxOffsetX: cropBounds.x,
        maxOffsetY: cropBounds.y,
      };
      e.currentTarget.setPointerCapture(e.pointerId);
      return;
    }

    const canvasRect = canvas.getBoundingClientRect();
    const boxRect = designBox.getBoundingClientRect();
    const baseLeft = boxRect.left - designOffset.x;
    const baseTop = boxRect.top - designOffset.y;

    dragStateRef.current = {
      pointerId: e.pointerId,
      startClientX: e.clientX,
      startClientY: e.clientY,
      startOffsetX: designOffset.x,
      startOffsetY: designOffset.y,
      minOffsetX: canvasRect.left - baseLeft,
      maxOffsetX: canvasRect.right - baseLeft - boxRect.width,
      minOffsetY: canvasRect.top - baseTop,
      maxOffsetY: canvasRect.bottom - baseTop - boxRect.height,
    };

    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handleDesignPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const cropDragState = cropDragStateRef.current;
    if (cropDragState && cropDragState.pointerId === e.pointerId) {
      const nextX = cropDragState.startOffsetX + e.clientX - cropDragState.startClientX;
      const nextY = cropDragState.startOffsetY + e.clientY - cropDragState.startClientY;
      setCropOffset({
        x: clamp(nextX, -cropDragState.maxOffsetX, cropDragState.maxOffsetX),
        y: clamp(nextY, -cropDragState.maxOffsetY, cropDragState.maxOffsetY),
      });
      return;
    }

    const dragState = dragStateRef.current;
    if (!dragState || dragState.pointerId !== e.pointerId) return;

    const nextX = dragState.startOffsetX + e.clientX - dragState.startClientX;
    const nextY = dragState.startOffsetY + e.clientY - dragState.startClientY;
    setDesignOffset({
      x: clamp(nextX, dragState.minOffsetX, dragState.maxOffsetX),
      y: clamp(nextY, dragState.minOffsetY, dragState.maxOffsetY),
    });
  };

  const handleDesignPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (cropDragStateRef.current?.pointerId === e.pointerId) {
      cropDragStateRef.current = null;
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
      return;
    }

    if (dragStateRef.current?.pointerId !== e.pointerId) return;

    dragStateRef.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const handleDesignDoubleClick = () => {
    dragStateRef.current = null;
    cropDragStateRef.current = null;
    setIsDesignSelected(true);
    setIsCropMode(prev => {
      const nextCropMode = !prev;
      if (nextCropMode) {
        setCropScale(currentScale => Math.max(currentScale, CROP_MODE_SCALE));
      }
      return nextCropMode;
    });
  };

  const handleDesignWheel = (e: WheelEvent<HTMLDivElement>) => {
    if (!isCropMode) return;

    e.preventDefault();
    const designBox = designBoxRef.current;
    if (!designBox) return;

    const boxRect = designBox.getBoundingClientRect();
    const nextScale = clamp(
      cropScale + (e.deltaY < 0 ? 0.08 : -0.08),
      MIN_CROP_SCALE,
      MAX_CROP_SCALE,
    );
    const cropBounds = getCropBounds(nextScale, boxRect.width, boxRect.height);
    setCropScale(nextScale);
    setCropOffset(prev => ({
      x: clamp(prev.x, -cropBounds.x, cropBounds.x),
      y: clamp(prev.y, -cropBounds.y, cropBounds.y),
    }));
  };

  const handleResizePointerDown = (handle: ResizeHandle) => (e: PointerEvent<HTMLDivElement>) => {
    const canvas = canvasRef.current;
    const designBox = designBoxRef.current;
    if (!canvas || !designBox) return;

    e.stopPropagation();

    const canvasRect = canvas.getBoundingClientRect();
    const boxRect = designBox.getBoundingClientRect();
    resizeStateRef.current = {
      pointerId: e.pointerId,
      handle,
      startClientX: e.clientX,
      startClientY: e.clientY,
      startLeft: boxRect.left,
      startTop: boxRect.top,
      startRight: boxRect.right,
      startBottom: boxRect.bottom,
      startWidth: boxRect.width,
      startHeight: boxRect.height,
      startOffsetX: designOffset.x,
      startOffsetY: designOffset.y,
      canvasLeft: canvasRect.left,
      canvasTop: canvasRect.top,
      canvasRight: canvasRect.right,
      canvasBottom: canvasRect.bottom,
    };

    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handleResizePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const resizeState = resizeStateRef.current;
    if (!resizeState || resizeState.pointerId !== e.pointerId) return;

    e.stopPropagation();

    const deltaX = e.clientX - resizeState.startClientX;
    const deltaY = e.clientY - resizeState.startClientY;
    let nextLeft = resizeState.startLeft;
    let nextTop = resizeState.startTop;
    let nextRight = resizeState.startRight;
    let nextBottom = resizeState.startBottom;

    if (resizeState.handle.includes('left')) {
      nextLeft = clamp(
        resizeState.startLeft + deltaX,
        resizeState.canvasLeft,
        resizeState.startRight - MIN_DESIGN_SIZE,
      );
    } else if (resizeState.handle.includes('right')) {
      nextRight = clamp(
        resizeState.startRight + deltaX,
        resizeState.startLeft + MIN_DESIGN_SIZE,
        resizeState.canvasRight,
      );
    }

    if (resizeState.handle.includes('top')) {
      nextTop = clamp(
        resizeState.startTop + deltaY,
        resizeState.canvasTop,
        resizeState.startBottom - MIN_DESIGN_SIZE,
      );
    } else if (resizeState.handle.includes('bottom')) {
      nextBottom = clamp(
        resizeState.startBottom + deltaY,
        resizeState.startTop + MIN_DESIGN_SIZE,
        resizeState.canvasBottom,
      );
    }

    const nextWidth = nextRight - nextLeft;
    const nextHeight = nextBottom - nextTop;
    const cropBounds = getCropBounds(cropScale, nextWidth, nextHeight);
    setDesignSize({ width: nextWidth, height: nextHeight });
    setDesignOffset({
      x: resizeState.startOffsetX + nextLeft - resizeState.startLeft + (nextWidth - resizeState.startWidth) / 2,
      y: resizeState.startOffsetY + nextTop - resizeState.startTop + (nextHeight - resizeState.startHeight) / 2,
    });
    setCropOffset(prev => ({
      x: clamp(prev.x, -cropBounds.x, cropBounds.x),
      y: clamp(prev.y, -cropBounds.y, cropBounds.y),
    }));
  };

  const handleResizePointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (resizeStateRef.current?.pointerId !== e.pointerId) return;

    e.stopPropagation();
    resizeStateRef.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const designImageSrc = generatedImageSrc ?? imgAiContentImage;
  const isThinking = isSubmitting && !isGeneratingImage;

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
              {message.role === 'assistant' ? (
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
                  {message.role === 'assistant' ? 'CoTee AI' : 'You'}
                </div>
                <div className={`inline-block rounded-2xl px-4 py-3 ${
                  message.role === 'assistant'
                    ? 'bg-white border border-[#f1f5f9] rounded-tl-sm'
                    : 'bg-[#ff9429] text-white rounded-tr-sm'
                }`}>
                  <p className="text-sm">{message.content}</p>
                </div>
              </div>
            </div>
          ))}
          {isThinking && (
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-[#2e5aa7] rounded-full flex items-center justify-center shrink-0">
                <span className="text-white text-xs">AI</span>
              </div>
              <div className="flex-1">
                <div className="text-[11px] font-semibold text-[#94a3b8] mb-1">
                  CoTee AI
                </div>
                <div className="inline-block rounded-2xl rounded-tl-sm px-4 py-3 bg-white border border-[#f1f5f9]">
                  <p className="text-sm text-[#64748b]">Thinking...</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="bg-white border-t border-[#e2e8f0] p-4 space-y-3">
          <form onSubmit={handleSendMessage} className="relative">
            <textarea
              ref={promptRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handlePromptKeyDown}
              placeholder="Type a design prompt..."
              disabled={isSubmitting}
              className="w-full bg-[#f1f5f9] rounded-xl px-4 py-3 pr-24 resize-none focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#ffa62b] transition-all disabled:cursor-not-allowed disabled:opacity-60"
              rows={2}
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            />
            <button
              type="button"
              onClick={handleGenerateImage}
              disabled={isSubmitting || (!prompt.trim() && messages.length <= 1)}
              className="absolute right-12 top-2 bg-white text-[#ff9429] p-2 rounded-lg border border-[#fed7aa] hover:bg-[#fff7ed] transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              title="Generate image"
              aria-label="Generate image"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.813 5.146L11 2l1.187 3.146A4 4 0 0014.854 7.8L18 9l-3.146 1.2a4 4 0 00-2.667 2.654L11 16l-1.187-3.146A4 4 0 007.146 10.2L4 9l3.146-1.2a4 4 0 002.667-2.654zM17.5 14.5L18 13l.5 1.5L20 15l-1.5.5L18 17l-.5-1.5L16 15l1.5-.5z" />
              </svg>
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !prompt.trim()}
              className="absolute right-2 top-2 bg-[#ff9429] text-white p-2 rounded-lg hover:bg-[#ff8c1a] transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              title="Send message"
              aria-label="Send message"
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
          className="relative flex-1 flex items-center justify-center p-12 pr-32"
          style={{
            backgroundImage: `radial-gradient(circle at 50% 50%, rgba(229,231,235,1) 0%, rgba(229,231,235,0) 70%)`,
            backgroundSize: 'cover'
          }}
        >
          <div ref={canvasRef} className="relative w-[760px] h-[840px] bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Mockup */}
            <div className="absolute inset-0 opacity-90 mix-blend-multiply">
              {selectedMockupSrc ? (
                <img src={selectedMockupSrc} alt="Mockup" className="w-full h-full object-cover object-center" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[#f8fafc] text-sm font-semibold text-[#64748b]">
                  No mockups found
                </div>
              )}
            </div>

            {/* Design Overlay */}
            <div
              className="absolute top-1/4 left-1/4 right-1/4 bottom-1/3 flex items-center justify-center"
              style={{ transform: `translate(${designOffset.x}px, ${designOffset.y}px)` }}
            >
              <div
                ref={designBoxRef}
                className={`relative w-full h-full border-2 rounded-lg touch-none select-none ${
                  isCropMode
                    ? 'cursor-grab border-solid border-[#ff9429] ring-2 ring-[#ff9429]/20'
                    : `cursor-move border-dashed ${isDesignSelected ? 'border-[rgba(255,148,41,0.4)]' : 'border-transparent'}`
                }`}
                style={designSize ? { width: designSize.width, height: designSize.height } : undefined}
                onDoubleClick={handleDesignDoubleClick}
                onWheel={handleDesignWheel}
                onPointerDown={handleDesignPointerDown}
                onPointerMove={handleDesignPointerMove}
                onPointerUp={handleDesignPointerUp}
                onPointerCancel={handleDesignPointerUp}
              >
                {isCropMode && (
                  <div
                    className="absolute inset-0 pointer-events-none opacity-30"
                    style={{ transform: `translate(${cropOffset.x}px, ${cropOffset.y}px)` }}
                  >
                    <img
                      src={designImageSrc}
                      alt=""
                      draggable={false}
                      className="w-full h-full object-cover select-none"
                      style={{ transform: `scale(${cropScale})` }}
                    />
                  </div>
                )}
                <div className="absolute inset-0 overflow-hidden shadow-inner">
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ transform: `translate(${cropOffset.x}px, ${cropOffset.y}px)` }}
                  >
                    <img
                      src={designImageSrc}
                      alt="Design"
                      draggable={false}
                      className="w-full h-full object-cover select-none"
                      style={{ transform: `scale(${cropScale})` }}
                    />
                  </div>
                  {isCropMode && (
                    <div className="absolute left-2 top-2 rounded bg-[#ff9429] px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white pointer-events-none">
                      Crop
                    </div>
                  )}
                  {isGeneratingImage && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                      <span className="text-xs font-bold uppercase tracking-wide text-[#2e5aa7]">
                        Generating image...
                      </span>
                    </div>
                  )}
                </div>
                {/* Transform handles */}
                {isDesignSelected && (
                  <>
                    <div
                      className="absolute -top-2 left-3 right-3 h-4 cursor-ns-resize z-10"
                      onPointerDown={handleResizePointerDown('top')}
                      onPointerMove={handleResizePointerMove}
                      onPointerUp={handleResizePointerUp}
                      onPointerCancel={handleResizePointerUp}
                    />
                    <div
                      className="absolute -right-2 top-3 bottom-3 w-4 cursor-ew-resize z-10"
                      onPointerDown={handleResizePointerDown('right')}
                      onPointerMove={handleResizePointerMove}
                      onPointerUp={handleResizePointerUp}
                      onPointerCancel={handleResizePointerUp}
                    />
                    <div
                      className="absolute -bottom-2 left-3 right-3 h-4 cursor-ns-resize z-10"
                      onPointerDown={handleResizePointerDown('bottom')}
                      onPointerMove={handleResizePointerMove}
                      onPointerUp={handleResizePointerUp}
                      onPointerCancel={handleResizePointerUp}
                    />
                    <div
                      className="absolute -left-2 top-3 bottom-3 w-4 cursor-ew-resize z-10"
                      onPointerDown={handleResizePointerDown('left')}
                      onPointerMove={handleResizePointerMove}
                      onPointerUp={handleResizePointerUp}
                      onPointerCancel={handleResizePointerUp}
                    />
                    <div
                      className="absolute -top-2 -left-2 w-4 h-4 bg-[#ff9429] rounded-full border-2 border-white shadow-lg cursor-nwse-resize z-10"
                      onPointerDown={handleResizePointerDown('top-left')}
                      onPointerMove={handleResizePointerMove}
                      onPointerUp={handleResizePointerUp}
                      onPointerCancel={handleResizePointerUp}
                    />
                    <div
                      className="absolute -top-2 -right-2 w-4 h-4 bg-[#ff9429] rounded-full border-2 border-white shadow-lg cursor-nesw-resize z-10"
                      onPointerDown={handleResizePointerDown('top-right')}
                      onPointerMove={handleResizePointerMove}
                      onPointerUp={handleResizePointerUp}
                      onPointerCancel={handleResizePointerUp}
                    />
                    <div
                      className="absolute -bottom-2 -left-2 w-4 h-4 bg-[#ff9429] rounded-full border-2 border-white shadow-lg cursor-nesw-resize z-10"
                      onPointerDown={handleResizePointerDown('bottom-left')}
                      onPointerMove={handleResizePointerMove}
                      onPointerUp={handleResizePointerUp}
                      onPointerCancel={handleResizePointerUp}
                    />
                    <div
                      className="absolute -bottom-2 -right-2 w-4 h-4 bg-[#ff9429] rounded-full border-2 border-white shadow-lg cursor-nwse-resize z-10"
                      onPointerDown={handleResizePointerDown('bottom-right')}
                      onPointerMove={handleResizePointerMove}
                      onPointerUp={handleResizePointerUp}
                      onPointerCancel={handleResizePointerUp}
                    />
                  </>
                )}
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
          <div className="absolute bottom-12 right-4 top-12 w-24 overflow-y-auto rounded-xl border border-[#e2e8f0] bg-white/80 p-2 shadow-sm">
            <div className="space-y-2">
              {mockupOptions.map((mockup) => (
                <button
                  key={mockup.id}
                  type="button"
                  onClick={() => setSelectedMockupSrc(mockup.src)}
                  className={`block h-24 w-full overflow-hidden rounded-lg border-2 bg-white transition-all ${
                    selectedMockupSrc === mockup.src
                      ? 'border-[#ff9429] shadow-md'
                      : 'border-transparent hover:border-[#cbd5e1]'
                  }`}
                  title={mockup.label}
                >
                  <img
                    src={mockup.thumbSrc}
                    alt={mockup.label}
                    className="h-full w-full object-cover object-center"
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
