import { Item } from '@/phaser/items/Item';
import type { IConsumableItem, IConsumablePropertyType } from '@/phaser/items/consumable/IConsumable';


export class Consumable extends Item<IConsumablePropertyType> {
    constructor(item: IConsumableItem) {
        super(item);
    }
}
