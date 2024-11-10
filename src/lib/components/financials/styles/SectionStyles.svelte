<style>
    /* Section styling */
    :global(.section-header) {
        background: #374151;
        font-weight: 600;
        color: #60A5FA;
        text-transform: uppercase;
        font-size: 0.75rem;
        letter-spacing: 0.1em;
        border-top: 2px solid #4B5563;
    }

    :global(.section-header td) {
        background: #374151;
        padding: 12px 16px;
    }

    :global(.section-header:not(:first-child) td) {
        padding-top: 24px;
    }

    :global(.subsection-header) {
        background: #2D3748 !important;
        font-weight: 500;
        color: #9CA3AF;
        border-bottom: 1px solid #4B5563;
    }

    :global(.subsection-header td) {
        background: #2D3748;
        padding: 12px 16px;
    }

    :global(.subsection-header .metric-name) {
        padding-left: 24px !important;
    }

    :global(.metric-row) {
        padding-left: 32px !important;
    }

    :global(tr:nth-child(even):not(.section-header):not(.subsection-header):not(.total-row)) {
        background: #262f3d;
    }

    :global(tr:nth-child(odd):not(.section-header):not(.subsection-header):not(.total-row)) {
        background: #1F2937;
    }

    :global(tr:hover:not(.section-header):not(.subsection-header):not(.total-row) td) {
        background: #374151;
        transition: background-color 0.15s ease-in-out;
    }

    :global(.total-row td) {
        background: #2D3748 !important;
        font-weight: 600;
        border-top: 1px solid #4B5563;
        border-bottom: 1px solid #4B5563;
        padding: 14px 16px;
    }

    :global(.value-cell) {
        padding: 12px 16px;
        text-align: right;
        white-space: nowrap;
        background: inherit;
        border-left: 1px solid #374151;
    }

    /* First column styling */
    :global(td:first-child), :global(th:first-child) {
        border-left: none;
    }

    /* Last row in each section */
    :global(.total-row:not(:last-child) td) {
        border-bottom: 2px solid #4B5563;
        margin-bottom: 16px;
    }

    /* Spacing after sections */
    :global(.section-header td) {
        padding-top: 24px;
    }

    /* Ensure proper sticky behavior */
    :global(tbody tr td:first-child) {
        background: inherit;
    }
</style>
