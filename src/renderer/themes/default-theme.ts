/**
 * Rendering theme, kept as data rather than scattered literals inside
 * the renderer. Swapping brand colors/fonts, or introducing per-org
 * custom themes later, means adding a new object here — never editing
 * rendering logic.
 */
export interface DeckTheme {
  fontFamily: string;
  colors: {
    background: string;
    heading: string;
    body: string;
    accent: string;
  };
  fontSizes: {
    title: number;
    heading: number;
    body: number;
  };
}

export const defaultTheme: DeckTheme = {
  fontFamily: "Inter",
  colors: {
    background: "FFFFFF",
    heading: "1A1A2E",
    body: "333333",
    accent: "5B5BD6",
  },
  fontSizes: {
    title: 36,
    heading: 28,
    body: 16,
  },
};
