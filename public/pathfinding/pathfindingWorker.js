importScripts('pathfinding-browser.min.js');

self.addEventListener('message', (e) => {
    const { grid, start, end } = e.data;
    const pathfindingGrid = new PF.Grid(grid);

    const finder = new PF.BiAStarFinder({
        allowDiagonal: false,
        dontCrossCorners: false,
        heuristic: PF.Heuristic.chebyshev,
    });

    if (
        start.x < 0 ||
    start.y < 0 ||
    end.x < 0 ||
    end.y < 0 ||
    start.x >= pathfindingGrid.width ||
    start.y >= pathfindingGrid.height ||
    end.x >= pathfindingGrid.width ||
    end.y >= pathfindingGrid.height
    ) {
        self.postMessage(null);
        return;
    }

    let path = [];
    // Initially try to find a path to the requested end cell
    // Validate start and end points are walkable and not the same
    if (
        pathfindingGrid.isWalkableAt(start.x, start.y) &&
    pathfindingGrid.isWalkableAt(end.x, end.y) &&
    !(start.x === end.x && start.y === end.y)
    ) {
    // Perform pathfinding
        path = finder.findPath(start.x, start.y, end.x, end.y, pathfindingGrid.clone());
    // Further processing...
    } else {
    // If start and end are the same, it might not necessarily be an "error" condition, depending on your game's logic
    // You could handle it differently or simply return an empty path or a specific message
    // Start and end points are the same
        self.postMessage(null);
        return;
    }

    if (!path || path.length === 0) {
        self.postMessage(null); // or any other appropriate handling
        return;
    }

    // path = PF.Util.smoothenPath(pathfindingGrid, path);

    // remove first point since the actor is moving, and we don't want it to stutter back to first point
    path = path.slice(1);

    self.postMessage(path);
});
