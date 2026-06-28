// ============================================
// Ambient Particle System — Canvas 2D
// Lightweight floating particles background
// ============================================

export class Particles {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.mouse = { x: -1000, y: -1000 };
        this.isVisible = true;
        this.animationId = null;
        this.isMobile = window.innerWidth < 768;

        this.resize();
        this.createParticles();
        this.setupEvents();
        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createParticles() {
        const count = this.isMobile ? 60 : 150;
        this.particles = [];
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                r: Math.random() * 2 + 0.5,
                opacity: Math.random() * 0.4 + 0.1,
                color: this.getRandomColor()
            });
        }
    }

    getRandomColor() {
        const colors = [
            'rgba(255, 90, 0,',   // orange
            'rgba(255, 159, 28,',  // gold
            'rgba(148, 163, 184,', // silver
            'rgba(204, 72, 0,',    // dark orange (rare)
        ];
        const weights = [0.4, 0.3, 0.25, 0.05];
        let r = Math.random(), sum = 0;
        for (let i = 0; i < weights.length; i++) {
            sum += weights[i];
            if (r <= sum) return colors[i];
        }
        return colors[0];
    }

    setupEvents() {
        window.addEventListener('resize', () => {
            this.resize();
            this.createParticles();
        });

        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });

        // Visibility
        const observer = new IntersectionObserver(
            ([entry]) => { this.isVisible = entry.isIntersecting; },
            { threshold: 0 }
        );
        observer.observe(this.canvas);

        document.addEventListener('visibilitychange', () => {
            this.isVisible = !document.hidden;
        });
    }

    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());
        if (!this.isVisible) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const connectionDist = this.isMobile ? 80 : 120;

        this.particles.forEach((p, i) => {
            // Mouse repulsion
            const dx = p.x - this.mouse.x;
            const dy = p.y - this.mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 100) {
                p.x += dx * 0.01;
                p.y += dy * 0.01;
            }

            // Move
            p.x += p.vx;
            p.y += p.vy;

            // Wrap around
            if (p.x < -10) p.x = this.canvas.width + 10;
            if (p.x > this.canvas.width + 10) p.x = -10;
            if (p.y < -10) p.y = this.canvas.height + 10;
            if (p.y > this.canvas.height + 10) p.y = -10;

            // Draw particle
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            this.ctx.fillStyle = `${p.color} ${p.opacity})`;
            this.ctx.fill();

            // Connection lines (only check subsequent particles to avoid doubles)
            if (!this.isMobile) {
                for (let j = i + 1; j < this.particles.length; j++) {
                    const p2 = this.particles[j];
                    const cdx = p.x - p2.x;
                    const cdy = p.y - p2.y;
                    const cdist = Math.sqrt(cdx * cdx + cdy * cdy);
                    if (cdist < connectionDist) {
                        const alpha = (1 - cdist / connectionDist) * 0.08;
                        this.ctx.beginPath();
                        this.ctx.moveTo(p.x, p.y);
                        this.ctx.lineTo(p2.x, p2.y);
                        this.ctx.strokeStyle = `rgba(255, 90, 0, ${alpha})`;
                        this.ctx.lineWidth = 0.5;
                        this.ctx.stroke();
                    }
                }
            }
        });
    }

    destroy() {
        if (this.animationId) cancelAnimationFrame(this.animationId);
    }
}
