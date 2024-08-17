import type { Player } from '@/phaser/actors/player/Player';
import type { IItem } from '@/phaser/items/IItem';
import type { ISpellGemConfig } from '@/phaser/items/gems/spells/ISpellGem';
import { useActionBarStore } from '@/stores/useActionBarStore';
import { ChainLightningSkill } from '@/phaser/skills/spells/ChainLightningSkill';
import { SkillGUIHelper } from '@/phaser/skills/SkillGUIHelper';

export class ChainLightningStrategy {
    private player!: Player;
    private readonly spellConfig!: IItem<ISpellGemConfig>;
    private readonly reusableVector: Phaser.Math.Vector2;
    private readonly castCooldown: number;
    private skillPool!: Phaser.GameObjects.Group;

    private gui?: dat.GUI; // Reference to dat.GUI instance
    private guiFolder?: dat.GUI; // Reference to the folder instance
    private assetsHasLoaded: boolean = false;
    constructor(player: Player, spellConfig: IItem<ISpellGemConfig>) {
        this.player = player;
        this.spellConfig = spellConfig;
        this.reusableVector = new Phaser.Math.Vector2();
        this.castCooldown = this.spellConfig.properties.castSpeed;

        // Create the GUI controls
        // Use the GUI from player.scene
        this.gui = this.player.scene.gui;

        // Create the GUI controls
        if (this.gui) {
            const folderName = 'ChainLightningStrategy'+'-'+this.spellConfig.id;
            this.guiFolder = SkillGUIHelper.createGUI(this.gui, this.spellConfig, folderName);
        }

        const assetsToLoad = [
            { type: 'audio', key: 'chain_lightning_attack_audio', path: 'assets/skills/spells/chainLightning/chain_lightning_attack_audio.wav' },
            { type: 'audio', key: 'chain_lightning_attack_audio2', path: 'assets/skills/spells/chainLightning/chain_lightning_attack_audio2.wav' },
            { type: 'audio', key: 'chain_lightning_attack_audio3', path: 'assets/skills/spells/chainLightning/chain_lightning_attack_audio3.wav' },
            { type: 'image', key: 'chain_lightning_skill_effect', path: 'assets/skills/spells/chainLightning/chain_lightning_skill_effect.png' },
        ];

        this.player.scene.assetLoader.loadAssets(assetsToLoad, this.onAssetsLoaded.bind(this));
    }

    private onAssetsLoaded() {
        console.log('All audio assets for chain_lightning are loaded and ready to be played');
        // Initialize components that depend on the loaded assets
        // Create a group to manage the pool of ChainLightningSkill instances
        this.skillPool = this.player.scene.add.group({
            classType: ChainLightningSkill,
            runChildUpdate: false,
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

        this.player.movementCooldownTimer = 200;
        this.player.movementManager.stopMovement();
        this.player.setFlipX(direction.x < 0);

        const pointer = this.player.scene.input.activePointer;
        this.reusableVector.set(pointer.worldX, pointer.worldY);

        const skill = this.getOrCreateSkill();
        skill.cast(this.reusableVector);

        this.player.cooldownManager.setCooldown(this.spellConfig.properties.subType, this.castCooldown, now);
        useActionBarStore().initiateCooldown(this.spellConfig.properties.subType, this.castCooldown);
    }

    private getOrCreateSkill(): ChainLightningSkill {
        let skill = this.skillPool.getFirstDead(false) as ChainLightningSkill;

        if (!skill) {
            // Add a new skill to the pool if there are no dead skills available
            skill = new ChainLightningSkill(
                this.player.scene,
                this.player.x,
                this.player.y,
                this.player,
                this.spellConfig,
            );
            this.skillPool.add(skill);
        }

        skill.setActive(true).setVisible(true); // Activate and show the skill
        return skill;
    }

    update() {}

    public destroy() {
        // Remove the GUI folder
        if (this.gui && this.guiFolder) {
            this.gui.removeFolder(this.guiFolder);
        }
        this.skillPool.clear(true, true);
    }
}