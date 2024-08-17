import { createAffix } from '@/phaser/items/affixes/ItemAffixHelpers';
import { AffixType, BonusUnit } from '@/phaser/items/affixes/ItemAffixTypes';
import { ArmorType } from '@/phaser/items/armor/ArmorInterfaces';


const intelligence = createAffix(
    'Lesser intelligence',
    AffixType.Suffix,
    1,
    {
        intelligence: {
            min: 3,
            max: 9,
            unit: BonusUnit.RawNumber,
        },
    },
    ['Resource', 'Life'],
    [
        ArmorType.BODY_ARMOR,
        ArmorType.HELMET,
        ArmorType.BOOTS,
        ArmorType.BELT,
        ArmorType.GLOVES,
        // AccessoryType.RING,
        // AccessoryType.AMULET,
        ArmorType.HELMET,
    ],
);

const hale = createAffix(
    'Lesser vitality',
    AffixType.Prefix,
    1,
    {
        vitality: {
            min: 3,
            max: 9,
            unit: BonusUnit.RawNumber,
        },
    },
    ['Resource', 'Life'],
    [
        ArmorType.BODY_ARMOR,
        ArmorType.HELMET,
        ArmorType.BOOTS,
        ArmorType.BELT,
        ArmorType.GLOVES,
        // AccessoryType.RING,
        // AccessoryType.AMULET,
        ArmorType.HELMET,
    ],
);

export const healthy = createAffix(
    'Greater vitality',
    AffixType.Prefix,
    5,
    {
        vitality: {
            min: 10,
            max: 19,
            unit: BonusUnit.RawNumber,
        },
    },
    ['Resource', 'Life'],
    [
        ArmorType.BODY_ARMOR,
        ArmorType.HELMET,
        ArmorType.BOOTS,
        ArmorType.BELT,
        // AccessoryType.RING,
        // AccessoryType.AMULET,
        ArmorType.HELMET,
    ],
);

export const armorAffixes = {
    hale,
    healthy,
    intelligence,
    // ... any other armor affixes
};
