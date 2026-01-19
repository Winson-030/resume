import { notFound } from "next/navigation";

export function getMessages(locale: string) {
  switch (locale) {
    case "en":
      return import("./en.json").then((module) => module.default);
    case "zh":
      return import("./zh.json").then((module) => module.default);
    case "ja":
      return import("./ja.json").then((module) => module.default);
    default:
      notFound();
  }
}
