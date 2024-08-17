import type { IGemItem, ItemGemPropertyType } from '@/phaser/items/gems/IGem';
import { Item } from '@/phaser/items/Item';
import { isSpellGemProperties } from '@/phaser/items/gems/GemUtil';


export class Gem extends Item<ItemGemPropertyType> {
    constructor(item: IGemItem) {
        super(item);
    }

    set level(newLevel: number) {
        if (isSpellGemProperties(this.properties)) {
            this.properties.rank = newLevel;
            this.updateProperties();
        }
    }

    private updateProperties() {
        if (isSpellGemProperties(this.properties)) {
            this.properties.baseManaCost = this.properties.baseManaCostFunc(this.properties.rank);
            this.properties.baseDamage = this.properties.baseDamageFunc(this.properties.rank);
            this.properties.experienceToNextRank = this.properties.experienceToNextRankFunc(
                this.properties.rank,
            );
        }
    }
}
