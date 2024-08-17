import { Raycasting } from '@/phaser/algorithms/Raycasting';
import type { IMapTile } from '@/phaser/maps/types';
import { WorkerPool } from '@/phaser/WorkerPool';


export class PathfindingManager {
    private readonly pathfindingGrid: Uint8Array[];
    public workerPool!: WorkerPool;

    constructor(worldMapGrid: IMapTile[][]) {
        // Immediately create a pathfinding grid based on the dimensions of the GridMatrix
        // and the walkability of each tile.
        this.pathfindingGrid = this.getFormattedGridForPathfinding(worldMapGrid);

        this.workerPool = new WorkerPool('pathfinding/pathfindingWorker.js', Math.min(4, navigator.hardwareConcurrency || 4));
    }

    // Convert the world map grid to a format suitable for pathfinding
    public getFormattedGridForPathfinding(worldMapGrid: IMapTile[][]): Uint8Array[] {
        return worldMapGrid.map((row) => Uint8Array.from(row.map((tile) => (tile.walkable ? 0 : 1))));
    }

    public findPath(
        startWorld: { x: number; y: number },
        endWorld: { x: number; y: number },
        callback: (path: { x: number; y: number }[] | null)=> void,
    ) {
        // Ensure both start and end are within the grid boundaries
        if (!this.isWithinGrid(startWorld.x, startWorld.y) || !this.isWithinGrid(endWorld.x, endWorld.y)) {
            console.error('Start or end position is outside the grid');
            callback(null); // Return null to indicate an invalid path request
            return;
        }

        // Early exit if start and end are the same, no need to find a path
        if (startWorld.x === endWorld.x && startWorld.y === endWorld.y) {
            callback(null);
            return;
        }

        // Check if a direct line of sight exists between start and end in grid coordinates
        if (this.isLineOfSightClear(startWorld, endWorld, this.pathfindingGrid)) {
            callback([startWorld, endWorld]);
            return;
        }

        // The rest of your existing pathfinding logic here, using the gridData
        const taskData = {
            grid: this.pathfindingGrid,
            start: { x: startWorld.x, y: startWorld.y },
            end: { x: endWorld.x, y: endWorld.y },
        };

        // Define the task callback separately
        const taskCallback = (path) => {
            callback(path || null);
        };

        // Add the task to the worker pool
        this.workerPool.addTask(taskData, taskCallback);
    }

    private isWithinGrid(x: number, y: number): boolean {
        return x >= 0 && y >= 0 && y < this.pathfindingGrid.length && x < this.pathfindingGrid[y].length;
    }

    private isLineOfSightClear(start: { x: number; y: number }, end: { x: number; y: number }, grid: Uint8Array[]) {
        // This is a very simplified version. You'll need to adapt it to your grid structure and coordinate system.
        const line = Raycasting(start.x, start.y, end.x, end.y);
        for (const point of line) {
            if (grid[point.y][point.x]) {
                // Assuming WALL is defined as the grid value for walls
                return false; // An obstacle is in the way
            }
        }
        return true; // No obstacles in the direct path
    }
}