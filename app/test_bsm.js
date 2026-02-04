
const math = Math;

function n(x) {
    let t = 1 / (1 + 0.2316419 * Math.abs(x));
    let d = 0.3989423 * Math.exp(-x * x / 2);
    let p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.7814779 + t * (-1.821256 + t * 1.3302745))));
    if (x > 0) p = 1 - p;
    return p;
}

function np(x) {
    return (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * x * x);
}

function calculateBSM(S, K, T, v, r, q, isCall) {
    const d1 = (Math.log(S / K) + (r - q + 0.5 * v * v) * T) / (v * Math.sqrt(T));
    const d2 = d1 - v * Math.sqrt(T);
    
    let price, delta, theta, rho, vega, gamma;
    
    if (isCall) {
        price = S * Math.exp(-q * T) * n(d1) - K * Math.exp(-r * T) * n(d2);
        delta = Math.exp(-q * T) * n(d1);
        theta = (- (S * v * Math.exp(-q * T) * np(d1)) / (2 * Math.sqrt(T)) + q * S * Math.exp(-q * T) * n(d1) - r * K * Math.exp(-r * T) * n(d2)) / 365;
        rho = (K * T * Math.exp(-r * T) * n(d2)) / 100;
    } else {
        price = K * Math.exp(-r * T) * n(-d2) - S * Math.exp(-q * T) * n(-d1);
        delta = Math.exp(-q * T) * (n(d1) - 1);
        theta = (- (S * v * Math.exp(-q * T) * np(d1)) / (2 * Math.sqrt(T)) - q * S * Math.exp(-q * T) * n(-d1) + r * K * Math.exp(-r * T) * n(-d2)) / 365;
        rho = (-K * T * Math.exp(-r * T) * n(-d2)) / 100;
    }
    
    vega = (S * Math.exp(-q * T) * np(d1) * Math.sqrt(T)) / 100;
    gamma = (Math.exp(-q * T) * np(d1)) / (S * v * Math.sqrt(T));
    
    return { price, delta, gamma, vega, theta, rho };
}

const params = [
    { S: 185.61, K: 185, T: 18 / 365, v: 0.4209, r: 0.0349, q: 0.0002 }
];

params.forEach(p => {
    console.log(`Inputs: S=${p.S}, K=${p.K}, T=${p.T.toFixed(4)}, v=${p.v}, r=${p.r}, q=${p.q}`);
    const put = calculateBSM(p.S, p.K, p.T, p.v, p.r, p.q, false);
    console.log("European Put Profile:");
    console.log(JSON.stringify(put, null, 2));
});
