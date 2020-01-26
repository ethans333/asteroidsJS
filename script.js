/*
Created By @ethans33 - 1/22/20


  TO-DO
  -add powerups
  -add black hole
*/

let ship = {
  x: 250,
  y: 250,
  width: 10,
  vY: 0,
  vX: 0,
  thrust: 3, //ship velocity
  angle: 10,
  color: '#F2F2F2',
  fireTrailLength: 10,
  hitBoxWidth: 25,
  decal: 'USA'

}

let
  fire, trail = [], stars = [], starAmount = 50, asteroids = [], bullets = [], particles = [],
  asteroidColor = '#e6e6e6', showHitbox = false, asteroidAmount = 20, bulletColor = 'salmon',
  bulletVelocity = 3, fireRate = 10, particleSpeed = 3, fireParticles = [], godMode = false,
  win = false, gameOver = false, menu = document.getElementById('menu'), isPlaying = false,
  btnStart = document.getElementById('btnStart'), level = 1, showLevel = 0, asteroidSpeed = .75,
  eightBitMode = false, starColor = 'white';
;


function setup() {
  createCanvas(500, 500)
  angleMode(DEGREES)
  //Stars
  for (i = 0; i < starAmount; i++) {
    stars.push({
      x: random(canvas.width),
      y: random(canvas.height)
    })
  }
  //Font
  textFont('Lacquer')
}

