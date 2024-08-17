<template>
  <div id="player-equipment">
    <div
      v-for="(slot, index) in equipmentStore.slots"
      :key="`${slot.name}-${index}`"
      :class="[
        'gear-slot',
        `gear-slot-${index}`,
        `gear-slot-${slot.name.toLowerCase()}`,
         slot.item && slot.item.properties?.equipSlot ? 'gear-slot--occupied' : '',
        draggedItem?.properties?.equipSlot && draggedItem.properties.equipSlot.includes(slot.type)
          ? 'gear-slot--valid-drop'
          : ''
      ]"
      :data-slot="slot.name"
      @mousedown.left.exact="handleClick($event, slot, index)"
      @mouseenter="handleMouseEnter($event, slot.item, index)"
      @mouseleave="handleMouseLeave($event)"
    >
      <div v-if="slot.item" class="gear-slot__item">
        <div v-if="slot.item" class="gear-slot__item-icon" :style="setDragItemStyle(slot.item)">
          <SocketSlot
            v-for="(entry, socketIndex) in slot.item.properties?.processedSockets"
            :key="socketIndex"
            :entry="entry"
            :index="Number(socketIndex)"
            :item-index="index"
            :item="slot.item"
            :draggedItem="draggedItem"
            @drop-gem-in-socket="handleDropGem"
            @remove-gem-in-socket="handleRemoveGem"
            @mouseLeaveSocket="handleMouseLeaveSocket"
            @mouseEnterSocket="handleMouseEnterSocket"
          />

          <img
            :class="`gear-slot__item-image-${index}`"
            style="position: absolute"
            :src="`/assets/${slot.item.icons.item}`"
          />
        </div>
        <div v-else class="gear-slot__empty"></div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { PropType } from 'vue';
import { useEquipmentStore } from '@/stores/useEquipmentStore';
import SocketSlot from '@/components/items/ItemSockets.vue';
import type { IItem } from '@/phaser/items/IItem';
import { Gem } from '@/phaser/items/gems/Gem';


export default {
    name: 'PlayerEquipment',
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
        'dropGemInSocket',
        'removeGemInSocket',
        'dragStart',
        'dropItem',
        'swapItems',
        'mouseLeaveSocket',
    ],
    setup(props, context) {
        const equipmentStore = useEquipmentStore();

        const handleMouseLeaveSocket = (event, item, index) => {
            const targetElement = document.querySelector(`.gear-slot-${index}`);
            if (targetElement) {
                context.emit('mouseLeaveSocket', event, item, targetElement);
            }
        };

        const handleMouseEnterSocket = (event, item, index) => {
            event.preventDefault();
            event.stopPropagation();
            context.emit('mouseEnter', event, item);
        };

        const handleRemoveGem = (event, entry, item) => {
            if (props.isIdentifying) return;
            event.preventDefault();
            event.stopPropagation();

            const gem = entry.data.gem;
            equipmentStore.removeGemFromSocket(item.id, entry.index);
            context.emit('removeGemInSocket', gem, event);
        };

        const handleDropGem = (event, entry, item) => {
            if (!(props.draggedItem instanceof Gem)) return;
            event.preventDefault();
            event.stopPropagation();

            const occupiedGem = entry.data.gem;
            const gem = props.draggedItem;

            equipmentStore.updateGemInSocket(item.id, entry.index, props.draggedItem);

            context.emit('dropGemInSocket', occupiedGem, gem);
        };

        const handleClick = (event, slot, index) => {
            if (props.isIdentifying) {
                return;
            }

            if (!props.draggedItem && slot.item) {
                handleDragStart(event, slot, index);
            } else if (props.draggedItem && !slot.item) {
                handleDrop(event, slot, index);
            } else if (props.draggedItem && slot.item) {
                handleSwapItems(event, slot, index);
            }
        };

        const handleSwapItems = (event, slot, index) => {
            const itemToEquip = props.draggedItem;
            const itemToRemove = slot.item;

            if (!itemToEquip || !itemToEquip?.properties.equipSlot || !itemToEquip.identified) return;

            // Attempt to remove the current item
            const itemRemoved = equipmentStore.unequipItem(itemToRemove, slot.name);

            // Proceed only if the item was successfully removed and there's an item to equip
            if (itemRemoved && itemToEquip) {
                // Try to equip the new item
                const itemEquipped = equipmentStore.equipItem(itemToEquip, slot.name);

                // If equipping the new item fails, re-equip the original item
                if (itemEquipped) {
                    context.emit('swapItems', event, itemToRemove);
                } else {
                    equipmentStore.equipItem(itemToRemove, slot.name);
                    console.log('Failed to equip new item. Re-equipped original item.');
                }
            }
        };

        const handleDrop = (event, slot, index) => {
            const itemToEquip = props.draggedItem;

            if (!itemToEquip || !itemToEquip.properties.equipSlot || !itemToEquip.identified) return;

            const itemEquipped = equipmentStore.equipItem(itemToEquip, slot.name);

            if (itemEquipped) {
                context.emit('dropItem', event, itemToEquip, index);
            }
        };

        const handleDragStart = (event, slot, index) => {
            const item = slot.item;

            if (item) {
                context.emit('dragStart', event, item, index);
                equipmentStore.unequipItem(item, slot.name);
            }
        };

        const handleMouseLeave = (event) => {
            context.emit('mouseLeave');
        };

        const handleMouseEnter = async (event, item, index) => {
            event.preventDefault();
            context.emit('mouseEnter', event, item);
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
            const cSize = 50;

            const gridTemplateColumns = `repeat(${item.size.width}, ${cSize}px) !important`;
            const gridTemplateRows = `repeat(${item.size.height}, ${cSize}px) !important`;

            const width = item.size.width * cSize;
            // Use custom function to generate grid template areas
            const gridTemplateAreas = generateCustomGridTemplateAreas(item.size.width, item.size.height);

            return {
                display: 'grid',
                gridTemplateAreas: gridTemplateAreas,
                gridTemplateColumns: gridTemplateColumns,
                gridTemplateRows: gridTemplateRows,
                width: width + 'px',
                margin: '0 auto',
            };
        };

        return {
            setDragItemStyle,
            equipmentStore,
            handleMouseEnter,
            handleRemoveGem,
            handleClick,
            handleDropGem,
            handleMouseLeave,
            handleMouseLeaveSocket,
            handleMouseEnterSocket,
        };
    },
};
</script>

