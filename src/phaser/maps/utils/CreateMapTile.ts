import { type IMapTile, MapTileType } from '@/phaser/maps/types';

const TILE_TEMPLATES = {
    GRASS1: { type: MapTileType.Grass1, walkable: true },
    DIRT1: { type: MapTileType.Dirt1, walkable: true },
    STONE1: { type: MapTileType.Stone1, walkable: false },
    STONE2: { type: MapTileType.Stone2, walkable: false },
    EMPTY: { type: MapTileType.Empty, walkable: false },
    // Define other templates as needed
};

export const createMapTile = (template: keyof typeof TILE_TEMPLATES): IMapTile => {
    return { ...TILE_TEMPLATES[template] };
};
