/**
 * Product Categories with HAIR LAB gradient themes
 */

export const PRODUCT_CONCERNS = {
  REPAIR: {
    id: "repair",
    name: "Відновлення",
    nameEn: "Repair",
    description: "Для пошкодженого та ламкого волосся",
    gradient: {
      from: "repair-from",
      to: "repair-to",
    },
    colors: {
      from: "#D4A373", // Warm Sand
      to: "#E9C46A", // Soft Peach
    },
  },
  HYDRATE: {
    id: "hydrate",
    name: "Зволоження",
    nameEn: "Hydrate",
    description: "Для сухого волосся",
    gradient: {
      from: "hydrate-from",
      to: "hydrate-to",
    },
    colors: {
      from: "#2A9D8F", // Ocean Teal
      to: "#48CAE4", // Aqua
    },
  },
  VOLUME: {
    id: "volume",
    name: "Об'єм",
    nameEn: "Volume",
    description: "Для тонкого волосся без об'єму",
    gradient: {
      from: "volume-from",
      to: "volume-to",
    },
    colors: {
      from: "#B8B8D1", // Lavender Mist
      to: "#9FA0C3", // Periwinkle
    },
  },
  CURL: {
    id: "curl",
    name: "Кучері",
    nameEn: "Curl",
    description: "Для кучерявого та хвилястого волосся",
    gradient: {
      from: "curl-from",
      to: "curl-to",
    },
    colors: {
      from: "#8A9A5B", // Golden Olive
      to: "#BC6C25", // Amber
    },
  },
} as const

export const HAIR_TYPES = [
  {
    id: "straight",
    name: "Пряме",
    nameEn: "Straight",
    icon: "straightHairIcon",
  },
  {
    id: "wavy",
    name: "Хвилясте",
    nameEn: "Wavy",
    icon: "wavyHairIcon",
  },
  {
    id: "curly",
    name: "Кучеряве",
    nameEn: "Curly",
    icon: "curlyHairIcon",
  },
  {
    id: "coil",
    name: "Афро-кучері",
    nameEn: "Coil",
    icon: "coilHairIcon",
  },
] as const

export const HAIR_CONCERNS = [
  {
    id: "breakage",
    name: "Ламкість",
    nameEn: "Breakage",
  },
  {
    id: "dryness",
    name: "Сухість",
    nameEn: "Dryness",
  },
  {
    id: "no-volume",
    name: "Без об'єму",
    nameEn: "No Volume",
  },
  {
    id: "colored",
    name: "Пофарбоване",
    nameEn: "Colored",
  },
  {
    id: "frizz",
    name: "Пухнастість",
    nameEn: "Frizz",
  },
  {
    id: "hair-loss",
    name: "Випадіння",
    nameEn: "Hair Loss",
  },
] as const

export const PRODUCT_TYPES = [
  {
    id: "shampoo",
    name: "Шампунь",
    nameEn: "Shampoo",
  },
  {
    id: "conditioner",
    name: "Кондиціонер",
    nameEn: "Conditioner",
  },
  {
    id: "mask",
    name: "Маска",
    nameEn: "Mask",
  },
  {
    id: "serum",
    name: "Серум",
    nameEn: "Serum",
  },
  {
    id: "oil",
    name: "Олія",
    nameEn: "Oil",
  },
  {
    id: "spray",
    name: "Спрей",
    nameEn: "Spray",
  },
  {
    id: "color",
    name: "Фарба",
    nameEn: "Color",
  },
] as const
