export function generateUserId(length = 128) {
    let array = new Uint8Array(length / 2); // puisque chaque byte est représenté par deux caractères hexadécimaux
    window.crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}
function generateUniqueCode() {
    // Vous pouvez utiliser des bibliothèques comme 'uuid' pour générer des ID uniques
    // ou implémenter votre propre logique de génération de code unique
    return 'xxxx-xxxx-xxxx'.replace(/[x]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        return r.toString(16);
    });
}