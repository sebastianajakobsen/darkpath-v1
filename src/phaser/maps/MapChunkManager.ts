import { type IMapTile, MapTileType } from '@/phaser/maps/types';
import { createMapTile } from '@/phaser/maps/utils/CreateMapTile';
import { Player } from '@/phaser/actors/player/Player';
import { MAP_CHUNK_LOAD_THRESHOLD, MAP_CHUNK_SIZE, MAP_TILE_SIZE } from '@/phaser/const/Map';

export class MapChunkManager {
    private chunks: Map<string, Phaser.Tilemaps.TilemapLayer>;
    private scene: Phaser.Scene;
    private readonly worldMapGrid: IMapTile[][];
    private readonly numColumns: number;
    private readonly numRows: number;

    // Initialize lastChunkX and lastChunkY to -1 to indicate that no chunk has been loaded yet.
    // This ensures that the first update check will always trigger loading of the initial chunk
    // the player is in, as the actual chunk coordinates will never be -1.
    private lastChunkX = -1;
    private lastChunkY = -1;

    private chunkLoadCooldown = 0;
    private lastUpdateTime = 0;

    constructor(scene: Phaser.Scene, worldMapGrid: IMapTile[][], numColumns: number, numRows: number) {
        this.scene = scene;
        this.worldMapGrid = worldMapGrid;
        this.numColumns = numColumns;
        this.numRows = numRows;
        this.chunks = new Map<string, Phaser.Tilemaps.TilemapLayer>();
    }

    private generateKey(x: number, y: number): string {
        return `${x},${y}`;
    }

    private createLayer(
        mapData: IMapTile[][],
        worldX: number,
        worldY: number,
    ): Phaser.Tilemaps.TilemapLayer {
    // Create a new tilemap for this chunk
        const map = this.scene.make.tilemap({
            width: mapData.length, // updated
            height: mapData[0].length, // updated
            tileWidth: MAP_TILE_SIZE,
            tileHeight: MAP_TILE_SIZE,
        });

        console.log('mapData.length', mapData.length);
        console.log('mapData[0].length', mapData[0].length);
        // Add tileset
        const tileset = map.addTilesetImage('tileset', undefined, MAP_TILE_SIZE, MAP_TILE_SIZE);
        if (!tileset) throw new Error('Failed to add tileset');

        // Create the layer and populate it with tiles
        const layer = map.createBlankLayer(
            `layer_${worldX}_${worldY}`,
            tileset,
            worldX * MAP_TILE_SIZE,
            worldY * MAP_TILE_SIZE,
        );
        if (!layer) throw new Error('Failed to create layer');

        mapData.forEach((row, y) => {
            row.forEach((tile, x) => {
                const tileIndex = tile.type; // Implement this based on your tileset
                layer.putTileAt(tileIndex, x, y);
            });
        });

        layer.forEachTile((tile) => {
            if (tile.index === -1) {
                // -1 or whatever value represents an invisible tile
                tile.setAlpha(0);
                tile.setVisible(false);
            }
        });
        // // Add collision to stone tiles
        return this.setLayerTileCollision(layer);
    }

    private setLayerTileCollision(layer: Phaser.Tilemaps.TilemapLayer) {
    // Map TileType to tileset indices
        const collisionIndices = [MapTileType.Stone1, MapTileType.Stone2];

        layer.setCollision(collisionIndices);

        if(this.scene.player) {
            this.scene.physics.add.collider(this.scene.player, layer);
        }

        return layer;
    }

    private generateMapChunkData(chunkX: number, chunkY: number): IMapTile[][] {
        const baseWorldX = chunkX * MAP_CHUNK_SIZE;
        const baseWorldY = chunkY * MAP_CHUNK_SIZE;

        const maxWorldX = Math.min(this.numColumns, baseWorldX + MAP_CHUNK_SIZE);
        const maxWorldY = Math.min(this.numRows, baseWorldY + MAP_CHUNK_SIZE);

        const mapData: IMapTile[][] = Array.from(
            { length: MAP_CHUNK_SIZE },
            () => new Array(MAP_CHUNK_SIZE).fill(createMapTile('EMPTY')), // Assuming createTile('EMPTY') is a valid placeholder
        );

        for (let y = baseWorldY, j = 0; y < maxWorldY; y++, j++) {
            for (let x = baseWorldX, i = 0; x < maxWorldX; x++, i++) {
                if (this.worldMapGrid[y] && this.worldMapGrid[y][x] !== undefined) {
                    mapData[j][i] = this.worldMapGrid[y][x]; // Note the switch in indexing
                }
            }
        }

        return mapData;
    }

