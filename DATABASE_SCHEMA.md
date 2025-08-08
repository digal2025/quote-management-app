# Database Schema Documentation

## Overview

This document describes the comprehensive database schema for the Quote Management App, designed specifically for the New Zealand market. The schema covers all features found in QuotientApp and additional competitive features.

## Database Technology

- **Database**: PostgreSQL 15
- **ORM**: Prisma
- **Connection**: Local PostgreSQL instance via Docker

## Core Models

### 1. User Management

#### User
```sql
- id: UUID (Primary Key)
- email: String (Unique)
- passwordHash: String
- firstName: String
- lastName: String
- phone: String?
- avatarUrl: String?
- isActive: Boolean
- emailVerified: Boolean
- lastLoginAt: DateTime?
- preferences: JSON?
- createdAt: DateTime
- updatedAt: DateTime
```

#### Organization
```sql
- id: UUID (Primary Key)
- name: String
- slug: String (Unique)
- logoUrl: String?
- primaryColor: String?
- secondaryColor: String?
- address: String?
- phone: String?
- email: String?
- website: String?
- nzBusinessNumber: String?
- gstNumber: String?
- timezone: String (Default: Pacific/Auckland)
- currency: String (Default: NZD)
- language: String (Default: en)
- settings: JSON?
- createdAt: DateTime
- updatedAt: DateTime
```

#### UserOrganization (Many-to-Many)
```sql
- id: UUID (Primary Key)
- userId: UUID (Foreign Key)
- organizationId: UUID (Foreign Key)
- role: UserRole (OWNER, ADMIN, MEMBER, VIEWER)
- permissions: JSON?
- createdAt: DateTime
```

### 2. Customer Management

#### Customer
```sql
- id: UUID (Primary Key)
- organizationId: UUID (Foreign Key)
- firstName: String
- lastName: String
- email: String
- phone: String?
- companyName: String?
- address: String?
- city: String?
- postalCode: String?
- country: String (Default: New Zealand)
- notes: String?
- tags: String[]
- source: String?
- status: CustomerStatus (ACTIVE, INACTIVE, LEAD, PROSPECT)
- totalSpent: Decimal
- lastContactAt: DateTime?
- createdAt: DateTime
- updatedAt: DateTime
```

### 3. Product & Service Management

#### Category
```sql
- id: UUID (Primary Key)
- organizationId: UUID (Foreign Key)
- name: String
- description: String?
- color: String?
- icon: String?
- isActive: Boolean
- sortOrder: Int
- createdAt: DateTime
- updatedAt: DateTime
```

#### Product
```sql
- id: UUID (Primary Key)
- organizationId: UUID (Foreign Key)
- name: String
- description: String?
- sku: String? (Unique)
- price: Decimal
- cost: Decimal?
- categoryId: UUID? (Foreign Key)
- isActive: Boolean
- stockQuantity: Int?
- unit: String (Default: piece)
- taxRate: Decimal (Default: 0.15)
- imageUrl: String?
- metadata: JSON?
- createdBy: UUID (Foreign Key)
- createdAt: DateTime
- updatedAt: DateTime
```

#### Service
```sql
- id: UUID (Primary Key)
- organizationId: UUID (Foreign Key)
- name: String
- description: String?
- price: Decimal
- hourlyRate: Decimal?
- categoryId: UUID? (Foreign Key)
- isActive: Boolean
- taxRate: Decimal (Default: 0.15)
- imageUrl: String?
- metadata: JSON?
- createdBy: UUID (Foreign Key)
- createdAt: DateTime
- updatedAt: DateTime
```

### 4. Quote Management

#### Quote
```sql
- id: UUID (Primary Key)
- organizationId: UUID (Foreign Key)
- customerId: UUID (Foreign Key)
- quoteNumber: String (Unique)
- title: String
- description: String?
- status: QuoteStatus (DRAFT, SENT, VIEWED, ACCEPTED, REJECTED, EXPIRED, CANCELLED)
- currency: String (Default: NZD)
- subtotal: Decimal
- taxRate: Decimal (Default: 0.15)
- taxAmount: Decimal
- discountPercentage: Decimal
- discountAmount: Decimal
- totalAmount: Decimal
- validUntil: DateTime?
- termsConditions: String?
- notes: String?
- tags: String[]
- isPublic: Boolean
- publicUrl: String?
- sentAt: DateTime?
- viewedAt: DateTime?
- acceptedAt: DateTime?
- rejectedAt: DateTime?
- createdBy: UUID (Foreign Key)
- createdAt: DateTime
- updatedAt: DateTime
```

#### QuoteItem
```sql
- id: UUID (Primary Key)
- quoteId: UUID (Foreign Key)
- name: String
- description: String?
- quantity: Decimal
- unitPrice: Decimal
- totalPrice: Decimal
- isOptional: Boolean
- isEditable: Boolean
- sortOrder: Int
- productId: UUID? (Foreign Key)
- serviceId: UUID? (Foreign Key)
- metadata: JSON?
- createdAt: DateTime
```

### 5. Analytics & Tracking

