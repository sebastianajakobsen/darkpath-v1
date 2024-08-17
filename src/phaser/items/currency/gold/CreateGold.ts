import { Currency } from '@/phaser/items/currency/Currency';
import  { CurrencyType, type ICurrencyItem } from '@/phaser/items/currency/CurrencyInterfaces';
import type { IGoldConfig } from '@/phaser/items/currency/gold/GoldInterface';
import { GoldConfig } from '@/phaser/items/currency/gold/GoldConfig';
import { ItemCategory, ItemRarityType } from '@/phaser/items/IItem';


export const createGold = (subType: CurrencyType, stackSize: number): Currency | null => {
    const getCurrencyConfig: Record<string, IGoldConfig> = {
        ...Object.fromEntries(GoldConfig.map((body) => [body.subType, body])),
    };
    const config = getCurrencyConfig[subType];

    const GoldCurrency: ICurrencyItem = {
        id: config.id,
        name: config.name,
        description: config.description,
        category: ItemCategory.CURRENCY,
        rarity: ItemRarityType.NORMAL,
        properties: {
            type: config.type,
            dropChance: config.dropChance,
            subType: config.subType,
        },
        dropChance: config.dropChance,
        itemLevel: config.itemLevel,
        icons: config.icons,
        size: config.size,
        identified: true,
        requirements: config.requirements,
        stackAble: config.stackAble,
        stackSize: stackSize,
        maxStackSize: config.maxStackSize,
        isGloballyAvailable: config.isGloballyAvailable,
    };

    return new Currency(GoldCurrency);
};
