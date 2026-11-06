import { useEffect, useRef } from "react";

type TideProps = {
  /** hero：满幅、较大振幅，星随指针；footer：低调背景 */
  variant?: "hero" | "footer";
  className?: string;
};

const TIDE = "95, 208, 214";

function star(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  const k = 0.16; // 内凹程度，越小越尖
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.quadraticCurveTo(x + r * k, y - r * k, x + r, y);
  ctx.quadraticCurveTo(x + r * k, y + r * k, x, y + r);
  ctx.quadraticCurveTo(x - r * k, y + r * k, x - r, y);
  ctx.quadraticCurveTo(x - r * k, y - r * k, x, y - r);
  ctx.closePath();
}

/**
 * 潮线：多条正弦叠加的细线，近处更亮更大。星沿着潮面漂移（hero 下跟随指针横向位置）。
 * 离开视口暂停；减少动态效果时只绘制静态一帧。
 */
export function TideCanvas({ variant = "hero", className }: TideProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const hero = variant === "hero";
    const LINES = hero ? 22 : 12;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0;
    let h = 0;
    let raf = 0;
    let running = false;
    let t = reduced ? 6 : 0;
    let last = 0;
    let pointerX = 0.74;
    let starX = 0.74;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width;
      h = rect.height;
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    };

    const lineY = (i: number, x: number) => {
      const p = i / (LINES - 1); // 0 远 → 1 近
      const base = h * (hero ? 0.66 : 0.35) + Math.pow(p, 1.35) * h * (hero ? 0.3 : 0.58);
      const amp = (hero ? 8 : 6) + p * (hero ? 38 : 22);
      const k = (hero ? 0.0042 : 0.0036) * (1 - p * 0.35);
      return (
        base +
        amp * Math.sin(x * k + t * (0.5 + p * 0.5) + i * 0.38) +
        amp * 0.45 * Math.sin(x * k * 2.1 - t * 0.7 + i * 0.9)
      );
    };

    function draw() {
      ctx!.clearRect(0, 0, w, h);
      const step = 6;

      for (let i = 0; i < LINES; i++) {
        const p = i / (LINES - 1);
        ctx!.beginPath();
        for (let x = -step; x <= w + step; x += step) {
          const y = lineY(i, x);
          if (x === -step) ctx!.moveTo(x, y);
          else ctx!.lineTo(x, y);
        }
        const alpha = (hero ? 0.1 : 0.07) + Math.pow(p, 1.6) * (hero ? 0.62 : 0.34);
        ctx!.strokeStyle = `rgba(${TIDE}, ${alpha})`;
        ctx!.lineWidth = 0.6 + p * 1.1;
        ctx!.stroke();
      }

      if (!hero) return;

      // 星：落在第 LINES-5 条潮线上，随指针缓动
      const sx = starX * w;
      const sy = lineY(LINES - 5, sx) - 26;
      const pulse = reduced ? 1 : 0.88 + 0.12 * Math.sin(t * 2.2);
      const glow = ctx!.createRadialGradient(sx, sy, 0, sx, sy, 90);
      glow.addColorStop(0, `rgba(${TIDE}, ${0.34 * pulse})`);
      glow.addColorStop(1, `rgba(${TIDE}, 0)`);
      ctx!.fillStyle = glow;
      ctx!.fillRect(sx - 90, sy - 90, 180, 180);
      star(ctx!, sx, sy, 17 * pulse);
      ctx!.fillStyle = "#e6f1f4";
      ctx!.fill();
    }

    const frame = (now: number) => {
      if (!running) return;
      const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
      last = now;
      t += dt * (hero ? 0.9 : 0.55);
      starX += (pointerX - starX) * Math.min(1, dt * 2.4);
      draw();
      raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (reduced || running) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const onPointer = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointerX = Math.min(0.92, Math.max(0.08, (e.clientX - rect.left) / rect.width));
    };

    const io = new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()));
    const ro = new ResizeObserver(resize);
    io.observe(canvas);
    ro.observe(canvas);
    if (hero) window.addEventListener("pointermove", onPointer, { passive: true });
    resize();

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("pointermove", onPointer);
    };
  }, [variant]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