function draw() {
  background('#171717')

  //Stars
  for (i = 0; i < starAmount; i++) {
    stroke(starColor)
    fill(starColor)
    circle(stars[i].x, stars[i].y, 1)
  }

  if (isPlaying) {
    //Hide Menu
    menu.style.visibility = 'hidden';

    //8 bit Mode
    if (eightBitMode) {
      strokeWeight(10)
      ship.decal = '';
      showHitbox = false;
    }

    //Movement
    if (keyIsDown(UP_ARROW)) {
      ship.vY = -cos(ship.angle) * ship.thrust;
      ship.vX = sin(ship.angle) * ship.thrust;
      fire = true;
    } else {
      if (ship.vX > 0) {
        ship.vX -= ship.thrust / 100;
      } else {
        ship.vX += ship.thrust / 100;
      }
      if (ship.vY > 0) {
        ship.vY -= ship.thrust / 100;
      } else {
        ship.vY += ship.thrust / 100;
      }
      fire = false;
    }

    //Ship Out Of Bounds
    if (ship.x > canvas.width + ship.width) {
      ship.x = 0 - ship.width;
    } else if (ship.x < 0 - ship.width) {
      ship.x = canvas.width + ship.width;
    } else if (ship.y > canvas.height + ship.width) {
      ship.y = 0 - ship.width;
    } else if (ship.y < 0 - ship.width) {
      ship.y = canvas.height + ship.width;
    }


    //Fire Trail
    if (trail.length == ship.fireTrailLength) {
      trail.shift()
    }

    trail.push({
      x: ship.x,
      y: ship.y
    })

    if (fire) {
      stroke('crimson')
      fill('crimson')
      for (i = 0; i < trail.length; i++) {
        circle(trail[i].x - 5, trail[i].y - 5, i)
      }

      stroke('pink')
      fill('pink')
      for (i = 0; i < trail.length; i++) {
        circle(trail[i].x - 5, trail[i].y - 5, i / 3)
      }

      //Asteroid Particles

      //Create particles
      if (fireParticles.length < 10) {
        for (i = 0; i < random(5); i++) { fireParticles.push(new Particle(ship.x, ship.y, random(10, 30))); }
      } else {
        fireParticles.shift()
      }

      //Show particles
      for (i = 0; i < fireParticles.length; i++) {
        if (floor(random(0, 3)) == 1) {
          stroke('#d41e48')
          fill('#d41e48')
        } else {
          stroke('#331ED4')
          fill('#331ED4')
        }

        fireParticles[i].display()
      }
    } else {
      fireParticles = [];
      stroke('grey')
      fill('grey')
      circle(ship.x - ship.width / 2, ship.y - 5, 5)
    }

    //Rotate Ship
    push()
    translate(ship.x - ship.width / 2, ship.y - ship.width / 2)
    rotate(ship.angle)

    //Draw Ship
    stroke(ship.color)
    fill(ship.color)
    triangle(
      0, //x1
      0 - (ship.width * 2), //y1
      0 - ship.width, //x2
      0, //y2
      0 + ship.width, //x3
      0 //y3
    )

    textSize(7)
    stroke('#171717')
    fill('#171717')
    textFont('Arial')
    text(ship.decal, 0, -2)

    stroke('#979086')
    fill('#979086')
    ellipse(0, -ship.width - 5, 3, 5)
    pop()

    ship.y += ship.vY;
    ship.x += ship.vX;


    //Create hitbox and functionality
    if (showHitbox) {
      stroke(0, 255, 0)
      noFill()
    } else {
      noStroke()
      noFill()
    }
    rectMode(CENTER)
    if (Math.sign(ship.vY) < 0) {
      hitBoxY = ship.y - ship.width;
    } else {
      hitBoxY = ship.y;
    }
    square(ship.x - ship.width / 2, hitBoxY, ship.hitBoxWidth)
    //turn
    if (keyIsDown(LEFT_ARROW)) {
      ship.angle -= 3;
    } else if (keyIsDown(RIGHT_ARROW)) {
      ship.angle += 3;
    }

    if (Math.abs(ship.angle) > 360) { ship.angle = 0 }

    //Spawn Asteroid
    for (let i = 0; i < asteroids.length; i++) {
      strokeWeight(3)
      stroke('#CFCACA')
      fill(asteroidColor)
      asteroids[i].display()
    }
    strokeWeight(1)
    //Spawn Bullet
    if (keyIsDown(16)) {
      if (frameCount % fireRate == 0) {
        bullets.push(new Bullet(ship.x, ship.y));
      }
    }

    for (i = 0; i < bullets.length; i++) {
      stroke(bulletColor)
      fill(bulletColor)
      bullets[i].display()
    }

    //Asteroid Collision
    for (let a = 0; a < asteroids.length; a++) {
      asteroids[a].collisionCheckShip(ship.x, hitBoxY, 30, 30)
      for (i = 0; i < bullets.length; i++) {
        try {
          asteroids[a].collisionCheckBullet(bullets[i].x, bullets[i].y, bullets[i].width)
        } catch (err) { console.log('%c ☄️ Asteroid #' + a + ' was eaten by 👽', 'font-weight: bolder; color: #43FF2E') }
      }
    }

    //Asteroid Particles
    for (i = 0; i < particles.length; i++) {
      stroke(asteroidColor)
      fill(asteroidColor)
      particles[i].display()
    }

    //Display level
    if (showLevel > 0) {
      textAlign(CENTER)
      text('Level ' + level, 250, 250)
      showLevel -= 1;
    }

    //Won Game?
    if (asteroids.length == 0) {
      WIN()
      showLevel = 75;
    }

    //GameOver
    if (gameOver) {
      GAMEOVER()
    }

  } else {
    MAINMENU()
  }
}
//ASTEROID OBJECT
function Asteroid(x, y) {
  this.x = x;
  this.y = y;
  this.r = random(20, 100);
  this.vX = random([-1, 1]);
  this.vY = random([-1, 1]);

  this.display = function () {
    circle(this.x, this.y, this.r)
    this.x += (this.vX * asteroidSpeed);
    this.y += (this.vY * asteroidSpeed);

    if (this.x > canvas.width + this.r) {
      this.x = 0 - this.r;
    } else if (this.x < 0 - this.r) {
      this.x = canvas.width + this.r;
    }

    if (this.y > canvas.width + this.r) {
      this.y = 0 - this.r;
    } else if (this.y < 0 - this.r) {
      this.y = canvas.width + this.r;
    }
  }

  this.collisionCheckShip = function (hitbX, hitbY, hitbW, hitbH) {
    if (collideRectCircle(hitbX, hitbY, hitbW, hitbH, this.x, this.y, this.r / 2)) {
      gameOver = true;
    }
  }

  this.collisionCheckBullet = function (bulletX, bulletY, bulletW) {
    if (collideRectCircle(bulletX, bulletY, bulletW, bulletW, this.x, this.y, this.r)) {

      //Create new Asteroid
      if (floor(random(0, 2)) == 1) {
        spawnAsteroids()
      }

      //Create particles
      for (i = 0; i < random(5); i++) { particles.push(new Particle(this.x, this.y, this.r)); }

      //Remove this asteroid
      this.x = (canvas.width * 2) * this.vX;
      this.y = (canvas.width * 2) * this.vY;
      asteroids.splice(asteroids.indexOf(this), 1);

    }
  }
}

