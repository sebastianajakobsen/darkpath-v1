import type { IItem, ItemAttributeType, ItemCategory } from '@/phaser/items/IItem';
import type { SocketType } from '@/phaser/items/itemSocket';
import type { SpellGemItemType } from '@/phaser/items/gems/spells/ISpellGem';
import type { SupportGemItemType } from '@/phaser/items/gems/supports/ISupportGem';
import type { MeleeGemItemType } from '@/phaser/items/gems/melee/IMeleeGem';

export enum GemType {
  SPELL = 'Spell',
  SUPPORT = 'Support',
  MELEE = 'Melee' // Add this new type
}

export enum GemTag {
  PROJECTILE = 'Projectile',
  AREA_OF_EFFECT = 'AoE',
  SPELL = 'Spell',
  CHAINING = 'Chaining',
  FIRE = 'FIRE',
  LIGHTNING = 'LIGHTNING',
  MELEE = 'Melee' // Add this new tag
}

export interface IBaseGemProperties {
  type: GemType;
  rank: number;
  maxRank: number;
  attribute: ItemAttributeType;
  socketType: SocketType;
  tags: GemTag[];
  currentExperience: number;
  experienceToNextRank: number;
  experienceToNextRankFunc: (currentLevel: number)=> number;
}

export type ItemGemPropertyType = SpellGemItemType | SupportGemItemType | MeleeGemItemType;

export interface IGemItem extends IItem<ItemGemPropertyType> {
  category: ItemCategory.GEM;
  properties: ItemGemPropertyType;
}
