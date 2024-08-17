import { type IItem, ItemCategory } from '@/phaser/items/IItem';


export enum CurrencyType {
  GOLD = 'Gold'
}

export type MaxStackSize = {
  [type in CurrencyType]: number;
};

export interface IBaseCurrencyProperties {
  dropChance: number;
}

export interface GoldItemType extends IBaseCurrencyProperties {
  type: CurrencyType.GOLD;
  subType: CurrencyType.GOLD;
  // ... other common properties for currency items, if needed
}

export type ICurrencyPropertyType = GoldItemType;

export interface ICurrencyItem extends IItem<ICurrencyPropertyType> {
  category: ItemCategory.CURRENCY;
  properties: ICurrencyPropertyType;
}
