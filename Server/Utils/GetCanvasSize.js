export function GetCanvasSize(FigureOptions) {
    const Size = FigureOptions.Size || 'b';
    const Action = FigureOptions.Action || 'std';

    let AvatarSize = { Width: 64, Height: 116, Multiplier: 1, OffsetX: 0, OffsetY: 0 };

    if (Size === 'a') {
        AvatarSize.Height = 72;
        AvatarSize.Width = 32;

        if (Action === 'lay') {
            AvatarSize.OffsetX = 15;
            AvatarSize.OffsetY = 7;
            AvatarSize.Width += 3;
        }
    }

    if (Size === 'b') {
        if (Action === 'lay') {
            AvatarSize.OffsetX = 10;
            AvatarSize.OffsetY = 2;
            AvatarSize.Width += 3;
        }
    }

    if (Size === 'l') {
        AvatarSize.Height = AvatarSize.Height * 2;
        AvatarSize.Width = AvatarSize.Width * 2;
        AvatarSize.Multiplier = 2;
    }

    if (Action === 'lay') {
        const TempHeight = AvatarSize.Height;
        AvatarSize.Height = AvatarSize.Width;
        AvatarSize.Width = TempHeight;

        AvatarSize.OffsetX += (AvatarSize.Width / 2) - 20;
        AvatarSize.OffsetY += -4;
    }

    return AvatarSize;
}