#### QuoteView
```sql
- id: UUID (Primary Key)
- quoteId: UUID (Foreign Key)
- viewerIp: String?
- userAgent: String?
- referrer: String?
- country: String?
- city: String?
- viewedAt: DateTime
- timeSpentSeconds: Int?
- isUnique: Boolean
```

#### QuoteInteraction
```sql
- id: UUID (Primary Key)
- quoteId: UUID (Foreign Key)
- customerId: UUID? (Foreign Key)
- userId: UUID? (Foreign Key)
- action: InteractionAction (VIEWED, DOWNLOADED, SHARED, ACCEPTED, REJECTED, PRINTED, EMAILED)
- metadata: JSON?
- ipAddress: String?
- userAgent: String?
- createdAt: DateTime
```

#### QuoteComment
```sql
- id: UUID (Primary Key)
- quoteId: UUID (Foreign Key)
- userId: UUID? (Foreign Key)
- customerId: UUID? (Foreign Key)
- content: String
- isInternal: Boolean
- parentId: UUID? (Foreign Key - Self-referencing)
- createdAt: DateTime
- updatedAt: DateTime
```

### 6. File Management

#### Attachment
```sql
- id: UUID (Primary Key)
- organizationId: UUID (Foreign Key)
- userId: UUID? (Foreign Key)
- quoteId: UUID? (Foreign Key)
- fileName: String
- originalName: String
- mimeType: String
- size: Int
- url: String
- bucket: String
- key: String
- isPublic: Boolean
- createdAt: DateTime
```

### 7. Notifications & Activity

#### Notification
```sql
- id: UUID (Primary Key)
- organizationId: UUID (Foreign Key)
- userId: UUID? (Foreign Key)
- customerId: UUID? (Foreign Key)
- type: NotificationType (QUOTE_VIEWED, QUOTE_ACCEPTED, QUOTE_REJECTED, QUOTE_EXPIRED, NEW_COMMENT, SYSTEM_ALERT)
- title: String
- message: String
- data: JSON?
- isRead: Boolean
- readAt: DateTime?
- createdAt: DateTime
```

#### UserActivity
```sql
- id: UUID (Primary Key)
- organizationId: UUID (Foreign Key)
- userId: UUID? (Foreign Key)
- customerId: UUID? (Foreign Key)
- quoteId: UUID? (Foreign Key)
- action: ActivityAction (LOGIN, LOGOUT, CREATE_QUOTE, UPDATE_QUOTE, DELETE_QUOTE, SEND_QUOTE, VIEW_QUOTE, ACCEPT_QUOTE, REJECT_QUOTE, CREATE_CUSTOMER, UPDATE_CUSTOMER, CREATE_PRODUCT, UPDATE_PRODUCT, CREATE_SERVICE, UPDATE_SERVICE)
- description: String
- metadata: JSON?
- ipAddress: String?
- userAgent: String?
- createdAt: DateTime
```

### 8. NZ-Specific Models

#### GstSetting
```sql
- id: UUID (Primary Key)
- organizationId: UUID (Foreign Key)
- gstNumber: String?
- gstRate: Decimal (Default: 0.15)
- isGstRegistered: Boolean
- createdAt: DateTime
```

#### InvoiceSequence
```sql
- id: UUID (Primary Key)
- organizationId: UUID (Foreign Key)
- prefix: String (Default: INV)
- currentNumber: Int
- year: Int
- createdAt: DateTime
```

### 9. Templates & Integrations

#### Template
```sql
- id: UUID (Primary Key)
- organizationId: UUID (Foreign Key)
- name: String
- description: String?
- type: TemplateType (QUOTE, INVOICE, EMAIL, TERMS_CONDITIONS, FOOTER, HEADER)
- content: JSON
- isActive: Boolean
- isDefault: Boolean
- createdAt: DateTime
- updatedAt: DateTime
```

#### Integration
```sql
- id: UUID (Primary Key)
- organizationId: UUID (Foreign Key)
- name: String
- type: IntegrationType (XERO, MYOB, QUICKBOOKS, STRIPE, PAYPAL, GOOGLE_ANALYTICS, MAILCHIMP, SLACK, ZAPIER)
- config: JSON
- isActive: Boolean
- lastSyncAt: DateTime?
- createdAt: DateTime
- updatedAt: DateTime
```

## Enums

### UserRole
- `OWNER` - Full access to organization
- `ADMIN` - Administrative access
- `MEMBER` - Standard user access
- `VIEWER` - Read-only access

### CustomerStatus
- `ACTIVE` - Active customer
- `INACTIVE` - Inactive customer
- `LEAD` - Potential customer
- `PROSPECT` - Qualified lead

### QuoteStatus
- `DRAFT` - Quote in draft mode
- `SENT` - Quote sent to customer
- `VIEWED` - Customer viewed the quote
- `ACCEPTED` - Customer accepted the quote
- `REJECTED` - Customer rejected the quote
- `EXPIRED` - Quote expired
- `CANCELLED` - Quote cancelled