//BULLET OBJECT
function Bullet(x, y) {
  this.x = x;
  this.y = y;
  this.width = 2;
  this.vX = bulletVelocity * sin(ship.angle) * ship.thrust;
  this.vY = bulletVelocity * -cos(ship.angle) * ship.thrust;

  this.display = function () {
    square(this.x, this.y, this.width)
    this.x += this.vX;
    this.y += this.vY;
    if (this.x > (canvas.width * 2) || this.y > (canvas.width * 2) || this.x < -(canvas.width * 2) || this.y < -(canvas.width * 2)) {
      bullets.splice(bullets.indexOf(this), 1);
    }
  }
}

function Particle(x, y, r) {
  this.x = x;
  this.y = y;
  this.r = r;
  this.vX = random(-1, 1)
  this.vY = random(-1, 1)

  this.display = function () {
    circle(this.x, this.y, this.r / random(15, 30))

    this.x += this.vX * particleSpeed;
    this.y += this.vY * particleSpeed;

    if (this.x > (canvas.width * 2) || this.y > (canvas.width * 2) || this.x < -(canvas.width * 2) || this.y < -(canvas.width * 2)) {
      particles.splice(particles.indexOf(this), 1);
    }
  }
}

function spawnAsteroids(amount) {
  if (amount == null) {
    if (floor(random(0, 2)) == 1) {
      asteroids.push(new Asteroid(random(0, ship.x - 100), random(canvas.height)));
    } else {
      asteroids.push(new Asteroid(random(ship.x + 100, canvas.width), random(canvas.height)));
    }
  } else {
    //left of player
    for (i = 0; i < Math.floor(amount / 2); i++) {
      asteroids.push(new Asteroid(random(0, ship.x - 100), random(canvas.height)));
    }
    //right of player
    for (i = 0; i < Math.floor(amount / 2); i++) {
      asteroids.push(new Asteroid(random(ship.x + 100, canvas.width), random(canvas.height)));
    }
  }
}

//Button function
btnStart.onclick = function () {
  if (isPlaying == false && gameOver == false) {
    asteroidAmount = 20;
    isPlaying = true;
    level = 1;
    ship.x = canvas.width / 2;
    ship.y = canvas.height / 2;
  }
  if (gameOver) {
    //new game
    gameOver = false;
    isPlaying = true;
    asteroids = [];
    asteroidAmount = 20;
    spawnAsteroids(asteroidAmount)

  }
  if (win) {
    //new game
    win = false;
    isPlaying = true;
    asteroids = [];
    ship.x = canvas.width / 2;
    ship.y = canvas.width / 2;
    spawnAsteroids(asteroidAmount)
  }
}


function GAMEOVER() {
  background('#171717')

  let starColors = ['crimson', 'violet'];

  for (i = 0; i < 150; i++) {
    let stat = floor(random(0, 4))
    if (stat == 1) {
      stroke('#2D1ED4')
      fill('#2D1ED4')
    } else if (stat == 2) {
      stroke('#d41e48')
      fill('#d41e48')
    } else {
      stroke(asteroidColor)
      fill(asteroidColor)
    }
    circle(random(canvas.width), random(canvas.height), 2)
  }

  isPlaying == false;

  textAlign(CENTER);
  textSize(55);
  stroke('#171717')
  fill('#7adc76')
  text('Game Over! 👽', 250, 250)

  menu.style.visibility = 'visible';
  btnStart.innerText = 'Play Again'
}

function MAINMENU() {
  textAlign(CENTER);
  textSize(55);
  fill(asteroidColor)
  stroke('#171717')
  text('Play? 👽', 250, 250);

  asteroids = [];

  //Generate Asteroids
  spawnAsteroids(asteroidAmount)

  //God Mode
  if (godMode) {
    fireRate = 1;
    showHitbox = true;
    ship.color = 'crimson';
  }
}

function WIN() {
  win = true;
  level += 1;
  asteroids = [];
  ship.x = canvas.width / 2;
  ship.y = canvas.width / 2;
  asteroidAmount += 2;
  spawnAsteroids(asteroidAmount)
}