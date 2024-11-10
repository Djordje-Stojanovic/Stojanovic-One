export interface DiffLine {
    value: string;
    added?: boolean;
    removed?: boolean;
    type?: 'text' | 'image';
    imageData?: string;
}

interface TokenizedContent {
    type: 'text' | 'image';
    value: string;
    imageData?: string;
}

function tokenizeHtmlContent(html: string): TokenizedContent[] {
    const div = document.createElement('div');
    div.innerHTML = html;
    const tokens: TokenizedContent[] = [];
    
    function processNode(node: Node) {
        if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent?.trim();
            if (text) {
                tokens.push({ type: 'text', value: text });
            }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as HTMLElement;
            if (element.tagName.toLowerCase() === 'img') {
                const imgElement = element as HTMLImageElement;
                const src = imgElement.getAttribute('src') || '';
                tokens.push({
                    type: 'image',
                    value: `[Image: ${tokens.length}]`,
                    imageData: src
                });
            } else {
                // Process children of non-img elements
                Array.from(element.childNodes).forEach(child => processNode(child));
            }
        }
    }

    Array.from(div.childNodes).forEach(node => processNode(node));
    return tokens;
}

export function diffLines(oldStr: string, newStr: string): DiffLine[] {
    const oldTokens = tokenizeHtmlContent(oldStr);
    const newTokens = tokenizeHtmlContent(newStr);
    const result: DiffLine[] = [];

    let i = 0;
    let j = 0;

    while (i < oldTokens.length || j < newTokens.length) {
        if (i >= oldTokens.length) {
            // All remaining tokens are additions
            const token = newTokens[j];
            result.push({
                value: token.value,
                added: true,
                type: token.type,
                imageData: token.imageData
            });
            j++;
            continue;
        }

        if (j >= newTokens.length) {
            // All remaining tokens are removals
            const token = oldTokens[i];
            result.push({
                value: token.value,
                removed: true,
                type: token.type,
                imageData: token.imageData
            });
            i++;
            continue;
        }

        const oldToken = oldTokens[i];
        const newToken = newTokens[j];

        if (oldToken.type === 'image' && newToken.type === 'image') {
            // Compare images by their data
            if (oldToken.imageData === newToken.imageData) {
                result.push({
                    value: newToken.value,
                    type: 'image',
                    imageData: newToken.imageData
                });
                i++;
                j++;
            } else {
                // Images are different
                result.push({
                    value: oldToken.value,
                    removed: true,
                    type: 'image',
                    imageData: oldToken.imageData
                });
                result.push({
                    value: newToken.value,
                    added: true,
                    type: 'image',
                    imageData: newToken.imageData
                });
                i++;
                j++;
            }
        } else if (oldToken.value === newToken.value && oldToken.type === newToken.type) {
            // Tokens are the same
            result.push({
                value: newToken.value,
                type: newToken.type,
                imageData: newToken.imageData
            });
            i++;
            j++;
        } else {
            // Tokens are different
            result.push({
                value: oldToken.value,
                removed: true,
                type: oldToken.type,
                imageData: oldToken.imageData
            });
            result.push({
                value: newToken.value,
                added: true,
                type: newToken.type,
                imageData: newToken.imageData
            });
            i++;
            j++;
        }
    }

    return result;
}