### InteractionAction
- `VIEWED` - Quote was viewed
- `DOWNLOADED` - Quote was downloaded
- `SHARED` - Quote was shared
- `ACCEPTED` - Quote was accepted
- `REJECTED` - Quote was rejected
- `PRINTED` - Quote was printed
- `EMAILED` - Quote was emailed

### NotificationType
- `QUOTE_VIEWED` - Quote viewed notification
- `QUOTE_ACCEPTED` - Quote accepted notification
- `QUOTE_REJECTED` - Quote rejected notification
- `QUOTE_EXPIRED` - Quote expired notification
- `NEW_COMMENT` - New comment notification
- `SYSTEM_ALERT` - System alert notification

### ActivityAction
- `LOGIN` - User login
- `LOGOUT` - User logout
- `CREATE_QUOTE` - Quote created
- `UPDATE_QUOTE` - Quote updated
- `DELETE_QUOTE` - Quote deleted
- `SEND_QUOTE` - Quote sent
- `VIEW_QUOTE` - Quote viewed
- `ACCEPT_QUOTE` - Quote accepted
- `REJECT_QUOTE` - Quote rejected
- `CREATE_CUSTOMER` - Customer created
- `UPDATE_CUSTOMER` - Customer updated
- `CREATE_PRODUCT` - Product created
- `UPDATE_PRODUCT` - Product updated
- `CREATE_SERVICE` - Service created
- `UPDATE_SERVICE` - Service updated

### IntegrationType
- `XERO` - Xero accounting integration
- `MYOB` - MYOB accounting integration
- `QUICKBOOKS` - QuickBooks integration
- `STRIPE` - Stripe payment integration
- `PAYPAL` - PayPal payment integration
- `GOOGLE_ANALYTICS` - Google Analytics integration
- `MAILCHIMP` - Mailchimp email integration
- `SLACK` - Slack notification integration
- `ZAPIER` - Zapier automation integration

### TemplateType
- `QUOTE` - Quote template
- `INVOICE` - Invoice template
- `EMAIL` - Email template
- `TERMS_CONDITIONS` - Terms and conditions template
- `FOOTER` - Footer template
- `HEADER` - Header template

## Key Features Covered

### Core QuotientApp Features
1. **User & Organization Management** - Multi-tenant architecture
2. **Customer Management** - Complete CRM functionality
3. **Product & Service Catalog** - Inventory management
4. **Quote Creation & Management** - Full quote lifecycle
5. **Quote Analytics** - View tracking and interaction analytics
6. **Template System** - Customizable quote templates
7. **File Attachments** - Document management
8. **Comments & Collaboration** - Internal and external comments
9. **NZ GST Integration** - Automatic GST calculations
10. **Email Notifications** - Automated notifications

### Competitive Advantage Features
1. **Advanced Analytics** - Detailed user activity tracking
2. **Multi-level Permissions** - Granular access control
3. **Integration Framework** - Third-party integrations
4. **Public Quote Sharing** - Public quote URLs
5. **Tagging System** - Flexible categorization
6. **Activity Logging** - Complete audit trail
7. **Custom Fields** - JSON metadata for extensibility
8. **Multi-currency Support** - International expansion ready
9. **Timezone Support** - NZ-specific timezone handling
10. **Notification System** - Real-time notifications

## Database Relationships

### One-to-Many Relationships
- Organization → Users (via UserOrganization)
- Organization → Customers
- Organization → Quotes
- Organization → Products
- Organization → Services
- Organization → Categories
- User → Quotes (created by)
- User → Products (created by)
- User → Services (created by)
- Customer → Quotes
- Quote → QuoteItems
- Quote → QuoteViews
- Quote → QuoteInteractions
- Quote → QuoteComments
- Quote → Attachments
- Category → Products
- Category → Services
- Product → QuoteItems
- Service → QuoteItems

### Many-to-Many Relationships
- Users ↔ Organizations (via UserOrganization)

### Self-Referencing Relationships
- QuoteComment → QuoteComment (parent-child comments)

## Indexes & Performance

The schema includes automatic indexes on:
- Primary keys (UUID)
- Foreign keys
- Unique constraints (email, slug, quoteNumber, sku)
- Frequently queried fields (status, createdAt, organizationId)

## Data Seeding

The database comes pre-populated with:
- Demo organization
- Admin and member users
- Sample categories (Web Development, Mobile Development, Design Services)
- Sample products and services
- Sample customers
- Sample quotes with items
- GST settings for NZ
- Default templates

## Default Credentials

- **Admin**: `admin@democompany.co.nz` / `password123`
- **Member**: `member@democompany.co.nz` / `password123`

## Next Steps

1. **API Development** - Create RESTful endpoints for all models
2. **Authentication** - Implement JWT-based authentication
3. **File Upload** - Integrate with MinIO for file storage
4. **Email System** - Set up email notifications
5. **Real-time Updates** - Implement WebSocket connections
6. **Frontend Integration** - Connect frontend to API endpoints
7. **Testing** - Create comprehensive test suite
8. **Deployment** - Prepare for production deployment 