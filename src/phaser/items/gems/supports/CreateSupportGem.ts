import type { ISupportGemConfig, SupportGemType } from '@/phaser/items/gems/supports/ISupportGem';
import  { ItemRarityType, ItemCategory } from '@/phaser/items/IItem';
import { supportGemConfigs } from '@/phaser/items/gems/supports/SupportGemConfig';
import { Gem } from '@/phaser/items/gems/Gem';
import type { IGemItem } from '@/phaser/items/gems/IGem';

export const createSupportGem = (
    subType: SupportGemType,
    rarity: ItemRarityType = ItemRarityType.NORMAL,
): Gem => {
    const getGemConfig: Record<string, ISupportGemConfig> = {
        ...Object.fromEntries(supportGemConfigs.map((body) => [body.subType, body])),
    };
    const config = getGemConfig[subType];

    const supportGem: IGemItem = {
        id: config.id,
        name: config.name,
        description: config.description,
        category: ItemCategory.GEM,
        rarity: rarity,
        properties: {
            type: config.type,
            tags: config.tags,
            subType: config.subType,
            attribute: config.attribute,
            socketType: config.socketType,
            rank: config.rank,
            maxRank: config.maxRank,
            currentExperience: config.currentExperience,
            modifiers: config.modifiers,
            experienceToNextRank: config.experienceToNextRankFunc(config.rank),
            experienceToNextRankFunc: config.experienceToNextRankFunc,
            calculateModifiers: config.calculateModifiers,
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

    return new Gem(supportGem);
};
