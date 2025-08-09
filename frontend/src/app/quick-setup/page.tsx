'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Building2, Globe, DollarSign, FileText, Phone, Mail, MapPin, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from 'react-hot-toast';

interface QuickSetupData {
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

export default function QuickSetupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<QuickSetupData>({
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

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    // Check if user has already completed setup
    checkSetupStatus();
  }, [router]);

  const checkSetupStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success && data.data.organization?.name) {
        // User has already completed setup, redirect to dashboard
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error checking setup status:', error);
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

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/quick-setup`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Setup completed successfully!');
        router.push('/dashboard');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to complete setup');
      }
    } catch (error) {
      console.error('Error completing setup:', error);
      toast.error('Failed to complete setup');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, companyLogo: file }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">Q</span>
              </div>
              <span className="text-xl font-semibold text-gray-900">QuoteApp</span>
            </div>
          </div>
        </div>
      </div>

      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h1 className="text-3xl font-bold mb-2">Account created. Welcome aboard!</h1>
          <p className="text-blue-100 text-lg">You can jump in and get started now.</p>
          <Button 
            onClick={() => router.push('/dashboard')}
            variant="secondary" 
            className="mt-4"
          >
            View Your Dashboard
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Quick Setup</CardTitle>
            <CardDescription>
              Let's get your account configured with the essential information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Settings Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Settings
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
                  Tax
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
                        Choose Logo
                      </span>
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
              <div className="flex justify-center pt-6">
                <Button type="submit" size="lg" disabled={isLoading}>
                  {isLoading ? 'Completing Setup...' : 'View Your Dashboard'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 