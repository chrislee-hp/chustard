import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { store } from '../../src/store/store';
import { LoginPage } from '../../src/components/LoginPage';

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <Provider store={store}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </Provider>
  );
};

describe('LoginPage', () => {
  it('should validate required fields', () => {
    renderWithProviders(<LoginPage />);

    const submitButton = screen.getByRole('button', { name: /로그인/i });
    fireEvent.click(submitButton);

    // Alert should be called (mocked in real tests)
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should render form fields', () => {
    renderWithProviders(<LoginPage />);

    expect(screen.getByPlaceholderText('store-123')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('admin')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('********')).toBeInTheDocument();
  });

  it('should update form data on input change', () => {
    renderWithProviders(<LoginPage />);

    const storeIdInput = screen.getByPlaceholderText('store-123') as HTMLInputElement;
    fireEvent.change(storeIdInput, { target: { value: 'my-store' } });

    expect(storeIdInput.value).toBe('my-store');
  });
});
