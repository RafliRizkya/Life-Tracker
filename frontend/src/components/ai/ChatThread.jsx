"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useLifeStore } from "@/lib/store";
import ChatMessage from "./ChatMessage";

function TypingIndicator() {
  const reducedMotion = useLifeStore((s) => s.settings.reducedMotion);
  return (
    <div className="flex justify-start">
      <div className="card px-4 py-3 flex gap-1 items-center">
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

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length, messages[messages.length - 1]?.content]);

  return (
    <div className="flex flex-col gap-3 py-4">
      {messages.map((m) => (
        <ChatMessage key={m.id} role={m.role} content={m.content} manifest={m.manifest} />
      ))}
      {waitingForFirstToken && <TypingIndicator />}
      <div ref={bottomRef} />
    </div>
  );
}
