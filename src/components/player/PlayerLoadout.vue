<template>
  <div
    v-show="isOpen"
    ref="playerLoadoutRef"
    class="player-loadout"
    @contextmenu="disableContextMenu"
    @mousedown.stop.prevent
  >
    <PlayerEquipment
      :dragged-item="draggedItem"
      :isIdentifying="isIdentifying"
      @mouseEnter="handleMouseEnter"
      @mouseLeave="handleMouseLeave"
      @dragStart="handleDragStart"
      @dropItem="handleDropItem"
      @swapItems="handleSwapItems"
      @dropGemInSocket="handleDropGemInSocket"
      @removeGemInSocket="handleRemoveGemInSocket"
      @mouseLeaveSocket="handleMouseLeaveSocket"
    />

    <PlayerInventory
      :isIdentifying="isIdentifying"
      :dragged-item="draggedItem"
      @mouseEnter="handleMouseEnter"
      @mouseLeave="handleMouseLeave"
      @dropItem="handleDropItem"
      @swapItems="handleSwapItems"
      @dragStart="handleDragStart"
      @identifyItem="handleIdentifyItem"
      @useItem="handleUseItem"
      @dropGemInSocket="handleDropGemInSocket"
      @removeGemInSocket="handleRemoveGemInSocket"
      @toggle-tooltip="handleTooltip"
      @mouseLeaveSocket="handleMouseLeaveSocket"
    />

    <PlayerGold/>
  </div>

  <img
    v-if="draggedItem && isDraggedItemImageLoaded"
    class="dragged-item"
    :style="dragMousePositionStyle"
    :src="`assets/${draggedItem.icons.item}`"
    @load="setDraggedImageSize"
  />
</template>

<script lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useInventoryStore } from '@/stores/useInventoryStore';
import { useEquipmentStore } from '@/stores/useEquipmentStore';
import { usePlayerStore } from '@/stores/usePlayerStore';
import PlayerEquipment from '@/components/player/PlayerEquipment.vue';
import PlayerInventory from '@/components/player/PlayerInventory.vue';
import { useEquippedGemStore } from '@/stores/useEquippedGemStore';
import type { IItem } from '@/phaser/items/IItem';
import { ScrollType } from '@/phaser/items/consumable/scrolls/ScrollInterface';
import { ConsumableType } from '@/phaser/items/consumable/IConsumable';
import { ItemIdentifier } from '@/phaser/items/ItemIdentifier';
import { Gem } from '@/phaser/items/gems/Gem';
import PlayerGold from '@/components/player/PlayerGold.vue';

