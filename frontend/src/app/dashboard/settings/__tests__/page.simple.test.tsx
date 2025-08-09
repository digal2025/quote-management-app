import React from 'react'
import { render, screen } from '@testing-library/react'
import SettingsPage from '../page'

// Simple test to verify the component renders
describe('SettingsPage Simple Test', () => {
  it('should render the settings page', () => {
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => 'mock-token'),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    })

    // Mock fetch
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, data: {} }),
      })
    ) as jest.Mock

    render(<SettingsPage />)
    
    // Basic assertion to check if component renders
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })
}) 