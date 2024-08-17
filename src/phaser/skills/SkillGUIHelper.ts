import type { IItem } from '@/phaser/items/IItem';
import type { ISpellGemConfig } from '@/phaser/items/gems/spells/ISpellGem';

export class SkillGUIHelper {
    static createGUI(gui: dat.GUI, spellConfig: IItem<ISpellGemConfig>, folderName: string): dat.GUI {
        const guiFolder = gui.addFolder(folderName);

        // Loop through each property in spellConfig.properties
        for (const [key, value] of Object.entries(spellConfig.properties)) {
            // Check if the value is a number to decide the range and step
            if (typeof value === 'number') {
                // Define default min and max values
                let min = 0;
                let max = 1000;
                const step = 1;

                // Customize min, max, and step for specific properties if needed
                if (key === 'projectileSpeed') {
                    min = 100;
                    max = 2000;
                } else if (key === 'baseDamage') {
                    min = 10;
                    max = 1000;
                } else if (key === 'projectilePierceCount') {
                    min = 0;
                    max = 10;
                } else if (key === 'range') {
                    min = 100;
                    max = 2000;
                } else if (key === 'projectiles') {
                    min = 1;
                    max = 50;
                } else if (key === 'castSpeed') {
                    min = 60;
                    max = 2000;
                } else if (key === 'maxRank') {
                    min = 1;
                    max = 20;
                }

                // Add the property to the GUI
                guiFolder.add(spellConfig.properties, key, min, max).name(SkillGUIHelper.capitalize(key)).step(step);
            }
        }

        guiFolder.open();
        gui.open();

        return guiFolder;
    }

    private static capitalize(str: string): string {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}
