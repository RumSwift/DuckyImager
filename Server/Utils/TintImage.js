import { createCanvas } from 'canvas';

const NonColourableTypes = ['ey', 'ri'];

function HexToRgb(HexString) {
    const Cleaned = HexString.replace('#', '');
    return {
        R: parseInt(Cleaned.substring(0, 2), 16),
        G: parseInt(Cleaned.substring(2, 4), 16),
        B: parseInt(Cleaned.substring(4, 6), 16)
    };
}

export async function TintImage(Image, Sprite) {
    return new Promise((Resolve) => {
        const Canvas = createCanvas(Image.width, Image.height);
        const Ctx = Canvas.getContext('2d');

        Ctx.imageSmoothingEnabled = false;
        Ctx.drawImage(Image, 0, 0);

        const ImageData = Ctx.getImageData(0, 0, Image.width, Image.height);
        const Data = ImageData.data;

        const HexColour = Sprite.Colour && Sprite.Colour.value
            ? `#${Sprite.Colour.value}`
            : '#ffffff';

        const { R: TintR, G: TintG, B: TintB } = HexToRgb(HexColour);

        const ShouldColour = !NonColourableTypes.includes(Sprite.Type);

        if (ShouldColour) {
            for (let I = 0; I < Data.length; I += 4) {
                const Alpha = Data[I + 3];

                if (Alpha > 0) {
                    Data[I] = Math.min(255, (Data[I] * TintR) / 255);
                    Data[I + 1] = Math.min(255, (Data[I + 1] * TintG) / 255);
                    Data[I + 2] = Math.min(255, (Data[I + 2] * TintB) / 255);
                }
            }
        }

        Ctx.putImageData(ImageData, 0, 0);

        Resolve(Canvas);
    });
}
