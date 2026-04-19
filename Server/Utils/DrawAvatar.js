import { createCanvas, loadImage } from 'canvas';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { GetCanvasSize } from './GetCanvasSize.js';
import { TintImage } from './TintImage.js';
import { ShouldFlip } from './DirectionHelpers.js';

const CurrentDirectory = dirname(fileURLToPath(import.meta.url));
const DataDirectory = join(CurrentDirectory, '..', 'Data');

// Lookuptable but may add further corrections
const HeadOffsets = [
    { BodyDirection: 4, HeadDirection: 3, X: -3, Y: -1 }
];

function GetHeadOffset(FigureOptions) {
    const Match = HeadOffsets.find(
        (Offset) =>
            Offset.BodyDirection === FigureOptions.Direction &&
            Offset.HeadDirection === FigureOptions.HeadDirection
    );
    return Match ? { X: Match.X, Y: Match.Y } : { X: 0, Y: 0 };
}

function FlipCanvas(SourceCanvas) {
    const Flipped = createCanvas(SourceCanvas.width, SourceCanvas.height);
    const Ctx = Flipped.getContext('2d');
    Ctx.translate(SourceCanvas.width, 0);
    Ctx.scale(-1, 1);
    Ctx.drawImage(SourceCanvas, 0, 0);
    return Flipped;
}

function GetShadowSpriteName(FigureOptions) {
    const Size = FigureOptions.Size === 'a' ? 'sh' : 'h';
    const Action = FigureOptions.Action === 'sit' ? 'sit' : 'std';
    const Direction = FigureOptions.Action === 'sit' ? 2 : 0;

    return `${Size}_${Action}_sd_1_${Direction}_0`;
}

async function DrawShadow(Ctx, CanvasWidth, CanvasHeight, FigureOptions, Sprites) {
    try {
        const CanvasOptions = GetCanvasSize(FigureOptions);
        const SpriteName = GetShadowSpriteName(FigureOptions);
        const SpriteData = Sprites[SpriteName];

        if (!SpriteData || !SpriteData.FileName) {
            return;
        }

        const FilePath = join(DataDirectory, SpriteData.FileName);
        const ShadowImage = await loadImage(FilePath);
        const ScaledWidth = ShadowImage.width * CanvasOptions.Multiplier;
        const ScaledHeight = ShadowImage.height * CanvasOptions.Multiplier;
        const ShadowX = (CanvasWidth - ScaledWidth) / 2;
        const ShadowY = CanvasHeight - ScaledHeight;

        Ctx.globalAlpha = 0.2;
        Ctx.drawImage(ShadowImage, ShadowX, ShadowY, ScaledWidth, ScaledHeight);
        Ctx.globalAlpha = 1.0;

    } catch {
        // No shadow
    }
}

async function DrawParts(CanvasWidth, CanvasHeight, SpritesToDraw, FigureOptions) {
    const TempCanvas = createCanvas(CanvasWidth, CanvasHeight);
    const TempCtx = TempCanvas.getContext('2d');
    TempCtx.clearRect(0, 0, CanvasWidth, CanvasHeight);
    TempCtx.imageSmoothingEnabled = false;

    const CanvasOptions = GetCanvasSize(FigureOptions);
    const SortedSprites = [...SpritesToDraw].sort((A, B) => A.Order - B.Order);

    for (const Sprite of SortedSprites) {
        if (!Sprite.FileName) {
            continue;
        }

        try {
            const FilePath = join(DataDirectory, Sprite.FileName);
            let Image = await loadImage(FilePath);

            if (Sprite.Colour) {
                Image = await TintImage(Image, Sprite);
            }

            const TopLeftX = -parseInt(Sprite.RegX, 10) * CanvasOptions.Multiplier + CanvasOptions.OffsetX;
            const TopLeftY = (CanvasHeight - parseInt(Sprite.RegY, 10) * CanvasOptions.Multiplier) - 10 * CanvasOptions.Multiplier + CanvasOptions.OffsetY;

            TempCtx.drawImage(
                Image,
                TopLeftX,
                TopLeftY,
                Image.width * CanvasOptions.Multiplier,
                Image.height * CanvasOptions.Multiplier
            );
        } catch {
            // Missing the sprite, just skip it. Yolo
        }
    }

    return TempCanvas;
}

export async function DrawAvatar(Canvas, SpriteList, CanvasWidth, CanvasHeight, FigureOptions, Sprites) {
    const Ctx = Canvas.getContext('2d');

    const CarryItems = SpriteList.BodyDrawList.filter((Sprite) => Sprite.Type === 'ri');
    const BodySpritesWithoutCarry = SpriteList.BodyDrawList.filter((Sprite) => Sprite.Type !== 'ri');

    let BodyCanvas = await DrawParts(CanvasWidth, CanvasHeight, BodySpritesWithoutCarry, FigureOptions);
    if (ShouldFlip(FigureOptions.Direction)) {
        BodyCanvas = FlipCanvas(BodyCanvas);
    }

    let HeadCanvas = await DrawParts(CanvasWidth, CanvasHeight, SpriteList.HeadDrawList, FigureOptions);
    if (ShouldFlip(FigureOptions.HeadDirection)) {
        HeadCanvas = FlipCanvas(HeadCanvas);
    }

    let CarryCanvas = null;
    if (CarryItems.length > 0) {
        CarryCanvas = await DrawParts(CanvasWidth, CanvasHeight, CarryItems, FigureOptions);
        if (ShouldFlip(FigureOptions.Direction)) {
            CarryCanvas = FlipCanvas(CarryCanvas);
        }
    }

    Ctx.clearRect(0, 0, CanvasWidth, CanvasHeight);

    if (FigureOptions.Shadow !== false && FigureOptions.Action !== 'lay') {
        await DrawShadow(Ctx, CanvasWidth, CanvasHeight, FigureOptions, Sprites);
    }

    const HeadOffset = GetHeadOffset(FigureOptions);

    Ctx.drawImage(BodyCanvas, 0, 0, CanvasWidth, CanvasHeight);
    Ctx.drawImage(HeadCanvas, HeadOffset.X, HeadOffset.Y, CanvasWidth, CanvasHeight);

    if (CarryCanvas) {
        Ctx.drawImage(CarryCanvas, 0, 0, CanvasWidth, CanvasHeight);
    }

    return Canvas;
}