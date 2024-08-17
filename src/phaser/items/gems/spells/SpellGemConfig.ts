import { type ISpellGemConfig, SpellGemType } from '@/phaser/items/gems/spells/ISpellGem';
import { GemTag, GemType } from '@/phaser/items/gems/IGem';
import { ItemAttributeType, ItemCategory, ItemRarityType } from '@/phaser/items/IItem';
import { SocketType } from '@/phaser/items/itemSocket';

export const spellGemConfig: ISpellGemConfig[] = [
  {
    id: '',
    rank: 1,
    maxRank: 10,
    name: SpellGemType.FIRE_BALL,
    description: 'Launches a fiery orb that explodes on impact, damaging enemies within its blast.',
    dropChance: 0.03,
    itemLevel: 1,
    subType: SpellGemType.FIRE_BALL,
    type: GemType.SPELL,
    tags: [GemTag.PROJECTILE, GemTag.SPELL, GemTag.FIRE], // determined what kind of spell it is
    requirements: { level: 1, intelligence: 10 },
    attribute: ItemAttributeType.INT,
    size: { width: 1, height: 1 },
    icons: {
      item: 'skills/spells/fireball/fireball_item_icon.png',
      ground: 'skills/spells/fireball/fireball_item_icon.png',
      skill: 'skills/spells/fireball/fireball_skill_icon.png'
    },
    isGloballyAvailable: false,
    socketType: SocketType.RED,
    projectiles: 6,
    projectileSpeed: 500, // Speed of the fireball
    projectilePierceCount: 0, // 2 for testing
    baseDamage: 40,
    range: 800,
    chains: 0, // Assuming no chaining for the fireball
    castSpeed: 200, // 1.5 seconds for casting the fireball
    baseManaCost: 0,
    currentExperience: 0,
    experienceToNextRank: 0,
    activeModifiers: {
      additionalProjectiles: 0, // Initially set to 0, will change when a support gem is equipped
      increasedCastSpeed: 0
    },
    // Adding the missing properties
    identified: true, // Assuming all gems are initially identified
    stackAble: false, // Assuming gems cannot be stacked
    stackSize: 1, // Default value for non-stackable items
    maxStackSize: 1, // Default value for non-stackable items
    rarity: ItemRarityType.NORMAL, // Assuming a string type for rarity, adjust based on your actual type for rarity
    category: ItemCategory.GEM,
    baseManaCostFunc: (currentRank: number) => Math.round(2 + currentRank * 2),
    baseDamageFunc: (currentRank: number) => Math.round(5 + currentRank * 5) + 10,
    experienceToNextRankFunc: (currentRank: number) => Math.pow(currentRank, 2) * 100,
    isToggleable: false // Assuming the fireball spell is not a toggleable spell
  },

  {
    id: '',
    rank: 1,
    maxRank: 10,
    name: SpellGemType.CHAIN_LIGHTNING,
    description:
      'Unleashes a bolt of lightning that arcs between enemies, dealing electric damage.',
    dropChance: 0.03,
    itemLevel: 1,
    subType: SpellGemType.CHAIN_LIGHTNING,
    type: GemType.SPELL,
    tags: [GemTag.SPELL, GemTag.CHAINING, GemTag.LIGHTNING], // Including Area of Effect tag due to arcing
    requirements: { level: 1, intelligence: 10 },
    attribute: ItemAttributeType.INT,
    size: { width: 1, height: 1 },
    icons: {
      item: 'skills/spells/chainLightning/chain_lightning_item_icon.png',
      ground: 'skills/spells/chainLightning/chain_lightning_item_icon.png',
      skill: 'skills/spells/chainLightning/chain_lightning_skill_icon.png'
    },
    isGloballyAvailable: false,
    socketType: SocketType.BLUE,
    projectiles: 0, // this is not a projectile spell
    projectileSpeed: 0, // not a projectile spell
    projectilePierceCount: 0, // not a projectile spell
    baseDamage: 30, // Adjusted for balancing if necessary
    range: 700, // Slightly less than fireball to reflect the difficulty in controlling lightning
    chains: 3, // Number of times the lightning can chain
    castSpeed: 500, // 0.5 seconds for casting the lightning
    baseManaCost: 0,
    currentExperience: 0,
    experienceToNextRank: 0,
    activeModifiers: {
      additionalProjectiles: 0, // Change when a support gem is equipped that affects this
      increasedCastSpeed: 0
    },
    identified: true,
    stackAble: false,
    stackSize: 1,
    maxStackSize: 1,
    rarity: ItemRarityType.NORMAL,
    category: ItemCategory.GEM,
    baseManaCostFunc: (currentRank: number) => Math.round(3 + currentRank * 3),
    baseDamageFunc: (currentRank: number) => Math.round(8 + currentRank * 8) + 10,
    experienceToNextRankFunc: (currentRank: number) => Math.pow(currentRank, 2) * 120, // Increasing the XP required for levels due to the potency of the spell
    isToggleable: false
  },
  {
    id: '', // Unique identifier for the spell
    rank: 1,
    maxRank: 10,
    name: SpellGemType.IMMOLATE,
    description:
      'Engulf yourself in flames, causing continuous fire damage to you and nearby enemies as long as it is active. Consumes mana per second.',
    dropChance: 0.05,
    itemLevel: 1,
    subType: SpellGemType.IMMOLATE,
    type: GemType.SPELL,
    tags: [GemTag.SPELL, GemTag.FIRE, GemTag.AREA_OF_EFFECT], // DOT stands for Damage Over Time
    requirements: { level: 1, intelligence: 15 },
    attribute: ItemAttributeType.INT,
    size: { width: 1, height: 1 },
    icons: {
      item: 'skills/spells/immolate/immolate_item_icon.png',
      ground: 'skills/spells/immolate/immolate_item_icon.png',
      skill: 'skills/spells/immolate/immolate_skill_icon.png'
    },
    isGloballyAvailable: true,
    socketType: SocketType.RED,
    projectiles: 0, // This is not a projectile spell
    projectileSpeed: 0, // not a projectile spell
    projectilePierceCount: 0, // 2 for testing
    baseDamage: 10, // Initial damage per second
    castSpeed: 1500, // 1.5 seconds for casting the immolate spell
    baseManaCost: 0,
    currentExperience: 0,
    experienceToNextRank: 0,
    activeModifiers: {},
    chains: 0,
    range: 400, // aoe range for this spell
    identified: true,
    stackAble: false,
    stackSize: 1,
    maxStackSize: 1,
    rarity: ItemRarityType.NORMAL,
    category: ItemCategory.GEM,
    baseManaCostFunc: (currentRank: number) => Math.round(5 + currentRank * 1.5),
    baseDamageFunc: (currentRank: number) => Math.round(5 + currentRank * 5),
    experienceToNextRankFunc: (currentRank: number) => Math.pow(currentRank, 2) * 100,
    isToggleable: true // This spell is toggleable
  }
];
