import { useState, useCallback } from 'react';
import { z } from 'zod';

interface FieldError {
  message: string;
}

interface UseFormValidationReturn<T extends Record<string, unknown>> {
  errors: Partial<Record<keyof T, FieldError>>;
  touched: Partial<Record<keyof T, boolean>>;
  validateField: (field: keyof T, value: unknown) => boolean;
  validateAllFields: (data: T) => boolean;
  setFieldTouched: (field: keyof T) => void;
  clearFieldError: (field: keyof T) => void;
  getFieldError: (field: keyof T) => string | undefined;
  isFieldInvalid: (field: keyof T) => boolean;
  resetValidation: () => void;
}

export function useFormValidation<T extends Record<string, unknown>>(
  schema: z.ZodSchema<T>
): UseFormValidationReturn<T> {
  const [errors, setErrors] = useState<Partial<Record<keyof T, FieldError>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  const validateField = useCallback(
    (field: keyof T, value: unknown): boolean => {
      // Create a partial object with just this field to validate
      const partialData = { [field]: value } as Partial<T>;
      
      try {
        // Try to validate the field by parsing with the schema
        // We use safeParse and look for errors specific to this field
        const result = schema.safeParse(partialData);
        
        if (!result.success) {
          const fieldErrors = result.error.errors.filter(
            (err) => err.path[0] === field
          );
          
          if (fieldErrors.length > 0) {
            setErrors((prev) => ({
              ...prev,
              [field]: { message: fieldErrors[0].message },
            }));
            return false;
          }
        }
        
        // Clear error if valid
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
        return true;
      } catch {
        return true; // Don't block on validation errors
      }
    },
    [schema]
  );

  const validateAllFields = useCallback(
    (data: T): boolean => {
      const result = schema.safeParse(data);
      
      if (!result.success) {
        const newErrors: Partial<Record<keyof T, FieldError>> = {};
        const newTouched: Partial<Record<keyof T, boolean>> = {};
        
        result.error.errors.forEach((err) => {
          const field = err.path[0] as keyof T;
          if (!newErrors[field]) {
            newErrors[field] = { message: err.message };
          }
          newTouched[field] = true;
        });
        
        setErrors(newErrors);
        setTouched((prev) => ({ ...prev, ...newTouched }));
        return false;
      }
      
      setErrors({});
      return true;
    },
    [schema]
  );

  const setFieldTouched = useCallback((field: keyof T) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  const clearFieldError = useCallback((field: keyof T) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const getFieldError = useCallback(
    (field: keyof T): string | undefined => {
      return touched[field] ? errors[field]?.message : undefined;
    },
    [errors, touched]
  );

  const isFieldInvalid = useCallback(
    (field: keyof T): boolean => {
      return !!touched[field] && !!errors[field];
    },
    [errors, touched]
  );

  const resetValidation = useCallback(() => {
    setErrors({});
    setTouched({});
  }, []);

  return {
    errors,
    touched,
    validateField,
    validateAllFields,
    setFieldTouched,
    clearFieldError,
    getFieldError,
    isFieldInvalid,
    resetValidation,
  };
}
