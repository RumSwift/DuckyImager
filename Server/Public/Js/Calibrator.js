let BodyDirection = 2;
let HeadDirection = 2;
let CurrentPart = 'ha';
let Zoom = 2;
let AvatarSize = 'b';
let SpriteImg = null;
let SpriteX = 0;
let SpriteY = 0;
let Dragging = false;
let DragOffX = 0;
let DragOffY = 0;
let FlipSprite = false;
let NextNumber = 1;
let Entries = [];

const HandItemParts = ['ri', 'rh', 'rs', 'li', 'lh', 'ls'];

// Mirrors
function GetMirrorDir(Dir) {
    if (Dir >= 0 && Dir <= 3) return Dir + 4;
    if (Dir >= 4 && Dir <= 7) return Dir - 4;
    return null;
}

const Canvas = document.getElementById('habbo-canvas');
const Ctx = Canvas.getContext('2d');
Ctx.imageSmoothingEnabled = false;

let AvatarImg = null;

function CanvasW() { return AvatarSize === 'a' ? 32 : 64; }
function CanvasH() { return AvatarSize === 'a' ? 60 : 116; }

function ApplyZoom() {
    const W = CanvasW() * Zoom;
    const H = CanvasH() * Zoom;
    Canvas.style.width  = W + 'px';
    Canvas.style.height = H + 'px';
    const Wrap = document.getElementById('cal-canvas-wrap');
    Wrap.style.width  = W + 'px';
    Wrap.style.height = H + 'px';
    const HeadY = Math.round(H * 0.15);
    const BodyY = Math.round(H * 0.55);
    const Gap   = BodyY - HeadY;
    document.querySelectorAll('.cal-arrows').forEach(function(El) {
        El.style.marginTop = HeadY + 'px';
        El.style.gap = Gap + 'px';
    });
}

function Redraw() {
    Ctx.clearRect(0, 0, CanvasW(), CanvasH());
    if (AvatarImg) Ctx.drawImage(AvatarImg, 0, 0, CanvasW(), CanvasH());
    if (SpriteImg) {
        if (FlipSprite) {
            Ctx.save();
            Ctx.translate(SpriteX + SpriteImg.width, SpriteY);
            Ctx.scale(-1, 1);
            Ctx.drawImage(SpriteImg, 0, 0);
            Ctx.restore();
        } else {
            Ctx.drawImage(SpriteImg, SpriteX, SpriteY);
        }
    }
    UpdateOutput();
}

function BuildAvatarUrl(Dir, HeadDir) {
    const IsHandItem = HandItemParts.includes(CurrentPart);
    const Figure = IsHandItem
        ? 'hd-185-1026.bd-110-1.ri-9999-1'
        : 'hd-185-1026.bd-110-1';
    return '/habbo-imaging/avatarimage?figure=' + Figure +
        '&direction=' + Dir +
        '&head_direction=' + HeadDir +
        '&size=' + AvatarSize +
        (IsHandItem ? '&crr=999999999999' : '');
}

function UpdateHabbo() {
    const Url = BuildAvatarUrl(BodyDirection, HeadDirection);
    const I = new Image();
    I.onload = function() { AvatarImg = I; Redraw(); };
    I.src = Url;
}

function ChangeBodyDir(Delta) {
    BodyDirection = (BodyDirection - Delta + 8) % 8;
    UpdateHabbo();
}

function ChangeHeadDir(Delta) {
    HeadDirection = (HeadDirection - Delta + 8) % 8;
    UpdateHabbo();
}

function SetPart(Part) {
    CurrentPart = Part;
    UpdateHabbo();
    UpdateOutput();
}

function SetZoom(Z) {
    Zoom = parseInt(Z);
    Canvas.width  = CanvasW();
    Canvas.height = CanvasH();
    ApplyZoom();
    Redraw();
}

function SetSize(S) {
    AvatarSize = S;
    Canvas.width  = CanvasW();
    Canvas.height = CanvasH();
    ApplyZoom();
    UpdateHabbo();
}

function ToggleFlip() {
    FlipSprite = document.getElementById('cal-flip').checked;
    Redraw();
}

function LoadSprite(File) {
    const Reader = new FileReader();
    Reader.onload = function(E) {
        const I = new Image();
        I.onload = function() {
            SpriteImg = I;
            SpriteX = Math.floor((CanvasW() - I.width) / 2);
            SpriteY = Math.floor((CanvasH() - I.height) / 2);
            Redraw();
        };
        I.src = E.target.result;
    };
    Reader.readAsDataURL(File);
}

