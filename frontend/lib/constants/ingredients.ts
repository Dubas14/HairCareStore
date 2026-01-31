/**
 * Key Ingredients for HAIR LAB
 * "Scientific Self-Care" approach
 */

export const KEY_INGREDIENTS = [
  {
    id: "keratin",
    name: "Кератин",
    nameEn: "Keratin",
    inci: "Hydrolyzed Keratin",
    description: "Відновлює структуру волосся, заповнює пошкодження",
    benefits: ["Відновлення", "Зміцнення", "Гладкість"],
    icon: "🧬",
  },
  {
    id: "argan-oil",
    name: "Арганова олія",
    nameEn: "Argan Oil",
    inci: "Argania Spinosa Kernel Oil",
    description: "Живить, надає блиск, захищає від пошкоджень",
    benefits: ["Живлення", "Блиск", "Захист"],
    icon: "🌿",
  },
  {
    id: "biotin",
    name: "Біотин",
    nameEn: "Biotin",
    inci: "Biotin (Vitamin B7)",
    description: "Зміцнює волосся, стимулює ріст",
    benefits: ["Зміцнення", "Ріст", "Густота"],
    icon: "💊",
  },
  {
    id: "collagen",
    name: "Колаген",
    nameEn: "Collagen",
    inci: "Hydrolyzed Collagen",
    description: "Надає об'єм, покращує еластичність",
    benefits: ["Об'єм", "Еластичність", "Зміцнення"],
    icon: "🔬",
  },
  {
    id: "hyaluronic",
    name: "Гіалуронова кислота",
    nameEn: "Hyaluronic Acid",
    inci: "Sodium Hyaluronate",
    description: "Глибоке зволоження, утримує вологу",
    benefits: ["Зволоження", "М'якість", "Блиск"],
    icon: "💧",
  },
] as const

export const FREE_FROM_OPTIONS = [
  {
    id: "sulfate-free",
    name: "Без сульфатів",
    nameEn: "Sulfate-free",
    inci: "SLS/SLES",
  },
  {
    id: "paraben-free",
    name: "Без парабенів",
    nameEn: "Paraben-free",
    inci: "Parabens",
  },
  {
    id: "silicone-free",
    name: "Без сіліконів",
    nameEn: "Silicone-free",
    inci: "Dimethicone",
  },
  {
    id: "vegan",
    name: "Веган",
    nameEn: "Vegan",
    inci: "Animal-derived ingredients",
  },
  {
    id: "cruelty-free",
    name: "Cruelty-free",
    nameEn: "Cruelty-free",
    inci: "Not tested on animals",
  },
] as const
