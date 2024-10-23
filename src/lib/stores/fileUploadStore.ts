import { writable } from 'svelte/store';

export interface UploadedFile {
    id: string;
    file_name: string;
    file_path: string;
}

interface FileUploadState {
    uploadedFiles: UploadedFile[];
    selectedFiles: string[];
    error: string;
}

function createFileUploadStore() {
    const { subscribe, update } = writable<FileUploadState>({
        uploadedFiles: [],
        selectedFiles: [],
        error: ''
    });

    return {
        subscribe,
        setUploadedFiles: (files: UploadedFile[]) => update(state => ({ ...state, uploadedFiles: files })),
        setError: (error: string) => update(state => ({ ...state, error })),
        toggleFileSelection: (fileId: string) => update(state => ({
            ...state,
            selectedFiles: state.selectedFiles.includes(fileId)
                ? state.selectedFiles.filter(id => id !== fileId)
                : [...state.selectedFiles, fileId]
        })),
        clearSelectedFiles: () => update(state => ({ ...state, selectedFiles: [] })),
        addFile: (file: UploadedFile) => update(state => ({
            ...state,
            uploadedFiles: [...state.uploadedFiles, file]
        }))
    };
}

export const fileUploadStore = createFileUploadStore();
