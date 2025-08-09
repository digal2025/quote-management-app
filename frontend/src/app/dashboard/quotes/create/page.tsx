'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Trash2, ChevronDown, MoreHorizontal, Image, MoveUp, MoveDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { toast } from 'react-hot-toast';
import { Quote, QuoteItem, Customer, CreateQuoteForm } from '@/types';

interface QuoteFormData {
  title: string;
  description: string;
  customerId: string;
  currency: string;
  validUntil: string;
  termsConditions: string;
  notes: string;
  items: QuoteItem[];
  textItems: TextItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountPercentage: number;
  discountAmount: number;
  totalAmount: number;
  status: string;
  privateNote: string;
}

interface TextItem {
  id: string;
  heading: string;
  description: string;
  sortOrder: number;
  createdAt: string;
}

export default function CreateQuotePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [selectedCustomerIndex, setSelectedCustomerIndex] = useState(-1);
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [formData, setFormData] = useState<QuoteFormData>({
    title: '',
    description: '',
    customerId: '',
    currency: 'NZD',
    validUntil: '',
    termsConditions: '',
    notes: '',
    items: [],
    textItems: [],
    subtotal: 0,
    taxRate: 0.18,
    taxAmount: 0,
    discountPercentage: 0,
    discountAmount: 0,
    totalAmount: 0,
    status: 'Draft',
    privateNote: '',
  });

  useEffect(() => {
    fetchCustomers();
    // Add a default item to match the screenshot
    const defaultItem: QuoteItem = {
      id: `temp-${Date.now()}`,
      quoteId: '',
      name: 'Web Design Services for Dream Institute',
      description: '',
      quantity: 1,
      unitPrice: 5000,
      totalPrice: 5000,
      isOptional: false,
      isEditable: true,
      sortOrder: 0,
      createdAt: new Date().toISOString(),
    };
    setFormData(prev => ({
      ...prev,
      items: [defaultItem]
    }));
  }, []);

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/customers`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCustomers(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Failed to load customers');
    }
  };

  const handleCustomerSelect = (customer: Customer) => {
    const displayText = `${customer.firstName} ${customer.lastName} (${customer.email})`;
    setCustomerSearchTerm(displayText);
    setFormData(prev => ({ ...prev, customerId: customer.id }));
    setShowAutocomplete(false);
    setSelectedCustomerIndex(-1);
  };

  const handleCustomerSearch = (searchTerm: string) => {
    setCustomerSearchTerm(searchTerm);
    
    // Clear customerId if user is typing a new search (not a selected customer format)
    if (!searchTerm.includes('(') || !searchTerm.includes(')')) {
      setFormData(prev => ({ ...prev, customerId: '' }));
    }

    if (searchTerm.trim().length === 0) {
      setFilteredCustomers([]);
      setShowAutocomplete(false);
      setSelectedCustomerIndex(-1);
      setFormData(prev => ({ ...prev, customerId: '' }));
      return;
    }

    // If the search term looks like a selected customer (contains parentheses), don't show autocomplete
    if (searchTerm.includes('(') && searchTerm.includes(')')) {
      setShowAutocomplete(false);
      setSelectedCustomerIndex(-1);
      return;
    }

    const filtered = customers.filter(customer => {
      const fullName = `${customer.firstName} ${customer.lastName}`.toLowerCase();
      const email = customer.email.toLowerCase();
      const searchLower = searchTerm.toLowerCase();
      
      return fullName.includes(searchLower) || email.includes(searchLower);
    });

    setFilteredCustomers(filtered);
    setShowAutocomplete(filtered.length > 0);
    setSelectedCustomerIndex(-1);
  };

  const clearCustomerSelection = () => {
    setCustomerSearchTerm('');
    setFormData(prev => ({ ...prev, customerId: '' }));
    setShowAutocomplete(false);
    setSelectedCustomerIndex(-1);
    setFilteredCustomers([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showAutocomplete) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedCustomerIndex(prev => 
          prev < filteredCustomers.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedCustomerIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedCustomerIndex >= 0 && filteredCustomers[selectedCustomerIndex]) {
          handleCustomerSelect(filteredCustomers[selectedCustomerIndex]);
        }
        break;
      case 'Escape':
        setShowAutocomplete(false);
        setSelectedCustomerIndex(-1);
        break;
    }
  };

  const addItem = () => {
    const newItem: QuoteItem = {
      id: `temp-${Date.now()}`,
      quoteId: '',
      name: 'Web Design Services for Dream Institute',
      description: '',
      quantity: 1,
      unitPrice: 5000,
      totalPrice: 5000,
      isOptional: false,
      isEditable: true,
      sortOrder: formData.items.length,
      createdAt: new Date().toISOString(),
    };
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
    calculateTotals([...formData.items, newItem]);
  };

  const updateItem = (index: number, field: keyof QuoteItem, value: any) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // Calculate total price for the item
    if (field === 'quantity' || field === 'unitPrice') {
      const item = updatedItems[index];
      item.totalPrice = item.quantity * item.unitPrice;
    }
    
    setFormData(prev => ({
      ...prev,
      items: updatedItems
    }));
    calculateTotals(updatedItems);
  };

  const removeItem = (index: number) => {
    const updatedItems = formData.items.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      items: updatedItems
    }));
    calculateTotals(updatedItems);
  };

  const addTextItem = () => {
    const newTextItem: TextItem = {
      id: `text-${Date.now()}`,
      heading: '',
      description: '',
      sortOrder: formData.textItems.length,
      createdAt: new Date().toISOString(),
    };
    setFormData(prev => ({
      ...prev,
      textItems: [...prev.textItems, newTextItem]
    }));
  };

  const updateTextItem = (index: number, field: keyof TextItem, value: string) => {
    const updatedTextItems = [...formData.textItems];
    updatedTextItems[index] = { ...updatedTextItems[index], [field]: value };
    setFormData(prev => ({
      ...prev,
      textItems: updatedTextItems
    }));
  };

  const removeTextItem = (index: number) => {
    const updatedTextItems = formData.textItems.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      textItems: updatedTextItems
    }));
  };

  const calculateTotals = (items: QuoteItem[]) => {
    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const taxAmount = subtotal * formData.taxRate;
    const totalAmount = subtotal + taxAmount;
    
    setFormData(prev => ({
      ...prev,
      subtotal,
      taxAmount,
      totalAmount
    }));
  };

  // Recalculate totals whenever items change
  useEffect(() => {
    calculateTotals(formData.items);
  }, [formData.items]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const quoteData = {
        title: formData.title || 'Web Design Services',
        description: formData.description,
        customerId: formData.customerId,
        items: formData.items.map(item => ({
          name: item.name,
          description: item.description || '',
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          isOptional: item.isOptional,
          isEditable: item.isEditable,
        })),
        textItems: formData.textItems.map(textItem => ({
          heading: textItem.heading,
          description: textItem.description,
        })),
        validUntil: formData.validUntil,
        termsConditions: formData.termsConditions,
        notes: formData.notes,
        status: formData.status,
        privateNote: formData.privateNote,
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/quotes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quoteData),
      });

      if (response.ok) {
        toast.success('Quote created successfully!');
        router.push('/dashboard/quotes');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to create quote');
      }
    } catch (error) {
      console.error('Error creating quote:', error);
      toast.error('Failed to create quote');
    } finally {
      setIsLoading(false);
    }
  };

  const saveQuote = async () => {
    setIsLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication required');
        router.push('/auth/login');
        return;
      }

      // Validate required fields
      if (!formData.customerId) {
        toast.error('Please select a customer');
        return;
      }

      if (formData.items.length === 0) {
        toast.error('Please add at least one item');
        return;
      }

      // Validate that items have required fields
      const invalidItems = formData.items.filter(item => !item.name || item.unitPrice <= 0);
      if (invalidItems.length > 0) {
        toast.error('Please ensure all items have a name and valid price');
        return;
      }

      const quoteData = {
        title: formData.title || 'Web Design Services',
        description: formData.description,
        customerId: formData.customerId,
        currency: formData.currency,
        validUntil: formData.validUntil,
        termsConditions: formData.termsConditions,
        notes: formData.notes,
        items: formData.items.map(item => ({
          name: item.name,
          description: item.description || '',
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          isOptional: item.isOptional,
          isEditable: item.isEditable,
        })),
        textItems: formData.textItems.map(textItem => ({
          heading: textItem.heading,
          description: textItem.description,
        })),
        subtotal: formData.subtotal,
        taxRate: formData.taxRate,
        taxAmount: formData.taxAmount,
        totalAmount: formData.totalAmount,
        status: 'Draft', // Always save as draft
        privateNote: formData.privateNote,
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/quotes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quoteData),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success('Quote saved successfully!');
        
        // Optionally redirect to the saved quote or stay on the page
        if (result.data?.id) {
          // Update the URL to show the saved quote ID
          router.push(`/dashboard/quotes/${result.data.id}`);
        } else {
          // Stay on the current page
          router.push('/dashboard/quotes');
        }
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to save quote');
      }
    } catch (error) {
      console.error('Error saving quote:', error);
      toast.error('Failed to save quote. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: formData.currency,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left side - Action buttons */}
            <div className="flex items-center space-x-4">
              <Button
                variant="default"
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? 'Creating...' : 'Preview & Send'}
              </Button>
              <Button variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button
                variant="outline"
                onClick={saveQuote}
                disabled={isLoading}
                className="text-blue-600 hover:text-blue-700 font-medium border-blue-600 hover:border-blue-700"
              >
                {isLoading ? 'Saving...' : 'Save'}
              </Button>
            </div>
            
            {/* Right side - Actions and amount */}
            <div className="flex items-center space-x-4">
              <Button variant="outline" className="flex items-center space-x-2">
                <span>Actions</span>
                <ChevronDown className="w-4 h-4" />
              </Button>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(formData.totalAmount)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Quote Details and Items */}
            <div className="lg:col-span-2 space-y-6">
              {/* Quote Details Section */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6">
                  {/* For Field */}
                  <div className="mb-6 relative">
                    <Label htmlFor="customer" className="text-sm font-medium text-gray-700">
                      For
                    </Label>
                    <div className="relative">
                      <Input
                        id="customer"
                        placeholder="Start with a name or email address"
                        className={`mt-1 pr-10 ${
                          formData.customerId && customerSearchTerm.includes('(') 
                            ? 'border-green-300 bg-green-50' 
                            : ''
                        }`}
                        value={customerSearchTerm}
                        onChange={(e) => handleCustomerSearch(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onFocus={() => {
                          // Only show autocomplete if no customer is selected and there are filtered results
                          if (customerSearchTerm.trim().length > 0 && 
                              filteredCustomers.length > 0 && 
                              !customerSearchTerm.includes('(')) {
                            setShowAutocomplete(true);
                          }
                        }}
                        onBlur={() => {
                          // Delay hiding to allow for clicks on dropdown items
                          setTimeout(() => setShowAutocomplete(false), 200);
                        }}
                      />
                      {customerSearchTerm && formData.customerId && (
                        <button
                          type="button"
                          onClick={clearCustomerSelection}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    {showAutocomplete && filteredCustomers.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {filteredCustomers.map((customer, index) => (
                          <div
                            key={customer.id}
                            className={`flex items-center p-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                              selectedCustomerIndex === index ? 'bg-blue-50 border-blue-200' : ''
                            }`}
                            onClick={() => handleCustomerSelect(customer)}
                          >
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                              <span className="text-sm font-medium text-blue-600">
                                {customer.firstName.charAt(0)}{customer.lastName.charAt(0)}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {customer.firstName} {customer.lastName}
                              </p>
                              <p className="text-sm text-gray-500 truncate">{customer.email}</p>
                              {customer.companyName && (
                                <p className="text-xs text-gray-400 truncate">{customer.companyName}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {showAutocomplete && filteredCustomers.length === 0 && customerSearchTerm.trim().length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
                        <div className="p-3 text-center text-gray-500">
                          <p className="text-sm">No contacts found</p>
                          <p className="text-xs mt-1">Try a different search term</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Tabs */}
                  <div className="flex space-x-8 border-b border-gray-200 mb-6">
                    <button type="button" className="pb-2 px-1 border-b-2 border-blue-600 text-blue-600 font-medium text-sm">
                      Overview
                    </button>
                    <button type="button" className="pb-2 px-1 text-gray-500 hover:text-gray-700 font-medium text-sm">
                      All Activity
                    </button>
                    <button type="button" className="pb-2 px-1 text-gray-500 hover:text-gray-700 font-medium text-sm">
                      Settings
                    </button>
                  </div>

                  {/* Status Bar */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-green-600 font-medium">{formData.status}</span>
                        <div className="w-16 h-0.5 bg-green-500"></div>
                      </div>
                      <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Draft">Draft</SelectItem>
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Sent">Sent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Private Note */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">GD</span>
                      </div>
                      <Label className="text-sm font-medium text-gray-700">Private Note</Label>
                    </div>
                    <Textarea
                      placeholder="Add Private Note..."
                      value={formData.privateNote}
                      onChange={(e) => setFormData(prev => ({ ...prev, privateNote: e.target.value }))}
                      className="min-h-[100px]"
                    />
                  </div>
                </div>
              </div>

              {/* Items Section */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                    Web Design Services
                  </h2>

                  {formData.items.map((item, index) => (
                    <div key={item.id} className="space-y-4 mb-6">
                      {/* Item Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <button type="button" className="p-1 hover:bg-gray-100 rounded">
                            <MoreHorizontal className="w-4 h-4 text-gray-400" />
                          </button>
                          <button type="button" className="p-1 hover:bg-gray-100 rounded">
                            <Image className="w-4 h-4 text-gray-400" />
                          </button>
                          <button type="button" className="p-1 hover:bg-gray-100 rounded">
                            <Plus className="w-4 h-4 text-gray-400" />
                          </button>
                          <button type="button" className="p-1 hover:bg-gray-100 rounded">
                            <MoveUp className="w-4 h-4 text-gray-400" />
                          </button>
                          <button type="button" className="p-1 hover:bg-gray-100 rounded">
                            <MoveDown className="w-4 h-4 text-gray-400" />
                          </button>
                          <button 
                            type="button"
                            className="p-1 hover:bg-gray-100 rounded"
                            onClick={() => removeItem(index)}
                          >
                            <X className="w-4 h-4 text-gray-400" />
                          </button>
                        </div>
                      </div>

                      {/* Item Fields */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Item Code or ID - optional</Label>
                          <Input className="mt-1" placeholder="Item code" />
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Description</Label>
                          <Input
                            className="mt-1"
                            value={item.name}
                            onChange={(e) => updateItem(index, 'name', e.target.value)}
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-gray-700">Long Description</Label>
                        <Textarea
                          className="mt-1"
                          value={item.description}
                          onChange={(e) => updateItem(index, 'description', e.target.value)}
                          placeholder="Long description..."
                        />
                      </div>

                      {/* Pricing Section */}
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Sales</Label>
                          <Select>
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="sales">Sales</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Price</Label>
                          <Input
                            className="mt-1"
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Quantity</Label>
                          <Input
                            className="mt-1"
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Total</Label>
                          <div className="mt-1 p-2 bg-gray-50 rounded border font-medium">
                            {formatCurrency(item.totalPrice)}
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">GST</Label>
                          <Select>
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="18">18% GST</SelectItem>
                              <SelectItem value="0">0% GST</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Add Item Button */}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addItem}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    + Price Item
                  </Button>
                </div>
              </div>

              {/* Text Item Section */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Text Item</h2>
                  
                  {formData.textItems.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p>No text items added yet. Click "+ Text Item" to get started.</p>
                    </div>
                  )}

                  {formData.textItems.map((textItem, index) => (
                    <div key={textItem.id} className="space-y-4 mb-6 border border-gray-200 rounded-lg p-4">
                      {/* Text Item Header */}
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-700">Text Item {index + 1}</h3>
                        <div className="flex items-center space-x-2">
                          <button type="button" className="p-1 hover:bg-gray-100 rounded">
                            <Image className="w-4 h-4 text-gray-400" />
                          </button>
                          <button type="button" className="p-1 hover:bg-gray-100 rounded">
                            <Plus className="w-4 h-4 text-gray-400" />
                          </button>
                          <button type="button" className="p-1 hover:bg-gray-100 rounded">
                            <MoveUp className="w-4 h-4 text-gray-400" />
                          </button>
                          <button type="button" className="p-1 hover:bg-gray-100 rounded">
                            <MoveDown className="w-4 h-4 text-gray-400" />
                          </button>
                          <button 
                            type="button" 
                            className="p-1 hover:bg-gray-100 rounded"
                            onClick={() => removeTextItem(index)}
                          >
                            <X className="w-4 h-4 text-gray-400" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Text Heading</Label>
                          <Input 
                            className="mt-1" 
                            placeholder="Text heading"
                            value={textItem.heading}
                            onChange={(e) => updateTextItem(index, 'heading', e.target.value)}
                          />
                        </div>
                        
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Description</Label>
                          <Textarea
                            className="mt-1"
                            placeholder="Long description, terms of trade or compelling sales text"
                            value={textItem.description}
                            onChange={(e) => updateTextItem(index, 'description', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={addTextItem}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    + Text Item
                  </Button>
                </div>
              </div>
            </div>

            {/* Right Column - Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">{formatCurrency(formData.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">GST 18%</span>
                    <span className="font-medium">{formatCurrency(formData.taxAmount)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>{formatCurrency(formData.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
} 