import { type FormEvent, type KeyboardEvent, type PointerEvent, type WheelEvent, useCallback, useEffect, useRef, useState } from 'react';
import { Minus, Plus, ShoppingBag } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';
import imgAiContentImage from '../../imports/Group1/34aa2522d02cc0844a881c632b21d1859df4cbc0.png';
import { addCartItem as addApiCartItem, createProduct } from '../lib/api';
import { createChatCompletion, createImagePrompt, generateImage, type ChatMessage } from '../lib/aiApi';
import { getCloudinaryBrowseAssets } from '../lib/cloudinaryAssets';
import { backMockupOptions, frontMockupOptions } from '../lib/cloudinaryMockups';
import { formatVnd } from '../lib/commerce';
import { addCartItem as addLocalCartItem, isAuthenticated } from '../lib/store';

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
const STUDIO_HISTORY_KEY = 'cotee_studio_asset_history';
const STUDIO_CHAT_HISTORY_KEY = 'cotee_studio_chat_history';
const STUDIO_HISTORY_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_STUDIO_HISTORY_ITEMS = 12;
const CUSTOM_TEE_PRICE = 249000;
const CUSTOM_TEE_STOCK = 99;
const sizes = ['XS', 'S', 'M', 'L', 'XL', '2XL'];
const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
const getCropBounds = (scale: number, width: number, height: number) => ({
  x: Math.max(0, ((scale - 1) * width) / 2),
  y: Math.max(0, ((scale - 1) * height) / 2),
});
const downloadImage = (href: string, filename: string) => {
  const link = document.createElement('a');
  link.href = href;
  link.download = filename;
  link.click();
};

const loadExportImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
const getObjectCoverRect = (
  sourceWidth: number,
  sourceHeight: number,
  targetWidth: number,
  targetHeight: number,
) => {
  const scale = Math.max(targetWidth / sourceWidth, targetHeight / sourceHeight);
  const width = sourceWidth * scale;
  const height = sourceHeight * scale;

  return {
    x: (targetWidth - width) / 2,
    y: (targetHeight - height) / 2,
    width,
    height,
  };
};

type StudioHistoryItem = {
  id: string;
  kind: 'shirt' | 'design';
  label: string;
  src: string;
  backSrc?: string;
  createdAt: number;
  expiresAt: number;
};

type ChatSession = {
  id: string;
  title: string;
  messages: DashboardMessage[];
  createdAt: number;
  updatedAt: number;
  expiresAt: number;
};

const defaultDashboardMessages: DashboardMessage[] = [
  {
    role: 'assistant',
    content: "Hello! I've loaded your workspace. What kind of design should we apply to the T-shirt today?"
  }
];

function getStudioHistory(): StudioHistoryItem[] {
  const now = Date.now();
  const parsed = JSON.parse(window.localStorage.getItem(STUDIO_HISTORY_KEY) ?? '[]');
  if (!Array.isArray(parsed)) return [];

  const history = parsed
    .filter((item): item is StudioHistoryItem =>
      item &&
      typeof item.id === 'string' &&
      (item.kind === 'shirt' || item.kind === 'design') &&
      typeof item.label === 'string' &&
      typeof item.src === 'string' &&
      typeof item.createdAt === 'number' &&
      typeof item.expiresAt === 'number' &&
      item.expiresAt > now,
    )
    .sort((first, second) => second.createdAt - first.createdAt);

  if (history.length !== parsed.length) {
    window.localStorage.setItem(STUDIO_HISTORY_KEY, JSON.stringify(history));
  }

  return history;
}

function getValidChatMessages(messages: unknown): DashboardMessage[] {
  if (!Array.isArray(messages)) return [];

  return messages.filter((message): message is DashboardMessage =>
    message &&
    (message.role === 'assistant' || message.role === 'user' || message.role === 'system') &&
    typeof message.content === 'string',
  );
}

function getChatSessionTitle(messages: DashboardMessage[]) {
  const firstUserMessage = messages.find((message) => message.role === 'user')?.content.trim();
  const title = firstUserMessage || 'New chat';
  return title.length > 42 ? `${title.slice(0, 39)}...` : title;
}