function Nudge(DX, DY) {
    if (!SpriteImg) return;
    SpriteX += DX;
    SpriteY += DY;
    Redraw();
}

function GetCSVLine() {
    if (!SpriteImg) return null;
    const RegX = -SpriteX;
    const RegY = CanvasH() - SpriteY;
    const Name = document.getElementById('cal-sprite-name').value || ('h_std_' + CurrentPart + '_1_' + BodyDirection + '_0');
    return NextNumber + ',bitmap,' + Name + ',"(' + RegX + ', ' + RegY + ')",';
}

function UpdateOutput() {
    if (!SpriteImg) {
        document.getElementById('cal-rp-val').textContent = '( — , — )';
        document.getElementById('cal-csv-out').textContent = '—';
        return;
    }
    const RegX = -SpriteX;
    const RegY = CanvasH() - SpriteY;
    document.getElementById('cal-rp-val').textContent = '(' + RegX + ', ' + RegY + ')';
    document.getElementById('cal-csv-out').textContent = GetCSVLine() || '—';
    document.getElementById('cal-next-num').textContent = '#' + NextNumber;
}

// Render a preview with habbo + sprite, with mirrored
function MakePreviewCanvas(AvatarUrl, SprImg, SpX, SpY, FlipEntireCanvas) {
    const W = CanvasW();
    const H = CanvasH();
    const C = document.createElement('canvas');
    C.width = W;
    C.height = H;
    C.style.width  = W + 'px';
    C.style.height = H + 'px';
    const Cx = C.getContext('2d');
    Cx.imageSmoothingEnabled = false;

    const Av = new Image();
    Av.onload = function() {
        // Temp canvas first
        const Tmp = document.createElement('canvas');
        Tmp.width = W;
        Tmp.height = H;
        const Tc = Tmp.getContext('2d');
        Tc.imageSmoothingEnabled = false;
        Tc.drawImage(Av, 0, 0, W, H);
        if (SprImg) {
            Tc.drawImage(SprImg, SpX, SpY);
        }

        if (FlipEntireCanvas) {
            // Flip entire canvas
            Cx.translate(W, 0);
            Cx.scale(-1, 1);
        }
        Cx.drawImage(Tmp, 0, 0);
    };
    Av.src = AvatarUrl;
    return C;
}

function AddPreviewPair(BodyDir, HeadDir, SpImg, SpX, SpY, SpriteName) {
    const Strip = document.getElementById('cal-preview-strip');
    const IsOriginalFlipped = BodyDir >= 4;

    const BaseBodyDir = IsOriginalFlipped ? BodyDir - 4 : BodyDir;
    const BaseHeadDir = HeadDir >= 4 ? HeadDir - 4 : HeadDir;
    const MirrorBodyDir = GetMirrorDir(BodyDir);
    const MirrorHeadDir = GetMirrorDir(HeadDir);

    const Pair = document.createElement('div');
    Pair.className = 'cal-preview-pair';

    const Frames = document.createElement('div');
    Frames.className = 'cal-preview-frames';

    const RealFrame = document.createElement('div');
    RealFrame.className = 'cal-preview-frame';
    const RealCanvas = MakePreviewCanvas(
        BuildAvatarUrl(BaseBodyDir, BaseHeadDir),
        SpImg, SpX, SpY, IsOriginalFlipped
    );
    const RealLabel = document.createElement('div');
    RealLabel.className = 'cal-preview-label';
    RealLabel.textContent = 'Dir ' + BodyDir;
    if (IsOriginalFlipped) {
        const Mark = document.createElement('span');
        Mark.className = 'cal-preview-mirrored-mark';
        Mark.textContent = '*';
        RealFrame.appendChild(Mark);
    }
    RealFrame.appendChild(RealCanvas);
    RealFrame.appendChild(RealLabel);
    Frames.appendChild(RealFrame);

    if (MirrorBodyDir !== null) {
        const MirrorFrame = document.createElement('div');
        MirrorFrame.className = 'cal-preview-frame';
        const MirrorCanvas = MakePreviewCanvas(
            BuildAvatarUrl(BaseBodyDir, BaseHeadDir),
            SpImg, SpX, SpY, !IsOriginalFlipped
        );
        const MirrorLabel = document.createElement('div');
        MirrorLabel.className = 'cal-preview-label';
        MirrorLabel.textContent = 'Dir ' + MirrorBodyDir;
        const Mark = document.createElement('span');
        Mark.className = 'cal-preview-mirrored-mark';
        Mark.textContent = '*';
        MirrorFrame.appendChild(Mark);
        MirrorFrame.appendChild(MirrorCanvas);
        MirrorFrame.appendChild(MirrorLabel);
        Frames.appendChild(MirrorFrame);
    }

    const Name = document.createElement('div');
    Name.className = 'cal-preview-name';
    Name.textContent = SpriteName || '';

    Pair.appendChild(Frames);
    Pair.appendChild(Name);
    Strip.appendChild(Pair);
}

