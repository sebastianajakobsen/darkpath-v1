import { Item } from '@/phaser/items/Item';
import type { ICurrencyItem, ICurrencyPropertyType } from '@/phaser/items/currency/CurrencyInterfaces';


export class Currency extends Item<ICurrencyPropertyType> {
    constructor(item: ICurrencyItem) {
        super(item);
    }
}
