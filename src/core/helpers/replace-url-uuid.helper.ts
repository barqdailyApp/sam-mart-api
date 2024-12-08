export function replaceUUIDInURL(url: string): string {
    // Split the URL into the path and query parts
    const [path] = url.split('?'); // Ignore query parameters
    
    const parts = path.split('/');
    const uuidRegex = /^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;
    const uuidPlaceholder = '([0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12})';

    const replacedParts = parts.map(part => {
        return uuidRegex.test(part) ? uuidPlaceholder : part;
    });

    return replacedParts.join('/');
}