    // TODO: remove collider also when hiding?
    private hideFarChunks(centerChunkX: number, centerChunkY: number) {
        const hideDistance = 1; // Distance at which chunks are considered too far and should be hidden
        this.chunks.forEach((layer, key) => {
            const [x, y] = key.split(',').map(Number);
            if (Math.abs(x - centerChunkX) > hideDistance || Math.abs(y - centerChunkY) > hideDistance) {
                layer.setVisible(false);
            }
        });
    }

    loadChunkAtTile(tileX: number, tileY: number) {
        const [chunkX, chunkY] = this.getChunkCoordinatesFromTile(tileX, tileY);

        // Load or show the current chunk
        this.ensureChunkLoaded(chunkX, chunkY);

        // Determine which surrounding chunks need to be visible based on player movement
        this.manageSurroundingChunks(chunkX, chunkY);
    }

    private ensureChunkLoaded(chunkX: number, chunkY: number) {
        const key = this.generateKey(chunkX, chunkY);
        if (!this.chunks.has(key)) {
            const mapChunkData = this.generateMapChunkData(chunkX, chunkY);
            const layer = this.createLayer(
                mapChunkData,
                chunkX * MAP_CHUNK_SIZE,
                chunkY * MAP_CHUNK_SIZE,
            );
            this.chunks.set(key, layer);
        } else {
            const layer = this.chunks.get(key);
            layer?.setVisible(true); // Ensure the current chunk is visible
        }
    }

    private manageSurroundingChunks(chunkX: number, chunkY: number) {
        const visibleRange = 1; // Defines how many chunks around the player should be visible
        for (let dx = -visibleRange; dx <= visibleRange; dx++) {
            for (let dy = -visibleRange; dy <= visibleRange; dy++) {
                const x = chunkX + dx;
                const y = chunkY + dy;
                // This checks ensure we don't attempt to load or show chunks outside the world bounds
                if (
                    x >= 0 &&
          y >= 0 &&
          x < this.numColumns / MAP_CHUNK_SIZE &&
          y < this.numRows / MAP_CHUNK_SIZE
                ) {
                    this.ensureChunkLoaded(x, y);
                }
            }
        }

        // Optionally, hide far away chunks
        this.hideFarChunks(chunkX, chunkY);
    }

    getChunkCoordinatesFromTile(tileX: number, tileY: number): [number, number] {
        const chunkX = Math.floor(tileX / MAP_CHUNK_SIZE);
        const chunkY = Math.floor(tileY / MAP_CHUNK_SIZE);
        return [chunkX, chunkY];
    }

    update() {
        // Calculate deltaTime
        const currentTime = this.scene.time.now;
        const deltaTime = currentTime - this.lastUpdateTime;
        this.lastUpdateTime = currentTime; // Update the lastUpdateTime to the current time for the next frame

        // Decrease the cooldown timer by deltaTime
        this.chunkLoadCooldown -= deltaTime;


        if (this.chunkLoadCooldown <= 0) {
            // Use camera position instead of player position to load chunk
            const camera = this.scene.cameras.main;
            const cameraCenterX = camera.scrollX + camera.width / 2;
            const cameraCenterY = camera.scrollY + camera.height / 2;

            const cameraTileX = Math.floor(cameraCenterX / MAP_TILE_SIZE);
            const cameraTileY = Math.floor(cameraCenterY / MAP_TILE_SIZE);
            const [chunkX, chunkY] = this.getChunkCoordinatesFromTile(cameraTileX, cameraTileY);

            // Check if camera has moved to a new chunk
            if (chunkX !== this.lastChunkX || chunkY !== this.lastChunkY) {
                this.loadChunkAtTile(cameraTileX, cameraTileY);
                this.lastChunkX = chunkX;
                this.lastChunkY = chunkY;
            }

            this.chunkLoadCooldown = MAP_CHUNK_LOAD_THRESHOLD;
        }
    }
}
