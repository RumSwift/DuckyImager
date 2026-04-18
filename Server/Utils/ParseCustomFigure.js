function ParseFigureStringToParts(FigureString) {
    if (!FigureString) {
        return [];
    }

    const Parts = FigureString.split('.');
    const Result = [];

    for (const Part of Parts) {
        const Match = Part.match(/(\w+)-(\d+)-(\d+)/);
        if (Match) {
            Result.push({
                Type: Match[1],
                SetId: Match[2],
                ColourId: Match[3]
            });
        }
    }

    return Result;
}

export function ParseAndMergeCustomFigure(OfficialFigure, CustomItems) {
    if (!CustomItems) {
        return OfficialFigure;
    }

    const OfficialParts = ParseFigureStringToParts(OfficialFigure);
    const CustomParts = ParseFigureStringToParts(CustomItems);
    const CustomTypes = new Set(CustomParts.map((P) => P.Type));
    const FilteredOfficial = OfficialParts.filter((Part) => !CustomTypes.has(Part.Type));
    const Combined = [...FilteredOfficial, ...CustomParts];
    return Combined.map((P) => `${P.Type}-${P.SetId}-${P.ColourId}`).join('.');
}