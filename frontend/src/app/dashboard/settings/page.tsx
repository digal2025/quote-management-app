'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, Building2, Globe, DollarSign, Settings, Save, CheckCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from 'react-hot-toast';

interface SettingsData {
  timezone: string;
  currency: string;
  defaultSalesTax: number;
  taxDescription: string;
  itemPricing: string;
  quotePresentation: string;
  companyLogo?: File;
  companyName: string;
  address: string;
  website: string;
  phone: string;
  gstNumber: string;
  gstRate: number;
}

const timezones = [
  { value: 'Pacific/Auckland', label: 'Pacific - Auckland' },
  { value: 'Pacific/Wellington', label: 'Pacific - Wellington' },
  { value: 'Asia/Kolkata', label: 'Asia - Kolkata' },
  { value: 'America/New_York', label: 'America - New York' },
  { value: 'America/Los_Angeles', label: 'America - Los Angeles' },
  { value: 'Europe/London', label: 'Europe - London' },
  { value: 'Europe/Paris', label: 'Europe - Paris' },
  { value: 'Asia/Tokyo', label: 'Asia - Tokyo' },
  { value: 'Asia/Shanghai', label: 'Asia - Shanghai' },
  { value: 'Australia/Sydney', label: 'Australia - Sydney' },
];

const currencies = [
  { value: 'NZD', label: 'NZD - New Zealand Dollar' },
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'AUD', label: 'AUD - Australian Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'GBP', label: 'GBP - British Pound' },
  { value: 'INR', label: 'INR - India Rupee' },
  { value: 'CAD', label: 'CAD - Canadian Dollar' },
];

const taxDescriptions = [
  { value: 'GST', label: 'GST' },
  { value: 'VAT', label: 'VAT' },
  { value: 'Sales Tax', label: 'Sales Tax' },
  { value: 'HST', label: 'HST' },
];

const itemPricingOptions = [
  { value: 'tax_exclusive', label: 'Tax Exclusive (Inclusive Total)' },
  { value: 'tax_inclusive', label: 'Tax Inclusive' },
];

const quotePresentationOptions = [
  { value: 'quote', label: 'Quote' },
  { value: 'proposal', label: 'Proposal' },
  { value: 'estimate', label: 'Estimate' },
];

