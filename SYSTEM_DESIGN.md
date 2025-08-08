# System Design Document
## Interactive Quote Management App - NZ Market

### 1. System Overview

**Target Market**: New Zealand businesses, freelancers, and service providers
**Deployment Strategy**: Local development with production deployment readiness
**Scale**: Designed for NZ market with potential for expansion

---

### 2. Architecture Overview

#### 2.1 High-Level Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Database      │
│   (React/Next)  │◄──►│   (Node.js)     │◄──►│   (PostgreSQL)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         └──────────────►│   File Storage  │◄─────────────┘
                        │   (Local/Cloud) │
                        └─────────────────┘
```

#### 2.2 Technology Stack

**Frontend**:
- Next.js 14 (React framework)
- TypeScript
- Tailwind CSS
- Shadcn/ui components
- React Hook Form
- Zustand (state management)

**Backend**:
- Node.js with Express.js
- TypeScript
- Prisma ORM
- JWT authentication
- Multer (file uploads)
- Nodemailer (email)

**Database**:
- PostgreSQL (primary database)
- Redis (caching & sessions)
- MinIO (local file storage)

**Development Tools**:
- Docker & Docker Compose
- ESLint & Prettier
- Husky (git hooks)
- Jest (testing)
- Storybook (component library)

---

### 3. Local Development Infrastructure

#### 3.1 Development Environment Setup

**Prerequisites**:
- Node.js 18+ 
- Docker Desktop
- Git
- VS Code (recommended)

**Local Services**:
- PostgreSQL 15
- Redis 7
- MinIO (S3-compatible storage)
- MailHog (email testing)

#### 3.2 Project Structure
```
quote-management-app/
├── frontend/                 # Next.js application
│   ├── src/
│   │   ├── app/             # App router pages
│   │   ├── components/      # Reusable components
│   │   ├── lib/            # Utilities and configs
│   │   ├── hooks/          # Custom React hooks
│   │   ├── stores/         # Zustand stores
│   │   └── types/          # TypeScript types
│   ├── public/             # Static assets
│   └── package.json
├── backend/                 # Node.js API
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Express middleware
│   │   ├── models/         # Prisma models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Utilities
│   │   └── types/          # TypeScript types
│   ├── prisma/             # Database schema
│   └── package.json
├── shared/                  # Shared types and utilities
│   ├── types/
│   └── utils/
├── docker/                  # Docker configurations
│   ├── docker-compose.yml
│   ├── Dockerfile.frontend
│   ├── Dockerfile.backend
│   └── nginx/
├── scripts/                 # Development scripts
├── docs/                    # Documentation
└── README.md
```

---

### 4. Database Design

#### 4.1 Core Entities

**Users & Organizations**:
```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Organizations table
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  logo_url TEXT,
  primary_color VARCHAR(7),
  secondary_color VARCHAR(7),
  address TEXT,
  phone VARCHAR(20),
  email VARCHAR(255),
  website VARCHAR(255),
  nz_business_number VARCHAR(20),
  gst_number VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- User-Organization relationships
