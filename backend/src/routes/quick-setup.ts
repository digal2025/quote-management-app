import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();
const prisma = new PrismaClient();

// Ensure uploads directory exists
const uploadsDir = 'uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Get the original filename without extension
    const originalName = path.parse(file.originalname).name;
    const extension = path.extname(file.originalname);
    
    // Create a clean filename (remove special characters, spaces, etc.)
    const cleanName = originalName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    
    // Add timestamp to ensure uniqueness if needed
    const timestamp = Date.now();
    const filename = `${cleanName}_${timestamp}${extension}`;
    
    cb(null, filename);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Quick setup endpoint - handles both initial setup and updates
router.post('/', authenticateToken, upload.single('companyLogo'), async (req: Request, res: Response, next: NextFunction) => {
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
      timezone,
      currency,
      defaultSalesTax,
      taxDescription,
      itemPricing,
      quotePresentation,
      companyName,
      address,
      website,
      phone,
      gstNumber,
      gstRate
    } = req.body;

    // Validate required fields
    if (!companyName) {
      return res.status(400).json({
        success: false,
        message: 'Company name is required'
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

    // Handle file upload
    let logoUrl = userOrg.organization.logoUrl; // Keep existing logo if no new one uploaded
    let logoFilename = userOrg.organization.logoFilename; // Keep existing filename if no new one uploaded
    if ((req as any).file) {
      logoUrl = `/uploads/${(req as any).file.filename}`;
      logoFilename = (req as any).file.originalname; // Save the original filename
    }

    // Prepare settings object
    const currentSettings = userOrg.organization.settings as any || {};
    const updatedSettings = {
      ...currentSettings,
      defaultSalesTax: parseFloat(defaultSalesTax) || 15,
      taxDescription: taxDescription || 'GST',
      itemPricing: itemPricing || 'tax_exclusive',
      quotePresentation: quotePresentation || 'quote',
      gstRate: parseFloat(gstRate) || 15
    };

    // Update organization with quick setup data
    const updatedOrganization = await prisma.organization.update({
      where: { id: userOrg.organizationId },
      data: {
        name: companyName,
        logoUrl,
        logoFilename,
        address: address || null,
        phone: phone || null,
        email: user.email,
        website: website || null,
        timezone: timezone || 'Pacific/Auckland',
        currency: currency || 'NZD',
        nzBusinessNumber: gstNumber || null,
        settings: updatedSettings
      }
    });

    // Create or update GST settings
    const existingGstSetting = await prisma.gstSetting.findFirst({
      where: { organizationId: userOrg.organizationId }
    });

    if (existingGstSetting) {
      await prisma.gstSetting.update({
        where: { id: existingGstSetting.id },
        data: {
          gstNumber: gstNumber || null,
          gstRate: parseFloat(gstRate) || 15,
          isGstRegistered: !!gstNumber
        }
      });
    } else {
      await prisma.gstSetting.create({
        data: {
          organizationId: userOrg.organizationId,
          gstNumber: gstNumber || null,
          gstRate: parseFloat(gstRate) || 15,
          isGstRegistered: !!gstNumber
        }
      });
    }

    return res.json({
      success: true,
      message: 'Settings updated successfully',
      data: updatedOrganization
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET endpoint to retrieve current settings
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

    return res.json({
      success: true,
      data: userOrg.organization
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router; 