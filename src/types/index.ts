export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'technician' | 'customer';
  phone: string;
  businessId: string;
  avatar?: string;
}

export interface Business {
  id: string;
  name: string;
  primaryTrade: TradeType;
  secondaryTrades: TradeType[];
  businessType: 'solo' | 'team';
  address: string;
  timezone: string;
  serviceAreaZipcodes: string[];
  phone: string;
  email: string;
  certifications: string[];
  setupComplete: boolean;
}

// types/customer.ts
export interface CustomerFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  property_type: 'residential' | 'commercial';
  tags: string;
  notes: string;
  last_contact: string;
}


export type TradeType = 'hvac' | 'electrical' | 'plumbing' | 'locksmith' | 'general-contractor';

export interface TradeConfig {
  name: string;
  icon: string;
  color: string;
  defaultJobDuration: number;
  jobTypes: string[];
  inventoryCategories: string[];
  checklistTemplates: ChecklistTemplate[];
  quickLineItems: QuickLineItem[];
}

export interface ChecklistTemplate {
  id: string;
  name: string;
  items: string[];
}

export interface QuickLineItem {
  id: string;
  description: string;
  category: string;
  defaultPrice: number;
  unit: string;
}

export interface Customer {
  id: string;
  businessId: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  tags: string[];
  notes: string;
  totalRevenue: number;
  lastContact: Date;
  jobCount: number;
  propertyType?: 'residential' | 'commercial' | 'hoa' | 'rental';
}

export interface Job {
  id: string;
  businessId: string;
  customerId: string;
  assignedUserId?: string;
  scheduledTime: Date;
  estimatedDuration: number;
  status: 'pending' | 'confirmed' | 'en-route' | 'in-progress' | 'completed' | 'cancelled';
  location: string;
  jobType: string;
  description: string;
  checklist: ChecklistItem[];
  notes: string;
  photos: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  tradeSpecificData?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Estimate {
  id: string;
  jobId: string;
  lineItems: LineItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  approved: boolean;
  sentAt?: Date;
  approvedAt?: Date;
  expiresAt: Date;
}

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  category?: string;
}

export interface Invoice {
  id: string;
  jobId: string;
  estimateId?: string;
  lineItems: LineItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paidAmount: number;
  dueDate: Date;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  createdAt: Date;
}

export interface InventoryItem {
  id: string;
  businessId: string;
  name: string;
  category: string;
  sku: string;
  stockLevel: number;
  reorderThreshold: number;
  costPerUnit: number;
  supplier: string;
  tradeSpecific: boolean;
  lastUpdated: Date;
}

export interface TimeLog {
  id: string;
  jobId: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  gpsLocation?: {
    lat: number;
    lng: number;
  };
  notes: string;
}