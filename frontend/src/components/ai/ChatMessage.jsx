"use client";

import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import clsx from "clsx";
import ActionProposalCard from "./ActionProposalCard";

const MODULE_LABELS = {
  finance: "Finance",
  goals: "Goals",
  career: "Career",
  skills: "Skills",
  reflection: "Life Compass (Jurnal)",
  review: "Life Compass (Ritual)",
};

/**
 * `ghost` = still streaming: rendered dimmed (Cursor-style suggestion register)
 * and settles to full opacity when the response completes. Assistant bubbles use
 * a soft surface — deliberately lighter than `card`, which elsewhere means
 * "saved/committed content" — while the citation badge keeps full prominence.
 */
export default function ChatMessage({ id, role, content, manifest, proposal, ghost = false, reducedMotion = false }) {
  const isUser = role === "user";
  return (
    <div className={clsx("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={clsx(
          "max-w-[85%] rounded-2xl px-4 py-3 text-[14px] leading-relaxed",
          isUser
            ? "bg-forest-700 text-forest-50 dark:bg-lime dark:text-forest-800"
            : "border border-line/70 dark:border-night-border/70 bg-card/60 dark:bg-night-card/60 text-ink-soft",
          !isUser && !reducedMotion && "transition-opacity duration-300",
          !isUser && ghost && "opacity-75"
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
        {!isUser && proposal && <ActionProposalCard messageId={id} proposal={proposal} />}
      </div>
    </div>
  );
}
