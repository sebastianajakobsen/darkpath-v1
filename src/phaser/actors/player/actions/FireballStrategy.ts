import type { Player } from '@/phaser/actors/player/Player';
import type { IItem } from '@/phaser/items/IItem';
import type { ISpellGemConfig } from '@/phaser/items/gems/spells/ISpellGem';
import { useActionBarStore } from '@/stores/useActionBarStore';
import { FireballSkill } from '@/phaser/skills/spells/FireballSkill';
import { SkillGUIHelper } from '@/phaser/skills/SkillGUIHelper';
import dat from 'dat.gui';
import { SoundGroup } from '@/phaser/SoundManager';

export class FireballStrategy {
    private readonly player!: Player;
    private readonly spellConfig!: IItem<ISpellGemConfig>;
    private readonly reusableDirection: Phaser.Math.Vector2;
    private skillPool!: Phaser.GameObjects.Group;
    private readonly gui!: dat.GUI; // Reference to dat.GUI instance
    private readonly guiFolder!: dat.GUI; // Reference to the folder instance
    private assetsHasLoaded: boolean = false;

    constructor(player: Player, spellConfig: IItem<ISpellGemConfig>) {
        this.player = player;
        this.spellConfig = spellConfig;
        this.reusableDirection = new Phaser.Math.Vector2();

        // Create the GUI controls
        // Use the GUI from player.scene
        this.gui = this.player.scene.gui;

        // Create the GUI controls
        if (this.gui) {
            const folderName = 'FireballStrategy'+'-'+this.spellConfig.id;
            this.guiFolder = SkillGUIHelper.createGUI(this.gui, this.spellConfig, folderName);
        }

        const assetsToLoad = [
            { type: 'audio', key: 'fireball_attack_audio', path: 'assets/skills/spells/fireball/fireball_attack_audio.wav' },
            { type: 'audio', key: 'fireball_attack_impact_audio', path: 'assets/skills/spells/fireball/fireball_attack_impact_audio.wav' },
            { type: 'image', key: 'fireball_skill_effect', path: 'assets/skills/spells/fireball/fireball_skill_effect.png' },
        ];

        this.player.scene.assetLoader.loadAssets(assetsToLoad, this.onAssetsLoaded.bind(this));
    }

    private onAssetsLoaded() {
        this.player.scene.soundManager.addSoundToGroup(SoundGroup.SkillSounds, 'fireball_attack_audio', { volume: 1, loop: false, rate: 1 });
        this.player.scene.soundManager.addSoundToGroup(SoundGroup.SkillSounds, 'fireball_attack_impact_audio', { volume: 1, loop: false, rate: 1 });

        // Create a group to manage the pool of FireballSkill instances
        this.skillPool = this.player.scene.add.group({
            classType: FireballSkill,
            runChildUpdate: true,
        });


        this.player.cooldownManager.setCooldown(this.spellConfig.properties.subType, 1000, this.player.scene.time.now);
        useActionBarStore().initiateCooldown(this.spellConfig.properties.subType, 1000);

        this.assetsHasLoaded = true;
    }

    trigger(direction: Phaser.Math.Vector2) {
        if(!this.assetsHasLoaded) return;
        const now = this.player.scene.time.now;

        if (this.player.cooldownManager.isOnCooldown(this.spellConfig.properties.subType, now)) {
            return;
        }

        const canCast = this.player.useMana(this.spellConfig.properties.baseManaCost);
        if (!canCast) return;

        // Set cooldown after cast
        this.player.movementCooldownTimer = 200;
        this.player.movementManager.stopMovement();
        this.player.setFlipX(direction.x < 0);

        const numberOfProjectiles = this.spellConfig.properties.projectiles || 1;

        for (let i = 0; i < numberOfProjectiles; i++) {
            const angleOffset = (i - Math.floor(numberOfProjectiles / 2)) * 10;
            this.reusableDirection.set(direction.x, direction.y).rotate(Phaser.Math.DegToRad(angleOffset));

            const spell = this.getOrCreateSkill();
            spell.cast(this.reusableDirection, this.player.x, this.player.y);
        }

        this.player.cooldownManager.setCooldown(this.spellConfig.properties.subType, this.spellConfig.properties.castSpeed, now);
        useActionBarStore().initiateCooldown(this.spellConfig.properties.subType, this.spellConfig.properties.castSpeed);
    }

    private getOrCreateSkill(): FireballSkill {
        let skill = this.skillPool.getFirstDead(false) as FireballSkill;

        if (!skill) {
            // Add a new skill to the pool if there are no dead skills available
            skill = new FireballSkill(
                this.player.scene,
                this.player.x,
                this.player.y,
                this.player,
                this.spellConfig,
            );
            this.skillPool.add(skill);
        }
        return skill;
    }

    update() {}

    public destroy() {
        this.player.scene.soundManager.removeSoundFromGroup(SoundGroup.SkillSounds, 'fireball_attack_audio');
        this.player.scene.soundManager.removeSoundFromGroup(SoundGroup.SkillSounds, 'fireball_attack_impact_audio');

        this.skillPool.clear(true, true);

        // Remove the GUI folder
        if (this.gui && this.guiFolder) {
            this.gui.removeFolder(this.guiFolder);
        }
    }
}
