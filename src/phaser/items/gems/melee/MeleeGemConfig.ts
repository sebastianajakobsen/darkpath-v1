import { SocketType } from '@/phaser/items/itemSocket';
import { ItemAttributeType, ItemCategory, ItemRarityType } from '@/phaser/items/IItem';
import { GemTag, GemType } from '@/phaser/items/gems/IGem';
import { type IMeleeGemConfig, MeleeGemType } from '@/phaser/items/gems/melee/IMeleeGem';


export const meleeGemConfig: IMeleeGemConfig[] = [
    {
        id: '',
        rank: 1,
        maxRank: 10,
        name: MeleeGemType.ClEAVE,
        description: 'Performs a wide cleave attack with your melee weapon.',
        dropChance: 0.05,
        itemLevel: 1,
        subType: MeleeGemType.ClEAVE,
        type: GemType.MELEE,
        tags: [GemTag.AREA_OF_EFFECT, GemTag.MELEE], // Example tags for melee
        requirements: { level: 1, strength: 12 },
        attribute: ItemAttributeType.STR,
        size: { width: 1, height: 1 },
        icons: {
            item: 'skills/melee/cleave/cleave_item_icon.png',
            ground: 'skills/melee/cleave/cleave_item_icon.png',
            skill: 'skills/melee/cleave/cleave_skill_icon.png',
        },
        isGloballyAvailable: true,
        socketType: SocketType.RED,
        castSpeed: 200,
        baseDamage: 100,
        range: 150,
        baseManaCost: 10,
        currentExperience: 0,
        experienceToNextRank: 0,
        activeModifiers: {
            increasedAttackSpeed: 0,
            additionalDamage: 0,
        },
        // Additional properties like spell gems
        identified: true,
        stackAble: false,
        stackSize: 1,
        maxStackSize: 1,
        rarity: ItemRarityType.NORMAL,
        category: ItemCategory.GEM,
        baseDamageFunc: (currentRank: number) => Math.round(70 + currentRank * 10),
        baseManaCostFunc: (currentRank: number) => Math.round(5 + currentRank * 1.5),
        experienceToNextRankFunc: (currentRank: number) => Math.pow(currentRank, 2) * 120,
    },
    // You can add more melee gem configurations here
];
