// Share functionality utilities

export function generateShareURL(data) {
    try {
        // Compress data
        const compressed = btoa(JSON.stringify({
            constraints: data.constraints,
            summary: {
                fileName: data.fileName,
                errorCount: data.violations.filter(v => v.severity === 'error').length,
                warningCount: data.violations.filter(v => v.severity === 'warning').length
            }
        }));
        
        const url = new URL(window.location.href);
        url.searchParams.set('share', compressed);
        return url.toString();
    } catch (error) {
        console.error('Error generating share URL:', error);
        return null;
    }
}

export function parseShareURL() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const shareData = urlParams.get('share');
        if (shareData) {
            const decoded = JSON.parse(atob(shareData));
            return decoded;
        }
    } catch (error) {
        console.error('Error parsing share URL:', error);
    }
    return null;
}

export function copyToClipboard(text) {
    return navigator.clipboard.writeText(text).then(
        () => true,
        () => false
    );
}

// Simple QR code generation using API (or you can use a library)
export function generateQRCodeURL(text) {
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(text)}`;
}

