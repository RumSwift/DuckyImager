export function MergeFigureData(FigureData, CustomItems) {
    if (!CustomItems?.figuredata?.sets?.settype) {
        return FigureData;
    }

    const Merged = JSON.parse(JSON.stringify(FigureData));

    const OfficialTypes = Array.isArray(Merged.figuredata.sets.settype)
        ? Merged.figuredata.sets.settype
        : [Merged.figuredata.sets.settype];

    const CustomTypes = Array.isArray(CustomItems.figuredata.sets.settype)
        ? CustomItems.figuredata.sets.settype
        : [CustomItems.figuredata.sets.settype];

    for (const CustomType of CustomTypes) {
        const ExistingType = OfficialTypes.find((T) => T.type === CustomType.type);

        if (ExistingType) {
            const CustomSets = Array.isArray(CustomType.set) ? CustomType.set : [CustomType.set];
            const ExistingSets = Array.isArray(ExistingType.set) ? ExistingType.set : [ExistingType.set];
            ExistingType.set = [...ExistingSets, ...CustomSets];
        } else {
            OfficialTypes.push(CustomType);
        }
    }

    Merged.figuredata.sets.settype = OfficialTypes;
    return Merged;
}