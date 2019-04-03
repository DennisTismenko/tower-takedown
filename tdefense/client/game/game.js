import Phaser from './phaser.min.js';
//import io from 'socket.io-client';
import Assets from '../assets/**/*.*';
import Player from './player.js';
import Enemy from './enemy.js';
import Weapon from './weapon.js';
import Tower from './tower.js';
import Laser from './laser.js';
import Button from './button.js';

import Over from './over.js';

//const socket = io.connect();

const game = (connection, mapType, weapons, level, host) => {
  const config = {
    type: Phaser.AUTO,
    parent: 'content',
    width: 1050,
    height: 560,
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 600 },
        debug: false
      }
    },
    scene: [{
      key: 'main',
      preload: preload,
      create: create,
      update: update
    }, Over]
  };

  const game = new Phaser.Game(config);

  let scene;
  let initialized = false;
  let otherPlayer;
  let map;
  let platforms;
  let lavaTiles;
  let tower;
  let health;
  let healthBar;
  let healthBox;
  let graphics;
  let laserSwitch = 3000;
  let enemyArray;

  let healthBarWidth = 800;

  function preload() {

    // HUD
    this.load.image('heartFull', Assets.base.hud.hud_heartFull.png);
    this.load.image('heartEmpty', Assets.base.hud.hud_heartEmpty.png);
    this.load.image('heartHalf', Assets.base.hud.hud_heartHalf.png);
    this.load.image('alienBlueIcon', Assets.animations.Spritesheets.alienBlue_badge1.png);
    this.load.image('alienGreenIcon', Assets.animations.Spritesheets.alienGreen_badge1.png);
    this.load.image('alienPinkIcon', Assets.animations.Spritesheets.alienPink_badge1.png);
    this.load.image('alienYellowIcon', Assets.animations.Spritesheets.alienYellow_badge1.png);

    // Sprites
    this.load.atlas('alienBlue', Assets.animations.Spritesheets.blueAlien.png, Assets.animations.Spritesheets.blueAlien.json);
    this.load.atlas('alienGreen', Assets.animations.Spritesheets.greenAlien.png, Assets.animations.Spritesheets.greenAlien.json);
    this.load.atlas('alienPink', Assets.animations.Spritesheets.pinkAlien.png, Assets.animations.Spritesheets.pinkAlien.json);
    this.load.atlas('alienYellow', Assets.animations.Spritesheets.yellowAlien.png, Assets.animations.Spritesheets.yellowAlien.json);

    // Enemies
    this.load.atlas('spikeMan', Assets.animations.Spritesheets.spikeMan.png, Assets.animations.Spritesheets.spikeMan.json);
    this.load.atlas('wingMan', Assets.animations.Spritesheets.wingMan.png, Assets.animations.Spritesheets.wingMan.json);
    this.load.atlas('spinner', Assets.animations.Spritesheets.spinner.png, Assets.animations.Spritesheets.spinner.json);
    this.load.image('spikesBottom', Assets.ice.Tiles.spikesBottomAlt.png);
    this.load.image('spikesTop', Assets.ice.Tiles.spikesTopAlt.png);

    // Weapons
    this.load.image('sword', Assets.weapons.Tiles.swordGold.png);
    this.load.image('shield', Assets.weapons.Tiles.shieldGold.png);
    this.load.image('raygun', Assets.weapons.Tiles.raygun.png);
    this.load.image('laserPurple', Assets.weapons.Tiles.laserPurpleDot.png);
    this.load.atlas('bomb', Assets.weapons.bomb.png, Assets.weapons.bomb.json);
    this.load.image('button', Assets.base.Items.buttonBlue.png);
    this.load.image('buttonPress', Assets.base.Items.buttonBlue_pressed.png);

    // Lasers
    this.load.atlas('laser', Assets.weapons.laser.png, Assets.weapons.laser.json);
    this.load.image('snowBall', Assets.ice.Tiles.snowBall.png);
    this.load.image('laserRedHorizontal', Assets.weapons.Tiles.laserRedHorizontal.png);
    this.load.image('laserRedVertical', Assets.weapons.Tiles.laserRedVertical.png);
    this.load.image('mint', Assets.candy.Tiles.lollipopGreen.png);
    this.load.image('fireball', Assets.base.Items.fireball.png);

    // Background
    this.load.image('grasslands', Assets.mushroom.Backgrounds.bg_grasslands.png);
    this.load.image('castle', Assets.mushroom.Backgrounds.bg_castle.png);

    // Decorations
    this.load.image('cloud', Assets.base.Items.cloud1.png);

    this.load.image('torch', Assets.base.Tiles.tochLit.png);
    this.load.image('metalFence', Assets.weapons.Tiles.metalFence.png);

    this.load.image('snowPile', Assets.ice.Tiles.snowBallBigGround.png);
    this.load.image('pineTree', Assets.ice.Tiles.pineSapling.png);
    this.load.image('candyCane', Assets.ice.Tiles.caneGreenSmall.png);
    this.load.image('icePlant', Assets.ice.Tiles.plantAlt.png);

    this.load.image('pinkCane', Assets.candy.Tiles.canePinkSmall.png);
    this.load.image('cream', Assets.candy.Tiles.creamVanilla.png);
    this.load.image('cupcake', Assets.candy.Tiles.cupCake.png);
    this.load.image('heart', Assets.candy.Tiles.heart.png);
    this.load.image('yellowTop', Assets.candy.Tiles.lollipopFruitYellow.png);
    this.load.image('greenTop', Assets.candy.Tiles.lollipopFruitGreen.png);
    this.load.image('stick', Assets.candy.Tiles.lollipopBaseBrown.png);

    this.load.image('fence', Assets.buildings.Tiles.fenceLow.png);
    this.load.image('bush', Assets.mushroom.bush.png);
    this.load.image('plant', Assets.base.Items.plant.png);

    // Platforms
    this.load.image('ground', Assets.jumper.Images.Environment.ground_grass.png);
    this.load.image('tile', Assets.base.platforms.png);
    this.load.image('lava', Assets.base.Tiles.liquidLavaTop_mid.png);
    this.load.image('ice', Assets.ice.Tiles.iceWaterDeepStars.png);

    // Tower
    this.load.image('tower', Assets.buildings.tower.png);
    this.load.image('igloo', Assets.buildings.igloo.png);
    this.load.image('candyHouse', Assets.buildings.candyhouse.png);
    this.load.image('church', Assets.buildings.church1.png);

  }

  function create() {
    this.connection = connection;

    scene = this;

    this.players = this.physics.add.group({runChildUpdate: true});
    this.lasers = this.physics.add.group({ runChildUpdate: true });
    this.enemies = this.physics.add.group({ runChildUpdate: true });
    lavaTiles = this.physics.add.group();
    this.weapons = this.physics.add.group({ runChildUpdate: true });
    this.bullets = this.physics.add.group({ runChildUpdate: true });
    this.bombs = this.physics.add.group({runChildUpdate: true});

    // Handle recieved RTC data
    this.connection.on('data', function(data) {
      handleMessage(data);
    });

    this.player0 = null;
    this.player1 = null;
    console.log(host);
    if (host) {
      this.playerNumber = 0;
    } else {
      this.playerNumber = 1;
    }

    initializeGame(mapType);

    this.passingData = {win: false, players: 2, lvl: level, connection: connection, player: this.playerNumber};

  }

  function update(time ,delta) {

    if (initialized) {
      //player.update();
      this.button.update(time, delta);
      updateHealthBar(this.player0, 0);
      updateHealthBar(this.player1, 1);
      //updateHealthBar(this.player2, 2);
      //updateHealthBar(this.player3, 3);
      updateTowerHealthBar();

      // If the map type is church, then check if laser need to be switched
      if ((mapType == "grass") && (laserSwitch <= 0) && (this.playerNumber == 0)) {
        laserSwitch = 3000;
        switchLaser();
        this.connection.send('switch');
      }

      if (!this.player0.active) {
        if (this.player1 == null) {
          // game over
          this.scene.start('over', this.passingData);
        } else if (!this.player1.active) {
          // game over
          this.scene.start('over', this.passingData);
        }
      }

      laserSwitch -= delta;
    }

  }

  function handleMessage(data) {
    if (Array.isArray(data)) {
      if ((data[0] == 'map') && !initialized) {
        initialized = true;
        initializeGame(data[1]);
      } else if ((data[0] == 'setWeapon') && !initialized) {
        weapons.push(data[1]);
      } else if ((data[0] == 'setWeapon') && initialized) {
        let weapon1 = new Weapon(scene, 120, 400, data[1], scene.player1);
        scene.weapons.add(weapon1);
      }
    }
    console.log(initialized);
    // If game has loaded then accept other types of messages
    if (initialized) {
      // If it is the church map, then check for laser switch messages
      if ((mapType == "grass") && (data == 'switch')) {
        switchLaser();
      }
      // Handle player actions
      console.log(otherPlayer.active);
      if (otherPlayer.active) {
        if (data == 'left') {
          otherPlayer.moveLeft();
        } else if (data == 'right') {
          otherPlayer.moveRight();
        } else if (data == 'resetX') {
          otherPlayer.resetX();
        } else if (data == 'jump') {
          otherPlayer.jump();
        } else if (data == 'down') {
          otherPlayer.moveDown();
        } else if (data == 'pickUp') {
          otherPlayer.pickUp();
        } else if (data == 'putDown') {
          otherPlayer.putDown();
        } else if (data == 'attack') {
          otherPlayer.weapon.startAttacking();
        } else if (data == 'block') {
          otherPlayer.weapon.block();
        } else if (data == 'resetAction') {
          otherPlayer.weapon.noAction();
        } else if (data == 'stopAttack') {
          otherPlayer.weapon.stopAttacking();
        }
      }

      // If data is an array then check array
      if (Array.isArray(data)) {
        if (data[0] == 'update') {
          otherPlayer.x = data[1];
          otherPlayer.y = data[2];
          otherPlayer.hp = data[3];
        } else if (data[0] == 'kill') {
          let i = data[1];
          enemyArray[i].die();
        } else if (data[0] == 'position') {
          let i = data[1];
          enemyArray[i].x = data[2];
          enemyArray[i].y = data[3];
          enemyArray[i].flipX = data[4];
        } else if (data[0] == 'over') {
          scene.scene.start('over', data[1]);
        } else if (data[0] == 'fire') {
          let laserArray = scene.lasers.getChildren();
          let i = data[1];
          laserArray[i].fire(0, 0);
        }
      }
    }
  }

  function hitListener(attacker, victim) {
    victim.recieveDamage(attacker.damage);
  }

  function lavaDamage(player, lava) {
    player.recieveDamage(5);
  }

  function switchLaser() {
    let laserArray = scene.lasers.getChildren();
    let nextLaser;
    // Get the active laser index
    for (let i = 0; i < laserArray.length; i++) {
      if (laserArray[i].active) {
        nextLaser = i + 1;
        // Set it to inactive
        laserArray[i].active = false;
        break;
      }
    }
    // Set next laser to active
    if (nextLaser == 4) {
      nextLaser = 0;
    }
    laserArray[nextLaser].active = true;

  }

  function destroyBullet(bullet, platform) {
    bullet.remove();
  }

  function spawnBomb(button, player) {
    let bombs = this.bombs.getChildren();
    if (bombs.length <= 0) {
      button.pressButton();
    }
  }

  function initializeGame(type) {
    if (type == "castle") {
      initializeCastle();
    } else if (type == "grass") {
      initializeChurch();
    } else if (type == "ice") {
      initializeSnow();
    } else {
      initializeCandy();
    }
    // Get other player
    if (scene.playerNumber == 0) {
      otherPlayer = scene.player1;
    } else {
      otherPlayer = scene.player0;
    }

    platforms.setCollisionBetween(0, 29);


    health = scene.add.group();


    let weapon0 = new Weapon(scene, 120, 400, weapons[0], scene.player0);
    scene.weapons.add(weapon0);
    if (weapons.length > 1) {
      let weapon1 = new Weapon(scene, 120, 400, weapons[1], scene.player1);
      scene.weapons.add(weapon1);
    }

    //this.weapons.add(new Weapon(this, 120, 400, 'raygun', this.player2));
    //this.weapons.add(new Weapon(this, 120, 400, 'sword', this.player3));

    scene.physics.add.collider(scene.tower, platforms);

    scene.physics.add.collider(scene.players, platforms);

    scene.physics.add.collider(scene.enemies, platforms);

    scene.physics.add.collider(scene.lasers, platforms);

    scene.physics.add.collider(scene.bullets, platforms, destroyBullet, null, scene);

    scene.physics.add.collider(scene.button, platforms);
    scene.physics.add.overlap(scene.button, scene.players, spawnBomb, null, scene);

    scene.physics.add.collider(scene.bombs, platforms);

    scene.physics.add.overlap(scene.players, lavaTiles, lavaDamage, null, scene);

    enemyArray = scene.enemies.getChildren();
    let weaponArray = scene.weapons.getChildren();

    // Add colliders between enemies and players, and enemies and swords
    for (let i = 0; i < enemyArray.length; i++) {
      // Set the index for this enemy
      enemyArray[i].index = i;
      scene.physics.add.collider(enemyArray[i], scene.players, hitListener, null, scene);
      for (let j = 0; j < weaponArray.length; j++) {
        if (weaponArray[j].type == "sword") {
          scene.physics.add.overlap(weaponArray[j], enemyArray[i], hitListener, null, scene);
        }
      }
    }

    // Set depth of laser turrets to be above the bullets, and set its index
    let laserArray = scene.lasers.getChildren();
    for (let i = 0; i < laserArray.length; i++) {
      laserArray[i].setDepth(1);
      laserArray[i].index = i;
    }

    initializePlayer(scene.player0, 0, 'alienBlue');
    initializePlayer(scene.player1, 1, 'alienGreen');
    //initializePlayer(this.player2, 2, 'alienPink');
    //initializePlayer(this.player3, 3, 'alienYellow');

    createTowerHealthBar(scene);
  }

  // Initializes player animations and health bars.
  function initializePlayer(player, playerNum, type) {
    player.setCollideWorldBounds(true);

    // Starting x coordinte for health bar
    let start = playerNum * 150;
    health.create(start + 5, 530, type + 'Icon').setOrigin(0).setScale(0.5).setDepth(2);
    health.create(start + 30, 530, 'heartFull').setOrigin(0).setScale(0.5).setDepth(2);
    health.create(start + 60, 530, 'heartFull').setOrigin(0).setScale(0.5).setDepth(2);
    health.create(start + 90, 530, 'heartFull').setOrigin(0).setScale(0.5).setDepth(2);

    // Initialize the animations
    let frames = scene.anims.generateFrameNames(type, {
      start: 1,
      end: 2,
      prefix: type + '_walk'
    });

    scene.anims.create({
      key: type + 'walk',
      frames: frames,
      frameRate: 10,
      repeat: -1
    });

    scene.anims.create({
      key: type + 'turn',
      frames: [ { key: type, frame: type} ],
      frameRate: 20
    });

    scene.anims.create({
      key: type + 'jump',
      frames: [ { key: type, frame: type + '_jump'} ],
      frameRate: 20
    });

    scene.anims.create({
      key: type + 'hurt',
      frames: [ { key: type, frame: type + '_hurt'} ],
      frameRate: 20
    });
  }

  // Updates the player health bar
  function updateHealthBar(player, playerNum) {
    let healthArray = health.getChildren();
    let arrayStart = playerNum * 4
    if ((player.hp <= 833) && (player.hp > 667)) {
      healthArray[arrayStart + 1].setTexture('heartHalf');
      healthArray[arrayStart + 1].flipX = true;
    } else if ((player.hp <= 667) && (player.hp > 501)) {
      healthArray[arrayStart + 1].setTexture('heartEmpty');
    } else if ((player.hp <= 501)  && (player.hp > 335)) {
      healthArray[arrayStart + 2].setTexture('heartHalf');
      healthArray[arrayStart + 2].flipX = true;
    } else if ((player.hp <= 335)  && (player.hp > 166)) {
      healthArray[arrayStart + 2].setTexture('heartEmpty');
    } else if ((player.hp <= 166)  && (player.hp > 0)) {
      healthArray[arrayStart + 3].setTexture('heartHalf');
      healthArray[arrayStart + 3].flipX = true;
    } else if (player.hp <= 0) {
      healthArray[arrayStart + 3].setTexture('heartEmpty');
    }
  }

  function updateTowerHealthBar(){
    if (tower.hp >= 0){
      let hp = tower.maxhp - tower.hp;
      let ratio = hp/tower.maxhp;
      healthBox.x = (healthBarWidth + 30) - (healthBarWidth * ratio);
      healthBox.width = (healthBarWidth * ratio);
      graphics.fillStyle(0x666666);
      graphics.fillRectShape(healthBox);
    }

  }

  function createTowerHealthBar(scene){
    healthBox = new Phaser.Geom.Rectangle(healthBarWidth + 30, 20,  1, 20);
    healthBar = new Phaser.Geom.Rectangle(30, 20, healthBarWidth, 20);

    // scene.add.graphics().fillRectShape(healthBox);
    graphics = scene.add.graphics();

    graphics.fillStyle(0xabe060);
    graphics.fillRectShape(healthBar);

    graphics.fillStyle(0x666666);
    graphics.fillRectShape(healthBox);
  }

  function initializeChurch() {
    // Set backround
    scene.add.image(768, 350, 'grasslands').setScale(1.5);

    // Add clouds
    scene.add.image(140, 140, 'cloud').setAlpha(0.6);
    scene.add.image(500, 100, 'cloud').setAlpha(0.6);
    scene.add.image(1000, 150, 'cloud').setAlpha(0.6);
    scene.add.image(700, 210, 'cloud').setAlpha(0.6);
    scene.add.image(665, 270, 'cloud').setAlpha(0.6);

    // Set the map
    const level = [
      [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
      [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
      [-1, 15, 25, -1, -1, -1, -1, -1, -1, -1, -1, -1, 29, -1, -1],
      [-1, -1, -1, -1, 29, -1, -1, -1, -1, -1, -1, -1, 15, 20, 25],
      [-1, -1, -1, 29, 24, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
      [-1, 15, 20, 20, 25, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
      [-1, -1, -1, -1, -1, -1, 15, 20, 25, -1, 24, -1, -1, -1, -1],
      [0, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 10],
    ];
    map = scene.make.tilemap({data: level, tileWidth: 70, tileHeight: 70});
    let tiles = map.addTilesetImage("tile");
    platforms = map.createDynamicLayer(0, tiles, 0, 0);

    // Add the tower
    tower = new Tower (scene, 525, 250, 'church');
    scene.tower = tower;

    //Set Decorations
    scene.add.image(map.tileToWorldX(7) + 35, map.tileToWorldY(6) + 35, 'bush');
    scene.add.image(map.tileToWorldX(14) + 20, map.tileToWorldY(6) + 35, 'bush');
    scene.add.image(map.tileToWorldX(6) + 35, map.tileToWorldY(5) + 35, 'fence');
    scene.add.image(map.tileToWorldX(8) + 35, map.tileToWorldY(5) + 35, 'fence');
    scene.add.image(map.tileToWorldX(1) + 35, map.tileToWorldY(6) + 35, 'plant');
    scene.add.image(map.tileToWorldX(2) + 35, map.tileToWorldY(4) + 35, 'plant');
    scene.add.image(map.tileToWorldX(9) + 35, map.tileToWorldY(6) + 35, 'plant');

    // Add the players
    scene.player0 = new Player(scene,  map.tileToWorldX(2), map.tileToWorldY(4), 'alienBlue', scene.playerNumber == 0);
    scene.player1 = new Player(scene,  map.tileToWorldX(14), map.tileToWorldY(0), 'alienGreen', scene.playerNumber == 1);
    //scene.player2 = new Player(scene,  map.tileToWorldX(14), map.tileToWorldY(5), 'alienPink', false);
    //scene.player3 = new Player(scene,  map.tileToWorldX(0), map.tileToWorldY(0), 'alienYellow', false);
    scene.players.add(scene.player0);
    scene.players.add(scene.player1);
    //scene.players.add(scene.player2);
    //scene.players.add(scene.player3);

    // Add bomb button
    scene.button = new Button(scene, map.tileToWorldX(2), map.tileToWorldY(1), 'button');

    // Add enemies
    scene.enemies.add(new Enemy(scene, map.tileToWorldX(1), map.tileToWorldY(1), "spinner", 1));
    scene.enemies.add(new Enemy(scene, map.tileToWorldX(13), map.tileToWorldY(2), "spinner", 1));
    scene.enemies.add(new Enemy(scene, map.tileToWorldX(12), map.tileToWorldY(6), "spinner", 1));
    scene.enemies.add(new Enemy(scene, map.tileToWorldX(2), map.tileToWorldY(6), "spikeMan", 4));
    scene.enemies.add(new Enemy(scene, map.tileToWorldX(10), map.tileToWorldY(1), "wingMan", 4));
    scene.enemies.add(new Enemy(scene, map.tileToWorldX(5), map.tileToWorldY(1), "wingMan", 4));

    // Add Lasers
    let laser0 = new Laser(scene, map.tileToWorldX(10) + 35, map.tileToWorldY(5), 'laser', 'left', 'laserRedHorizontal');
    let laser1 = new Laser(scene, map.tileToWorldX(6), map.tileToWorldY(6), 'laser', 'up', 'laserRedVertical');
    let laser2 = new Laser(scene, map.tileToWorldX(4) + 35, map.tileToWorldY(2), 'laser', 'right', 'laserRedHorizontal');
    let laser3 = new Laser(scene, map.tileToWorldX(9), map.tileToWorldY(6), 'laser', 'up', 'laserRedVertical');
    scene.lasers.add(laser0);
    scene.lasers.add(laser1);
    scene.lasers.add(laser2);
    scene.lasers.add(laser3);

    // Set all laser expect for laser0 to be inactive
    laser1.active = false;
    laser2.active = false;
    laser3.active = false;

  }

  function initializeSnow() {
    // Set backround
    scene.add.image(768, 350, 'castle').setScale(1.5);

    // Add clouds
    scene.add.image(140, 140, 'cloud').setAlpha(0.6);
    scene.add.image(500, 100, 'cloud').setAlpha(0.6);
    scene.add.image(1000, 150, 'cloud').setAlpha(0.6);
    scene.add.image(700, 210, 'cloud').setAlpha(0.6);
    scene.add.image(665, 270, 'cloud').setAlpha(0.6);

    // Set the map
    const level = [
      [7, 7, 12, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
      [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
      [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 17, 27, -1, -1, -1],
      [22, 22, 27, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
      [-1, -1, -1, -1, -1, 17, 27, -1, -1, -1, -1, -1, -1, 17, 27],
      [-1, -1, -1, -1, -1, -1, -1, 17, 27, -1, -1, -1, -1, -1, -1],
      [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 7],
      [2, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 12]
    ];
    map = scene.make.tilemap({data: level, tileWidth: 70, tileHeight: 70});
    let tiles = map.addTilesetImage("tile");
    platforms = map.createDynamicLayer(0, tiles, 0, 0);

    // Add the tower
    tower = new Tower (scene, 805, 300, 'igloo');
    scene.tower = tower;

    //Set Decorations
    scene.add.image(map.tileToWorldX(3) + 35, map.tileToWorldY(6) + 35, 'pineTree');
    scene.add.image(map.tileToWorldX(4), map.tileToWorldY(6) + 35, 'pineTree');
    scene.add.image(map.tileToWorldX(14) + 35, map.tileToWorldY(5) + 35, 'pineTree');
    scene.add.image(map.tileToWorldX(12) + 35, map.tileToWorldY(6) + 35, 'candyCane');
    scene.add.image(map.tileToWorldX(8) + 35, map.tileToWorldY(4) + 35, 'snowPile');
    scene.add.image(map.tileToWorldX(2) + 35, map.tileToWorldY(2) + 35, 'snowPile');
    scene.add.image(map.tileToWorldX(11) + 35, map.tileToWorldY(1) + 35, 'icePlant');
    scene.add.image(map.tileToWorldX(5) + 35, map.tileToWorldY(3) + 35, 'icePlant');

    // Add the players
    scene.player0 = new Player(scene,  map.tileToWorldX(7), map.tileToWorldY(4), 'alienBlue', scene.playerNumber == 0);
    scene.player1 = new Player(scene,  map.tileToWorldX(10), map.tileToWorldY(0), 'alienGreen', scene.playerNumber == 1);
    //scene.player2 = new Player(scene,  map.tileToWorldX(14), map.tileToWorldY(5), 'alienPink', false);
    //scene.player3 = new Player(scene,  map.tileToWorldX(1), map.tileToWorldY(2) + 35, 'alienYellow', false);
    scene.players.add(scene.player0);
    scene.players.add(scene.player1);
    //scene.players.add(scene.player2);
    //scene.players.add(scene.player3);

    // Add bomb button
    scene.button = new Button(scene, map.tileToWorldX(0), map.tileToWorldY(2), 'button');

    // Add enemies
    scene.enemies.add(new Enemy(scene, map.tileToWorldX(0), map.tileToWorldY(1), "spikesTop", 1));
    scene.enemies.add(new Enemy(scene, map.tileToWorldX(1), map.tileToWorldY(1), "spikesTop", 1));
    scene.enemies.add(new Enemy(scene, map.tileToWorldX(2), map.tileToWorldY(1), "spikesTop", 1));
    scene.enemies.add(new Enemy(scene, map.tileToWorldX(13), map.tileToWorldY(6), "spikesBottom", 1));
    scene.enemies.add(new Enemy(scene, map.tileToWorldX(3), map.tileToWorldY(6), "spikeMan", 6));
    scene.enemies.add(new Enemy(scene, map.tileToWorldX(5), map.tileToWorldY(3), "spikeMan", 2));

    // Add Lasers
    scene.lasers.add(new Laser(scene, map.tileToWorldX(15), map.tileToWorldY(3), 'laser', 'left', 'snowBall'));
    scene.lasers.add(new Laser(scene, map.tileToWorldX(0), map.tileToWorldY(6), 'laser', 'right', 'snowBall'));


  }

  function initializeCandy() {
    // Set backround
    scene.add.image(768, 350, 'grasslands').setScale(1.5);

    // Add clouds
    scene.add.image(140, 140, 'cloud').setAlpha(0.6);
    scene.add.image(500, 100, 'cloud').setAlpha(0.6);
    scene.add.image(1000, 150, 'cloud').setAlpha(0.6);
    scene.add.image(700, 210, 'cloud').setAlpha(0.6);
    scene.add.image(665, 270, 'cloud').setAlpha(0.6);

    // Set the map
    const level = [
      [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
      [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 18],
      [-1, -1, -1, -1, -1, -1, -1, -1, -1, 18, 23, 28, -1, -1, -1],
      [-1, -1, -1, -1, 18, 23, 28, -1, -1, -1, -1, -1, -1, -1, -1],
      [23, 28, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 18, 23],
      [-1, -1, -1, -1, -1, -1, -1, 18, 28, -1, -1, -1, -1, -1, -1],
      [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 8],
      [3, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 13]
    ];
    map = scene.make.tilemap({data: level, tileWidth: 70, tileHeight: 70});
    let tiles = map.addTilesetImage("tile");
    platforms = map.createDynamicLayer(0, tiles, 0, 0);

    // Add the tower
    tower = new Tower (scene, 805, 300, 'candyHouse');
    scene.tower = tower;

    //Set Decorations
    scene.add.image(map.tileToWorldX(13) + 35, map.tileToWorldY(6) + 35, 'pinkCane');
    scene.add.image(map.tileToWorldX(3) + 35, map.tileToWorldY(6) + 35, 'cupcake');
    scene.add.image(map.tileToWorldX(3) + 35, map.tileToWorldY(5) + 35, 'cream');
    scene.add.image(map.tileToWorldX(3) + 35, map.tileToWorldY(5) + 10, 'heart').setScale(0.6);
    scene.add.image(map.tileToWorldX(8) + 35, map.tileToWorldY(3) + 35, 'yellowTop');
    scene.add.image(map.tileToWorldX(8) + 35, map.tileToWorldY(4) + 35, 'stick');
    scene.add.image(map.tileToWorldX(0) + 35, map.tileToWorldY(2) + 35, 'greenTop');
    scene.add.image(map.tileToWorldX(0) + 35, map.tileToWorldY(3) + 35, 'stick');

    // Add the players
    scene.player0 = new Player(scene,  map.tileToWorldX(7), map.tileToWorldY(4), 'alienBlue', scene.playerNumber == 0);
    scene.player1 = new Player(scene,  map.tileToWorldX(14), map.tileToWorldY(0), 'alienGreen', scene.playerNumber == 1);
    //scene.player2 = new Player(scene,  map.tileToWorldX(14), map.tileToWorldY(5), 'alienPink', false);
    //scene.player3 = new Player(scene,  map.tileToWorldX(0), map.tileToWorldY(0), 'alienYellow', false);
    scene.players.add(scene.player0);
    scene.players.add(scene.player1);
    //scene.players.add(scene.player2);
    //scene.players.add(scene.player3);

    // Add bomb button
    scene.button = new Button(scene, map.tileToWorldX(10), map.tileToWorldY(1), 'button');

    // Add enemies
    scene.enemies.add(new Enemy(scene, map.tileToWorldX(9), map.tileToWorldY(6), "spikeMan", 5));
    scene.enemies.add(new Enemy(scene, map.tileToWorldX(12), map.tileToWorldY(6), "spikeMan", 2));
    scene.enemies.add(new Enemy(scene, map.tileToWorldX(9), map.tileToWorldY(1), "spikeMan", 3));
    scene.enemies.add(new Enemy(scene, map.tileToWorldX(4), map.tileToWorldY(2), "spikeMan", 3));
    scene.enemies.add(new Enemy(scene, map.tileToWorldX(3), map.tileToWorldY(6), "spikeMan", 5));
    scene.enemies.add(new Enemy(scene, map.tileToWorldX(2), map.tileToWorldY(2), "wingMan", 5));
    scene.enemies.add(new Enemy(scene, map.tileToWorldX(8), map.tileToWorldY(1), "wingMan", 4));
    scene.enemies.add(new Enemy(scene, map.tileToWorldX(12), map.tileToWorldY(0) + 10, "wingMan", 4));

    // Add Lasers
    scene.lasers.add(new Laser(scene, map.tileToWorldX(15), map.tileToWorldY(3), 'laser', 'left', 'mint'));
    scene.lasers.add(new Laser(scene, map.tileToWorldX(0), map.tileToWorldY(6), 'laser', 'right', 'mint'));

  }

  function initializeCastle() {
    // Set backround
    scene.add.image(768, 350, 'castle').setScale(1.5);

    // Set the map
    const level = [
      [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
      [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 16, 21],
      [26, -1, -1, 21, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
      [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 16, 21, 26, -1, -1],
      [-1, -1, -1, -1, -1, -1, 16, 21, 26, -1, -1, -1, -1, -1, -1],
      [-1, -1, 16, 26, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
      [-1, -1, -1, -1, -1, -1, -1, -1, -1, 16, 26, -1, -1, -1, -1],
      [11, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 1],
    ];
    map = scene.make.tilemap({data: level, tileWidth: 70, tileHeight: 70});
    let tiles = map.addTilesetImage("tile");
    platforms = map.createDynamicLayer(0, tiles, 0, 0);

    // Replace all lava tiles with working lava sprites
    platforms.forEachTile(function (tile) {
      if (tile.index == 9) {
        const x = tile.getCenterX();
        const y = tile.getCenterY();

        let lava = lavaTiles.create(x, y, 'lava');
        lava.setCollideWorldBounds(true);
        lava.setDepth(1);

        map.removeTileAt(tile.x, tile.y);
      }
    });

    // Add the tower
    tower = new Tower (scene, 525, 0, 'tower');
    scene.tower = tower;

    //Set Decorations
    scene.add.image(map.tileToWorldX(2) + 35, map.tileToWorldY(2) + 35, 'torch');
    scene.add.image(map.tileToWorldX(5) + 35, map.tileToWorldY(2) + 35, 'torch');
    scene.add.image(map.tileToWorldX(9) + 35, map.tileToWorldY(2) + 35, 'torch');
    scene.add.image(map.tileToWorldX(12) + 35, map.tileToWorldY(2) + 35, 'torch');
    scene.add.image(map.tileToWorldX(6) + 35, map.tileToWorldY(3) + 35, 'metalFence');
    scene.add.image(map.tileToWorldX(8) + 35, map.tileToWorldY(3) + 35, 'metalFence');
    scene.add.image(map.tileToWorldX(0) + 35, map.tileToWorldY(6) + 35, 'metalFence');
    scene.add.image(map.tileToWorldX(14) + 35, map.tileToWorldY(6) + 35, 'metalFence');

    // Add the players
    scene.player0 = new Player(scene,  map.tileToWorldX(2), map.tileToWorldY(4), 'alienBlue', scene.playerNumber == 0);
    scene.player1 = new Player(scene,  map.tileToWorldX(9), map.tileToWorldY(4), 'alienGreen', scene.playerNumber == 1);
    //scene.player2 = new Player(scene,  map.tileToWorldX(0), map.tileToWorldY(6), 'alienPink', false);
    //scene.player3 = new Player(scene,  map.tileToWorldX(0), map.tileToWorldY(0), 'alienYellow', false);
    scene.players.add(scene.player0);
    scene.players.add(scene.player1);
    //scene.players.add(scene.player2);
    //scene.players.add(scene.player3);

    // Add bomb button
    scene.button = new Button(scene, map.tileToWorldX(13), map.tileToWorldY(0), 'button');

    // Add enemies
    scene.enemies.add(new Enemy(scene, map.tileToWorldX(14), map.tileToWorldY(0), "spinner", 1));
    scene.enemies.add(new Enemy(scene, map.tileToWorldX(0), map.tileToWorldY(6), "spinner", 1));
    scene.enemies.add(new Enemy(scene, map.tileToWorldX(5), map.tileToWorldY(1), "wingMan", 5));
    scene.enemies.add(new Enemy(scene, map.tileToWorldX(9), map.tileToWorldY(2), "wingMan", 3));
    scene.enemies.add(new Enemy(scene, map.tileToWorldX(0), map.tileToWorldY(3) + 5, "wingMan", 3));
    scene.enemies.add(new Enemy(scene, map.tileToWorldX(6), map.tileToWorldY(3), "spikeMan", 3));
    scene.enemies.add(new Enemy(scene, map.tileToWorldX(10), map.tileToWorldY(2), "spikeMan", 3));

    // Add lasers
    scene.lasers.add(new Laser(scene, map.tileToWorldX(3) + 35, map.tileToWorldY(1), 'laser', 'right', 'fireball'));

  }

  return game;
}

const Game = { run: game };
export default Game;
