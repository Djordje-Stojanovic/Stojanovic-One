declare module '@sveltejs/svelte-virtual-list' {
    import { SvelteComponentTyped } from 'svelte';

    interface VirtualListProps<T> {
        items: T[];
        height?: string | number;
        itemHeight?: number;
        start?: number;
        end?: number;
    }

    interface VirtualListEvents {
        scroll: CustomEvent<{ start: number; end: number }>;
    }

    interface VirtualListSlots<T> {
        default: {
            item: T;
            index: number;
        };
    }

    export default class VirtualList<T = unknown> extends SvelteComponentTyped<
        VirtualListProps<T>,
        VirtualListEvents,
        VirtualListSlots<T>
    > {}
}
