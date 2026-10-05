import { useEffect, useRef, useState } from 'react';

type DataPortraitProps = {
  src: string;
  alt: string;
  /** Intrinsic image size, used to reserve layout space before load */
  width: number;
  height: number;
};

const STEEL = '215, 226, 234';
const PATCH_COLS = 24; // ViT-style patch grid across the portrait
const AURA_COLS = 64; // finer grid for the binary aura
const INTRO_MS = 2400;
const MOSAIC_LEVELS = [36, 22, 13, 7]; // coarse -> fine block counts across the width
const TOP_K = 4;
const MAX_HEAT = 26; // most patches lit at once
const ATTN_SIGMA = 0.11;
const THINK_CYCLE_MS = 3600; // one autonomous attention 'glance'
const THINK_STRENGTH = 0.55; // dimmer than a real hover // feature-space width of the attention softmax (smaller = more selective)

// Attention colour ramp, built from the site's gradient (violet -> magenta -> orange -> warm white)
const RAMP: [number, number, number, number][] = [
  [0, 118, 33, 176],
  [0.45, 182, 0, 168],
  [0.75, 230, 90, 40],
  [1, 255, 214, 150],
];

type Patch = { x: number; y: number; r: number; g: number; b: number; a: number; inside: boolean; f: number[] };
type AuraCell = { x: number; y: number; strength: number; seed: number };

const smooth = (e0: number, e1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};

const rampColor = (t: number) => {
  for (let i = 1; i < RAMP.length; i++) {
    if (t <= RAMP[i][0]) {
      const [t0, r0, g0, b0] = RAMP[i - 1];
      const [t1, r1, g1, b1] = RAMP[i];
      const k = (t - t0) / (t1 - t0);
      return [r0 + (r1 - r0) * k, g0 + (g1 - g0) * k, b0 + (b1 - b0) * k].map((v) => v | 0).join(', ');
    }
  }
  return RAMP[RAMP.length - 1].slice(1).join(', ');
};

