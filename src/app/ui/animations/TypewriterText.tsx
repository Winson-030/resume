"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface TypewriterTextProps {
  text: string;
  speed?: number;
  delay?: number;
  className?: string;
  showCursor?: boolean;
  onComplete?: () => void;
}

export function TypewriterText({
  text,
  speed = 80,
  delay = 0,
  className = "",
  showCursor = true,
  onComplete,
}: TypewriterTextProps) {
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const startTimeout = setTimeout(() => {
      setIsTyping(true);
    }, delay);

    return () => clearTimeout(startTimeout);
  }, [delay]);

  useEffect(() => {
    if (!isTyping) return;

    if (displayText.length < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(text.slice(0, displayText.length + 1));
      }, speed);

      return () => clearTimeout(timeout);
    } else {
      setIsComplete(true);
      onComplete?.();
    }
  }, [displayText, isTyping, onComplete, speed, text]);

  return (
    <span className={className}>
      {displayText}
      {showCursor && (
        <motion.span
          className="inline-block w-[2px] h-[1em] bg-current ml-1 align-middle"
          animate={{ opacity: isComplete ? [1, 0] : 1 }}
          transition={{
            duration: 0.8,
            repeat: isComplete ? Infinity : 0,
            repeatType: "reverse",
          }}
        />
      )}
    </span>
  );
}

interface TypewriterLinesProps {
  lines: string[];
  speed?: number;
  lineDelay?: number;
  className?: string;
  lineClassName?: string;
}

export function TypewriterLines({
  lines,
  speed = 80,
  lineDelay = 500,
  className = "",
  lineClassName = "",
}: TypewriterLinesProps) {
  const [currentLine, setCurrentLine] = useState(0);
  const [completedLines, setCompletedLines] = useState<string[]>([]);

  const handleLineComplete = () => {
    if (currentLine < lines.length - 1) {
      setTimeout(() => {
        setCompletedLines((prev) => [...prev, lines[currentLine]]);
        setCurrentLine((prev) => prev + 1);
      }, lineDelay);
    }
  };

  return (
    <div className={className}>
      {completedLines.map((line, index) => (
        <div key={index} className={lineClassName}>
          {line}
        </div>
      ))}
      {currentLine < lines.length && (
        <div className={lineClassName}>
          <TypewriterText
            text={lines[currentLine]}
            speed={speed}
            showCursor={true}
            onComplete={handleLineComplete}
          />
        </div>
      )}
    </div>
  );
}
