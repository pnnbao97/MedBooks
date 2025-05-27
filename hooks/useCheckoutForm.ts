// hooks/useCheckoutForm.ts
import { useState, useCallback } from 'react';
import type { CheckoutData } from '@/lib/checkout';

export interface FormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  address?: string;
  district?: string;
  submit?: string;
}

export const useCheckoutForm = (initialData: CheckoutData) => {
  const [formData, setFormData] = useState<CheckoutData>(initialData);
  const [errors, setErrors] = useState<FormErrors>({});

  const validateField = useCallback((field: string, value: string): string => {
    switch (field) {
      case 'fullName':
        return !value.trim() ? 'Vui lòng nhập họ tên' : '';
      case 'email':
        if (!value.trim()) return 'Vui lòng nhập email';
        return !/\S+@\S+\.\S+/.test(value) ? 'Email không hợp lệ' : '';
      case 'phone':
        if (!value.trim()) return 'Vui lòng nhập số điện thoại';
        return !/^[0-9]{10,11}$/.test(value.replace(/\D/g, '')) ? 'Số điện thoại không hợp lệ' : '';
      case 'address':
        return !value.trim() ? 'Vui lòng nhập địa chỉ' : '';
      case 'district':
        return !value.trim() ? 'Vui lòng chọn quận/huyện' : '';
      default:
        return '';
    }
  }, []);

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};
    
    newErrors.fullName = validateField('fullName', formData.customerInfo.fullName);
    newErrors.email = validateField('email', formData.customerInfo.email);
    newErrors.phone = validateField('phone', formData.customerInfo.phone);
    newErrors.address = validateField('address', formData.customerInfo.address);
    newErrors.district = validateField('district', formData.customerInfo.district);
    
    // Remove empty errors
    Object.keys(newErrors).forEach(key => {
      if (!newErrors[key as keyof FormErrors]) {
        delete newErrors[key as keyof FormErrors];
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, validateField]);

  const updateField = useCallback((field: keyof CheckoutData['customerInfo'], value: string) => {
    setFormData(prev => ({
      ...prev,
      customerInfo: {
        ...prev.customerInfo,
        [field]: value
      }
    }));
    
    // Clear field error on change
    const fieldError = validateField(field, value);
    setErrors(prev => ({
      ...prev,
      [field]: fieldError || undefined
    }));
  }, [validateField]);

  const updatePaymentMethod = useCallback((method: 'COD' | 'BANKING') => {
    setFormData(prev => ({ ...prev, paymentMethod: method }));
  }, []);

  const updateSaveAddress = useCallback((save: boolean) => {
    setFormData(prev => ({ ...prev, saveAddress: save }));
  }, []);

  const clearSubmitError = useCallback(() => {
    setErrors(prev => ({ ...prev, submit: undefined }));
  }, []);

  const setSubmitError = useCallback((error: string) => {
    setErrors(prev => ({ ...prev, submit: error }));
  }, []);

  return {
    formData,
    errors,
    validateForm,
    updateField,
    updatePaymentMethod,
    updateSaveAddress,
    clearSubmitError,
    setSubmitError
  };
};

