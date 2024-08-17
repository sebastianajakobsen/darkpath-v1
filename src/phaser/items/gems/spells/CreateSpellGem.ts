import type { ISpellGemConfig, SpellGemType } from '@/phaser/items/gems/spells/ISpellGem';
import { ItemRarityType, ItemCategory } from '@/phaser/items/IItem';
import { Gem } from '@/phaser/items/gems/Gem';
import { spellGemConfig } from '@/phaser/items/gems/spells/SpellGemConfig';
import type { IGemItem } from '@/phaser/items/gems/IGem';

export const createSpellGem = (
    subType: SpellGemType,
    rarity: ItemRarityType = ItemRarityType.NORMAL,
): Gem  => {

    const getGemConfig: Record<string, ISpellGemConfig> = {
        ...Object.fromEntries(spellGemConfig.map((body) => [body.subType, body])),
    };
    const config = getGemConfig[subType];

    const spellGem: IGemItem = {
        id: config.id,
        name: config.name,
        description: config.description,
        category: ItemCategory.GEM,
        rarity: rarity,
        properties: {
            // Ensure all properties required by SpellGemProperties are included
            type: config.type,
            subType: config.subType,
            attribute: config.attribute,
            socketType: config.socketType,
            tags: config.tags,
            rank: config.rank,
            maxRank: config.maxRank,
            projectiles: config.projectiles,
            projectileSpeed: config.projectileSpeed,
            projectilePierceCount: config.projectilePierceCount,
            range: config.range,
            currentExperience: config.currentExperience,
            activeModifiers: config.activeModifiers,
            baseManaCost: config.baseManaCostFunc(config.rank),
            baseDamage: config.baseDamageFunc(config.rank),
            castSpeed: config.castSpeed,
            experienceToNextRank: config.experienceToNextRankFunc(config.rank),
            baseManaCostFunc: config.baseManaCostFunc,
            baseDamageFunc: config.baseDamageFunc,
            experienceToNextRankFunc: config.experienceToNextRankFunc,
            isToggleable: config.isToggleable,
            chains: config.chains,
            // Add missing properties here, as indicated by the TS error
        },
        itemLevel: config.itemLevel,
        dropChance: config.dropChance,
        icons: config.icons,
        size: config.size,
        identified: config.identified,
        requirements: config.requirements,
        stackAble: config.stackAble,
        stackSize: config.stackSize,
        maxStackSize: config.maxStackSize,
        isGloballyAvailable: config.isGloballyAvailable,
    };

    return new Gem(spellGem);
};
