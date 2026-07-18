"use client";

import { useState } from "react";
import { Send } from "lucide-react";

export default function ChatInput({ onSend, disabled }) {
  const [value, setValue] = useState("");

  function submit() {
    const text = value.trim();
    if (!text || disabled) return;
    onSend(text);
    setValue("");
  }

  function onKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  return (
    <div className="flex items-end gap-2">
      <textarea
        rows={2}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKeyDown}
        disabled={disabled}
        placeholder="Tanya sesuatu tentang finance, goals, career, skills…"
        className="input resize-none"
        data-testid="ai-chat-input"
      />
      <button
        type="button"
        onClick={submit}
        disabled={disabled || !value.trim()}
        className="btn-dark shrink-0 disabled:opacity-40"
        data-testid="ai-chat-send"
        aria-label="Kirim pesan"
      >
        <Send className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
