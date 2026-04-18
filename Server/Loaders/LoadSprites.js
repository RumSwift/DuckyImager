import { join, dirname, relative } from 'path';
import { fileURLToPath } from 'url';
import Fs from 'fs';
import { parse as ParseCsv } from 'csv-parse/sync';

const CurrentDirectory = dirname(fileURLToPath(import.meta.url));
const DataDirectory = join(CurrentDirectory, '..', 'Data');

function ParseRegistrationPoint(RegistrationPointString) {
    const Match = RegistrationPointString.match(/(-?\d+),\s*(-?\d+)/);
    if (!Match) {
        return null;
    }
    return {
        X: parseInt(Match[1], 10),
        Y: parseInt(Match[2], 10)
    };
}

function LoadMembersCsv(Sprites, BasePath, FolderName) {
    const FolderPath = join(BasePath, FolderName);
    const CsvFilePath = join(FolderPath, 'Members.csv');

    if (!Fs.existsSync(CsvFilePath)) {
        return;
    }

    const FileContent = Fs.readFileSync(CsvFilePath, 'utf8');
    const Rows = ParseCsv(FileContent, {
        columns: true,
        trim: true,
        skip_empty_lines: true
    });

    Rows.forEach((Row) => {
        if (Row.Type !== 'bitmap') {
            return;
        }

        const Number = Row['Number'];
        const Name = Row['Name'];
        const RegistrationPoint = Row['Registration Point'];

        if (!Number || !Name || !RegistrationPoint) {
            return;
        }

        const ParsedPoint = ParseRegistrationPoint(RegistrationPoint);
        if (!ParsedPoint) {
            return;
        }

        const RelativeFolderPath = relative(DataDirectory, FolderPath);
        const SpritePath = RelativeFolderPath ? `${RelativeFolderPath}/${Number}_${Name}.png` : `${FolderName}/${Number}_${Name}.png`;

        Sprites[Name] = {
            Name: Name,
            FileName: SpritePath,
            RegX: ParsedPoint.X,
            RegY: ParsedPoint.Y
        };
    });
}

function LoadMemberAliases(Sprites, FolderPath) {
    const AliasFilePath = join(FolderPath, '1_memberalias.index.txt');

    if (!Fs.existsSync(AliasFilePath)) {
        return;
    }

    const FileContent = Fs.readFileSync(AliasFilePath, 'utf8');
    const NormalizedContent = FileContent
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n');

    const Lines = NormalizedContent
        .split('\n')
        .map((Line) => Line.trim())
        .filter((Line) => Line.length > 0)
        .filter((Line) => !Line.startsWith('#'));

    Lines.forEach((Line) => {
        const Parts = Line.split('=').map((Part) => Part.trim());
        const AliasName = Parts[0];
        const TargetName = Parts[1];

        if (AliasName && TargetName && Sprites[TargetName]) {
            Sprites[AliasName] = Sprites[TargetName];
        }
    });
}

export async function LoadSprites() {
    const Sprites = {

    };

    const AllFolders = Fs.readdirSync(DataDirectory).filter((Item) => {
        const ItemPath = join(DataDirectory, Item);
        return Fs.existsSync(ItemPath) && Fs.statSync(ItemPath).isDirectory();
    });

    AllFolders.forEach((FolderName) => {
        LoadMembersCsv(Sprites, DataDirectory, FolderName);
    });

    AllFolders.forEach((FolderName) => {
        const FolderPath = join(DataDirectory, FolderName);
        LoadMemberAliases(Sprites, FolderPath);
    });

    const SpriteCount = Object.keys(Sprites).length;

    return Sprites;
}