function createChatSession(messages = defaultDashboardMessages): ChatSession {
  const now = Date.now();
  return {
    id: `chat-${now}-${Math.random().toString(36).slice(2, 8)}`,
    title: getChatSessionTitle(messages),
    messages,
    createdAt: now,
    updatedAt: now,
    expiresAt: now + STUDIO_HISTORY_TTL_MS,
  };
}

function getStoredChatSessions(): ChatSession[] {
  const now = Date.now();
  const parsed = JSON.parse(window.localStorage.getItem(STUDIO_CHAT_HISTORY_KEY) ?? 'null');
  const sourceSessions = Array.isArray(parsed) ? parsed : parsed && Array.isArray(parsed.messages) ? [parsed] : [];

  const sessions = sourceSessions
    .map((session): ChatSession | null => {
      const messages = getValidChatMessages(session.messages);
      const updatedAt = typeof session.updatedAt === 'number' ? session.updatedAt : now;
      const createdAt = typeof session.createdAt === 'number' ? session.createdAt : updatedAt;
      const expiresAt = typeof session.expiresAt === 'number' ? session.expiresAt : 0;

      if (messages.length === 0 || expiresAt <= now) return null;

      return {
        id: typeof session.id === 'string' ? session.id : `chat-${createdAt}`,
        title: typeof session.title === 'string' ? session.title : getChatSessionTitle(messages),
        messages,
        createdAt,
        updatedAt,
        expiresAt,
      };
    })
    .filter((session): session is ChatSession => Boolean(session))
    .sort((first, second) => second.updatedAt - first.updatedAt);

  if (sessions.length === 0) {
    const newSession = createChatSession();
    window.localStorage.setItem(STUDIO_CHAT_HISTORY_KEY, JSON.stringify([newSession]));
    return [newSession];
  }

  window.localStorage.setItem(STUDIO_CHAT_HISTORY_KEY, JSON.stringify(sessions));
  return sessions;
}

function saveStoredChatSessions(sessions: ChatSession[]) {
  window.localStorage.setItem(STUDIO_CHAT_HISTORY_KEY, JSON.stringify(sessions));
}

function getInitialChatState() {
  const sessions = getStoredChatSessions();
  return {
    sessions,
    activeSessionId: sessions[0]?.id ?? '',
  };
}

function saveStudioHistory(history: StudioHistoryItem[]) {
  window.localStorage.setItem(STUDIO_HISTORY_KEY, JSON.stringify(history));
}

