import Phaser from './phaser.min.js';

export default class Enemy extends Phaser.Physics.Arcade.Sprite {

  constructor(scene, x, y, type, tiles) {
    // Call the super constructor for a Sprite
    super(scene, x, y, type);

    // Update the scene to include this Sprite
    scene.sys.updateList.add(this);
    scene.sys.displayList.add(this);
    scene.physics.world.enableBody(this);

    this.scene = scene;

    // The index of this enemy in enemyArray
    this.index = 0;

    // Health of the enemy
    this.hp = 100;
    // Damage the enemy causes to players
    this.damage = 20;

    // The number of tiles the enemy movement should occupy
    this.tiles = tiles;
    this.origX = x;
    this.origY = y;

    this.active = true;
    this.start = true;
    this.velocityX = 0;
    this.velocityY = 0;
    this.gravityY = 0;

    // Enemies respawn after 15 seconds.
    this.respawn = 15000;
    // They give a 3 second warning before regenerating
    this.activateTime = 0;
    this.reset = false;
    this.spawned = true;

    const anims = scene.anims;

    let frames = null;
    let frameRate = 5;

    // Create animation based on type of enemy
    if (type == "wingMan") {
      this.velocityY = 80;
      this.gravityY = -600;
      this.setScale(0.4);
      frames = anims.generateFrameNames('wingMan', {
        start: 1,
        end: 5,
        prefix: 'wingMan'
      });
      frameRate = 6;
    } else if (type == "spikeMan") {
      this.velocityX = 80;
      this.setScale(0.4);
      frames = anims.generateFrameNames('spikeMan', {
        start: 1,
        end: 2,
        prefix: 'spikeMan_walk'
      });
      frameRate = 5;
    } else if (type == "spinner") {
      // Non destructable
      this.hp = -1;
      frames = [ { key: 'spinner', frame: 'spinnerHalf'},
      { key: 'spinner', frame: 'spinnerHalf_spin' } ];
      frameRate = 15;
    } else if (type == "spikesBottom") {
      // Non destructable
      this.hp = -1;
    } else if (type == "spikesTop") {
      // Non destructable and should collide with bottom of platforms
      this.hp = -1;
      this.gravityY = -1000;
    }

    if(frames != null) {
      anims.create({
        key: 'move' + type,
        frames: frames,
        frameRate: frameRate,
        repeat: -1,
        yoyo: true
      });

      this.anims.play('move' + type, true);
    }

    this.setBounce(0.2);
    this.setOrigin(0);
    this.flipX = true;

    this.setCollideWorldBounds(true);

  }

  recieveDamage(damage) {
    if (this.spawned && (this.hp > 0)) {
      this.hp -= damage;

      // Remove enemy if their hp is less than 0
      if (this.hp <= 0) {
        this.die();
        this.scene.connection.send(['kill', this.index]);
      }
    }
  }

  die() {
    this.damage = 0;
    this.setVisible(false);
    this.scene.physics.world.disableBody(this.body);
    // Reset respawn time
    this.respawn = 15000;
    this.spawned = false;
    this.reset = false;
  }

  update(time, delta) {

    // On the first update, initialize enemy movement
    if (this.start) {
      this.start = false;
      this.setCollideWorldBounds(true);
      this.setImmovable(true);
      this.setGravityY(this.gravityY);
      this.setVelocityX(this.velocityX);
      this.setVelocityY(this.velocityY);
      this.flipX = !(this.flipX);
      this.velocityX = 0 - this.velocityX;
      this.velocityY = 0 - this.velocityY;
    } else if (this.spawned) {
      // Get whether the enemy needs to turn yet
      let turnAround = false;
      let dist = (70 * this.tiles) - 54;
      if (this.velocityY != 0) {
        turnAround = (this.y > (dist + this.origY)) || (this.y < this.origY);
      } else {
        turnAround = (this.x > (dist + this.origX)) || (this.x < this.origX);
      }

      // If the enemy has reached the end, turn it around.
      if (turnAround) {
        this.setVelocityX(this.velocityX);
        this.setVelocityY(this.velocityY);
        this.flipX = !(this.flipX);
        this.velocityX = 0 - this.velocityX;
        this.velocityY = 0 - this.velocityY;
        // Set the x or y to prevent it getting stuck
        if (this.velocityX < 0) {
          this.x = this.origX;
        } else if (this.velocityX > 0) {
          this.x = dist + this.origX;
        } else if (this.velocityY < 0) {
          this.y = this.origY;
        } else if (this.velocityY > 0) {
          this.y = dist + this.origY
        }
      }
    } else {
      // If not active then check for respawn
      if ((this.respawn <= 0) && !this.reset) {
        this.setActive(true);
        this.setVisible(true);
        this.setAlpha(0.5);
        this.x = this.origX;
        this.y = this.origY;
        this.hp = 100;
        this.activateTime = 3000;
        this.reset = true;
      } else if (this.activateTime <= 0 && this.reset) {
        this.damage = 20;
        this.spawned = true;
        this.setVisible(true);
        this.setAlpha(1);
        this.scene.physics.world.enableBody(this);
      }
      this.respawn -= delta;
      this.activateTime -= delta;
    }

    // If this is the host player then send the enemy movements
    if (this.scene.playerNumber == 0) {
      this.scene.connection.send(['position', this.index, this.x, this.y, this.flipX]);
    }

  }

}
