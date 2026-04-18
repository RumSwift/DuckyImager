import Https from 'https';
import { GetCachedFigure, SetCachedFigure } from './FigureCache.js';

// Noob look
export const DefaultFigure = 'hr-100-1150.hd-180-1026.ch-210-1284.lg-270-1223.sh-290-1247.ha-0-1150';

const HotelApis = {
    COM: 'https://origins.habbo.com/api/public/users',
    BR: 'https://origins.habbo.com.br/api/public/users',
    ES: 'https://origins.habbo.es/api/public/users'
};

const RequestTimeoutMs = 5000;

function FetchFromApi(Url) {
    return new Promise((Resolve) => {
        const Timeout = setTimeout(() => {
            Resolve(null);
        }, RequestTimeoutMs);

        const Request = Https.get(
            Url,
            {
                headers: {
                    'User-Agent': 'Habbo-Imager/1.0',
                    'Accept': 'application/json'
                },
                rejectUnauthorized: true,
                minVersion: 'TLSv1.2'
            },
            (Response) => {
                clearTimeout(Timeout);

                if (Response.statusCode !== 200) {
                    Resolve(null);
                    return;
                }

                let RawData = '';
                Response.on('data', (Chunk) => { RawData += Chunk; });
                Response.on('end', () => { Resolve(RawData); });
            }
        );

        Request.on('error', () => {
            clearTimeout(Timeout);
            Resolve(null);
        });

        Request.on('timeout', () => {
            clearTimeout(Timeout);
            Request.destroy();
            Resolve(null);
        });
    });
}

export async function FetchFigureString(HabboName, Hotel) {
    const HotelUpper = Hotel.toUpperCase();
    const ApiBase = HotelApis[HotelUpper];

    if (!ApiBase) {
        return DefaultFigure;
    }

    const Cached = GetCachedFigure(HabboName, HotelUpper);
    if (Cached) {
        return Cached;
    }

    const Url = `${ApiBase}?name=${encodeURIComponent(HabboName)}`;
    const RawData = await FetchFromApi(Url);

    if (!RawData) {
        SetCachedFigure(HabboName, HotelUpper, DefaultFigure);
        return DefaultFigure;
    }

    try {
        const Parsed = JSON.parse(RawData);

        if (Parsed.error === 'not-found' || !Parsed.figureString) {
            SetCachedFigure(HabboName, HotelUpper, DefaultFigure);
            return DefaultFigure;
        }

        SetCachedFigure(HabboName, HotelUpper, Parsed.figureString);
        return Parsed.figureString;
    } catch {
        SetCachedFigure(HabboName, HotelUpper, DefaultFigure);
        return DefaultFigure;
    }
}
