# gbs-uiAltDisplayTextPlugin
 Display text using tiles from VRAM tileset instead of writing to it
![image](https://github.com/user-attachments/assets/e0de9354-490c-4cab-b0d6-91c8b13c9fe0)
The interface is the same as the default one.
You can configure the mapping between Ascci characters and VRAM tileset tile ids in 
uiAltDisplayTextPlugin\engine\src\data\char_tileset_mapping.c

You must load your "fonts" in VRAM tileset manualy before so that your mapping match the tiles you want to display.
(this event if from the plugin https://github.com/Mico27/gbs-loadTilesetExPlugin)
![image](https://github.com/user-attachments/assets/be804b62-c2a1-4c6b-970a-754cd5997386)
