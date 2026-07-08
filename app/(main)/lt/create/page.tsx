// src/app/lt/create/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createLtAction } from '../../../lib/actions';
import Input from '../Input';
import Button from '../Button';

const CATEGORIES = [
  'MACHINE LEARNING',
  'INFRASTRUCTURE',
  'FRONTEND',
  'BACKEND',
  'DESIGN',
];

export default function LtNewPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0], // 初期値：今日
    material_url: '',
    category: CATEGORIES[0],
    summary: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // フォーム送信時のハンドラー
  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      // FormDataオブジェクトを作成してServer Actionに渡す
      const data = new FormData();
      data.append('title', formData.title);
      data.append('date', formData.date);
      data.append('material_url', formData.material_url);
      data.append('category', formData.category);
      data.append('summary', formData.summary);

      // 元コードのServer Actionを実行
      await createLtAction(data);
      
      alert('LTを登録しました。');
      router.push('/lt');
    } catch (error) {
      console.error(error);
      alert('登録に失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1000px] px-6 py-4 h-full flex flex-col justify-center">
      <div className="mb-2">
        <small className="text-gray-500">LT一覧 ＞ 新規作成</small>
        <h1 className="m-0 text-2xl font-bold text-gray-800">LT作成</h1>
        <p className="text-sm text-[#596171] mt-0.5">
          LT登録用の入力枠です。ログインユーザー情報と紐づいて保存されます。
        </p>
      </div>

      {/* 画面内に収めるため、余白を調整したフォーム */}
      <form onSubmit={handleFormSubmit} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          
          {/* 左側カラム */}
          <div className="space-y-4">
            <Input
              label="タイトル *"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="タイトルを入力"
            />

            <Input
              label="日付 *"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              required
            />

            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                カテゴリ
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#0f4c9c] focus:border-[#0f4c9c] text-sm bg-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 右側カラム */}
          <div className="flex flex-col justify-between">
            <Input
              label="資料URL"
              name="material_url"
              type="url"
              value={formData.material_url}
              onChange={handleChange}
              placeholder="https://..."
            />

            <div className="mt-4 flex-1 flex flex-col">
              <Input
                label="概要 *"
                name="summary"
                value={formData.summary}
                onChange={handleChange}
                isTextArea
                rows={4}
                required
                placeholder="概要を入力"
              />
            </div>
          </div>
        </div>

        {/* ボタンエリア */}
        <div className="mt-6 flex justify-end gap-4 border-t border-gray-100 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push('/lt')}
            disabled={loading}
          >
            キャンセル
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? '登録中...' : '登録する'}
          </Button>
        </div>
      </form>
    </div>
  );
}