function createStudioHistoryItem(
  item: Omit<StudioHistoryItem, 'createdAt' | 'expiresAt'>,
): StudioHistoryItem {
  const createdAt = Date.now();
  return {
    ...item,
    createdAt,
    expiresAt: createdAt + STUDIO_HISTORY_TTL_MS,
  };
}
export default function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const initialChatStateRef = useRef(getInitialChatState());
  const promptRef = useRef<HTMLTextAreaElement>(null);
  const shouldRefocusPromptRef = useRef(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const designBoxRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef<DragState | null>(null);
  const resizeStateRef = useRef<ResizeState | null>(null);
  const cropDragStateRef = useRef<CropDragState | null>(null);
  const [prompt, setPrompt] = useState('');
  const [chatSessions, setChatSessions] = useState<ChatSession[]>(() => initialChatStateRef.current.sessions);
  const [activeChatSessionId, setActiveChatSessionId] = useState(() => initialChatStateRef.current.activeSessionId);
  const [generatedImageSrc, setGeneratedImageSrc] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [selectedMockupSrc, setSelectedMockupSrc] = useState(frontMockupOptions[0]?.src ?? '');
  const [designOffset, setDesignOffset] = useState({ x: 0, y: 0 });
  const [designSize, setDesignSize] = useState<{ width: number; height: number } | null>(null);
  const [isDesignSelected, setIsDesignSelected] = useState(true);
  const [isCropMode, setIsCropMode] = useState(false);
  const [cropOffset, setCropOffset] = useState({ x: 0, y: 0 });
  const [cropScale, setCropScale] = useState(MIN_CROP_SCALE);
  const [mockupSide, setMockupSide] = useState<'front' | 'back'>('front');
  const [selectedSize, setSelectedSize] = useState('M');
  const [quantity, setQuantity] = useState(1);
  const [studioNotice, setStudioNotice] = useState('');
  const [studioHistory, setStudioHistory] = useState<StudioHistoryItem[]>(() => getStudioHistory());
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const shirtHistory = studioHistory.filter((item) => item.kind === 'shirt');
  const designHistory = studioHistory.filter((item) => item.kind === 'design');
  const activeChatSession = chatSessions.find((session) => session.id === activeChatSessionId) ?? chatSessions[0];
  const messages = activeChatSession?.messages ?? defaultDashboardMessages;
  const selectedShirtHistoryItem = shirtHistory.find(
    (item) => item.src === selectedMockupSrc || item.backSrc === selectedMockupSrc,
  );

  const addStudioHistoryItem = useCallback((item: Omit<StudioHistoryItem, 'createdAt' | 'expiresAt'>) => {
    setStudioHistory(() => {
      const currentHistory = getStudioHistory();
      const nextItem = createStudioHistoryItem(item);
      const sameKindHistory = [
        nextItem,
        ...currentHistory.filter((historyItem) => historyItem.kind === nextItem.kind && historyItem.id !== nextItem.id),
      ].slice(0, MAX_STUDIO_HISTORY_ITEMS);
      const nextHistory = [
        ...sameKindHistory,
        ...currentHistory.filter((historyItem) => historyItem.kind !== nextItem.kind),
      ]
        .sort((first, second) => second.createdAt - first.createdAt);

      saveStudioHistory(nextHistory);
      return nextHistory;
    });
  }, []);

  const resetDesignPlacement = useCallback(() => {
    dragStateRef.current = null;
    resizeStateRef.current = null;
    cropDragStateRef.current = null;
    setDesignOffset({ x: 0, y: 0 });
    setDesignSize(null);
    setCropOffset({ x: 0, y: 0 });
    setCropScale(MIN_CROP_SCALE);
    setIsCropMode(false);
    setIsDesignSelected(true);
  }, []);

  const selectHistoryItem = (item: StudioHistoryItem) => {
    if (item.kind === 'shirt') {
      setSelectedMockupSrc(mockupSide === 'back' && item.backSrc ? item.backSrc : item.src);
      addStudioHistoryItem(item);
      setStudioNotice(`${item.label} loaded from history.`);
      return;
    }

    setGeneratedImageSrc(item.src);
    resetDesignPlacement();
    addStudioHistoryItem(item);
    setStudioNotice(`${item.label} loaded from history.`);
  };

  const updateActiveChatMessages = (nextMessages: DashboardMessage[] | ((current: DashboardMessage[]) => DashboardMessage[])) => {
    setChatSessions((currentSessions) => {
      const now = Date.now();
      const targetSessionId = activeChatSession?.id ?? currentSessions[0]?.id;
      const nextSessions = currentSessions.map((session) => {
        if (session.id !== targetSessionId) return session;

        const resolvedMessages = typeof nextMessages === 'function' ? nextMessages(session.messages) : nextMessages;
        return {
          ...session,
          title: getChatSessionTitle(resolvedMessages),
          messages: resolvedMessages,
          updatedAt: now,
          expiresAt: now + STUDIO_HISTORY_TTL_MS,
        };
      }).sort((first, second) => second.updatedAt - first.updatedAt);

      saveStoredChatSessions(nextSessions);
      return nextSessions;
    });
  };

  const handleNewChatSession = () => {
    const newSession = createChatSession();
    setChatSessions((currentSessions) => {
      const nextSessions = [newSession, ...currentSessions];
      saveStoredChatSessions(nextSessions);
      return nextSessions;
    });
    setActiveChatSessionId(newSession.id);
    setPrompt('');
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const shirtId = params.get('shirt');
    if (!shirtId) return;

    const selectedShirt = getCloudinaryBrowseAssets().find((item) => item.kind === 'shirt' && item.id === shirtId);
    if (!selectedShirt) {
      const fallbackOptions = mockupSide === 'front' ? frontMockupOptions : backMockupOptions;
      setSelectedMockupSrc(fallbackOptions[0]?.src ?? '');
      return;
    }

    setSelectedMockupSrc(mockupSide === 'back' && selectedShirt.backImageUrl ? selectedShirt.backImageUrl : selectedShirt.imageUrl);
    addStudioHistoryItem({
      id: selectedShirt.id,
      kind: 'shirt',
      label: selectedShirt.name,
      src: selectedShirt.imageUrl,
      backSrc: selectedShirt.backImageUrl,
    });
  }, [addStudioHistoryItem, location.search, mockupSide]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const designId = params.get('design');
    if (!designId) return;

    const selectedDesign = getCloudinaryBrowseAssets().find((item) => item.kind === 'design' && item.id === designId);
    if (!selectedDesign) {
      setGeneratedImageSrc(null);
      return;
    }

    setGeneratedImageSrc(selectedDesign.imageUrl);
    resetDesignPlacement();
    addStudioHistoryItem({
      id: selectedDesign.id,
      kind: 'design',
      label: selectedDesign.name,
      src: selectedDesign.imageUrl,
    });
    setStudioNotice(`${selectedDesign.name} loaded from Browse.`);
  }, [addStudioHistoryItem, location.search, resetDesignPlacement]);

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt || isSubmitting) return;

    const nextMessages: DashboardMessage[] = [...messages, { role: 'user', content: trimmedPrompt }];
    updateActiveChatMessages(nextMessages);
    setPrompt('');
    setIsSubmitting(true);

    try {
      const assistantContent = await createChatCompletion(nextMessages);
      updateActiveChatMessages(prev => [...prev, {
        role: 'assistant',
        content: assistantContent
      }]);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown API error';
      updateActiveChatMessages(prev => [...prev, {
        role: 'assistant',
        content: `Sorry, I couldn't finish that request. ${message}`
      }]);
    } finally {
      shouldRefocusPromptRef.current = true;
      setIsSubmitting(false);
      setIsGeneratingImage(false);
    }
  };

  const handleMockupSideChange = (side: 'front' | 'back') => {
    setMockupSide(side);
    if (selectedShirtHistoryItem) {
      setSelectedMockupSrc(side === 'back' && selectedShirtHistoryItem.backSrc ? selectedShirtHistoryItem.backSrc : selectedShirtHistoryItem.src);
    } else {
      const nextOptions = side === 'front' ? frontMockupOptions : backMockupOptions;
      setSelectedMockupSrc(nextOptions[0]?.src ?? '');
    }
    setStudioNotice(`Switched to ${side} mockups.`);
  };

  const handleResetDesign = () => {
    resetDesignPlacement();
    setStudioNotice('Design placement reset.');
  };

  const handleIncreaseDesignSize = () => {
    const designBox = designBoxRef.current;
    const canvas = canvasRef.current;
    if (!designBox || !canvas) return;

    const boxRect = designBox.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();
    const nextWidth = Math.min(boxRect.width * 1.12, canvasRect.width * 0.8);
    const nextHeight = Math.min(boxRect.height * 1.12, canvasRect.height * 0.8);
    setDesignSize({ width: nextWidth, height: nextHeight });
    setIsDesignSelected(true);
    setStudioNotice('Design size increased.');
  };

  const handleExportShirt = () => {
    downloadImage(selectedMockupSrc, 'cotee-shirt.png');
    setIsExportMenuOpen(false);
  };

  const handleExportDesign = () => {
    downloadImage(designImageSrc, 'cotee-design.png');
    setIsExportMenuOpen(false);
  };

  const createComposedMockupImage = async () => {
    const canvasElement = canvasRef.current;
    const designBox = designBoxRef.current;
    if (!canvasElement || !designBox || !selectedMockupSrc) {
      throw new Error('The current shirt design is not ready yet.');
    }

    const canvasRect = canvasElement.getBoundingClientRect();
    const designRect = designBox.getBoundingClientRect();
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = Math.round(canvasRect.width * window.devicePixelRatio);
    exportCanvas.height = Math.round(canvasRect.height * window.devicePixelRatio);

    const context = exportCanvas.getContext('2d');
    if (!context) return;

    const [shirtImage, designImage] = await Promise.all([
      loadExportImage(selectedMockupSrc),
      loadExportImage(designImageSrc),
    ]);
    const scaleX = exportCanvas.width / canvasRect.width;
    const scaleY = exportCanvas.height / canvasRect.height;
    const designX = (designRect.left - canvasRect.left) * scaleX;
    const designY = (designRect.top - canvasRect.top) * scaleY;
    const designWidth = designRect.width * scaleX;
    const designHeight = designRect.height * scaleY;
    const mockupRect = getObjectCoverRect(
      shirtImage.naturalWidth,
      shirtImage.naturalHeight,
      exportCanvas.width,
      exportCanvas.height,
    );
    const designCoverRect = getObjectCoverRect(
      designImage.naturalWidth,
      designImage.naturalHeight,
      designWidth,
      designHeight,
    );

    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
    context.globalAlpha = 0.9;
    context.globalCompositeOperation = 'multiply';
    context.drawImage(shirtImage, mockupRect.x, mockupRect.y, mockupRect.width, mockupRect.height);
    context.globalAlpha = 0.75;
    context.globalCompositeOperation = 'source-over';
    context.save();
    context.beginPath();
    context.rect(designX, designY, designWidth, designHeight);
    context.clip();
    context.translate(designX + designWidth / 2 + cropOffset.x * scaleX, designY + designHeight / 2 + cropOffset.y * scaleY);
    context.scale(cropScale, cropScale);
    context.drawImage(
      designImage,
      -designWidth / 2 + designCoverRect.x,
      -designHeight / 2 + designCoverRect.y,
      designCoverRect.width,
      designCoverRect.height,
    );
    context.restore();
    context.globalAlpha = 1;
    context.globalCompositeOperation = 'source-over';

    const shadowGradient = context.createLinearGradient(0, 0, exportCanvas.width, exportCanvas.height);
    shadowGradient.addColorStop(0, 'rgba(0, 0, 0, 0.05)');
    shadowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    context.fillStyle = shadowGradient;
    context.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

    return exportCanvas.toDataURL('image/png');
  };

  const handleExportBoth = async () => {
    const mockupImage = await createComposedMockupImage();
    downloadImage(mockupImage, 'cotee-mockup.png');
    setIsExportMenuOpen(false);
  };

  const handleAddToCart = async () => {
    if (isAddingToCart) return;

    if (!isAuthenticated()) {
      navigate(`/login?redirect=${encodeURIComponent('/dashboard')}`);
      return;
    }

    setIsAddingToCart(true);
    setStudioNotice('');

    try {
      const imageUrl = await createComposedMockupImage();
      const product = await createProduct('Custom AI Studio T-shirt', CUSTOM_TEE_PRICE, CUSTOM_TEE_STOCK, imageUrl);
      await addApiCartItem(product.id, quantity, selectedSize);
      addLocalCartItem({
        id: `${product.id}-${selectedSize}`,
        productId: product.id,
        name: product.name,
        category: 'Custom AI Studio Design',
        price: product.price,
        image: imageUrl,
        size: selectedSize,
        color: '#ff9429',
        quantity,
      });
      setStudioNotice(`${quantity} custom T-shirt${quantity > 1 ? 's' : ''} added to cart.`);
      navigate('/cart');
    } catch (error) {
      setStudioNotice(error instanceof Error ? error.message : 'Unable to add this custom T-shirt to cart.');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleGenerateImage = async () => {
    if (isSubmitting) return;

    const trimmedPrompt = prompt.trim();
    const nextMessages: DashboardMessage[] = trimmedPrompt
      ? [...messages, { role: 'user', content: trimmedPrompt }]
      : messages;

    if (trimmedPrompt) {
      updateActiveChatMessages(nextMessages);
      setPrompt('');
    }

    setIsSubmitting(true);
    setIsGeneratingImage(true);

    try {
      const imagePrompt = await createImagePrompt(nextMessages);
      const imageSrc = await generateImage(imagePrompt);
      setGeneratedImageSrc(imageSrc);
      addStudioHistoryItem({
        id: `generated-${Date.now()}`,
        kind: 'design',
        label: trimmedPrompt || 'Generated design',
        src: imageSrc,
      });
      setIsDesignSelected(true);
      setIsCropMode(false);
      setCropOffset({ x: 0, y: 0 });
      setCropScale(MIN_CROP_SCALE);
      updateActiveChatMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Generated the design on the mockup.'
      }]);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown API error';
      updateActiveChatMessages(prev => [...prev, {
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
    <div className="w-full py-8">
      <div className="mx-auto w-full max-w-[1840px] px-4 sm:px-6 lg:px-8">
        <div className="grid min-h-[760px] grid-cols-1 rounded-2xl border border-[#e2e8f0] bg-white shadow-xl shadow-slate-200/60 lg:h-[calc(100vh-8rem)] lg:min-h-[760px] lg:grid-cols-[360px_minmax(0,1fr)] xl:grid-cols-[420px_minmax(0,1fr)]">
      {/* Left Sidebar - AI Chat */}
      <div className="bg-white border-b border-[#e2e8f0] flex min-h-[620px] min-w-0 flex-col overflow-hidden rounded-l-2xl lg:min-h-0 lg:border-b-0 lg:border-r">
        {/* Chat Header */}
        <div className="bg-[#fffaf5] border-b border-[#fed7aa] px-5 py-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-bold text-[#0f172a] uppercase tracking-wide">
              AI Design Assistant
            </h2>
            <button
              type="button"
              onClick={handleNewChatSession}
              className="rounded-lg bg-[#ff9429] px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-[#ff8c1a]"
            >
              New
            </button>
          </div>
          <select
            value={activeChatSession?.id ?? ''}
            onChange={(event) => {
              setActiveChatSessionId(event.target.value);
              setPrompt('');
            }}
            className="mt-3 w-full rounded-lg border border-[#fed7aa] bg-white px-3 py-2 text-sm font-semibold text-[#475569] focus:border-[#ffa62b] focus:outline-none"
          >
            {chatSessions.map((session) => (
              <option key={session.id} value={session.id}>
                {session.title}
              </option>
            ))}
          </select>
        </div>

        {/* Messages */}
        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto bg-[#f8f7f5] p-5 [scrollbar-color:#cbd5e1_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#cbd5e1] [&::-webkit-scrollbar-track]:bg-transparent">
          {messages.map((message, i) => (
            <div key={i} className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
              {message.role === 'assistant' ? (
                <div className="w-8 h-8 bg-[#ff9429] rounded-lg flex items-center justify-center shrink-0">
                  <span className="text-white text-xs font-bold">AI</span>
                </div>
              ) : (
                <div className="w-8 h-8 bg-[#0f172a] rounded-lg flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-white">You</span>
                </div>
              )}
              <div className={`flex-1 ${message.role === 'user' ? 'text-right' : ''}`}>
                <div className="text-[11px] font-semibold text-[#94a3b8] mb-1">
                  {message.role === 'assistant' ? 'CoTee AI' : 'You'}
                </div>
                <div className={`inline-block rounded-2xl px-4 py-3 ${
                  message.role === 'assistant'
                    ? 'bg-white border border-[#e2e8f0] rounded-tl-sm text-[#0f172a] shadow-sm'
                    : 'bg-[#ff9429] text-white rounded-tr-sm shadow-sm'
                }`}>
                  <p className="text-sm leading-6">{message.content}</p>
                </div>
              </div>
            </div>
          ))}
          {isThinking && (
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-[#ff9429] rounded-lg flex items-center justify-center shrink-0">
                <span className="text-white text-xs font-bold">AI</span>
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
        <div className="shrink-0 bg-white border-t border-[#e2e8f0] p-5 space-y-3">
          <form onSubmit={handleSendMessage} className="relative">
            <textarea
              ref={promptRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handlePromptKeyDown}
              placeholder="Type a design prompt..."
              disabled={isSubmitting}
              className="w-full bg-[#f8f7f5] border border-[#e2e8f0] rounded-xl px-4 py-3 pr-24 resize-none focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#ffa62b] transition-all disabled:cursor-not-allowed disabled:opacity-60"
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
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex min-w-0 flex-col overflow-hidden rounded-r-2xl bg-[#f8f7f5]">
        {/* Toolbar */}
        <div className="bg-white border-b border-[#e2e8f0] px-4 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-4">
            <div className="bg-[#f1f5f9] rounded-lg p-1 flex gap-1">
              <button
                type="button"
                onClick={() => handleMockupSideChange('front')}
                className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                  mockupSide === 'front'
                    ? 'bg-white text-[#0f172a] shadow-sm'
                    : 'text-[#64748b] hover:bg-white/50'
                }`}
              >
                Front
              </button>
              <button
                type="button"
                onClick={() => handleMockupSideChange('back')}
                className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                  mockupSide === 'back'
                    ? 'bg-white text-[#0f172a] shadow-sm'
                    : 'text-[#64748b] hover:bg-white/50'
                }`}
              >
                Back
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetDesign}
              className="p-2 hover:bg-[#f1f5f9] rounded-lg transition-colors"
              aria-label="Reset design placement"
              title="Reset design placement"
            >
              <svg className="w-5 h-5 text-[#64748b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <button
              type="button"
              onClick={handleIncreaseDesignSize}
              className="p-2 hover:bg-[#f1f5f9] rounded-lg transition-colors"
              aria-label="Increase design size"
              title="Increase design size"
            >
              <svg className="w-5 h-5 text-[#64748b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            <select
              value={selectedSize}
              onChange={(event) => setSelectedSize(event.target.value)}
              className="h-10 rounded-lg border border-[#e2e8f0] bg-white px-3 text-sm font-bold text-[#0f172a] focus:border-[#ffa62b] focus:outline-none"
              aria-label="Select shirt size"
            >
              {sizes.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <div className="inline-grid h-10 grid-cols-[36px_42px_36px] overflow-hidden rounded-lg border border-[#e2e8f0] bg-white">
              <button
                type="button"
                onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                className="grid place-items-center text-[#64748b] hover:bg-[#f8f7f5]"
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </button>
              <div className="grid place-items-center border-x border-[#e2e8f0] text-sm font-bold text-[#0f172a]">{quantity}</div>
              <button
                type="button"
                onClick={() => setQuantity((current) => Math.min(9, current + 1))}
                className="grid place-items-center text-[#64748b] hover:bg-[#f8f7f5]"
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isAddingToCart || isGeneratingImage}
              className="flex h-10 items-center gap-2 rounded-lg bg-[#0f172a] px-4 text-sm font-bold text-white transition-colors hover:bg-[#1e293b] disabled:cursor-not-allowed disabled:opacity-50"
              title={`${formatVnd(CUSTOM_TEE_PRICE)} each`}
            >
              <ShoppingBag className="h-4 w-4" />
              <span>{isAddingToCart ? 'Adding...' : 'Add to cart'}</span>
            </button>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsExportMenuOpen((current) => !current)}
                className="px-4 py-2 bg-[#ff9429] text-white rounded-lg hover:bg-[#ff8c1a] transition-colors flex items-center gap-2"
                aria-expanded={isExportMenuOpen}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span className="font-bold text-sm">Export</span>
              </button>
              {isExportMenuOpen && (
                <div className="absolute right-0 top-full z-30 mt-2 w-44 overflow-hidden rounded-xl border border-[#e2e8f0] bg-white py-2 text-sm font-semibold text-[#0f172a] shadow-xl shadow-slate-300/40">
                  <button
                    type="button"
                    onClick={handleExportShirt}
                    className="block w-full px-4 py-2 text-left hover:bg-[#fff7ed] hover:text-[#c2410c]"
                  >
                    Save shirt
                  </button>
                  <button
                    type="button"
                    onClick={handleExportDesign}
                    className="block w-full px-4 py-2 text-left hover:bg-[#fff7ed] hover:text-[#c2410c]"
                  >
                    Save design
                  </button>
                  <button
                    type="button"
                    onClick={handleExportBoth}
                    className="block w-full px-4 py-2 text-left hover:bg-[#fff7ed] hover:text-[#c2410c]"
                  >
                    Save both
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div
          className="relative flex-1 flex min-h-[680px] items-center justify-center p-5 pb-32 sm:p-8 lg:min-h-0 lg:p-8 lg:pr-[25rem] xl:pr-[27rem]"
          style={{
            backgroundImage: `linear-gradient(135deg, rgba(255,245,235,0.8), rgba(248,247,245,0.2)), radial-gradient(circle at 50% 50%, rgba(226,232,240,0.95) 0%, rgba(226,232,240,0) 68%)`,
            backgroundSize: 'cover'
          }}
        >
          <div ref={canvasRef} className="relative aspect-[19/21] h-auto max-h-full w-full max-w-[820px] bg-white rounded-2xl shadow-2xl shadow-slate-300/70 overflow-hidden lg:h-full lg:w-auto">
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
                      className="w-full h-full object-cover select-none opacity-75"
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
          <div className="absolute bottom-5 left-5 right-5 flex gap-3 overflow-x-auto lg:bottom-10 lg:left-auto lg:right-56 lg:top-14 lg:w-36 lg:overflow-y-auto lg:overflow-x-hidden">
              <section className="w-36 shrink-0 rounded-xl border border-[#e2e8f0] bg-white/90 p-3 shadow-sm backdrop-blur">
                <h3 className="mb-2 text-[10px] font-bold uppercase tracking-wide text-[#94a3b8]">Shirts</h3>
                {shirtHistory.length > 0 ? (
                  <div className="flex gap-2 lg:block lg:space-y-2">
                    {shirtHistory.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => selectHistoryItem(item)}
                        className={`block h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 bg-white transition-all lg:h-24 lg:w-full ${
                          selectedMockupSrc === item.src || selectedMockupSrc === item.backSrc
                            ? 'border-[#ff9429] shadow-md'
                            : 'border-transparent hover:border-[#cbd5e1]'
                        }`}
                        title={item.label}
                      >
                        <img
                          src={mockupSide === 'back' && item.backSrc ? item.backSrc : item.src}
                          alt={item.label}
                          className="h-full w-full object-cover object-center"
                          loading="lazy"
                          decoding="async"
                          draggable={false}
                        />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="grid h-20 w-full place-items-center rounded-lg border border-dashed border-[#cbd5e1] px-3 text-center text-[11px] font-semibold text-[#94a3b8]">
                    No shirt history
                  </div>
                )}
              </section>
          </div>
          <div className="absolute bottom-5 left-[10.25rem] right-5 flex gap-3 overflow-x-auto lg:bottom-10 lg:left-auto lg:right-8 lg:top-14 lg:w-36 lg:overflow-y-auto lg:overflow-x-hidden">
              <section className="w-36 shrink-0 rounded-xl border border-[#e2e8f0] bg-white/90 p-3 shadow-sm backdrop-blur">
                <h3 className="mb-2 text-[10px] font-bold uppercase tracking-wide text-[#94a3b8]">Designs</h3>
                {designHistory.length > 0 ? (
                  <div className="flex gap-2 lg:block lg:space-y-2">
                    {designHistory.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => selectHistoryItem(item)}
                        className={`block h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 bg-white transition-all lg:h-24 lg:w-full ${
                          generatedImageSrc === item.src
                            ? 'border-[#ff9429] shadow-md'
                            : 'border-transparent hover:border-[#cbd5e1]'
                        }`}
                        title={item.label}
                      >
                        <img
                          src={item.src}
                          alt={item.label}
                          className="h-full w-full object-contain object-center p-2"
                          loading="lazy"
                          decoding="async"
                          draggable={false}
                        />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="grid h-20 w-full place-items-center rounded-lg border border-dashed border-[#cbd5e1] px-3 text-center text-[11px] font-semibold text-[#94a3b8]">
                    No design history
                  </div>
                )}
              </section>
          </div>
        </div>
      </div>
        </div>
      </div>
    </div>
  );
}
