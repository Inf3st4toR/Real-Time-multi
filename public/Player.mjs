class Player {

  constructor(id) {
  this.id = id;
  this.color = `rgb(${80 + Math.random()*175|0},${80 + Math.random()*175|0},${80 + Math.random()*175|0})`;
  this.x = 50;
  this.y = 50;
  this.score = 0;
  }

  movePlayer(dir, speed) {
    switch(dir) {
      case 'up':
        if (this.y > 5) this.y -= speed;
        break;
      case 'down':
        if (this.y < 475) this.y += speed;
        break;
      case 'left':
        if (this.x > 5) this.x -= speed;
        break;
      case 'right':
        if (this.x < 635) this.x += speed;
        break;
    }
  }

  collision(item) {
    if ( (this.x - item.x)**2 + (this.y - item.y)**2 < 25 ) return true;
  }

  calculateRank(arr) {
    const rank = arr.map(obj => obj.score).sort((a, b) => b - a)
    for (let i = 0; i < rank.length; i++) {
      if (this.score >= rank[i]) return `Rank: ${i + 1}/${arr.length + 1}`;
    }
    return `Rank: ${arr.length + 1}/${arr.length + 1}`
  }
}

export default Player;
