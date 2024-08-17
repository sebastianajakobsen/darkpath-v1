import { defineStore } from 'pinia';

export const usePlayerStore = defineStore('player', {
    state: () => ({
        initialized: false,
        level: 1,
        armor: 0,
        attributes: {
            strength: 1,
            dexterity: 1,
            intelligence: 1,
            vitality: 1,
        },
        health: {
            baseHealth: 100,
            maxHealth: 100,
            currentHealth: 100,
            healthRegenRate: 1,
            regenInterval: 1000,
        },
        mana: {
            baseMana: 100,
            maxMana: 100,
            currentMana: 100,
            manaRegenRate: 1,
            regenInterval: 1000,
        },
        combatStats: {
            baseDamage: 20,
            dodgeChance: 5,
            hitChance: 95,
            critChance: 5,
            critMultiplier: 100,
            castSpeedModifier: 1.0,
        },
        movementSpeed: {
            baseSpeed: 300,
        },
    }),
    getters: {},
    actions: {
    // so we don't initalized the player again
        setInitialized() {
            this.initialized = true;
            // You might also trigger other updates here, such as recalculating derived stats
        },

        setLevel(level: number) {
            this.level = level;
            // You might also trigger other updates here, such as recalculating derived stats
        },

        setArmor(armor: number) {
            this.armor = armor;
            // You might also trigger other updates here, such as recalculating derived stats
        },

        setBaseMovementSpeed(baseSpeed: number) {
            this.movementSpeed.baseSpeed = baseSpeed;
        },

        setHealth(health: {
      baseHealth: number;
      currentHealth: number;
      maxHealth: number;
      healthRegenRate: number;
      regenInterval: number;
    }) {
            this.health = health;
        },

        setMana(mana: {
      baseMana: number;
      currentMana: number;
      maxMana: number;
      manaRegenRate: number;
      regenInterval: number;
    }) {
            this.mana = mana;
        },

        setAttributes(attributes: {
      strength: number;
      dexterity: number;
      intelligence: number;
      vitality: number;
    }) {
            this.attributes = attributes;
        },
        // Add an action to set combat stats
        setCombatStats(combatStats: {
      baseDamage: number;
      dodgeChance: number;
      critMultiplier: number;
      hitChance: number;
      critChance: number;
      castSpeedModifier: number;
    }) {
            this.combatStats = combatStats;
        },
    },
});
