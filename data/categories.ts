// The project categories and the star colour each one gets on the map.
// Adding a category = add one line here. Nothing else needs to change.
export const categories = {
  "Deep Learning": "#a9bcff", // pale blue-violet
  "Data Engineering": "#55d6e8", // cyan
  "LLM Apps": "#ff9ecb", // pink
} as const;

export type ProjectCategory = keyof typeof categories;
