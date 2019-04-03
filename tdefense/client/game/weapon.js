import Phaser from './phaser.min.js';
import Bullet from './bullet.js';

export default class Weapon extends Phaser.Physics.Arcade.Sprite {

  constructor(scene, x, y, type, player) {
    super(scene, x, y, type);

    scene.sys.updateList.add(this);
    scene.sys.displayList.add(this);
    scene.physics.world.enableBody(this);

    this.scene = scene;

    // The player that owns this weapon
    this.player = player;
    this.damage = 0;
    this.type = type;
    this.active = true;
    this.equipped = true;

    // Set players weapon to this
    this.player.weapon = this;

    if (type == "sword") {
      this.setScale(0.6);
      this.setOrigin(0.5, 1);
    } else if (type == "raygun") {
      this.setScale(0.8);
    }

    // Track the spacebar
    this.space = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.b = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.B);

  }

  update(time, delta) {
    this.setGravityY(-600);

    if (this.player.holdingBomb) {
      this.setVisible(false);
      this.equipped = false;
    } else if (!this.equipped) {
      this.setVisible(true);
      this.equipped = true;
    }
    // Set x and y to follow player
    // If player is flipped, then weapon needs to be flipped
    if (this.player.flipX == true) {
      this.flipX = true;
      this.setX(this.player.x - 25);
    } else {
      this.flipX = false;
      this.setX(this.player.x + 25);
    }
    // If it is the sword, bring it down a bit more
    if(this.type == "sword") {
      this.setY(this.player.y + 20);
      if (this.player.blocking) {
        this.setTexture("shield");
      } else {
        this.setTexture("sword");
      }
    } else {
      this.setY(this.player.y + 5);
    }

    if (this.player.control) {
      // If B is held down then block
      if (this.b.isDown && this.player.active && this.active && this.equipped) {

        this.scene.connection.send('block');
        this.block();

      } else if (Phaser.Input.Keyboard.JustDown(this.space) && this.player.active && this.active && this.equipped) {
        // If the spacebar is down then attack

        this.scene.connection.send('attack');
        this.startAttacking();

      } else {
        this.noAction();
      }

      // If nothing is being pressed then send call to reset actions
      if (this.b.isUp && this.space.isUp) {
        this.scene.connection.send('resetAction');
      }

      if (this.space.isUp) {
        this.scene.connection.send('stopAttack');
        this.stopAttacking();
      }
    }
  }

  attack() {
    if ((this.type == "sword") && !this.player.blocking) {
      this.damage = 50;
      if (this.flipX) {
        this.angle = 305;
      } else {
        this.angle = 55;
      }
    } else if (this.type == "raygun") {
      let bullet = new Bullet(this.scene, this.x, this.y, "laserPurple");
      this.scene.bullets.add(bullet);
      if (this.flipX) {
        bullet.velocityX = -500;
      } else {
        bullet.velocityX = 500;
      }
    }
  }

  // Blocks with the shield.
  block() {
    if (this.type == "sword") {
      this.angle = 0;
      this.player.blocking = true;
      this.damage = 0;
      this.setTexture("shield");
    }
  }

  // Sets to not blocking or attacking
  noAction() {
    this.damage = 0;
    this.player.blocking = false;
  }

  // Start attacking
  startAttacking() {
    this.attack();
    this.player.blocking = false;
  }

  // Stop attacking
  stopAttacking() {
    this.angle = 0;
  }

}
