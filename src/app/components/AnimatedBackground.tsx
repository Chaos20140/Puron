import { useEffect, useRef } from "react";

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let animationId: number | null = null;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const isMobile = window.innerWidth < 768;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // 3D Network Sphere Particles
    const particleCount = isMobile ? 70 : 180;
    const particles: { x0: number; y0: number; z0: number; offset: number; size: number }[] = [];
    
    for (let i = 0; i < particleCount; i++) {
      // Distribute points uniformly on a sphere
      const phi = Math.acos(-1 + (2 * i) / particleCount);
      const theta = Math.sqrt(particleCount * Math.PI) * phi;
      
      const r = isMobile ? 350 : 600; // Radius of the sphere

      particles.push({
        x0: r * Math.cos(theta) * Math.sin(phi),
        y0: r * Math.sin(theta) * Math.sin(phi),
        z0: r * Math.cos(phi),
        offset: Math.random() * Math.PI * 2,
        size: Math.random() * 1.5 + 0.5
      });
    }

    // Foreground floating bokeh dust
    const dustCount = isMobile ? 15 : 30;
    const dust: { x: number; y: number; s: number; speedY: number; speedX: number; hue: number }[] = [];
    for (let i = 0; i < dustCount; i++) {
      dust.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        s: Math.random() * (isMobile ? 15 : 30) + 5,
        speedY: (Math.random() - 0.5) * 0.5 - 0.5,
        speedX: (Math.random() - 0.5) * 0.5,
        hue: 260 + Math.random() * 30
      });
    }

    const animate = () => {
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;
      time += 0.002;

      // Deep Space / Nebula Background Gradient
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 1.2);
      bgGrad.addColorStop(0, "#1A0B2E"); // Deep saturated purple in center
      bgGrad.addColorStop(0.4, "#0A0514"); // Darker
      bgGrad.addColorStop(1, "#020104"); // Almost pitch black at edges
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      ctx.globalCompositeOperation = "screen";

      // Soft Abstract Auroras — the wavy sine bands. Skipped on mobile per
      // user request (they read as distracting "waves" on small screens);
      // the sphere network + dust carry the backdrop there.
      if (!isMobile) {
        const curves = [
          { hue: 270, amplitude: h * 0.25, yOffset: h * 0.3, speed: 0.8, frequency: 0.0015 },
          { hue: 285, amplitude: h * 0.3, yOffset: h * 0.6, speed: 0.5, frequency: 0.001 },
          { hue: 260, amplitude: h * 0.2, yOffset: h * 0.8, speed: 1.1, frequency: 0.002 },
        ];

        curves.forEach((curve, i) => {
          ctx.beginPath();
          for (let x = 0; x <= w; x += 50) {
            const y = curve.yOffset + Math.sin(x * curve.frequency + time * curve.speed + i) * curve.amplitude;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.lineWidth = 120;
          ctx.strokeStyle = `hsla(${curve.hue}, 90%, 60%, 0.03)`;
          ctx.stroke();

          // Inner brighter core of the aurora
          ctx.lineWidth = 60;
          ctx.strokeStyle = `hsla(${curve.hue}, 90%, 70%, 0.04)`;
          ctx.stroke();
        });
      }

      // 3D Rotating Sphere Network
      const projected: { x: number; y: number; z: number; size: number }[] = [];
      const rotationX = time * 0.5;
      const rotationY = time * 0.8;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        
        // Slight organic undulation
        const wave = Math.sin(time * 5 + p.offset) * 20;
        
        let x = p.x0;
        let y = p.y0 + wave;
        let z = p.z0;

        // 3D Rotations
        const cosY = Math.cos(rotationY);
        const sinY = Math.sin(rotationY);
        const tempX = x * cosY - z * sinY;
        const tempZ = x * sinY + z * cosY;
        x = tempX;
        z = tempZ;

        const cosX = Math.cos(rotationX);
        const sinX = Math.sin(rotationX);
        const tempY = y * cosX - z * sinX;
        z = y * sinX + z * cosX;
        y = tempY;

        // Push away from camera
        z += isMobile ? 1000 : 1200;

        // Perspective Projection
        const fov = 1000;
        const scale = fov / z;
        const x2d = x * scale + cx;
        const y2d = y * scale + cy;

        projected.push({ x: x2d, y: y2d, z, size: p.size * scale });
      }

      // Draw Network Connections
      const connectDistance = isMobile ? 120 : 160;
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const p1 = projected[i];
          const p2 = projected[j];
          
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < connectDistance * connectDistance) {
            const dist = Math.sqrt(distSq);
            // Opacity based on distance and depth (z)
            const opacity = (1 - dist / connectDistance) * 0.4;
            const depthOpacity = Math.max(0, Math.min(1, 1500 / p1.z));
            const finalAlpha = opacity * depthOpacity;
            
            if (finalAlpha > 0.01) {
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              
              // Gradient line for a glowing energy effect
              const grad = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
              grad.addColorStop(0, `rgba(168, 85, 247, ${finalAlpha})`); // #A855F7
              grad.addColorStop(1, `rgba(124, 58, 237, ${finalAlpha})`); // #7C3AED
              
              ctx.strokeStyle = grad;
              ctx.lineWidth = isMobile ? 0.5 : 1;
              ctx.stroke();
            }
          }
        }
      }

      // Draw Sphere Nodes
      for (let i = 0; i < projected.length; i++) {
        const p = projected[i];
        const depthOpacity = Math.max(0, Math.min(1, 1200 / p.z));
        
        if (depthOpacity > 0.01 && p.x > -50 && p.x < w + 50 && p.y > -50 && p.y < h + 50) {
          // Core
          ctx.beginPath();
          ctx.arc(p.x, p.y, Math.max(0.1, p.size), 0, Math.PI * 2);
          ctx.fillStyle = `rgba(245, 245, 247, ${depthOpacity * 0.9})`; // #F5F5F7
          ctx.fill();

          // Outer Glow
          ctx.beginPath();
          ctx.arc(p.x, p.y, Math.max(0.1, p.size * 3), 0, Math.PI * 2);
          ctx.fillStyle = `rgba(168, 85, 247, ${depthOpacity * 0.4})`; // #A855F7
          ctx.fill();
        }
      }

      // Foreground Floating Bokeh Dust
      ctx.globalCompositeOperation = "lighten";
      for (let i = 0; i < dust.length; i++) {
        const d = dust[i];
        d.x += d.speedX;
        d.y += d.speedY;

        // Wrap around
        if (d.x < -100) d.x = w + 100;
        if (d.x > w + 100) d.x = -100;
        if (d.y < -100) d.y = h + 100;
        if (d.y > h + 100) d.y = -100;

        const twinkle = 0.5 + Math.sin(time * 10 + i) * 0.5;
        
        const grad = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, d.s);
        grad.addColorStop(0, `hsla(${d.hue}, 80%, 70%, ${0.15 * twinkle})`);
        grad.addColorStop(1, `hsla(${d.hue}, 80%, 70%, 0)`);

        ctx.beginPath();
        ctx.arc(d.x, d.y, d.s, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";

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

    if (prefersReducedMotion) {
      // One static frame, no rAF loop — respects WCAG 2.3.3.
      animate();
      stop();
    } else {
      start();
    }

    // Pause the loop when the tab is hidden — saves battery and avoids
    // background-throttle stutter when the tab regains focus.
    const onVisibility = () => {
      if (prefersReducedMotion) return;
      if (document.hidden) stop();
      else start();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-screen pointer-events-none"
      // z-index: 0 (NOT -1). The body has a dark background to prevent the
      // white-flash on initial load (set in index.html and theme.css). A
      // negative z-index would push the canvas behind that body background
      // and make it invisible. z-0 stays above the body bg but below the
      // navigation (z-50) and page content (z-10) above it.
      style={{ zIndex: 0 }}
    />
  );
}
