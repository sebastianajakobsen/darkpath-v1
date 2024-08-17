import type { ArmorPropertyType } from '@/phaser/items/armor/ArmorInterfaces';


export enum ItemRarityType {
    NORMAL = 'Normal',
    MAGIC = 'Magic',
    RARE = 'Rare',
    UNIQUE = 'Unique',
    GEM = 'Gem'
}

export enum ItemCategory {
    WEAPON = 'Weapon',
    OFFHAND = 'Offhand',
    ARMOR = 'Armor',
    ACCESSORY = 'Accessory',
    CONSUMABLE = 'Consumable',
    MATERIAL = 'Material',
    SPECIAL = 'Special',
    CURRENCY = 'Currency',
    GEM = 'Gem'
}

export type ItemTypes =
    | ItemCategory.WEAPON
    | ItemCategory.OFFHAND
    | ItemCategory.ARMOR
    | ItemCategory.CURRENCY
    | ItemCategory.ACCESSORY
    | ItemCategory.MATERIAL
    | ItemCategory.SPECIAL
    | ItemCategory.GEM;

export enum ItemAttributeType {
    INT = 'INT',
    STR = 'STR',
    DEX = 'DEX'
}

export enum ItemEquipmentType {
    HELMET = 'Helmet',
    GLOVES = 'Gloves',
    BODY_ARMOR = 'BodyArmor',
    BELT = 'Belt',
    BOOTS = 'Boots',

    WEAPON = 'Weapon',
    OFFHAND = 'Offhand',

    AMULET = 'Amulet',
    RING = 'Ring'
}

export type ItemEquipment =
    | IItem<ArmorPropertyType>


export interface IItemRequirements {
    level?: number;
    strength?: number;
    intelligence?: number;
    dexterity?: number;
}

export interface IItemSize {
    width: number;
    height: number;
}

export interface IItemIcons {
    item: string;
    ground: string;
    skill?: string;
}

export interface IItemGeneralProps {
    id: string;
    name: string;
    description: string;
    requirements: IItemRequirements;
    size: IItemSize;
    icons: IItemIcons;
    isGloballyAvailable: boolean;
    identified: boolean;
    stackAble: boolean;
    stackSize: number;
    maxStackSize: number;
    dropChance: number;
    itemLevel: number;
    rarity: ItemRarityType; // Adjust based on your rarity implementation
    category: ItemCategory; // Assuming category is a string, adjust as necessary
}

export interface IItem<TProperties> extends IItemGeneralProps {
    properties: TProperties;
}
