<template>
  <div class="action-bar">
    <div class="actions">
      <div v-for="(action, index) in actionBarStore.actions" :id="`action-${action.name}`" :key="index" ref="actionRefs" :class="[action.gridArea, 'action', { 'is-active': action.isActive }]">
        <div class="key">{{ action.name }}</div>
        <div class="action-internal">
          <div class="contents">
            <img
                v-if="action.assignedGem"
                :src="`/assets/${action.assignedGem.icons.skill}`"
            />
            <img
                v-else-if="action.name === 'ML' && !action.assignedGem"
                src="/assets/skills/move_skill_icon.png"
            />
          </div>
          <canvas class="status"></canvas>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, watch } from 'vue';
import { useActionBarStore } from '@/stores/useActionBarStore';
import { Cooldown } from '@/components/player/Cooldown';

export default defineComponent({
    name: 'CooldownComponent',

    setup() {
        const actionBarStore = useActionBarStore();
        const actionRefs = ref([]);
        const cooldownManagers = ref([]);

        watch(() => actionBarStore.actions.map(a => ({ initCooldown: a.initCooldown, cooldown: a.cooldown, isActive: a.isActive })),
            (newValues, oldValues) => {
                newValues.forEach((value, index) => {
                    if (value.initCooldown !== oldValues[index].initCooldown) {
                        // console.log('here??');
                        // console.log('actionBarStore.actions:', actionBarStore.actions);
                        // console.log('Action:', actionBarStore.actions[index].name);
                        // console.log('Initiating cooldown with duration:', value.cooldown);
                        // console.log('Cooldown triggered at:', value.initCooldown);
                        // console.log('value', value);
                        // TODO: fix assignGem is null we need to just stop cooldown
                        if (cooldownManagers.value[index]) {
                            cooldownManagers.value[index].initiateCooldown(value.cooldown);
                        }
                    }
                });
            },
        );

        onMounted(() => {
            actionRefs.value.forEach(el => {
                const cooldown = new Cooldown(el);
                cooldownManagers.value.push(cooldown);
            });
        });

        return {
            actionBarStore,
            actionRefs,
        };
    },
});
</script>
<style lang="scss" scoped>
.is-active {
  animation: yellowRotate 2s linear infinite;
  background-color: rgba(255, 255, 0, 0.2); // Maintain a light background for better visibility
}

@keyframes yellowRotate {
  0% {
    border-color: #FFD700; // Gold
    box-shadow: 0 0 8px #FFD700;
  }
  33% {
    border-color: #FFEA00; // Bright yellow
    box-shadow: 0 0 8px #FFEA00;
  }
  67% {
    border-color: #FFFF00; // Pure yellow
    box-shadow: 0 0 8px #FFFF00;
  }
  100% {
    border-color: #FFD700; // Gold
    box-shadow: 0 0 8px #FFD700;
  }
}

.top-left {
  grid-area: top-left;
}
.top-middle {
  grid-area: top-middle;
}
.top-right {
  grid-area: top-right;
}
.bottom-1 {
  grid-area: bottom-1;
}
.bottom-2 {
  grid-area: bottom-2;
}
.bottom-3 {
  grid-area: bottom-3;
}
.bottom-4 {
  grid-area: bottom-4;
}
.bottom-5 {
  grid-area: bottom-5;
}

.action-bar {
  position: absolute;
  bottom: 8px;
  right: 208px;
  z-index: 777;
}

.actions {
  display: grid;
  grid-gap: 6px;
  grid-template-areas:
    '. . top-left top-middle top-right'
    'bottom-1 bottom-2 bottom-3 bottom-4 bottom-5';
  grid-template-columns: 60px 60px 60px 60px 60px;
  grid-template-rows: auto auto;

}
.action {
  border:1px solid #303030;
  //border-radius: 5px;
  box-shadow: -1px -1px 1px rgba(10, 0, 5, 0.5), -1px 1px 1px rgba(10, 0, 5, 0.5), 1px 1px 1px rgba(10, 0, 5, 0.5), 1px -1px 1px rgba(10, 0, 5, 0.5);
  cursor: pointer;
  float: left;
  //margin: 0 1rem 2rem 0;
  outline: 0;
  position: relative;
  transition: 100ms;
  &:after {
    bottom: 0;
    content: '';
    display: block;
    height: 100%;
    left: 0;
    position: absolute;
    right: 0;
    top: 0;
    width: 100%;
  }
  &:hover, &.active {
    border: 1px solid rgb(253, 255, 173);
    box-shadow: 0 0 6px 1px rgb(253, 255, 173);
  }
  &:last-child {
    margin-right: 0;
  }
}
.action-internal {
  //background: transparent;
  background: rgb(106 34 34 / 80%);
  //border-radius: 5px;
  box-sizing: content-box;
  color: white;
  height: 58px;
  width: 58px;
  overflow: hidden;
  position: relative;
  user-select: none;
  //&:after {
  //  box-shadow: 0 34px 16px -16px rgba(255, 255, 255, 0.4) inset;
  //  bottom: 0;
  //  content: '';
  //  display: block;
  //  height: 100%;
  //  left: 0;
  //  position: absolute;
  //  right: 0;
  //  top: 0;
  //  width: 100%;
  //}
  //&:before {
  //  bottom: 0;
  //  box-shadow:
  //      0 1px 1px -1px rgba(255, 255, 255, 1) inset,
  //      0 2px 1px 0px rgba(255, 255, 255, 0.4) inset,
  //      0 -1px 2px -1px rgba(255, 255, 255, 0.4) inset;
  //  content: '';
  //  display: block;
  //  height: 100%;
  //  left: 0;
  //  position: absolute;
  //  right: 0;
  //  top: 0;
  //  width: 100%;
  //}
  .contents {
    align-items: center;
    display: flex;
    height: 100%;
    justify-content: center;
    width: 100%;
    img {
      display: block;
      margin: 0;
      height: 100%;
      width: 100%;
    }
  }
  canvas {
    left: 50%;
    position: absolute;
    top: 50%;
    z-index: 2;
    max-width: none;
  }
  &:last-child {
    margin-right: 0;
  }
}

.key {
  left: 10px;
  font-size: 13px;
  position: absolute;
  text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;
  top: -8px;
  z-index: 3;
  color: #fff;
}
</style>