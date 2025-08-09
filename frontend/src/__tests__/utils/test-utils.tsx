import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from 'react-query'

// Create a custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

// Re-export everything
export * from '@testing-library/react'
export { customRender as render }

// Mock data helpers
export const mockSettingsData = {
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

export const mockUser = {
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
  status: 'active',
}

// Mock API responses
export const mockApiResponses = {
  success: {
    ok: true,
    json: async () => ({
      success: true,
      data: mockSettingsData,
    }),
  },
  error: {
    ok: false,
    json: async () => ({
      success: false,
      message: 'An error occurred',
    }),
  },
  networkError: new Error('Network error'),
}

// Test helpers
export const waitForLoadingToFinish = () =>
  new Promise(resolve => setTimeout(resolve, 0))

export const createMockFile = (name: string, type: string = 'image/png') =>
  new File(['test'], name, { type }) 