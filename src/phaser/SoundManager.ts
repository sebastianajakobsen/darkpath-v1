export enum SoundGroup {
    SkillSounds,
    AmbientSounds,
    UISounds
}

export class SoundManager {
    private scene: Phaser.Scene;
    private soundGroups: Map<SoundGroup, Map<string, Phaser.Sound.BaseSound[]>>;
    private maxVolumes: Map<SoundGroup, number>;
    private activeSkillSounds: number = 0; // Track the number of active skill sounds
    private maxActiveSounds: number = 5; // Define the threshold for maximum active sounds
    private soundUsage: Map<string, { lastUsed: number, count: number }> = new Map();

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.soundGroups = new Map<SoundGroup, Map<string, Phaser.Sound.BaseSound[]>>();
        this.maxVolumes = new Map<SoundGroup, number>();
        this.initializeDefaultGroups();
    }

    private initializeDefaultGroups() {
        const groups: SoundGroup[] = [SoundGroup.SkillSounds, SoundGroup.AmbientSounds, SoundGroup.UISounds];
        groups.forEach(group => {
            this.soundGroups.set(group, new Map<string, Phaser.Sound.BaseSound[]>());
            this.maxVolumes.set(group, 1); // Default max volume
        });
    }

    /**
     * Set the maximum volume for a group
     * @param {string} groupName - The name of the group to set the max volume for.
     * @param {number} maxVolume - The maximum volume level (0.0 to 1.0).
     */
    public setGroupMaxVolume(groupName: SoundGroup, maxVolume: number) {
        this.maxVolumes.set(groupName, Phaser.Math.Clamp(maxVolume, 0, 1));
    }

    /**
     * Calculate volume based on distance
     * @param {number} distanceSquared - The squared distance from the source.
     * @param {number} maxDistanceSquared - The maximum distance squared for the sound to be audible.
     * @param {number} minVolume - The minimum volume at max distance.
     * @param {number} maxVolume - The volume at zero distance.
     * @returns {number} - The calculated volume.
     */
    public calculateVolumeBasedOnDistance(distanceSquared: number, maxDistanceSquared: number, minVolume: number = 0.01, maxVolume: number = 1): number {
        if (distanceSquared > maxDistanceSquared) {
            return minVolume;
        }
        const volume = maxVolume * (1 - (distanceSquared / maxDistanceSquared));
        return Math.max(volume, minVolume);
    }

    /**
     * Play a sound in a group, with optional distance-based volume adjustment
     * @param {string} groupName - The name of the group where the sound belongs.
     * @param {string} key - The key of the sound to play.
     * @param {Phaser.Types.Sound.SoundConfig} config - The sound configuration.
     * @param {number} distanceSquared - The squared distance from the source.
     * @param {number} maxDistanceSquared - The maximum distance squared for the sound to be audible.
     * @param maxPoolSize
     */
    public playSoundInGroup(
        groupName: SoundGroup,
        key: string,
        config?: Phaser.Types.Sound.SoundConfig,
        distanceSquared?: number,
        maxDistanceSquared?: number,
        maxPoolSize: number = 30,  // Default maximum size for sound pools
    ) {
        const group = this.soundGroups.get(groupName);
        let soundPool = group?.get(key);

        if (!this.scene.cache.audio.exists(key)) {
            console.warn('Sound key not found in cache:', key);
            return;
        }

        if (!soundPool) {
            console.warn(`Sound with key ${key} not found in group ${groupName}, initializing new pool.`);
            soundPool = [];
            group?.set(key, soundPool); // Correctly set the initialized pool in the group
        }

        let sound = soundPool.find(s => !s.isPlaying);

        // Create a new sound if none are available and the pool is not full
        if (!sound && soundPool.length < maxPoolSize) {
            sound = this.scene.sound.add(key, config);
            soundPool.push(sound);
            console.log(`Added new sound to the pool for key ${key}, total now: ${soundPool.length}`);
        }

        if (sound) {
            let volume = this.calculateVolume(config, distanceSquared, maxDistanceSquared, groupName);
            volume = this.adjustVolumeForActiveSounds(volume ?? 1);
            sound.play({ ...config, volume });
            this.updateSoundUsage(key);
            this.activeSkillSounds++;
            sound.once('complete', () => this.activeSkillSounds--);
        } else {
            console.warn(`No available sound instances in pool for key ${key} in group ${groupName}, and pool is at maximum size.`);
        }
    }

    private updateSoundUsage(key: string) {
        if (!this.soundUsage.has(key)) {
            this.soundUsage.set(key, { lastUsed: Date.now(), count: 1 });
        } else {
            const usage = this.soundUsage.get(key);
            usage.lastUsed = Date.now();
            usage.count++;
            this.soundUsage.set(key, usage);
        }
    }

    private calculateVolume(config?: Phaser.Types.Sound.SoundConfig, distanceSquared?: number, maxDistanceSquared?: number, groupName: SoundGroup) {
        let volume = config?.volume;
        if (distanceSquared !== undefined && maxDistanceSquared !== undefined) {
            const maxVolume = this.maxVolumes.get(groupName) ?? 1;
            volume = this.calculateVolumeBasedOnDistance(
                distanceSquared,
                maxDistanceSquared,
                config?.volume ?? 0.01,
                maxVolume,
            );
        } else if (volume !== undefined) {
            volume = Phaser.Math.Clamp(volume, 0, this.maxVolumes.get(groupName) ?? volume);
        }
        return volume;
    }

    /**
     * Adjust the volume based on the number of active sounds
     * @param {number} baseVolume - The base volume to be adjusted.
     * @returns {number} - The adjusted volume.
     */
    private adjustVolumeForActiveSounds(baseVolume: number): number {
        if (this.activeSkillSounds >= this.maxActiveSounds) {
            const adjustmentFactor = 1 / Math.log(this.activeSkillSounds - this.maxActiveSounds + 2);
            return Phaser.Math.Clamp(baseVolume * adjustmentFactor, 0.01, baseVolume);
        }
        return baseVolume;
    }
    /**
     * Add a sound to a specific group, creating a pool of sounds for that key.
     * @param {string} groupName - The name of the group to add the sound to.
     * @param {string} key - The key of the sound.
     * @param {Phaser.Types.Sound.SoundConfig} config - The sound configuration.
     * @param {number} poolSize - The number of sound instances in the pool.
     */
    public addSoundToGroup(groupName: SoundGroup, key: string, config?: Phaser.Types.Sound.SoundConfig, poolSize: number = 5) {
        const soundPool: Phaser.Sound.BaseSound[] = [];

        if (!this.scene.cache.audio.exists(key)) {
            console.warn('Sound key not found in cache:', key);
            return;
        }

        for (let i = 0; i < poolSize; i++) {
            const sound = this.scene.sound.add(key, config);
            soundPool.push(sound);
        }

        if (!this.soundGroups.has(groupName)) {
            this.soundGroups.set(groupName, new Map<string, Phaser.Sound.BaseSound[]>());
        }

        this.soundGroups.get(groupName)?.set(key, soundPool);
    }

    /**
     * Adjust the volume for all sounds in a specific group
     * @param {string} groupName - The name of the group to adjust the volume for.
     * @param {number} volume - The volume level to set (0.0 to 1.0).
     */
    public setGroupVolume(groupName: SoundGroup, volume: number) {
        const sounds = this.soundGroups.get(groupName);
        if (sounds) {
            sounds.forEach(sound => sound.setVolume(volume));
        }
    }

    /**
     * Mute or unmute all sounds in a specific group
     * @param {string} groupName - The name of the group to mute/unmute.
     * @param {boolean} mute - True to mute, false to unmute.
     */
    public setGroupMute(groupName: SoundGroup, mute: boolean) {
        const sounds = this.soundGroups.get(groupName);
        if (sounds) {
            sounds.forEach(sound => sound.setMute(mute));
        }
    }

    /**
     * Stop a specific sound in a group by its key
     * @param {string} groupName - The name of the group where the sound belongs.
     * @param {string} key - The key of the sound to stop.
     */
    public stopSoundInGroup(groupName: SoundGroup, key: string) {
        const group = this.soundGroups.get(groupName);
        const sound = group?.get(key);
        if (sound) {
            sound.stop();
        } else {
            console.warn(`Sound with key ${key} not found in group ${groupName}.`);
        }
    }

    /**
     * Remove a specific sound from a group.
     * @param {SoundGroup} groupName - The name of the group from which to remove the sound.
     * @param {string} key - The key of the sound to remove.
     */
    public removeSoundFromGroup(groupName: SoundGroup, key: string) {
        const group = this.soundGroups.get(groupName);
        if (group && group.has(key)) {
            const sounds = group.get(key)!;
            sounds.forEach(sound => {
                sound.stop(); // Stops the sound if it's playing
                sound.destroy(); // Destroys the sound object, freeing up resources
            });
            group.delete(key); // Remove the key and its sound pool from the map
            console.log(`Sound key ${key} removed from group ${groupName}.`);
        } else {
            console.warn(`Sound key ${key} not found in group ${groupName}.`);
        }
    }

    public cleanupUnusedSounds() {
        const currentTime = Date.now();
        const threshold = 60000; // 60 seconds threshold for cleanup
        this.soundUsage.forEach((value, key) => {
            if (currentTime - value.lastUsed > threshold) {
                // Remove sound from pool if it's not been used for over 60 seconds
                this.removeSoundFromGroup(SoundGroup.SkillSounds, key); // Adjust as needed for group management
                this.soundUsage.delete(key);
                console.log(`Cleaned up sound: ${key}`);
            }
        });
    }
}
