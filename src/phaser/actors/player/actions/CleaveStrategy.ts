import type { Player } from '@/phaser/actors/player/Player';
import type { IItem } from '@/phaser/items/IItem';
import type { ISpellGemConfig } from '@/phaser/items/gems/spells/ISpellGem';
import { CleaveSkill } from '@/phaser/skills/melee/CleaveSkill';
import { useActionBarStore } from '@/stores/useActionBarStore';
import { SkillGUIHelper } from '@/phaser/skills/SkillGUIHelper';

export class CleaveStrategy {
    private readonly player!: Player;
    private readonly spellConfig!: IItem<ISpellGemConfig>;
    private readonly castCooldown: number;
    private spell!: any;

    private gui?: dat.GUI; // Reference to dat.GUI instance
    private guiFolder?: dat.GUI; // Reference to the folder instance

    private assetsHasLoaded: boolean = false;
    constructor(player: Player, spellConfig: IItem<ISpellGemConfig>) {
        this.player = player;
        this.spellConfig = spellConfig;
        this.castCooldown =  this.spellConfig.properties.castSpeed;


        // Create the GUI controls
        // Use the GUI from player.scene
        this.gui = this.player.scene.gui;

        // Create the GUI controls
        if (this.gui) {
            const folderName = 'CleaveStrategy'+'-'+this.spellConfig.id;
            this.guiFolder = SkillGUIHelper.createGUI(this.gui, this.spellConfig, folderName);
        }




        const assetsToLoad = [
            { type: 'audio', key: 'cleave_attack_audio', path: 'assets/skills/melee/cleave/cleave_attack_audio.wav' },
            { type: 'audio', key: 'cleave_attack_impact_audio', path: 'assets/skills/melee/cleave/cleave_attack_impact_audio.wav' },
            { type: 'image', key: 'cleave_skill_effect', path: 'assets/skills/melee/cleave/cleave_skill_effect.png' },
        ];

        this.player.scene.assetLoader.loadAssets(assetsToLoad, this.onAssetsLoaded.bind(this));

    }

    private onAssetsLoaded() {
        console.log('All audio assets for Cleave are loaded and ready to be played');
        // Create a new ImmolateSpell instance and configure it
        this.spell = new CleaveSkill(this.player.scene, this.player.x, this.player.y, this.player, this.spellConfig); // Adjust the constructor as needed
        // Initialize components that depend on the loaded assets

        // Set cooldown for the spell
        this.player.cooldownManager.setCooldown(this.spellConfig.properties.subType, 1000, this.player.scene.time.now);
        useActionBarStore().initiateCooldown(this.spellConfig.properties.subType, 1000);

        this.assetsHasLoaded = true;
    }

    trigger(direction) {
        if(!this.assetsHasLoaded) return;
        const now = this.player.scene.time.now;
        // console.log('trigger');

        // Check if the spell is on cooldown
        if (this.player.cooldownManager.isOnCooldown(this.spellConfig.properties.subType, now)) {
            return;
        }

        // Check if the player has enough mana to cast the spell
        const canCast = this.player.useMana(this.spellConfig.properties.baseManaCost);
        if (!canCast) return;

        this.player.movementCooldownTimer = 200;
        this.player.movementManager.stopMovement();
        this.player.setFlipX(direction.x < 0);
        // Activate the current spell
        this.spell.cast(direction);

        // Reset the cooldown for the spell
        this.player.cooldownManager.setCooldown(this.spellConfig.properties.subType, this.castCooldown, now);
        useActionBarStore().initiateCooldown(this.spellConfig.properties.subType, this.castCooldown);
    }

    update(){}

    destroy() {

        // Remove the GUI folder
        if (this.gui && this.guiFolder) {
            this.gui.removeFolder(this.guiFolder);
        }
        // Destroy the current spell instance
        this.spell.destroy();
    }
}
