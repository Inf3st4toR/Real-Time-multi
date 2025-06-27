const colors = ['yellow', 'cyan', 'red'];

class Collectible {
  constructor(id) {
    this.id = id;
    this.x = Math.floor(Math.random() * 620) + 10;
    this.y = Math.floor(Math.random() * 460) + 10;
    this.value = Math.floor(Math.random() * 3) + 1;
    this.color = colors[this.value - 1];
  }
}

module.exports = Collectible;
