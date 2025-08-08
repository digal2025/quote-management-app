// User and Authentication Types
export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  avatarUrl?: string
  isActive: boolean
  emailVerified: boolean
  createdAt: string
  updatedAt: string
}

export interface AuthUser extends User {
  organizations: UserOrganization[]
}

export interface UserOrganization {
  id: string
  userId: string
  organizationId: string
  role: UserRole
  organization: Organization
  createdAt: string
}

export enum UserRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
  VIEWER = 'VIEWER'
}

// Organization Types
export interface Organization {
  id: string
  name: string
  slug: string
  logoUrl?: string
  primaryColor?: string
  secondaryColor?: string
  address?: string
  phone?: string
  email?: string
  website?: string
  nzBusinessNumber?: string
  gstNumber?: string
  createdAt: string
  updatedAt: string
}

// Customer Types
export interface Customer {
  id: string
  organizationId: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  companyName?: string
  address?: string
  city?: string
  postalCode?: string
  country: string
  notes?: string
  createdAt: string
  updatedAt: string
}

// Quote Types
export interface Quote {
  id: string
  organizationId: string
  customerId: string
  quoteNumber: string
  title: string
  description?: string
  status: QuoteStatus
  currency: string
  subtotal: number
  taxRate: number
  taxAmount: number
  discountPercentage: number
  discountAmount: number
  totalAmount: number
  validUntil?: string
  termsConditions?: string
  notes?: string
  createdBy: string
  createdAt: string
  updatedAt: string
  customer: Customer
  items: QuoteItem[]
  views: QuoteView[]
  interactions: QuoteInteraction[]
  comments: QuoteComment[]
}

export interface QuoteItem {
  id: string
  quoteId: string
  name: string
  description?: string
  quantity: number
  unitPrice: number
  totalPrice: number
  isOptional: boolean
  isEditable: boolean
  sortOrder: number
  createdAt: string
}

export enum QuoteStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  VIEWED = 'VIEWED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED'
}

// Analytics Types
export interface QuoteView {
  id: string
  quoteId: string
  viewerIp?: string
  userAgent?: string
  viewedAt: string
  timeSpentSeconds?: number
}

export interface QuoteInteraction {
  id: string
  quoteId: string
  customerId?: string
  userId?: string
  action: InteractionAction
  metadata?: Record<string, any>
  createdAt: string
}

export enum InteractionAction {
  VIEWED = 'VIEWED',
  DOWNLOADED = 'DOWNLOADED',
  SHARED = 'SHARED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED'
}

// Comment Types
export interface QuoteComment {
  id: string
  quoteId: string
  userId?: string
  customerId?: string
  content: string
  isInternal: boolean
  parentId?: string
  createdAt: string
  updatedAt: string
  user?: User
  customer?: Customer
  parent?: QuoteComment
  replies: QuoteComment[]
}

// Template Types
export interface Template {
  id: string
  organizationId: string
  name: string
  description?: string
  content: Record<string, any>
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// GST and NZ Specific Types
export interface GstSetting {
  id: string
  organizationId: string
  gstNumber?: string
  gstRate: number
  isGstRegistered: boolean
  createdAt: string
}

export interface InvoiceSequence {
  id: string
  organizationId: string
  prefix: string
  currentNumber: number
  year: number
  createdAt: string
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Form Types
export interface LoginForm {
  email: string
  password: string
}

export interface RegisterForm {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
}

export interface CreateQuoteForm {
  title: string
  description?: string
  customerId: string
  items: CreateQuoteItemForm[]
  validUntil?: string
  termsConditions?: string
  notes?: string
}

export interface CreateQuoteItemForm {
  name: string
  description?: string
  quantity: number
  unitPrice: number
  isOptional?: boolean
  isEditable?: boolean
}

// Dashboard Types
export interface DashboardStats {
  totalQuotes: number
  totalCustomers: number
  totalRevenue: number
  conversionRate: number
  recentQuotes: Quote[]
  recentCustomers: Customer[]
}

// Search and Filter Types
export interface QuoteFilters {
  status?: QuoteStatus
  customerId?: string
  dateFrom?: string
  dateTo?: string
  search?: string
}

export interface CustomerFilters {
  search?: string
  city?: string
  hasQuotes?: boolean
}

// Notification Types
export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  createdAt: string
}

// File Upload Types
export interface FileUpload {
  id: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  url: string
  uploadedAt: string
} 