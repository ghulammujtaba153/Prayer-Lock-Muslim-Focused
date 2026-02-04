
const math = Math;

function norm_cdf(x) {
    let t = 1 / (1 + 0.2316419 * Math.abs(x));
    let d = 0.3989423 * Math.exp(-x * x / 2);
    let p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.7814779 + t * (-1.821256 + t * 1.3302745))));
    if (x > 0) p = 1 - p;
    return p;
}

function solveBlackScholes(S, K, T, v, r, q, isCall) {
    const d1 = (Math.log(S / K) + (r - q + 0.5 * v * v) * T) / (v * Math.sqrt(T));
    const d2 = d1 - v * Math.sqrt(T);
    if (isCall) {
        return S * Math.exp(-q * T) * norm_cdf(d1) - K * Math.exp(-r * T) * norm_cdf(d2);
    } else {
        return K * Math.exp(-r * T) * norm_cdf(-d2) - S * Math.exp(-q * T) * norm_cdf(-d1);
    }
}

function solveAmericanOption(S, K, T, v, r, q, isCall, steps = 200) {
    const dt = T / steps;
    const u = Math.exp(v * Math.sqrt(dt));
    const d = 1 / u;
    const p = (Math.exp((r - q) * dt) - d) / (u - d);
    const disc = Math.exp(-r * dt);

    let values = new Array(steps + 1);
    for (let i = 0; i <= steps; i++) {
        const St = S * Math.pow(u, steps - i) * Math.pow(d, i);
        values[i] = isCall ? Math.max(0, St - K) : Math.max(0, K - St);
    }

    for (let j = steps - 1; j >= 0; j--) {
        for (let i = 0; i <= j; i++) {
            const St = S * Math.pow(u, j - i) * Math.pow(d, i);
            const holdValue = disc * (p * values[i] + (1 - p) * values[i + 1]);
            const exerciseValue = isCall ? Math.max(0, St - K) : Math.max(0, K - St);
            values[i] = Math.max(holdValue, exerciseValue);
        }
    }
    return values[0];
}

const S = 185.61;
const K = 185;
const T = 18 / 365;
const v = 42.09 / 100;
const r = 3.49 / 100;
const q = 0.02 / 100;

console.log("Parameters: S=" + S + " K=" + K + " T=" + T + " v=" + v + " r=" + r + " q=" + q);
console.log("European Put (BSM): " + solveBlackScholes(S, K, T, v, r, q, false).toFixed(4));
console.log("American Put (CRR 200): " + solveAmericanOption(S, K, T, v, r, q, false, 200).toFixed(4));
console.log("American Put (CRR 1000): " + solveAmericanOption(S, K, T, v, r, q, false, 1000).toFixed(4));
console.log("European Call (BSM): " + solveBlackScholes(S, K, T, v, r, q, true).toFixed(4));
console.log("American Call (CRR 200): " + solveAmericanOption(S, K, T, v, r, q, true, 200).toFixed(4));
