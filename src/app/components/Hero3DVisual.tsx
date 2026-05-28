import { useEffect, useRef } from "react";
import { motion } from "motion/react";

type ProcessedPoint = {
    x: number;
    y: number;
    depth: number;
    hue: number;
    alpha: number;
    size: number;
    glow: boolean;
};

type ProcessedRing = {
    points: [number, number, number][]; // x, y, depth
    hue: number;
    alpha: number;
    avgDepth?: number;
    lineWidth?: number;
};

export function Hero3DVisual() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number | null = null;
    let time = 0;

    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    };
    resize();
    window.addEventListener("resize", resize);

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Create 3D geometries for Solar System elements
    const ringNodes = 120;
    const ringGeometry: number[][] = [];
    for (let i = 0; i < ringNodes; i++) {
      const angle = (i / ringNodes) * Math.PI * 2;
      ringGeometry.push([Math.cos(angle), Math.sin(angle), 0]);
    }

    const sphereNodes = 120;
    const sphereGeometry: number[][] = [];
    const goldenRatio = (1 + Math.sqrt(5)) / 2;
    for (let i = 0; i < sphereNodes; i++) {
      const t = i / sphereNodes;
      const inc1 = Math.acos(1 - 2 * t);
      const inc2 = Math.PI * 2 * i / goldenRatio;
      sphereGeometry.push([
        Math.sin(inc1) * Math.cos(inc2),
        Math.sin(inc1) * Math.sin(inc2),
        Math.cos(inc1)
      ]);
    }

    const animate = () => {
      const w = canvas.width;
      const h = canvas.height;
      time += 0.005;

      ctx.clearRect(0, 0, w, h);

      const cxScreen = w * 0.5;
      const cyScreen = h * 0.5;
      const screenScale = Math.min(w, h) * 0.35;

      // Dynamic whole-system tilt and rotation
      const systemRx = 0.6 + Math.sin(time * 0.5) * 0.1; 
      const systemRy = time * 0.2; 

      // Function to scale, rotate and project 3D points
      const processGeometry = (
        geom: number[][],
        tx: number, ty: number, tz: number,
        s: number,
        rx: number, ry: number, rz: number
      ): [number, number, number][] => {
        return geom.map(v => {
          // Local rotation (e.g. planet spinning)
          const cx = Math.cos(rx), sx = Math.sin(rx);
          const y1 = v[1] * cx - v[2] * sx;
          const z1 = v[1] * sx + v[2] * cx;

          const cy = Math.cos(ry), sy = Math.sin(ry);
          const x2 = v[0] * cy + z1 * sy;
          const z2 = -v[0] * sy + z1 * cy;

          const cz = Math.cos(rz), sz = Math.sin(rz);
          const x3 = x2 * cz - y1 * sz;
          const y3 = x2 * sz + y1 * cz;

          // Scale & Translate to orbit position
          const x4 = x3 * s + tx;
          const y4 = y3 * s + ty;
          const z4 = z2 * s + tz;

          // System Rotation
          const cxSys = Math.cos(systemRx), sxSys = Math.sin(systemRx);
          const y5 = y4 * cxSys - z4 * sxSys;
          const z5 = y4 * sxSys + z4 * cxSys;

          const cySys = Math.cos(systemRy), sySys = Math.sin(systemRy);
          const x6 = x4 * cySys + z5 * sySys;
          const z6 = -x4 * sySys + z5 * cySys;
          
          // Perspective Projection
          const fov = 4;
          const depth = fov / (fov + z6);
          return [cxScreen + x6 * screenScale * depth, cyScreen + y5 * screenScale * depth, depth];
        });
      };

      const ringsToDraw: ProcessedRing[] = [];
      const pointsToDraw: ProcessedPoint[] = [];

      // Add Sun (Central Star)
      const sunProj = processGeometry(sphereGeometry, 0, 0, 0, 0.45, time * 0.5, time * 0.7, 0);
      sunProj.forEach(p => {
          pointsToDraw.push({
              x: p[0], y: p[1], depth: p[2],
              hue: 265, alpha: 1, size: 2.5, glow: true
          });
      });

      // Define Planets (distance, orbit speed, size scale, color hue)
      const planets = [
         { dist: 1.0, speed: 1.2, scale: 0.06, hue: 280 },
         { dist: 1.5, speed: 0.8, scale: 0.1, hue: 250 },
         { dist: 2.2, speed: 0.5, scale: 0.16, hue: 270 },
         { dist: 3.1, speed: 0.3, scale: 0.12, hue: 290 },
      ];

      planets.forEach((p, i) => {
         const angle = time * p.speed + (i * Math.PI / 1.5);
         const tx = Math.cos(angle) * p.dist;
         const tz = Math.sin(angle) * p.dist;
         
         // Orbit Path Ring
         const ringProj = processGeometry(ringGeometry, 0, 0, 0, p.dist, Math.PI / 2, 0, 0);
         ringsToDraw.push({
             points: ringProj,
             hue: p.hue,
             alpha: 0.15,
             lineWidth: 1
         });

         // Planet Sphere
         const planetProj = processGeometry(sphereGeometry, tx, 0, tz, p.scale, time * 2, time * 2, 0);
         planetProj.forEach(pt => {
             pointsToDraw.push({
                 x: pt[0], y: pt[1], depth: pt[2],
                 hue: p.hue, alpha: 0.9, size: 1.8, glow: false
             });
         });
         
         // Add Moon to the second planet
         if (i === 1) {
             const moonDist = 0.3;
             const moonAngle = time * 3;
             const mtx = tx + Math.cos(moonAngle) * moonDist;
             const mtz = tz + Math.sin(moonAngle) * moonDist;
             const mty = Math.sin(moonAngle) * moonDist * 0.3; // Tilted moon orbit

             const moonRingProj = processGeometry(ringGeometry, tx, 0, tz, moonDist, Math.PI / 2, Math.PI / 8, 0);
             ringsToDraw.push({
                 points: moonRingProj,
                 hue: 240,
                 alpha: 0.2,
                 lineWidth: 0.5
             });

             const moonProj = processGeometry(sphereGeometry, mtx, mty, mtz, 0.03, time * 3, time * 3, 0);
             moonProj.forEach(pt => {
                 pointsToDraw.push({
                     x: pt[0], y: pt[1], depth: pt[2],
                     hue: 240, alpha: 0.8, size: 1.2, glow: false
                 });
             });
         }

         // Add Saturn-like rings to the third planet
         if (i === 2) {
             const saturnRingProj = processGeometry(ringGeometry, tx, 0, tz, p.scale * 1.8, Math.PI / 2 + 0.4, 0.2, 0);
             ringsToDraw.push({
                 points: saturnRingProj,
                 hue: p.hue,
                 alpha: 0.3,
                 lineWidth: 2
             });
             const saturnRingProj2 = processGeometry(ringGeometry, tx, 0, tz, p.scale * 2.1, Math.PI / 2 + 0.4, 0.2, 0);
             ringsToDraw.push({
                 points: saturnRingProj2,
                 hue: p.hue,
                 alpha: 0.15,
                 lineWidth: 1
             });
         }
      });

      // Render all rings (orbits & planetary rings)
      ringsToDraw.forEach(r => {
          r.avgDepth = r.points.reduce((acc, p) => acc + p[2], 0) / r.points.length;
      });
      // Sort to faintly blend far rings behind front elements
      ringsToDraw.sort((a, b) => (a.avgDepth || 0) - (b.avgDepth || 0));

      ringsToDraw.forEach(r => {
          ctx.beginPath();
          if (r.points.length > 0) {
              ctx.moveTo(r.points[0][0], r.points[0][1]);
              for (let i = 1; i < r.points.length; i++) {
                  ctx.lineTo(r.points[i][0], r.points[i][1]);
              }
              ctx.closePath();
              ctx.strokeStyle = `hsla(${r.hue}, 80%, 70%, ${r.alpha})`;
              ctx.lineWidth = r.lineWidth || 1;
              ctx.stroke();
          }
      });

      // Render all points (Suns, Planets, Moons)
      pointsToDraw.sort((a, b) => a.depth - b.depth);

      pointsToDraw.forEach(p => {
          const size = p.size * p.depth;
          const alpha = Math.min(1, p.depth * p.alpha);
          
          ctx.beginPath();
          ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${p.hue}, 80%, 65%, ${alpha})`;
          ctx.fill();
          
          // Extra glow effect for the central star
          if (p.glow && p.depth > 0.8) {
              ctx.beginPath();
              ctx.arc(p.x, p.y, size * 4, 0, Math.PI * 2);
              ctx.fillStyle = `hsla(${p.hue}, 80%, 65%, ${alpha * 0.1})`;
              ctx.fill();
              
              ctx.beginPath();
              ctx.arc(p.x, p.y, size * 8, 0, Math.PI * 2);
              ctx.fillStyle = `hsla(${p.hue}, 80%, 65%, ${alpha * 0.05})`;
              ctx.fill();
          }
      });

      animationId = requestAnimationFrame(animate);
    };

    const start = () => {
      if (animationId === null) animate();
    };
    const stop = () => {
      if (animationId !== null) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
    };

    // Only run while the canvas is actually on screen AND the tab is visible.
    // This stops the loop once the hero scrolls away (smoother scrolling
    // through the rest of the page) and on mobile, where the canvas is
    // display:none (lg+ only) but the rAF would otherwise still spin.
    let onScreen = true;
    const sync = () => {
      if (prefersReducedMotion) return;
      if (document.hidden || !onScreen) stop();
      else start();
    };

    if (prefersReducedMotion) {
      animate();
      stop();
    } else {
      start();
    }

    const io = new IntersectionObserver((entries) => {
      onScreen = entries[0]?.isIntersecting ?? true;
      sync();
    });
    io.observe(canvas);

    document.addEventListener("visibilitychange", sync);

    return () => {
      stop();
      io.disconnect();
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5, delay: 0.3 }}
      className="relative hidden lg:flex h-[500px] w-full items-center justify-center"
    >
      <div className="absolute inset-0 z-0 bg-gradient-to-tr from-[#8B5CF6]/5 to-transparent rounded-[3rem] blur-3xl" />
      <canvas
        ref={canvasRef}
        className="w-full h-full relative z-10"
        style={{ pointerEvents: 'none' }}
      />
    </motion.div>
  );
}
