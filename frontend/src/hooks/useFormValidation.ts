import { useState, useCallback } from 'react';

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  email?: boolean;
  /** Se true, valida como URL quando o campo não estiver vazio */
  url?: boolean;
  custom?: (value: any, allValues?: Record<string, any>) => string | null;
}

export interface ValidationRules {
  [key: string]: ValidationRule;
}

export interface FormErrors {
  [key: string]: string;
}

export function useFormValidation<T extends Record<string, any>>(
  initialValues: T,
  rules: ValidationRules
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = useCallback(
    (name: string, value: any, allValues?: T): string | null => {
      const rule = rules[name];
      if (!rule) return null;

      const stringValue = typeof value === 'string' ? value : String(value || '');

      // Required
      if (rule.required) {
        if (typeof value === 'number') {
          if (value === null || value === undefined || isNaN(value)) {
            return 'Este campo é obrigatório';
          }
        } else if (!value || stringValue.trim() === '') {
          return 'Este campo é obrigatório';
        }
      }

      // Skip other validations if field is empty and not required
      if (typeof value === 'number') {
        if ((value === null || value === undefined || isNaN(value)) && !rule.required) {
          return null;
        }
      } else if (!value || stringValue.trim() === '') {
        return null;
      }

      // Min/Max for numbers (aceita number ou string numérica)
      const numValue =
        typeof value === 'number' ? value : typeof stringValue === 'string' && stringValue.trim() !== '' ? Number(stringValue) : NaN;
      if (!isNaN(numValue) && (rule.min !== undefined || rule.max !== undefined)) {
        if (rule.min !== undefined && numValue < rule.min) {
          return `Valor mínimo: ${rule.min}`;
        }
        if (rule.max !== undefined && numValue > rule.max) {
          return `Valor máximo: ${rule.max}`;
        }
      }

      // Min length
      if (rule.minLength && stringValue.length < rule.minLength) {
        return `Mínimo de ${rule.minLength} caracteres`;
      }

      // Max length
      if (rule.maxLength && stringValue.length > rule.maxLength) {
        return `Máximo de ${rule.maxLength} caracteres`;
      }

      // Email
      if (rule.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(stringValue)) {
          return 'Email inválido';
        }
      }

      // Pattern
      if (rule.pattern && !rule.pattern.test(stringValue)) {
        return 'Formato inválido';
      }

      // URL (opcional: só valida se tiver conteúdo)
      if (rule.url && stringValue.trim() !== '') {
        try {
          new URL(stringValue);
        } catch {
          return 'URL inválida';
        }
      }

      // Custom validation
      if (rule.custom) {
        const customError = rule.custom(value, allValues || values);
        if (customError) {
          return customError;
        }
      }

      return null;
    },
    [rules, values]
  );

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    Object.keys(rules).forEach((key) => {
      const error = validateField(key, values[key], values);
      if (error) {
        newErrors[key] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [values, rules, validateField]);

  const handleChange = useCallback(
    (name: string, value: any) => {
      setValues((prev) => ({ ...prev, [name]: value }));

      // Clear error when user starts typing
      if (errors[name]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    },
    [errors]
  );

  const handleBlur = useCallback(
    (name: string) => {
      setTouched((prev) => ({ ...prev, [name]: true }));
      const error = validateField(name, values[name], values);
      if (error) {
        setErrors((prev) => ({ ...prev, [name]: error }));
      } else {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    },
    [values, validateField]
  );

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  const setFieldValue = useCallback((name: string, value: any) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const getFieldProps = useCallback(
    (name: string) => {
      const val = values[name];
      const value =
        typeof val === 'number' ? val : val === undefined || val === null ? '' : String(val);
      return {
        value,
        onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
          handleChange(name, e.target.value),
        onBlur: () => handleBlur(name),
        error: touched[name] ? errors[name] : undefined,
      };
    },
    [values, errors, touched, handleChange, handleBlur]
  );

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateForm,
    resetForm,
    setFieldValue,
    getFieldProps,
    isValid: Object.keys(errors).length === 0,
  };
}
