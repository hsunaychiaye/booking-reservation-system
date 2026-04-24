"use client";

import { useEffect } from "react";
import { SunMoon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const nextDark = saved ? saved === "dark" : true;
    document.documentElement.classList.toggle("dark", nextDark);
  }, []);

  const toggleTheme = () => {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  return (
    <Button variant="outline" onClick={toggleTheme} className="gap-2">
      <SunMoon className="h-4 w-4" />
      Toggle Theme
    </Button>
  );
}
