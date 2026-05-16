# gbs-uiAltDisplayTextPlugin
 Display text using tiles from VRAM tileset instead of writing to it

In the font json as of 4.2.3 you can set the "table" which will map an ascii character to the id of a tile in the VRAM
<img width="787" height="512" alt="image" src="https://github.com/user-attachments/assets/782e0e31-897f-4362-8252-117c58b03d06" />
<img width="1104" height="220" alt="image" src="https://github.com/user-attachments/assets/ff100c0c-5391-4271-a5ff-13a9fe37877b" />
<img width="133" height="46" alt="image" src="https://github.com/user-attachments/assets/0f52bd20-acd2-4af3-86a3-758363569812" />

The events that make uses of this feature is prepended with Alt
<img width="307" height="288" alt="image" src="https://github.com/user-attachments/assets/1488a9c9-881e-4fae-b3fe-704547596e72" />

You must load your "fonts" in VRAM tileset manualy before so that your mapping match the tiles you want to display.
You can do this by using the Load font tiles event (of which you can specify at which offset in the VRAM it is loaded, you can also check "Adjust font mapping with offset on compile"
to modify the font table tile ids to take account of the offset if they are not already adjusted via the font json file.
<img width="728" height="174" alt="image" src="https://github.com/user-attachments/assets/b1a99eb2-289c-4e7c-8ec8-f344914a7aa3" />

Alternatively you can just have the font part of the common tilset.
