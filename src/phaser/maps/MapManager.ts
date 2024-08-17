
import { type IMapRoom, type IMapTile, RoomType } from '@/phaser/maps/types';
import  { MapChunkManager } from '@/phaser/maps/MapChunkManager';
import { Partition } from '@/phaser/maps/utils/Partition';
import { createMapTile } from '@/phaser/maps/utils/CreateMapTile';
import { MAP_HEIGHT, MAP_ROOM_MAX_SIZE, MAP_ROOM_MIN_SIZE, MAP_TILE_SIZE, MAP_WIDTH } from '@/phaser/const/Map';
import type { BaseScene } from '@/phaser/scenes/BaseScene';

export class MapManager {
    worldMapGrid: IMapTile[][] = []; // Add a new property to store the world data
    numColumns!: number;
    numRows!: number;
    mapChunkManager!: MapChunkManager;
    scene!: BaseScene;

    public partitionCellSize = MAP_TILE_SIZE * 4;

    constructor(scene: BaseScene) {
        this.scene = scene;
    }

    initializeLevel() {
        // Generate the world map grid
        this.worldMapGrid = this.generateMap();
        // this.scene.pathfindingManager = new PathfindingManager(this.worldMapGrid);

        // Initialize lengths
        this.numColumns = this.worldMapGrid[0].length; // Number of columns in a row -> X dimension
        this.numRows = this.worldMapGrid.length; // Number of rows -> Y dimension

        // Set world bounds based on map size, now correctly using X for width and Y for height
        this.scene.physics.world.setBounds(
            0,
            0,
            this.numColumns * MAP_TILE_SIZE, // Corrected to represent the width
            this.numRows * MAP_TILE_SIZE, // Corrected to represent the height
        );

        this.scene.physics.world.setBoundsCollision(true);

        // handles the rendering of map chunks
        this.mapChunkManager = new MapChunkManager(this.scene, this.worldMapGrid, this.numColumns, this.numRows);
    }

    decorateRoomBasedOnType(room, map: IMapTile[][]) {
        switch (room.type) {
        case RoomType.Treasure:
        // add treasure chests or something
            break;
        case RoomType.Trap:
        // add traps
            break;
        default:
        // normal room, do nothing special
            break;
        }
    }

    getRandomRoomType() {
        const types = Object.values(RoomType);
        return types[Math.floor(Math.random() * types.length)];
    }

    carveRoom(room: any, map: IMapTile[][]): void {
        for (let y = room.y; y < room.y + room.height; y++) {
            // Iterates over rows
            for (let x = room.x; x < room.x + room.width; x++) {
                // Iterates over columns
                map[y][x] = createMapTile('GRASS1'); // Correctly accessing with [y][x]
            }
        }
    }

    splitPartition(
        partition: Partition,
        minSize: number,
        maxSize: number,
        maxDepth: number,
        partitions: Partition[] = [],
    ): Partition[] {
        const children = partition.split(minSize, maxSize, maxDepth);
        if (children) {
            this.splitPartition(children[0], minSize, maxSize, maxDepth, partitions);
            this.splitPartition(children[1], minSize, maxSize, maxDepth, partitions);
        } else {
            partitions.push(partition);
        }
        return partitions;
    }

    createRoomInPartition(partition: Partition): IMapRoom {
    // Randomly reduce the size of the partition to create a room
        const roomPadding = 1; // This ensures a wall space of 1 unit around each room
        const room = {
            x: partition.x + roomPadding,
            y: partition.y + roomPadding,
            width: partition.width - roomPadding,
            height: partition.height - roomPadding,
            type: this.getRandomRoomType(),
        };
        return room;
    }

