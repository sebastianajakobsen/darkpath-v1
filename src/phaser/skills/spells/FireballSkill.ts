import type { BaseScene } from '@/phaser/scenes/BaseScene';
import { Skill } from '@/phaser/skills/Skill';
import type { Actor } from '@/phaser/actors/Actor';
import { SoundGroup } from '@/phaser/SoundManager';

export class FireballSkill extends Skill {
    private overlapCollider?: Phaser.Physics.Arcade.Collider;
    private rangeSquared!: number;  // Cached squared range value
    private frameCount: number = 0;
    private pierceCount: number = 0;  // Number of pierces so far
    private piercedTargets: Set<Actor>;  // Set to store pierced targets


    constructor(scene: BaseScene, x: number, y: number, actor: Actor, spellConfig: any) {
        super(scene, x, y, 'fireball_skill_effect', 'fireball', actor, spellConfig, true);

        // Add sounds to a group
        this.setDisplaySize(32, 32); // Set the fireball size
        const diameter = Math.min(this.width, this.height);
        this.setCircle(diameter / 2); // Set the radius to half the diameter
        this.piercedTargets = new Set<Actor>(); // Initialize the set
    }

    public cast(direction: Phaser.Math.Vector2, x: number, y: number) {
        this.rangeSquared = this.getRange() ** 2; // Calculate once if range doesn't change
        this.scene.soundManager.playSoundInGroup(SoundGroup.SkillSounds, 'fireball_attack_audio', { volume: 0.3 });
        this.initialPosition.set(x, y);
        this.activate(x, y);
        this.setRotation(Math.atan2(direction.y, direction.x));
        this.body?.velocity.set(direction.x * this.spellConfig.properties.projectileSpeed, direction.y * this.spellConfig.properties.projectileSpeed);
        this.enableOverlap();
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

    handleOverlap(_skill: FireballSkill, target: Actor) {
        // Check if the target has already been pierced
        if (this.piercedTargets.has(target)) {
            return;
        }

        // Calculate the current distance squared from the initial position
        const dx = this.x - this.actor.x;
        const dy = this.y - this.actor.y;
        const distanceFromInitialSquared = dx * dx + dy * dy;

        // Define the maximum distance squared for full volume
        const maxDistanceSquared = this.rangeSquared;  // Adjust as needed to fit your game's scale

        // Play the attack impact sound with the adjusted volume based on distance
        this.scene.soundManager.playSoundInGroup(
            SoundGroup.SkillSounds,
            'fireball_attack_impact_audio',
            {}, // Set the default volume
            distanceFromInitialSquared,
            maxDistanceSquared,
        );

        this.actor.applyDamage(this.actor, target, this.spellConfig.properties.baseDamage);
        this.piercedTargets.add(target); // Add the target to the set of pierced targets

        // Increment pierce count and deactivate if it exceeds the limit
        if (++this.pierceCount > this.spellConfig.properties.projectilePierceCount) {
            this.deactivate();
        }
    }

    private isWithinMaxDistanceThreshold(): boolean {
        const dx = this.x - this.initialPosition.x;
        const dy = this.y - this.initialPosition.y;
        const distanceFromInitialSquared = dx * dx + dy * dy;

        return distanceFromInitialSquared <= this.rangeSquared; // Use the cached value
    }

    update() {
        super.update();

        // Check if the fireball is still within its maximum range
        if (++this.frameCount % 5 === 0) {
            if (this.active && this.visible && !this.isWithinMaxDistanceThreshold()) {
                this.deactivate();
            }
        }
    }

    deactivate(): void {
        this.disableOverlap();
        this.pierceCount = 0;  // Reset pierce count on each cast
        this.piercedTargets.clear(); // Clear the set of pierced targets

        super.deactivate();
    }

    destroy(): void {
        this.deactivate();
        super.destroy();
    }
}
