import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { toast } from 'react-hot-toast'
import SettingsPage from '../page'

// Mock the components
jest.mock('../../../components/ui/button', () => ({
  Button: ({ children, onClick, disabled, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  ),
}))

jest.mock('../../../components/ui/card', () => ({
  Card: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardContent: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardDescription: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardHeader: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardTitle: ({ children, ...props }: any) => <div {...props}>{children}</div>,
}))

jest.mock('../../../components/ui/input', () => ({
  Input: ({ ...props }: any) => <input {...props} />,
}))

jest.mock('../../../components/ui/label', () => ({
  Label: ({ children, ...props }: any) => <label {...props}>{children}</label>,
}))

jest.mock('../../../components/ui/textarea', () => ({
  Textarea: ({ ...props }: any) => <textarea {...props} />,
}))

jest.mock('../../../components/ui/select', () => ({
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

jest.mock('../../../components/ui/separator', () => ({
  Separator: () => <hr />,
}))

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  ArrowLeft: () => <span data-testid="arrow-left">ArrowLeft</span>,
  Upload: () => <span data-testid="upload">Upload</span>,
  Building2: () => <span data-testid="building2">Building2</span>,
  Globe: () => <span data-testid="globe">Globe</span>,
  DollarSign: () => <span data-testid="dollar-sign">DollarSign</span>,
  Settings: () => <span data-testid="settings">Settings</span>,
  Save: () => <span data-testid="save">Save</span>,
}))

describe('SettingsPage', () => {
  const mockRouter = {
    push: jest.fn(),
    back: jest.fn(),
  }

  const mockSettingsData = {
    timezone: 'Pacific/Auckland',
    currency: 'NZD',
    defaultSalesTax: 15,
    taxDescription: 'GST',
    itemPricing: 'tax_exclusive',
    quotePresentation: 'quote',
    companyName: 'Test Company',
    address: '123 Test Street',
    website: 'www.test.com',
    phone: '+64 9 123 4567',
    gstNumber: '123-456-789',
    gstRate: 15,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.getItem.mockReturnValue('mock-token')
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: mockSettingsData,
      }),
    })
  })

  it('renders the settings page with all sections', async () => {
    render(<SettingsPage />)

    // Check for main sections
    expect(screen.getByText('Settings')).toBeInTheDocument()
    expect(screen.getByText('Account Settings')).toBeInTheDocument()
    expect(screen.getByText('Manage your account settings and company information')).toBeInTheDocument()

    // Check for section headers
    expect(screen.getByText('General Settings')).toBeInTheDocument()
    expect(screen.getByText('Tax Settings')).toBeInTheDocument()
    expect(screen.getByText('Layout & Company Info')).toBeInTheDocument()
  })

  it('loads existing settings on component mount', async () => {
    render(<SettingsPage />)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/quick-setup',
        expect.objectContaining({
          headers: {
            'Authorization': 'Bearer mock-token',
            'Content-Type': 'application/json',
          },
        })
      )
    })
  })

  it('redirects to login if no token is found', async () => {
    localStorage.getItem.mockReturnValue(null)
    
    render(<SettingsPage />)

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/auth/login')
    })
  })

  it('displays form fields with correct labels', async () => {
    render(<SettingsPage />)

    // Check for form fields
    expect(screen.getByLabelText(/Time Zone/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Currency/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Default Sales Tax/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Tax description/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Company Name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Phone/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Website/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/GST Number/i)).toBeInTheDocument()
  })

  it('handles form submission successfully', async () => {
    const user = userEvent.setup()
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        message: 'Settings updated successfully',
      }),
    })

    render(<SettingsPage />)

    // Fill in form fields
    const companyNameInput = screen.getByLabelText(/Company Name/i)
    await user.clear(companyNameInput)
    await user.type(companyNameInput, 'New Company Name')

    const phoneInput = screen.getByLabelText(/Phone/i)
    await user.clear(phoneInput)
    await user.type(phoneInput, '+64 9 987 6543')

    // Submit form
    const submitButton = screen.getByText('Save Settings')
    await user.click(submitButton)

    await waitFor(() => {
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

    expect(toast.success).toHaveBeenCalledWith('Settings updated successfully!')
  })

  it('handles form submission error', async () => {
    const user = userEvent.setup()
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        success: false,
        message: 'Failed to update settings',
      }),
    })

    render(<SettingsPage />)

    // Submit form
    const submitButton = screen.getByText('Save Settings')
    await user.click(submitButton)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to update settings')
    })
  })

  it('handles file upload for company logo', async () => {
    const user = userEvent.setup()
    const file = new File(['test'], 'test.png', { type: 'image/png' })

    render(<SettingsPage />)

    const fileInput = screen.getByLabelText(/Add a Company Logo/i)
    await user.upload(fileInput, file)

    expect(fileInput.files?.[0]).toBe(file)
  })

  it('validates required fields', async () => {
    const user = userEvent.setup()
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        success: false,
        message: 'Company name is required',
      }),
    })

    render(<SettingsPage />)

    // Clear required field
    const companyNameInput = screen.getByLabelText(/Company Name/i)
    await user.clear(companyNameInput)

    // Submit form
    const submitButton = screen.getByText('Save Settings')
    await user.click(submitButton)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Company name is required')
    })
  })

  it('handles back button click', async () => {
    const user = userEvent.setup()
    render(<SettingsPage />)

    const backButton = screen.getByText('Back')
    await user.click(backButton)

    expect(mockRouter.back).toHaveBeenCalled()
  })

  it('displays loading state during form submission', async () => {
    const user = userEvent.setup()
    ;(global.fetch as jest.Mock).mockImplementationOnce(
      () => new Promise(resolve => setTimeout(() => resolve({ ok: true, json: async () => ({ success: true }) }), 100))
    )

    render(<SettingsPage />)

    const submitButton = screen.getByText('Save Settings')
    await user.click(submitButton)

    expect(screen.getByText('Saving...')).toBeInTheDocument()
  })

  it('handles network errors gracefully', async () => {
    const user = userEvent.setup()
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

    render(<SettingsPage />)

    const submitButton = screen.getByText('Save Settings')
    await user.click(submitButton)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to update settings')
    })
  })

  it('updates form data when user interacts with fields', async () => {
    const user = userEvent.setup()
    render(<SettingsPage />)

    const companyNameInput = screen.getByLabelText(/Company Name/i)
    await user.clear(companyNameInput)
    await user.type(companyNameInput, 'Updated Company')

    expect(companyNameInput).toHaveValue('Updated Company')
  })

  it('displays correct default values', async () => {
    render(<SettingsPage />)

    // Check default values
    expect(screen.getByDisplayValue('Pacific/Auckland')).toBeInTheDocument()
    expect(screen.getByDisplayValue('NZD')).toBeInTheDocument()
    expect(screen.getByDisplayValue('15')).toBeInTheDocument()
    expect(screen.getByDisplayValue('GST')).toBeInTheDocument()
  })

  it('handles radio button selection for quote presentation', async () => {
    const user = userEvent.setup()
    render(<SettingsPage />)

    const proposalRadio = screen.getByLabelText('Proposal')
    await user.click(proposalRadio)

    expect(proposalRadio).toBeChecked()
  })

  it('handles select dropdown changes', async () => {
    const user = userEvent.setup()
    render(<SettingsPage />)

    const timezoneSelect = screen.getByLabelText(/Time Zone/i)
    await user.selectOptions(timezoneSelect, 'America/New_York')

    expect(timezoneSelect).toHaveValue('America/New_York')
  })

  it('handles number input changes', async () => {
    const user = userEvent.setup()
    render(<SettingsPage />)

    const taxRateInput = screen.getByLabelText(/Default Sales Tax/i)
    await user.clear(taxRateInput)
    await user.type(taxRateInput, '20')

    expect(taxRateInput).toHaveValue(20)
  })

  it('handles textarea input changes', async () => {
    const user = userEvent.setup()
    render(<SettingsPage />)

    const addressTextarea = screen.getByLabelText(/Address/i)
    await user.clear(addressTextarea)
    await user.type(addressTextarea, '456 New Street, Auckland')

    expect(addressTextarea).toHaveValue('456 New Street, Auckland')
  })
}) 