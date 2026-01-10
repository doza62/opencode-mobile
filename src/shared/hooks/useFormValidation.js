import { useState, useCallback } from 'react';

/**
 * Hook for form validation with real-time feedback
 * @param {Object} validationRules - Object with field names as keys and validation functions as values
 * @param {Object} initialValues - Initial form values
 * @returns {Object} - Form state, validation state, and handlers
 */
export const useFormValidation = (validationRules = {}, initialValues = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = useCallback((fieldName, value) => {
    const rule = validationRules[fieldName];
    if (!rule) return '';

    try {
      const error = rule(value, values);
      return error || '';
    } catch (err) {
      return 'Validation error';
    }
  }, [validationRules, values]);

  const validateForm = useCallback(() => {
    const newErrors = {};
    let isValid = true;

    Object.keys(validationRules).forEach(fieldName => {
      const error = validateField(fieldName, values[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [validationRules, values, validateField]);

  const handleChange = useCallback((fieldName, value) => {
    setValues(prev => ({ ...prev, [fieldName]: value }));

    // Clear error when user starts typing
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: '' }));
    }
  }, [errors]);

  const handleBlur = useCallback((fieldName) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));

    const error = validateField(fieldName, values[fieldName]);
    if (error) {
      setErrors(prev => ({ ...prev, [fieldName]: error }));
    }
  }, [validateField, values]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateForm,
    reset,
    isValid: Object.keys(errors).length === 0
  };
};