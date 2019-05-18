<div align="center">
   <h1>Tower Takedown</h1>
</div>

## Description of Application

A multiplayer tower defense game that syncs up real time player actions, where players can team up to raid another player's tower. The goal is to use resources to build up your tower defenses to protect against enemy raids, and team up with other players to raid other towers to gain resources.

## Team

* Michelle Pasquill

* Angela Zhu

* Dennis Tismenko    

## Technology

* Web RTC with PeerJS for the real-time player connection.

* Socket.io for handling lobbies and as a signaling server for Web RTC.

* Phaser.io framework for game development.

* MongoDB Atlas for a cloud hosted NoSQL database.

* React for the frontend.

## Challenges

* **Real-time synchronization:** Using Web RTC and ensuring players receive gameplay data at a relatively low latency, as well as handling disconnects and reconnects 

* **Ensuring security in a private lobby:** JWT authentication for private lobbies

* **Learning a new game dev framework:** Learning how to effectively use the Phaser.io HTML5 game framework will be a challenge, as none of our group members have every used an HTML5 game development framework.

* **2D gameplay/animations:** Using the built in animation support in Phaser.io, by creating sprite sheets for the animations and ensuring that it works well and looks good in the game.

* **Frontend framework:** Learning how to use React for frontend development.

