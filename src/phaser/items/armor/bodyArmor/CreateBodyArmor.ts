import type { BodyArmorType, IBodyArmorConfig } from '@/phaser/items/armor/bodyArmor/BodyArmorInterfaces';
import { ItemRarityType, ItemCategory } from '@/phaser/items/IItem';
import type { IArmorItem } from '@/phaser/items/armor/ArmorInterfaces';
import { ItemSocket } from '@/phaser/items/itemSocket';
import { Armor } from '@/phaser/items/armor/Armor';
import { bodyArmorConfigs } from '@/phaser/items/armor/bodyArmor/BodyArmorConfig';

export const createBodyArmor = (
    subType: BodyArmorType,
    rarity: ItemRarityType = ItemRarityType.NORMAL,
): Armor => {

    const getBodyArmorConfig: Record<string, IBodyArmorConfig> = {
        ...Object.fromEntries(bodyArmorConfigs.map((body) => [body.subType, body])),
    };
    const config = getBodyArmorConfig[subType];

    const armorItem: IArmorItem = {
        id: '',
        name: config.name,
        description: config.description,
        category: ItemCategory.ARMOR,
        rarity: rarity,
        properties: {
            type: config.type,
            subType: config.subType,
            equipSlot: config.equipSlot,
            attribute: config.attribute,
            affix: [...config.affix],
            minArmor: config.minArmor ?? 0,
            maxArmor: config.maxArmor ?? 0,
            maxSockets: config.maxSockets,
            armor:
        Math.floor(Math.random() * ((config.maxArmor ?? 0) - (config.minArmor ?? 0) + 1)) +
        (config.minArmor ?? 0),
            sockets: ItemSocket.createSockets(config.maxSockets),
        },
        itemLevel: config.itemLevel,
        dropChance: config.dropChance,
        icons: config.icons,
        size: config.size,
        identified: rarity === ItemRarityType.NORMAL,
        requirements: config.requirements,
        stackAble: config.stackAble,
        stackSize: config.stackSize,
        maxStackSize: config.maxStackSize,
        isGloballyAvailable: config.isGloballyAvailable,
    };

    return new Armor(armorItem);
};