export default function SettingsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [currentLogoUrl, setCurrentLogoUrl] = useState<string | null>(null);
  const [currentLogoFilename, setCurrentLogoFilename] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoUploaded, setLogoUploaded] = useState(false);
  const [formData, setFormData] = useState<SettingsData>({
    timezone: 'Pacific/Auckland',
    currency: 'NZD',
    defaultSalesTax: 15,
    taxDescription: 'GST',
    itemPricing: 'tax_exclusive',
    quotePresentation: 'quote',
    companyName: '',
    address: '',
    website: '',
    phone: '',
    gstNumber: '',
    gstRate: 15,
  });

  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const buildLogoUrl = (raw: string | null | undefined): string | null => {
    if (!raw) return null;
    const trimmed = String(raw).trim();
    if (/^https?:\/\//i.test(trimmed)) return trimmed; // absolute URL
    if (trimmed.startsWith('/')) return `${apiBase}${trimmed}`; // path from root
    return `${apiBase}/uploads/${trimmed}`; // bare filename
  };
  const extractFilename = (raw: string | null | undefined): string | null => {
    if (!raw) return null;
    const withoutQuery = raw.split('?')[0];
    const parts = withoutQuery.split('/');
    const last = parts[parts.length - 1];
    return last || null;
  };

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    // Load existing settings
    loadSettings();
  }, [router]);

  // Debug effect to monitor logo URL changes
  useEffect(() => {
    if (currentLogoUrl) {
      console.log('Logo URL changed:', currentLogoUrl);
      // Test if the image loads successfully
      const img = new Image();
      img.onload = () => {
        console.log('Logo image loaded successfully:', currentLogoUrl);
      };
      img.onerror = () => {
        console.error('Logo image failed to load:', currentLogoUrl);
      };
      img.src = currentLogoUrl;
    }
  }, [currentLogoUrl]);

  const loadSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiBase}/api/quick-setup`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      console.log('Settings data received:', data);
      
      if (data.success && data.data) {
        const organization = data.data;
        console.log('Organization data:', organization);
        
        setFormData(prev => ({
          ...prev,
          timezone: organization.timezone || 'Pacific/Auckland',
          currency: organization.currency || 'NZD',
          companyName: organization.name || '',
          address: organization.address || '',
          website: organization.website || '',
          phone: organization.phone || '',
          gstNumber: organization.nzBusinessNumber || '',
          defaultSalesTax: organization.settings?.defaultSalesTax || 15,
          taxDescription: organization.settings?.taxDescription || 'GST',
          itemPricing: organization.settings?.itemPricing || 'tax_exclusive',
          quotePresentation: organization.settings?.quotePresentation || 'quote',
          gstRate: organization.settings?.gstRate || 15,
        }));
        
        // Set current logo URL/filename robustly
        const fullLogoUrl = buildLogoUrl(organization.logoUrl);
        setCurrentLogoUrl(fullLogoUrl);
        setCurrentLogoFilename(
          organization.logoFilename || extractFilename(organization.logoUrl) || null
        );
      } else {
        console.error('Failed to load settings:', data);
        toast.error('Failed to load settings');
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load settings');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();

      // Append all form data
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'companyLogo' && value instanceof File) {
          formDataToSend.append(key, value);
        } else if (value !== undefined && value !== null) {
          formDataToSend.append(key, String(value));
        }
      });

      const response = await fetch(`${apiBase}/api/quick-setup`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Settings updated successfully!');
        
        // If logo was uploaded, show confirmation and update the current logo URL
        if (formData.companyLogo) {
          setLogoUploaded(true);
          if (data.data && data.data.logoUrl) {
            const fullLogoUrl = buildLogoUrl(data.data.logoUrl);
            setCurrentLogoUrl(fullLogoUrl);
            setCurrentLogoFilename(
              data.data.logoFilename || extractFilename(data.data.logoUrl) || formData.companyLogo?.name || null
            );
          } else if (logoPreview) {
            setCurrentLogoUrl(logoPreview);
            setCurrentLogoFilename(formData.companyLogo?.name || null);
          }
          setLogoPreview(null);
          setFormData(prev => ({ ...prev, companyLogo: undefined }));
          setTimeout(() => { setLogoUploaded(false); }, 3000);
        }
      } else {
        const err = await response.json().catch(() => ({}));
        console.error('Failed to update settings:', err);
        toast.error(err?.message || 'Failed to update settings');
      }
    } catch (error) {
      console.error('Error submitting settings:', error);
      toast.error('Failed to update settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setLogoPreview(previewUrl);
      setFormData(prev => ({ ...prev, companyLogo: file }));
      setLogoUploaded(false);
    }
  };

  const handleRemoveLogo = () => {
    setLogoPreview(null);
    setFormData(prev => ({ ...prev, companyLogo: undefined }));
    setLogoUploaded(false);
    // Clear the file input
    const fileInput = document.getElementById('companyLogo') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleRemoveCurrentLogo = () => {
    setCurrentLogoUrl(null);
    setCurrentLogoFilename(null);
    setLogoPreview(null);
    setFormData(prev => ({ ...prev, companyLogo: undefined }));
    setLogoUploaded(false);
    // Clear the file input
    const fileInput = document.getElementById('companyLogo') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </Button>
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">Q</span>
              </div>
              <span className="text-xl font-semibold text-gray-900">Settings</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Account Settings
            </CardTitle>
            <CardDescription>
              Manage your account settings and company information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Settings Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  General Settings
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Time Zone</Label>
                    <Select
                      value={formData.timezone}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, timezone: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {timezones.map((tz) => (
                          <SelectItem key={tz.value} value={tz.value}>
                            {tz.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select
                      value={formData.currency}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map((currency) => (
                          <SelectItem key={currency.value} value={currency.value}>
                            {currency.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Tax Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Tax Settings
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="defaultSalesTax">Default Sales Tax</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="defaultSalesTax"
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={formData.defaultSalesTax}
                        onChange={(e) => setFormData(prev => ({ ...prev, defaultSalesTax: parseFloat(e.target.value) || 0 }))}
                      />
                      <span className="text-gray-500">%</span>
                    </div>
                    <p className="text-sm text-gray-500">
                      To add more, see Account Settings &gt; Sales Tax & Categories.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="taxDescription">Tax description</Label>
                    <Select
                      value={formData.taxDescription}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, taxDescription: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {taxDescriptions.map((tax) => (
                          <SelectItem key={tax.value} value={tax.value}>
                            {tax.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Item Pricing Is...</Label>
                  <Select
                    value={formData.itemPricing}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, itemPricing: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {itemPricingOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              {/* Layout & Company Info Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Layout & Company Info
                </h3>
                
                <div className="space-y-2">
                  <Label>Present Quotes to Customers as...</Label>
                  <div className="flex space-x-4">
                    {quotePresentationOptions.map((option) => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id={option.value}
                          name="quotePresentation"
                          value={option.value}
                          checked={formData.quotePresentation === option.value}
                          onChange={(e) => setFormData(prev => ({ ...prev, quotePresentation: e.target.value }))}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                        />
                        <Label htmlFor={option.value}>{option.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyLogo">Add a Company Logo</Label>
                  
                  {/* Logo Preview Section */}
                  {currentLogoUrl && (
                    <div className="mb-4">
                      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border">
                        <div className="relative">
                          <img
                            src={currentLogoUrl}
                            alt="Company Logo"
                            className="w-16 h-16 object-contain rounded-lg border"
                            onError={(e) => {
                              console.error('Failed to load logo:', e.currentTarget.src);
                              // Show a placeholder or error message
                              e.currentTarget.style.display = 'none';
                              const parent = e.currentTarget.parentElement;
                              if (parent) {
                                parent.innerHTML = '<div class="w-16 h-16 bg-gray-200 rounded-lg border flex items-center justify-center"><span class="text-gray-500 text-xs">Logo not found</span></div>';
                              }
                            }}
                            onLoad={(e) => {
                              console.log('Logo loaded successfully:', e.currentTarget.src);
                            }}
                          />
                          {logoUploaded && (
                            <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1">
                              <CheckCircle className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          {currentLogoFilename && (
                            <p className="text-sm text-gray-500">
                              Filename: {currentLogoFilename}
                            </p>
                          )}
                          {logoUploaded && (
                            <p className="text-sm text-green-600 flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              Logo uploaded successfully!
                            </p>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleRemoveCurrentLogo}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* New Logo Preview Section */}
                  {logoPreview && (
                    <div className="mb-4">
                      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border">
                        <div className="relative">
                          <img
                            src={logoPreview}
                            alt="New Logo Preview"
                            className="w-16 h-16 object-contain rounded-lg border"
                            onError={(e) => {
                              console.error('Failed to load logo preview:', e.currentTarget.src);
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">New Logo Preview</p>
                          {formData.companyLogo?.name && (
                            <p className="text-sm text-gray-500">
                              Filename: {formData.companyLogo.name}
                            </p>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleRemoveLogo}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* File Upload Section */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      id="companyLogo"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label htmlFor="companyLogo" className="cursor-pointer">
                      <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                      <span className="text-blue-600 hover:text-blue-700 font-medium">
                        {currentLogoUrl || logoPreview ? 'Change Logo' : 'Choose Logo'}
                      </span>
                      <p className="text-sm text-gray-500 mt-1">
                        PNG, JPG, GIF up to 5MB
                      </p>
                    </label>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      Company Contact Info
                    </h4>
                    <p className="text-sm text-gray-500">This info will be displayed on your quotes.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Company Name</Label>
                      <Input
                        id="companyName"
                        value={formData.companyName}
                        onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                        placeholder="Your Company Name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="+64 9 123 4567"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="123 Business Street, Auckland, New Zealand"
                      rows={3}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        value={formData.website}
                        onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                        placeholder="www.example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gstNumber">GST Number</Label>
                      <Input
                        id="gstNumber"
                        value={formData.gstNumber}
                        onChange={(e) => setFormData(prev => ({ ...prev, gstNumber: e.target.value }))}
                        placeholder="123-456-789"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save Settings'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 