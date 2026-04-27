"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Card } from "./Card";

interface TimelineItem {
  title: string;
  subtitle?: string;
  period: string;
  location?: string;
  description?: string;
  highlights?: string[];
  tags?: string[];
}

interface TimelineProps {
  items: TimelineItem[];
}

function TimelineNode({ isActive }: { isActive: boolean }) {
  return (
    <div className="relative flex items-center justify-center">
      <motion.div
        className={`w-3 h-3 rounded-full border-2 transition-colors duration-500 ${
          isActive
            ? "bg-primary border-primary"
            : "bg-background border-muted-foreground/30"
        }`}
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.3, delay: 0.2 }}
      />
      {isActive && (
        <motion.div
          className="absolute w-3 h-3 rounded-full bg-primary"
          initial={{ scale: 1, opacity: 0.5 }}
          animate={{ scale: 2.5, opacity: 0 }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}
    </div>
  );
}

function TimelineItemComponent({
  item,
  index,
  isLast,
}: {
  item: TimelineItem;
  index: number;
  isLast: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -20 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.15 }}
      className="relative flex gap-6 md:gap-8"
    >
      <div className="flex flex-col items-center">
        <TimelineNode isActive={isInView} />
        {!isLast && (
          <motion.div
            className="w-px flex-1 bg-border mt-2"
            initial={{ scaleY: 0 }}
            animate={isInView ? { scaleY: 1 } : {}}
            transition={{ duration: 0.5, delay: index * 0.15 + 0.2 }}
            style={{ originY: 0 }}
          />
        )}
      </div>

      <div className="flex-1 pb-10">
        <Card className="p-5 md:p-6 hover:border-primary/20 transition-colors duration-300 group">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 mb-3">
            <div>
              <h3 className="text-lg font-medium group-hover:text-primary transition-colors">
                {item.title}
              </h3>
              {item.subtitle && (
                <p className="text-primary text-sm">{item.subtitle}</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground font-mono">
                {item.period}
              </p>
              {item.location && (
                <p className="text-xs text-muted-foreground/70">
                  {item.location}
                </p>
              )}
            </div>
          </div>

          {item.description && (
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              {item.description}
            </p>
          )}

          {item.highlights && item.highlights.length > 0 && (
            <ul className="space-y-2 mb-4">
              {item.highlights.map((highlight, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{
                    duration: 0.3,
                    delay: index * 0.15 + 0.3 + i * 0.1,
                  }}
                  className="text-sm text-muted-foreground flex items-start gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/60 mt-2 flex-shrink-0" />
                  <span>{highlight}</span>
                </motion.li>
              ))}
            </ul>
          )}

          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-1 rounded-md bg-secondary text-secondary-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </Card>
      </div>
    </motion.div>
  );
}

export function Timeline({ items }: TimelineProps) {
  return (
    <div className="relative">
      {items.map((item, index) => (
        <TimelineItemComponent
          key={`${item.title}-${index}`}
          item={item}
          index={index}
          isLast={index === items.length - 1}
        />
      ))}
    </div>
  );
}
