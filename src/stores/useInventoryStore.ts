import { defineStore } from 'pinia';
import type { IItem, ItemEquipment } from '@/phaser/items/IItem';
import type { Socket } from '@/phaser/items/itemSocket';


type OccupiedColumnType = {
  slotIndex: number;
  item: ItemEquipment;
};

const COLUMN_SIZE = 50;
const HALF_COLUMN_SIZE = COLUMN_SIZE / 2;
const NUMBER_OF_COLUMNS = 12;
const NUMBER_OF_ROWS = 5;

export type SocketElement =
  | { type: 'socket'; data: Socket; index: number }
  | { type: 'link'; index: number };

export const useInventoryStore = defineStore('inventory', {
    state: () => ({
        isOpen: false,
        items: Array(NUMBER_OF_COLUMNS * NUMBER_OF_ROWS).fill(null) as (IItem<any> | null)[],
        columnSize: COLUMN_SIZE,
        halfColumnSize: HALF_COLUMN_SIZE,
        numColumns: NUMBER_OF_COLUMNS,
        numRows: NUMBER_OF_ROWS,
        occupiedColumns: [] as OccupiedColumnType[], // Initialize empty array for occupied columns indices
        itemDrop: null as IItem<any> | null,
        gold: 0,
        // draggedItem
        isDraggingItem: false,
    }),

    actions: {
        removeGemFromSocket(itemId: string, socketIndex: number) {
            const item = this.items.find((item) => item?.id === itemId);
            if (item && item.properties.sockets && item.properties.sockets[socketIndex]) {
                item.properties.sockets[socketIndex].gem = null;
                // Any additional logic or validations can go here
            }
        },

        addGold(amount: number) {
            console.log('addgold', amount);
            this.gold += amount;
        },

        updateGemInSocket(itemId: string, socketIndex: number, newGem: IItem<any>) {
            const item = this.items.find((item) => item?.id === itemId);
            if (item && item.properties.sockets && item.properties.sockets[socketIndex]) {
                item.properties.sockets[socketIndex].gem = newGem;
                // Any additional logic or validations can go here
            }
        },

        addItem(item: IItem<any>, index: number | undefined = undefined) {
            if (item.stackAble) {
                const existingStackIndex = this.items.findIndex(
                    (existingItem) =>
                        existingItem?.properties.subType === item.properties.subType &&
            (existingItem?.stackSize || 0) < (existingItem?.maxStackSize || Infinity),
                );

                if (existingStackIndex !== -1) {
                    const existingStackItem = this.items[existingStackIndex]!;
                    const combinedStackSize = existingStackItem.stackSize! + item.stackSize!;

                    if (combinedStackSize <= existingStackItem.maxStackSize!) {
                        // If combined stack size is within the max limit, update the stack size
                        existingStackItem.stackSize = combinedStackSize;
                        return true;
                    }
                }
            }

            let targetIndex = -1;

            if (
                typeof index === 'number' &&
        this.canFitItemAtIndex(index, item.size.width, item.size.height)
            ) {
                targetIndex = index;
            } else {
                targetIndex = this.findEmptySlotIndex(item.size.width, item.size.height);
            }

            if (targetIndex !== -1) {
                this.items[targetIndex] = item;

                this.updateOccupiedColumns();
                if (item.properties?.sockets) {
                    item.properties.processedSockets = this.processSockets(item);
                }

                return true; // itemAdded
            }

            return false;
        },

        processSockets(item: IItem<any>) {
            const sockets = item.properties?.sockets || [];
            return sockets.flatMap((socket: Socket, index: number) => {
                const elements: SocketElement[] = [{ type: 'socket', data: socket, index }];
                if (socket.linkTo !== null) {
                    elements.push({ type: 'link', index });
                }
                return elements;
            });
        },

        dropItem(item: IItem<any>) {
            if (item) {
                // Create a new object with the same prototype as the item
                const newItem = Object.create(Object.getPrototypeOf(item));

                // Copy all properties from the item to the new object
                Object.assign(newItem, item);

                // Assign the new object to this.itemDrop
                this.itemDrop = newItem;
            }
        },

        updateOccupiedColumns() {
            this.occupiedColumns = []; // Clear the array before updating occupied slot indices

            for (let i = 0; i < this.items.length; i++) {
                const currentItem = this.items[i];
                if (currentItem !== null) {
                    const { width: itemWidth, height: itemHeight } = currentItem.size;

                    const startRow = Math.floor(i / this.numColumns);
                    const startColumn = i % this.numColumns;

                    // Mark occupied slot indices
                    for (let row = startRow; row < startRow + itemHeight; row++) {
                        for (let col = startColumn; col < startColumn + itemWidth; col++) {
                            const slotIndex = row * this.numColumns + col;
                            this.occupiedColumns.push({ slotIndex, item: currentItem });
                        }
                    }
                }
            }
        },

        findEmptySlotIndex(width: number, height: number) {
            // Find an empty slot that can accommodate the item
            for (let i = 0; i < this.items.length; i++) {
                const currentItem = this.items[i];
                if (currentItem === null && this.canFitItemAtIndex(i, width, height)) {
                    return i;
                }
            }

            return -1;
        },

        canFitItemAtIndex(index: number, width: number, height: number) {
            // if not valid index like -1 then return false
            if (index < 0) {
                return false;
            }

            const startRow = Math.floor(index / this.numColumns);
            const startColumn = index % this.numColumns;

            // Check if the item fits within the grid boundaries
            if (startRow + height > this.numRows || startColumn + width > this.numColumns) {
                return false;
            }

            // Check if the slots required by the item are empty
            for (let row = startRow; row < startRow + height; row++) {
                for (let col = startColumn; col < startColumn + width; col++) {
                    const slotIndex = row * this.numColumns + col;
                    if (this.occupiedColumns.some((occupiedSlot) => occupiedSlot.slotIndex === slotIndex)) {
                        return false; // Item cannot fit since slotIndex is already occupied
                    }
                }
            }
            return true;
        },

        getCanItemFit(index: number, width: number, height: number) {
            if (index < 0) {
                return false;
            }

            const startRow = Math.floor(index / this.numColumns);
            const startColumn = index % this.numColumns;

            // Check if the item fits within the grid boundaries
            if (startRow + height > this.numRows || startColumn + width > this.numColumns) {
                return false;
            }

            return true;
        },

        getOccupiedItemsAtIndex(index: number, width: number, height: number) {
            const startRow = Math.floor(index / this.numColumns);
            const startColumn = index % this.numColumns;

            const occupiedItems = [];
            // Check if the slots required by the item are empty
            for (let row = startRow; row < startRow + height; row++) {
                for (let col = startColumn; col < startColumn + width; col++) {
                    const slotIndex = row * this.numColumns + col;
                    const occupiedSlot = this.occupiedColumns.find(
                        (occupiedSlot) => occupiedSlot.slotIndex === slotIndex,
                    );
                    if (occupiedSlot) {
                        occupiedItems.push(occupiedSlot.item);
                    }
                }
            }

            return occupiedItems;
        },

        removeItem(item: IItem<any>) {
            const index = this.items.findIndex(
                (inventoryItem) => inventoryItem && inventoryItem.id === item.id,
            );
            if (index !== -1) {
                this.items[index] = null;
            }

            this.updateOccupiedColumns(); // Call to update occupied columns indices
        },

        swapItems(occupiedItem: IItem<any>, draggedItem: IItem<any>, index: number) {
            this.removeItem(occupiedItem); // Remove the existing item from the inventory at the given index
            this.addItem(draggedItem, index); // Add the dragged item to the inventory at the same index
        },

        removeAndDropItem(item: IItem<any>) {
            this.removeItem(item); // Remove the item from the inventory
            this.dropItem(item); // Drop the item (assuming dropItem is another method you've defined)
        },
    },
});
