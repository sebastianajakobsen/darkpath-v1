import type { IItemGeneralProps } from '@/phaser/items/IItem';
import { GemType, type IBaseGemProperties } from '@/phaser/items/gems/IGem';


export enum SupportGemType {
  MULTIPLE_PROJECTILES_SUPPORT = 'Multiple Projectiles Support',
  FASTER_CASTING_SUPPORT = 'Faster Casting Support' // New support gem type
}

interface ISupportGemModifiers {
  additionalProjectiles?: number;
  increasedDamage?: number;
  increasedCastSpeed?: number;
  // ... other modifiers
}

export interface SupportGemItemType extends IBaseGemProperties {
  type: GemType.SUPPORT;
  subType: SupportGemType;
  currentExperience: number;
  experienceToNextRank: number;
  experienceToNextRankFunc: (currentRank: number)=> number;
  calculateModifiers: (currentRank: number)=> ISupportGemModifiers;
  modifiers: ISupportGemModifiers;
}

export interface ISupportGemConfig extends SupportGemItemType, IItemGeneralProps {}