CREATE TABLE user_organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  organization_id UUID REFERENCES organizations(id),
  role VARCHAR(50) NOT NULL, -- owner, admin, member, viewer
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, organization_id)
);
```

**Quotes & Items**:
```sql
-- Quotes table
CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  customer_id UUID REFERENCES customers(id),
  quote_number VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'draft', -- draft, sent, viewed, accepted, rejected, expired
  currency VARCHAR(3) DEFAULT 'NZD',
  subtotal DECIMAL(10,2) DEFAULT 0,
  tax_rate DECIMAL(5,2) DEFAULT 0.15, -- NZ GST rate
  tax_amount DECIMAL(10,2) DEFAULT 0,
  discount_percentage DECIMAL(5,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) DEFAULT 0,
  valid_until DATE,
  terms_conditions TEXT,
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Quote items table
CREATE TABLE quote_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID REFERENCES quotes(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  quantity DECIMAL(10,2) DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  is_optional BOOLEAN DEFAULT false,
  is_editable BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Customers table
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  company_name VARCHAR(255),
  address TEXT,
  city VARCHAR(100),
  postal_code VARCHAR(10),
  country VARCHAR(100) DEFAULT 'New Zealand',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Interactions & Analytics**:
```sql
-- Quote views tracking
CREATE TABLE quote_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID REFERENCES quotes(id),
  viewer_ip VARCHAR(45),
  user_agent TEXT,
  viewed_at TIMESTAMP DEFAULT NOW(),
  time_spent_seconds INTEGER
);

-- Quote interactions
CREATE TABLE quote_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID REFERENCES quotes(id),
  customer_id UUID REFERENCES customers(id),
  action VARCHAR(50) NOT NULL, -- viewed, downloaded, shared, accepted, rejected
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Comments and discussions
CREATE TABLE quote_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID REFERENCES quotes(id),
  user_id UUID REFERENCES users(id),
  customer_id UUID REFERENCES customers(id),
  content TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false,
  parent_id UUID REFERENCES quote_comments(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 4.2 NZ-Specific Features

**Tax & Compliance**:
```sql
-- NZ GST settings
CREATE TABLE gst_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  gst_number VARCHAR(20),
  gst_rate DECIMAL(5,2) DEFAULT 0.15,
  is_gst_registered BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Invoice numbering (NZ requirements)
CREATE TABLE invoice_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  prefix VARCHAR(10) DEFAULT 'INV',
  current_number INTEGER DEFAULT 1,
  year INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

### 5. API Design

#### 5.1 RESTful Endpoints

**Authentication**:
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
GET    /api/auth/me
```

**Organizations**:
```
GET    /api/organizations
POST   /api/organizations
GET    /api/organizations/:id
PUT    /api/organizations/:id
DELETE /api/organizations/:id
```

**Quotes**:
```
GET    /api/quotes
POST   /api/quotes
GET    /api/quotes/:id
PUT    /api/quotes/:id
DELETE /api/quotes/:id
POST   /api/quotes/:id/send
POST   /api/quotes/:id/accept
POST   /api/quotes/:id/reject
GET    /api/quotes/:id/analytics
```

**Customers**:
```
GET    /api/customers
POST   /api/customers
GET    /api/customers/:id
PUT    /api/customers/:id
DELETE /api/customers/:id
```

**Templates**:
```
GET    /api/templates
POST   /api/templates
GET    /api/templates/:id
PUT    /api/templates/:id
DELETE /api/templates/:id
```

#### 5.2 WebSocket Events

**Real-time Features**:
```typescript
// Quote updates
'quote:updated' - When quote is modified
'quote:viewed' - When customer views quote
'quote:accepted' - When quote is accepted
'quote:rejected' - When quote is rejected

// Comments
'comment:added' - New comment added
'comment:updated' - Comment updated

// Notifications
'notification:new' - New notification
```

---

### 6. Security Design

#### 6.1 Authentication & Authorization
- JWT tokens with refresh mechanism
- Role-based access control (RBAC)
- Organization-level data isolation
- Rate limiting on API endpoints
- CORS configuration for local development

#### 6.2 Data Protection
- Password hashing with bcrypt
- Input validation and sanitization
- SQL injection prevention with Prisma
- XSS protection
- CSRF tokens for forms

#### 6.3 NZ Compliance
- Privacy Act 2020 compliance
- Data localization (NZ-based storage)
- Audit logging for data access
- Right to be forgotten implementation

---

### 7. Performance Considerations

#### 7.1 Caching Strategy
- Redis for session storage
- API response caching
- Static asset caching
- Database query optimization

#### 7.2 Database Optimization
- Proper indexing on frequently queried fields
- Connection pooling
- Query optimization with Prisma
- Regular database maintenance

#### 7.3 Frontend Performance
- Code splitting and lazy loading
- Image optimization
- Bundle size optimization
- Service worker for offline capabilities

---

### 8. Local Development Setup

#### 8.1 Docker Compose Configuration
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: quote_app
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  minio:
    image: minio/minio
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - minio_data:/data

  mailhog:
    image: mailhog/mailhog
    ports:
      - "1025:1025"
      - "8025:8025"

volumes:
  postgres_data:
  redis_data:
  minio_data:
```

#### 8.2 Environment Configuration
```bash
# .env.local
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/quote_app"
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-super-secret-refresh-key"

# File Storage
MINIO_ENDPOINT="localhost"
MINIO_PORT=9000
MINIO_ACCESS_KEY="minioadmin"
MINIO_SECRET_KEY="minioadmin"
MINIO_BUCKET="quotes"

# Email (MailHog for local)
SMTP_HOST="localhost"
SMTP_PORT=1025
SMTP_USER=""
SMTP_PASS=""

# App
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

### 9. Development Workflow

#### 9.1 Git Workflow
- Feature branch workflow
- Conventional commits
- Pre-commit hooks with Husky
- Automated testing on pull requests

#### 9.2 Code Quality
- ESLint configuration
- Prettier formatting
- TypeScript strict mode
- Unit and integration tests
- Storybook for component development

#### 9.3 Testing Strategy
- Jest for unit testing
- Supertest for API testing
- Playwright for E2E testing
- Component testing with React Testing Library

---

### 10. Deployment Readiness

#### 10.1 Production Considerations
- Environment-specific configurations
- Health check endpoints
- Logging and monitoring
- Backup strategies
- SSL/TLS configuration

#### 10.2 NZ Hosting Options
- AWS Sydney region
- Google Cloud Platform (Sydney)
- Microsoft Azure (Australia East)
- Local NZ providers (Vultr, DigitalOcean)

#### 10.3 CI/CD Pipeline
- GitHub Actions for automation
- Docker image building
- Automated testing
- Staging environment deployment
- Production deployment with approval

---

### 11. Monitoring & Analytics

#### 11.1 Application Monitoring
- Error tracking (Sentry)
- Performance monitoring
- User analytics
- Business metrics tracking

#### 11.2 NZ-Specific Metrics
- GST reporting
- Business performance analytics
- Customer engagement metrics
- Quote conversion rates

---

### 12. Future Scalability

#### 12.1 Horizontal Scaling
- Load balancer configuration
- Database read replicas
- CDN for static assets
- Microservices architecture

#### 12.2 Feature Expansion
- Multi-currency support
- Advanced reporting
- Mobile app development
- API marketplace
- White-label solutions

This system design provides a solid foundation for local development while maintaining production readiness for the NZ market. 