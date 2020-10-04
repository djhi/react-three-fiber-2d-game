# Notes

Things I plan to either do or experiment with, in no particular order

- Checkout whether velocity, speed, acceleration and friction (either applied via inputs for player or code for npcs/enemies) can all be handled through use-cannon
- Tilemaps: probably gonna steal @coldi code
- Auto tilemaps: Gonna assume a format for this, at least at the beginning
- Stats: character and enemies stats for example (health, maxhealth, speed, damage, etc.)
- IA for enemies: Will **try** to add https://github.com/Mugen87/yuka
- Retry implementing hurtboxes and hitboxes: invislbe collisions shapes independant of the rendered ones. In a nutshell, having multiple collisions shapes on an entity, for different purposes
- Pickups: objects a player can pick up (think weapons, powerups, etc.)
- Scene transitions and global game state
- Fix the damn camera. Currently have weird props on it. Probably related to the canvas setup as well.
- YSort: ability to move a gameobject behind or in front of another, depending on some conditions (for example, their Y position). Ex: make the player either hide behind a bush and step in front of it
- Jumps! Having tiles where the player can fall and on which they can jump over.
- Invincibility. Ex: player could be invincible when rolling, or after being hit.
