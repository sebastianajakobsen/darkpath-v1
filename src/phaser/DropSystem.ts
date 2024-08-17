import { ItemRarityType } from '@/phaser/items/IItem';
import { ArmorType } from '@/phaser/items/armor/ArmorInterfaces';
import { createBodyArmor } from '@/phaser/items/armor/bodyArmor/CreateBodyArmor';
import type { BodyArmorType } from '@/phaser/items/armor/bodyArmor/BodyArmorInterfaces';
import { levelBatches } from '@/phaser/items/ItemDatabase';
import { ConsumableType } from '@/phaser/items/consumable/IConsumable';
import { createScroll } from '@/phaser/items/consumable/scrolls/CreateScroll';
import type { ScrollType } from '@/phaser/items/consumable/scrolls/ScrollInterface';
import { GemType } from '@/phaser/items/gems/IGem';
import { createSpellGem } from '@/phaser/items/gems/spells/CreateSpellGem';
import type { SpellGemType } from '@/phaser/items/gems/spells/ISpellGem';
import { createSupportGem } from '@/phaser/items/gems/supports/CreateSupportGem';
import type { SupportGemType } from '@/phaser/items/gems/supports/ISupportGem';
import { createGold } from '@/phaser/items/currency/gold/CreateGold';
import { CurrencyType } from '@/phaser/items/currency/CurrencyInterfaces';

const GLOBAL_DROP_CHANCE = 0.01; // 100% chance for any item to drop
const GLOBAL_ADDITIONAL_DROP_CHANCE = 0.1; // 60%
const GLOBAL_MAX_ITEMS_TO_DROP = 10;
const GLOBAL_GOLD_DROP_CHANCE = 0.4;

const GLOBAL_RARITY_CHANCES: Record<ItemRarityType, number> = {
    [ItemRarityType.UNIQUE]: 0.01, // 1% chance
    [ItemRarityType.RARE]: 0.05, // Additional 14% chance (total 15%)
    [ItemRarityType.MAGIC]: 0.15, // Additional 25% chance (total 40%)
    // [ItemRarityType.GEM]: 0.15, // Additional 25% chance (total 40%)
    [ItemRarityType.NORMAL]: 1.0, // Remaining 60% chance
};


// A function to decide whether an item should drop
export const shouldDropItem = (): boolean => {
    return Math.random() < GLOBAL_DROP_CHANCE;
};

// Mapping function
const createItemByType = (
    itemType: string,
    subType: string,
    rarity: ItemRarityType = ItemRarityType.NORMAL,
) => {
    switch (itemType) {
    case ArmorType.BODY_ARMOR:
        return createBodyArmor(subType as BodyArmorType, rarity);
        // case WeaponType.SWORD:
        //     return createSword(subType as SwordType, rarity);
        // // Extend this for other types as needed
        // case AccessoryType.RING:
        //     return createRing(subType as RingType, rarity);
        // case AccessoryType.AMULET:
        //     return createAmulet(subType as AmuletType, rarity);
        // case OffhandType.SHIELD:
        //     return createShield(subType as ShieldType, rarity);
        // // Extend this for other types as needed

    case GemType.SUPPORT:
        return createSupportGem(subType as SupportGemType);

    case GemType.SPELL:
        return createSpellGem(subType as SpellGemType);

    case ConsumableType.SCROLL:
        return createScroll(subType as ScrollType);
    // // Extend this for other types as needed
    default:
        console.error('Unknown item type:', itemType);
        return null;
    }
};

const calculateGoldAmount = (level: number): number => {
    const baseGold = 10; // Base amount of gold for level 1 enemy
    const goldPerLevel = 5; // Additional gold per enemy level

    // Optionally, you could introduce some randomness
    const randomFactor = Math.random() * 0.4 + 0.8; // Random number between 0.8 and 1.2

    // return random gold amount
    return Math.floor((baseGold + level * goldPerLevel) * randomFactor);
};

const weightedRandomItem = (possibleItems: any[]): any => {
    const chosenRarity = rollForRarity(); // New function for rolling rarity

    const totalWeight = possibleItems.reduce((acc, item) => acc + item.dropChance, 0);
    let randomNum = Math.random() * totalWeight;

    for (const item of possibleItems) {
        randomNum -= item.dropChance;
        if (randomNum < 0) {
            return createItemByType(item.type, item.subType, chosenRarity);
        }
    }
    return null;
};

const rollForRarity = (): ItemRarityType => {
    return (
        (Object.keys(GLOBAL_RARITY_CHANCES) as ItemRarityType[]).find((rarity) => {
            return Math.random() < GLOBAL_RARITY_CHANCES[rarity];
        }) || ItemRarityType.NORMAL
    );
};

export function calculateLevelBounds(level: number) {
    const lowerBound = Math.floor((level - 1) / 5) * 5 + 1;
    const upperBound = lowerBound + 4;
    const key = `${lowerBound}-${upperBound}`;
    return { lowerBound, upperBound, key };
}



// Item drop function using the mapping
export const dropItemBasedOnLevel = (level: number, isChest = false) => {
    const { key } = calculateLevelBounds(level);
    const possibleItems = levelBatches[key] || [];
    const droppedItems: any[] = [];
    let numberOfItemsToDrop = isChest ? 10 : 1; // default to 1 item

    // Handle gold dropping logic
    if (Math.random() < GLOBAL_GOLD_DROP_CHANCE) {
        const goldAmount = calculateGoldAmount(level); // Define this function to decide gold amount based on enemy
        const goldDrop = createGold(CurrencyType.GOLD, goldAmount);
        droppedItems.push(goldDrop);
    }

    // Decide whether to drop multiple items
    if (Math.random() < GLOBAL_ADDITIONAL_DROP_CHANCE) {
        numberOfItemsToDrop = 3; // Drop a minimum of 3 items

        // Try to drop additional items, up to a maximum
        while (numberOfItemsToDrop < GLOBAL_MAX_ITEMS_TO_DROP) {
            if (Math.random() < GLOBAL_ADDITIONAL_DROP_CHANCE) {
                numberOfItemsToDrop++;
            } else {
                break;
            }
        }
    }

    // Generate the items based on numberOfItemsToDrop
    for (let i = 0; i < numberOfItemsToDrop; i++) {
        const newItem = weightedRandomItem(possibleItems);
        if (newItem) {
            droppedItems.push(newItem);
        }
    }

    if (droppedItems.length > 0) {
        return droppedItems;
    }

    return null;
};
