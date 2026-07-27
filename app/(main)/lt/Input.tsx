// src/app/(main)/lt/Input.tsx
"use client";

import React from "react";

type InputProps = {
  label?: string;
  name: string;
  type?: "text" | "date" | "url";
  placeholder?: string;
  required?: boolean;
  value: string;
  onChange: (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >,
  ) => void;
  isTextArea?: boolean;
  rows?: number;

  // 登録中に入力できないようにする設定
  disabled?: boolean;
};

export default function Input({
  label,
  name,
  type = "text",
  placeholder,
  required = false,
  value,
  onChange,
  isTextArea = false,
  rows = 3,
  disabled = false,
}: InputProps) {
  const inputStyle = [
    "w-full rounded-md border border-gray-300",
    "px-3 py-2 text-sm shadow-sm",
    "focus:border-[#0f4c9c]",
    "focus:outline-none",
    "focus:ring-1",
    "focus:ring-[#0f4c9c]",
    "disabled:cursor-not-allowed",
    "disabled:bg-gray-100",
    "disabled:text-gray-500",
  ].join(" ");

  return (
    <div className="w-full">
      {label && (
        <label className="mb-1 block text-sm font-medium text-gray-700">
          <span className="inline-block">
            {label}

            {required && (
              <span className="ml-1 font-bold text-red-500">
                *
              </span>
            )}
          </span>
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
          disabled={disabled}
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
          disabled={disabled}
          className={inputStyle}
        />
      )}
    </div>
  );
}