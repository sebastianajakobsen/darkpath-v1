import { BaseTextBox } from '@/phaser/InteractiveObjects/textboxes/BaseTextBox';
import { rarityColorMap, rarityFontSizeMap } from '@/phaser/const/Font';
import { type IItem, ItemCategory, ItemRarityType } from '@/phaser/items/IItem';
import type { BaseScene } from '@/phaser/scenes/BaseScene';
import { CurrencyType } from '@/phaser/items/currency/CurrencyInterfaces';



export class ItemTextBox extends BaseTextBox {
    private readonly itemData: IItem<any>;

    constructor(scene: BaseScene, x: number, y: number, item: IItem<any>) {
        const fontSize = rarityFontSizeMap[item.rarity ?? ItemRarityType.NORMAL];
        let color = rarityColorMap[item.rarity ?? ItemRarityType.NORMAL];
        if(item.category === ItemCategory.GEM) {
            color = rarityColorMap[ItemRarityType.GEM];
        }



        let name = item.name;

        if (item.stackAble) {
            name = `${item.stackSize}x ${item.name}`;
        }

        super(scene, x, y, name, fontSize, color);

        // we want to update the visibilty of items when they drops
        this.itemData = item;

        this.scene.textBoxes.push(this);
    }

    protected performInteraction() {
        if(this.itemData.category === ItemCategory.CURRENCY && this.itemData.properties.type === CurrencyType.GOLD) {
            this.scene.inventoryStore.addGold(this.itemData.stackSize);
            super.destroy();
            this.destroy();
            this.scene.events.emit('ItemTextBoxDestroyed', this);
            return;
        } else if (this.scene.inventoryStore.addItem(this.itemData)) {
            super.destroy();
            this.destroy();
            this.scene.events.emit('ItemTextBoxDestroyed', this);
        }
    }
}
