"use client";

import { useSearchParams } from "next/navigation";

export default function CheckEmailPage() {
  const searchParams = useSearchParams();
  const state = searchParams.get("state");
  return (
    <div className="container mx-auto p-4 text-center">
      <h1 className="text-2xl font-semibold mb-4">メール確認のお願い</h1>
      <p className="mb-2">ご登録ありがとうございます。</p>
      <p className="mb-4">
        入力いただいたメールアドレス宛に確認リンクを送信しました。
      </p>
      <p className="text-sm text-gray-500">状態ID: {state}</p>
      <p>リンクをクリック後、ダッシュボード画面に自動で遷移します。</p>
    </div>
  );
}
