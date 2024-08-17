import type { IScrollProperties } from '@/phaser/items/consumable/scrolls/ScrollInterface';
import { type IItem, ItemCategory } from '@/phaser/items/IItem';

export enum ConsumableType {
  SCROLL = 'Scroll'
}

export interface IBaseConsumableProperties {
  type: ConsumableType;
}

export type ScrollItemType = IScrollProperties;

export type IConsumablePropertyType = ScrollItemType;

export interface IConsumableItem extends IItem<IConsumablePropertyType> {
  category: ItemCategory.CONSUMABLE;
  properties: IConsumablePropertyType;
}
