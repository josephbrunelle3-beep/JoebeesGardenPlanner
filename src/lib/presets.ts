export interface GardenPreset {
  label: string;
  emoji: string;
  /** Short, customer-friendly description shown in the textarea. */
  prompt: string;
  /** Additional guidance sent to the AI but never shown in the UI. */
  hiddenGuidance?: string;
}

const COMMON_RULES =
  "Leave breathing room — don't crowd. Group companions, separate antagonists by 3+ cells, and put tall plants at the back (low y) and short edge plants at the front (high y).";

export const GARDEN_PRESETS: GardenPreset[] = [
  {
    label: "Salsa",
    emoji: "🌶️",
    prompt:
      "Beginner salsa garden: a few tomatoes with basil tucked between, jalapeño and sweet peppers, bunching onions, cilantro, and a little garlic.",
    hiddenGuidance: `${COMMON_RULES} Do not place brassicas, fennel, corn, or potatoes near the tomatoes or peppers.`,
  },
  {
    label: "Three Sisters",
    emoji: "🌽",
    prompt:
      "Classic Three Sisters bed: sweet corn at the back, pole beans climbing the corn, winter squash sprawling at the base.",
    hiddenGuidance: `${COMMON_RULES} Use ONLY corn, pole beans, and winter squash. Do not include tomatoes, peppers, brassicas, onions, garlic, or fennel.`,
  },
  {
    label: "Salad bowl",
    emoji: "🥗",
    prompt:
      "Cut-and-come-again salad bed: butterhead or leaf lettuce, spinach, radishes, scallions, and a little parsley.",
    hiddenGuidance: `${COMMON_RULES} Tolerates part-sun. Do not include brassicas (cabbage / cauliflower / broccoli / kale) or strongly aromatic herbs.`,
  },
  {
    label: "Italian kitchen",
    emoji: "🍅",
    prompt:
      "Italian kitchen garden: slicing tomatoes with basil close by, oregano, garlic, sweet bell peppers, and parsley along one edge.",
    hiddenGuidance: `${COMMON_RULES} Do not place brassicas, fennel, corn, or potatoes near the tomatoes or peppers.`,
  },
  {
    label: "Pizza garden",
    emoji: "🍕",
    prompt:
      "Pizza garden: Roma tomatoes, sweet basil, oregano, sweet peppers, red onions, and a little rosemary. Cluster basil next to tomatoes.",
    hiddenGuidance: `${COMMON_RULES} Do not include brassicas, fennel, corn, or potatoes.`,
  },
  {
    label: "Herb sampler",
    emoji: "🌿",
    prompt:
      "Compact culinary herb sampler: basil, parsley, oregano, thyme, chives, and a small rosemary, plus a marigold or two for pests.",
    hiddenGuidance: `${COMMON_RULES} Keep sage and fennel out — they conflict with basil and most vegetables.`,
  },
  {
    label: "Pollinator mix",
    emoji: "🌼",
    prompt:
      "Pollinator-friendly bed: sunflowers along the back row, marigolds, zinnias, calendula, borage, and a few cherry tomatoes for bonus food.",
    hiddenGuidance: `${COMMON_RULES} Do not place potatoes or beans near the sunflowers.`,
  },
  {
    label: "Kid favorites",
    emoji: "🧒",
    prompt:
      "Kid-friendly garden: cherry tomatoes, sugar snap peas on a back trellis, carrots, strawberries along the front edge, and a couple sunflowers in a corner.",
    hiddenGuidance: `${COMMON_RULES} Keep peas away from onions/garlic; keep strawberries away from brassicas; keep dill or fennel away from carrots.`,
  },
  {
    label: "Stir-fry",
    emoji: "🥢",
    prompt:
      "Asian stir-fry bed centered on greens: bok choy and other brassicas (cabbage / kale), snap peas on a back trellis, cucumbers, scallions, and cilantro.",
    hiddenGuidance: `${COMMON_RULES} Do not include tomatoes, peppers, or strawberries — they conflict with brassicas.`,
  },
  {
    label: "Roots & berries",
    emoji: "🥕",
    prompt:
      "Roots & berries patch: carrots, radishes, beets, and potatoes in one corner, with strawberries along the front edge.",
    hiddenGuidance: `${COMMON_RULES} Do not include tomatoes, cucumbers, squash, or brassicas — they conflict with potatoes or strawberries. Keep dill or fennel away from the carrots.`,
  },
];

/**
 * Returns the full text (visible + hidden guidance) to send to the AI for a
 * given visible prompt. If the visible text exactly matches a known preset
 * we append its hidden guidance; otherwise we return the user's text as-is.
 */
export function expandPromptForAI(visiblePrompt: string): string {
  const match = GARDEN_PRESETS.find((p) => p.prompt === visiblePrompt);
  if (match?.hiddenGuidance) {
    return `${visiblePrompt}\n\n[Design constraints: ${match.hiddenGuidance}]`;
  }
  return visiblePrompt;
}
