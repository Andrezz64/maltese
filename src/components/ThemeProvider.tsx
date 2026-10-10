"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "classic" | "sepia" | "dark";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  fontSize: "normal" | "large" | "larger";
  setFontSize: (size: "normal" | "large" | "larger") => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("classic");
  const [fontSize, setFontSizeState] = useState<"normal" | "large" | "larger">("normal");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("salomao_theme") as Theme | null;
    if (savedTheme && ["classic", "sepia", "dark"].includes(savedTheme)) {
      setThemeState(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);
    } else {
      document.documentElement.setAttribute("data-theme", "classic");
    }

    const savedFontSize = localStorage.getItem("salomao_font_size") as "normal" | "large" | "larger" | null;
    const initialFontSize = savedFontSize && ["normal", "large", "larger"].includes(savedFontSize) ? savedFontSize : "normal";
    setFontSizeState(initialFontSize);
    document.documentElement.setAttribute("data-fontsize", initialFontSize);
    document.body.setAttribute("data-fontsize", initialFontSize);
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("salomao_theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  const setFontSize = (newSize: "normal" | "large" | "larger") => {
    setFontSizeState(newSize);
    localStorage.setItem("salomao_font_size", newSize);
    document.documentElement.setAttribute("data-fontsize", newSize);
    document.body.setAttribute("data-fontsize", newSize);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, fontSize, setFontSize }}>
      <div className={mounted ? "" : "opacity-0"}>{children}</div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
