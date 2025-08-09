import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Helper function to convert number to Prisma Decimal
const toDecimal = (value: number | string): Prisma.Decimal => {
  return new Prisma.Decimal(value.toString());
};

// Get all quotes for the authenticated user's organization
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

    const quotes = await prisma.quote.findMany({
      where: { organizationId: userOrg.organizationId },
      include: {
        customer: true,
        items: true,
        creator: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json({
      success: true,
      data: quotes
    });
  } catch (error) {
    console.error('Error fetching quotes:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create a new quote
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
      title,
      description,
      customerId,
      items,
      textItems,
      validUntil,
      termsConditions,
      notes,
      status,
      privateNote,
      currency,
      subtotal,
      taxRate,
      taxAmount,
      totalAmount
    } = req.body;

    // Validate required fields
    if (!title || !customerId || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Title, customer, and at least one item are required'
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

    // Validate that the customer exists and belongs to the user's organization
    const customer = await prisma.customer.findFirst({
      where: {
        id: customerId,
        organizationId: userOrg.organizationId
      }
    });

    if (!customer) {
      return res.status(400).json({
        success: false,
        message: 'Customer not found or does not belong to your organization'
      });
    }

    // Generate quote number
    const quoteNumber = `QT-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

    // Calculate totals if not provided
    const calculatedSubtotal = subtotal || items.reduce((sum: number, item: any) => {
      return sum + (Number(item.quantity) * Number(item.unitPrice));
    }, 0);

    const calculatedTaxRate = taxRate || 0.15; // NZ GST rate
    const calculatedTaxAmount = taxAmount || (calculatedSubtotal * calculatedTaxRate);
    const calculatedTotalAmount = totalAmount || (calculatedSubtotal + calculatedTaxAmount);

    // Create quote with items in a transaction
    let result;
    try {
      result = await prisma.$transaction(async (tx) => {
        // Create the quote
        const quote = await tx.quote.create({
          data: {
            organizationId: userOrg.organizationId,
            customerId,
            quoteNumber,
            title,
            description,
            status: (status || 'DRAFT').toUpperCase() as any,
            currency: currency || 'NZD',
            subtotal: toDecimal(calculatedSubtotal),
            taxRate: toDecimal(calculatedTaxRate),
            taxAmount: toDecimal(calculatedTaxAmount),
            discountPercentage: toDecimal(0),
            discountAmount: toDecimal(0),
            totalAmount: toDecimal(calculatedTotalAmount),
            validUntil: validUntil ? new Date(validUntil) : null,
            termsConditions,
            notes,
            tags: [],
            createdBy: user.id
          }
        });

        // Create quote items
        const quoteItems = await Promise.all(
          items.map((item: any, index: number) =>
            tx.quoteItem.create({
              data: {
                quoteId: quote.id,
                name: item.name,
                description: item.description || '',
                quantity: toDecimal(Number(item.quantity || 1)),
                unitPrice: toDecimal(Number(item.unitPrice || 0)),
                totalPrice: toDecimal((Number(item.quantity || 1) * Number(item.unitPrice || 0))),
                isOptional: item.isOptional || false,
                isEditable: item.isEditable !== false,
                sortOrder: index,
                metadata: {}
              }
            })
          )
        );

        // Create text items as special quote items
        const textQuoteItems = await Promise.all(
          (textItems || []).map((textItem: any, index: number) =>
            tx.quoteItem.create({
              data: {
                quoteId: quote.id,
                name: textItem.heading || 'Text Item',
                description: textItem.description || '',
                quantity: toDecimal(1),
                unitPrice: toDecimal(0),
                totalPrice: toDecimal(0),
                isOptional: false,
                isEditable: true,
                sortOrder: items.length + index,
                metadata: {
                  type: 'text',
                  heading: textItem.heading || '',
                  description: textItem.description || ''
                }
              }
            })
          )
        );

        return { quote, items: [...quoteItems, ...textQuoteItems] };
      });
    } catch (transactionError) {
      console.error('Transaction error:', transactionError);
      throw transactionError;
    }

    return res.status(201).json({
      success: true,
      message: 'Quote created successfully',
      data: result.quote
    });
  } catch (error) {
    console.error('Error creating quote:', error);
    console.error('Request body:', req.body);
    const authenticatedReq = req as AuthenticatedRequest;
    console.error('User:', authenticatedReq.user?.id);
    
    // Check if it's a Prisma error
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get a specific quote by ID
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

    const quote = await prisma.quote.findFirst({
      where: {
        id,
        organizationId: userOrg.organizationId
      },
      include: {
        customer: true,
        items: true,
        creator: true
      }
    });

    if (!quote) {
      return res.status(404).json({
        success: false,
        message: 'Quote not found'
      });
    }

    return res.json({
      success: true,
      data: quote
    });
  } catch (error) {
    console.error('Error fetching quote:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update a quote
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

    // Check if quote exists and belongs to user's organization
    const existingQuote = await prisma.quote.findFirst({
      where: {
        id,
        organizationId: userOrg.organizationId
      }
    });

    if (!existingQuote) {
      return res.status(404).json({
        success: false,
        message: 'Quote not found'
      });
    }

    // Update the quote
    const updatedQuote = await prisma.quote.update({
      where: { id },
      data: updateData,
      include: {
        customer: true,
        items: true,
        creator: true
      }
    });

    return res.json({
      success: true,
      message: 'Quote updated successfully',
      data: updatedQuote
    });
  } catch (error) {
    console.error('Error updating quote:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete a quote
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

    // Check if quote exists and belongs to user's organization
    const existingQuote = await prisma.quote.findFirst({
      where: {
        id,
        organizationId: userOrg.organizationId
      }
    });

    if (!existingQuote) {
      return res.status(404).json({
        success: false,
        message: 'Quote not found'
      });
    }

    // Delete the quote (this will cascade delete items)
    await prisma.quote.delete({
      where: { id }
    });

    return res.json({
      success: true,
      message: 'Quote deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting quote:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router; 