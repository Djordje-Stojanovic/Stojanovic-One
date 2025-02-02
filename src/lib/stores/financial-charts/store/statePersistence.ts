const SHOW_CHART_KEY = 'chartStore:showChart';
const SELECTED_METRICS_KEY = 'chartStore:selectedMetrics';
const SELECTED_YEARS_KEY = 'chartStore:selectedYears';

export function loadShowChart(): boolean {
    const stored = localStorage.getItem(SHOW_CHART_KEY);
    return stored ? JSON.parse(stored) : false;
}

export function saveShowChart(show: boolean): void {
    localStorage.setItem(SHOW_CHART_KEY, JSON.stringify(show));
}

export function loadSelectedMetrics(): string[] {
    const stored = localStorage.getItem(SELECTED_METRICS_KEY);
    return stored ? JSON.parse(stored) : [];
}

export function saveSelectedMetrics(metrics: string[]): void {
    localStorage.setItem(SELECTED_METRICS_KEY, JSON.stringify(metrics));
}

export function loadSelectedYears(): number {
    const stored = localStorage.getItem(SELECTED_YEARS_KEY);
    return stored ? JSON.parse(stored) : 5;
}

export function saveSelectedYears(years: number): void {
    localStorage.setItem(SELECTED_YEARS_KEY, JSON.stringify(years));
}
