// src/app/lt/Button.tsx
'use client';

import React from 'react';

type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
};

export default function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  disabled = false,
}: ButtonProps) {
  // 共通の土台スタイル（ホバー時の変化、フォーカス、無効化時の透明度などを設定）
  const baseStyle = 'px-5 py-2 rounded-md font-medium text-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 disabled:opacity-50';
  
  // Figmaに合わせたカラバリ
  const variants = {
    primary: 'bg-[#0f4c9c] text-white hover:bg-[#0c3d7e]', // 登録用の濃い青
    secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50', // キャンセル用の白
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