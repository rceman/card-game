export type CardDefinition = {
  id: number;
  name: string;
  image: string;
  health: number;
  attack: number;
  attacksPerTurn?: number;
};

const cardImages = import.meta.glob('../../assets/cards/*.png', {
  eager: true,
  import: 'default'
}) as Record<string, string>;

const cardImagesByName = Object.fromEntries(
  Object.entries(cardImages).map(([path, url]) => [path.split('/').pop() ?? path, url])
);

export function getCardImageUrl(filename: string): string {
  return cardImagesByName[filename] ?? filename;
}

const normalizeCardKey = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '');

const cardLookup = new Map<string, CardDefinition>();

const addCardLookupKey = (key: string, card: CardDefinition) => {
  if (!key) return;
  const normalized = normalizeCardKey(key);
  if (!normalized || cardLookup.has(normalized)) return;
  cardLookup.set(normalized, card);
};

// Base card database. Image paths are relative to `src/assets/cards/`.
export const CARD_DATABASE: CardDefinition[] = [
  {
    id: 29,
    name: 'Pearl',
    image: 'bs_pearl.png',
    health: 3900,
    attack: 1560
  },
  {
    id: 41,
    name: 'Gale',
    image: 'bs_gale.png',
    health: 3800,
    attack: 1680
  },
  {
    id: 44,
    name: 'Jessie',
    image: 'bs_jessie.png',
    health: 3000,
    attack: 1060
  },
  {
    id: 60,
    name: 'Nani',
    image: 'bs_nani.png',
    health: 2400,
    attack: 2220
  },
  {
    id: 66,
    name: 'Darryl',
    image: 'bs_darryl.png',
    health: 5300,
    attack: 2400
  },
  {
    id: 67,
    name: 'Draco',
    image: 'bs_draco.png',
    health: 5500,
    attack: 600
  },
  {
    id: 71,
    name: 'Larry & Lawrie',
    image: 'bs_larry_lawrie.png',
    health: 3000,
    attack: 700,
    attacksPerTurn: 2
  },
  {
    id: 86,
    name: 'Max',
    image: 'bs_max.png',
    health: 3300,
    attack: 1280
  },
  {
    id: 87,
    name: 'Pam',
    image: 'bs_pam.png',
    health: 4800,
    attack: 2340
  },
  {
    id: 94,
    name: 'Fang',
    image: 'bs_fang.png',
    health: 4300,
    attack: 1360
  },
  {
    id: 99,
    name: 'Mico',
    image: 'bs_mico.png',
    health: 3000,
    attack: 1090
  }
];

CARD_DATABASE.forEach(card => {
  addCardLookupKey(String(card.id), card);
  addCardLookupKey(card.name, card);
  addCardLookupKey(card.image.replace(/\.[^.]+$/, ''), card);
});

export function getCardByParam(param: string | null): CardDefinition | null {
  if (!param) return null;
  const normalized = normalizeCardKey(param);
  return cardLookup.get(normalized) ?? null;
}
