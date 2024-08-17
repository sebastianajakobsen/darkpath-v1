import { type IItem, type ItemAttributeType, ItemCategory, ItemEquipmentType } from '@/phaser/items/IItem';
import type { IBodyArmorItemType } from '@/phaser/items/armor/bodyArmor/BodyArmorInterfaces';
import type { Socket } from '@/phaser/items/itemSocket';

export enum ArmorType {
  HELMET = 'Helmet',
  GLOVES = 'Gloves',
  BODY_ARMOR = 'Body Armor',
  BELT = 'Belt',
  BOOTS = 'Boots'
}

// Generic armor detail type
export interface IBaseArmorProperties {
  equipSlot: ItemEquipmentType[];
  type: ArmorType;
  attribute: ItemAttributeType;
  affix: [];
  armor: number;
  minArmor: number;
  maxArmor: number;
  maxSockets: number;
  sockets: Socket[];
}

export type ArmorPropertyType = IBodyArmorItemType;

export interface IArmorItem extends IItem<ArmorPropertyType> {
  category: ItemCategory.ARMOR;
  properties: ArmorPropertyType;
}
