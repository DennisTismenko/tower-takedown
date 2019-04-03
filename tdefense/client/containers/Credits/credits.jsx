import React, { Component } from 'react';
import { BrowserRouter as Router, Link} from "react-router-dom";

export default class Credits extends Component {
    render() {
        return (
            <React.Fragment>
                <header>
                    <Link to="/" id="title">Tower Takedown</Link>
                </header>
                <h1>Credits</h1>
                <h2>HTML, CSS and Javascript code</h2>
                <ul>
                    <li><a href="http://stackoverflow.com/">Stackoverflow</a></li>
                    <li><a href="https://www.w3schools.com/">w3schools.com</a></li>
                    <li><a href="https://developer.mozilla.org/en-US/">MDN web docs</a></li>
                    <li><a href="https://thierrysans.me/CSCC09/">CSCC09 course materials</a></li>
                </ul>
                <h2>Phaser.io</h2>
                <ul>
                    <li><a href="https://phaser.io/learn">Phaser.io tutorials and API docs</a></li>
                    <li><a href="https://labs.phaser.io/">Phaser examples</a></li>
                    <li><a href="https://medium.com/@michaelwesthadley/modular-game-worlds-in-phaser-3-tilemaps-1-958fc7e6bbd6"> =Phaser 3 tilemaps tutorial</a></li>
                    <li><a href="https://www.codeandweb.com/texturepacker/tutorials/how-to-create-sprite-sheets-for-phaser3">Animation tutorial</a></li>
                    <li><a href="https://itnext.io/modular-game-worlds-in-phaser-3-tilemaps-2-dynamic-platformer-3d68e73d494a">Tutorial on tile maps</a></li>
                    <li><a href="http://www.html5gamedevs.com">HTML 5 Game Devs</a></li>
                    <li><a href="https://www.youtube.com">YouTube tutorials</a></li>
                </ul>
                <h2>React</h2>
                <ul>
                    <li><a href="https://jedwatson.github.io/react-select/">react-select examples</a></li>
                </ul>
                <h2>Assets</h2>
                <ul>
                    <li><a href="https://www.kenney.nl">Kenney</a></li>
                    <li><a href="https://www.leshylabs.com/apps/sstool/">SpriteSheet Maker Tool</a></li>
                </ul>
            </React.Fragment>
        );
    }
}