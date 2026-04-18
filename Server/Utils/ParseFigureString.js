export function ParseFigureString(FigureString) {
    const Parts = FigureString.split('.');
    const Result = {};

    for (const Part of Parts) {
        const Match = Part.match(/(\w+)-(\d+)-(\d+)/);
        if (Match) {
            const Key = Match[1];
            const SetId = parseInt(Match[2], 10);
            const ColourId = parseInt(Match[3], 10);
            Result[Key] = { SetId, ColourId };
        }
    }

    return Result;
}
