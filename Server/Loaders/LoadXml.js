import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { XMLParser } from 'fast-xml-parser';

const CurrentDirectory = dirname(fileURLToPath(import.meta.url));
const DataDirectory = join(CurrentDirectory, '..', 'Data');

const XmlParser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '',
    textNodeName: 'value'
});

async function ParseXmlFile(FileName) {
    const FilePath = join(DataDirectory, FileName);
    const FileContent = await readFile(FilePath, 'utf-8');
    return XmlParser.parse(FileContent);
}

export async function LoadXml() {
    const FigureData = await ParseXmlFile('figuredata.xml');
    const DrawOrder = await ParseXmlFile('draworder.xml');
    const PartSets = await ParseXmlFile('partsets.xml');

    let CustomItems = null;
    try {
        CustomItems = await ParseXmlFile('customitems.xml');
    } catch {
        // boop
    }

    return {
        FigureData,
        DrawOrder,
        PartSets,
        CustomItems
    };
}