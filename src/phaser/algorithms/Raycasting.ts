// This uses the Bresenham's line algorithm - it is a foundational algorithm in computer graphics for drawing lines on a grid or raster display.
// This function calculates all the grid points a straight line between two specified points should pass through.
// It's especially useful in grid-based games and applications for tasks like line-of-sight calculations, drawing, or determining the path of projectiles.

// Export the function for drawing a line between two points on a grid.
export const Raycasting = (x0: number, y0: number, x1: number, y1: number): { x: number; y: number }[] => {
    // Initialize an array to store the points of the line.
    const points = [];

    // Calculate the horizontal and vertical distances between the start and end points.
    const dx = Math.abs(x1 - x0);
    const dy = -Math.abs(y1 - y0);

    // Determine the direction of the line (positive or negative) along both axes.
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;

    // Initialize the error term to decide when to move along the y-axis (in addition to the x-axis).
    let err = dx + dy,
        e2;

    // Start drawing the line from the start point and continue until the end point is reached.
    while (true) {
    // Add the current point to the line.
        // TODO: this is bad for garbage collection, consider using a different data structure
        points.push({ x: x0, y: y0 });

        // Break out of the loop once the end point is reached.
        if (x0 === x1 && y0 === y1) break;

        // Double the error term to check if it's time to move along the y-axis.
        e2 = 2 * err;
        if (e2 >= dy) {
            // Check if moving right (x) decreases the error
            err += dy;
            x0 += sx; // Move right or left
        }
        if (e2 <= dx) {
            // Check if moving down (y) decreases the error
            err += dx;
            y0 += sy; // Move down or up
        }
    }

    // Return the array of points that forms the line.
    return points;
};