// Portrait that resolves in coarse-to-fine, keeps a faint binary aura, and on hover
// shows a Vision-Transformer-style attention map for the patch under the cursor.
// The <img> stays the real, accessible photo; the canvas only adds the effects.
export default function DataPortrait({ src, alt, width, height }: DataPortraitProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engagedRef = useRef(false);
  const [engaged, setEngaged] = useState(false);

  useEffect(() => {
    const wrap = wrapRef.current;
    const photo = imgRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!wrap || !photo || !canvas || !ctx) return;

    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    let w = 0;
    let h = 0;
    let patch = 0;
    let pCols = 0;
    let pRows = 0;
    let patches: Patch[] = [];
    let aura: AuraCell[] = [];
    let auraCell = 0;
    let mosaics: HTMLCanvasElement[] = [];
    let start = 0;
    let last = 0;
    let hover = 0; // eased 0..1
    let raf = 0;
    let idleTimer: ReturnType<typeof setTimeout> | 0 = 0;
    let visible = true;
    let disposed = false;
    const mouse = { x: -1e4, y: -1e4, inside: false };
    let lastQ = { x: 0, y: 0 };
    let salient: { x: number; y: number }[] = [];
    let thinkQuery: { x: number; y: number } | null = null;
    let thinkStart = 0;
    let tapUntil = 0; // touch: a tap pins the attention map briefly
    const img = new Image();

    // Next autonomous query: a salient patch reasonably far from the previous one
    const pickThinkQuery = (prev: { x: number; y: number } | null) => {
      const pool = prev ? salient.filter((c) => Math.hypot(c.x - prev.x, c.y - prev.y) > 3) : salient;
      const from = pool.length ? pool : salient;
      return from.length ? from[(Math.random() * from.length) | 0] : null;
    };

    const downsample = (cols: number, rows: number) => {
      const off = document.createElement('canvas');
      off.width = cols;
      off.height = rows;
      const octx = off.getContext('2d', { willReadFrequently: true });
      octx?.drawImage(img, 0, 0, cols, rows);
      return { off, data: octx?.getImageData(0, 0, cols, rows).data };
    };

    const sample = () => {
      w = wrap.clientWidth;
      if (!w || !img.naturalWidth) return;
      h = Math.round((w * img.naturalHeight) / img.naturalWidth);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Patch grid: per-patch feature vector (colour, texture, edge direction) from 4x4 sub-samples
      patch = w / PATCH_COLS;
      pCols = PATCH_COLS;
      pRows = Math.ceil(h / patch);
      const S = 4;
      const sCols = pCols * S;
      const pd = downsample(sCols, pRows * S).data;
      patches = [];
      if (pd) {
        const lumAt = (sx: number, sy: number) => {
          const i = (sy * sCols + sx) * 4;
          return (0.2126 * pd[i] + 0.7152 * pd[i + 1] + 0.0722 * pd[i + 2]) / 255;
        };
        for (let y = 0; y < pRows; y++) {
          for (let x = 0; x < pCols; x++) {
            let r = 0, g = 0, b = 0, a = 0, l = 0, l2 = 0, gx = 0, gy = 0;
            for (let sy = 0; sy < S; sy++) {
              for (let sx = 0; sx < S; sx++) {
                const px = x * S + sx;
                const py = y * S + sy;
                const i = (py * sCols + px) * 4;
                r += pd[i]; g += pd[i + 1]; b += pd[i + 2]; a += pd[i + 3];
                const lum = lumAt(px, py);
                l += lum; l2 += lum * lum;
                if (sx < S - 1) gx += Math.abs(lumAt(px + 1, py) - lum);
                if (sy < S - 1) gy += Math.abs(lumAt(px, py + 1) - lum);
              }
            }
            const n = S * S;
            const mean = l / n;
            const std = Math.sqrt(Math.max(0, l2 / n - mean * mean));
            const edges = S * (S - 1);
            const alpha = a / n / 255;
            patches.push({
              x, y, r: r / n, g: g / n, b: b / n, a: alpha, inside: alpha > 0.55,
              f: [(r / n / 255) * 0.6, (g / n / 255) * 0.6, (b / n / 255) * 0.6, std * 2.5, (gx / edges) * 3, (gy / edges) * 3],
            });
          }
        }
      }

      // Salient patches (high texture / edges, upper body only) for the thinking pulse
      salient = patches
        .filter((p) => p.inside && p.y < pRows * 0.62)
        .sort((a, b) => b.f[3] + b.f[4] + b.f[5] - (a.f[3] + a.f[4] + a.f[5]))
        .slice(0, 24)
        .map(({ x, y }) => ({ x, y }));
      thinkQuery = pickThinkQuery(null);

      // Aura: fine cells just outside the silhouette, stronger the closer they are
      auraCell = w / AURA_COLS;
      const aCols = AURA_COLS;
      const aRows = Math.ceil(h / auraCell);
      const ad = downsample(aCols, aRows).data;
      aura = [];
      if (ad) {
        const alphaAt = (x: number, y: number) => (x < 0 || y < 0 || x >= aCols || y >= aRows ? 0 : ad[(y * aCols + x) * 4 + 3] / 255);
        const R = 3;
        for (let y = 0; y < aRows; y++) {
          for (let x = 0; x < aCols; x++) {
            if (alphaAt(x, y) >= 0.1) continue;
            let sum = 0;
            for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) sum += alphaAt(x + dx, y + dy);
            const strength = Math.min(1, (sum / (2 * R + 1) ** 2) * 2.4);
            if (strength > 0.02) aura.push({ x, y, strength, seed: Math.random() });
          }
        }
      }

      // Coarse-to-fine mosaics for the intro
      mosaics = MOSAIC_LEVELS.map((n) => downsample(n, Math.max(1, Math.round((n * h) / w))).off);
    };

    const drawIntro = (raw: number) => {
      // Step through the mosaic levels, then fade to the real photo
      const level = Math.min(MOSAIC_LEVELS.length - 1, Math.floor(smooth(0, 0.8, raw) * MOSAIC_LEVELS.length));
      const fade = 1 - smooth(0.72, 1, raw);
      photo.style.opacity = String(smooth(0.6, 1, raw));
      if (fade <= 0.01) return;
      ctx.save();
      ctx.globalAlpha = fade;
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(mosaics[level], 0, 0, w, h);
      ctx.restore();
    };

    const drawAura = (now: number, amount: number) => {
      if (amount <= 0.01) return;
      const tick = Math.floor(now / 140);
      ctx.font = `600 ${Math.round(auraCell * 1.05)}px ui-monospace, 'Cascadia Code', Consolas, Menlo, monospace`;
      for (const c of aura) {
        if (!reduceMotion && (tick + Math.floor(c.seed * 53)) % 9 >= 5) continue;
        const bit = (tick >> 2) + Math.floor(c.seed * 1000);
        ctx.fillStyle = `rgba(${STEEL}, ${(amount * c.strength * 0.42 * (0.55 + c.seed * 0.45)).toFixed(3)})`;
        ctx.fillText(bit % 2 ? '1' : '0', c.x * auraCell + auraCell / 2, c.y * auraCell + auraCell / 2);
      }
    };

    const drawAttention = (qx: number, qy: number, amt: number, withLabel: boolean) => {
      if (amt <= 0.01) return;
      const q = patches[qy * pCols + qx];
      if (!q || !q.inside) return;

      // Attention ~ softmax over feature similarity, mildly biased toward nearby patches
      const raw = patches.map((p) => {
        if (!p.inside) return 0;
        let d2 = 0;
        for (let k = 0; k < p.f.length; k++) d2 += (p.f[k] - q.f[k]) ** 2;
        const dist = Math.hypot(p.x - qx, p.y - qy) / pCols;
        return Math.exp(-d2 / (2 * ATTN_SIGMA ** 2)) * (0.45 + 0.55 * Math.exp(-((dist / 0.35) ** 2)));
      });
      const peak = Math.max(1e-6, ...raw.map((v, i) => (i === qy * pCols + qx ? 0 : v)));
      const weights = raw.map((v, i) => (i === qy * pCols + qx ? 1 : Math.min(1, v / peak)));

      // Keep the map sparse: only the strongest MAX_HEAT patches are drawn
      const cutoff = Math.max(0.18, [...weights].sort((a, b) => b - a)[MAX_HEAT - 1] ?? 0);

      ctx.save();
      // Heat: only patches that clearly attend
      ctx.globalCompositeOperation = 'screen';
      patches.forEach((p, i) => {
        const wgt = weights[i];
        if (wgt < cutoff) return;
        const t = (wgt - 0.18) / 0.82;
        ctx.fillStyle = `rgba(${rampColor(t)}, ${(amt * 0.6 * t ** 0.8).toFixed(3)})`;
        ctx.fillRect(p.x * patch, p.y * patch, patch, patch);
      });
      ctx.globalCompositeOperation = 'source-over';

      // Patch grid, fading out away from the cursor
      ctx.lineWidth = 1;
      patches.forEach((p) => {
        if (!p.inside) return;
        const near = 1 - smooth(1.5, 5, Math.hypot(p.x - qx, p.y - qy));
        if (near <= 0) return;
        ctx.strokeStyle = `rgba(${STEEL}, ${(amt * 0.16 * near).toFixed(3)})`;
        ctx.strokeRect(p.x * patch + 0.5, p.y * patch + 0.5, patch - 1, patch - 1);
      });

      // Links from the query to its strongest far-away matches
      const qcx = (qx + 0.5) * patch;
      const qcy = (qy + 0.5) * patch;
      const top = patches
        .map((p, i) => ({ p, wgt: weights[i] }))
        .filter(({ p }) => Math.hypot(p.x - qx, p.y - qy) > 2.5)
        .sort((a, b) => b.wgt - a.wgt)
        .slice(0, TOP_K);
      top.forEach(({ p, wgt }) => {
        const tx = (p.x + 0.5) * patch;
        const ty = (p.y + 0.5) * patch;
        const mx = (qcx + tx) / 2;
        const my = Math.min(qcy, ty) - Math.hypot(tx - qcx, ty - qcy) * 0.25;
        ctx.strokeStyle = `rgba(${STEEL}, ${(amt * (0.25 + 0.5 * wgt)).toFixed(3)})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(qcx, qcy);
        ctx.quadraticCurveTo(mx, my, tx, ty);
        ctx.stroke();
        ctx.strokeRect(p.x * patch + 1.5, p.y * patch + 1.5, patch - 3, patch - 3);
      });

      // Query patch
      ctx.strokeStyle = `rgba(255, 255, 255, ${(amt * 0.95).toFixed(3)})`;
      ctx.lineWidth = 1.6;
      ctx.strokeRect(qx * patch + 1, qy * patch + 1, patch - 2, patch - 2);

      if (!withLabel) {
        ctx.restore();
        return;
      }

      // Readout
      const fs = Math.max(9, Math.round(patch * 0.42));
      ctx.font = `600 ${fs}px ui-monospace, 'Cascadia Code', Consolas, Menlo, monospace`;
      const lines = ['attention · layer 12 · head 4', `query patch (${qx}, ${qy}) → top-${TOP_K}`];
      const tw = Math.max(...lines.map((l) => ctx.measureText(l).width)) + 14;
      const th = fs * 2 + 14;
      let lx = qcx + patch;
      let ly = qcy + patch * 0.6;
      if (lx + tw > w) lx = qcx - patch - tw;
      if (ly + th > h) ly = h - th - 4;
      ctx.fillStyle = `rgba(12, 12, 12, ${(amt * 0.78).toFixed(3)})`;
      ctx.fillRect(lx, ly, tw, th);
      ctx.strokeStyle = `rgba(${STEEL}, ${(amt * 0.35).toFixed(3)})`;
      ctx.lineWidth = 1;
      ctx.strokeRect(lx + 0.5, ly + 0.5, tw - 1, th - 1);
      ctx.fillStyle = `rgba(${STEEL}, ${(amt * 0.95).toFixed(3)})`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      lines.forEach((l, i) => ctx.fillText(l, lx + 7, ly + 7 + i * (fs + 1)));
      ctx.restore();
    };

    // "Thinking" pulse: with no cursor, attention wanders between salient patches on its own
    const thinkingAmount = (now: number) => {
      const t = now - thinkStart;
      if (t < 0) return 0;
      if (t >= THINK_CYCLE_MS) {
        thinkStart = now;
        thinkQuery = pickThinkQuery(thinkQuery);
        return 0;
      }
      return smooth(0, 600, t) * (1 - smooth(THINK_CYCLE_MS - 1100, THINK_CYCLE_MS - 450, t));
    };

    const draw = (now: number) => {
      const dt = last ? Math.min(64, now - last) : 16;
      last = now;
      if (tapUntil && now > tapUntil) {
        tapUntil = 0;
        mouse.inside = false;
      }
      const target = mouse.inside ? 1 : 0;
      hover += (target - hover) * Math.min(1, dt / 160);
      if (Math.abs(target - hover) < 0.005) hover = target;

      ctx.clearRect(0, 0, w, h);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const raw = reduceMotion ? 1 : Math.min(1, (now - start) / INTRO_MS);
      if (raw < 1) drawIntro(raw);
      else photo.style.opacity = '1';
      drawAura(now, smooth(0.65, 1, raw) * (1 - hover * 0.7));

      const thinking = !reduceMotion && raw >= 1 && thinkQuery;
      if (thinking && thinkQuery) {
        drawAttention(thinkQuery.x, thinkQuery.y, thinkingAmount(now) * THINK_STRENGTH * (1 - hover), false);
      }
      drawAttention(lastQ.x, lastQ.y, hover, true);
      return raw < 1 || mouse.inside || hover > 0 || !!thinking;
    };

    const loop = (now: number) => {
      raf = 0;
      if (disposed || !visible || !w) return;
      if (draw(now)) {
        raf = requestAnimationFrame(loop);
      } else if (!reduceMotion) {
        // Idle: only the aura shimmers, so redraw ~7 times a second
        idleTimer = setTimeout(() => {
          idleTimer = 0;
          kick();
        }, 140);
      }
    };

    function kick() {
      if (disposed || !visible || raf) return;
      if (idleTimer) {
        clearTimeout(idleTimer);
        idleTimer = 0;
      }
      raf = requestAnimationFrame(loop);
    }

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
      track(e);
    };

    const onDown = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') return;
      track(e);
      tapUntil = mouse.inside ? performance.now() + 2500 : 0;
    };

    const track = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
      const qx = Math.floor(mouse.x / patch);
      const qy = Math.floor(mouse.y / patch);
      const q = patches[qy * pCols + qx];
      mouse.inside = mouse.x >= 0 && mouse.y >= 0 && mouse.x < r.width && mouse.y < r.height && !!q?.inside;
      if (mouse.inside) {
        lastQ = { x: qx, y: qy };
        if (!engagedRef.current) {
          engagedRef.current = true;
          setEngaged(true);
        }
      }
      kick();
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      kick();
    });
    io.observe(wrap);

    const ro = new ResizeObserver(() => {
      sample();
      kick();
    });

    if (!reduceMotion) photo.style.opacity = '0';
    img.onload = () => {
      sample();
      start = performance.now();
      thinkStart = start + (reduceMotion ? 0 : INTRO_MS) + 500;
      ro.observe(wrap);
      kick();
    };
    img.onerror = () => {
      photo.style.opacity = '1';
    };
    img.src = src;
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      if (idleTimer) clearTimeout(idleTimer);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      photo.style.opacity = '1';
    };
  }, [src]);

  return (
    <div data-testid="data-portrait" className="relative w-full" style={{ aspectRatio: `${width} / ${height}` }}>
      {/* Faint violet backlight behind the head */}
      <div
        aria-hidden
        className="absolute inset-[-10%] pointer-events-none"
        style={{
          background:
            'radial-gradient(closest-side at 50% 40%, rgba(118, 33, 176, 0.2) 0%, rgba(118, 33, 176, 0.1) 30%, rgba(118, 33, 176, 0.035) 55%, rgba(118, 33, 176, 0.01) 80%, rgba(118, 33, 176, 0) 100%)',
        }}
      />
      <div ref={wrapRef} className="spotlight-mask absolute inset-0">
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          width={width}
          height={height}
          className="w-full h-full object-contain select-none"
          draggable={false}
        />
        <canvas ref={canvasRef} aria-hidden className="absolute inset-0 w-full h-full pointer-events-none" />
      </div>

      {/* Discoverability hint; fades away once the visitor has tried it */}
      <p
        data-testid="portrait-hint"
        aria-hidden
        className="absolute left-1/2 -translate-x-1/2 bottom-[7%] flex items-center gap-2 whitespace-nowrap pointer-events-none font-mono uppercase tracking-[0.25em] text-[9px] sm:text-[10px] text-[#D7E2EA]/60 transition-opacity duration-700"
        style={{ opacity: engaged ? 0 : 1 }}
      >
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full rounded-full bg-[#B600A8] opacity-75 animate-ping" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#D7E2EA]" />
        </span>
        <span className="hint-pointer">Hover to see what the model attends to</span>
        <span className="hint-touch">Tap to see what the model attends to</span>
      </p>
    </div>
  );
}
