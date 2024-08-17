export class CooldownManager {
    private cooldowns: Map<string, number> = new Map();

    setCooldown(spellType: string, cooldownDuration: number, currentTime: number) {
        this.cooldowns.set(spellType, currentTime + cooldownDuration);
    }

    isOnCooldown(spellType: string, currentTime: number): boolean {
        if (!this.cooldowns.has(spellType)) return false;

        const cooldown = this.cooldowns.get(spellType);
        return cooldown !== undefined && cooldown > currentTime;
    }

    cleanupCooldownForSpell(spellType: string) {
        this.cooldowns.delete(spellType);
    }

    cleanupCooldowns(currentTime: number) {
        this.cooldowns.forEach((cooldown, spellType) => {
            if (cooldown < currentTime) {
                this.cooldowns.delete(spellType);
            }
        });
    }
}