function AddEntry() {
    const Line = GetCSVLine();
    if (!Line) return;

    const SpriteName = document.getElementById('cal-sprite-name').value || ('h_std_' + CurrentPart + '_1_' + BodyDirection + '_0');
    const SnapImg = SpriteImg;
    const SnapX = SpriteX;
    const SnapY = SpriteY;
    const SnapBodyDir = BodyDirection;
    const SnapHeadDir = HeadDirection;

    Entries.push(Line);
    NextNumber++;
    RenderEntries();
    UpdateOutput();
    document.getElementById('cal-preview-win').style.display = '';
    AddPreviewPair(SnapBodyDir, SnapHeadDir, SnapImg, SnapX, SnapY, SpriteName);
    SpriteImg = null;
    document.getElementById('cal-file-inp').value = '';
    document.getElementById('cal-sprite-name').value = '';
    Redraw();
}

function RenderEntries() {
    const List = document.getElementById('cal-entries');
    List.innerHTML = '';
    Entries.forEach(function(Line) {
        const Row = document.createElement('div');
        Row.style.cssText = 'font-family:Volter,monospace;font-size:9px;color:#336699;padding:2px 0;border-bottom:1px solid #eee;word-break:break-all;';
        Row.textContent = Line;
        List.appendChild(Row);
    });
}

function ClearAll() {
    Entries = [];
    NextNumber = 1;
    SpriteImg = null;
    document.getElementById('cal-file-inp').value = '';
    document.getElementById('cal-sprite-name').value = '';
    document.getElementById('cal-preview-strip').innerHTML = '';
    document.getElementById('cal-preview-win').style.display = 'none';
    RenderEntries();
    Redraw();
    UpdateOutput();
}

function CopyAll() {
    if (!Entries.length) return;
    navigator.clipboard.writeText(Entries.join('\n'));
    const El = document.getElementById('cal-copy-all');
    El.querySelector('.hbtn-b-text').textContent = 'Copied!';
    setTimeout(function() { El.querySelector('.hbtn-b-text').textContent = 'Copy All'; }, 1000);
}

document.getElementById('btn-add-asset').addEventListener('click', function() {
    document.getElementById('cal-file-inp').click();
});

document.getElementById('cal-file-inp').addEventListener('change', function(E) {
    if (E.target.files[0]) LoadSprite(E.target.files[0]);
});

Canvas.addEventListener('mousedown', function(E) {
    if (!SpriteImg) return;
    const Rect = Canvas.getBoundingClientRect();
    const MX = (E.clientX - Rect.left) / Zoom;
    const MY = (E.clientY - Rect.top) / Zoom;
    if (MX >= SpriteX && MX <= SpriteX + SpriteImg.width &&
        MY >= SpriteY && MY <= SpriteY + SpriteImg.height) {
        Dragging = true;
        DragOffX = MX - SpriteX;
        DragOffY = MY - SpriteY;
    }
});

document.addEventListener('mousemove', function(E) {
    if (!Dragging) return;
    const Rect = Canvas.getBoundingClientRect();
    SpriteX = Math.round((E.clientX - Rect.left) / Zoom - DragOffX);
    SpriteY = Math.round((E.clientY - Rect.top) / Zoom - DragOffY);
    Redraw();
});

document.addEventListener('mouseup', function() { Dragging = false; });

document.addEventListener('keydown', function(E) {
    if (!SpriteImg) return;
    const Map = { ArrowUp:[0,-1], ArrowDown:[0,1], ArrowLeft:[-1,0], ArrowRight:[1,0] };
    if (Map[E.key]) { E.preventDefault(); Nudge(...Map[E.key]); }
});

SetZoom(2);
UpdateHabbo();