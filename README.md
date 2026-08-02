# gbs-uiAltDisplayTextPlugin

**Version 4.3.0 — Requires GB Studio ≥ 4.3.0**

A GB Studio engine plugin that provides an alternative method of displaying text. Instead of writing font pixel data into VRAM tile slots at runtime (as the standard Variable Width Font renderer does), this plugin references tiles that are **already present in VRAM** and maps characters to those existing tile IDs. This preserves VRAM tile budget, enables pixel-perfect fixed-width fonts stored in the common tileset, and makes it possible to share graphical tiles between the background and the text renderer.

All events added by this plugin appear in the script editor under the **Dialogue** or **Misc** groups and are prefixed with **Alt** to distinguish them from their standard counterparts.

<img width="307" height="288" alt="image" src="https://github.com/user-attachments/assets/1488a9c9-881e-4fae-b3fe-704547596e72" />

---

## Table of Contents

1. [How It Differs from Standard Text](#how-it-differs-from-standard-text)
2. [Project Setup](#project-setup)
3. [Technicalities and Restrictions](#technicalities-and-restrictions)
4. [Events Reference](#events-reference)
5. [Inner Workings](#inner-workings)
6. [Memory Footprint](#memory-footprint)

---

## How It Differs from Standard Text

GB Studio's built-in text system uses a Variable Width Font (VWF) renderer. When displaying text it copies the raw pixel bitmaps of each character into free VRAM tile slots and then references those slots on the background/window tilemap. This consumes VRAM tile budget and requires font data to be written every time a scene is loaded.

The **Alt Display Text** plugin skips that step entirely. It reads the font's **recode table** — a character-to-tile-ID mapping stored in the font's JSON `table` field — and writes those tile IDs directly to the VRAM tilemap. No pixel data is ever written; the tiles must already exist in VRAM before the text is rendered.

| | Standard text | Alt text |
|---|---|---|
| Tile data written to VRAM at runtime | Yes | No |
| Tiles consumed from VRAM budget | Yes (one per unique glyph) | No |
| Font tiles must be pre-loaded | No | Yes |
| Variable-width glyph support | Yes | No (fixed mapping per tile) |
| Supports all standard text control codes | Yes | Yes |

---

## Project Setup

### 1. Create the Font Mapping

Open your font's JSON file and add a `table` array. Each entry in the array is the VRAM tile ID that corresponds to the ASCII character at that index (starting from ASCII 0). The tile IDs must point to tiles that will actually be present in VRAM when the text is rendered.

<img width="787" height="512" alt="image" src="https://github.com/user-attachments/assets/782e0e31-897f-4362-8252-117c58b03d06" />

<img width="1104" height="220" alt="image" src="https://github.com/user-attachments/assets/ff100c0c-5391-4271-a5ff-13a9fe37877b" />

<img width="133" height="46" alt="image" src="https://github.com/user-attachments/assets/0f52bd20-acd2-4af3-86a3-758363569812" />

### 2. Make Font Tiles Available in VRAM

There are two ways to ensure the font tiles are in VRAM at the right tile IDs:

**Option A — Include tiles in the common tileset**

Add the font tiles directly to your project's common tileset image. GB Studio will load them into VRAM automatically on every scene. Set the `table` values to match the tile IDs those tiles occupy in VRAM.

**Option B — Load font tiles at runtime with Alt Load Font tiles**

Use the **Alt Load Font tiles** event in a scene's init script to copy the font's bitmap data into VRAM at a chosen tile offset. If the `table` values in the font JSON are not yet adjusted for the chosen offset, check the **Adjust font mapping with offset on compile** option — the compiler will add the offset value to every entry in the font's `table` array at build time.

<img width="728" height="174" alt="image" src="https://github.com/user-attachments/assets/b1a99eb2-289c-4e7c-8ec8-f344914a7aa3" />

> **Important:** `Adjust font mapping with offset on compile` modifies the font table globally during compilation. It can only be applied **once per font** per build. If two events attempt to adjust the same font's table the compiler will throw an error. Either pre-bake the offset into the font JSON or ensure only one event applies the adjustment.

### 3. Use Alt Display Events

Replace standard **Display Text** and **Display Dialogue** events with their **Alt** counterparts. Set the font to the one whose `table` you have configured. The text will be rendered by looking up tile IDs from the table and writing them to the tilemap instead of going through the VWF renderer.

---

## Technicalities and Restrictions

- **Tiles must be loaded before rendering.** If the font's tiles are not in VRAM at the expected positions when an Alt text event runs, the wrong tiles (or garbage) will be displayed.
- **Fixed tile width only.** Because each character maps to exactly one tile (8×8 px), there is no variable-width support. Every character occupies one tile cell on the tilemap.
- **Tile IDs wrap at 256.** Tile ID arithmetic is done modulo 256. VRAM holds 256 tiles in the background tileset region (0x8000–0x8FFF on DMG/GBC), so IDs outside 0–255 wrap around automatically.
- **Adjust font mapping can only be applied once per font.** The offset adjustment is a compile-time mutation of the font's `table` array. Applying it from two different events for the same font in the same build causes a compile error. If you need to load the same font at different offsets in different scenes you must create separate font assets or pre-bake the offsets into each font's JSON.
- **CGB palette attributes are written alongside tiles.** On CGB hardware the plugin writes the current `text_palette` value to VRAM bank 1 alongside each tile ID, using the same `overlay_priority` flag as standard dialogue. Palette assignment behaves identically to standard text.
- **All standard GB Studio text control codes are supported.** The character printer processes speed codes, goto/relative-goto positioning, wait-for-input, colour codes, newlines, scroll codes, and escape sequences in the same way as the standard renderer.
- **No VRAM tile budget is consumed for rendering.** Because no bitmaps are written, the font tiles count against the tileset budget only if they are part of the common tileset (Option A). If loaded via Alt Load Font tiles they occupy whatever tile slots you assign.

---

## Events Reference

All events are in the **Dialogue** or **Misc** group and are prefixed with **Alt**.

---

### Alt Load Font tiles

**`EVENT_UI_ALT_LOAD_FONT`** — group: Misc

Copies a font's bitmap data into VRAM background tile slots starting at a given offset. Must be called before any Alt text event that relies on those tiles.

| Field | Description |
|-------|-------------|
| Font | The GB Studio font asset to load. |
| Offset | The VRAM tile slot index (0–255) to begin writing at. |
| Length | Number of tiles to copy. Set to 0 to copy all tiles in the font. |
| Adjust font mapping with offset on compile | When checked, the compiler adds the Offset value to every entry in the font's `table` array so tile IDs in the table align with the loaded position. Can only be applied once per font per build. |

---

### Alt Load and Display Text To Background Instantly

**`EVENT_UI_ALT_DISPLAY_TEXT`** — group: Dialogue

Renders text directly to the **background** tilemap layer at the specified tile position, with no animation delay. The entire text string is written in a single frame.

| Field | Description |
|-------|-------------|
| Text | The text to display. Supports standard GB Studio text formatting and control codes. |
| X | Tile column on the background tilemap to begin writing (wraps at 32). |
| Y | Tile row on the background tilemap to begin writing (wraps at 32). |

---

### Alt Load and Display Text To Overlay

**`EVENT_UI_ALT_DISPLAY_TEXT_OVERLAY`** — group: Misc

Renders text directly to the **window/overlay** tilemap layer at the specified tile position, with no animation delay.

| Field | Description |
|-------|-------------|
| Text | The text to display. |
| X | Tile column on the overlay tilemap to begin writing (wraps at 32). |
| Y | Tile row on the overlay tilemap to begin writing (wraps at 32). |

---

### Alt Display Loaded Text Instantly

**`EVENT_UI_ALT_DISPLAY_LOADED_TEXT`** — group: Dialogue

Immediately renders whatever text was most recently prepared by a `_loadStructuredText` call (i.e. text staged by a preceding event or raw script). Useful when you need to load text through another mechanism and then render it with the Alt renderer. No text input field — operates on the currently loaded text buffer.

---

### Alt Display Loaded Text At Various Speed

**`EVENT_UI_ALT_DISPLAY_LOADED_TEXT_SPEED`** — group: Dialogue

Renders the currently loaded text buffer using the dialogue-speed system: respects the `text_draw_speed` setting, the fast-forward input, and text sound effects. The script yields each frame so other game systems continue to update. No text input field — operates on the currently loaded text buffer.

---

### Alt Display Text In Dialogue

**`EVENT_UI_ALT_DISPLAY_TEXT_DIALOGUE`** — group: Dialogue

A full drop-in replacement for the standard **Display Text** dialogue event. Opens the overlay dialogue window, animates it in, renders the text through the Alt renderer (respecting text speed and fast-forward), then animates the window out. Supports multiple text pages, avatars, layout customisation, and all standard dialogue behaviour options.

**Text tab**

| Field | Description |
|-------|-------------|
| Text | One or more pages of text. Each page is rendered in sequence. |
| Avatar | Optional avatar sprite shown to the left of the text. |

**Layout tab**

| Field | Description |
|-------|-------------|
| Min Height | Minimum height of the dialogue box in tiles. Default: 4. |
| Max Height | Maximum height of the dialogue box in tiles. Default: 7. |
| Text X / Text Y | Tile offset of the text cursor inside the dialogue box. Default: 1, 1. |
| Text Scroll Height | Maximum lines of text visible before the box scrolls. |
| Position | `Bottom` (default) or `Top` of the screen. |
| Clear Previous | Whether to clear the dialogue box before rendering each page. |
| Show Frame | Whether to draw the UI frame border around the box. |

**Behavior tab**

| Field | Description |
|-------|-------------|
| Speed In / Speed Out | Overlay slide-in and slide-out animation speed. |
| Close When | `Button Pressed` (default), `Text Finished` (auto-close after a delay), or `Never (non-modal)`. |
| Close Button | Which button closes the dialogue: A, B, or Any. |
| Close Delay | When closing on text finished, the number of frames/seconds to wait before closing. |

---

## Inner Workings

### Font Recode Table

The heart of the plugin is the font's `recode_table`, which is compiled from the `table` array in the font JSON. At runtime, `ReadBankedUBYTE(vwf_current_font_desc.recode_table + character_code, vwf_current_font_bank)` translates any incoming character byte into the VRAM tile ID to place at that tilemap cell. This is a single banked byte read per character — cheaper than the VWF path which must compose and blit pixel data.

### Character Printer (`ui_alt_draw_text_buffer_char`)

This function mirrors the structure of the standard GB Studio text printer but substitutes the VWF pixel-writing step with a direct `set_vram_byte` call:

1. **Initialisation** (first call, `ui_alt_text_ptr == 0`): snapshots the current speed mask, fast-forward joypad flag, and text draw speed, then points the read pointer at `ui_text_data` (the shared text buffer populated by `_loadStructuredText`) and the write pointer at `text_render_base_addr`.
2. **Control code dispatch**: the function loops over the text buffer, handling the full set of GB Studio text control codes:
   - `0x00` — end of string; sets `ui_alt_text_drawn = TRUE` and resets state.
   - `0x01` — inline speed change.
   - `0x03` — absolute goto XY (resets both base and current destination pointers).
   - `0x04` — relative goto XY.
   - `0x06` — wait for button press; yields if the button has not been pressed yet.
   - `0x0a` (`\n`) — carriage return (advances base pointer to next row).
   - `0x0b` — CGB palette change.
   - `0x0d` (`\r`) — linefeed with optional scroll: if the destination would go past the scroll area, `scroll_rect` shifts the window content up one row on both VRAM banks.
   - `0x05` — escape: treat the next byte as a literal character.
3. **Printable character**: looks up the tile ID via the recode table and calls `ui_alt_set_tile`, which writes the palette attribute to VRAM bank 1 (on CGB) and then writes the tile ID to VRAM bank 0. The destination pointer is incremented. A wrap-around guard prevents the pointer from accidentally crossing a 32-tile VRAM row boundary when the text position is at the edge of a tilemap row.

### Instant vs. Speed Rendering

- **`ui_alt_display_text`** calls `ui_alt_draw_text_buffer_char` in a tight loop until `ui_alt_text_drawn` is set — no frame yielding, no sound, no input. The entire text block is rendered in one call.
- **`ui_alt_display_dialogue`** is a waitable VM function. Each call renders characters for the current frame (one or more depending on `text_draw_speed` and fast-forward state), plays the text sound effect if one is configured, then returns `FALSE` to yield back to the VM so the game loop can update cameras, actors, scroll, and OAM. It returns `TRUE` only when the full text has been drawn. The dialogue event wrapper (`ui_alt_display_dialogue_modal`) runs its own update loop for the modal use case.

### Tile Writing and CGB Support

`ui_alt_set_tile` is an inline helper that on CGB hardware:
1. Switches to VRAM bank 1 (`VBK_REG = 1`).
2. Writes `overlay_priority | (text_palette & 0x07)` to the attribute byte for the tile cell.
3. Switches back to VRAM bank 0 (`VBK_REG = 0`).
4. Writes the tile ID itself.

On DMG hardware the CGB block is compiled out and only the tile ID write occurs.

### Compile-Time Font Table Adjustment

When **Adjust font mapping with offset on compile** is checked on an **Alt Load Font tiles** event, the compiler's `eventUiAltLoadFont.js` mutates the font object's `table` array in place during the build by adding the specified `offset` to every entry. A per-font flag (`offsetted_fonts_cache`) is checked first — if the same font has already been adjusted in this build the compiler throws an error, preventing double-offset corruption. The adjusted `table` is what becomes the `recode_table` in the compiled ROM, so no runtime offset arithmetic is needed.

---

## Memory Footprint

Measured against the stock GB Studio **4.3.0-e1** engine (per-file SDCC compile with GB Studio's build flags, default engine settings). Values are the plugin's *delta* versus the stock engine; DMG build, with CGB noted where it differs. ROM cost lands in banked ROM (GB Studio's autobanker spreads it across switchable banks); using the plugin's events additionally compiles a few bytes of GBVM script per call into your project's script banks.

| | Cost |
|---|---|
| WRAM | +10 bytes |
| ROM | +1,414 bytes (DMG) / +1,529 bytes (CGB) |

- **WRAM:** 10 bytes of alternate text-rendering state.
- **Engine WRAM headroom:** the stock GB Studio 4.3.0 engine leaves about **854 bytes** of WRAM free (usable engine WRAM is 7,776 bytes at 0xC0A0–0xDF00; the stock engine uses 6,922 bytes). With this plugin installed roughly **844 bytes** remain. This figure does not depend on how many global variables your project defines: the script memory array has a fixed size of VM_HEAP_SIZE + (VM_MAX_CONTEXTS × VM_CONTEXT_STACK_SIZE) words — 768 + 16 × 64 = 1,792 words (3,584 bytes) with stock engine settings.
- **SRAM:** not used.

---

<!-- BANK0:BEGIN -->
## Bank 0 (HOME) Usage

Bank 0 is the 16 KB non-switchable ROM bank that the GB Studio engine core,
the interrupt handlers and the GBDK runtime all share. Banked ROM is cheap
(add another bank), bank 0 is not, so it is usually the first thing a project
runs out of.

| | Bytes |
|---|---|
| Bank 0 used by this plugin | **+31** |
| Bank 0 free with this plugin installed | **1,420** of 16,384 (91% used) |

Everything else this plugin adds lives in banked ROM.

| Module | This plugin | Stock engine | Bank 0 cost |
|---|---|---|---|
| `vm_ui.c` | 709 | 678 | +31 |

Modules that replace or patch a stock engine file only cost the *difference*:
the stock version's bank 0 bytes were being spent anyway.

<details><summary>How this was measured</summary>

GB Studio 4.3.2, DMG target, default engine settings. Each module's bank 0
contribution is the `A _HOME size` record that SDCC writes into its `.rel`
object, summed over the engine sources this plugin provides. Stock sizes come
from building projects whose only plugin ships no engine C, so every module in
them is the untouched engine; two such builds were compared and agreed on all
73 shared modules.

The "free" figure is a stock project with this plugin and nothing else. Your
own number will differ: other plugins, and any engine settings that change what
the core compiles, move it independently of this plugin.

</details>
<!-- BANK0:END -->
