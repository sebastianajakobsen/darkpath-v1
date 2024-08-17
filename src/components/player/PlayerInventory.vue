<template>
  <div id="player-inventory">
    <div class="inventory-grid" :style="inventoryStyle">
      <div
        v-for="(item, index) in inventoryStore.items"
        :key="index"
        :class="[
          'item-slot',
          `item-slot-${index}`,
          {
            'item-slot--has-Item': item !== null,
            'item-slot--item-usable': item !== null && playerHasRequiredAttributesToUseItem(item),
            'item-slot--not-item-usable':
              item !== null && !playerHasRequiredAttributesToUseItem(item)
          }
        ]"
        :style="slotHoverBackgroundStyle(index)"
        @mousemove="handleMouseMove"
        @mouseenter="handleMouseEnter($event, item, index)"
        @mouseleave="handleMouseLeave($event)"
        @mousedown.left.exact="handleClick($event, item, index)"
        @mousedown.left.shift.exact="handleShiftClick($event, item, index)"
        @mousedown.right.prevent="handleRightClick($event, item)"
      >
        <div v-if="item" class="item-slot__item" :style="setDragItemStyle(item)">
          <SocketSlot
            v-for="(entry, socketIndex) in item.properties?.processedSockets"
            :key="socketIndex"
            :entry="entry"
            :index="Number(socketIndex)"
            :item-index="index"
            :item="item"
            :draggedItem="draggedItem"
            @drop-gem-in-socket="handleDropGem"
            @remove-gem-in-socket="handleRemoveGem"
            @mouseLeaveSocket="handleMouseLeaveSocket"
            @mouseEnterSocket="handleMouseEnterSocket"
          />
          <img class="item__image" :src="`/assets/${item.icons.item}`" />
          <span v-if="item.stackAble" class="item__stacksize">{{ item.stackSize }}</span>
        </div>
        <div v-else class="item-slot__empty-slot-item" :style="slotEmptyStyle"></div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { computed, PropType, ref, watch } from 'vue';
import { useInventoryStore } from '@/stores/useInventoryStore';
import { usePlayerStore } from '@/stores/usePlayerStore';
import { useEquipmentStore } from '@/stores/useEquipmentStore';
import SocketSlot from '@/components/items/ItemSockets.vue';
import type { IItem } from '@/phaser/items/IItem';
import { Gem } from '@/phaser/items/gems/Gem';
import { Consumable } from '@/phaser/items/consumable/Consumable';


