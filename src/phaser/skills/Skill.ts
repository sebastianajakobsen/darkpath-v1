import { Entity } from '@/phaser/Entity';
import type { IItem } from '@/phaser/items/IItem';
import type { ISpellGemConfig } from '@/phaser/items/gems/spells/ISpellGem';
import type { BaseScene } from '@/phaser/scenes/BaseScene';
import type { Actor } from '@/phaser/actors/Actor';

export class Skill extends Entity {
    public initialPosition = new Phaser.Math.Vector2();
    protected castingSound!: any;
    public spellConfig!: IItem<ISpellGemConfig>;
    protected spellType: string;
    protected actor: Actor;

    constructor(scene: BaseScene, x: number, y: number, texture: string, spellType: string, actor: Actor, spellConfig: IItem<ISpellGemConfig>, hasPhysics = true) {
        super(scene, x, y, texture, false, hasPhysics);
        this.spellType = spellType;
        this.actor = actor;
        this.spellConfig = spellConfig;
    }

    protected handleOverlap(caster: Actor, target: Actor) {
        // Override this method in the child class
    }

    public getCastSpeed() {
        return this.spellConfig.properties.castSpeed;
    }

    public getManaCost() {
        return this.spellConfig.properties.baseManaCost;
    }

    public getProjectiles() {
        return (
            this.spellConfig.properties.activeModifiers.additionalProjectiles ??
            this.spellConfig.properties.projectiles
        );
    }

    public getRange() {
        return this.spellConfig.properties.range;
    }

    public getDamage() {
        return this.spellConfig.properties.baseDamage;
    }

    update() {
        super.update();
    }

    destroy() {
        super.destroy();
    }
}