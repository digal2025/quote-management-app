"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { formatCurrency, calculateGST, calculateTotal } from "@/lib/utils"
import { QuoteItem, QuoteStatus } from "@/types"

interface QuoteFormProps {
  onSubmit: (data: any) => void
  initialData?: any
}

export function QuoteForm({ onSubmit, initialData }: QuoteFormProps) {
  const [items, setItems] = useState<QuoteItem[]>(initialData?.items || [])
  const [subtotal, setSubtotal] = useState(0)
  const [gstRate] = useState(0.15) // NZ GST rate
  const [gstAmount, setGstAmount] = useState(0)
  const [total, setTotal] = useState(0)

  const addItem = () => {
    const newItem: QuoteItem = {
      id: `temp-${Date.now()}`,
      quoteId: "",
      name: "",
      description: "",
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
      isOptional: false,
      isEditable: true,
      sortOrder: items.length,
      createdAt: new Date().toISOString(),
    }
    setItems([...items, newItem])
  }

  const updateItem = (index: number, field: keyof QuoteItem, value: any) => {
    const updatedItems = [...items]
    updatedItems[index] = { ...updatedItems[index], [field]: value }
    
    // Recalculate total price for this item
    if (field === 'quantity' || field === 'unitPrice') {
      const item = updatedItems[index]
      item.totalPrice = item.quantity * item.unitPrice
    }
    
    setItems(updatedItems)
    calculateTotals(updatedItems)
  }

  const removeItem = (index: number) => {
    const updatedItems = items.filter((_, i) => i !== index)
    setItems(updatedItems)
    calculateTotals(updatedItems)
  }

  const calculateTotals = (currentItems: QuoteItem[]) => {
    const newSubtotal = currentItems.reduce((sum, item) => sum + item.totalPrice, 0)
    const newGstAmount = calculateGST(newSubtotal, gstRate)
    const newTotal = calculateTotal(newSubtotal, gstRate, 0)
    
    setSubtotal(newSubtotal)
    setGstAmount(newGstAmount)
    setTotal(newTotal)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      items,
      subtotal,
      gstAmount,
      total,
      gstRate,
    })
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Quote</CardTitle>
        <CardDescription>
          Build a professional quote for your customer with NZ GST calculations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Quote Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Quote Title</Label>
              <Input
                id="title"
                placeholder="e.g., Website Development Services"
                defaultValue={initialData?.title}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customer">Customer</Label>
              <Select defaultValue={initialData?.customerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer-1">John Smith - ABC Company</SelectItem>
                  <SelectItem value="customer-2">Jane Doe - XYZ Ltd</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Brief description of the quote..."
              defaultValue={initialData?.description}
            />
          </div>

          <Separator />

          {/* Quote Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Quote Items</h3>
              <Button type="button" onClick={addItem} variant="outline" size="sm">
                Add Item
              </Button>
            </div>

            {items.map((item, index) => (
              <Card key={item.id} className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                  <div className="md:col-span-2">
                    <Label htmlFor={`item-${index}-name`}>Item Name</Label>
                    <Input
                      id={`item-${index}-name`}
                      value={item.name}
                      onChange={(e) => updateItem(index, 'name', e.target.value)}
                      placeholder="e.g., Website Design"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`item-${index}-quantity`}>Qty</Label>
                    <Input
                      id={`item-${index}-quantity`}
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`item-${index}-price`}>Unit Price</Label>
                    <Input
                      id={`item-${index}-price`}
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label>Total</Label>
                    <div className="p-2 bg-muted rounded-md text-sm font-medium">
                      {formatCurrency(item.totalPrice)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id={`item-${index}-optional`}
                        checked={item.isOptional}
                        onCheckedChange={(checked) => updateItem(index, 'isOptional', checked)}
                      />
                      <Label htmlFor={`item-${index}-optional`} className="text-xs">
                        Optional
                      </Label>
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeItem(index)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
                {item.isOptional && (
                  <Badge variant="secondary" className="mt-2">
                    Optional Item
                  </Badge>
                )}
              </Card>
            ))}
          </div>

          <Separator />

          {/* Totals */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-medium">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>GST (15%):</span>
              <span className="font-medium">{formatCurrency(gstAmount)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline">
              Save Draft
            </Button>
            <Button type="submit">
              Create Quote
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
} 