    placeDoors(map: IMapTile[][], rooms: IMapRoom[]): void {
        const maxDoorSize = 3; // Maximum door size

        rooms.forEach((room) => {
            rooms.forEach((neighbor) => {
                if (room === neighbor) return; // Skip comparing the room with itself

                // Adjusted for near vertical adjacency (considering padding)
                if (room.x + room.width + 1 === neighbor.x || room.x === neighbor.x + neighbor.width + 1) {
                    const sharedYStart = Math.max(room.y, neighbor.y) + 1; // Start one tile in to leave wall
                    const sharedYEnd = Math.min(room.y + room.height, neighbor.y + neighbor.height) - 1; // End one tile early to leave wall
                    const sharedLength = sharedYEnd - sharedYStart;

                    if (sharedLength > 2) {
                        // Ensure there's room for a door and walls
                        const actualDoorSize = Math.min(maxDoorSize, sharedLength); // Subtract 2 for the walls
                        const doorYStart = Math.floor((sharedYStart + sharedYEnd - actualDoorSize) / 2); // Adjust start based on actual door size
                        for (let doorY = doorYStart; doorY < doorYStart + actualDoorSize; doorY++) {
                            if (room.x + room.width + 1 === neighbor.x) {
                                map[doorY][room.x + room.width] = createMapTile('DIRT1'); // Corrected to [doorY][...]
                            } else {
                                map[doorY][room.x - 1] = createMapTile('DIRT1'); // Corrected to [doorY][...]
                            }
                        }
                    }
                }

                // Adjusted for near horizontal adjacency (considering padding)
                if (
                    room.y + room.height + 1 === neighbor.y ||
          room.y === neighbor.y + neighbor.height + 1
                ) {
                    const sharedXStart = Math.max(room.x, neighbor.x) + 1; // Start one tile in to leave wall
                    const sharedXEnd = Math.min(room.x + room.width, neighbor.x + neighbor.width) - 1; // End one tile early to leave wall
                    const sharedLength = sharedXEnd - sharedXStart;

                    if (sharedLength > 2) {
                        // Ensure there's room for a door and walls
                        const actualDoorSize = Math.min(maxDoorSize, sharedLength); // Subtract 2 for the walls
                        const doorXStart = Math.floor((sharedXStart + sharedXEnd - actualDoorSize) / 2); // Adjust start based on actual door size
                        for (let doorX = doorXStart; doorX < doorXStart + actualDoorSize; doorX++) {
                            if (room.y + room.height + 1 === neighbor.y) {
                                map[room.y + room.height][doorX] = createMapTile('DIRT1'); // Corrected to [...][doorX]
                            } else {
                                map[room.y - 1][doorX] = createMapTile('DIRT1'); // Corrected to [...][doorX]
                            }
                        }
                    }
                }
            });
        });
    }
    // Modified generateMap
    generateMap(): IMapTile[][] {
    // Initialize the map with default Tiles. Assume all initial tiles are not walkable (like walls).
        const map: IMapTile[][] = new Array(MAP_HEIGHT) // Swapped height to be the first dimension
            .fill(null)
            .map(() => new Array(MAP_WIDTH).fill(null).map(() => createMapTile('EMPTY')));

        // Generate partitions and rooms as before
        const rootPartition = new Partition(0, 0, MAP_WIDTH, MAP_HEIGHT);
        const partitions = this.splitPartition(rootPartition, MAP_ROOM_MIN_SIZE, MAP_ROOM_MAX_SIZE, 4);
        const rooms: IMapRoom[] = [];

        partitions.forEach((partition) => {
            const room = this.createRoomInPartition(partition);
            rooms.push(room);
            this.carveRoom(room, map); // This method should now be correct if it uses [y][x]
            this.decorateRoomBasedOnType(room, map); // Ensure this also treats map as [y][x]
        });

        // Iterate over the map to update uncarved/empty spaces
        for (let row = 0; row < MAP_HEIGHT; row++) {
            // Iterate over each row
            for (let col = 0; col < MAP_WIDTH; col++) {
                // And then each column within the row
                // Accessing the tile at the current row and column
                if (!map[row][col].walkable) {
                    // If the tile is not walkable, update it
                    map[row][col] = createMapTile('STONE2');
                }
            }
        }

        this.placeDoors(map, rooms); // Ensure this method also correctly accesses map as [y][x]

        return map;
    }

    update() {
        this.mapChunkManager.update();
    }
}
