import { createCanvas } from 'canvas';

export function CropTransparentPixels(Canvas) {
    const Ctx = Canvas.getContext('2d');
    const ImageData = Ctx.getImageData(0, 0, Canvas.width, Canvas.height);
    const Data = ImageData.data;
    const Width = Canvas.width;
    const Height = Canvas.height;

    let MinX = Width;
    let MinY = Height;
    let MaxX = 0;
    let MaxY = 0;

    for (let Y = 0; Y < Height; Y++) {
        for (let X = 0; X < Width; X++) {
            const Alpha = Data[(Y * Width + X) * 4 + 3];
            if (Alpha > 0) {
                if (X < MinX) MinX = X;
                if (X > MaxX) MaxX = X;
                if (Y < MinY) MinY = Y;
                if (Y > MaxY) MaxY = Y;
            }
        }
    }

    if (MinX > MaxX || MinY > MaxY) {
        return Canvas;
    }

    const CroppedWidth = MaxX - MinX + 1;
    const CroppedHeight = MaxY - MinY + 1;

    const CroppedCanvas = createCanvas(CroppedWidth, CroppedHeight);
    const CroppedCtx = CroppedCanvas.getContext('2d');

    CroppedCtx.drawImage(
        Canvas,
        MinX, MinY, CroppedWidth, CroppedHeight,
        0, 0, CroppedWidth, CroppedHeight
    );

    return CroppedCanvas;
}
