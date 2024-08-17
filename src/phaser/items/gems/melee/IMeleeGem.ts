import { type IBaseGemProperties, GemType } from '@/phaser/items/gems/IGem';
import type { IItemGeneralProps } from '@/phaser/items/IItem';

export enum MeleeGemType  {
  ClEAVE = 'Cleave',
}

interface IMeleeGemModifiers {
  increasedAttackSpeed?: number;
  additionalDamage?: number;
  // ... other possible modifiers
}

export interface MeleeGemItemType extends IBaseGemProperties {
  type: GemType.MELEE; // New type for melee gems
  subType: MeleeGemType;
  baseDamage: number;
  castSpeed: number; // Base attacks per second
  range: number;
  baseManaCost: number;
  experienceToNextRankFunc: (currentRank: number)=> number;
  baseDamageFunc: (currentRank: number)=> number;
  baseManaCostFunc: (currentRank: number)=> number;
  activeModifiers: IMeleeGemModifiers;
}


export interface IMeleeGemConfig extends MeleeGemItemType, IItemGeneralProps {}
