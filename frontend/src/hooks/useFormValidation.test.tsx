import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFormValidation } from './useFormValidation';

describe('useFormValidation', () => {
  it('inicializa com valores e sem erros', () => {
    const { result } = renderHook(() =>
      useFormValidation(
        { email: '', name: '' },
        { email: { required: true }, name: { required: true } }
      )
    );
    expect(result.current.values).toEqual({ email: '', name: '' });
    expect(result.current.errors).toEqual({});
    expect(result.current.isValid).toBe(true);
  });

  it('validateForm retorna false e preenche erros quando campos obrigatórios vazios', () => {
    const { result } = renderHook(() =>
      useFormValidation(
        { email: '', name: '' },
        { email: { required: true }, name: { required: true } }
      )
    );
    let valid = false;
    act(() => {
      valid = result.current.validateForm();
    });
    expect(valid).toBe(false);
    expect(result.current.errors.email).toBe('Este campo é obrigatório');
    expect(result.current.errors.name).toBe('Este campo é obrigatório');
  });

  it('validateForm retorna true quando dados válidos', () => {
    const { result } = renderHook(() =>
      useFormValidation(
        { email: 'a@b.com', name: 'João' },
        { email: { required: true, email: true }, name: { required: true, minLength: 2 } }
      )
    );
    let valid = false;
    act(() => {
      valid = result.current.validateForm();
    });
    expect(valid).toBe(true);
    expect(result.current.errors).toEqual({});
  });

  it('valida email inválido', () => {
    const { result } = renderHook(() =>
      useFormValidation(
        { email: 'invalido' },
        { email: { required: true, email: true } }
      )
    );
    act(() => {
      result.current.validateForm();
    });
    expect(result.current.errors.email).toBe('Email inválido');
  });

  it('valida minLength', () => {
    const { result } = renderHook(() =>
      useFormValidation(
        { name: 'J' },
        { name: { required: true, minLength: 2 } }
      )
    );
    act(() => {
      result.current.validateForm();
    });
    expect(result.current.errors.name).toBe('Mínimo de 2 caracteres');
  });

  it('valida min/max para número', () => {
    const { result } = renderHook(() =>
      useFormValidation(
        { duration: 3 },
        { duration: { required: true, min: 5, max: 480 } }
      )
    );
    act(() => {
      result.current.validateForm();
    });
    expect(result.current.errors.duration).toBe('Valor mínimo: 5');
  });

  it('handleChange atualiza valor e limpa erro do campo', () => {
    const { result } = renderHook(() =>
      useFormValidation(
        { email: '' },
        { email: { required: true, email: true } }
      )
    );
    act(() => {
      result.current.validateForm();
    });
    expect(result.current.errors.email).toBeDefined();
    act(() => {
      result.current.handleChange('email', 'novo@email.com');
    });
    expect(result.current.values.email).toBe('novo@email.com');
    expect(result.current.errors.email).toBeUndefined();
  });

  it('getFieldProps retorna value, onChange, onBlur e error', () => {
    const { result } = renderHook(() =>
      useFormValidation(
        { name: 'Test' },
        { name: { required: true } }
      )
    );
    const props = result.current.getFieldProps('name');
    expect(props.value).toBe('Test');
    expect(typeof props.onChange).toBe('function');
    expect(typeof props.onBlur).toBe('function');
    expect('error' in props).toBe(true);
  });

  it('valida URL quando rule.url é true', () => {
    const { result } = renderHook(() =>
      useFormValidation(
        { link: 'não-é-url' },
        { link: { url: true } }
      )
    );
    act(() => {
      result.current.validateForm();
    });
    expect(result.current.errors.link).toBe('URL inválida');
  });

  it('não exige URL quando campo vazio e url: true', () => {
    const { result } = renderHook(() =>
      useFormValidation(
        { link: '' },
        { link: { url: true } }
      )
    );
    act(() => {
      result.current.validateForm();
    });
    expect(result.current.errors.link).toBeUndefined();
  });

  it('custom validator recebe value e allValues', () => {
    const { result } = renderHook(() =>
      useFormValidation(
        { password: '123', confirmPassword: '456' },
        {
          confirmPassword: {
            custom: (value, allValues) =>
              value !== allValues?.password ? 'As senhas não coincidem' : null,
          },
        }
      )
    );
    act(() => {
      result.current.validateForm();
    });
    expect(result.current.errors.confirmPassword).toBe('As senhas não coincidem');
  });

  it('resetForm restaura valores iniciais', () => {
    const { result } = renderHook(() =>
      useFormValidation(
        { email: '' },
        { email: { required: true } }
      )
    );
    act(() => {
      result.current.handleChange('email', 'alterado@x.com');
    });
    expect(result.current.values.email).toBe('alterado@x.com');
    act(() => {
      result.current.resetForm();
    });
    expect(result.current.values.email).toBe('');
    expect(result.current.errors).toEqual({});
  });
});
