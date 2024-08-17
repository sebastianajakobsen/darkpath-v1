import  { type IBodyArmorConfig, BodyArmorType } from '@/phaser/items/armor/bodyArmor/BodyArmorInterfaces';
import { ArmorType } from '@/phaser/items/armor/ArmorInterfaces';
import { ItemAttributeType, ItemCategory, ItemEquipmentType, ItemRarityType } from '@/phaser/items/IItem';


export const bodyArmorConfigs: IBodyArmorConfig[] = [
    {
        id: '',
        name: BodyArmorType.TATTERED_ROBE,
        description: 'hello',
        itemLevel: 1,
        dropChance: 0.03,
        subType: BodyArmorType.TATTERED_ROBE,
        type: ArmorType.BODY_ARMOR,
        equipSlot: [ItemEquipmentType.BODY_ARMOR],
        requirements: { level: 1, intelligence: 2 },
        attribute: ItemAttributeType.INT,
        minArmor: 1,
        maxArmor: 3,
        armor: 2,
        size: { width: 2, height: 3 },
        icons: {
            item: 'items/bodyArmor/tattered-robe.png',
            ground: 'items/bodyArmor/tattered-robe.png',
        },
        affix: [],
        isGloballyAvailable: false,
        sockets: [],
        maxSockets: 6,
        identified: false,
        maxStackSize: 1,
        stackAble: false,
        stackSize: 1,
        rarity: ItemRarityType.NORMAL,
        category: ItemCategory.ARMOR,
    },
];
