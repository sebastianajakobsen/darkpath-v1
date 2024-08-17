import { ItemRarityType } from '@/phaser/items/IItem';

export const FontName = {
    MainFont: '\'Cinzel\', serif',
    AltFont: '\'Arial\', sans-serif',
};

export const rarityFontSizeMap = {
    [ItemRarityType.NORMAL]: 'CinzelBold16', // Normal font size for normal items
    [ItemRarityType.MAGIC]: 'CinzelBold16', // Slightly larger font size for magic items
    [ItemRarityType.RARE]: 'CinzelBold18', // Even larger font size for rare items
    [ItemRarityType.UNIQUE]: 'CinzelBold20', // Largest font size for unique items
};
// export const rarityColorMap = {
//   [ItemRarityType.NORMAL]: '#ffffff', // GREY White
//   [ItemRarityType.MAGIC]: '#649eff', // Blue
//   [ItemRarityType.RARE]: '#f5f14e', // Yellow
//   [ItemRarityType.UNIQUE]: '#D4A017' // Gold
// };

export const rarityColorMap = {
    [ItemRarityType.NORMAL]: 0xffffff, // GREY White
    [ItemRarityType.MAGIC]: 0x649eff, // Blue
    [ItemRarityType.RARE]: 0xf5f14e, // Yellow
    [ItemRarityType.UNIQUE]: 0xd4a017, // Gold
    [ItemRarityType.GEM]: 0x7FFFD4, // Gold
};

export const FONT_DAMAGE_SIZE = 'CinzelBold20';
export const FONT_CRIT_DAMAGE_SIZE = 'CinzelBold32';
