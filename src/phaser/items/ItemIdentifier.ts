import { type IItem, ItemRarityType } from '@/phaser/items/IItem';
import { type Affix, AffixType } from '@/phaser/items/affixes/ItemAffixTypes';
import { equipSlotToAffixesMapping } from '@/phaser/items/affixes/ItemAffix';
import { itemRandPrefixes, itemSlotSuffixes } from '@/phaser/items/affixes/ItemNameAffixes';

export class ItemIdentifier {
    static identify(item: IItem<any>): boolean {
        if (item.identified) return false;

        item.identified = true; // Moved to the top to avoid multiple calls
        const method = item.rarity === ItemRarityType.UNIQUE ? 'applyUniqueAffix' : 'applyRandomAffix';
        this[method](item);

        return true;
    }

    // New method for unique affixes
    private static applyUniqueAffix(item: IItem<any>): void {
        item.properties.affix = item.properties.affix.map((affix) =>
            this.calculateAndApplyAffix(item, affix),
        );
    }

    private static getRandomAffix(affixes: Affix[]): Affix {
        return affixes[Math.floor(Math.random() * affixes.length)];
    }
    private static applyRandomAffix(item: IItem<any>): void {
        const affixesForItem = equipSlotToAffixesMapping[item.properties.equipSlot] || [];
        const [prefix, suffix] =
      item.rarity === ItemRarityType.MAGIC
          ? [this.getRandomAffix(affixesForItem), undefined]
          : [
              this.getRandomAffix(affixesForItem.filter((a) => a.type === AffixType.Prefix)),
              this.getRandomAffix(affixesForItem.filter((a) => a.type === AffixType.Suffix)),
          ];

        this.applyAffixesToItem(item, prefix, suffix);
    }

    private static calculateAndApplyAffix(item: IItem<any>, affix: Affix): Affix {
        return this.calculateAffixValues(affix);
    // this.applyAffixToItem(item, newAffix);;
    }

    private static applyAffixesToItem(item: IItem<any>, prefix?: Affix, suffix?: Affix): void {
        if (prefix) {
            item.properties.affix.push(this.calculateAndApplyAffix(item, prefix));
        }

        if (suffix) {
            item.properties.affix.push(this.calculateAndApplyAffix(item, suffix));
        }

        // Handle item naming based on rarity.
        switch (item.rarity) {
        case ItemRarityType.RARE: {
        // Variables are scoped within these braces, resolving the ESLint warning.
            const selectedPrefix =
          itemRandPrefixes[Math.floor(Math.random() * itemRandPrefixes.length)];
            const selectedSuffixes = itemSlotSuffixes[item.properties.equipSlot];
            let selectedSuffix = '';

            if (selectedSuffixes && selectedSuffixes.length > 0) {
                selectedSuffix = selectedSuffixes[Math.floor(Math.random() * selectedSuffixes.length)];
            } else {
                console.warn(`No suffixes found for the slot: ${item.properties.equipSlot}`);
            }

            item.name = `${selectedPrefix} ${item.name} ${selectedSuffix}`.trim();
            break;
        }
        default: {
        // Also scoped with braces for consistency and future-proofing.
            const prefixName = prefix ? `${prefix.name} ` : '';
            const suffixName = suffix ? ` ${suffix.name}` : '';
            item.name = `${prefixName}${item.name}${suffixName}`.trim();
            break;
        }
        }

    // Assuming the bracket fix might not be needed with the new logic, but you can add it if necessary.
    }

    private static calculateAffixValues(affix: Affix): Affix {
        return {
            ...affix,
            bonus: Object.fromEntries(
                Object.entries(affix.bonus).map(([key, value]) => [
                    key,
                    { ...value, current: this.getRandomNumber(value.min, value.max) },
                ]),
            ),
        };
    }

    private static getRandomNumber(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // TODO: figure out if this is needed
    // private static applyAffixToItem(item: IItem<any>, chosenAffix: Affix): void {
    //   for (const bonusKey in chosenAffix.bonus) {
    //     const appliedValue = chosenAffix.bonus[bonusKey].current;

    // switch (bonusKey) {
    //   case 'maximumLife':
    //     item.properties.life = appliedValue;
    //     break;
    //   case 'increasedBurningDamage':
    //     item.properties.burningDamageMultiplier = 1 + appliedValue / 100;
    //     break;
    //   case 'armor':
    //     item.properties.armor += appliedValue;
    //     break;
    //   // ... add other bonus attribute cases here as needed
    //   default:
    //     break;
    // }
    //   }
    // }
}
