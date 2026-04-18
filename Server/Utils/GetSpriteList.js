import { GetPartSet } from './GetPartSet.js';
import { ShouldFlip, GetDirection } from './DirectionHelpers.js';
import { GetCarrySpriteFilename } from './GetCarrySpriteFilename.js';

// Any hat that requires normal hair not hat hair, started as just party hats
const PartyHatIds = ['2206', '2207', '2208', '2209', '2210', '2211', '2212', '1026'];

function GetActivePartSet(SetName, PartSets) {
    return PartSets.partSets.activePartSet.find((PartSet) => PartSet.id === SetName);
}

function GetPartFlipType(Part, PartSetsList) {
    const PartSet = PartSetsList.part.find((PartSetItem) => PartSetItem['set-type'] === Part.type);

    if (PartSet && PartSet['flipped-set-type']) {
        return PartSet['flipped-set-type'];
    }

    return PartSet ? PartSet['set-type'] : Part.type;
}

function GetPartRemoveType(Part, PartSetsList) {
    const PartSet = PartSetsList.part.find((PartSetItem) => PartSetItem['set-type'] === Part.type);

    if (PartSet && PartSet['remove-set-type']) {
        return { Part: Part.type, Remove: PartSet['remove-set-type'] };
    }

    return null;
}

function ResolveGestureAction(Action, Gesture, Size) {
    if (Action === 'lay' && Size === 'h') {
        const LayGestureMap = {
            sml: 'lsm',
            agr: 'lag',
            sad: 'lsa',
            srp: 'lsr'
        };
        return LayGestureMap[Gesture] || Gesture;
    }

    if (Action === 'lay' && Size === 'sh') {
        return 'lay';
    }

    return Gesture;
}

function BuildHiddenLayerRemoveList(PartList) {
    const HiddenBySetType = new Map();

    PartList.forEach((Part) => {
        if (Part.HiddenLayers && Part.HiddenLayers.length > 0) {
            HiddenBySetType.set(Part.type, Part.HiddenLayers);
        }
    });

    const RemoveList = [];
    const Visited = new Set();

    function Cascade(SetType) {
        if (Visited.has(SetType)) {
            return;
        }
        Visited.add(SetType);

        const Hidden = HiddenBySetType.get(SetType);
        if (!Hidden) {
            return;
        }

        Hidden.forEach((HiddenType) => {
            RemoveList.push({ Part: SetType, Remove: HiddenType });
            Cascade(HiddenType);
        });
    }

    for (const SetType of HiddenBySetType.keys()) {
        Cascade(SetType);
    }

    return RemoveList;
}

export function GetSpriteList(PartList, FigureOptions, Sprites, PartSets) {
    const GestureParts = GetActivePartSet('gesture', PartSets);
    const HeadPartTypes = GetPartSet('head', PartSets);

    let SpriteList = [];
    let RemoveSpriteList = [];

    const Size = FigureOptions.Size === 'a' ? 'sh' : 'h';

    const HatPart = PartList.find((Part) => Part.type === 'ha');
    const IsPartyHat = HatPart && PartyHatIds.includes(String(HatPart.SetId));

    const HiddenLayerRemoves = BuildHiddenLayerRemoveList(PartList);
    RemoveSpriteList.push(...HiddenLayerRemoves);

    PartList.forEach((Part) => {
        const IsHeadPart = HeadPartTypes.includes(Part.type);
        const PartDirection = IsHeadPart ? FigureOptions.HeadDirection : FigureOptions.Direction;

        const Direction = GetDirection(PartDirection);
        const PartShouldFlip = ShouldFlip(PartDirection);

        const CarryHandSet = PartShouldFlip ? 'handLeft' : 'handRight';
        const CarryHandParts = GetPartSet(CarryHandSet, PartSets);

        const PartType = PartShouldFlip
            ? GetPartFlipType(Part, PartSets.partSets.partSet)
            : Part.type;

        let Action = FigureOptions.Action;

        const RemovePart = GetPartRemoveType(Part, PartSets.partSets.partSet);
        if (RemovePart && !IsPartyHat) {
            RemoveSpriteList.push(RemovePart);
        }

        if (FigureOptions.Crr && CarryHandParts.includes(Part.type)) {
            Action = 'crr';
        }

        const ActiveParts = GestureParts && GestureParts.activePart
            ? Array.isArray(GestureParts.activePart)
                ? GestureParts.activePart
                : [GestureParts.activePart]
            : [];

        const IsGesturePart = ActiveParts.find((GesturePart) => GesturePart['set-type'] === PartType);

        if (IsGesturePart) {
            Action = ResolveGestureAction(Action, FigureOptions.Gesture, Size);
        }

        let Name = `${Size}_${Action}_${PartType}_${Part.id}_${Direction}_${FigureOptions.Frame}`;

        if (!Sprites[Name]) {
            if (Action === 'lay' && IsHeadPart) {
                Name = `${Size}_lsp_${PartType}_${Part.id}_${Direction}_0`;
            }
        }

        if (!Sprites[Name]) {
            Name = `${Size}_std_${PartType}_${Part.id}_${Direction}_0`;
        }

        const Sprite = {
            Name: Name,
            Type: Part.type,
            PaletteId: Part.PaletteId,
            Colour: Part.ColourId,
            IsColorable: Part.IsColorable,
            RegX: Sprites?.[Name]?.RegX,
            RegY: Sprites?.[Name]?.RegY,
            FileName: Sprites?.[Name]?.FileName
        };

        SpriteList.push(Sprite);
    });

    if (FigureOptions.Crr) {
        const CarryName = GetCarrySpriteFilename(FigureOptions);
        const CarrySprite = {
            Name: CarryName,
            Type: 'ri',
            RegX: Sprites?.[CarryName]?.RegX,
            RegY: Sprites?.[CarryName]?.RegY,
            FileName: Sprites?.[CarryName]?.FileName
        };
        SpriteList.push(CarrySprite);
    }

    RemoveSpriteList.forEach((Check) => {
        const PartExists = SpriteList.find((Sprite) => Sprite.Type === Check.Part);
        if (PartExists) {
            SpriteList = SpriteList.filter((Sprite) => Sprite.Type !== Check.Remove);
        }
    });

    return SpriteList;
}