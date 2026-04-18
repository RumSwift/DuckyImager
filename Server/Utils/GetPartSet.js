export function GetPartSet(SetName, PartSets) {
    const ActivePartSet = PartSets.partSets.activePartSet.find(
        (PartSet) => PartSet.id === SetName
    );

    if (!ActivePartSet) {
        return [];
    }

    const ActiveParts = ActivePartSet.activePart;
    const PartsArray = Array.isArray(ActiveParts) ? ActiveParts : [ActiveParts];

    return PartsArray.map((ActivePart) => ActivePart['set-type']);
}
