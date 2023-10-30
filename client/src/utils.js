export function generateUserId(length = 128) {
    let array = new Uint8Array(length / 2); // puisque chaque byte est représenté par deux caractères hexadécimaux
    window.crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}
