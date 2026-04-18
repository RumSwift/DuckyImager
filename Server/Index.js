import 'dotenv/config';
import Express from 'express';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { LoadXml } from './Loaders/LoadXml.js';
import { LoadSprites } from './Loaders/LoadSprites.js';
import { CreateAvatarRouter } from './Routes/AvatarImage.js';

const CurrentDirectory = dirname(fileURLToPath(import.meta.url));
const Port = process.env.PORT
const BaseUrl = process.env.URL
const TestToonUrl = `${BaseUrl}/habbo-imaging/avatarimage?habbo=Rhyss&hotel=COM&direction=4&head_direction=2&crr=1&gesture=sml&action=wav`;
const TestFigureStringUrl = `${BaseUrl}/habbo-imaging/avatarimage?figure=hr-802-1035.hd-185-1026.ch-215-1299.lg-275-1248.ha-2213-1.he-1609-1298&direction=4&head_direction=2&crr=1&gesture=sml&action=wav`;
const CalibratorUrl = `${BaseUrl}/calibrator`;

async function StartServer() {
    const StartTime = Date.now();

    console.log('----------------------------------');

    console.log('[Startup] Loading XMLs...');
    let XmlData;
    try {
        XmlData = await LoadXml();
        console.log('[Startup] Successfully loaded all XMLs');
    } catch (Error) {
        console.error('[Startup] Failed to load XMLs:', Error.message);
        process.exit(1);
    }

    console.log('[Startup] Loading Sprites...');
    let Sprites;
    try {
        Sprites = await LoadSprites();
        console.log('[Startup] Successfully loaded all sprites');
        console.log(`[Startup] Total sprites loaded: ${Object.keys(Sprites).length}`);
    } catch (Error) {
        console.error('[Startup] Failed to load sprites:', Error.message);
        process.exit(1);
    }

    const App = Express();

    App.use('/habbo-imaging/avatarimage', CreateAvatarRouter(XmlData, Sprites));

    App.use(Express.static(join(CurrentDirectory, 'Public')));

    App.get('/calibrator', (Request, Response) => {
        Response.sendFile(join(CurrentDirectory, 'Public', 'Calibrator.html'));
    });

    App.get('/', (Request, Response) => {
        Response.send('Habbo Imager is running. Use /habbo-imaging/avatarimage to render avatars.');
    });

    App.listen(Port, () => {
        const ElapsedSeconds = ((Date.now() - StartTime) / 1000).toFixed(2);

        console.log('----------------------------------');
        console.log(`[Startup] Built in ${ElapsedSeconds}s`);
        console.log('----------------------------------');
        console.log(`[Startup] Test Toon & Hotel URL: ${TestToonUrl}`);
        console.log(`[Startup] Test Figure String URL: ${TestFigureStringUrl}`);
        console.log('----------------------------------');
        console.log(`[Startup] Asset Calibrator Link: ${CalibratorUrl}`);
        console.log('----------------------------------');
    });
}

StartServer().catch((Error) => {
    console.error('Failed to start server:', Error);
    process.exit(1);
});