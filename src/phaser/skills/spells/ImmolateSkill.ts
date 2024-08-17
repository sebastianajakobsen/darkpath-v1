import type { BaseScene } from '@/phaser/scenes/BaseScene';
import { type Actor } from '@/phaser/actors/Actor';
import { useActionBarStore } from '@/stores/useActionBarStore';
import { Skill } from '@/phaser/skills/Skill';

const FADE_DURATION = 300; // Duration in milliseconds
const FADE_ALPHA_ACTIVE = 0.5;
const FADE_ALPHA_INACTIVE = 0;
const DAMAGE_INTERVAL = 200; // Damage interval in milliseconds
const CLEANUP_THRESHOLD = 1000; // Arbitrary large number for map cleanup
const CLEANUP_INTERVAL = 5000; // Interval to clean up the map periodically

export class ImmolateSkill extends Skill {
    public isActivated: boolean = false;
    private lastDamageTimes: Map<string, number> = new Map();
    private damageTimer?: Phaser.Time.TimerEvent;
    private overlapCollider?: Phaser.Physics.Arcade.Collider;

    constructor(scene: BaseScene, x: number, y: number, actor: Actor, spellConfig: any) {
        super(scene, x, y, 'immolate_skill_effect', 'immolate', actor, spellConfig, true);
        this.initialize();
    }

    private initialize(): void {
        this.lastDamageTimes = new Map();
        this.setAlpha(FADE_ALPHA_INACTIVE);
        const range = this.spellConfig.properties.range;
        this.setDisplaySize(range, range);
        const diameter = Math.min(this.width, this.height);
        this.setCircle(diameter / 2);
        this.deactivate();
    }

    public deactivate(): void {
        this.clearTimers();
        this.isActivated = false;
        useActionBarStore().setActiveAction(this.spellConfig.id, false);
        this.disableOverlap();
        super.deactivate();
    }

    private clearTimers(): void {
        if (this.damageTimer) {
            this.damageTimer.remove();
            this.damageTimer = undefined;
        }
        if (this.lastDamageTimes && this.lastDamageTimes.size > CLEANUP_THRESHOLD) {
            this.cleanupDamageTimes();
        }
    }

    public toggleActive(): void {
        this.isActivated = !this.isActivated;
        this.activate(this.actor.x, this.actor.y);
        useActionBarStore().setActiveAction(this.spellConfig.id, this.isActivated);
        if (this.isActivated) {
            this.fadeIn();
            this.enableOverlap();
        } else {
            this.fadeOut();
            this.disableOverlap();
        }
    }

    private fadeIn(): void {
        this.scene.tweens.add({
            targets: this,
            alpha: FADE_ALPHA_ACTIVE,
            duration: FADE_DURATION,
            ease: 'Sine.easeInOut',
        });
    }

    private fadeOut(): void {
        this.scene.tweens.add({
            targets: this,
            alpha: FADE_ALPHA_INACTIVE,
            duration: FADE_DURATION,
            ease: 'Sine.easeInOut',
            onComplete: () => this.deactivate(),
        });
    }

    private enableOverlap(): void {
        if (!this.overlapCollider) {
            this.overlapCollider = this.scene.physics.add.overlap(this, this.scene.enemies, this.handleOverlap, null, this);
        }
    }

    private disableOverlap(): void {
        if (this.overlapCollider) {
            this.scene.physics.world.removeCollider(this.overlapCollider);
            this.overlapCollider = undefined;
        }
    }

    handleOverlap(skill: ImmolateSkill, target: Actor): void {
        const currentTime = this.scene.time.now;
        const lastDamageTime = this.lastDamageTimes.get(target.id) || 0;
        if (currentTime - lastDamageTime > DAMAGE_INTERVAL) {
            this.actor.applyDamage(this.actor, target, this.spellConfig.properties.baseDamage);
            this.lastDamageTimes.set(target.id, currentTime);
        }
    }

    private cleanupDamageTimes(): void {
        const currentTime = this.scene.time.now;
        this.lastDamageTimes.forEach((time, id) => {
            if (currentTime - time > CLEANUP_INTERVAL) {
                this.lastDamageTimes.delete(id);
            }
        });
    }

    update(): void {
        if (this.isActivated) {
            this.setPosition(this.actor.x, this.actor.y);
        }
    }

    destroy(): void {
        this.deactivate();
        super.destroy();
    }
}
