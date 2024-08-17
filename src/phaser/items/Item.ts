import type { IItem, IItemIcons, IItemRequirements, IItemSize, ItemCategory, ItemRarityType } from '@/phaser/items/IItem';

export class Item<TProperties> {
    id: string;
    name: string;
    description: string;
    category: ItemCategory;
    rarity: ItemRarityType;
    properties: TProperties;
    icons: IItemIcons;
    size: IItemSize;
    identified: boolean;
    requirements: IItemRequirements;
    stackAble: boolean;
    stackSize: number;
    maxStackSize: number;
    isGloballyAvailable: boolean;
    dropChance: number;
    itemLevel: number;

    constructor(item: IItem<TProperties>) {
        this.id = Phaser.Utils.String.UUID();
        this.name = item.name;
        this.description = item.description;
        this.category = item.category;
        this.rarity = item.rarity;
        this.properties = item.properties;
        this.icons = item.icons;
        this.size = item.size;
        this.identified = item.identified;
        this.requirements = item.requirements;
        this.stackAble = item.stackAble;
        this.stackSize = item.stackSize;
        this.maxStackSize = item.maxStackSize;
        this.isGloballyAvailable = item.isGloballyAvailable;
        this.dropChance = item.dropChance;
        this.itemLevel = item.itemLevel;
    }
}