export default {
    name: 'PlayerInventory',
    components: { SocketSlot },

    props: {
        draggedItem: {
            type: Object as PropType<IItem<any> | null>,
            required: false,
        },
        isIdentifying: {
            type: Boolean,
            default: false,
        },
    },
    emits: [
        'mouseEnter',
        'mouseLeave',
        'dragStart',
        'dropItem',
        'swapItems',
        'useItem',
        'identifyItem',
        'toggleTooltip',
        'dropGemInSocket',
        'removeGemInSocket',
        'mouseLeaveSocket',
    ],
    setup(props, context) {
        const inventoryStore = useInventoryStore();
        const playerStore = usePlayerStore();
        const equipmentStore = useEquipmentStore();
        const { columnSize, halfColumnSize, numColumns, numRows } = inventoryStore;

        const dragEnteredIndex = ref<null | number>(null);
        const droppedIndex = ref<null | number>(null);

        const dragMousePosition = ref({
            x: 0,
            y: 0,
        });

        const slotEmptyStyle = computed(() => ({
            width: `${columnSize}px`,
            height: `${columnSize}px`,
        }));

        const handleMouseLeaveSocket = (event, item, index) => {
            event.preventDefault();
            event.stopPropagation();
            const targetElement = document.querySelector(`.item-slot-${index}`);
            if (targetElement) {
                context.emit('mouseLeaveSocket', event, item, targetElement);
            }
        };

        const handleMouseEnterSocket = (event, item, index) => {
            event.preventDefault();
            event.stopPropagation();
            context.emit('mouseEnter', event, item);
        };

        const handleRemoveGem = (event, entry, item, itemindex) => {
            if (props.isIdentifying || props.draggedItem) return;
            event.preventDefault();
            event.stopPropagation();

            droppedIndex.value = adjustDroppedIndex(
                itemindex,
                1,
                1,
                dragMousePosition.value.y,
                dragMousePosition.value.x,
                numColumns,
            );

            const gem = entry.data.gem;
            inventoryStore.removeGemFromSocket(item.id, entry.index);
            context.emit('removeGemInSocket', gem, event);
        };

        const handleDropGem = (event, entry, item) => {
            if (!(props.draggedItem instanceof Gem)) return;
            event.preventDefault();
            event.stopPropagation();
            const occupiedGem = entry.data.gem;
            const gem = props.draggedItem;

            inventoryStore.updateGemInSocket(item.id, entry.index, props.draggedItem);

            context.emit('dropGemInSocket', occupiedGem, gem);
        };

        const handleRightClick = (event, item) => {
            if (!(item instanceof Consumable)) return;
            context.emit('useItem', event, item);
        };

        const generateCustomGridTemplateAreas = (width, height) => {
            let customArrangement = [0, 1, 3, 2, 4, 5]; // Define custom arrangement

            if (width === 1) {
                customArrangement = [0, 3, 5]; // Define custom arrangement
            }

            const result = [];

            let counter = 0;
            for (let row = 0; row < height; row++) {
                let rowStr = '';
                for (let col = 0; col < width; col++) {
                    if (customArrangement[counter] !== undefined) {
                        // Check bounds of custom arrangement
                        rowStr += `socketSlot-${customArrangement[counter]} `;
                    }
                    counter++;
                }
                result.push(`'${rowStr.trim()}'`);
            }

            return result.join(' ');
        };

        const setDragItemStyle = (item) => {
            const cSize = columnSize;

            const gridTemplateColumns = `repeat(${item.size.width}, ${cSize}px) !important`;
            const gridTemplateRows = `repeat(${item.size.height}, ${cSize}px) !important`;

            // Use custom function to generate grid template areas
            const gridTemplateAreas = generateCustomGridTemplateAreas(item.size.width, item.size.height);

            return {
                position: 'absolute',
                display: 'grid',
                gridTemplateAreas: gridTemplateAreas,
                gridTemplateColumns: gridTemplateColumns,
                gridTemplateRows: gridTemplateRows,
            };
        };

        const slotHoverBackgroundStyle = (index) => {
            const backgroundColor = '#112c0c';
            const borderColor = '#373C2E';

            const itemWidth = props.draggedItem?.size.width;
            const itemHeight = props.draggedItem?.size.height;

            const isWidth1 = itemWidth === 1;
            const isHeight1 = itemHeight === 1;

            const is1x1 = isWidth1 && isHeight1;

            if (props.draggedItem && canFit.value && droppedIndex.value !== null) {
                // current slot position color
                if (droppedIndex.value === index) {
                    return `background:blue !important; border-color:${borderColor}`;
                }

                if (is1x1) {
                    return;
                }

                if (itemWidth > 1) {
                    if (index === droppedIndex.value + 1) {
                        return `background:${backgroundColor} !important; border-color:${borderColor}`;
                    }
                }

                if (itemHeight >= 2) {
                    if (index === droppedIndex.value + numColumns) {
                        return `background:${backgroundColor} !important; border-color:${borderColor}`;
                    }

                    if (itemWidth >= 2) {
                        if (index === droppedIndex.value + 1 + numColumns) {
                            return `background:${backgroundColor} !important; border-color:${borderColor}`;
                        }
                    }
                }

                if (itemHeight >= 3) {
                    if (index === droppedIndex.value + numColumns + numColumns) {
                        return `background:${backgroundColor} !important; border-color:${borderColor}`;
                    }
                    if (itemWidth >= 2) {
                        if (index === droppedIndex.value + numColumns + numColumns + 1) {
                            return `background:${backgroundColor} !important; border-color:${borderColor}`;
                        }
                    }
                }
            }

            return '';
        };

        const handleIdentifyItem = (event, item, index) => {
            context.emit('identifyItem', event, item);
        };

        const handleClick = (event, item, index) => {
            if (props.isIdentifying) {
                handleIdentifyItem(event, item, index);
            } else if (!props.draggedItem) {
                handleDragStart(event, item, index);
            } else if (!canFit.value && props.draggedItem) {
                return;
            } else if (props.draggedItem && droppedIndex.value !== null) {
                const occupiedItemsAtDropPoint = inventoryStore.getOccupiedItemsAtIndex(
                    Number(droppedIndex.value),
                    props.draggedItem.size.width ?? 1,
                    props.draggedItem.size.height ?? 1,
                );

                if (occupiedItemsAtDropPoint.length === 0) {
                    handleDropItem(event, droppedIndex.value);
                } else {
                    const occupiedItem = occupiedItemsAtDropPoint[0];
                    if (
                        occupiedItemsAtDropPoint &&
            occupiedItemsAtDropPoint.every((item) => item === occupiedItem)
                    ) {
                        handleSwapItem(event, occupiedItem, droppedIndex.value);
                    }
                }
            }
        };

        const handleDropItem = (event, dropIndex) => {
            if (props.draggedItem) {
                inventoryStore.addItem(props.draggedItem, dropIndex);
                context.emit('dropItem');
            }
        };

        const addItemBackToInventory = (item, index) => {
            inventoryStore.addItem(item, index);
            console.log('Action reverted, item added back to inventory.');
        };

        const equipAndHandleFailure = (item, equipSlot, equippedItem, index) => {
            if (!equipmentStore.equipItem(item, equipSlot)) {
                addItemBackToInventory(item, index);
                if (equippedItem) equipmentStore.equipItem(equippedItem, equipSlot); // Re-equip the original item if the new equip fails
                console.log('Equip failed.');
                return false;
            }
            return true;
        };

        const handleShiftClick = (event, item, index) => {
            if (!item) return;
            const { equipSlot } = item.properties;

            if (
                !playerHasRequiredAttributesToUseItem(item) ||
        !equipmentStore.canEquipItem(item, equipSlot)
            )
                return;

            const equippedItem = equipmentStore.getEquippedItem(equipSlot);
            inventoryStore.removeItem(item);

            if (equippedItem) {
                equipmentStore.unequipItem(equippedItem, equipSlot);
                const hasInventorySpace =
          inventoryStore.findEmptySlotIndex(equippedItem.size.width, equippedItem.size.height) !==
          -1;

                if (!hasInventorySpace) {
                    addItemBackToInventory(item, index);
                    equipmentStore.equipItem(equippedItem, equipSlot);
                    console.log('Not enough space to swap items.');
                    return;
                }
            }

            if (equipAndHandleFailure(item, equipSlot, equippedItem, index) && equippedItem) {
                inventoryStore.addItem(equippedItem, index);
                context.emit('toggleTooltip', equippedItem);
            } else {
                context.emit('toggleTooltip'); // Assuming failure handling is done within `equipAndHandleFailure`
            }
        };

        const playerHasRequiredAttributesToUseItem = (item: IItem) => {
            if (item && item?.requirements) {
                const { strength, dexterity, intelligence, level } = item.requirements;

                if (!item.identified) {
                    return;
                }
                if (
                    (strength && playerStore.attributes.strength < strength) ||
          (dexterity && playerStore.attributes.dexterity < dexterity) ||
          (intelligence && playerStore.attributes.intelligence < intelligence) ||
          (level && playerStore.level < level)
                ) {
                    return false;
                }
            }

            return true;
        };

        const updateMousePosition = (element, event) => {
            const rect = element.getBoundingClientRect();
            const mouseXInsideElement = event.clientX - rect.left;
            const mouseYInsideElement = event.clientY - rect.top;
            dragMousePosition.value = {
                x: mouseXInsideElement,
                y: mouseYInsideElement,
            };
        };

        const handleDragStart = (event, item, index) => {
            if (item) {
                droppedIndex.value = adjustDroppedIndex(
                    index,
                    item.size.height,
                    item.size.width,
                    dragMousePosition.value.y,
                    dragMousePosition.value.x,
                    numColumns,
                );

                inventoryStore.removeItem(item);
                context.emit('dragStart', event, item, index);
            }
        };

        const handleSwapItem = (event, occupiedItem, dropIndex) => {
            if (!occupiedItem || !props.draggedItem) return;

            const slotElement = document.querySelector(`.item-slot-${dropIndex}`);
            if (slotElement) updateMousePosition(slotElement, event);

            droppedIndex.value = adjustDroppedIndex(
                dropIndex,
                occupiedItem.size.height,
                occupiedItem.size.width,
                dragMousePosition.value.y,
                dragMousePosition.value.x,
                numColumns,
            );

            inventoryStore.swapItems(occupiedItem, props.draggedItem, dropIndex);

            context.emit('swapItems', event, occupiedItem, slotElement);
        };

        const handleMouseLeave = (event) => {
            droppedIndex.value = null;
            dragEnteredIndex.value = null;
            context.emit('mouseLeave');
        };

        const handleMouseEnter = async (event, item, index) => {
            event.preventDefault();
            dragEnteredIndex.value = index;
            context.emit('mouseEnter', event, item);
        };

        const canFit = computed(() => {
            return inventoryStore.getCanItemFit(
                Number(droppedIndex.value),
                props.draggedItem?.size.width ?? 1,
                props.draggedItem?.size.height ?? 1,
            );
        });

        const handleMouseMove = (event) => {
            const rect = event.currentTarget.getBoundingClientRect();
            dragMousePosition.value = {
                x: event.clientX - rect.left,
                y: event.clientY - rect.top,
            };

            if (props.draggedItem) {
                droppedIndex.value = adjustDroppedIndex(
                    dragEnteredIndex.value,
                    props.draggedItem.size.height,
                    props.draggedItem.size.width,
                    dragMousePosition.value.y,
                    dragMousePosition.value.x,
                    numColumns,
                );
            }
        };

        const inventoryStyle = computed(() => {
            return `grid-template-columns: repeat(${numColumns}, ${columnSize}px); grid-template-rows: repeat(${numRows}, ${columnSize}px);`;
        });

        const adjustDroppedIndex = (
            droppedIndex,
            itemHeight,
            itemWidth,
            mouseY,
            mouseX,
            numColumns,
        ) => {
            let adjustedDroppedIndex = droppedIndex;

            // 1x1
            if (itemHeight === 1 && itemWidth === 1) {
                if (mouseX > columnSize) {
                    adjustedDroppedIndex += 1;
                }
                if (mouseY > columnSize) {
                    adjustedDroppedIndex += numColumns;
                    if (mouseY > columnSize + columnSize) {
                        adjustedDroppedIndex += numColumns;
                    }
                }
            }

            // 1x2
            if (itemHeight === 1 && itemWidth === 2) {
                if (mouseX < halfColumnSize && mouseX <= columnSize) {
                    adjustedDroppedIndex -= 1;
                }
                if (mouseX > columnSize + halfColumnSize) {
                    adjustedDroppedIndex += 1;
                }

                if (mouseY > columnSize) {
                    adjustedDroppedIndex += numColumns;
                    if (mouseY > columnSize + columnSize) {
                        adjustedDroppedIndex += numColumns;
                    }
                }
            }

            // 1x3
            if (itemHeight === 3 && itemWidth === 1) {
                if (mouseX > columnSize) {
                    adjustedDroppedIndex += 1;
                }

                adjustedDroppedIndex -= numColumns;
                if (mouseY > columnSize) {
                    adjustedDroppedIndex += numColumns;
                    if (mouseY > columnSize + columnSize) {
                        adjustedDroppedIndex += numColumns;
                    }
                }
            }

            // 2x1
            if (itemHeight === 2 && itemWidth === 1) {
                if (mouseX > columnSize) {
                    adjustedDroppedIndex += 1;
                }

                if (mouseY < halfColumnSize && mouseY <= columnSize) {
                    adjustedDroppedIndex -= numColumns;
                }

                if (mouseY > columnSize + halfColumnSize) {
                    adjustedDroppedIndex += numColumns;
                    if (mouseY > columnSize + halfColumnSize + columnSize) {
                        adjustedDroppedIndex += numColumns;
                    }
                }
            }

            // 2x2
            if (itemHeight === 2 && itemWidth === 2) {
                if (mouseX < halfColumnSize && mouseX <= columnSize) {
                    adjustedDroppedIndex -= 1;
                }
                if (mouseX > columnSize + halfColumnSize) {
                    adjustedDroppedIndex += 1;
                }

                if (mouseY < halfColumnSize && mouseY <= columnSize) {
                    adjustedDroppedIndex -= numColumns;
                }

                if (mouseY > columnSize + halfColumnSize) {
                    adjustedDroppedIndex += numColumns;
                    if (mouseY > columnSize + halfColumnSize + columnSize) {
                        adjustedDroppedIndex += numColumns;
                    }
                }
            }

            // 3x2
            if (itemHeight === 3 && itemWidth === 2) {
                if (mouseX < halfColumnSize && mouseX <= columnSize) {
                    adjustedDroppedIndex -= 1;
                }
                if (mouseX > columnSize + halfColumnSize) {
                    adjustedDroppedIndex += 1;
                }

                adjustedDroppedIndex -= numColumns;
                if (mouseY > columnSize) {
                    adjustedDroppedIndex += numColumns;
                    if (mouseY > columnSize + columnSize) {
                        adjustedDroppedIndex += numColumns;
                    }
                }
            }

            return adjustedDroppedIndex;
        };

        return {
            handleMouseLeave,
            handleMouseMove,
            handleMouseEnter,
            handleSwapItem,
            handleDragStart,
            handleShiftClick,
            handleDropItem,
            handleClick,
            setDragItemStyle,
            dragEnteredIndex,
            inventoryStyle,
            inventoryStore,
            droppedIndex,
            canFit,
            dragMousePosition,
            slotEmptyStyle,
            slotHoverBackgroundStyle,
            playerHasRequiredAttributesToUseItem,
            handleRightClick,
            handleDropGem,
            handleRemoveGem,
            handleMouseLeaveSocket,
            handleMouseEnterSocket,
        };
    },
};
</script>

