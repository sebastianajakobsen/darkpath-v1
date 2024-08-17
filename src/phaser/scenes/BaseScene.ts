import Phaser from 'phaser';
import { Player } from '@/phaser/actors/player/Player';
import { MapManager } from '@/phaser/maps/MapManager';
import { PathfindingManager } from '@/phaser/maps/PathfindingManager';
import type { BaseTextBox } from '@/phaser/InteractiveObjects/textboxes/BaseTextBox';
import { ITEM_MAX_VISIBLE_DISTANCE, ITEM_VISIBILITY_CHECK_INTERVAL } from '@/phaser/const/Item';
import { Wizard } from '@/phaser/actors/player/Wizard';
import { DamageManager } from '@/phaser/damage/DamageManager';
import { useInventoryStore } from '@/stores/useInventoryStore';
import { Zombie } from '@/phaser/actors/enemy/Zombie';
import dat from 'dat.gui';
import { AssetLoader } from '@/phaser/AssetsLoader';
import { SoundManager } from '@/phaser/SoundManager'; // Import dat.GUI

// this is the base scene that all other scenes will extend
// it will contain the player, enemyManager, levelManager, and overlapManager
export class BaseScene extends Phaser.Scene {
    player!: Player;
    mapManager!: MapManager;
    pathfindingManager!: PathfindingManager;
    damageManager!: DamageManager;
    textBoxes: BaseTextBox[] = [];
    lastItemVisibilityCheck = 0;
    enemies!: Phaser.GameObjects.Group;
    inventoryStore!: ReturnType<typeof useInventoryStore>;
    gui!: dat.GUI; // Add GUI property
    assetLoader!: AssetLoader;
    soundManager!: SoundManager;

    preload() {
        // tilemap
        this.load.image('tileset', 'assets/tilesets/tileset.jpg');
        // characters / enemies
        this.load.image('wizard', 'assets/characters/wizard.png');
        this.load.image('zombie', 'assets/enemies/zombie.png');

        // healthbars
        this.load.image('health', 'assets/healthbar/health.png');
        this.load.image('health-background', 'assets/healthbar/health-background.png');
        this.load.image('health-damage', 'assets/healthbar/health-damage.png');
        // textboxes
        this.load.image('textbox-hover', 'assets/textboxes/textbox-hover.png');
        this.load.image('textbox-background', 'assets/textboxes/textbox-background.png');
        // chests
        this.load.image('woodenChestOpen', 'assets/objects/chests/wooden-chest-open.png');
        this.load.image('woodenChestClosed', 'assets/objects/chests/wooden-chest-closed.png');
        // font
        this.load.bitmapFont(
            'CinzelBold16',
            'assets/fonts/cinzel-bitmap/Cinzel-Bold16.png',
            'assets/fonts/cinzel-bitmap/Cinzel-Bold16.xml',
        );
        this.load.bitmapFont(
            'CinzelBold18',
            'assets/fonts/cinzel-bitmap/Cinzel-Bold18.png',
            'assets/fonts/cinzel-bitmap/Cinzel-Bold18.xml',
        );
        this.load.bitmapFont(
            'CinzelBold20',
            'assets/fonts/cinzel-bitmap/Cinzel-Bold20.png',
            'assets/fonts/cinzel-bitmap/Cinzel-Bold20.xml',
        );
        this.load.bitmapFont(
            'CinzelBold32',
            'assets/fonts/cinzel-bitmap/Cinzel-Bold32.png',
            'assets/fonts/cinzel-bitmap/Cinzel-Bold32.xml',
        );
    }

    create() {
        this.assetLoader = new AssetLoader(this);
        this.soundManager = new SoundManager(this);
        this.soundManager.setGroupMaxVolume('skillSounds', 1); // Maximum volume is 80%
        // only set this if debug is enabled
        if(this.physics.world.drawDebug) {
            this.createWorldGui(this.physics.world); // Initialize and assign GUI
        }

        this.enemies = this.add.group({
            runChildUpdate: true,
        }); // Initialize the zombie group

        this.inventoryStore = useInventoryStore();
        this.damageManager = new DamageManager(this);
        this.mapManager = new MapManager(this);
    }

    createWorldGui(world: Phaser.Physics.Arcade.World): void {
        this.gui = new dat.GUI({ width: 200 });

        const config = this.gui.addFolder('config');
        config.add(world, 'fps', 5, 300, 5).onChange((fps: number) => {
            world.setFPS(fps);
        });
        config.add(this.cameras.main, 'zoom', 0.1, 5, 0.1).name('Camera Zoom');
        config.add(world, 'pause');
        config.add(world, 'resume');
        config.add(world, 'timeScale', 0.1, 10, 0.1);
        config.add(world, 'fixedStep');

        const debug = this.gui.addFolder('debugGraphic');
        debug.add(world, 'drawDebug');
        debug.add(world.debugGraphic, 'visible');
        debug.add(world.debugGraphic, 'clear');

        debug.add(world.defaults, 'debugShowBody');
        debug.add(world.defaults, 'debugShowStaticBody');
        debug.add(world.defaults, 'debugShowVelocity');
        debug.addColor(world.defaults, 'bodyDebugColor');
        debug.addColor(world.defaults, 'staticBodyDebugColor');
        debug.addColor(world.defaults, 'velocityDebugColor');

        this.gui.close();
    }

    initMapLevel() {
        this.mapManager.initializeLevel();
        this.pathfindingManager = new PathfindingManager(this.mapManager.worldMapGrid);

        this.player = new Wizard(this, 400, 300);

        this.cameras.main.startFollow(this.player);
        this.cameras.main.zoom = 1;

    }

    addZombie(x: number, y: number) {
        const zombie = new Zombie(this, x, y);
        // zombie.setTarget(this.player);
        this.enemies.add(zombie);

    }

    public updateVisibilityOfItems() {
        this.textBoxes.forEach((item) => {
            const dx = this.player.x - item.objectX;
            const dy = this.player.y - item.objectY;
            const distanceSquared = dx * dx + dy * dy;

            const shouldBeVisible = distanceSquared <= ITEM_MAX_VISIBLE_DISTANCE;
            const isShowing = item.textBox.visible;

            if (shouldBeVisible && !isShowing) {
                item.setVisible(true);
            } else if (!shouldBeVisible && isShowing) {
                item.setVisible(false);
            }
        });
    }

    update(time: number, delta: number) {
        this.player.update();
        this.mapManager.update();

        if (
            time - this.lastItemVisibilityCheck > ITEM_VISIBILITY_CHECK_INTERVAL &&
            this.player.hasMoved()
        ) {
            this.updateVisibilityOfItems();
            this.lastItemVisibilityCheck = time;
        }
    }
}
