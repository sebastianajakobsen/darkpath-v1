import type { IGoldConfig } from '@/phaser/items/currency/gold/GoldInterface';
import { CurrencyType } from '@/phaser/items/currency/CurrencyInterfaces';
import { ItemCategory, ItemRarityType } from '@/phaser/items/IItem';

export const GoldConfig: IGoldConfig[] = [
    {
        id: '',
        itemLevel: 1,
        name: CurrencyType.GOLD,
        description: 'hello',
        dropChance: 0.03,
        subType: CurrencyType.GOLD,
        type: CurrencyType.GOLD,
        requirements: { level: 1, intelligence: 2 },
        size: { width: 1, height: 1 },
        icons: {
            item: `items/currency/${CurrencyType.GOLD.toLowerCase().replace(/ /g, '-')}.png`,
            ground: `items/currency/${CurrencyType.GOLD.toLowerCase().replace(/ /g, '-')}.png`,
        },
        isGloballyAvailable: false,
        identified: false,
        maxStackSize: 1,
        stackAble: true,
        stackSize: 9999999,
        rarity: ItemRarityType.NORMAL,
        category: ItemCategory.CURRENCY,
    },
];
