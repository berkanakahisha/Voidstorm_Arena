// fx.js — lightweight visual system (parallax + bloom-ish composite)
export function makeFX(W, H) {
  const base = document.createElement("canvas");
  const glow = document.createElement("canvas");
  base.width = glow.width = W;
  base.height = glow.height = H;
  const bctx = base.getContext("2d");
  const gctx = glow.getContext("2d");

  const layers = [
    { n: 120, z: 0.25, sMin: 0.2, sMax: 0.9 },
    { n: 90,  z: 0.45, sMin: 0.4, sMax: 1.4 },
    { n: 60,  z: 0.70, sMin: 0.8, sMax: 2.2 },
  ];

  const stars = layers.map(L => {
    const arr = [];
    for (let i = 0; i < L.n; i++) {
      arr.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: L.sMin + Math.random() * (L.sMax - L.sMin),
        tw: Math.random() * 10,
      });
    }
    return { ...L, arr };
  });

  const fog = Array.from({ length: 18 }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    r: 180 + Math.random() * 360,
    a: 0.05 + Math.random() * 0.10,
    vx: (Math.random() * 2 - 1) * 6,
    vy: (Math.random() * 2 - 1) * 6,
  }));

  function resize(nW, nH) {
    base.width = glow.width = nW;
    base.height = glow.height = nH;
  }

  function clear() {
    bctx.setTransform(1, 0, 0, 1, 0, 0);
    gctx.setTransform(1, 0, 0, 1, 0, 0);
    bctx.clearRect(0, 0, base.width, base.height);
    gctx.clearRect(0, 0, glow.width, glow.height);
  }

  function drawParallaxBG(ctx, biome, t, camX = 0, camY = 0) {
    const W = base.width, H = base.height;
    // gradient base
    const [c0, c1, c2] = biome.bg;
    const g = ctx.createRadialGradient(W * 0.55, H * 0.45, 60, W * 0.5, H * 0.5, Math.max(W, H) * 0.9);
    g.addColorStop(0, c0); g.addColorStop(0.45, c1); g.addColorStop(1, c2);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // stars
    ctx.save();
    ctx.globalAlpha = 0.85;
    for (const L of stars) {
      const px = camX * L.z, py = camY * L.z;
      for (const s of L.arr) {
        const tw = 0.55 + 0.45 * Math.sin(t * 0.8 + s.tw);
        ctx.globalAlpha = 0.25 + 0.65 * tw;
        ctx.fillStyle = "rgba(231,238,249,0.9)";
        ctx.beginPath();
        ctx.arc((s.x - px + W) % W, (s.y - py + H) % H, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();

    // fog blobs (nebula feel)
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (const f of fog) {
      const nx = (f.x + Math.sin(t * 0.12) * 30 - camX * 0.05 + W) % W;
      const ny = (f.y + Math.cos(t * 0.10) * 30 - camY * 0.05 + H) % H;
      ctx.globalAlpha = f.a;
      const fg = ctx.createRadialGradient(nx, ny, 0, nx, ny, f.r);
      fg.addColorStop(0, "rgba(155,231,255,0.55)");
      fg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = fg;
      ctx.beginPath();
      ctx.arc(nx, ny, f.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function compositeTo(mainCtx) {
    // base to screen
    mainCtx.drawImage(base, 0, 0);

    // bloom-ish glow: blur + add
    mainCtx.save();
    mainCtx.globalCompositeOperation = "lighter";
    mainCtx.globalAlpha = 0.95;
    mainCtx.filter = "blur(8px)";
    mainCtx.drawImage(glow, 0, 0);
    mainCtx.filter = "blur(16px)";
    mainCtx.globalAlpha = 0.55;
    mainCtx.drawImage(glow, 0, 0);
    mainCtx.restore();

    // crisp glow on top
    mainCtx.save();
    mainCtx.globalCompositeOperation = "lighter";
    mainCtx.globalAlpha = 0.85;
    mainCtx.drawImage(glow, 0, 0);
    mainCtx.restore();
  }

  return { base, glow, bctx, gctx, resize, clear, drawParallaxBG, compositeTo };
}
