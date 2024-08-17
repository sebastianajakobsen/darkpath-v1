
import { TreasureChest } from '@/phaser/InteractiveObjects/containers/TreasureChest';
import { BaseScene } from '@/phaser/scenes/BaseScene';
import { createBodyArmor } from '@/phaser/items/armor/bodyArmor/CreateBodyArmor';
import { ItemRarityType } from '@/phaser/items/IItem';
import { BodyArmorType } from '@/phaser/items/armor/bodyArmor/BodyArmorInterfaces';
import { ItemDrop } from '@/phaser/items/ItemDrop';
import { createScroll } from '@/phaser/items/consumable/scrolls/CreateScroll';
import { ScrollType } from '@/phaser/items/consumable/scrolls/ScrollInterface';
import { createSpellGem } from '@/phaser/items/gems/spells/CreateSpellGem';
import { SpellGemType } from '@/phaser/items/gems/spells/ISpellGem';
import { SupportGemType } from '@/phaser/items/gems/supports/ISupportGem';
import { createSupportGem } from '@/phaser/items/gems/supports/CreateSupportGem';
import { createMeleeGem } from '@/phaser/items/gems/melee/CreateMeleeGem';
import { MeleeGemType } from '@/phaser/items/gems/melee/IMeleeGem';
import { Zombie } from '@/phaser/actors/enemy/Zombie';

export class Scene1 extends BaseScene {
    constructor() {
        super('Scene1');
    }

    preload() {
        super.preload();
    }

    create() {
        super.create();

        // create the scene level
        this.initMapLevel();

        new TreasureChest(this, 400, 300); // Replace 100, 100 with desired coordinates
        new TreasureChest(this, 300, 300); // Replace 100, 100 with desired coordinates
        new ItemDrop(this, 400, 400, createBodyArmor(BodyArmorType.TATTERED_ROBE, ItemRarityType.MAGIC));
        new ItemDrop(this, 400, 400, createBodyArmor(BodyArmorType.TATTERED_ROBE, ItemRarityType.MAGIC));
        new ItemDrop(this, 400, 400, createScroll(ScrollType.SCROLL_OF_IDENTIFY));
        new ItemDrop(this, 400, 400, createScroll(ScrollType.SCROLL_OF_IDENTIFY));

        new ItemDrop(this, 400, 400, createBodyArmor(BodyArmorType.TATTERED_ROBE, ItemRarityType.MAGIC));
        new ItemDrop(this, 400, 400, createBodyArmor(BodyArmorType.TATTERED_ROBE, ItemRarityType.MAGIC));
        new ItemDrop(this, 400, 400, createScroll(ScrollType.SCROLL_OF_IDENTIFY));
        new ItemDrop(this, 400, 400, createScroll(ScrollType.SCROLL_OF_IDENTIFY));

        new ItemDrop(this, 400, 400, createBodyArmor(BodyArmorType.TATTERED_ROBE, ItemRarityType.MAGIC));
        new ItemDrop(this, 400, 400, createBodyArmor(BodyArmorType.TATTERED_ROBE, ItemRarityType.MAGIC));
        new ItemDrop(this, 400, 400, createScroll(ScrollType.SCROLL_OF_IDENTIFY));
        new ItemDrop(this, 400, 400, createScroll(ScrollType.SCROLL_OF_IDENTIFY));

        new ItemDrop(this, 400, 400, createSpellGem(SpellGemType.FIRE_BALL));
        new ItemDrop(this, 400, 400, createSupportGem(SupportGemType.MULTIPLE_PROJECTILES_SUPPORT));
        new ItemDrop(this, 400, 400, createSupportGem(SupportGemType.FASTER_CASTING_SUPPORT));
        new ItemDrop(this, 400, 400, createSpellGem(SpellGemType.CHAIN_LIGHTNING));
        new ItemDrop(this, 400, 400, createSpellGem(SpellGemType.CHAIN_LIGHTNING));
        new ItemDrop(this, 400, 400, createSpellGem(SpellGemType.CHAIN_LIGHTNING));
        new ItemDrop(this, 400, 400, createSpellGem(SpellGemType.FIRE_BALL));
        new ItemDrop(this, 400, 400, createSpellGem(SpellGemType.IMMOLATE));

        new ItemDrop(this, 400, 400, createMeleeGem(MeleeGemType.ClEAVE));

        const test1  = new ItemDrop(this, 400, 400, createSpellGem(SpellGemType.IMMOLATE));
        test1.itemData.properties.range = 100;
        const test  = new ItemDrop(this, 400, 400, createSpellGem(SpellGemType.IMMOLATE));
        test.itemData.properties.range = 800;

        // add enemies to the group
        this.addZombie(1200, 1200);
        this.addZombie(1200, 800);

        const test1234 = new Zombie(this, 200, 200);
        test1234.deactivate();

        // Uncomment if needed for testing
        for (let i = 0; i < 1000; i++) {
            this.addZombie(Math.random() * 1600, Math.random() * 1200);
        }

        // const debug = this.add.graphics();
        //
        // debug.lineStyle(1, 0x00ff00);
        //
        // debug.setDepth(99999999);
        //
        // let results = [];
        //
        // this.input.on('pointermove', pointer => {
        //
        //     //  First clear the previous results
        //     results.forEach(entry => {
        //         entry.gameObject.setTint(0xffffff);
        //     });
        //
        //     debug.clear();
        //     //  Update the search area
        //     const bbox = {
        //         minX: pointer.worldX - 100,
        //         minY: pointer.worldY - 100,
        //         maxX: pointer.worldX + 100,
        //         maxY: pointer.worldY + 100,
        //     };
        //
        //     //  Search the RTree
        //     const allResults = this.physics.world.tree.search(bbox);
        //
        //     // Filter results for only active entities
        //     results = allResults.filter(entry => entry.gameObject.active);
        //
        //     //  Set Tint on intersecting Sprites
        //     results.forEach(entry => {
        //         console.log('entry', entry);
        //         entry.gameObject.setTint(0xff0000);
        //         entry.gameObject.takeDamage(10000);
        //     });
        //
        //     //  Draw debug
        //     debug.strokeRect(pointer.worldX - 100, pointer.worldY - 100, 200, 200);
        // }, this);
        //
        // console.log('this.scene.physics.world', this.physics.world.tree);
    }


    update(time: number, delta: number) {
        super.update(time, delta); // call the parent's update method
    }
}