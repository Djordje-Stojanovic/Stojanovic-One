export type NumberFormat = 'full' | 'abbreviated';
export type ValueType = 'currency' | 'number' | 'percentage';

interface FormatOptions {
    format?: NumberFormat;
    type?: ValueType;
    decimals?: number;
    showTooltip?: boolean;
}

const BILLION = 1_000_000_000;
const MILLION = 1_000_000;
const THOUSAND = 1_000;

/**
 * Formats a number according to specified options
 * @param value The number to format
 * @param options Formatting options
 * @returns An object containing the formatted value and tooltip
 */
export function formatValue(value: number | null | undefined, options: FormatOptions = {}) {
    const {
        format = 'full',
        type = 'number',
        decimals = 2,
        showTooltip = true
    } = options;

    if (value == null) {
        return { formatted: 'N/A', tooltip: 'Not Available' };
    }

    // Store the full formatted number for tooltip
    const fullFormatted = new Intl.NumberFormat('en-US', {
        style: type === 'currency' ? 'currency' : type === 'percentage' ? 'percent' : 'decimal',
        currency: 'USD',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
        ...(type === 'percentage' && { multiplier: 100 })
    }).format(value);

    if (format === 'full') {
        return {
            formatted: fullFormatted,
            tooltip: showTooltip ? fullFormatted : undefined
        };
    }

    // Abbreviated format
    let abbreviatedValue: number;
    let suffix: string;

    if (Math.abs(value) >= BILLION) {
        abbreviatedValue = value / BILLION;
        suffix = 'B';
    } else if (Math.abs(value) >= MILLION) {
        abbreviatedValue = value / MILLION;
        suffix = 'M';
    } else if (Math.abs(value) >= THOUSAND) {
        abbreviatedValue = value / THOUSAND;
        suffix = 'K';
    } else {
        abbreviatedValue = value;
        suffix = '';
    }

    const prefix = type === 'currency' ? '$' : '';
    const formattedNumber = abbreviatedValue.toFixed(2); // Always show 2 decimal places
    const formatted = `${prefix}${formattedNumber}${suffix}`;

    return {
        formatted: type === 'percentage' ? `${(value * 100).toFixed(decimals)}%` : formatted,
        tooltip: showTooltip ? fullFormatted : undefined
    };
}

/**
 * Formats a currency value
 * @param value The number to format
 * @param format The format to use (full or abbreviated)
 * @returns Formatted string with tooltip
 */
export function formatCurrency(value: number | null | undefined, format: NumberFormat = 'abbreviated') {
    return formatValue(value, { format, type: 'currency' });
}

/**
 * Formats a percentage value
 * @param value The decimal value to format (0.15 for 15%)
 * @param decimals Number of decimal places
 * @returns Formatted string with tooltip
 */
export function formatPercentage(value: number | null | undefined, decimals = 2) {
    return formatValue(value, { type: 'percentage', decimals });
}

/**
 * Formats a number value
 * @param value The number to format
 * @param format The format to use (full or abbreviated)
 * @param decimals Number of decimal places
 * @returns Formatted string with tooltip
 */
export function formatNumber(value: number | null | undefined, format: NumberFormat = 'full', decimals = 0) {
    return formatValue(value, { format, decimals });
}
