import type { LoginCredentials, MenuFormData, ValidationError } from '../types';

/**
 * Validates login form data
 */
export function validateLoginForm(formData: LoginCredentials): ValidationError[] {
  const errors: ValidationError[] = [];
  
  if (!formData.storeId) {
    errors.push({ field: 'storeId', message: '매장 식별자를 입력해주세요' });
  }
  
  if (!formData.username) {
    errors.push({ field: 'username', message: '사용자명을 입력해주세요' });
  }
  
  if (!formData.password) {
    errors.push({ field: 'password', message: '비밀번호를 입력해주세요' });
  }
  
  return errors;
}

/**
 * Validates menu form data
 */
export function validateMenuForm(formData: MenuFormData): ValidationError[] {
  const errors: ValidationError[] = [];
  
  if (!formData.nameKo) {
    errors.push({ field: 'nameKo', message: '메뉴명(한글)을 입력해주세요' });
  }
  
  if (!formData.nameEn) {
    errors.push({ field: 'nameEn', message: '메뉴명(영문)을 입력해주세요' });
  }
  
  if (!formData.categoryId) {
    errors.push({ field: 'categoryId', message: '카테고리를 선택해주세요' });
  }
  
  if (formData.price <= 0) {
    errors.push({ field: 'price', message: '가격은 0보다 커야 합니다' });
  }
  
  if (formData.imageUrl && !isValidUrl(formData.imageUrl)) {
    errors.push({ field: 'imageUrl', message: '올바른 URL 형식이 아닙니다' });
  }
  
  return errors;
}

/**
 * Validates URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return url.startsWith('http://') || url.startsWith('https://');
  } catch {
    return false;
  }
}
