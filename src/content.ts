/**
 * Every product fact on the site lives here.
 *
 * Source key (what each value was read from):
 *   [front]  public/assets/product/can-front.png
 *   [back]   public/assets/product/can-back.jpg  (back label, transcribed verbatim)
 *   [side]   public/assets/product/can-side.jpg / can-bottom.jpg
 *
 * Nothing here is invented. Fields that the supplied assets do not cover are left
 * empty on purpose — the UI hides them until real data is added.
 */

export const brand = {
  name: 'ADIPOLI',
  // [front]
  descriptor: 'A Tropical Drink with Magnesium & Vitamins',
  // [front] — the brand's own two-line positioning
  taglineA: '100% Freshness.',
  taglineB: '0% Drama.',
  // [back]
  makers: 'Malayali',
  // [side] "Tag your adipoli life @adipoli.zone"
  handle: '@adipoli.zone',
  handleCta: 'Tag your adipoli life',
  // TODO(verify): the label prints the handle only. Confirm the platform / URL.
  handleUrl: 'https://www.instagram.com/adipoli.zone/',
  // Malayalam word the brand is named after (common slang for "awesome").
  wordMalayalam: 'അടിപൊളി',
  wordMeaning: 'Malayalam slang for “awesome”',
}

export const label = {
  // [back]
  title: 'A Tropical Magnesium & Vitamin drink.',
  process: ['Carbonated', 'Pasteurized'],
  ingredients: [
    'water',
    'sugar',
    'carbon dioxide',
    'magnesium citrate',
    'acid: citric acid',
    'flavourings',
    'stabilizers: gum arabic and glycerol esters of wood rosins',
    'orange terpenes',
    'vitamins: niacin, vitamin B6, biotin, vitamin B12',
  ],
  ingredientsVerbatim:
    'water, sugar, carbon dioxide, magnesium citrate; acid: citric acid; flavourings; stabilizers: gum arabic and glycerol esters of wood rosins, orange terpenes; vitamins: niacin, vitamin B6, biotin, vitamin B12',
  // [back] — printed on the can, quoted verbatim (including its grammar).
  vitaminStatement:
    'The vitamins in the product support the nervous system, boosts metabolism, and help maintain healthy skin, hair, and nails.',
  producedFor: 'Hexagon Spirits International',
  address: 'Al. Krakowska 4/6, 02-284 Warsaw, Poland',
  origin: 'Poland',
  ean: '5900009274042',
}

/** The actives named on the label, in label order. Display-only grouping. */
export const actives = [
  { name: 'Magnesium', detail: 'as magnesium citrate' },
  { name: 'Niacin', detail: 'vitamin' },
  { name: 'Vitamin B6', detail: 'vitamin' },
  { name: 'Biotin', detail: 'vitamin' },
  { name: 'Vitamin B12', detail: 'vitamin' },
]

/**
 * Not present on any supplied asset. Add real values to show the
 * Nutrition panel and the volume spec. Leave empty to hide them.
 */
export const nutrition: { per: string; rows: { label: string; value: string }[] } = {
  per: '',
  rows: [],
}
export const volume = ''

/**
 * Founder details were not supplied (only the photograph).
 * Fill these in to show the name and biography in the Story scene.
 */
export const founder = {
  photo: '/assets/brand/founder.png',
  name: '',
  role: '',
  bio: [] as string[],
}

export const scenes = [
  { id: 'hero', label: 'Arrival' },
  { id: 'reveal', label: 'The Can' },
  { id: 'open', label: 'Open' },
  { id: 'formula', label: 'Formula' },
  { id: 'story', label: 'Story' },
  { id: 'finale', label: 'Adipoli' },
] as const
