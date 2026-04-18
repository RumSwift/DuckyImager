import { GetDirection } from './DirectionHelpers.js';

export function GetCarrySpriteFilename(FigureOptions) {
    const Direction = GetDirection(FigureOptions.Direction);
    const SpriteId = FigureOptions.Crr;
    const Size = FigureOptions.Size === 'a' ? 'sh' : 'h';

    return `${Size}_crr_ri_${SpriteId}_${Direction}_0`;
}
