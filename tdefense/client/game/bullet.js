import Phaser from './phaser.min.js';

export default class Bullet extends Phaser.Physics.Arcade.Sprite {

  constructor(scene, x, y, type) {
    super(scene, x, y, type);

    scene.sys.updateList.add(this);
    scene.sys.displayList.add(this);
    scene.physics.world.enableBody(this);

    this.scene = scene;

    this.lifeSpan = 5000;
    this.damage = 25;
    this.addListener = true;
    this.velocityX = 500;
    this.velocityY = 0;
    this.gravityY = -600;
    this.active = true;
    this.type = type;

    // True if it is a laser bullet
    this.turret = false;

    if (this.type != 'laserPurple') {
      this.turret = true;
    }

    if (this.type == 'mint') {
      this.setScale(0.5);
    }

  }

  update(time, delta) {
    this.setGravityY(-600);
    this.setVelocityX(this.velocityX);
    this.setVelocityY(this.velocityY);

    // Add hitListener on first update.
    if (this.addListener && this.type == 'laserPurple') {
      this.addListener = false;
      let enemyArray = this.scene.enemies.getChildren();
      for (let i = 0; i < enemyArray.length; i++) {
        this.scene.physics.add.collider(this, enemyArray[i], this.bulletHit, null, this.scene);
      }

    }
    else if (this.addListener && this.turret){
      this.damage = 100;
      this.addListener = false;
      this.scene.physics.add.collider(this, this.scene.players, this.bulletHit, null, this.scene);

    }

    if (this.lifeSpan <= 0) {
      this.setActive(false);
      this.setVisible(false);
      this.destroy();
    }

    this.lifeSpan -= delta;
  }

  bulletHit(bullet, victim) {
    victim.recieveDamage(bullet.damage);
    bullet.remove();
  }

  // Removes the bullet from the game
  remove() {
    this.active = false;
    this.setVisible(false);
    this.destroy();
  }

}
