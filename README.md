# CSCC09 Project: Tower Takedown

Application URL: towertakedowngame.com

## Team

* Michelle Pasquill

* Angela Zhu

* Dennis Tismenko

## Description of Application

A multiplayer tower defense game that syncs up real time player actions, where players can team up to raid another player's tower. The goal is to use resources to build up your tower defenses to protect against enemy raids, and team up with other players to raid other towers to gain resources.

## Key Features for Beta

* Functioning game

* Frontend for the login, registration, and lobbies

* Backend to support login and registration with a database using MongoDB

* Basic thematic layout for game

* Specific gameplay features/rules to be implemented:

    * one default map for now

    * working enemies, laser turrets, tower, controllable player, and player weapons
    
    * health bar for the tower and player

## Additional Features for Final

* Private game lobby for creating and joining rooms.

* Account to support upgrading tower defenses.

* Specific gameplay features for final

    * multiple players and multiple lobbies

    * multiple enemy types

    * multiple default map choices

    * resources are gained from winning a raid.
    
    * resources are gained from player tower defeating a raiding team.
    

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

