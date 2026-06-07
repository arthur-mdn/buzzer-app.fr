export const PROFILE_COLORS = ['#FF5B37', '#0AA3BB', '#94C114', '#F8CF1D', '#745BB7', '#0CBA8C', '#999'];
export const DEFAULT_PROFILE_COLOR = '#999';
export const TOTAL_PROFILE_SMILEYS = 30;

export function normalizeProfileImageIndex(index, randomFallback = false) {
    const n = Number(index);
    if (Number.isFinite(n) && n >= 1 && n <= TOTAL_PROFILE_SMILEYS) {
        return Math.floor(n);
    }
    if (randomFallback) {
        return Math.floor(Math.random() * TOTAL_PROFILE_SMILEYS) + 1;
    }
    return 1;
}

export function normalizeProfileColor(color) {
    return PROFILE_COLORS.includes(color) ? color : DEFAULT_PROFILE_COLOR;
}

export async function fetchColoredProfileSvg(imageNumber, color) {
    const response = await fetch(`/smileys/smiley_${imageNumber}.svg`);
    if (!response.ok) {
        throw new Error(`Failed to load smiley ${imageNumber}`);
    }
    let svgText = await response.text();
    const uniqueClassId = `cls-1-${imageNumber}-${color.replace(/#/g, '')}`;
    svgText = svgText.replace(/cls-1/g, uniqueClassId);
    svgText = svgText.replace(
        new RegExp(`(\\.${uniqueClassId}\\s*\\{\\s*fill\\s*:)[^;}]*(;?\\s*\\})`, 'g'),
        `$1 ${color}$2`
    );
    return svgText;
}
