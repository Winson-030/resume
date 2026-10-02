import { notFound } from "next/navigation";
import type { Messages } from "@/lib/seo";

export type { Messages };

export function getMessages(locale: string): Promise<Messages> {
  switch (locale) {
    case "en":
      return import("./en.json").then((module) => module.default as Messages);
    case "zh":
      return import("./zh.json").then((module) => module.default as Messages);
    case "ja":
      return import("./ja.json").then((module) => module.default as Messages);
    default:
      notFound();
  }
}
