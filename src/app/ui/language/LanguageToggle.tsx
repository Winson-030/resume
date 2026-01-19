"use client";

import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/app/ui/components/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/ui/components/DropdownMenu";
import { Globe } from "lucide-react";

type Language = "en" | "zh" | "ja";

const languages: { code: Language; name: string }[] = [
  { code: "en", name: "English" },
  { code: "zh", name: "中文" },
  { code: "ja", name: "日本語" },
];

export function LanguageToggle() {
  const pathname = usePathname();
  const router = useRouter();

  const currentLang = (pathname.split("/")[1] as Language) || "en";

  const handleLanguageChange = (newLang: Language) => {
    if (newLang === currentLang) return;

    let newPath = pathname.replace(`/${currentLang}`, `/${newLang}`);
    if (!pathname.startsWith("/en") && !pathname.startsWith("/zh") && !pathname.startsWith("/ja")) {
      newPath = `/${newLang}${pathname}`;
    }
    if (newPath === `/${newLang}/`) {
      newPath = `/${newLang}`;
    }

    router.push(newPath);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="transition-all duration-300 ease-in-out">
          <Globe className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">
            {languages.find((lang) => lang.code === currentLang)?.name}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="animate-in fade-in zoom-in-95 duration-200">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className="cursor-pointer"
          >
            {lang.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
