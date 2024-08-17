import type { Affix, AffixBonus, AffixType } from '@/phaser/items/affixes/ItemAffixTypes';
import type { ArmorType } from '@/phaser/items/armor/ArmorInterfaces';

export const createAffix = (
    name: string,
    type: AffixType,
    level: number,
    bonus: AffixBonus,
    tags: string[],
    applicableTo: (ArmorType)[], // applicableTo: (ArmorType | AccessoryType | WeaponType | OffhandType)[]
): Affix => {
    return {
        type,
        name,
        level,
        bonus,
        tags,
        applicableTo,
    };
};
