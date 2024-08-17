import type { BaseScene } from '@/phaser/scenes/BaseScene';
import type { Actor } from '@/phaser/actors/Actor';
import { Skill } from '@/phaser/skills/Skill';

// TODO: need better animation when i get time for it
export class CleaveSkill extends Skill {
    private debugGraphicsArea: Phaser.GameObjects.Graphics;
    private debugGraphics: Phaser.GameObjects.Graphics;
    private hitEnemies: Set<Phaser.GameObjects.GameObject>;
    private center: Phaser.Math.Vector2;
    private direction: Phaser.Math.Vector2;
    private bbox: Phaser.Geom.Rectangle;
    private enemyPoints: Phaser.Math.Vector2[];
    private maskGraphics: Phaser.GameObjects.Graphics;

    // audio
    private attackAudio!: any;
    private attackImpactAudio!: any;


    constructor(scene: BaseScene, x: number, y: number, actor: Actor, spellConfig: any) {
        super(scene, x, y, 'cleave_skill_effect', 'cleave', actor, spellConfig, false);

        if(this.scene.physics.world.drawDebug) {
            this.debugGraphicsArea = this.scene.add.graphics({ fillStyle: { color: 0xff0000, alpha: 0.5 } });
            this.debugGraphics = this.scene.add.graphics({ lineStyle: { width: 2, color: 0x00ff00, alpha: 0.5 } });
        }

        this.attackAudio = this.scene.sound.add('cleave_attack_audio', { volume: 0.5, loop: false, rate: 1 });
        this.attackImpactAudio = this.scene.sound.add('cleave_attack_impact_audio', { volume: 0.5, loop: false, rate: 1 });
        this.initialize();
    }

    private initialize(): void {
        this.hitEnemies = new Set();


        this.center = new Phaser.Math.Vector2();
        this.direction = new Phaser.Math.Vector2();
        this.bbox = new Phaser.Geom.Rectangle();
        this.enemyPoints = [
            new Phaser.Math.Vector2(),
            new Phaser.Math.Vector2(),
            new Phaser.Math.Vector2(),
            new Phaser.Math.Vector2(),
            new Phaser.Math.Vector2(),
        ];

        this.maskGraphics = this.scene.add.graphics({ fillStyle: { color: 0xffffff, alpha: 1 } });
        const mask = this.maskGraphics.createGeometryMask();
        this.setMask(mask);

        this.setDisplaySize(this.spellConfig.properties.range * 2 , this.spellConfig.properties.range * 2 );
        this.deactivate();
    }

    public cast(direction: Phaser.Math.Vector2): void {
        this.attackAudio.play({ volume: 0.1 });

        this.activate(this.actor.x, this.actor.y);
        // play audio
        // this.setAlpha(0.5);
        this.hitEnemies.clear();
        this.drawCleaveArea(direction);
        this.checkHits(direction);
        // this.deactivate();
    }

    private drawCleaveArea(direction: Phaser.Math.Vector2): void {
        const radius = this.spellConfig.properties.range;
        const angle = Math.atan2(direction.y, direction.x);
        const { x, y } = this.actor;

        // Apply flip based on direction, avoiding unnecessary state management
        this.setFlipY(direction.x < 0);

        // Calculate angles based on direction in one place
        const halfPi = Math.PI / 2;
        const antiClockwise = direction.x < 0;
        const startAngle = angle - halfPi * (antiClockwise ? -1 : 1);
        const endAngle = angle + halfPi * (antiClockwise ? -1 : 1);

        // Reset and redraw graphics
        this.maskGraphics.clear();
        this.setRotation(angle);
        this.setPosition(x, y);

        this.scene.tweens.addCounter({
            from: startAngle,
            to: endAngle,
            duration: 250, // Duration of the animation in milliseconds
            ease: 'Power2',
            onUpdate: tween => {
                const currentAngle = tween.getValue();
                this.maskGraphics.clear();
                this.maskGraphics.fillStyle(0xffffff, 0);
                this.maskGraphics.beginPath();
                this.maskGraphics.moveTo(x, y);
                this.maskGraphics.arc(x, y, radius, startAngle, currentAngle, antiClockwise);
                this.maskGraphics.closePath();
                this.maskGraphics.fillPath();
            },
            onComplete: () => {
                // TODO: fade the cleave before deactivating

                // fade away this
                this.scene.tweens.add({
                    targets: this,
                    alpha: 0,
                    duration: 200,
                    ease: 'Power2',
                    onComplete: () => {
                        this.maskGraphics.clear();
                        this.deactivate(); // Deactivate the skill after the animation completes
                    },
                });

            },
        });


        if(this.debugGraphicsArea && this.debugGraphics) {
            this.drawDebugBox(this.actor.x, this.actor.y, radius, startAngle, endAngle, antiClockwise);
        }

    }

