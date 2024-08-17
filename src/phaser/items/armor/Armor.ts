import type { ArmorPropertyType, IArmorItem } from '@/phaser/items/armor/ArmorInterfaces';
import { Item } from '@/phaser/items/Item';

export class Armor extends Item<ArmorPropertyType> {
    constructor(item: IArmorItem) {
        super(item);
    }
}
