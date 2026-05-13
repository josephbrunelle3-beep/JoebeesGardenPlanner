/**
 * Plain-English explanations of companion / antagonist relationships, for
 * teaching new gardeners *why* certain plants pair well or poorly.
 *
 * Lookups are symmetric — `getPairReason("tomato", "basil")` and
 * `getPairReason("basil", "tomato")` return the same string.
 *
 * Reasons are sourced from common companion-planting references (Cornell SFG,
 * Old Farmer's Almanac, OSU Extension) and kept short on purpose.
 */

type Sign = "like" | "avoid";

const LIKE_PAIRS: Record<string, string> = {
  "basil|tomato":
    "Basil's aromatic oils help repel tomato hornworm and whiteflies; both love warmth and the same watering schedule.",
  "carrot|tomato":
    "Tall tomatoes lightly shade carrots in summer, and carrots loosen soil around tomato roots.",
  "carrot|onion":
    "Onion smell confuses the carrot fly; the strong scents mask each other's pest cues.",
  "bean|corn":
    "Beans fix nitrogen the heavy-feeding corn needs and climb the corn stalks for support.",
  "bean|squash":
    "Sprawling squash leaves shade soil and deter raccoons; beans feed nitrogen back into the bed.",
  "corn|squash":
    "Squash shades the soil around corn, conserving moisture and smothering weeds (Three Sisters).",
  "cucumber|bean":
    "Beans add nitrogen that cucumbers love; their growth habits don't crowd.",
  "cucumber|radish":
    "Radishes deter cucumber beetles, and they mature in 3–4 weeks — long before the cucumber vines spread to fill the space.",
  "tomato|carrot":
    "Tall tomatoes lightly shade carrots in summer, and carrots loosen soil around tomato roots.",
  "tomato|marigold":
    "French marigolds release compounds (alpha-terthienyl) that suppress root-knot nematodes near tomato roots.",
  "tomato|nasturtium":
    "Nasturtiums act as a trap crop for aphids and whiteflies, drawing them away from tomatoes.",
  "pepper|basil":
    "Basil helps mask the scent of peppers from thrips and aphids, and shares the same sun + water needs.",
  "lettuce|carrot":
    "Quick-growing lettuce fills space between slow carrots and keeps soil cool and shaded.",
  "lettuce|radish":
    "Radishes mature fast and mark the row before lettuce fills in.",
  "strawberry|borage":
    "Borage draws bees and other pollinators to the strawberry flowers and accumulates trace minerals that benefit the patch.",
  "strawberry|spinach":
    "Spinach grows quickly and is harvested before strawberry runners take over.",
  "brassica|dill":
    "Dill flowers attract parasitic wasps that prey on cabbage worms.",
  "brassica|nasturtium":
    "Nasturtiums trap cabbage moths and aphids away from brassicas.",
  "brassica|onion":
    "Onion family smells deter cabbage moths.",
  "brassica|chamomile":
    "Chamomile improves brassica flavor and attracts hoverflies that eat aphids.",
  "potato|bean":
    "Beans deter Colorado potato beetles; potatoes deter bean beetles. Mutual pest defense.",
  "rosemary|brassica":
    "Rosemary's scent confuses cabbage moths and carrot flies.",
  "marigold|squash":
    "Marigolds deter squash bugs and root-knot nematodes.",
  "marigold|brassica":
    "Marigolds attract hoverflies that prey on cabbage aphids.",
  "sunflower|cucumber":
    "Sunflowers offer light shade and act as trellises; their pollen draws pollinators to cucumber flowers.",
  "chives|carrot":
    "Allium scent of chives masks the carrot fly's cues.",
  "garlic|strawberry":
    "Garlic helps repel fungal disease and slugs around strawberries.",
  "garlic|brassica":
    "Garlic deters aphids and cabbage loopers.",
  "borage|tomato":
    "Borage attracts pollinators and predatory wasps, and its leaves deter tomato hornworms.",
  "pea|carrot":
    "Peas fix nitrogen that carrots benefit from once peas finish in early summer.",
  "pole-bean|corn":
    "Classic Three Sisters: pole beans climb the corn for support and feed it nitrogen.",
};

