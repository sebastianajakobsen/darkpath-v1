import type { ArmorType } from '@/phaser/items/armor/ArmorInterfaces';

export enum AffixType {
  Prefix = 'Prefix',
  Suffix = 'Suffix'
}

export type Bonus = {
  min: number;
  max: number;
  current?: number; // This property will hold the rolled value
  unit: BonusUnit;
};

export type AffixBonus = {
  [key: string]: Bonus;
};
export enum BonusUnit {
  RawNumber = 'RawNumber',
  Percentage = 'Percentage'
}

export type Affix = {
  type: AffixType;
  level: number;
  name: string;
  prefixName?: string;
  suffixName?: string;
  bonus: AffixBonus; // Changed this from Bonus to AffixBonus
  tags: string[];
  applicableTo: (ArmorType)[]; //   applicableTo: (ArmorType | AccessoryType | WeaponType | OffhandType)[];
};
