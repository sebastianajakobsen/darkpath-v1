import type { IScrollConfig, ScrollType } from '@/phaser/items/consumable/scrolls/ScrollInterface';
import { scrollConfig } from '@/phaser/items/consumable/scrolls/ScrollConfig';
import type { IConsumableItem } from '@/phaser/items/consumable/IConsumable';
import { Consumable } from '@/phaser/items/consumable/Consumable';
import { ItemCategory, ItemRarityType } from '@/phaser/items/IItem';

export const createScroll = (subType: ScrollType): Consumable => {
    const getConsumableConfig: Record<string, IScrollConfig> = {
        ...Object.fromEntries(scrollConfig.map((body) => [body.subType, body])),
    };
    const config = getConsumableConfig[subType];

    const scrollItem: IConsumableItem = {
        id: config.id,
        name: config.name,
        description: config.description,
        category: ItemCategory.CONSUMABLE,
        rarity: ItemRarityType.NORMAL,
        properties: {
            type: config.type,
            subType: config.subType,
        },
        itemLevel: config.itemLevel,
        dropChance: config.dropChance,
        icons: config.icons,
        size: config.size,
        identified: true,
        requirements: config.requirements,
        stackAble: config.stackAble,
        stackSize: config.stackSize,
        maxStackSize: config.maxStackSize,
        isGloballyAvailable: config.isGloballyAvailable,
    };

    return new Consumable(scrollItem);
};
