# Settings Page Test Suite

This directory contains comprehensive unit tests for the Settings page component.

## Test Files

### `page.test.tsx`
Main unit test file that covers:
- Component rendering
- Form field interactions
- API integration
- Error handling
- User interactions
- Validation
- Loading states

### `page.integration.test.tsx`
Integration test file that covers:
- Complete user workflows
- End-to-end scenarios
- Form submission processes
- File upload functionality
- Accessibility features

## Test Coverage

The test suite covers the following areas:

### ✅ Component Rendering
- [x] Page loads with all sections
- [x] Form fields display correctly
- [x] Default values are set
- [x] Loading states work properly

### ✅ User Interactions
- [x] Form field updates
- [x] File uploads
- [x] Dropdown selections
- [x] Radio button selections
- [x] Form submission
- [x] Form cancellation

### ✅ API Integration
- [x] Settings loading on mount
- [x] Settings saving on submit
- [x] Error handling
- [x] Network error handling
- [x] Validation errors

### ✅ Form Validation
- [x] Required field validation
- [x] Field type validation
- [x] Error message display
- [x] Form state management

### ✅ Accessibility
- [x] Proper labels
- [x] Keyboard navigation
- [x] Screen reader support
- [x] Focus management

### ✅ Error Handling
- [x] Network errors
- [x] API errors
- [x] Validation errors
- [x] User feedback

## Running Tests

### Run all tests
```bash
npm test
```

### Run settings tests only
```bash
npm run test:settings
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Run tests with coverage
```bash
npm run test:coverage
```

## Test Structure

### Unit Tests (`page.test.tsx`)
- Individual component functionality
- Isolated component testing
- Mock dependencies
- Fast execution

### Integration Tests (`page.integration.test.tsx`)
- Complete user workflows
- Real-world scenarios
- End-to-end testing
- User experience validation

## Mocking Strategy

### Components
- UI components are mocked to focus on business logic
- Icons are mocked for consistent testing
- Form components are mocked for easier interaction testing

### External Dependencies
- `next/navigation` - Router functionality
- `react-hot-toast` - Toast notifications
- `localStorage` - Browser storage
- `fetch` - API calls
- `File` and `FormData` - File uploads

## Test Data

### Mock Settings Data
```typescript
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
```

### Mock API Responses
```typescript
const mockApiResponses = {
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
}
```

## Best Practices

1. **Test Isolation**: Each test is independent and doesn't rely on other tests
2. **Mocking**: External dependencies are properly mocked
3. **User-Centric**: Tests focus on user interactions and workflows
4. **Accessibility**: Tests include accessibility considerations
5. **Error Scenarios**: Both success and error cases are covered
6. **Realistic Data**: Mock data reflects real-world scenarios

## Coverage Goals

- **Lines**: 90%+
- **Branches**: 85%+
- **Functions**: 90%+
- **Statements**: 90%+

## Maintenance

- Update tests when component functionality changes
- Add new tests for new features
- Review and update mocks as needed
- Keep test data current with actual data structures 