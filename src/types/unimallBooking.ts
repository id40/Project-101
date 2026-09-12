export type UniMallShopCategory = 'food' | 'retail' | 'print' | 'services' | 'banking';

export interface UniMallShopItem {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  rating?: number;
  prepTimeMinutes?: number;
  isVegetarian?: boolean;
  isPopular?: boolean;
  imageEmoji?: string;
  customizationOptions?: {
    name: string;
    choices: { label: string; extraPrice: number }[];
  }[];
}

export interface UniMallShop {
  id: string; // matches indoorData.ts room IDs (e.g. 'um-g-dominos', 'um-g-subway', etc.)
  name: string;
  floor: number; // 0 = Ground, 1 = 1st Floor, 2 = 2nd Floor
  category: UniMallShopCategory;
  categoryLabel: string;
  tagline: string;
  rating: number;
  totalReviews: number;
  openingHours: string;
  queueStatus: 'Low' | 'Moderate' | 'High' | 'Closed';
  avgWaitMins: number;
  logoEmoji: string;
  bannerColor: string;
  locationDetails: string;
  acceptsPreOrders: boolean;
  serviceType: 'food_order' | 'retail_reserve' | 'print_upload' | 'token_queue';
  items: UniMallShopItem[];
  availableSlots: string[];
}

export interface CartItem {
  shopId: string;
  item: UniMallShopItem;
  quantity: number;
  selectedOptions?: Record<string, string>;
  notes?: string;
}

export interface PrintOrderSpecs {
  documentName: string;
  pageCount: number;
  copies: number;
  printType: 'black_white' | 'color';
  paperSize: 'A4' | 'A3';
  binding: 'none' | 'staple' | 'spiral' | 'hardbound';
  doubleSided: boolean;
}

export interface BookingTicket {
  id: string;
  tokenNumber: string; // e.g. 'UM-DMN-204'
  shopId: string;
  shopName: string;
  shopCategory: UniMallShopCategory;
  floor: number;
  studentId: string;
  studentName: string;
  timestamp: string;
  pickupSlot: string;
  serviceType: 'food_order' | 'retail_reserve' | 'print_upload' | 'token_queue';
  items?: { name: string; quantity: number; price: number }[];
  printSpecs?: PrintOrderSpecs;
  serviceName?: string;
  subtotal: number;
  tax: number;
  totalAmount: number;
  paymentMethod: 'UPI' | 'Campus Card / RMS' | 'Pay at Counter';
  status: 'confirmed' | 'preparing' | 'ready_for_pickup' | 'completed' | 'cancelled';
  qrCodeData: string;
}
