"use client";

import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import clsx from "clsx";

const MODULE_LABELS = {
  finance: "Finance",
  goals: "Goals",
  career: "Career",
  skills: "Skills",
  reflection: "Life Compass · Jurnal",
  review: "Life Compass · Ritual Mingguan",
};

export default function ChatMessage({ role, content, manifest }) {
  const isUser = role === "user";
  return (
    <div className={clsx("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={clsx(
          "max-w-[85%] rounded-2xl px-4 py-3 text-[14px] leading-relaxed",
          isUser
            ? "bg-forest-700 text-forest-50 dark:bg-lime dark:text-forest-800"
            : "card"
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{content}</p>
        ) : (
          <div className="prose-chat">
            <Markdown remarkPlugins={[remarkGfm]}>{content || "…"}</Markdown>
          </div>
        )}
        {!isUser && manifest?.length > 0 && (
          <div className="eyebrow mt-2 text-ink-muted">
            Sumber: {manifest.map((m) => MODULE_LABELS[m] || m).join(" · ")}
          </div>
        )}
      </div>
    </div>
  );
}
