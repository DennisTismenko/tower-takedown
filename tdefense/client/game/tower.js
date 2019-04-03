import Phaser from './phaser.min.js';

export default class Tower extends Phaser.Physics.Arcade.Sprite {

  constructor(scene, x, y, type) {
    super(scene, x, y, type);

    scene.sys.updateList.add(this);
    scene.sys.displayList.add(this);
    scene.physics.world.enableBody(this);

    this.hp = 1000;
    this.maxhp = 1000;
    this.active = true;

    this.scene = scene;

    this.setScale(0.8);

    this.setCollideWorldBounds(true);
    this.setImmovable(true);

  }

  recieveDamage(damage) {
    this.hp -= damage;

    // Remove enemy if their hp is less than 0
    if (this.hp <= 0) {
      this.scene.passingData.win = true;
      // Send this info over connection in case health wasn't synced
      this.scene.connection.send(['over', this.scene.passingData]);
      this.scene.scene.start('over', this.scene.passingData);
    }
  }

  update(time, delta) {

  }

}
