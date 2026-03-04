import React, { useEffect, useRef, useMemo } from 'react';
import { useGlassSettings } from '../../contexts/GlassSettingsContext';

interface Point {
    x: number;
    y: number;
}

interface HullConfig {
    p1: Point; // Start Left
    p2: Point; // Start Right
    p3: Point; // End Right
    p4: Point; // End Left
}

interface LuminaHullProps {
    id: string;
    config: HullConfig;
    color: string;
}

// Helper: Point in Polygon
function isPointInPoly(pt: Point, poly: Point[]) {
    let c = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        if (((poly[i].y > pt.y) !== (poly[j].y > pt.y)) &&
            (pt.x < (poly[j].x - poly[i].x) * (pt.y - poly[i].y) / (poly[j].y - poly[i].y) + poly[i].x)) {
            c = !c;
        }
    }
    return c;
}

// Helper: Scale Polygon
function scalePoly(poly: Point[], factor: number): Point[] {
    const cx = poly.reduce((sum, p) => sum + p.x, 0) / poly.length;
    const cy = poly.reduce((sum, p) => sum + p.y, 0) / poly.length;

    return poly.map(p => ({
        x: cx + (p.x - cx) * factor,
        y: cy + (p.y - cy) * factor
    }));
}

const LuminaHullComponent: React.FC<LuminaHullProps> = ({ id, config, color }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { settings } = useGlassSettings();

    // Use ref to access latest settings inside animation loop without restarting effect
    const settingsRef = useRef(settings);
    useEffect(() => { settingsRef.current = settings; }, [settings]);

    // 1. Base Path
    const pathString = useMemo(() => {
        return `M ${config.p1.x} ${config.p1.y} L ${config.p2.x} ${config.p2.y} L ${config.p3.x} ${config.p3.y} L ${config.p4.x} ${config.p4.y} Z`;
    }, [config]);

    // 2. Expanded Path
    const expandedPathString = useMemo(() => {
        const poly = [config.p1, config.p2, config.p3, config.p4];
        const scaled = scalePoly(poly, 1.08);
        return `M ${scaled[0].x} ${scaled[0].y} L ${scaled[1].x} ${scaled[1].y} L ${scaled[2].x} ${scaled[2].y} L ${scaled[3].x} ${scaled[3].y} Z`;
    }, [config]);

    // Canvas Particle System
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        const particles: any[] = [];
        const flashes: any[] = [];

        canvas.width = 900;
        canvas.height = 500;

        const polyPoints = [config.p1, config.p2, config.p3, config.p4];
        const SHAPES = ['circle', 'diamond', 'triangle', 'rect', 'x'] as const;

        class CyberRipple {
            x: number;
            y: number;
            life: number;
            maxLife: number;
            color: string;
            type: number;

            constructor(x: number, y: number, color: string) {
                this.x = x;
                this.y = y;
                this.life = 0;
                this.maxLife = 20;
                this.color = color;
                this.type = Math.floor(Math.random() * 3);
            }

            update() {
                this.life++;
                return this.life < this.maxLife;
            }

            draw(ctx: CanvasRenderingContext2D) {
                const progress = this.life / this.maxLife;
                const alpha = 1 - progress;
                const size = progress * 40;

                ctx.save();
                ctx.globalCompositeOperation = 'lighter';

                if (this.life < 5) {
                    ctx.fillStyle = '#ffffff';
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
                    ctx.fill();
                }

                ctx.strokeStyle = this.color;
                ctx.lineWidth = 2 * alpha;
                ctx.beginPath();
                ctx.arc(this.x, this.y, size, 0, Math.PI * 2);
                ctx.stroke();

                if (this.type > 0) {
                    ctx.strokeStyle = `rgba(255,255,255,${alpha * 0.5})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, size * 0.6, 0, Math.PI * 2);
                    ctx.stroke();
                }

                if (this.type === 2) {
                    const h = 20 * (1 - progress);
                    ctx.strokeStyle = `rgba(255,255,255,${alpha * 0.8})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(this.x, this.y - h);
                    ctx.lineTo(this.x, this.y + h);
                    ctx.stroke();
                }

                ctx.restore();
            }
        }

        class Particle {
            x: number;
            y: number;
            startX: number;
            startY: number;
            endX: number;
            endY: number;

            life: number;
            maxLife: number;
            size: number;
            alpha: number;
            shape: typeof SHAPES[number];

            spiralPhase: number;
            spiralFreq: number;
            spiralAmpMax: number;

            history: { x: number, y: number }[];
            distToTarget: number;
            dissolving: boolean;

            spin: number;
            spinSpeed: number;

            constructor() {
                const s = settingsRef.current; // Access current settings at birth

                const t = Math.random();
                const d = Math.random() * 0.15;

                const sx = config.p1.x + (config.p2.x - config.p1.x) * t;
                const sy = config.p1.y + (config.p2.y - config.p1.y) * t;

                const drift = (Math.random() - 0.5) * 0.5;
                const finalTx = config.p4.x + (config.p3.x - config.p4.x) * (t + drift);
                const finalTy = config.p4.y + (config.p3.y - config.p4.y) * (t + drift);

                this.startX = sx + (finalTx - sx) * d;
                this.startY = sy + (finalTy - sy) * d;
                this.endX = finalTx;
                this.endY = finalTy;

                this.x = this.startX;
                this.y = this.startY;

                this.life = 0;
                this.maxLife = 500 + Math.random() * 250; // Speed doubled (half life)

                // Varied Shapes - Size reduced to 0.3x
                this.shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
                this.size = this.shape === 'rect' || this.shape === 'x' ? 0.12 + Math.random() * 0.15 : 0.22 + Math.random() * 0.3;

                // Spiral Motion setup from Settings - Freq reduced 2x (1000 -> 2000)
                const freqBase = s.luminaSpiralFreq / 2000;
                const ampBase = s.luminaSpiralAmp;

                this.spiralPhase = Math.random() * Math.PI * 2;
                this.spiralFreq = freqBase + Math.random() * freqBase;
                this.spiralAmpMax = ampBase * (0.5 + Math.random());

                this.spin = Math.random() * Math.PI * 2;
                this.spinSpeed = (Math.random() - 0.5) * 0.1;

                this.history = [];
                this.distToTarget = 9999;
                this.dissolving = false;
                this.alpha = 0;
            }

            update() {
                this.life++;

                // Read real-time speed settings
                const s = settingsRef.current;
                const speedFactor = (s.luminaSpeedBase / 100) * (1 + (s.luminaSpeedVar / 100) * Math.random());
                // Note: random inside update causes jitter, should be prop. 
                // But simplified: assuming speed is controlled by global time step mostly. 
                // Let's stick to normalized progress logic, but speed affects life? No.
                // For simplicity, motion is progress based. Speed settings would ideally scale maxLife or step size.
                // Here, let's assume maxLife is fixed-ish, and we just follow the curve.

                if (this.dissolving) {
                    this.alpha -= 0.05;
                    this.size += 0.3;
                    this.x += (this.endX - this.startX) * 0.005;
                    this.y += (this.endY - this.startY) * 0.005;
                    return this.alpha > 0;
                }

                this.size += 0.005;
                this.spin += this.spinSpeed;

                if (this.life % 3 === 0) {
                    this.history.unshift({ x: this.x, y: this.y });
                    if (this.history.length > 16) this.history.pop(); // Trail double length
                }

                const p = this.life / this.maxLife;
                const easeP = p * p;

                const currentAxisX = this.startX + (this.endX - this.startX) * easeP;
                const currentAxisY = this.startY + (this.endY - this.startY) * easeP;

                const currentAmp = this.spiralAmpMax * (1 - easeP);

                const dx = this.endX - this.startX;
                const dy = this.endY - this.startY;
                const len = Math.sqrt(dx * dx + dy * dy);
                const perpX = -dy / len;
                const perpY = dx / len;

                const oscillation = Math.sin(this.life * this.spiralFreq + this.spiralPhase);

                this.x = currentAxisX + perpX * oscillation * currentAmp;
                this.y = currentAxisY + perpY * oscillation * currentAmp;

                this.distToTarget = Math.sqrt(Math.pow(this.endX - this.x, 2) + Math.pow(this.endY - this.y, 2));

                let baseAlpha = 1.0 - easeP * 0.3;
                if (this.life < 30) this.alpha = baseAlpha * (this.life / 30);
                else if (this.distToTarget < 15) this.alpha = (this.distToTarget / 15);
                else {
                    const inside = isPointInPoly({ x: this.x, y: this.y }, polyPoints);
                    if (!inside && this.distToTarget > 30) this.dissolving = true;
                    else this.alpha = baseAlpha;
                }

                return p < 1.0;
            }

            draw(ctx: CanvasRenderingContext2D) {
                if (this.history.length > 1 && !this.dissolving) {
                    ctx.beginPath();
                    ctx.moveTo(this.history[0].x, this.history[0].y);
                    for (let i = 1; i < this.history.length; i++) {
                        ctx.lineTo(this.history[i].x, this.history[i].y);
                    }
                    ctx.strokeStyle = color;
                    ctx.lineWidth = this.size * 0.2;
                    ctx.globalAlpha = this.alpha * 0.25; // Brighter trail
                    ctx.stroke();
                }

                ctx.globalAlpha = this.alpha * (this.dissolving ? 0.3 : 0.7);
                ctx.fillStyle = color;

                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(this.spin);

                const s = this.size;
                ctx.beginPath();

                if (this.shape === 'circle') {
                    ctx.arc(0, 0, s, 0, Math.PI * 2);
                } else if (this.shape === 'diamond') {
                    ctx.moveTo(0, -s); ctx.lineTo(s, 0); ctx.lineTo(0, s); ctx.lineTo(-s, 0);
                } else if (this.shape === 'triangle') {
                    ctx.moveTo(0, -s); ctx.lineTo(s, s); ctx.lineTo(-s, s);
                } else if (this.shape === 'rect') {
                    ctx.rect(-s / 2, -s, s, s * 2);
                } else if (this.shape === 'x') {
                    ctx.moveTo(-s, -s); ctx.lineTo(s, s);
                    ctx.moveTo(s, -s); ctx.lineTo(-s, s);
                    ctx.lineWidth = s * 0.4;
                    ctx.strokeStyle = color;
                    ctx.stroke();
                    ctx.restore();
                    return;
                }
                ctx.fill();
                ctx.restore();
            }
        }

        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const s = settingsRef.current; // Real-time settings

            // Continuous Emission
            if (particles.length < s.luminaParticleCount) {
                if (Math.random() < (s.luminaSpawnRate / 100)) particles.push(new Particle());
            }

            // Draw Glows
            ctx.globalCompositeOperation = 'lighter';
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                if (p.alpha > 0.05 && Number.isFinite(p.x) && !p.dissolving) {
                    const glowSize = p.size * (s.luminaGlowSize / 10);
                    if (Number.isFinite(glowSize) && glowSize > 0) {
                        try {
                            const glowGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowSize);
                            glowGrad.addColorStop(0, `${color}40`);
                            glowGrad.addColorStop(1, 'rgba(0,0,0,0)');
                            ctx.fillStyle = glowGrad;
                            ctx.beginPath();
                            ctx.arc(p.x, p.y, glowSize, 0, Math.PI * 2);
                            ctx.fill();
                        } catch (e) { }
                    }
                }
            }

            ctx.globalCompositeOperation = 'screen';
            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];
                const alive = p.update();

                if (!alive || (p.distToTarget < 5 && !p.dissolving)) {
                    // Interaction
                    if (p.distToTarget < 8 && Math.random() < (s.luminaRippleChance / 100)) {
                        flashes.push(new CyberRipple(p.x, p.y, color));
                    }
                    particles.splice(i, 1);
                } else {
                    p.draw(ctx);
                }
            }

            for (let i = flashes.length - 1; i >= 0; i--) {
                const f = flashes[i];
                if (!f.update()) {
                    flashes.splice(i, 1);
                } else {
                    f.draw(ctx);
                }
            }

            animationFrameId = requestAnimationFrame(render);
        };

        // PRE-WARM PARTICLES
        // Simulate 200 frames to fill the hull immediately
        for (let i = 0; i < 200; i++) {
            // Emission logic (simplified for pre-warm)
            if (particles.length < settingsRef.current.luminaParticleCount) {
                if (Math.random() < (settingsRef.current.luminaSpawnRate / 100)) {
                    const p = new Particle();
                    // Randomize life to avoid synchronized death
                    p.life = Math.floor(Math.random() * p.maxLife);
                    particles.push(p);
                }
            }
            // Update logic
            for (let j = particles.length - 1; j >= 0; j--) {
                const p = particles[j];
                const alive = p.update();
                if (!alive) particles.splice(j, 1);
            }
        }

        render();
        return () => cancelAnimationFrame(animationFrameId);
    }, [config, color]); // Removed settings from dep array to avoid reset

    return (
        <>
            <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none z-0">
                <defs>
                    <linearGradient id={`grad-blur-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="white" stopOpacity="0" />
                        <stop offset="25%" stopColor="white" stopOpacity="0.6" />
                        <stop offset="75%" stopColor="white" stopOpacity="0.6" />
                        <stop offset="100%" stopColor="white" stopOpacity="0" />
                    </linearGradient>

                    <filter id={`liquid-${id}`}>
                        <feTurbulence type="fractalNoise" baseFrequency="0.01" numOctaves="2" result="noise" seed={Math.random() * 100} />
                        <feDisplacementMap in="SourceGraphic" in2="noise" scale="15" />
                        <feGaussianBlur stdDeviation="4" />
                    </filter>

                    <mask id={`mask-${id}`}>
                        <path d={pathString} fill={`url(#grad-blur-${id})`} filter={`url(#liquid-${id})`} />
                    </mask>
                </defs>

                {/* 2. Main Body */}
                <path
                    d={pathString}
                    fill={color}
                    fillOpacity={0.42}
                    mask={`url(#mask-${id})`}
                    filter={`url(#liquid-${id})`}
                    style={{ mixBlendMode: 'screen', filter: 'blur(12px)' }}
                />

                {/* 3. Accent Edges */}
                <line x1={config.p3.x} y1={config.p3.y} x2={config.p4.x} y2={config.p4.y} stroke={color} strokeWidth={1} strokeOpacity={0.5} filter="blur(3px)" />

            </svg>

            <canvas
                ref={canvasRef}
                className="absolute inset-0 pointer-events-none z-10"
                style={{ mixBlendMode: 'screen' }}
            />
        </>
    );
}

export default LuminaHullComponent;