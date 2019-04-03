class Room {
    constructor(name, gameAdmin, maxCapacity) {
        this.name = name;
        this.gameAdmin = gameAdmin;
        this.maxCapacity = maxCapacity;
        this.players = [];
        this.isGameActive = false;
    }

    addPlayer(player) {
        if (this.players.length < this.maxCapacity) {
            this.players.push(player);
        }
    }

    size() {
        return this.players.length;
    }
}

module.exports = Room;
