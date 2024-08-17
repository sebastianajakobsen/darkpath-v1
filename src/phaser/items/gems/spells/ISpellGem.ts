import { type IBaseGemProperties, GemType } from '@/phaser/items/gems/IGem';
import type { IItemGeneralProps } from '@/phaser/items/IItem';

export enum SpellGemType {
  FIRE_BALL = 'Fire Ball',
  CHAIN_LIGHTNING = 'Chain Lightning',
  IMMOLATE = 'Immolate',
}

interface ISpellGemModifiers {
  additionalProjectiles?: number;
  increasedCastSpeed?: number;
  // ... other possible modifiers
}

export interface SpellGemItemType extends IBaseGemProperties {
  type: GemType.SPELL;
  subType: SpellGemType;
  baseDamage: number;
  chains: number;
  castSpeed: number; // Base casts per second
  baseManaCost: number;
  projectiles: number;
  projectileSpeed: number;
  projectilePierceCount: number;
  experienceToNextRankFunc: (currentRank: number)=> number;
  baseManaCostFunc: (currentRank: number)=> number;
  baseDamageFunc: (currentRank: number)=> number;
  activeModifiers: ISpellGemModifiers;
  range: number;
  isToggleable: boolean;
}

export interface ISpellGemConfig extends SpellGemItemType, IItemGeneralProps {}
