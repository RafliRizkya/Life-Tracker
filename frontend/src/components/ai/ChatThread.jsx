"use client";

import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useLifeStore } from "@/lib/store";
import { useAiStore } from "@/lib/aiStore";
import ChatMessage from "./ChatMessage";

function TypingIndicator({ reducedMotion }) {
  return (
    <div className="flex justify-start">
      <div className="border border-line/70 dark:border-night-border/70 bg-card/60 dark:bg-night-card/60 rounded-2xl px-4 py-3 flex gap-1 items-center">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-ink-muted"
            animate={reducedMotion ? {} : { opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>
    </div>
  );
}

export default function ChatThread({ messages, waitingForFirstToken }) {
  const bottomRef = useRef(null);
  const streaming = useAiStore((s) => s.streaming);
  const storeReducedMotion = useLifeStore((s) => s.settings.reducedMotion);
  const osReducedMotion = useReducedMotion();
  const reducedMotion = storeReducedMotion || osReducedMotion;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length, messages[messages.length - 1]?.content]);

  return (
    <div className="flex flex-col gap-3 py-4">
      {messages.map((m, i) => (
        <ChatMessage
          key={m.id}
          id={m.id}
          role={m.role}
          content={m.content}
          manifest={m.manifest}
          proposal={m.proposal}
          ghost={streaming && i === messages.length - 1 && m.role === "assistant"}
          reducedMotion={reducedMotion}
        />
      ))}
      {waitingForFirstToken && <TypingIndicator reducedMotion={reducedMotion} />}
      <div ref={bottomRef} />
    </div>
  );
}
