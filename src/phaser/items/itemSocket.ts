import type { IItem } from '@/phaser/items/IItem';
import type { ISpellGemConfig } from '@/phaser/items/gems/spells/ISpellGem';
import type { ISupportGemConfig } from '@/phaser/items/gems/supports/ISupportGem';

interface SocketLink {
    socketId: number;
    linkTo: number | null;
}

export interface Socket {
    type: SocketType; // Enum for different types of sockets
    gem?: IItem<ISpellGemConfig | ISupportGemConfig>; // gem in the socket
    linkTo: number | null; // Add this property
}

export enum SocketType {
    RED = 'red',
    GREEN = 'green',
    BLUE = 'blue',
    YELLOW = 'yellow',
    PURPLE = 'purple'
}

export class ItemSocket {
    static getRandomSocketType(): SocketType {
        const types = Object.values(SocketType);
        const randomIndex = Math.floor(Math.random() * types.length);
        return types[randomIndex];
    }

    static generateSocketLinks(socketCount: number): SocketLink[] {
        const links: SocketLink[] = [];
        // ... (existing logic)
        // Initialize with empty links
        for (let i = 0; i < socketCount; i++) {
            links.push({
                socketId: i,
                linkTo: null,
            });
        }

        // Randomly establish links
        for (let i = 0; i < links.length - 1; i++) {
            // -1 because the last socket can't link to a "next" socket
            const currentSocket = links[i];

            // Random chance to link to the next socket or not
            if (Math.random() < 0.5) {
                // 50% chance to make a link
                currentSocket.linkTo = i + 1; // Linking to the next socket in line
            }
        }

        return links;
    }

    static createSockets(maxSockets = 0): Socket[] {
        let socketCount = maxSockets;
        if (maxSockets > 0) {
            socketCount = Math.floor(Math.random() * (maxSockets + 1)); // Randomly choose based on max sockets
        }

        const socketLinks = this.generateSocketLinks(socketCount);

        console.log(socketLinks);

        const sockets: Socket[] = socketLinks.map((socketLink) => ({
            type: this.getRandomSocketType(),
            gem: undefined,
            linkTo: socketLink.linkTo,
        }));

        return sockets;
    }
}
