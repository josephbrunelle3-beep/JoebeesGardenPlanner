export interface GardenPreset {
  label: string;
  emoji: string;
  prompt: string;
}

export const GARDEN_PRESETS: GardenPreset[] = [
  {
    label: "Salsa",
    emoji: "🌶️",
    prompt:
      "Beginner salsa garden: a few slicing/paste tomatoes (with basil tucked between), jalapeño and sweet peppers, bunching onions, cilantro, and a little garlic. Keep antagonists apart and leave breathing room — don't crowd.",
  },
  {
    label: "Three Sisters",
    emoji: "🌽",
    prompt:
      "Classic Three Sisters bed using ONLY corn, pole beans, and winter squash. Corn at the back (low y) in a tight block, pole beans interplanted between the corn, and winter squash sprawling across the front. Do not include tomatoes, peppers, brassicas, onions, garlic, or fennel.",
  },
  {
    label: "Salad bowl",
    emoji: "🥗",
    prompt:
      "Cut-and-come-again salad bed: butterhead or leaf lettuce, spinach, radishes, scallions, and a little parsley. Tolerates part-sun. No brassicas (no cabbage/cauliflower/broccoli), no strong herbs.",
  },
  {
    label: "Italian kitchen",
    emoji: "🍅",
    prompt:
      "Italian kitchen garden: slicing tomatoes with basil close by, oregano, garlic, sweet bell peppers, and parsley along one edge. No brassicas, fennel, corn, or potatoes near the tomatoes.",
  },
  {
    label: "Pizza garden",
    emoji: "🍕",
    prompt:
      "Pizza garden: Roma/paste tomatoes, sweet basil, oregano, sweet peppers, red onions, and a small rosemary. Cluster basil next to tomatoes. No brassicas, fennel, corn, or potatoes.",
  },
  {
    label: "Herb sampler",
    emoji: "🌿",
    prompt:
      "Compact culinary herb sampler: basil, parsley, oregano, thyme, chives, and a small rosemary, plus a marigold or two for pests. Keep sage and fennel out (they fight with basil and most veg).",
  },
  {
    label: "Pollinator mix",
    emoji: "🌼",
    prompt:
      "Pollinator-friendly bed: sunflowers along the back row (north / low y), marigolds, zinnias, calendula, borage, and a few cherry tomatoes for bonus food. No potatoes or beans near sunflowers.",
  },
  {
    label: "Kid favorites",
    emoji: "🧒",
    prompt:
      "Kid-friendly garden: cherry tomatoes, sugar snap peas (along a trellis at the back), carrots, strawberries along the front edge, and a couple sunflowers in a corner. Keep peas away from onions/garlic; keep strawberries away from brassicas.",
  },
  {
    label: "Stir-fry",
    emoji: "🥢",
    prompt:
      "Asian stir-fry bed centered on greens: bok choy and other brassicas (cabbage / kale), snap peas on a trellis at the back, cucumbers, scallions, and cilantro. No tomatoes, peppers, or strawberries (they fight brassicas).",
  },
  {
    label: "Roots & berries",
    emoji: "🥕",
    prompt:
      "Roots & berries patch: carrots, radishes, beets, and potatoes in one corner, with strawberries along the front edge. No tomatoes, cucumbers, squash, or brassicas (they conflict with potatoes or strawberries). No dill or fennel near the carrots.",
  },
];
