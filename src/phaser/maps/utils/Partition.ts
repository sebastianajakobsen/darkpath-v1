// The Partition class represents a segment of space defined by its origin point (x, y), dimensions (width, height), and an optional depth parameter.
// The class is primarily used for dividing a larger space into smaller, manageable partitions,
//  a technique that can optimize various spatial operations such as collision detection, rendering, and entity management.

export class Partition {
    constructor(
    public x: number,
    public y: number,
    public width: number,
    public height: number,
    public depth: number = 0,
    ) {}

    split(minSize: number, maxSize: number, maxDepth: number): [Partition, Partition] | null {
        if (this.depth >= maxDepth || (this.width <= maxSize && this.height <= maxSize)) {
            return null;
        }

        let splitHorizontally = Math.random() > 0.5;
        if (this.width > this.height && this.height / this.width < 0.75) {
            splitHorizontally = false;
        } else if (this.height > this.width && this.width / this.height < 0.75) {
            splitHorizontally = true;
        }

        const max = (splitHorizontally ? this.height : this.width) - minSize;
        if (max <= minSize) {
            return null;
        }

        const splitAt = Math.floor(Math.random() * (max - minSize)) + minSize;

        if (splitHorizontally) {
            return [
                new Partition(this.x, this.y, this.width, splitAt, this.depth + 1),
                new Partition(this.x, this.y + splitAt, this.width, this.height - splitAt, this.depth + 1),
            ];
        } else {
            return [
                new Partition(this.x, this.y, splitAt, this.height, this.depth + 1),
                new Partition(this.x + splitAt, this.y, this.width - splitAt, this.height, this.depth + 1),
            ];
        }
    }
}
