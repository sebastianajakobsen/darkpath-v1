import type { IBodyArmorConfig } from '@/phaser/items/armor/bodyArmor/BodyArmorInterfaces';
import type { IScrollConfig } from '@/phaser/items/consumable/scrolls/ScrollInterface';
import { bodyArmorConfigs } from '@/phaser/items/armor/bodyArmor/BodyArmorConfig';
import { scrollConfig } from '@/phaser/items/consumable/scrolls/ScrollConfig';
import type { ISpellGemConfig } from '@/phaser/items/gems/spells/ISpellGem';
import { spellGemConfig } from '@/phaser/items/gems/spells/SpellGemConfig';
import { supportGemConfigs } from '@/phaser/items/gems/supports/SupportGemConfig';
import type { ISupportGemConfig } from '@/phaser/items/gems/supports/ISupportGem';


export const bodyArmorItemDatabase: Record<string, IBodyArmorConfig> = {
    ...Object.fromEntries(bodyArmorConfigs.map((body) => [body.subType, body])),
};

export const scrollItemDatabase: Record<string, IScrollConfig> = {
    ...Object.fromEntries(scrollConfig.map((item) => [item.subType, item])),
};

export const spellGemItemDatabase: Record<string, ISpellGemConfig> = {
    ...Object.fromEntries(spellGemConfig.map((item) => [item.subType, item])),
};

export const supportGemItemDatabase: Record<string, ISupportGemConfig> = {
    ...Object.fromEntries(supportGemConfigs.map((item) => [item.subType, item])),
};


export const allItemsConfigArray: (
    | IBodyArmorConfig
    | IScrollConfig
    | ISpellGemConfig
    | ISupportGemConfig
    )[] = [
        ...Object.values(bodyArmorItemDatabase),
        ...Object.values(scrollItemDatabase),
        ...Object.values(spellGemItemDatabase),
        ...Object.values(supportGemItemDatabase),
    ];

console.log(allItemsConfigArray);

// Sort by level
export const sortedItems = allItemsConfigArray.sort((a, b) => a.itemLevel - b.itemLevel);

// Group them by level ranges, e.g., 1-10, 11-20, etc.
export const levelBatches: Record<
    string,
    ( IBodyArmorConfig  | IScrollConfig | ISpellGemConfig | ISupportGemConfig)[]
> = {};

export function calculateLevelBounds(level: number) {
    const lowerBound = Math.floor((level - 1) / 5) * 5 + 1;
    const upperBound = lowerBound + 4;
    const key = `${lowerBound}-${upperBound}`;
    return { lowerBound, upperBound, key };
}

// const uniqueAvailableItems = sortedItems.filter((item) => item.isGloballyAvailable);
const globallyAvailableItems = sortedItems.filter((item) => item.isGloballyAvailable);
sortedItems.forEach((item) => {
    // Skip globally available items, they will be added later
    if (item.isGloballyAvailable) return;

    const { key } = calculateLevelBounds(item.itemLevel);

    if (!levelBatches[key]) {
        levelBatches[key] = [];
    }

    levelBatches[key].push(item);
});

// Explicitly add globally available items to all batches.
for (const batchKey in levelBatches) {
    levelBatches[batchKey].push(...globallyAvailableItems);
}
