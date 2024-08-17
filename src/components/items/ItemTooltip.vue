<template>
  <div
    ref="tooltipRef"
    class="tooltip"
    :style="tooltipStyle"
    style="color: #fff; font-size: 12px; min-width: 250px; position: absolute; z-index: 7777777"
  >
    <div
      :style="{
        color: itemColor
      }"
    >
      <div style="font-size: 16px">
        {{ item.identified ? item.name : item.properties.subType }}
      </div>
    </div>

    <div>
      <span v-if="item.category === ItemCategory.WEAPON">
        {{ item.properties.handType }}
        {{ item.properties.type }}
        : {{ item.properties.minDamage }} to {{ item.properties.maxDamage }}
      </span>

      <span v-else-if="item.category === ItemCategory.ARMOR">
        {{ item.properties.type }}: {{ item.properties.armor }}
      </span>

      <span v-else>
        {{ item.properties.type }}
      </span>
    </div>

    <div v-if="item.properties.affix && item.identified">
      <div v-for="(affix, index) in item.properties.affix" :key="'affix-' + index">
        <!-- Loop through each bonus in the current affix -->
        <div v-for="(value, key) in affix.bonus" :key="key">
          {{ formatValue(value) }} {{ formatKeyToReadable(key) }}
        </div>
      </div>
    </div>

    <div v-if="!item.identified" style="color: red">Unidentified</div>
    <div v-if="item.requirements" style="font-size: 12px" v-html="formattedRequirements"></div>
  </div>
</template>

<script lang="ts">
import { ref, PropType, computed, watch, nextTick } from 'vue';

import { usePlayerStore } from '@/stores/usePlayerStore';

import { useInventoryStore } from '@/stores/useInventoryStore';
import { IItem, ItemCategory, ItemRarityType } from '@/phaser/items/IItem';
import { rarityColorMap } from '@/phaser/const/Font';

export default {
    name: 'ItemTooltip',
    props: {
        item: {
            type: Object as PropType<IItem<any>>,
            required: true,
        },
        tooltipPosition: {
            type: Object,
        },
    },
    setup(props) {
        const playerStore = usePlayerStore();
        const inventoryStore = useInventoryStore();
        const { columnSize, halfColumnSize, numColumns, numRows } = inventoryStore;
        const tooltipRef = ref(null);
        const tooltipStyle = ref<{ [key: string]: string }>({
            top: '0px',
            position: 'absolute',
            zIndex: '777777',
        });

        const itemColor = computed(() => {
            return rarityColorMap[props.item.rarity] || rarityColorMap[ItemRarityType.NORMAL];
        });

        const formatValue = (value) => {
            switch (value.unit) {
            case 'RawNumber':
                return `+ ${value.current}`;
            case 'Percentage':
                return `${value.current}%`;
            default:
                return value.current; // default to just showing the value if unit isn't recognized
            }
        };

        // Define a mapping from full names to abbreviations
        const attributeAbbreviations: Record<string, string> = {
            strength: 'Str',
            intelligence: 'Int',
            dexterity: 'Dex',
            // Add more mappings if needed
        };

        const formatKeyToReadable = (key: string) => {
            // Split based on capital letters
            let result = key.replace(/([A-Z])/g, ' $1');
            // Capitalize the first letter of each word
            result = result.charAt(0).toUpperCase() + result.slice(1);
            return result;
        };

        const formattedRequirements = computed(() => {
            if (!props.item.requirements) return '';

            function getColoredValue(key, value) {
                if (playerStore.level < value) {
                    return `<span style="color: red; font-weight: bold;">${value}</span>`;
                } else {
                    return `<span style="color: white;">${value}</span>`; // This line makes the value white.
                }
            }

            // Special handling for 'Level' key if it exists
            let levelPart = '';
            if (props.item.requirements.level) {
                const coloredLevel = getColoredValue('level', props.item.requirements.level);
                levelPart = `Requires Level: ${coloredLevel},`;

                // Copy the requirements object so we don't mutate the original props
                const copyRequirements = { ...props.item.requirements };
                delete copyRequirements.level;

                const requirementsArray = Object.entries(copyRequirements);

                const otherParts = requirementsArray
                    .map(
                        ([key, value], index) =>
                            `${getColoredValue(key, value)} ${attributeAbbreviations[key]}${
                                index !== requirementsArray.length - 1 ? ',' : ''
                            }`,
                    )
                    .join(' ');

                return `${levelPart} ${otherParts}`.trim();
            } else {
                return Object.entries(props.item.requirements)
                    .map(([key, value]) => `${getColoredValue(key, value)} ${attributeAbbreviations[key]}`)
                    .join(', ');
            }
        });

        const adjustTooltipWindow = () => {
            if (tooltipRef.value instanceof HTMLElement) {
                const { top, left, height } = props.tooltipPosition;

                // getting the item width
                const width = props.item.size.width * columnSize;

                const tooltipRect = tooltipRef.value.getBoundingClientRect();

                let adjustedLeft = Math.round(left - tooltipRect.width / 2 + width / 2);
                let adjustedTop = Math.round(top - tooltipRect.height);

                // Check for right overflow
                if (adjustedLeft + tooltipRect.width > window.innerWidth) {
                    adjustedLeft = window.innerWidth - tooltipRect.width; // Align right edge of tooltip with right edge of window
                }

                // Check for left overflow
                if (adjustedLeft < 0) {
                    adjustedLeft = 0; // Align left edge of tooltip with left edge of window
                }

                // Check for top overflow
                if (adjustedTop < 0) {
                    adjustedTop = top + height; // Position below the target element if it overflows above
                }

                // Check for bottom overflow - optional, depends on your design
                if (adjustedTop + tooltipRect.height > window.innerHeight) {
                    adjustedTop = window.innerHeight - tooltipRect.height; // Align bottom edge of tooltip with bottom edge of window
                }

                tooltipStyle.value = {
                    top: `${adjustedTop}px`,
                    left: `${adjustedLeft}px`,
                };
            }
        };

        watch(
            () => [props.item.id, props.item.identified],
            async () => {
                // makes sure that we have the new dimension before fixing the window
                await nextTick();
                await adjustTooltipWindow();
            },
            {
                immediate: true,
                deep: true,
            },
        );

        return {
            itemColor,
            tooltipStyle,
            tooltipRef,
            formattedRequirements,
            formatValue,
            formatKeyToReadable,
        };
    },
    computed: {
        ItemCategory() {
            return ItemCategory;
        },
    },
};
</script>

<style scoped>
.tooltip {
  pointer-events: none;
  background: #0505058f;
  padding: 8px;
  text-align: center;
  font-weight: bold;
  color: #787878;
  font-size: 14px;
  display: flex;
  flex-direction: column; /* stack children vertically */
  width: max-content; /* set width to match widest child */
  text-shadow: 0 1px 0 black;
  box-shadow: -1px -1px 1px rgba(10, 0, 5, 0.5), -1px 1px 1px rgba(10, 0, 5, 0.5),
    1px 1px 1px rgba(10, 0, 5, 0.5), 1px -1px 1px rgba(10, 0, 5, 0.5);
  border: 1px solid #5c5c5c;
}

.requirement-item {
  margin-right: 4px; /* Adjust the space as needed */
}

.requirement-item:first-child {
  margin-left: 4px;
}

/* Optional: to ensure the last item doesn't have extra margin */
.requirement-item:last-child {
  margin-right: 0;
}
</style>