<style scoped lang="scss">
.inventory-grid {
  display: grid;
  margin: -1px;
  border-radius: 3px;
  box-shadow: -1px -1px 1px rgba(10, 0, 5, 0.5), -1px 1px 1px rgba(10, 0, 5, 0.5), 1px 1px 1px rgba(10, 0, 5, 0.5), 1px -1px 1px rgba(10, 0, 5, 0.5);
  border-style: solid;
  border-width: 3px;
  border-image: url(/assets/ui/box-border.png) 5 repeat;
}

#player-inventory {
  padding: 27px 27px 0px;
  margin: 0 auto;
}
.item-slot {
  background: #030303cc;
  outline:1px solid #303030;

  &--item-usable {
    .item-slot__item {
      background: rgba(12, 22, 72, 0.6);
    }
  }
  &--not-item-usable {
    .item-slot__item {
      background: rgba(106, 23, 23, 0.6);
    }
  }

  &__item {
    display: grid;
    justify-content: center;
    align-items: center;
    place-content: center;
    place-items: center;

    .item__image {
      max-width: 100%;
      max-height: 100%;
      position: absolute;
    }
  }

  &__empty-slot-item {
    font-size: 12px;
    color: #999;
  }

  .item__stacksize {
    position: absolute;
    top: 0;
    left: 5px;
    font-size: 12px;
    font-weight: 900;
    color: #fff;
    text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;
  }
}
</style>
