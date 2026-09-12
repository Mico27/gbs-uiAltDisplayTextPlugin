# gbs-uiAltDisplayTextPlugin

**Version 4.3.0. Requires GB Studio 4.3.0 or newer.**

Draws text out of tiles that are already loaded, rather than building each letter's pixels as it
goes.

That saves the tile slots GB Studio's text renderer normally reserves, which matters when a scene's
art is already using most of them. It also lets a font live in your common tileset, so letters and
scenery share tiles, and it gives pixel-exact fixed-width text where the standard renderer would
space letters by width.

The events appear under **Dialogue** and **Misc**, each starting with **Alt**.

<img width="307" height="288" alt="image" src="https://github.com/user-attachments/assets/1488a9c9-881e-4fae-b3fe-704547596e72" />

---

## Table of Contents

1. [Concepts](#concepts)
2. [Project Setup](#project-setup)
3. [Size Limits and Restrictions](#size-limits-and-restrictions)
4. [Events Reference](#events-reference)
5. [FAQ](#faq)
6. [Memory Footprint](#memory-footprint)
7. [Bank 0 (HOME) Usage](#bank-0-home-usage)
8. [Changelog](#changelog)

---

## Concepts

### How it differs from standard text

GB Studio's text renderer copies each letter's pixels into a free tile slot and then puts that slot
on screen. That uses tile slots, and it happens again every scene.

The Alt events skip that. A list in the font's JSON file says which tile shows which character, and
the event puts those tile numbers straight on screen. No pixels are copied, so the tiles have to be
loaded before the text is drawn.

| | Standard text | Alt text |
|---|---|---|
| Copies pixels while the game runs | Yes | No |
| Uses tile slots to draw | Yes, one per unique letter | No |
| Needs the font tiles loaded first | No | Yes |
| Letters spaced by width | Yes | No, one tile per character |
| Supports the usual text codes | Yes | Yes |

---

## Project Setup

### 1. Write the font mapping

Open the font's JSON file and add a `table` array. Entry number *n* is the tile that shows
character number *n*, counting from character 0. Those tiles have to be present when the text is
drawn.

<img width="787" height="512" alt="image" src="https://github.com/user-attachments/assets/782e0e31-897f-4362-8252-117c58b03d06" />

<img width="1104" height="220" alt="image" src="https://github.com/user-attachments/assets/ff100c0c-5391-4271-a5ff-13a9fe37877b" />

<img width="133" height="46" alt="image" src="https://github.com/user-attachments/assets/0f52bd20-acd2-4af3-86a3-758363569812" />

### 2. Get the font tiles loaded

Two ways.

**Put them in the common tileset.** Add the letters to your project's common tileset image and
GB Studio loads them in every scene. Set the `table` values to the positions they end up in.

**Load them with Alt Load Font tiles.** Call the event in a scene's init script to copy the font
into tiles starting at a position you choose. If the `table` values do not already account for that
position, tick **Adjust font mapping with offset on compile** and the build adds the offset to
every entry.

<img width="728" height="174" alt="image" src="https://github.com/user-attachments/assets/b1a99eb2-289c-4e7c-8ec8-f344914a7aa3" />

> **Watch out:** the adjustment changes the font's table for the whole build, so it can be applied
> once per font. Two events adjusting the same font stop the build with an error. Either bake the
> offset into the font JSON or make sure only one event applies it.

### 3. Use the Alt events

Replace **Display Text** and **Display Dialogue** with their **Alt** versions, and set the font to
the one you configured.

---

## Size Limits and Restrictions

- **Tiles must be loaded first.** Alt text with its font tiles missing draws whatever happens to be
  in those positions.
- **One tile per character.** Every character takes one 8 by 8 cell. There is no width-based
  spacing.
- **Tile numbers wrap at 256.** The background area holds 256 tiles and numbers outside 0 to 255
  wrap around.
- **The offset adjustment applies once per font per build.** If the same font needs different
  positions in different scenes, make separate font assets or bake the offsets into each font's
  JSON.
- **Palettes work as they do for standard text.** On Game Boy Color the current text palette and
  priority apply to the drawn tiles.
- **Every standard text code works**, including speed, positioning, waiting for input, colour, new
  lines, scrolling and escapes.
- **Drawing costs no tile slots.** The font tiles count against the tileset budget only when they
  are part of the common tileset. Loaded with the event, they occupy whichever slots you assign.

---

## Events Reference

All events are under **Dialogue** or **Misc**, each starting with **Alt**.

### Alt Menu

Group: **Dialogue**.

A menu whose options this plugin draws from the tiles already loaded, the same as its other text.
The stock **Menu** event draws through the stock renderer and ignores those tiles.

Everything else matches the stock menu: one row per option, the same box sizing, the same cursor,
navigation and cancel behaviour. Stock menus elsewhere in your project are unaffected.

| Field | Description |
|-------|-------------|
| Set Variable To Selected Option | The chosen option's number, counting from 1. Zero when the menu is cancelled. |
| Number Of Options | 2 to 8. |
| Layout | **Narrow** reproduces the stock menu box on the right. **Full width** gives each option the whole screen. |
| Set To *n* If | The text of option *n*. |
| Last Option Cancels | Choosing the last option sets the variable to 0 instead of its number. |
| Cancel On B Button | B closes the menu and sets the variable to 0. |

### Alt Load Font tiles

Group: **Misc**.

Copies a font's tiles into the background tile area starting at a position you choose. Call it
before any Alt text event that uses those tiles.

| Field | Description |
|-------|-------------|
| Font | The font to load. |
| Offset | The tile position to start writing at, 0 to 255. |
| Length | How many tiles to copy. 0 copies the whole font. |
| Adjust font mapping with offset on compile | Adds the offset to every entry in the font's table at build time. Once per font per build. |

### Alt Load and Display Text To Background Instantly

Group: **Dialogue**.

Draws text onto the scene background at a tile position, all in one frame.

| Field | Description |
|-------|-------------|
| Text | The text to draw. The usual GB Studio formatting and codes apply. |
| X | Column to start at, wrapping at 32. |
| Y | Row to start at, wrapping at 32. |

### Alt Load and Display Text To Overlay

Group: **Misc**.

The same, drawing onto the overlay layer.

| Field | Description |
|-------|-------------|
| Text | The text to draw. |
| X | Column to start at, wrapping at 32. |
| Y | Row to start at, wrapping at 32. |

### Alt Display Loaded Text Instantly

Group: **Dialogue**.

Draws whatever text was last loaded, in one frame. It has no text field of its own.

### Alt Display Loaded Text At Various Speed

Group: **Dialogue**.

Draws the last loaded text at the player's text speed, with fast-forward and text sounds, letting
the rest of the game run between characters. It has no text field of its own.

### Alt Display Text In Dialogue

Group: **Dialogue**.

A full replacement for the standard **Display Text** dialogue event. It opens the dialogue box,
slides it in, draws the text at the player's speed with fast-forward, and slides it out. Multiple
pages, avatars and layout options all work.

**Text tab**

| Field | Description |
|-------|-------------|
| Text | One or more pages, shown in order. |
| Avatar | Optional portrait shown to the left of the text. |

**Layout tab**

| Field | Description |
|-------|-------------|
| Min Height | Smallest box height in tiles. Default 4. |
| Max Height | Largest box height in tiles. Default 7. |
| Text X / Text Y | Where the text starts inside the box. Default 1, 1. |
| Text Scroll Height | How many lines are visible before the box scrolls. |
| Position | **Bottom**, the default, or **Top**. |
| Clear Previous | Clear the box before each page. |
| Show Frame | Draw the border around the box. |

**Behavior tab**

| Field | Description |
|-------|-------------|
| Speed In / Speed Out | How fast the box slides in and out. |
| Close When | **Button Pressed**, the default, **Text Finished** to close after a delay, or **Never** to leave it open while the game continues. |
| Close Button | A, B or Any. |
| Close Delay | How long to wait before closing when set to close on text finished. |

---

## FAQ

**My scene runs out of tiles when text appears. Does this help?**
Yes, and that is the main reason to use it. Standard text takes a tile slot per unique letter on
screen. These events take none, because the letters are already loaded.

**How do I use a pixel-exact fixed-width font?**
Put the font's tiles in your common tileset, write the mapping into the font's JSON, and use the
Alt events. Every character occupies exactly one cell.

**My text came out as scenery tiles or noise.**
The font tiles are not where the mapping says they are. Either the common tileset moved them, or
the **Alt Load Font tiles** offset does not match the numbers in the font's table.

**What is the table in the font JSON?**
A list of tile numbers. Entry 65 is the tile that shows the letter A, entry 66 shows B, and so on.
The Alt events look up each character there.

**Do I have to edit JSON by hand?**
Yes, once per font. After that the font works like any other in the editor.

**Can I still use avatars, multiple pages and the usual dialogue options?**
Yes. **Alt Display Text In Dialogue** carries the full set of layout and behaviour options.

**Can letters share tiles with the scenery?**
Yes. Put both in the common tileset and point the font's table at the shared tiles. A wall tile can
double as a letter if it happens to look right.

**Why does the build fail with an error about the font offset?**
Two events tried to apply the offset adjustment to the same font. Only one may. Bake the offset
into the JSON, or make a second font asset.

**Can I mix Alt text and standard text in one project?**
Yes. The stock events keep working, and the stock menu is untouched.

**Does variable-width text work?**
No. Each character is one tile. Use the standard renderer where you need width-based spacing.

**Does it work with the ContinuousScene or ScreenScroll plugins?**
Yes. Compatibility variants ship for both.

---

## Memory Footprint

Measured against the stock GB Studio **4.3.0-e1** engine at default engine settings, report of
2026-08-13. Figures are the difference against a stock project. Each event you use also compiles a
few bytes of script into your project, on top of the fixed cost below.

| Budget | Cost |
|---|---|
| Bank 0 (HOME) | 0 bytes |
| WRAM | +10 bytes |
| Banked ROM | +1,994 bytes |

- **Bank 0:** nothing. Everything the plugin adds is compiled into a switchable ROM bank.
- **WRAM:** 10 bytes to track the drawing position.
- **Banked ROM:** 1,994 bytes for the renderer and the menu.
- **Engine WRAM headroom:** a stock GB Studio 4.3.0 project leaves about **854 bytes** of WRAM
  free (the engine has 7,776 bytes to work with and uses 6,922 of them). With this plugin
  installed roughly **844 bytes** remain. Adding more global variables to your project does not
  change that figure, because script memory is a fixed 3,584 byte block at stock engine settings.
- **SRAM:** not used.

---

<!-- BANK0:BEGIN -->
## Bank 0 (HOME) Usage

Bank 0 is the 16 KB fixed ROM bank shared by the GB Studio engine core, the
interrupt handlers and the GBDK runtime. Extra banked ROM is cheap to add,
bank 0 is not, so bank 0 is usually the first thing a project runs out of.

| | Bytes |
|---|---|
| Bank 0 used by this plugin | **0** |

**This plugin costs nothing in bank 0.** Everything it adds is compiled into a
switchable ROM bank.
<!-- BANK0:END -->

## Changelog

Grouped by the date each change was merged into the official
[gb-studio-plugins](https://github.com/gb-studio-dev/gb-studio-plugins) repository.

Only bug fixes, new features and feature changes are listed. Engine version bumps, patch
regeneration, packaging fixes and documentation edits are omitted.

### 2026-08-14

- Fixed background text wrapping. A row of the hardware tilemap is 32 cells wide and wraps onto
  itself, so the pen now steps within the row it is drawing on, worked out from its own address.
  The old test compared the pen's row against the row the text started on, which got the wrap
  wrong for right-to-left text and drifted further off as variable-width glyphs moved the pen.

### 2026-08-08

- Added the Alt Menu, whose options are drawn from tiles already loaded. The stock menu is
  untouched.

### 2026-08-02

- Added scrolling to the alt text display.

### 2026-06-28

- Added ContinuousScene and ScreenScroll compatibility.
- Added custom script parameter and stack support to the events.

### 2026-06-08

- Added font loading, using the font's JSON for the tile mapping.

### 2025-02-24

- Initial release.
- Fixed performance issues.
- Added text scrolling.
