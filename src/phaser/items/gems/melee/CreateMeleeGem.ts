
import { ItemRarityType, ItemCategory } from '@/phaser/items/IItem';
import { Gem } from '@/phaser/items/gems/Gem';

import type { IGemItem } from '@/phaser/items/gems/IGem';
import type { IMeleeGemConfig, MeleeGemType } from '@/phaser/items/gems/melee/IMeleeGem';
import { meleeGemConfig } from '@/phaser/items/gems/melee/MeleeGemConfig';

export const createMeleeGem = (
    subType: MeleeGemType,
    rarity: ItemRarityType = ItemRarityType.NORMAL,
): Gem => {
    const getGemConfig: Record<string, IMeleeGemConfig> = {
        ...Object.fromEntries(meleeGemConfig.map((config) => [config.subType, config])),
    };
    const config = getGemConfig[subType];

    const meleeGem: IGemItem = {
        id: config.id,
        name: config.name,
        description: config.description,
        category: ItemCategory.GEM,
        rarity: rarity,
        properties: {
            type: config.type,
            subType: config.subType,
            attribute: config.attribute,
            socketType: config.socketType,
            tags: config.tags,
            rank: config.rank,
            maxRank: config.maxRank,
            castSpeed: config.castSpeed,
            range: config.range,
            currentExperience: config.currentExperience,
            activeModifiers: config.activeModifiers,
            baseDamage: config.baseDamageFunc(config.rank),
            baseManaCost: config.baseManaCostFunc(config.rank),
            experienceToNextRank: config.experienceToNextRankFunc(config.rank),
            baseDamageFunc: config.baseDamageFunc,
            baseManaCostFunc: config.baseManaCostFunc,
            experienceToNextRankFunc: config.experienceToNextRankFunc,
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

    return new Gem(meleeGem);
};