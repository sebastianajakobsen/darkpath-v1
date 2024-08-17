import { type IBaseArmorProperties, ArmorType } from '@/phaser/items/armor/ArmorInterfaces';
import type { IItemGeneralProps } from '@/phaser/items/IItem';

export enum BodyArmorType {
  TATTERED_ROBE = 'Tattered Robe'
  // WORN_SHIRT = 'Worn Shirt',
  // MAGE_ROPE = 'Mage Robe',
  // LEATHER_VEST = 'Leather Vest',
  // HARD_LEATHER_ARMOUR = 'Hard Leather Armour',
  // BREASTPLATE = 'Breastplate'
  // CHAINMAIL = 'Chainmail'
  // LEATHER_JACKET = 'Leather Jacket',
  // CUIRASS = 'Cuirass',
  // PLATE_MAIL = 'Plate Mail'
}

export interface IBodyArmorItemType extends IBaseArmorProperties {
  type: ArmorType.BODY_ARMOR;
  subType: BodyArmorType;
}

export interface IBodyArmorConfig extends IBodyArmorItemType, IItemGeneralProps {}
