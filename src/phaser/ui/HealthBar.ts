import type { Actor } from '@/phaser/actors/Actor';
import type { BaseScene } from '@/phaser/scenes/BaseScene';

export class HealthBar {
    private container: Phaser.GameObjects.Container;
    // bars
    private healthBar: Phaser.GameObjects.Image;
    private readonly damageBar: Phaser.GameObjects.Image;
    private backgroundBar: Phaser.GameObjects.Image;

    private actor!: Actor;

    private lastHealth = 0;
    private lastMaxHealth = 0;

    private offsetX = 0;
    private offsetY = 25;
    private barWidth = 55;
    private barHeight = 5;

    constructor(scene: BaseScene, actor: Actor) {
        this.actor = actor;

        this.offsetX = (this.barWidth - this.actor.body.width) / 2;

        this.backgroundBar = scene.add
            .image(0, 0, 'health-background')
            .setOrigin(0, 1)
            .setDisplaySize(this.barWidth, this.barHeight);
        this.healthBar = scene.add
            .image(0, 0, 'health')
            .setOrigin(0, 1)
            .setDisplaySize(this.barWidth, this.barHeight);
        this.damageBar = scene.add
            .image(0, 0, 'health-damage')
            .setOrigin(0, 1)
            .setDisplaySize(this.barWidth, this.barHeight);

        this.container = scene.add
            .container(actor.x, actor.y - 25, [this.backgroundBar, this.damageBar, this.healthBar])
            .setSize(this.barWidth, this.barHeight)
            .setDepth(777777);

        this.update(); // Initialize the health bar
    }

    hide() {
        this.container.setVisible(false);
    }

    update(): void {
        if (!this.actor.scene.cameras.main.worldView.contains(this.actor.x, this.actor.y)) {
            this.container.setVisible(false);
            return;
        }

        this.container.setVisible(true);

        // update the position of the container
        this.container.setPosition(this.actor.body.x - this.offsetX, this.actor.body.y - this.offsetY);

        // exit early if the health hasn't changed
        if (this.lastHealth === this.actor.health.currentHealth && this.lastMaxHealth === this.actor.health.maxHealth) return;

        this.lastHealth = this.actor.health.currentHealth;
        this.lastMaxHealth = this.actor.health.maxHealth;

        const healthPercentage = this.lastHealth / this.lastMaxHealth;
        const newWidth = 55 * healthPercentage;

        this.healthBar.displayWidth = newWidth;
        this.damageBar.displayWidth = newWidth; // Instantly update damage bar width
    }

    destroy(): void {
        this.container.destroy();
        this.backgroundBar.destroy();
        this.healthBar.destroy();
        this.damageBar.destroy();
    }
}
