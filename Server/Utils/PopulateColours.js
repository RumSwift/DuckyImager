export function PopulateColours(SpriteList, FigureData) {
    SpriteList.forEach((Sprite) => {
        if (!Sprite.Colour) {
            return;
        }

        if (!Sprite.IsColorable) {
            Sprite.Colour = { value: 'EEEEEE', IsForced: true };
            return;
        }

        if (!Sprite.PaletteId) {
            return;
        }

        const Palette = FigureData.figuredata.colors.palette[Sprite.PaletteId - 1];

        if (!Palette) {
            return;
        }

        const ColourEntry = Palette.color.find((Colour) => Colour.id == Sprite.Colour);
        Sprite.Colour = ColourEntry || { value: 'EEEEEE', IsForced: true };
    });

    return SpriteList;
}