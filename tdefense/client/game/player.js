import Phaser from './phaser.min.js';

export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, type, control) {
    super(scene, x + 35, y, type);

    scene.sys.updateList.add(this);
    scene.sys.displayList.add(this);
    scene.physics.world.enableBody(this);

    this.hp = 1000;
    this.active = true;
    this.blocking = false;
    this.holdingBomb = false;
    this.weapon = null;
    // Whether or not player can control this sprite
    this.control = control;
    this.type = type;
    this.scene = scene;

    // Every second update player health and x and y coordintes for other player
    this.updatePlayer = 1000;

    scene.physics.world.enableBody(this);

    this.setScale(0.6);

    this.setBounceY(0.2);
    this.setBounceX(1);
    this.setCollideWorldBounds(true);

    // Track the arrow keys & WASD
    const { LEFT, RIGHT, UP, DOWN, W, A, S, D, H } = Phaser.Input.Keyboard.KeyCodes;
    this.keys = scene.input.keyboard.addKeys({
      left: LEFT,
      right: RIGHT,
      up: UP,
      down: DOWN,
      w: W,
      a: A,
      s: S,
      d: D,
      h: H
    });
  }

  update(time, delta) {

    const keys = this.keys;

    if (this.active && this.control) {

      if (keys.left.isDown || keys.a.isDown) {

        this.scene.connection.send('left');
        this.moveLeft();

      } else if (keys.right.isDown || keys.d.isDown) {

        this.scene.connection.send('right');
        this.moveRight();

      } else {
        this.resetX();
      }

      if ((Phaser.Input.Keyboard.JustUp(keys.right)) || (Phaser.Input.Keyboard.JustUp(keys.d)) ||
        (Phaser.Input.Keyboard.JustUp(keys.left)) || (Phaser.Input.Keyboard.JustUp(keys.a))) {
          this.scene.connection.send('resetX');
      }

      if ((keys.up.isDown || keys.w.isDown) && this.body.blocked.down) {
        this.scene.connection.send('jump');
        this.jump();
      } else if ((keys.down.isDown || keys.s.isDown) && !this.body.blocked.down) {
        this.scene.connection.send('down');
        this.moveDown();
      }

      // If the pick up button is being held, then set holdingBomb
      if (keys.h.isDown) {
        this.scene.connection.send('pickUp');
        this.pickUp();
      } else {
        this.scene.connection.send('putDown');
        this.putDown();
      }

      if (Phaser.Input.Keyboard.JustUp(keys.h)) {
        this.scene.connection.send('putDown');
      }
      // Every second send an update to other player
      if (this.updatePlayer <= 0) {
        this.scene.connection.send(['update', this.x, this.y, this.hp]);
        this.updatePlayer = 1000;
      }
    }
    this.updatePlayer -= delta;
  }

  recieveDamage(damage) {
    if (!this.blocking) {
      this.hp -= damage;

      this.anims.play(this.type + 'hurt');

      if (this.hp <= 0) {
        this.setTint(0xff0000);
        this.setVelocityX(0);
        this.setVelocityY(0);
        this.flipX = true;
        this.angle = 90;
        this.setActive(false);
      }
    }
  }

  // Player is walking to the left.
  moveLeft() {
    this.setVelocityX(-160);
    if (this.body.blocked.down) {
      this.anims.play(this.type + 'walk', true);
    }

    this.flipX = true;
  }

  // Player is walking to the right.
  moveRight() {
    this.setVelocityX(160);

    if (this.body.blocked.down) {
      this.anims.play(this.type + 'walk', true);
    }

    this.flipX = false;
  }

  // Player is jumping
  jump() {
    this.setVelocityY(-450);

    this.anims.play(this.type + 'jump');
  }

  // Player is moving down faster
  moveDown() {
    this.setVelocityY(300);
  }

  // Resets the X velocity to 0
  resetX() {
    this.setVelocityX(0);

    if (this.body.blocked.down) {
      this.anims.play(this.type + 'turn');
    }
  }

  resetY() {
    this.setVelocityY(0);

    if (this.body.blocked.down) {
      this.anims.play(this.type + 'turn');
    }
  }

  // Player trying to pick up or hold bomb
  pickUp() {
    this.holdingBomb = true;
  }

  // Putting down bomb
  putDown() {
    this.holdingBomb = false;
  }

}
