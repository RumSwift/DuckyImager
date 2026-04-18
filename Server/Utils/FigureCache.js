// Caches the figure strings when using the director user/hotel as to not get limited

const CacheDurationMs = 30 * 60 * 1000;
const CleanupIntervalMs = 5 * 60 * 1000;

const FigureCache = new Map();

function BuildCacheKey(HabboName, Hotel) {
    return `${HabboName.toLowerCase()}:${Hotel.toUpperCase()}`;
}

export function GetCachedFigure(HabboName, Hotel) {
    const Key = BuildCacheKey(HabboName, Hotel);
    const Cached = FigureCache.get(Key);

    if (!Cached) {
        return null;
    }

    const Age = Date.now() - Cached.Timestamp;

    if (Age < CacheDurationMs) {
        return Cached.FigureString;
    }

    FigureCache.delete(Key);
    return null;
}

export function SetCachedFigure(HabboName, Hotel, FigureString) {
    const Key = BuildCacheKey(HabboName, Hotel);
    FigureCache.set(Key, {
        FigureString,
        Timestamp: Date.now()
    });
}

setInterval(() => {
    const Now = Date.now();
    let Cleaned = 0;

    for (const [Key, Value] of FigureCache.entries()) {
        if (Now - Value.Timestamp >= CacheDurationMs) {
            FigureCache.delete(Key);
            Cleaned++;
        }
    }

    if (Cleaned > 0 && process.env.DEBUG === 'true') {
        console.log(`[Cache] Cleaned ${Cleaned} expired entries (remaining: ${FigureCache.size})`);
    }
}, CleanupIntervalMs);