    private drawDebugBox(x: number, y: number, radius: number, startAngle: number, endAngle: number, antiClockwise: boolean): void {

        this.debugGraphicsArea.clear();
        this.debugGraphicsArea.beginPath();
        this.debugGraphicsArea.arc(this.actor.x, this.actor.y, radius, startAngle, endAngle, antiClockwise);
        this.debugGraphicsArea.lineTo(this.actor.x, this.actor.y);
        this.debugGraphicsArea.closePath();
        this.debugGraphicsArea.fillPath();


        this.debugGraphics.clear();
        this.debugGraphics.lineStyle(2, 0x00ff00, 0.5);
        this.debugGraphics.strokeCircle(x, y, radius);
    }

    private checkHits(direction: Phaser.Math.Vector2): void {
        const radius = this.spellConfig.properties.range;
        const radiusSquared = radius * radius;
        this.center.set(this.actor.x, this.actor.y);
        const angle = Math.atan2(direction.y, direction.x);

        this.bbox.setTo(this.actor.x - radius, this.actor.y - radius, radius * 2, radius * 2);

        const bodiesInRect = this.scene.physics.overlapRect(this.bbox.x, this.bbox.y, this.bbox.width, this.bbox.height, true, false);

        // console.log(bodiesInRect);

        const filteredResults = bodiesInRect.filter(body => {
            const gameObject = body.gameObject as Actor;
            const isNotSelf = gameObject.id !== this.actor.id;
            return gameObject.active && isNotSelf && gameObject.isActor;
        });

        filteredResults.forEach(body => {
            const targetActor = body.gameObject as Actor;

            if (this.enemyWithinHalfCircle(targetActor, this.center, radiusSquared, angle)) {
                this.handleOverlap(targetActor);
            }
        });
    }

    private enemyWithinHalfCircle(enemy: Phaser.GameObjects.GameObject, center: Phaser.Math.Vector2, radiusSquared: number, angle: number): boolean {
        const body = enemy.body as Phaser.Physics.Arcade.Body;
        this.enemyPoints[0].set(body.left, body.top);
        this.enemyPoints[1].set(body.right, body.top);
        this.enemyPoints[2].set(body.left, body.bottom);
        this.enemyPoints[3].set(body.right, body.bottom);
        this.enemyPoints[4].set(body.center.x, body.center.y);

        for (const point of this.enemyPoints) {
            if (this.pointInHalfCircle(point, center, radiusSquared, angle)) {
                return true;
            }
        }
        return false;
    }

    private pointInHalfCircle(point: Phaser.Math.Vector2, center: Phaser.Math.Vector2, radiusSquared: number, angle: number): boolean {
        const dx = point.x - center.x;
        const dy = point.y - center.y;
        const distanceSquared = dx * dx + dy * dy;

        if (distanceSquared > radiusSquared) return false;

        const pointAngle = Math.atan2(dy, dx);
        let normalizedAngle = pointAngle - angle;

        normalizedAngle = Phaser.Math.Angle.Wrap(normalizedAngle);

        return normalizedAngle >= -Math.PI / 2 && normalizedAngle <= Math.PI / 2;
    }

    protected handleOverlap(target: Actor): void {
        if (!target || this.hitEnemies.has(target)) return;
        this.hitEnemies.add(target);
        this.attackImpactAudio.play({ volume: 0.08 });
        this.actor.applyDamage(this.actor, target, this.spellConfig.properties.baseDamage);
    }

    deactivate(): void {
        // this.graphics.clear();
        // this.debugGraphics.clear();
        super.deactivate();
    }

    update(): void {
        // No update logic needed for instant attack
    }

    destroy(): void {
        if(this.debugGraphics) {
            this.debugGraphics.destroy();
        }

        if(this.debugGraphicsArea) {
            this.debugGraphicsArea.destroy();
        }
        this.deactivate();
        super.destroy();
    }
}
