const NonColorableHex = 'EEEEEE';

export function GetPartList(FigureSets, FigureData) {
    const Parts = [];

    Object.entries(FigureSets).forEach(([Key, Value]) => {
        const TypePartList = FigureData.figuredata.sets.settype.find(
            (SetType) => SetType.type === Key
        );

        if (!TypePartList) {
            return;
        }

        const TypePart = TypePartList.set.find(
            (Set) => Set.id == Value.SetId
        );

        if (!TypePart) {
            return;
        }

        const SetIsColorable = String(TypePart.colorable) === '1';
        const HiddenLayers = GetHiddenLayers(TypePart);

        const PartIsArray = Array.isArray(TypePart.part);

        if (PartIsArray) {
            TypePart.part.forEach((Part) => {
                const PartIsColorable = String(Part.colorable) === '1';
                const BothColorable = SetIsColorable && PartIsColorable;

                Part.ColourId = BothColorable ? Value.ColourId : NonColorableHex;
                Part.IsColorable = BothColorable;
                Part.PaletteId = TypePartList.paletteid;
                Part.SetId = Value.SetId;
                Part.HiddenLayers = HiddenLayers;
                Parts.push(Part);
            });
        } else {
            const PartIsColorable = String(TypePart.part.colorable) === '1';
            const BothColorable = SetIsColorable && PartIsColorable;

            TypePart.part.ColourId = BothColorable ? Value.ColourId : NonColorableHex;
            TypePart.part.IsColorable = BothColorable;
            TypePart.part.PaletteId = TypePartList.paletteid;
            TypePart.part.SetId = Value.SetId;
            TypePart.part.HiddenLayers = HiddenLayers;
            Parts.push(TypePart.part);
        }
    });

    return Parts;
}

function GetHiddenLayers(TypePart) {
    if (!TypePart.hiddenlayers) {
        return [];
    }

    const Layers = TypePart.hiddenlayers.layer;

    if (!Layers) {
        return [];
    }

    const LayersArray = Array.isArray(Layers) ? Layers : [Layers];

    return LayersArray.map((Layer) => Layer.parttype);
}