"use client";

import React, { useEffect, useRef } from "react";

export default function Fireworks() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (canvas) {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
      }
    };
    window.addEventListener("resize", handleResize);

    // Color palette matching the style guide and celebratory themes
    const COLORS = [
      "#0052FF", // Electric Blue
      "#4D7CFF", // Accent Secondary
      "#FF0052", // Vibrant Magenta
      "#00FF85", // Neon Green
      "#FFCE00", // Yellow Glow
      "#D946EF", // Fuchsia
      "#06B6D4"  // Cyan
    ];

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      alpha: number;
      color: string;
      radius: number;
      decay: number;

      constructor(x: number, y: number, color: string) {
        this.x = x;
        this.y = y;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 6 + 2;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed - Math.random() * 2; // Initial push up
        this.alpha = 1;
        this.color = color;
        this.radius = Math.random() * 2.5 + 1;
        this.decay = Math.random() * 0.012 + 0.008;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.08; // Gravity downwards
        this.vx *= 0.98; // Air resistance drag
        this.vy *= 0.98;
        this.alpha -= this.decay;
      }

      draw(c: CanvasRenderingContext2D) {
        c.save();
        c.globalAlpha = this.alpha;
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        c.fillStyle = this.color;
        c.shadowBlur = 10;
        c.shadowColor = this.color;
        c.fill();
        c.restore();
      }
    }

    class FireworkRocket {
      x: number;
      y: number;
      tx: number;
      ty: number;
      vx: number;
      vy: number;
      color: string;
      exploded: boolean;

      constructor() {
        this.x = Math.random() * (width * 0.8) + width * 0.1;
        this.y = height;
        this.tx = Math.random() * (width * 0.8) + width * 0.1;
        this.ty = Math.random() * (height * 0.5) + height * 0.1; // Target high
        
        const angle = Math.atan2(this.ty - this.y, this.tx - this.x);
        const speed = Math.random() * 4 + 11;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        
        this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
        this.exploded = false;
      }

      update(particles: Particle[]) {
        this.x += this.vx;
        this.y += this.vy;
        
        // Explode if it is moving downwards or hits target altitude threshold
        if (this.vy >= -1 || Math.abs(this.y - this.ty) < 20) {
          this.exploded = true;
          // Spawn burst of particles
          const burstSize = Math.floor(Math.random() * 40) + 60;
          for (let i = 0; i < burstSize; i++) {
            particles.push(new Particle(this.x, this.y, this.color));
          }
        }
      }

      draw(c: CanvasRenderingContext2D) {
        c.save();
        c.beginPath();
        c.arc(this.x, this.y, 4, 0, Math.PI * 2);
        c.fillStyle = this.color;
        c.shadowBlur = 12;
        c.shadowColor = this.color;
        c.fill();
        c.restore();
      }
    }

    let particles: Particle[] = [];
    let rockets: FireworkRocket[] = [];

    const loop = () => {
      // Semi-transparent overlay to create elegant motion trail paths
      ctx.fillStyle = "rgba(15, 23, 42, 0.2)";
      ctx.fillRect(0, 0, width, height);

      // Launch rockets selectively
      if (Math.random() < 0.04 && rockets.length < 4) {
        rockets.push(new FireworkRocket());
      }

      rockets = rockets.filter((r) => {
        r.update(particles);
        if (!r.exploded) {
          r.draw(ctx);
          return true;
        }
        return false;
      });

      particles = particles.filter((p) => {
        p.update();
        if (p.alpha > 0) {
          p.draw(ctx);
          return true;
        }
        return false;
      });

      animationFrameId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50 w-full h-full"
      style={{ mixBlendMode: "screen" }}
    />
  );
}