export default {
    name: 'PlayerLoadout',
    components: { PlayerGold, PlayerEquipment, PlayerInventory },
    emits: ['toggleTooltip'],

    setup(_props, context) {
        const inventoryStore = useInventoryStore();
        const equipmentStore = useEquipmentStore();
        const playerStore = usePlayerStore();
        const gemStore = useEquippedGemStore();
        gemStore.initialize();
        // scroll of wisdom
        const isIdentifying = ref(false); // Whether the player is currently identifying an item
        const activeUseItem = ref(); // The Scroll of Wisdom that is currently selected/active
        const lastInteractedElement = ref<HTMLElement | null>(null);
        const playerLoadoutRef = ref(null);
        const isDraggedItemImageLoaded = ref(false);

        const draggedItem = ref<IItem<any> | null>(null);
        const dragMousePosition = ref({ x: 0, y: 0 });
        const draggedImageSize = ref({
            width: 0,
            height: 0,
        });

        let isMouseListenerAdded = false;

        const isOpen = computed(() => inventoryStore.isOpen);

        const dragMousePositionStyle = computed(() => {
            const { x, y } = dragMousePosition.value;
            const { width, height } = draggedImageSize.value;

            const itemWidth = draggedItem.value.size.width * 50;

            return {
                top: y - height / 2 + 'px',
                left: x - width / 2 + 'px',
                width: itemWidth + 'px',
            };
        });

        const setDraggedImageSize = async (event) => {
            draggedImageSize.value.height = event.target.naturalHeight;
            draggedImageSize.value.width = event.target.naturalWidth;

            isDraggedItemImageLoaded.value = true;
        };

        const disableContextMenu = (event) => {
            event.preventDefault();
        };

        const handleMouseEnter = (event, item) => {
            lastInteractedElement.value = event.target;

            if (item) {
                handleTooltip(item);
            }
        };

        const handleMouseLeaveSocket = (event, item, target) => {
            lastInteractedElement.value = target;

            if (item) {
                handleTooltip(item);
            }
        };

        const handleMouseLeave = (event) => {
            lastInteractedElement.value = null;
            handleTooltip(null);
        };

        const handleUseItem = (event, item) => {
            if (!item || draggedItem.value) return;

            activeUseItem.value = item;

            if (
                item.properties.type === ConsumableType.SCROLL &&
        item.properties.subType === ScrollType.SCROLL_OF_IDENTIFY
            ) {
                // Player right-clicked on a Scroll of Wisdom
                isIdentifying.value = true;
            }
        };

        const identifyItem = (item) => {
            // Perform the identification logic here.
            // For example, update the `identified` property of the item:
            if (ItemIdentifier.identify(item)) {
                if (activeUseItem.value) {
                    if (typeof activeUseItem.value?.stackSize === 'number') {
                        activeUseItem.value.stackSize -= 1;

                        if (activeUseItem.value.stackSize === 0) {
                            inventoryStore.removeItem(activeUseItem.value);
                        }
                    }
                }
            }

            resetActiveScroll();
        };

        // update mouse position inside the element
        const updateMousePosition = (event) => {
            dragMousePosition.value.x = event.clientX;
            dragMousePosition.value.y = event.clientY;
        };

        const handleIdentifyItem = async (event, item) => {
            if (isIdentifying.value) {
                if (!item) {
                    resetActiveScroll();
                    return;
                }

                identifyItem(item);
                return;
            }
        };

        const handleDragStart = async (event, item, index) => {
            if (!item) return;
            handleTooltip(null);
            draggedItem.value = item;

            // set the mouse position
            dragMousePosition.value.x = event.clientX;
            dragMousePosition.value.y = event.clientY;
        };

        const handleDropItem = async (event, item) => {
            draggedItem.value = null;
            handleTooltip(item);
        };

        const handleSwapItems = async (event, occupiedItem, slotElement) => {
            if (slotElement) {
                lastInteractedElement.value = slotElement;
            }
            handleTooltip(draggedItem.value);
            draggedItem.value = occupiedItem;
        };

        const handleTooltip = (item) => {
            if (!item) {
                context.emit('toggleTooltip', { item: null });
                return;
            }

            if (lastInteractedElement.value instanceof HTMLElement) {
                const rect = lastInteractedElement.value.getBoundingClientRect();
                if (rect) {
                    const position = {
                        top: rect.top + window.scrollY,
                        left: rect.left + window.scrollX,
                        width: rect.width,
                        height: rect.height,
                    };
                    context.emit('toggleTooltip', { item: item, position: position });
                } else {
                    context.emit('toggleTooltip', { item: item });
                }
            } else {
                context.emit('toggleTooltip', { item: item });
            }
        };

        const handleDropGemInSocket = (occupiedGem, gem) => {
            if (!(draggedItem.value instanceof Gem)) return;

            if (occupiedGem) {
                draggedItem.value = occupiedGem;
            } else {
                draggedItem.value = null;
                handleTooltip(gem);
            }
        };

        const handleRemoveGemInSocket = (gem, event) => {
            updateMousePosition(event);
            if (!gem || draggedItem.value) return;
            draggedItem.value = gem;
        };

        const resetActiveScroll = () => {
            isIdentifying.value = false;
            activeUseItem.value = null;
        };

        const handleOutsideClick = (event) => {
            if (!(playerLoadoutRef.value instanceof HTMLElement)) return;
            if (!playerLoadoutRef.value.contains(event.target)) {
                resetActiveScroll();
                if(draggedItem.value) {
                    inventoryStore.removeAndDropItem(draggedItem.value);
                    draggedItem.value = null;
                }
            }
        };

        const preloadImageAndSetSize = (imageSrc) => {
            const img = new Image();
            img.onload = setDraggedImageSize;
            img.src = imageSrc;
            if (img.complete) {
                setDraggedImageSize({ target: img });
            }
        };

        watch([isIdentifying, draggedItem], ([newIsIdentifying, newDraggedItem], [oldIsIdentifying, oldDraggedItem]) => {
        // Check if either isIdentifying or draggedItem has a truthy value (i.e., is active)
            if (newIsIdentifying || newDraggedItem) {
                inventoryStore.isDraggingItem = !!newDraggedItem; // Set dragging state based on the draggedItem
                if (!isMouseListenerAdded) {
                    window.addEventListener('mousemove', updateMousePosition);
                    window.addEventListener('mouseup', handleOutsideClick);
                    isMouseListenerAdded = true;
                }
            } else if (!newIsIdentifying && !newDraggedItem && (oldIsIdentifying || oldDraggedItem)) {
                inventoryStore.isDraggingItem = false; // Reset dragging state
                if (isMouseListenerAdded) {
                    window.removeEventListener('mousemove', updateMousePosition);
                    window.removeEventListener('mouseup', handleOutsideClick);
                    isMouseListenerAdded = false;
                }
            }
        });

        watch(draggedItem, (newValue, oldValue) => {
            if (newValue !== oldValue && newValue) {
                preloadImageAndSetSize(`assets/${newValue.icons.item}`);
            }
        });

        watch(isIdentifying, (newValue) => {
            if (activeUseItem.value?.properties?.subType === ScrollType.SCROLL_OF_IDENTIFY) {
                document.body.style.cursor = newValue
                    ? `url('assets/${activeUseItem.value.icons.item}') 20 20, auto`
                    : 'default';
            } else {
                document.body.style.cursor = 'default';
            }
        });

        onUnmounted(() => {
            window.removeEventListener('mousemove', updateMousePosition);
            window.removeEventListener('mouseup', handleOutsideClick);
        });

        return {
            playerLoadoutRef,
            isOpen,
            inventoryStore,
            equipmentStore,
            playerStore,
            draggedItem,
            dragMousePosition,
            isIdentifying,
            dragMousePositionStyle,
            isDraggedItemImageLoaded,
            handleMouseEnter,
            handleMouseLeave,
            handleTooltip,
            disableContextMenu,
            handleUseItem,
            handleDropGemInSocket,
            handleRemoveGemInSocket,
            handleDragStart,
            handleDropItem,
            handleIdentifyItem,
            handleSwapItems,
            setDraggedImageSize,
            handleMouseLeaveSocket,
        };
    },
};
</script>

<style scoped lang="scss">
.player-loadout {
  z-index: 7777;
  background: #12161a;
  display: flex;
  flex-direction: column;
  position: absolute;
  justify-content: center;
  background-image: url(/assets/inventory-background.jpg);
  background-size: cover;
  background-repeat: no-repeat;
  top: 0;
  right:0;
  height: 100%;
  box-shadow: -1px -1px 1px rgba(10, 0, 5, 0.5), -1px 1px 1px rgba(10, 0, 5, 0.5),
    1px 1px 1px rgba(10, 0, 5, 0.5), 1px -1px 1px rgba(10, 0, 5, 0.5);
  border-style: solid;
  border-width: 3px;
  border-image: url('/assets/ui/box-border.png') 5 repeat;
  border-radius: 4px;
  border-top: 0;
  border-bottom: 0;

  &::before {
    content: '';
    background-image: url('/assets/ui/inventory/bg.png');
    background-size: cover;
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    opacity: 0.1;
    z-index: -1;
  }
}

.dragged-item {
  position: absolute;
  z-index: 7777;
  pointer-events: none;
}
</style>
