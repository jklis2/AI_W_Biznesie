'use client';
import { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

interface BaseInputProps {
  label?: string;
  error?: string;
}

interface StandardInputProps extends InputHTMLAttributes<HTMLInputElement>, BaseInputProps {
  variant?: 'input';
}

interface TextareaInputProps extends TextareaHTMLAttributes<HTMLTextAreaElement>, BaseInputProps {
  variant: 'textarea';
  rows?: number;
}

type InputProps = StandardInputProps | TextareaInputProps;

export default function Input({ label, error, className = '', variant = 'input', ...props }: InputProps) {
  const inputClassName = `w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${error ? 'border-red-500' : 'border-gray-300'} ${className}`;

  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      {variant === 'textarea' ? (
        <textarea className={inputClassName} rows={(props as TextareaInputProps).rows || 4} {...(props as TextareaInputProps)} />
      ) : (
        <input type={(props as StandardInputProps).type || 'text'} className={inputClassName} {...(props as StandardInputProps)} />
      )}
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
