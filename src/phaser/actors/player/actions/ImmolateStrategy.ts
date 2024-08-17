import type { Player } from '@/phaser/actors/player/Player';
import type { IItem } from '@/phaser/items/IItem';
import type { ISpellGemConfig } from '@/phaser/items/gems/spells/ISpellGem';
import { useActionBarStore } from '@/stores/useActionBarStore';
import { ImmolateSkill } from '@/phaser/skills/spells/ImmolateSkill';
import { SkillGUIHelper } from '@/phaser/skills/SkillGUIHelper';

export class ImmolateStrategy {
    private readonly player!: Player;
    private readonly spellConfig!: IItem<ISpellGemConfig>;
    private readonly castCooldown: number;
    private spell!: ImmolateSkill;

    private gui?: dat.GUI; // Reference to dat.GUI instance
    private guiFolder?: dat.GUI; // Reference to the folder instance
    private assetsHasLoaded: boolean = false;
    constructor(player: Player, spellConfig: IItem<ISpellGemConfig>) {
        this.player = player;
        this.spellConfig = spellConfig;
        this.castCooldown = 1000;

        // Create the GUI controls
        // Use the GUI from player.scene
        this.gui = this.player.scene.gui;

        // Create the GUI controls
        if (this.gui) {
            const folderName = 'ImmolateStrategy'+'-'+this.spellConfig.id;
            this.guiFolder = SkillGUIHelper.createGUI(this.gui, this.spellConfig, folderName);
        }

        const assetsToLoad = [
            { type: 'image', key: 'immolate_skill_effect', path: 'assets/skills/spells/immolate/immolate_skill_effect.png' },
        ];

        this.player.scene.assetLoader.loadAssets(assetsToLoad, this.onAssetsLoaded.bind(this));
    }

    private onAssetsLoaded() {
        console.log('All audio assets for Cleave are loaded and ready to be played');
        // Initialize components that depend on the loaded assets
        this.assetsHasLoaded = true;

        this.spell = new ImmolateSkill(this.player.scene, 0, 0, this.player, this.spellConfig); // Adjust the constructor as needed

        // Set cooldown for the spell
        this.player.cooldownManager.setCooldown(this.spellConfig.properties.subType, 1000, this.player.scene.time.now);
        useActionBarStore().initiateCooldown(this.spellConfig.properties.subType, 1000);

    }
    trigger() {
        if(!this.assetsHasLoaded) return;
        const now = this.player.scene.time.now;

        // Check if the spell is on cooldown
        if (this.player.cooldownManager.isOnCooldown(this.spellConfig.properties.subType, now)) {
            return;
        }

        // Check if the player has enough mana to cast the spell
        const canCast = this.player.useMana(this.spellConfig.properties.baseManaCost);
        if (!canCast) return;

        // Deactivate other active spells in the spell group
        // this.deactivateOtherSpells();

        // Activate the current spell
        this.spell.toggleActive();

        // Reset the cooldown for the spell
        this.player.cooldownManager.setCooldown(this.spellConfig.properties.subType, this.castCooldown, now);
        useActionBarStore().initiateCooldown(this.spellConfig.properties.subType, this.castCooldown);
    }

    // deactivateOtherSpells() {
    //     // Deactivate all spells in the spell group except the current spell
    //     this.spellGroup.children.each((spell: ImmolateSkill) => {
    //         if (spell.id !== this.spell.id) {
    //             spell.deactivate();
    //         }
    //     }, this);
    // }

    destroy() {
        // Destroy the current spell instance
        this.spell.destroy();

        // Remove the GUI folder
        if (this.gui && this.guiFolder) {
            this.gui.removeFolder(this.guiFolder);
        }
    }

    update() {
        if(this.assetsHasLoaded && this.spell.isActivated && this.spell.active) {
            this.spell.update();
        }
    }

}
