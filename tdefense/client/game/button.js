import Phaser from './phaser.min.js';
import Bomb from './bomb.js';

export default class Button extends Phaser.Physics.Arcade.Sprite {

  constructor(scene, x, y, type) {
    super(scene, x, y, type);

    scene.sys.updateList.add(this);
    scene.sys.displayList.add(this);
    scene.physics.world.enableBody(this);

    this.scene = scene;
    // One second before the button returns to normal
    this.return = 0;
    this.pressed = false;
    this.setOrigin(0);
    this.setScale(0.6);

  }

  update(time, delta) {
    if (this.return <= 0) {
      this.setTexture("button");
      this.pressed = false;
    } else {
      this.return -= delta;
    }
  }

  // On a button press play
  pressButton() {
    this.setTexture("buttonPress");
    this.return = 1000;
    this.pressed = true;

    // Release a bomb
    let bomb = new Bomb(this.scene, this.x, 0, 'bomb');
    this.scene.bombs.add(bomb);
  }

}
