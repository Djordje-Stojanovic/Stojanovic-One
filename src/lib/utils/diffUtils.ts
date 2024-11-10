export interface DiffLine {
    value: string;
    added?: boolean;
    removed?: boolean;
}

export function diffLines(oldStr: string, newStr: string): DiffLine[] {
    const oldLines = oldStr.split('\n');
    const newLines = newStr.split('\n');
    const result: DiffLine[] = [];

    let i = 0;
    let j = 0;

    while (i < oldLines.length || j < newLines.length) {
        if (i >= oldLines.length) {
            // All remaining lines are additions
            result.push({ value: newLines[j] + '\n', added: true });
            j++;
            continue;
        }

        if (j >= newLines.length) {
            // All remaining lines are removals
            result.push({ value: oldLines[i] + '\n', removed: true });
            i++;
            continue;
        }

        if (oldLines[i] === newLines[j]) {
            // Lines are the same
            result.push({ value: oldLines[i] + '\n' });
            i++;
            j++;
        } else {
            // Lines are different
            result.push({ value: oldLines[i] + '\n', removed: true });
            result.push({ value: newLines[j] + '\n', added: true });
            i++;
            j++;
        }
    }

    return result;
}
