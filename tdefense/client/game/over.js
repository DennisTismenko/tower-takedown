import Phaser from './phaser.min.js';
import Assets from '../assets/**/*.*';

export default class Over extends Phaser.Scene{

    constructor(){
      super({key: 'over'});
    }

    init(data){
        this.connection = data.connection;
        this.win = data.win;
        this.players = data.players;
        this.lvl = data.lvl;
        if (this.lvl > 10) this.lvl = 10;
        this.gold = (5 * this.lvl) * this.players;
        this.exp = (10 * this.lvl) * this.players;

        let adminResults = [0, 0];
        if (this.win == false){
            adminResults = [this.gold, this.exp];
            this.gold = this.gold * 0.5;
            this.exp = this.exp * 0.5;
        }
        let playerResults = [this.gold, this.exp];

        let results = [adminResults, playerResults];
        // If it is the host, then send this information to the other player
        if (data.player == 0) {
          this.connection.send(['results', results]);
        }
    }

    preload(){
        this.load.image('bg', Assets.base.Tiles.castleCenter.png);
    }

    create(){
        this.add.image(768, 350, 'grasslands').setScale(1.5);
        this.add.image(300, 290, 'bg').setScale(3.5);
        this.add.image(535, 290, 'bg').setScale(3.5);
        this.add.image(775, 290, 'bg').setScale(3.5);

        let txt = this.win ? "YOU WIN!" : "YOU LOSE!"
        this.gameover = this.add.text(440, 200, txt, { fontSize: '32px', fill: '#000' });
        this.add.text(440, 240, "Gold: " + this.gold, { fontSize: '20px', fill: '#000' });
        this.add.text(440, 260, "Exp: " + this.exp, { fontSize: '20px', fill: '#000' });

        // set up web rtc
    }

    update(){

    }
}
