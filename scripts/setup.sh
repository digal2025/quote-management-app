#!/bin/bash

# Quote Management App - Local Development Setup Script
# This script sets up the complete local development environment

set -e

echo "🚀 Setting up Quote Management App - NZ Market"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
check_docker() {
    print_status "Checking Docker installation..."
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker Desktop first."
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        print_error "Docker is not running. Please start Docker Desktop."
        exit 1
    fi
    print_success "Docker is installed and running"
}

# Check if Node.js is installed
check_node() {
    print_status "Checking Node.js installation..."
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18+ is required. Current version: $(node -v)"
        exit 1
    fi
    print_success "Node.js $(node -v) is installed"
}

# Start Docker services
start_docker_services() {
    print_status "Starting Docker services..."
    cd docker
    
    # Stop any existing containers
    docker-compose down
    
    # Start services
    docker-compose up -d
    
    # Wait for services to be ready
    print_status "Waiting for services to be ready..."
    sleep 10
    
    cd ..
    print_success "Docker services started successfully"
}

# Setup backend
setup_backend() {
    print_status "Setting up backend..."
    cd backend
    
    # Install dependencies
    print_status "Installing backend dependencies..."
    npm install
    
    # Copy environment file
    if [ ! -f .env ]; then
        cp env.example .env
        print_success "Environment file created"
    else
        print_warning "Environment file already exists"
    fi
    
    # Generate Prisma client
    print_status "Generating Prisma client..."
    npx prisma generate
    
    # Push database schema
    print_status "Setting up database schema..."
    npx prisma db push
    
    cd ..
    print_success "Backend setup completed"
}

# Setup frontend
setup_frontend() {
    print_status "Setting up frontend..."
    cd frontend
    
    # Install dependencies
    print_status "Installing frontend dependencies..."
    npm install
    
    # Create environment file
    if [ ! -f .env.local ]; then
        cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
EOF
        print_success "Frontend environment file created"
    else
        print_warning "Frontend environment file already exists"
    fi
    
    cd ..
    print_success "Frontend setup completed"
}

# Create shared types
setup_shared() {
    print_status "Setting up shared types..."
    cd shared
    
    # Create types directory
    mkdir -p types
    
    # Create basic shared types
    cat > types/index.ts << EOF
// Shared types between frontend and backend

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  nzBusinessNumber?: string;
  gstNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  organizationId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  companyName?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Quote {
  id: string;
  organizationId: string;
  customerId: string;
  quoteNumber: string;
  title: string;
  description?: string;
  status: QuoteStatus;
  currency: string;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountPercentage: number;
  discountAmount: number;
  totalAmount: number;
  validUntil?: string;
  termsConditions?: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export enum QuoteStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  VIEWED = 'VIEWED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED'
}

export enum UserRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
  VIEWER = 'VIEWER'
}
EOF
    
    cd ..
    print_success "Shared types setup completed"
}

# Create development scripts
create_dev_scripts() {
    print_status "Creating development scripts..."
    
    # Create start script
    cat > scripts/start.sh << 'EOF'
#!/bin/bash

echo "🚀 Starting Quote Management App..."

# Start backend
echo "Starting backend..."
cd backend
npm run dev &
BACKEND_PID=$!

# Start frontend
echo "Starting frontend..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
EOF

    # Create stop script
    cat > scripts/stop.sh << 'EOF'
#!/bin/bash

echo "🛑 Stopping Quote Management App..."

# Kill backend and frontend processes
pkill -f "npm run dev" || true
pkill -f "next dev" || true

echo "Services stopped"
EOF

    # Make scripts executable
    chmod +x scripts/start.sh
    chmod +x scripts/stop.sh
    
    print_success "Development scripts created"
}

# Display service URLs
show_service_urls() {
    echo ""
    echo "🎉 Setup completed successfully!"
    echo "=============================================="
    echo ""
    echo "Services are running at:"
    echo "  📱 Frontend:     http://localhost:3000"
    echo "  🔧 Backend API:  http://localhost:3001"
    echo "  🗄️  Database:     localhost:5432"
    echo "  📧 MailHog:      http://localhost:8025"
    echo "  📁 MinIO:        http://localhost:9001"
    echo "  🗃️  pgAdmin:      http://localhost:5050"
    echo ""
    echo "Development commands:"
    echo "  🚀 Start all:    ./scripts/start.sh"
    echo "  🛑 Stop all:     ./scripts/stop.sh"
    echo "  📊 DB Studio:    cd backend && npm run db:studio"
    echo ""
    echo "Next steps:"
    echo "  1. Open http://localhost:3000 in your browser"
    echo "  2. Create your first organization"
    echo "  3. Start building quotes!"
    echo ""
}

# Main setup function
main() {
    check_docker
    check_node
    start_docker_services
    setup_backend
    setup_frontend
    setup_shared
    create_dev_scripts
    show_service_urls
}

# Run main function
main 