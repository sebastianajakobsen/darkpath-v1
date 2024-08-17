import { type IScrollConfig, ScrollType } from '@/phaser/items/consumable/scrolls/ScrollInterface';
import { ConsumableType } from '@/phaser/items/consumable/IConsumable';
import { ItemCategory, ItemRarityType } from '@/phaser/items/IItem';


export const scrollConfig: IScrollConfig[] = [
    {
        id: '',
        name: ScrollType.SCROLL_OF_IDENTIFY,
        description: 'hello',
        itemLevel: 1,
        dropChance: 0.03,
        subType: ScrollType.SCROLL_OF_IDENTIFY,
        type: ConsumableType.SCROLL,
        requirements: { },
        size: { width: 1, height: 1 },
        icons: {
            item: 'items/consumable/scroll-of-identify.png',
            ground: 'items/consumable/scroll-of-identify.png',
        },
        isGloballyAvailable: false,
        identified: false,
        maxStackSize: 20,
        stackAble: true,
        stackSize: 1,
        rarity: ItemRarityType.NORMAL,
        category: ItemCategory.CONSUMABLE,
    },
];
