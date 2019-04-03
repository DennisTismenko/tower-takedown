import Phaser from './phaser.min.js';

export default class Bomb extends Phaser.Physics.Arcade.Sprite {

  constructor(scene, x, y, type) {
    super(scene, x+35, y, type);

    scene.sys.updateList.add(this);
    scene.sys.displayList.add(this);
    scene.physics.world.enableBody(this);

    this.scene = scene;

    // No player owns it at first
    this.player = null;
    // Damage is 0 until it goes off
    this.damage = 0;
    // Timer to set off bomb
    this.timer = 10000;
    this.active = true;
    this.new = true;

    scene.anims.create({
      key: 'bombActive',
      frames: [ { key: 'bomb', frame: 'bomb' }, {key: 'bomb', frame: 'bombFlash'} ],
      frameRate: 5,
      repeat: -1
    });

    scene.anims.create({
      key: 'bombBlow',
      frames: [ {key: 'bomb', frame: 'laserRedBurst'} ],
      repeat: 0
    });

    this.setScale(0.6);
    this.anims.play('bombActive', true);

  }

  update(time, delta) {
    // If it is new then add a collider
    if (this.new) {
      this.scene.physics.add.overlap(this, this.scene.players, this.playerOverlap, null, this.scene);
      this.scene.physics.add.overlap(this, this.scene.tower, this.bombHit, null, this.scene);
      let enemyArray = this.scene.enemies.getChildren();
      for (let i = 0; i < enemyArray.length; i++) {
        this.scene.physics.add.overlap(this, enemyArray[i], this.bombHit, null, this.scene);
      }
      this.new = false;
    }
    // If this has already gone off then set it inactive
    if ((this.damage > 0) && (this.timer <= 0)) {
      this.damage = 0;
      this.setActive(false);
      this.setVisible(false);
      this.destroy();
    } else if (this.active) {
      // If it goes off set its damage and blow animation
      if (this.timer <= 0) {
        this.setScale(1);
        this.anims.play('bombBlow');
        this.damage = 25;
        this.timer = 200;
      } else {
        this.timer -= delta;
      }
    }
  }

  bombHit(bomb, victim) {
    victim.recieveDamage(bomb.damage);
  }

  playerOverlap(bomb, player) {
    // If h is being held down then the bomb should follow the player
    if (player.holdingBomb) {
      bomb.setX(player.x);
      bomb.setY(player.y);
    }

    if (bomb.damage > 0) {
      bomb.bombHit(bomb, player);
    }

  }

}
