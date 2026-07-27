// src/app/lt/Button.tsx
"use client";

import React from "react";

type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "primary" | "secondary";
  disabled?: boolean;
};

export default function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  disabled = false,
}: ButtonProps) {
  const baseStyle =
    "rounded-md px-5 py-2 text-sm font-medium " +
    "transition-all focus:outline-none focus:ring-2 " +
    "focus:ring-blue-600 focus:ring-offset-2 " +
    "disabled:cursor-not-allowed disabled:opacity-50";

  const variants = {
    primary:
      "bg-[#0f4c9c] text-white hover:bg-[#0c3d7e]",
    secondary:
      "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]}`}
    >
      {children}
    </button>
  );
}