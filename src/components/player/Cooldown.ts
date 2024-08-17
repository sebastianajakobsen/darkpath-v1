export class Cooldown {
    constructor(public element: HTMLElement) {
        this.canvas = element.querySelector('canvas')!;
        this.ctx = this.canvas.getContext('2d')!;
        this.requestId = null;
        this.timerStart = Date.now();
        this.adjustCanvasSize();
    }

    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    requestId: number | null;
    timerStart: number;
    cooldownDuration = 0;

    adjustCanvasSize() {
        const hypoteneuse = Math.sqrt(this.element.clientWidth ** 2 + this.element.clientHeight ** 2);
        this.canvas.width = hypoteneuse;
        this.canvas.height = hypoteneuse;
        this.canvas.style.marginLeft = `${-hypoteneuse / 2}px`;
        this.canvas.style.marginTop = `${-hypoteneuse / 2}px`;
    }

    clearCanvas() {
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    initiateCooldown(cooldownDuration: number) {
        // Clear any existing cooldown process
        if (this.requestId) {
            cancelAnimationFrame(this.requestId);
            this.requestId = null;
        }

        // Reset and start new cooldown
        this.cooldownDuration = cooldownDuration;
        this.timerStart = Date.now();
        this.runCooldown();
    }

    runCooldown() {
        const elapsed = Date.now() - this.timerStart;
        const progress = elapsed / this.cooldownDuration;
        if (progress < 1) {
            this.drawCooldown(progress);
            this.requestId = requestAnimationFrame(() => this.runCooldown());
        } else {
            this.endCooldown();
        }
    }

    drawCooldown(progress: number) {
        const degrees = 2 * Math.PI * progress;
        const radius = this.canvas.width / 2;

        this.clearCanvas();

        // Set transformations to rotate from the top-center
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.translate(radius, radius);
        this.ctx.rotate(-Math.PI / 2);

        // Draw full overlay background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, radius, 0, Math.PI * 2, false);
        this.ctx.fill();

        // Draw "clearing" arc, which grows and reveals the content beneath
        this.ctx.globalCompositeOperation = 'destination-out';
        this.ctx.fillStyle = 'rgba(0, 0, 0, 1)';  // Ensure this is fully opaque
        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.arc(0, 0, radius, 0, degrees, false);
        this.ctx.lineTo(0, 0);
        this.ctx.fill();

        // Reset composite operation to default
        this.ctx.globalCompositeOperation = 'source-over';

        // Reset transformations to ensure no residual effects
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    }

    endCooldown() {
        if (this.requestId) {
            cancelAnimationFrame(this.requestId);
            this.requestId = null;
        }
        this.clearCanvas();
        // Set the color for the flash; adjust the color and opacity to your preference
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Clear the canvas after a short delay to show the flash effect
        setTimeout(() => {
            this.clearCanvas();
        }, 150);  // Delay in milliseconds, adjust this value based on how noticeable you want the flash to be
    }
}