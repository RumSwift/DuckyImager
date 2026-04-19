import { Router } from 'express';
import { createCanvas } from 'canvas';
import { ParseFigureString } from '../Utils/ParseFigureString.js';
import { GetPartList } from '../Utils/GetPartList.js';
import { GetPartSet } from '../Utils/GetPartSet.js';
import { GetSpriteList } from '../Utils/GetSpriteList.js';
import { PopulateColours } from '../Utils/PopulateColours.js';
import { SetDrawOrder } from '../Utils/SetDrawOrder.js';
import { GetCanvasSize } from '../Utils/GetCanvasSize.js';
import { DrawAvatar } from '../Utils/DrawAvatar.js';
import { CropTransparentPixels } from '../Utils/CropCanvas.js';
import { FetchFigureString, DefaultFigure } from '../Utils/FetchFigureString.js';
import { MergeFigureData } from '../Utils/MergeFigureData.js';
import { ParseAndMergeCustomFigure } from '../Utils/ParseCustomFigure.js';

function ParseQueryOptions(Query) {
    return {
        Action: Query.action || 'std',
        Direction: Query.direction !== undefined ? parseInt(Query.direction, 10) : 2,
        HeadDirection: Query.head_direction !== undefined
            ? parseInt(Query.head_direction, 10)
            : null,
        Size: Query.size || 'b',
        Crr: Query.crr || null,
        Gesture: Query.gesture || 'std',
        Frame: parseInt(Query.frame, 10) || 0,
        Shadow: Query.shadow !== 'false',
        HeadOnly: Query.headonly === 'true'
    };
}

function FixLayAction(FigureOptions) {
    if (FigureOptions.Action !== 'lay') {
        return FigureOptions;
    }

    if (FigureOptions.Direction < 4) {
        FigureOptions.Direction = 2;
    } else if (FigureOptions.Direction > 4) {
        FigureOptions.Direction = 4;
    }

    FigureOptions.HeadDirection = FigureOptions.Direction;
    return FigureOptions;
}

export function CreateAvatarRouter(XmlData, Sprites) {
    const Router_ = Router();

    const MergedFigureData = MergeFigureData(XmlData.FigureData, XmlData.CustomItems);

    Router_.get('/', async (Request, Response) => {
        try {
            const Query = Request.query;

            let FigureString = Query.figure || null;

            if (Query.habbo && Query.hotel) {
                FigureString = await FetchFigureString(Query.habbo, Query.hotel);
            }

            if (!FigureString) {
                FigureString = DefaultFigure;
            }

            if (Query.custom) {
                FigureString = ParseAndMergeCustomFigure(FigureString, Query.custom);
            }

            let FigureOptions = ParseQueryOptions(Query);

            if (FigureOptions.HeadDirection === null) {
                FigureOptions.HeadDirection = FigureOptions.Direction;
            }

            FigureOptions = FixLayAction(FigureOptions);

            const ShouldCrop = Query.crop === 'true' || FigureOptions.HeadOnly;
            const FigureParts = ParseFigureString(FigureString);
            const HeadPartTypes = GetPartSet('head', XmlData.PartSets);
            const CanvasOptions = GetCanvasSize(FigureOptions);
            const PartList = GetPartList(FigureParts, MergedFigureData);
            const SpriteList = GetSpriteList(PartList, FigureOptions, Sprites, XmlData.PartSets);
            PopulateColours(SpriteList, MergedFigureData);
            const IsLayAction = FigureOptions.Action === 'lay';
            const HeadDrawList = IsLayAction
                ? []
                : SetDrawOrder(
                    SpriteList.filter((Sprite) => HeadPartTypes.includes(Sprite.Type)),
                    FigureOptions,
                    XmlData.DrawOrder
                );

            const BodyDrawList = (IsLayAction || FigureOptions.HeadOnly)
                ? (FigureOptions.HeadOnly ? [] : SetDrawOrder(SpriteList, FigureOptions, XmlData.DrawOrder))
                : SetDrawOrder(
                    SpriteList.filter((Sprite) => !HeadPartTypes.includes(Sprite.Type)),
                    FigureOptions,
                    XmlData.DrawOrder
                );

            if (FigureOptions.HeadOnly) FigureOptions.Shadow = false;

            let Canvas = createCanvas(CanvasOptions.Width, CanvasOptions.Height);

            await DrawAvatar(
                Canvas,
                { HeadDrawList, BodyDrawList },
                CanvasOptions.Width,
                CanvasOptions.Height,
                FigureOptions,
                Sprites
            );

            if (ShouldCrop) {
                Canvas = CropTransparentPixels(Canvas);
            }

            Response.setHeader('Content-Type', 'image/png');
            Response.setHeader('Cache-Control', 'public, max-age=300');

            const PngStream = Canvas.createPNGStream();

            PngStream.on('error', (Error) => {
                if (Error.code !== 'ECONNRESET' && Error.code !== 'EPIPE') {
                    console.error('[Avatar] Error:', Error);
                }
            });

            PngStream.pipe(Response);
        } catch (Error) {
            if (Error.code === 'ECONNRESET' || Error.code === 'EPIPE') {
                return;
            }

            console.error('[Avatar] Error generating avatar:', Error);
            Response.status(500).send('Failed to generate avatar image');
        }
    });

    return Router_;
}