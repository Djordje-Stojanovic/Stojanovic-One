declare module 'diff' {
    interface DiffLine {
        value: string;
        added?: boolean;
        removed?: boolean;
    }

    export function diffLines(oldStr: string, newStr: string): DiffLine[];
    export function diffWords(oldStr: string, newStr: string): DiffLine[];
    export function diffChars(oldStr: string, newStr: string): DiffLine[];
}