<style scoped lang="scss">
#player-equipment {
  display: grid;
  grid-template-columns: repeat(8, 50px);
  grid-template-rows: repeat(6, 50px);
  grid-template-areas:
    'Weapon Weapon . Helmet Helmet . Offhand Offhand'
    'Weapon Weapon . Helmet Helmet . Offhand Offhand'
    'Weapon Weapon . BodyArmor BodyArmor Amulet Offhand Offhand'
    'Weapon Weapon Ring1 BodyArmor BodyArmor Ring2 Offhand Offhand'
    '. Gloves Gloves BodyArmor BodyArmor Boots Boots .'
    '. Gloves Gloves Belt Belt Boots Boots .';
  gap: 10px;
  justify-content: center;

  .gear-slot {
    background: #030303cc;
    box-shadow: -1px -1px 1px rgba(10, 0, 5, 0.5), -1px 1px 1px rgba(10, 0, 5, 0.5), 1px 1px 1px rgba(10, 0, 5, 0.5), 1px -1px 1px rgba(10, 0, 5, 0.5);
    border-style: solid;
    border-width: 3px;
    border-image: url(/assets/ui/box-border.png) 5 repeat;

    &--occupied {
      //background: rgba(23, 0, 112, 0.62);
    }
    &--valid-drop {
      border: 1px solid #2f284a;
    }

    &__item {
      height: 100%;
      width: 100%;
      position: relative;

      &-icon {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
        width: 100%;
        position: relative;
        place-content: center;
        place-items: center;
      }
    }

    &-bodyarmor {
      grid-area: BodyArmor / BodyArmor / BodyArmor / BodyArmor;
    }

    &-weapon {
      grid-area: Weapon / Weapon / Weapon / Weapon;
    }

    &-helmet {
      grid-area: Helmet / Helmet / Helmet / Helmet;
    }

    &-amulet {
      grid-area: Amulet / Amulet / Amulet / Amulet;
    }

    &-ring1 {
      grid-area: Ring1 / Ring1 / Ring1 / Ring1;
    }

    &-ring2 {
      grid-area: Ring2 / Ring2 / Ring2 / Ring2;
    }

    &-offhand {
      grid-area: Offhand / Offhand / Offhand / Offhand;
    }

    &-gloves {
      grid-area: Gloves / Gloves / Gloves / Gloves;
    }

    &-belt {
      grid-area: Belt / Belt / Belt / Belt;
    }

    &-boots {
      grid-area: Boots / Boots / Boots / Boots;
    }
  }
}
</style>
