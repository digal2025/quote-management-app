import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get all customers for the authenticated user's organization
router.get('/', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authenticatedReq = req as AuthenticatedRequest;
    const user = authenticatedReq.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Get user's organization
    const userOrg = await prisma.userOrganization.findFirst({
      where: { userId: user.id },
      include: { organization: true }
    });

    if (!userOrg) {
      return res.status(400).json({
        success: false,
        message: 'User not associated with any organization'
      });
    }

    const customers = await prisma.customer.findMany({
      where: { organizationId: userOrg.organizationId },
      orderBy: { createdAt: 'desc' }
    });

    return res.json({
      success: true,
      data: customers
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create a new customer
router.post('/', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authenticatedReq = req as AuthenticatedRequest;
    const user = authenticatedReq.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const {
      firstName,
      lastName,
      email,
      phone,
      companyName,
      address,
      city,
      postalCode,
      country,
      notes
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email) {
      return res.status(400).json({
        success: false,
        message: 'First name, last name, and email are required'
      });
    }

    // Get user's organization
    const userOrg = await prisma.userOrganization.findFirst({
      where: { userId: user.id },
      include: { organization: true }
    });

    if (!userOrg) {
      return res.status(400).json({
        success: false,
        message: 'User not associated with any organization'
      });
    }

    // Check if customer with same email already exists in the organization
    const existingCustomer = await prisma.customer.findFirst({
      where: {
        email,
        organizationId: userOrg.organizationId
      }
    });

    if (existingCustomer) {
      return res.status(400).json({
        success: false,
        message: 'Customer with this email already exists'
      });
    }

    // Create the customer
    const customer = await prisma.customer.create({
      data: {
        organizationId: userOrg.organizationId,
        firstName,
        lastName,
        email,
        phone,
        companyName,
        address,
        city,
        postalCode,
        country: country || 'New Zealand',
        notes
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      data: customer
    });
  } catch (error) {
    console.error('Error creating customer:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get a specific customer by ID
router.get('/:id', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authenticatedReq = req as AuthenticatedRequest;
    const user = authenticatedReq.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const { id } = req.params;

    // Get user's organization
    const userOrg = await prisma.userOrganization.findFirst({
      where: { userId: user.id },
      include: { organization: true }
    });

    if (!userOrg) {
      return res.status(400).json({
        success: false,
        message: 'User not associated with any organization'
      });
    }

    const customer = await prisma.customer.findFirst({
      where: {
        id,
        organizationId: userOrg.organizationId
      }
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    return res.json({
      success: true,
      data: customer
    });
  } catch (error) {
    console.error('Error fetching customer:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update a customer
router.put('/:id', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authenticatedReq = req as AuthenticatedRequest;
    const user = authenticatedReq.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const { id } = req.params;
    const updateData = req.body;

    // Get user's organization
    const userOrg = await prisma.userOrganization.findFirst({
      where: { userId: user.id },
      include: { organization: true }
    });

    if (!userOrg) {
      return res.status(400).json({
        success: false,
        message: 'User not associated with any organization'
      });
    }

    // Check if customer exists and belongs to user's organization
    const existingCustomer = await prisma.customer.findFirst({
      where: {
        id,
        organizationId: userOrg.organizationId
      }
    });

    if (!existingCustomer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Update the customer
    const updatedCustomer = await prisma.customer.update({
      where: { id },
      data: updateData
    });

    return res.json({
      success: true,
      message: 'Customer updated successfully',
      data: updatedCustomer
    });
  } catch (error) {
    console.error('Error updating customer:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete a customer
router.delete('/:id', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authenticatedReq = req as AuthenticatedRequest;
    const user = authenticatedReq.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const { id } = req.params;

    // Get user's organization
    const userOrg = await prisma.userOrganization.findFirst({
      where: { userId: user.id },
      include: { organization: true }
    });

    if (!userOrg) {
      return res.status(400).json({
        success: false,
        message: 'User not associated with any organization'
      });
    }

    // Check if customer exists and belongs to user's organization
    const existingCustomer = await prisma.customer.findFirst({
      where: {
        id,
        organizationId: userOrg.organizationId
      }
    });

    if (!existingCustomer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Check if customer has any quotes
    const customerQuotes = await prisma.quote.findFirst({
      where: { customerId: id }
    });

    if (customerQuotes) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete customer with existing quotes'
      });
    }

    // Delete the customer
    await prisma.customer.delete({
      where: { id }
    });

    return res.json({
      success: true,
      message: 'Customer deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting customer:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router; 