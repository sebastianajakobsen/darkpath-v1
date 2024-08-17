
// ... other affixes

import { armorAffixes } from '@/phaser/items/affixes/ItemArmorAffixDefinitions';
import { ArmorType } from '@/phaser/items/armor/ArmorInterfaces';
import type { Affix } from '@/phaser/items/affixes/ItemAffixTypes';

const allAffixes: Affix[] = [
    ...Object.values(armorAffixes),
    // ... other affix instances
];

const bodyArmorAffixes = allAffixes.filter((affix) =>
    affix.applicableTo.includes(ArmorType.BODY_ARMOR),
);
const bootsAffixes = allAffixes.filter((affix) => affix.applicableTo.includes(ArmorType.BOOTS));
const beltAffixes = allAffixes.filter((affix) => affix.applicableTo.includes(ArmorType.BELT));
const helmetsAffixes = allAffixes.filter((affix) => affix.applicableTo.includes(ArmorType.HELMET));

// const ringsAffixes = allAffixes.filter((affix) => affix.applicableTo.includes(AccessoryType.RING));
// const amuletsAffixes = allAffixes.filter((affix) =>
//   affix.applicableTo.includes(AccessoryType.AMULET)
// );
export const equipSlotToAffixesMapping: Record<string, Affix[]> = {
    BodyArmor: bodyArmorAffixes,
    Boots: bootsAffixes,
    Helmet: helmetsAffixes,
    Belt: beltAffixes,
    // Ring: ringsAffixes,
    // Amulet: amuletsAffixes
    // Add other mappings as you define other affix sets. For example:
    // Helmet: helmetAffixes,
    // Ring: ringAffixes,
    // ...
};
