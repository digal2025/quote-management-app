# Quote Management App - NZ Market

A comprehensive quote management platform designed specifically for New Zealand businesses, freelancers, and service providers. This application streamlines the entire sales process from quote creation to deal closure with advanced features and NZ-specific compliance.

## 🚀 Features

### Core Features
- **One-Screen Quote Creation**: Streamlined interface for creating professional quotes
- **Interactive Quotes**: Real-time pricing updates and optional items
- **Customer Management**: Complete customer database with NZ address support
- **Template System**: Reusable quote templates with brand customization
- **Digital Signatures**: Touch device signature support with eSignature compliance
- **Analytics & Tracking**: Quote views, interactions, and conversion metrics

### NZ-Specific Features
- **GST Integration**: Automatic NZ GST calculations (15% default)
- **NZ Business Numbers**: Support for NZ business registration
- **Local Compliance**: Privacy Act 2020 compliance
- **NZ Currency**: Default NZD currency with proper formatting
- **Local Addresses**: NZ postal codes and address validation

### Advanced Features
- **Real-time Collaboration**: Live updates and customer interactions
- **Mobile Responsive**: Perfect experience across all devices
- **File Management**: Secure file storage with MinIO
- **Email Integration**: Professional email delivery with tracking
- **Team Management**: Multi-user access with role-based permissions

## 🏗️ Architecture

### Technology Stack
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Shadcn/ui
- **Backend**: Node.js, Express.js, TypeScript, Prisma ORM
- **Database**: PostgreSQL 15 with Redis caching
- **File Storage**: MinIO (S3-compatible)
- **Email**: Nodemailer with MailHog for development
- **Authentication**: JWT with refresh tokens
- **Real-time**: Socket.io for live updates

### Local Development Infrastructure
- **PostgreSQL**: Primary database
- **Redis**: Caching and sessions
- **MinIO**: File storage
- **MailHog**: Email testing
- **pgAdmin**: Database management

## 📋 Prerequisites

Before setting up the project, ensure you have the following installed:

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Docker Desktop** ([Download](https://www.docker.com/products/docker-desktop/))
- **Git** ([Download](https://git-scm.com/))

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd quote-management-app
```

### 2. Run the Setup Script
```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

This script will:
- Check system requirements
- Start Docker services (PostgreSQL, Redis, MinIO, MailHog)
- Install dependencies for both frontend and backend
- Set up database schema
- Create environment files
- Generate development scripts

### 3. Start Development Servers
```bash
./scripts/start.sh
```

### 4. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **MailHog**: http://localhost:8025
- **MinIO Console**: http://localhost:9001
- **pgAdmin**: http://localhost:5050

## 📁 Project Structure

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
│   └── init-scripts/
├── scripts/                 # Development scripts
├── docs/                    # Documentation
└── README.md
```

## 🔧 Development Commands

### Backend Commands
```bash
cd backend

# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server

# Database
npm run db:generate     # Generate Prisma client
npm run db:push         # Push schema to database
npm run db:migrate      # Run migrations
npm run db:studio       # Open Prisma Studio

# Testing
npm run test            # Run tests
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Run tests with coverage

# Code Quality
npm run lint            # Run ESLint
npm run lint:fix        # Fix ESLint issues
npm run format          # Format code with Prettier
```

### Frontend Commands
```bash
cd frontend

# Development
npm run dev             # Start development server
npm run build           # Build for production
npm run start           # Start production server

# Testing
npm run test            # Run tests
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Run tests with coverage

# Code Quality
npm run lint            # Run ESLint
npm run lint:fix        # Fix ESLint issues
npm run type-check      # TypeScript type checking

# Storybook
npm run storybook       # Start Storybook
npm run build-storybook # Build Storybook
```

### Docker Commands
```bash
# Start all services
cd docker
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Restart services
docker-compose restart
```

## 🌐 API Documentation

### Authentication Endpoints
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
GET    /api/auth/me
```

### Quote Endpoints
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

### Customer Endpoints
```
GET    /api/customers
POST   /api/customers
GET    /api/customers/:id
PUT    /api/customers/:id
DELETE /api/customers/:id
```

### Organization Endpoints
```
GET    /api/organizations
POST   /api/organizations
GET    /api/organizations/:id
PUT    /api/organizations/:id
DELETE /api/organizations/:id
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: User roles and permissions
- **Data Encryption**: AES-256 encryption for sensitive data
- **Input Validation**: Comprehensive input sanitization
- **Rate Limiting**: API rate limiting to prevent abuse
- **CORS Configuration**: Secure cross-origin requests
- **NZ Privacy Compliance**: Privacy Act 2020 compliance

## 📊 Database Schema

The application uses PostgreSQL with the following key tables:

- **users**: User accounts and authentication
- **organizations**: Business organizations
- **customers**: Customer database
- **quotes**: Quote management
- **quote_items**: Individual quote line items
- **quote_views**: Analytics and tracking
- **quote_interactions**: Customer interactions
- **gst_settings**: NZ GST configuration
- **templates**: Reusable quote templates

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm run test              # Unit tests
npm run test:integration  # Integration tests
npm run test:e2e          # End-to-end tests
```

### Frontend Testing
```bash
cd frontend
npm run test              # Unit tests
npm run test:e2e          # End-to-end tests with Playwright
```

### Test Coverage
```bash
# Backend coverage
cd backend && npm run test:coverage

# Frontend coverage
cd frontend && npm run test:coverage
```

## 📈 Monitoring & Analytics

### Application Metrics
- Quote conversion rates
- Customer engagement metrics
- System performance monitoring
- Error tracking and logging

### NZ Business Metrics
- GST reporting and compliance
- Business performance analytics
- Customer lifetime value
- Sales pipeline analysis

## 🚀 Deployment

### Local Development
The application is designed for local development with production readiness. All services run locally using Docker.

### Production Deployment
When ready for production:

1. **Environment Configuration**: Update environment variables for production
2. **Database Migration**: Run database migrations
3. **Build Applications**: Build both frontend and backend
4. **Deploy Services**: Deploy to your preferred hosting platform
5. **SSL Configuration**: Set up SSL certificates
6. **Monitoring**: Configure monitoring and logging

### Recommended Hosting (NZ Market)
- **AWS Sydney Region**: Low latency for NZ users
- **Google Cloud Platform**: Sydney region
- **Microsoft Azure**: Australia East region
- **Local NZ Providers**: Vultr, DigitalOcean

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- **Documentation**: Check the `/docs` folder
- **Issues**: Create an issue on GitHub
- **Email**: support@quoteapp.nz

## 🗺️ Roadmap

### Phase 1 (Months 1-3): MVP
- [x] Basic quote creation and management
- [x] Email delivery system
- [x] Simple analytics dashboard
- [x] Mobile-responsive design
- [x] Core integrations

### Phase 2 (Months 4-6): Enhanced Features
- [ ] Interactive quote elements
- [ ] Advanced analytics
- [ ] Team collaboration features
- [ ] Digital signatures
- [ ] Payment integration

### Phase 3 (Months 7-9): AI & Advanced Features
- [ ] AI-powered recommendations
- [ ] Predictive analytics
- [ ] Advanced integrations
- [ ] Mobile apps
- [ ] Advanced security features

### Phase 4 (Months 10-12): Enterprise Features
- [ ] Enterprise-grade security
- [ ] Advanced compliance
- [ ] White-label solutions
- [ ] API marketplace
- [ ] Advanced customization options

---

**Built with ❤️ for the NZ business community** 