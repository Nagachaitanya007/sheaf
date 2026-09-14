export type Appearance = "light" | "dark";

export const APPEARANCE_KEY = "sheaf/appearance";

export function readAppearance(): Appearance {
  if (typeof localStorage === "undefined") return "light";
  try {
    const value = localStorage.getItem(APPEARANCE_KEY);
    return value === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

export function applyAppearance(value: Appearance): void {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", value === "dark");
  document.documentElement.style.colorScheme = value;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", value === "dark" ? "#161310" : "#f3eee4");
  try {
    localStorage.setItem(APPEARANCE_KEY, value);
  } catch {
    /* ignore */
  }
}

export function toggleAppearance(current: Appearance): Appearance {
  const next: Appearance = current === "dark" ? "light" : "dark";
  applyAppearance(next);
  return next;
}

export const APPEARANCE_BOOT = `(function(){try{var t=localStorage.getItem("sheaf/appearance");if(t==="dark"){document.documentElement.classList.add("dark");document.documentElement.style.colorScheme="dark"}else{document.documentElement.style.colorScheme="light"}}catch(e){}})();`;
