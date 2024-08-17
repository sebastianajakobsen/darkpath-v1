export interface IMapTile {
  type: MapTileType;
  walkable: boolean;
}

/**
 * Enum for TileType defines all possible types of tiles used in the game.
 * These types are directly mapped to Phaser's tileset indices, ensuring
 * consistency between the logical representation of tiles in the game's code
 * and their visual representation in the tileset image.
 *
 * The values assigned to each type correspond to the index of that tile type
 * in the tileset used by Phaser. For example, a TileType of Dirt1 with a value
 * of 0 means that the first tile in the Phaser tileset represents the Dirt1 tile.
 *
 * The Empty tile type is a special case used to represent the absence of a tile,
 * typically with a value of -1, which does not directly correspond to a visible
 * tile in Phaser but may be used for logic handling within the game.
 *
 * This enum is crucial for tile management throughout the game, including
 * rendering the map and defining tile-based behaviors such as collision detection,
 * pathfinding walkability, and environmental effects.
 */
export enum MapTileType {
  Empty = -1, // Special case for the absence of a tile
  Dirt1 = 0, // First variation of dirt
  Dirt2 = 1, // Second variation of dirt
  Dirt3 = 2, // Third variation of dirt
  Grass1 = 3, // First variation of grass
  Grass2 = 4, // Second variation of grass
  Floor = 5, // A generic floor tile
  Stone1 = 6, // First variation of stone
  Stone2 = 7 // Second variation of stone
}

export interface IMapRoom {
  x: number;
  y: number;
  width: number;
  height: number;
  isStart?: boolean;
  isEnd?: boolean;
  type: RoomType;
}

export enum RoomType {
  Normal = 'Normal',
  Treasure = 'Treasure',
  Trap = 'Trap'
}
