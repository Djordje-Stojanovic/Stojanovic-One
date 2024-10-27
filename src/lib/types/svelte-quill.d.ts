declare module 'svelte-quill' {
    import { SvelteComponentTyped } from 'svelte';

    interface QuillOptions {
        modules?: {
            toolbar?: unknown;
            history?: {
                delay?: number;
                maxStack?: number;
                userOnly?: boolean;
            };
        };
        theme?: string;
        placeholder?: string;
    }

    interface QuillProps extends QuillOptions {
        value?: string;
    }

    interface QuillEvents {
        'text-change': CustomEvent<{ html: string }>;
        'quill-ready': CustomEvent<unknown>;
    }

    export function quill(node: HTMLElement, options: QuillOptions): {
        update(options: QuillOptions): void;
        destroy(): void;
    };

    export class Quill extends SvelteComponentTyped<QuillProps, QuillEvents> {}
}
