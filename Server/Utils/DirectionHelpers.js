const FlipDirections = [4, 5, 6, 7];

const DirectionMap = {
    4: 2,
    5: 1,
    6: 0,
    7: 7
};

export function ShouldFlip(Direction) {
    return FlipDirections.includes(parseInt(Direction, 10));
}

export function GetDirection(Direction) {
    const DirectionNumber = parseInt(Direction, 10);
    if (DirectionMap[DirectionNumber] !== undefined) {
        return DirectionMap[DirectionNumber];
    }
    return DirectionNumber;
}
