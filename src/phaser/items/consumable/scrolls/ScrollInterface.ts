import { type IBaseConsumableProperties, type ScrollItemType , ConsumableType } from '@/phaser/items/consumable/IConsumable';
import type { IItemGeneralProps } from '@/phaser/items/IItem';

export enum ScrollType {
  SCROLL_OF_IDENTIFY = 'Scroll of identify'
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

export interface IScrollProperties extends IBaseConsumableProperties {
  type: ConsumableType.SCROLL;
  subType: ScrollType;
}

export interface IScrollConfig extends ScrollItemType, IItemGeneralProps {}
