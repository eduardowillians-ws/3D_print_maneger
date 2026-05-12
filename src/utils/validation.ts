/**
 * Utilitário de Validação e Sanitização de Inputs
 * PrintPulse 3D - Módulo de Segurança
 */

export const validationUtils = {
  sanitizeString(input: string): string {
    if (!input) return '';
    return input
      .replace(/[<>'"&]/g, '')
      .trim()
      .slice(0, 500);
  },

  sanitizeEmail(input: string): string {
    if (!input) return '';
    return input
      .replace(/[<>'"]/g, '')
      .trim()
      .toLowerCase()
      .slice(0, 255);
  },

  sanitizePhone(input: string): string {
    if (!input) return '';
    return input
      .replace(/[^\d\s\-\+\(\)]/g, '')
      .trim()
      .slice(0, 20);
  },

  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  validatePhone(phone: string): boolean {
    const phoneRegex = /^[\d\s\-\+\(\)]{8,20}$/;
    return phoneRegex.test(phone);
  },

  validatePassword(password: string): { valid: boolean; message: string } {
    if (password.length < 6) {
      return { valid: false, message: 'A senha deve ter pelo menos 6 caracteres' };
    }
    if (password.length > 128) {
      return { valid: false, message: 'A senha deve ter no máximo 128 caracteres' };
    }
    return { valid: true, message: '' };
  },

  validateRequired(value: string | number | null | undefined, fieldName: string): { valid: boolean; message: string } {
    if (value === null || value === undefined || value === '') {
      return { valid: false, message: `${fieldName} é obrigatório` };
    }
    return { valid: true, message: '' };
  },

  validateMinLength(value: string, min: number, fieldName: string): { valid: boolean; message: string } {
    if (value.length < min) {
      return { valid: false, message: `${fieldName} deve ter pelo menos ${min} caracteres` };
    }
    return { valid: true, message: '' };
  },

  validateMaxLength(value: string, max: number, fieldName: string): { valid: boolean; message: string } {
    if (value.length > max) {
      return { valid: false, message: `${fieldName} deve ter no máximo ${max} caracteres` };
    }
    return { valid: true, message: '' };
  },

  validateNumber(value: string | number, fieldName: string): { valid: boolean; value: number; message: string } {
    const num = typeof value === 'string' ? parseFloat(value.replace(',', '.')) : value;
    if (isNaN(num)) {
      return { valid: false, value: 0, message: `${fieldName} deve ser um número válido` };
    }
    return { valid: true, value: num, message: '' };
  },

  validatePositiveNumber(value: string | number, fieldName: string): { valid: boolean; value: number; message: string } {
    const result = this.validateNumber(value, fieldName);
    if (!result.valid) return result;
    if (result.value < 0) {
      return { valid: false, value: 0, message: `${fieldName} deve ser um número positivo` };
    }
    return result;
  },

  validateRange(value: number, min: number, max: number, fieldName: string): { valid: boolean; value: number; message: string } {
    if (value < min || value > max) {
      return { valid: false, value, message: `${fieldName} deve estar entre ${min} e ${max}` };
    }
    return { valid: true, value, message: '' };
  },

  validateDate(date: string): { valid: boolean; message: string } {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return { valid: false, message: 'Data inválida' };
    }
    return { valid: true, message: '' };
  },

  validateForm<T extends Record<string, unknown>>(data: T, rules: Record<keyof T, (value: T[keyof T]) => { valid: boolean; message: string }>): { valid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {};
    let valid = true;

    for (const key in rules) {
      const result = rules[key](data[key]);
      if (!result.valid) {
        errors[key as string] = result.message;
        valid = false;
      }
    }

    return { valid, errors };
  }
};

export const inputMasks = {
  phone(value: string): string {
    return value
      .replace(/\D/g, '')
      .replace(/^(\d{2})(\d)/g, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .slice(0, 15);
  },

  cep(value: string): string {
    return value
      .replace(/\D/g, '')
      .replace(/^(\d{5})(\d)/, '$1-$2')
      .slice(0, 9);
  },

  cpf(value: string): string {
    return value
      .replace(/\D/g, '')
      .replace(/^(\d{3})(\d)/, '$1.$2')
      .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4')
      .slice(0, 14);
  },

  currency(value: string): string {
    const cleaned = value.replace(/\D/g, '');
    const num = parseFloat(cleaned) / 100;
    return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  },

  onlyNumbers(value: string): string {
    return value.replace(/\D/g, '');
  }
};

export default validationUtils;