const AVOID_PAIRS: Record<string, string> = {
  "tomato|brassica":
    "Both are heavy feeders that compete for nitrogen; brassicas can stunt tomato growth.",
  "tomato|corn":
    "They share the corn earworm / tomato fruitworm pest. Planting together amplifies infestations.",
  "tomato|potato":
    "Both are nightshades and share early/late blight pathogens.",
  "tomato|fennel":
    "Fennel releases compounds that inhibit tomato growth — keep fennel in its own corner.",
  "bean|onion":
    "Alliums inhibit nitrogen-fixing bacteria on bean roots, reducing yield.",
  "bean|garlic":
    "Alliums inhibit nitrogen-fixing bacteria on bean roots, reducing yield.",
  "pea|onion":
    "Alliums suppress pea root nodulation and stunt growth.",
  "pea|garlic":
    "Alliums suppress pea root nodulation and stunt growth.",
  "carrot|dill":
    "Mature dill can stunt carrots and cross-attract carrot flies when flowering.",
  "cucumber|potato":
    "Potatoes can encourage blight, and both are heavy feeders competing for water.",
  "cucumber|sage":
    "Strongly aromatic sage suppresses cucumber vine growth — keep them well apart.",
  "brassica|strawberry":
    "Brassicas leach calcium and outcompete strawberries for nutrients.",
  "brassica|tomato":
    "Both are heavy feeders that compete for nitrogen; brassicas can stunt tomatoes.",
  "fennel|tomato":
    "Fennel releases compounds that inhibit tomato growth — keep fennel in its own corner.",
  "fennel|bean":
    "Fennel is allelopathic to most beans, slowing germination and growth.",
  "potato|squash":
    "Both attract similar fungal blights, and squash sprawl shades developing tubers.",
  "potato|tomato":
    "Both are nightshades and share early/late blight pathogens.",
};

function key(a: string, b: string) {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

export function getPairReason(a: string, b: string, sign: Sign): string | null {
  const k = key(a, b);
  if (sign === "like") return LIKE_PAIRS[k] ?? null;
  return AVOID_PAIRS[k] ?? null;
}

/**
 * Short, beginner-friendly principles behind companion planting.
 * Used as an intro tooltip / collapsible info section.
 */
export const COMPANION_PRINCIPLES: { title: string; body: string }[] = [
  {
    title: "Pest confusion",
    body:
      "Strong-smelling herbs (basil, dill, mint, alliums) mask the scent of vulnerable crops, so pests like aphids, carrot flies, and cabbage moths can't home in.",
  },
  {
    title: "Trap crops",
    body:
      "Some plants (nasturtium, radish) draw pests to themselves and away from your main crop. You sacrifice the trap to save the rest.",
  },
  {
    title: "Beneficial insects",
    body:
      "Flowers like dill, calendula, alyssum, and cosmos feed predator insects (hoverflies, parasitic wasps, ladybugs) that eat garden pests.",
  },
  {
    title: "Nitrogen fixing",
    body:
      "Beans and peas pull nitrogen from the air and store it in root nodules. Heavy feeders like corn, brassicas, and tomatoes benefit from being planted near or after them.",
  },
  {
    title: "Shade & shelter",
    body:
      "Tall plants (corn, sunflower, tomato) provide cooling shade for tender greens. Sprawling vines (squash) shade soil and hold in moisture.",
  },
  {
    title: "Allelopathy",
    body:
      "A few plants release chemicals that suppress their neighbors. Fennel, walnuts, and sometimes mature dill stunt nearby crops — keep them in their own corner.",
  },
  {
    title: "Pathogen sharing",
    body:
      "Nightshades (tomato, potato, eggplant, pepper) share fungal blights. Don't plant them tightly together or rotate them through the same bed year after year.",
  },
  {
    title: "Allium / legume conflict",
    body:
      "Onion-family roots inhibit the nitrogen-fixing bacteria on beans and peas, so keep them in separate parts of the bed.",
  },
];
