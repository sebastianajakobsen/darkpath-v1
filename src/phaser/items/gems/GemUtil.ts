import  { type ItemGemPropertyType, GemType } from '@/phaser/items/gems/IGem';
import type { SpellGemItemType } from '@/phaser/items/gems/spells/ISpellGem';

export const isSpellGemProperties = (
    properties: ItemGemPropertyType,
): properties is SpellGemItemType => {
    return properties.type === GemType.SPELL;
};
