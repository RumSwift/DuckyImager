export function SetDrawOrder(DrawList, FigureOptions, DrawOrder) {
    DrawList.forEach((DrawPart) => {
        const Action = DrawOrder.actionSet.action.find((A) => A.id === FigureOptions.Action)
            || DrawOrder.actionSet.action.find((A) => A.id === 'std');

        if (!Action) {
            DrawPart.Order = 999;
            return;
        }

        const Direction = Action.direction.find((D) => String(D.id) === String(FigureOptions.Direction))
            || Action.direction.find((D) => String(D.id) === '2');

        if (!Direction) {
            DrawPart.Order = 999;
            return;
        }

        const PartIndex = Direction.partList.part.findIndex(
            (Part) => Part['set-type'] === DrawPart.Type
        );

        DrawPart.Order = PartIndex;
    });

    return DrawList;
}