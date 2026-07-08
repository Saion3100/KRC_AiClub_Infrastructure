// src/app/lt/Input.tsx
'use client';

import React from 'react';

type InputProps = {
  label?: string;
  name: string;
  type?: 'text' | 'date' | 'url';
  placeholder?: string;
  required?: boolean;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  isTextArea?: boolean;
  rows?: number;
};

export default function Input({
  label,
  name,
  type = 'text',
  placeholder,
  required = false,
  value,
  onChange,
  isTextArea = false,
  rows = 3,
}: InputProps) {
  const inputStyle = "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#0f4c9c] focus:border-[#0f4c9c] text-sm";

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      {isTextArea ? (
        <textarea
          name={name}
          rows={rows}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`${inputStyle} resize-none`}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={inputStyle}
        />
      )}
    </div>
  );
}