import { PrismaClient, UserRole, QuoteStatus, CustomerStatus, InteractionAction } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create organization
  const organization = await prisma.organization.upsert({
    where: { slug: 'demo-company' },
    update: {},
    create: {
      name: 'Demo Company Ltd',
      slug: 'demo-company',
      email: 'hello@democompany.co.nz',
      phone: '+64 9 123 4567',
      website: 'https://democompany.co.nz',
      address: '123 Queen Street, Auckland 1010, New Zealand',
      nzBusinessNumber: '9429046731234',
      gstNumber: '123-456-789',
      primaryColor: '#1f2937',
      secondaryColor: '#3b82f6',
    },
  });

  // Create admin user
  const adminPassword = await hash('password123', 12);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@democompany.co.nz' },
    update: {},
    create: {
      email: 'admin@democompany.co.nz',
      password: adminPassword,
      name: 'John Smith',
      phone: '+64 21 123 456',
      status: 'ACTIVE',
      emailVerified: true,
    },
  });

  // Create member user
  const memberPassword = await hash('password123', 12);
  const memberUser = await prisma.user.upsert({
    where: { email: 'member@democompany.co.nz' },
    update: {},
    create: {
      email: 'member@democompany.co.nz',
      password: memberPassword,
      name: 'Jane Doe',
      phone: '+64 21 987 654',
      status: 'ACTIVE',
      emailVerified: true,
    },
  });

  // Create user-organization relationships
  await prisma.userOrganization.upsert({
    where: {
      userId_organizationId: {
        userId: adminUser.id,
        organizationId: organization.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      organizationId: organization.id,
      role: UserRole.OWNER,
    },
  });

  await prisma.userOrganization.upsert({
    where: {
      userId_organizationId: {
        userId: memberUser.id,
        organizationId: organization.id,
      },
    },
    update: {},
    create: {
      userId: memberUser.id,
      organizationId: organization.id,
      role: UserRole.MEMBER,
    },
  });

  // Create categories
  const webDevCategory = await prisma.category.create({
    data: {
      organizationId: organization.id,
      name: 'Web Development',
      description: 'Website and web application development services',
      color: '#3b82f6',
      icon: 'globe',
      sortOrder: 1,
    },
  });

  const mobileCategory = await prisma.category.create({
    data: {
      organizationId: organization.id,
      name: 'Mobile Development',
      description: 'Mobile app development services',
      color: '#10b981',
      icon: 'smartphone',
      sortOrder: 2,
    },
  });

  const designCategory = await prisma.category.create({
    data: {
      organizationId: organization.id,
      name: 'Design Services',
      description: 'UI/UX design and graphic design services',
      color: '#f59e0b',
      icon: 'palette',
      sortOrder: 3,
    },
  });

  // Create products
  const websiteProduct = await prisma.product.create({
    data: {
      organizationId: organization.id,
      name: 'Custom Website',
      description: 'Professional custom website development',
      sku: 'WEB-001',
      price: 2500.00,
      cost: 1500.00,
      categoryId: webDevCategory.id,
      unit: 'project',
      taxRate: 0.15,
      createdBy: adminUser.id,
    },
  });

  const mobileAppProduct = await prisma.product.create({
    data: {
      organizationId: organization.id,
      name: 'Mobile App Development',
      description: 'Cross-platform mobile application development',
      sku: 'MOB-001',
      price: 5000.00,
      cost: 3000.00,
      categoryId: mobileCategory.id,
      unit: 'project',
      taxRate: 0.15,
      createdBy: adminUser.id,
    },
  });

  // Create services
  const consultingService = await prisma.service.create({
    data: {
      organizationId: organization.id,
      name: 'IT Consulting',
      description: 'Professional IT consulting services',
      price: 150.00,
      hourlyRate: 150.00,
      categoryId: webDevCategory.id,
      taxRate: 0.15,
      createdBy: adminUser.id,
    },
  });

  const maintenanceService = await prisma.service.create({
    data: {
      organizationId: organization.id,
      name: 'Website Maintenance',
      description: 'Ongoing website maintenance and updates',
      price: 200.00,
      hourlyRate: 100.00,
      categoryId: webDevCategory.id,
      taxRate: 0.15,
      createdBy: adminUser.id,
    },
  });

  // Create customers
  const customer1 = await prisma.customer.create({
    data: {
      organizationId: organization.id,
      firstName: 'Alice',
      lastName: 'Johnson',
      email: 'alice@techstartup.co.nz',
      phone: '+64 21 111 222',
      companyName: 'Tech Startup Ltd',
      address: '456 Ponsonby Road, Auckland 1011, New Zealand',
      city: 'Auckland',
      postalCode: '1011',
      country: 'New Zealand',
      status: CustomerStatus.ACTIVE,
      tags: ['startup', 'tech', 'premium'],
      source: 'Website',
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      organizationId: organization.id,
      firstName: 'Bob',
      lastName: 'Wilson',
      email: 'bob@retailstore.co.nz',
      phone: '+64 21 333 444',
      companyName: 'Retail Store Ltd',
      address: '789 Dominion Road, Auckland 1024, New Zealand',
      city: 'Auckland',
      postalCode: '1024',
      country: 'New Zealand',
      status: CustomerStatus.LEAD,
      tags: ['retail', 'new'],
      source: 'Referral',
    },
  });

  // Create GST settings
  await prisma.gstSetting.create({
    data: {
      organizationId: organization.id,
      gstNumber: '123-456-789',
      gstRate: 0.15,
      isGstRegistered: true,
    },
  });

  // Create invoice sequence
  await prisma.invoiceSequence.create({
    data: {
      organizationId: organization.id,
      prefix: 'INV',
      currentNumber: 1,
      year: 2024,
    },
  });

  // Create templates
  await prisma.template.create({
    data: {
      organizationId: organization.id,
      name: 'Default Quote Template',
      description: 'Standard quote template with company branding',
      type: 'QUOTE',
      content: {
        header: {
          logo: true,
          companyInfo: true,
        },
        body: {
          items: true,
          totals: true,
          notes: true,
        },
        footer: {
          terms: true,
          contact: true,
        },
      },
      isActive: true,
      isDefault: true,
    },
  });

  // Create quotes
  const quote1 = await prisma.quote.create({
    data: {
      organizationId: organization.id,
      customerId: customer1.id,
      quoteNumber: 'QT-2024-0001',
      title: 'Website Development Project',
      description: 'Custom website development for Tech Startup Ltd',
      status: QuoteStatus.SENT,
      currency: 'NZD',
      subtotal: 2500.00,
      taxRate: 0.15,
      taxAmount: 375.00,
      totalAmount: 2875.00,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      termsConditions: 'Payment terms: 50% upfront, 50% upon completion. Valid for 30 days.',
      notes: 'This quote includes responsive design and basic SEO optimization.',
      tags: ['website', 'custom', 'responsive'],
      sentAt: new Date(),
      createdBy: adminUser.id,
    },
  });

  const quote2 = await prisma.quote.create({
    data: {
      organizationId: organization.id,
      customerId: customer2.id,
      quoteNumber: 'QT-2024-0002',
      title: 'Mobile App Development',
      description: 'Cross-platform mobile application for retail business',
      status: QuoteStatus.DRAFT,
      currency: 'NZD',
      subtotal: 5000.00,
      taxRate: 0.15,
      taxAmount: 750.00,
      totalAmount: 5750.00,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      termsConditions: 'Payment terms: 30% upfront, 40% at milestone, 30% upon completion.',
      notes: 'Includes both iOS and Android platforms with backend API development.',
      tags: ['mobile', 'app', 'cross-platform'],
      createdBy: memberUser.id,
    },
  });

  // Create quote items
  await prisma.quoteItem.create({
    data: {
      quoteId: quote1.id,
      name: 'Custom Website Development',
      description: 'Responsive website with modern design and basic SEO',
      quantity: 1,
      unitPrice: 2500.00,
      totalPrice: 2500.00,
      productId: websiteProduct.id,
      sortOrder: 1,
    },
  });

  await prisma.quoteItem.create({
    data: {
      quoteId: quote2.id,
      name: 'Mobile App Development',
      description: 'Cross-platform mobile application (iOS & Android)',
      quantity: 1,
      unitPrice: 4000.00,
      totalPrice: 4000.00,
      productId: mobileAppProduct.id,
      sortOrder: 1,
    },
  });

  await prisma.quoteItem.create({
    data: {
      quoteId: quote2.id,
      name: 'IT Consulting',
      description: 'Project planning and technical consultation',
      quantity: 10,
      unitPrice: 150.00,
      totalPrice: 1500.00,
      serviceId: consultingService.id,
      sortOrder: 2,
    },
  });

  // Create quote views
  await prisma.quoteView.create({
    data: {
      quoteId: quote1.id,
      viewerIp: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      country: 'New Zealand',
      city: 'Auckland',
      timeSpentSeconds: 120,
      isUnique: true,
    },
  });

  // Create quote interactions
  await prisma.quoteInteraction.create({
    data: {
      quoteId: quote1.id,
      customerId: customer1.id,
      action: InteractionAction.VIEWED,
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    },
  });

  // Create notifications
  await prisma.notification.create({
    data: {
      organizationId: organization.id,
      userId: adminUser.id,
      type: 'QUOTE_VIEWED',
      title: 'Quote Viewed',
      message: 'Quote QT-2024-0001 was viewed by the customer',
      data: { quoteId: quote1.id, customerId: customer1.id },
    },
  });

  // Create user activities
  await prisma.userActivity.create({
    data: {
      organizationId: organization.id,
      userId: adminUser.id,
      action: 'CREATE_QUOTE',
      description: 'Created quote QT-2024-0001 for Tech Startup Ltd',
      metadata: { quoteId: quote1.id, customerId: customer1.id },
      ipAddress: '192.168.1.1',
    },
  });

  await prisma.userActivity.create({
    data: {
      organizationId: organization.id,
      userId: memberUser.id,
      action: 'CREATE_QUOTE',
      description: 'Created quote QT-2024-0002 for Retail Store Ltd',
      metadata: { quoteId: quote2.id, customerId: customer2.id },
      ipAddress: '192.168.1.2',
    },
  });

  console.log('✅ Database seeding completed successfully!');
  console.log('');
  console.log('📊 Seeded Data Summary:');
  console.log(`   • Organization: ${organization.name}`);
  console.log(`   • Users: ${adminUser.email}, ${memberUser.email}`);
  console.log(`   • Categories: ${webDevCategory.name}, ${mobileCategory.name}, ${designCategory.name}`);
  console.log(`   • Products: ${websiteProduct.name}, ${mobileAppProduct.name}`);
  console.log(`   • Services: ${consultingService.name}, ${maintenanceService.name}`);
  console.log(`   • Customers: ${customer1.companyName}, ${customer2.companyName}`);
  console.log(`   • Quotes: ${quote1.quoteNumber}, ${quote2.quoteNumber}`);
  console.log('');
  console.log('🔑 Default Login Credentials:');
  console.log(`   • Admin: ${adminUser.email} / password123`);
  console.log(`   • Member: ${memberUser.email} / password123`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 