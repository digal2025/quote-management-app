import React from 'react'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { toast } from 'react-hot-toast'
import { render, mockSettingsData, mockApiResponses } from '@/__tests__/utils/test-utils'
import SettingsPage from '../page'

// Mock the components (same as in the main test file)
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  ),
}))

jest.mock('@/components/ui/card', () => ({
  Card: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardContent: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardDescription: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardHeader: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardTitle: ({ children, ...props }: any) => <div {...props}>{children}</div>,
}))

jest.mock('@/components/ui/input', () => ({
  Input: ({ ...props }: any) => <input {...props} />,
}))

jest.mock('@/components/ui/label', () => ({
  Label: ({ children, ...props }: any) => <label {...props}>{children}</label>,
}))

jest.mock('@/components/ui/textarea', () => ({
  Textarea: ({ ...props }: any) => <textarea {...props} />,
}))

jest.mock('@/components/ui/select', () => ({
  Select: ({ children, value, onValueChange }: any) => (
    <select value={value} onChange={(e) => onValueChange?.(e.target.value)}>
      {children}
    </select>
  ),
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ children, value }: any) => <option value={value}>{children}</option>,
  SelectTrigger: ({ children }: any) => <div>{children}</div>,
  SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
}))

jest.mock('@/components/ui/separator', () => ({
  Separator: () => <hr />,
}))

jest.mock('lucide-react', () => ({
  ArrowLeft: () => <span data-testid="arrow-left">ArrowLeft</span>,
  Upload: () => <span data-testid="upload">Upload</span>,
  Building2: () => <span data-testid="building2">Building2</span>,
  Globe: () => <span data-testid="globe">Globe</span>,
  DollarSign: () => <span data-testid="dollar-sign">DollarSign</span>,
  Settings: () => <span data-testid="settings">Settings</span>,
  Save: () => <span data-testid="save">Save</span>,
}))

