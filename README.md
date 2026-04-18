# Habbo Origins Imager

A  avatar imager for **Habbo Hotel: Origins**, built with Node.js and Express. Renders Origins Habbos from the original CCT files.

Built by Rhyss from OUS hotel.

> **This project is not affiliated with, endorsed, sponsored, or specifically approved by Sulake Oy or its Affiliates.**

---

## Features

- Renders full Habbo avatars from figure strings or live Habbo usernames & hotel.
- Head-only rendering (`head_only=true`).
- Three sizes: normal (`b`), small (`a`), large (`l`).
- Custom items via `custom=` param.
- Figure string caching for direct username/hotel lookup - to avoid rate limits.
- Asset Calibrator, a tool for generating reg points for new sprites.

---

## Requirements

- Node.js 18+


---

## URL Reference

### Render by Habbo Username & Hotel (COM, ES or BR)

```
/habbo-imaging/avatarimage?habbo={name}&hotel={hotel}
```

| Parameter | Description | Default |
|-----------|-------------|---------|
| `habbo` | Habbo username | — |
| `hotel` | Hotel code: `COM`, `BR`, `ES` | — |

### Render by Figure String

```
/habbo-imaging/avatarimage?figure={figurestring}
```

### Example URLs

```
# By username & Hotel
/habbo-imaging/avatarimage?habbo=Rhyss&hotel=COM&direction=2

# By figure string
/habbo-imaging/avatarimage?figure=hr-802-1035.hd-185-1026.ch-215-1299.lg-275-1248&direction=4&head_direction=2

# Waving with carry item
/habbo-imaging/avatarimage?habbo=Rhyss&hotel=COM&action=wav&crr=1&gesture=sml

# Head only, small size
/habbo-imaging/avatarimage?habbo=Rhyss&hotel=COM&head_only=true&size=a

# Sitting, direction 4
/habbo-imaging/avatarimage?habbo=Rhyss&hotel=COM&action=sit&direction=4
```

---

## Asset Calibrator

The imager includes a built-in web tool for registering new custom sprite assets.

```
/calibrator
```

### How to use

1. Select the part type from the dropdown.
2. Click **Add Asset** to upload your sprite.
3. Use the direction arrows to set the body/head direction you're calibrating.
4. Drag the sprite on the canvas or use the nudge arrows/keyboard arrow keys to position it.
5. Click **Save Entry** and the Members CSV line is saved and the mirrored direction is automatically previewed
6. Repeat for each direction (only dirs 0–3 needed, dirs 4–7 are auto-mirrored by the engine)
7. Click **Copy All** to copy all entries, ready to paste into your `Members.csv`

---

## Dependencies

```json
"canvas": "^3.0.0",
"csv-parse": "^5.5.6",
"dotenv": "^16.4.5",
"express": "^4.19.2",
"fast-xml-parser": "^4.4.0"
```