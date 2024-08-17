import  { type ISupportGemConfig, SupportGemType } from '@/phaser/items/gems/supports/ISupportGem';
import { GemTag, GemType } from '@/phaser/items/gems/IGem';
import { ItemAttributeType, ItemCategory, ItemRarityType } from '@/phaser/items/IItem';
import { SocketType } from '@/phaser/items/itemSocket';


export const supportGemConfigs: ISupportGemConfig[] = [
    {
        id: '',
        rank: 1,
        maxRank: 10,
        name: SupportGemType.MULTIPLE_PROJECTILES_SUPPORT,
        description: 'Adds additional projectiles to supported spells.',
        dropChance: 0.03,
        itemLevel: 1,
        subType: SupportGemType.MULTIPLE_PROJECTILES_SUPPORT,
        type: GemType.SUPPORT,
        tags: [GemTag.PROJECTILE], // determined what kind of spell it can be used on
        requirements: { level: 1, intelligence: 10 },
        attribute: ItemAttributeType.INT,
        size: { width: 1, height: 1 },
        icons: {
            item: 'skills/support/multipleProjectiles/multiple_projectiles_item_icon.png',
            ground: 'skills/support/multipleProjectiles/multiple_projectiles_item_icon.png',
        },
        isGloballyAvailable: false,
        socketType: SocketType.PURPLE,
        currentExperience: 0,
        experienceToNextRank: 0,
        // Adding the missing properties
        identified: true, // Assuming all gems are initially identified
        stackAble: false, // Assuming gems cannot be stacked
        stackSize: 1, // Default value for non-stackable items
        maxStackSize: 1, // Default value for non-stackable items
        rarity: ItemRarityType.NORMAL, // Assuming a string type for rarity, adjust based on your actual type for rarity
        modifiers: { additionalProjectiles: 2 },
        category: ItemCategory.GEM,
        calculateModifiers: (currentRank: number) => {
            return {
                additionalProjectiles: 3 + currentRank, // Or some other formula based on level
            };
        },
        experienceToNextRankFunc: (currentRank: number) => Math.pow(currentRank, 2) * 100,
    },
    {
        id: '',  // You might want to assign a unique ID here
        rank: 1,
        maxRank: 20,  // Example max level
        name: SupportGemType.FASTER_CASTING_SUPPORT,
        description: 'Increases the casting speed of linked spells.',
        dropChance: 0.03,
        itemLevel: 1,
        subType: SupportGemType.FASTER_CASTING_SUPPORT,
        type: GemType.SUPPORT,
        tags: [GemTag.SPELL], // determined what kind of spell it can be used on
        requirements: { level: 1, intelligence: 10 },  // Adjust requirements as necessary
        attribute: ItemAttributeType.INT,
        size: { width: 1, height: 1 },
        icons: {
            item: 'skills/support/fasterCasting/faster_casting_item_icon.png',
            ground: 'skills/support/fasterCasting/faster_casting_item_icon.png',
        },
        isGloballyAvailable: false,
        socketType: SocketType.BLUE,  // Typically, casting speed gems would be blue (magic/intelligence)
        currentExperience: 0,
        experienceToNextRank: 0,
        identified: true,
        stackAble: false,
        stackSize: 1,
        maxStackSize: 1,
        rarity: ItemRarityType.NORMAL,
        modifiers: { increasedCastSpeed: 20 },  // Starting modifier, can adjust based on balance needs
        category: ItemCategory.GEM,
        calculateModifiers: (currentRank: number) => {
            return {
                increasedCastSpeed: 100 + currentRank * 0.5,  // Example scaling, adjust as needed
            };
        },
        experienceToNextRankFunc: (currentRank: number) => Math.pow(currentRank, 2) * 120,
    },
];
