import { validateLoginForm, isValidUrl } from '../../src/utils/validation';

describe('Validation Utils', () => {
  describe('validateLoginForm', () => {
    it('should detect missing storeId', () => {
      const formData = {
        storeId: '',
        username: 'admin',
        password: 'password'
      };

      const errors = validateLoginForm(formData);

      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe('storeId');
    });

    it('should detect missing username', () => {
      const formData = {
        storeId: 'store-123',
        username: '',
        password: 'password'
      };

      const errors = validateLoginForm(formData);

      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe('username');
    });

    it('should detect missing password', () => {
      const formData = {
        storeId: 'store-123',
        username: 'admin',
        password: ''
      };

      const errors = validateLoginForm(formData);

      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe('password');
    });

    it('should return no errors for valid data', () => {
      const formData = {
        storeId: 'store-123',
        username: 'admin',
        password: 'password'
      };

      const errors = validateLoginForm(formData);

      expect(errors).toHaveLength(0);
    });
  });

  describe('isValidUrl', () => {
    it('should validate http URL', () => {
      expect(isValidUrl('http://example.com/image.jpg')).toBe(true);
    });

    it('should validate https URL', () => {
      expect(isValidUrl('https://example.com/image.jpg')).toBe(true);
    });

    it('should reject invalid URL', () => {
      expect(isValidUrl('not-a-url')).toBe(false);
    });

    it('should reject URL without protocol', () => {
      expect(isValidUrl('example.com/image.jpg')).toBe(false);
    });
  });
});
