import Phaser from './phaser.min.js';
import Bullet from './bullet.js';

export default class Laser extends Phaser.Physics.Arcade.Sprite {

  constructor(scene, x, y, type, dir, ammoType) {
    super(scene, x, y, type);

    scene.sys.updateList.add(this);
    scene.sys.displayList.add(this);
    scene.physics.world.enableBody(this);

    this.scene = scene;

    this.hp = 40;
    this.damage = 10;
    this.active = true;
    this.dir = dir;
    this.nextFire = 0;
    this.ammoType = ammoType;
    // Firing frequency
    this.freq = 1000;
    this.index = 0;

    const anims = scene.anims;

    let frames;

    if (dir == "left") {
      frames = anims.generateFrameNames('laser', {
        start: 1,
        end: 2,
        prefix: 'laserLeft'
      });
    } else if (dir == "right") {
      frames = anims.generateFrameNames('laser', {
        start: 1,
        end: 2,
        prefix: 'laserRight'
      });
    } else if (dir == "down") {
      frames = anims.generateFrameNames('laser', {
        start: 1,
        end: 2,
        prefix: 'laserDown'
      });
    } else if (dir == "up"){
      frames = anims.generateFrameNames('laser', {
        start: 1,
        end: 2,
        prefix: 'laserUp'
      });
    }

    anims.create({
      key: 'fire' + dir,
      frames: frames,
      duration: 1000,
      repeat: -1,
    });

    // If the ammo type is lasers, then up the frequency
    if (this.ammoType == 'laserRedVertical' || this.ammoType == 'laserRedHorizontal') {
      this.freq = 100;
    }

    this.setScale(0.8);
    this.setCollideWorldBounds(true);

    this.anims.play('fire' + dir, true);

  }

  recieveDamage(damage) {
    this.hp -= damage;

    // Remove enemy if their hp is less than 0
    if (this.hp <= 0) {
      this.damage = 0;
      this.setActive(false);
      this.setVisible(false);
      this.destroy();
    }
  }

  update(time, delta) {
    // If this is active and the current player is the host then fire
    if (this.active && (this.nextFire <= 0) && this.body.blocked.down){
      if (this.ammoType == 'laserRedVertical' || this.ammoType == 'laserRedHorizontal') {
        this.fire(0, 0);
        this.nextFire = this.freq;
      } else if (this.scene.playerNumber == 0) {
        this.scene.connection.send(['fire', this.index]);
        this.fire(0, 0);
        this.nextFire = this.freq;
      }
    }
    if (this.active) {
      this.anims.resume();
    } else {
      this.anims.pause();
    }
    this.nextFire -= delta;
  }

  fire(time, delta) {
    let bullet = new Bullet(this.scene, this.x, this.y, this.ammoType);
    this.scene.bullets.add(bullet);
    if (this.dir == "left") {
      bullet.velocityX = -500;
      bullet.velocityY = 0;
    } else if (this.dir == "right") {
      bullet.velocityX = 500;
      bullet.velocityY = 0;
    } else if (this.dir == "up") {
      bullet.velocityX = 0;
      bullet.velocityY = -500;
    } else if (this.dir == "down") {
      bullet.velocityX = 0;
      bulle.velocityY = 500;
    }
    bullet.update(time, delta);
  }

}
