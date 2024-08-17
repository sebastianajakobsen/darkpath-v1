<template>
  <div :style="generateGridAreaStyle" :class="socketSlotClasses">
    <div
      v-if="entry.type === 'socket'"
      :class="socketIconClass"
      :style="gridAreaStyle"
      @mousedown.left.exact="handleDropGem($event)"
      @mousedown.right.exact="handleRemoveGem($event)"
      @mouseenter="handleMouseEnterSocket($event)"
      @mouseleave="handleMouseLeaveSocket($event)"
    >
      <img v-if="entry.data?.gem" class="gem-icon" :src="gemIconSrc" />
    </div>
  </div>
</template>

<script lang="ts">

import { computed, defineComponent, PropType } from 'vue';
import type { IItem } from '@/phaser/items/IItem';

export default defineComponent({
    name: 'SocketSlot',
    props: {
        item: {
            type: Object as PropType<IItem<any> | null>,
            required: true,
        },
        entry: {
            type: Object as PropType<any>, // Adjust according to your actual entry type
            required: true,
        },
        index: {
            type: Number,
            required: true,
        },
        itemIndex: {
            type: Number,
            required: true,
        },
        isGearSlot: {
            type: Boolean,
            default: false,
        },
        draggedItem: {
            type: Object as PropType<IItem<any> | null>,
            required: false,
        },

    },
    emits: ['drop-gem-in-socket', 'remove-gem-in-socket', 'mouseEnterSocket', 'mouseLeaveSocket'],
    setup(props, context) {
        const gridAreaStyle = computed(() => ({
            gridArea: `socketSlot-${props.entry.index}`,
        }));

        const generateGridAreaStyle = computed(() => {
            const isOneWidth = props.item.size.width === 1;
            // Calculate slotNumber value based on item width and index
            const slotNumber = isOneWidth
                ? props.entry.index === 0
                    ? 0
                    : props.entry.index * 2 + 1
                : props.entry.index;

            if (props.entry.type === 'socket') {
                return { gridArea: `socketSlot-${slotNumber}` };
            }

            // Check for special case
            const isSpecialCase =
        slotNumber === 2 && props.item?.properties?.sockets[slotNumber]?.linkTo !== null;
            const plusNumber = isOneWidth ? (slotNumber === 0 ? 3 : 2) : 1;

            // Determine gridArea based on special case
            // eslint-disable-next-line prefer-const
            const gridArea = isSpecialCase
                ? `socketSlot-${slotNumber}-end / socketSlot-${slotNumber}-end / socketSlot-${
                    slotNumber + plusNumber
                }-start / socketSlot-${slotNumber + plusNumber}-start`
                : `socketSlot-${slotNumber}-start / socketSlot-${slotNumber}-start / socketSlot-${
                    slotNumber + plusNumber
                }-end / socketSlot-${slotNumber + plusNumber}-end`;

            let percent = {
                // width: '22%',
                // height: '19%',
                height: '9px',
                width: '26px',
            };

            if (isOneWidth) {
                percent = {
                    width: '9px',
                    height: '26px',
                };
            }

            if (props.entry.index % 2) {
                percent = {
                    width: '9px',
                    height: '26px',
                };
            }

            if (props.isGearSlot) {
                percent = {
                    width: '23%',
                    height: '20%',
                };
                if (props.entry.index % 2) {
                    percent = {
                        width: '20%',
                        height: '23%',
                    };
                }
            }

            return {
                zIndex: 777,
                backgroundColor: 'rgb(203 187 149 / 85%)',
                gridArea,
                opacity: 1,
                ...percent,
            };
        });

        const socketSlotClasses = computed(() => {
            return [
                'socket-slot',
                `socket-slot--${props.entry.type}`,
                props.entry.data?.type ? `socket-slot--${props.entry.data.type}` : '',
            ];
        });

        const socketIconClass = computed(() => `socket-icon socket-${props.entry.index}`);

        const gemIconSrc = computed(() => `/assets/${props.entry.data?.gem?.icons.item}`);

        const handleMouseEnterSocket = (event) => {
            const item = props.entry.data?.gem;
            context.emit('mouseEnterSocket', event, item, props.itemIndex);
        };

        const handleMouseLeaveSocket = (event) => {
            context.emit('mouseLeaveSocket', event, props.item, props.itemIndex);
        };

        // Method to emit events, wrapped in a function to use in template
        const handleDropGem = (event: MouseEvent) => {
            context.emit('drop-gem-in-socket', event, props.entry, props.item);
        };

        const handleRemoveGem = (event: MouseEvent) => {
            console.log(props.draggedItem);
            if(props.draggedItem) return;
            context.emit('remove-gem-in-socket', event, props.entry, props.item, props.itemIndex);
        };

        // Return everything needed in the template
        return {
            generateGridAreaStyle,
            socketSlotClasses,
            socketIconClass,
            gemIconSrc,
            handleMouseEnterSocket,
            handleMouseLeaveSocket,
            handleDropGem,
            handleRemoveGem,
            gridAreaStyle,
        };
    },
});
</script>

<style scoped>
.gem-icon {
  width: 37px;
  max-width: inherit;
  max-height: inherit;
  position: absolute;
  left: 50%;
  transform: translate(-50%, -14%);
}

.socket-slot {
  z-index: 7777;
  box-shadow: inset 0px 0px 0px 3px rgb(47 41 41 / 88%);
  border-radius: 50%;
}

.socket-slot--link {
  box-shadow: none;
  background: #cbbb95;
  border-radius: 0;
}
.socket-icon {
  width: 30px;
  height: 30px;
  margin: 0 auto;
  border: 1px solid #cbbb95;
  border-radius: 30px;
  background: rgb(22 25 27 / 41%);
  z-index: 3;
  position: relative;
  box-shadow: 0 -1px 4px 1px rgb(54 54 54 / 55%);
}
</style>
