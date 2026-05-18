export function newtonRaphson({ f, fprime, x0, tol = 1e-8, maxIter = 100 }) {
  let x = x0;
  for (let i = 0; i < maxIter; i++) {
    const fx = f(x);
    const d = fprime(x);
    if (!isFinite(fx) || !isFinite(d) || d === 0) break;
    const step = fx / d;
    x -= step;
    if (Math.abs(step) < tol) return x;
  }
  return x;
}

export function optimizeKellyPortfolio({ probabilities, decimalOdds, maxIter = 500, step = 0.1 }) {
  const p = Array.isArray(probabilities) ? probabilities.map(x => clamp(Number(x), 0, 1)) : [];
  const b = Array.isArray(decimalOdds) ? decimalOdds.map(d => Number(d) - 1) : [];
  const n = Math.min(p.length, b.length);
  const f = Array.from({ length: n }, (_, i) => {
    if (!(b[i] > 0)) return 0;
    const q = 1 - p[i];
    return clamp((p[i] * b[i] - q) / b[i], 0, 1);
  });
  const s = f.reduce((a, x) => a + x, 0);
  return s > 0.99 ? f.map(x => (x / s) * 0.99) : f;
}

function gradient(p, b, f) {
  const n = p.length;
  const sumF = f.reduce((a, x) => a + x, 0);
  const g = new Array(n).fill(0);
  const denomVoid = 1 - sumF;
  for (let i = 0; i < n; i++) {
    const termWin = p[i] * (b[i] / (1 + b[i] * f[i]));
    const termVoid = (1 - p.reduce((a, x) => a + x, 0)) * (-1 / Math.max(1e-8, denomVoid));
    g[i] = termWin + termVoid;
  }
  return g;
}

function l2norm(arr) {
  return Math.sqrt(arr.reduce((s, x) => s + x * x, 0));
}

function clamp(x, min, max) {
  return Math.min(max, Math.max(min, Number.isFinite(x) ? x : min));
}


