export function formatCompactNumber(value: number): string {
    if (Math.abs(value) >= 1_000_000_000) return (value / 1_000_000_000).toFixed(2).replace(/\.00$/, '') + 'B';
    if (Math.abs(value) >= 1_000_000) return (value / 1_000_000).toFixed(2).replace(/\.00$/, '') + 'M';
    if (Math.abs(value) >= 1_000) return (value / 1_000).toFixed(2).replace(/\.00$/, '') + 'K';
    return value.toString();
}

export function formatUSD(n: number, showCurrency = false) {
    const formatted = Intl.NumberFormat('en-US', {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
    }).format(n);
    return showCurrency ? `$${formatted}` : formatted;
}

export function formatNGN(n: number, showCurrency = false) {
    const formatted = Intl.NumberFormat('en-NG', {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
    }).format(n);
    return showCurrency ? `₦${formatted}` : formatted;
}