describe('SettingsPage Integration Tests', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.getItem.mockReturnValue('mock-token')
    ;(global.fetch as jest.Mock).mockResolvedValue(mockApiResponses.success)
  })

  describe('Complete Settings Update Workflow', () => {
    it('should complete a full settings update workflow', async () => {
      // Mock successful API response for form submission
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce(mockApiResponses.success) // Initial load
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            message: 'Settings updated successfully',
          }),
        }) // Form submission

      render(<SettingsPage />)

      // Wait for initial data to load
      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Company')).toBeInTheDocument()
      })

      // Update company information
      const companyNameInput = screen.getByLabelText(/Company Name/i)
      await user.clear(companyNameInput)
      await user.type(companyNameInput, 'Updated Company Name')

      const phoneInput = screen.getByLabelText(/Phone/i)
      await user.clear(phoneInput)
      await user.type(phoneInput, '+64 9 987 6543')

      const addressTextarea = screen.getByLabelText(/Address/i)
      await user.clear(addressTextarea)
      await user.type(addressTextarea, '456 New Street, Auckland, New Zealand')

      const websiteInput = screen.getByLabelText(/Website/i)
      await user.clear(websiteInput)
      await user.type(websiteInput, 'www.updatedcompany.com')

      // Update tax settings
      const taxRateInput = screen.getByLabelText(/Default Sales Tax/i)
      await user.clear(taxRateInput)
      await user.type(taxRateInput, '20')

      // Update GST information
      const gstNumberInput = screen.getByLabelText(/GST Number/i)
      await user.clear(gstNumberInput)
      await user.type(gstNumberInput, '987-654-321')

      // Change timezone
      const timezoneSelect = screen.getByLabelText(/Time Zone/i)
      await user.selectOptions(timezoneSelect, 'America/New_York')

      // Change currency
      const currencySelect = screen.getByLabelText(/Currency/i)
      await user.selectOptions(currencySelect, 'USD')

      // Change quote presentation
      const proposalRadio = screen.getByLabelText('Proposal')
      await user.click(proposalRadio)

      // Submit the form
      const submitButton = screen.getByText('Save Settings')
      await user.click(submitButton)

      // Verify loading state
      expect(screen.getByText('Saving...')).toBeInTheDocument()

      // Wait for submission to complete
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Settings updated successfully!')
      })

      // Verify API call was made with correct data
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/quick-setup',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Authorization': 'Bearer mock-token',
          },
        })
      )
    })

    it('should handle file upload during settings update', async () => {
      const file = new File(['test'], 'company-logo.png', { type: 'image/png' })

      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce(mockApiResponses.success)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            message: 'Settings updated successfully',
          }),
        })

      render(<SettingsPage />)

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Company')).toBeInTheDocument()
      })

      // Upload company logo
      const fileInput = screen.getByLabelText(/Add a Company Logo/i)
      await user.upload(fileInput, file)

      // Verify file was uploaded
      expect(fileInput.files?.[0]).toBe(file)

      // Submit form
      const submitButton = screen.getByText('Save Settings')
      await user.click(submitButton)

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Settings updated successfully!')
      })
    })

    it('should handle validation errors during form submission', async () => {
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce(mockApiResponses.success)
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({
            success: false,
            message: 'Company name is required',
          }),
        })

      render(<SettingsPage />)

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Company')).toBeInTheDocument()
      })

      // Clear required field
      const companyNameInput = screen.getByLabelText(/Company Name/i)
      await user.clear(companyNameInput)

      // Submit form
      const submitButton = screen.getByText('Save Settings')
      await user.click(submitButton)

      // Verify error message
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Company name is required')
      })
    })

    it('should handle network errors gracefully', async () => {
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce(mockApiResponses.success)
        .mockRejectedValueOnce(new Error('Network error'))

      render(<SettingsPage />)

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Company')).toBeInTheDocument()
      })

      // Submit form
      const submitButton = screen.getByText('Save Settings')
      await user.click(submitButton)

      // Verify error handling
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to update settings')
      })
    })
  })

  describe('Form Validation and User Experience', () => {
    it('should validate form fields and show appropriate feedback', async () => {
      render(<SettingsPage />)

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Company')).toBeInTheDocument()
      })

      // Test required field validation
      const companyNameInput = screen.getByLabelText(/Company Name/i)
      await user.clear(companyNameInput)

      // Try to submit with empty required field
      const submitButton = screen.getByText('Save Settings')
      await user.click(submitButton)

      // Verify validation error
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Company name is required')
      })
    })

    it('should maintain form state during user interactions', async () => {
      render(<SettingsPage />)

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Company')).toBeInTheDocument()
      })

      // Update multiple fields
      const companyNameInput = screen.getByLabelText(/Company Name/i)
      const phoneInput = screen.getByLabelText(/Phone/i)
      const addressTextarea = screen.getByLabelText(/Address/i)

      await user.clear(companyNameInput)
      await user.type(companyNameInput, 'New Company Name')

      await user.clear(phoneInput)
      await user.type(phoneInput, '+64 9 987 6543')

      await user.clear(addressTextarea)
      await user.type(addressTextarea, 'New Address')

      // Verify form state is maintained
      expect(companyNameInput).toHaveValue('New Company Name')
      expect(phoneInput).toHaveValue('+64 9 987 6543')
      expect(addressTextarea).toHaveValue('New Address')
    })

    it('should handle form cancellation', async () => {
      render(<SettingsPage />)

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Company')).toBeInTheDocument()
      })

      // Click cancel button
      const cancelButton = screen.getByText('Cancel')
      await user.click(cancelButton)

      // Verify navigation back
      expect(mockRouter.back).toHaveBeenCalled()
    })
  })

  describe('Accessibility and User Interface', () => {
    it('should have proper accessibility attributes', async () => {
      render(<SettingsPage />)

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Company')).toBeInTheDocument()
      })

      // Check for proper labels
      expect(screen.getByLabelText(/Company Name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Phone/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Address/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Website/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/GST Number/i)).toBeInTheDocument()

      // Check for proper headings
      expect(screen.getByRole('heading', { name: /Settings/i })).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: /Account Settings/i })).toBeInTheDocument()
    })

    it('should handle keyboard navigation', async () => {
      render(<SettingsPage />)

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Company')).toBeInTheDocument()
      })

      // Test tab navigation
      const companyNameInput = screen.getByLabelText(/Company Name/i)
      const phoneInput = screen.getByLabelText(/Phone/i)

      companyNameInput.focus()
      expect(companyNameInput).toHaveFocus()

      await user.tab()
      expect(phoneInput).toHaveFocus()
    })
  })
}) 