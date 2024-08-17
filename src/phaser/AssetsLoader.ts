export class AssetLoader {
    private scene: Phaser.Scene;
    private loadedAudioKeys: Set<string>;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.loadedAudioKeys = new Set<string>();
    }

    public loadAssets(assets: { type: string; key: string; path: string }[], onComplete: (error?: Error)=> void) {
        const missingAssets = assets.filter(asset => {
            if (asset.type === 'audio') {
                return !this.loadedAudioKeys.has(asset.key);
            } else if (asset.type === 'image') {
                return !this.scene.textures.exists(asset.key);
            }
            return false;
        });

        if (missingAssets.length > 0) {
            missingAssets.forEach(asset => {
                try {
                    if (asset.type === 'audio') {
                        this.scene.load.audio(asset.key, asset.path);
                        this.loadedAudioKeys.add(asset.key);
                    } else if (asset.type === 'image') {
                        this.scene.load.image(asset.key, asset.path);
                    }
                } catch (error) {
                    console.error(`Failed to load asset ${asset.key} from ${asset.path}: ${error}`);
                }
            });
            this.scene.load.once('complete', () => onComplete(), this);
            this.scene.load.start();
        } else {
            onComplete();  // No assets to load, complete immediately
        }
    }
}