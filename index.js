const canvas = document.getElementById('playGround');
const context = canvas.getContext('2d');
const gravity = 0.5;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class Entity {
    constructor(canvas, x, y, width, height, color) {
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
        this.x = x;
        this.y = y;
        this.xV = 0;
        this.yV = 0;
        this.width = width;
        this.height = height;
        this.color = color;
    }

    draw() {
        this.context.fillStyle = this.color;
        this.context.fillRect(this.x, this.y, this.width, this.height);
    }

    floorXVelocity() {
        if (this.xV !== 0) {
            const slowDown = this.xV > 0 ? -0.5 : 0.5;
            this.xV += slowDown;

            if (Math.abs(this.xV) < Math.abs(slowDown)) {
                this.xV = 0;
            }
        }
    }
}

class Player extends Entity {
    keys = {
        left: {
            pressed: false,
        },
        right: {
            pressed: false,
        }
    }
    isCollided = false;
    platforms = [];

    constructor(canvas) {
        super(canvas, 500, 30, 30, 30, 'red');

        window.addEventListener('keydown', e => {
            switch (e.key) {
                case 'd':
                    this.keys.right.pressed = true;
                    break;
                case 'a':
                    this.keys.left.pressed = true;
                    break;
                case 'w':
                    if (this.yV === 0 || this.isCollided) {
                        this.yV -= 15;
                    }
                    break;
                case 's':
                    this.yV += 1;
                    break;
            }
        });
        window.addEventListener('keyup', e => {
            switch (e.key) {
                case 'd':
                    this.keys.right.pressed = false;
                    break;
                case 'a':
                    this.keys.left.pressed = false;
                    break;
            }
        });
    }

    checkCollision() {
        this.platforms.forEach(platform => {
                const playerBottomY = this.y + this.height;
                const playerEndX = this.x + this.width;
                const platformEndX = platform.x + platform.width;

                const hasXCollision = playerEndX >= platform.x && this.x <= platformEndX;
                const hasYCollision = playerBottomY <= platform.y && playerBottomY + this.yV >= platform.y;

                if (hasYCollision && hasXCollision) {
                    this.yV = 0;
                }
            }
        );

        this.isCollided = !this.yV;
    }

    update() {
        this.updatePlatforms();
        this.checkCollision();

        this.x += this.xV;
        this.y += this.yV;

        this.updateYVelocity();
        this.updateXVelocity();

        this.draw();
    }

    updatePlatforms() {
        this.platforms.forEach(p => p.update());
    }

    updateYVelocity() {
        if (this.y + this.height + this.yV <= this.canvas.height) {
            this.yV += gravity;
        } else {
            this.yV = 0;
        }
    }

    updateXVelocity() {
        const isLeftBorderHit = this.x <= 200;
        const isRightBorderHit = this.x + this.width >= window.innerWidth - 200;

        if ((this.keys.left.pressed && isLeftBorderHit) || (this.keys.right.pressed && isRightBorderHit)) {
            this.updatePlatformsVelocity(-this.xV);
            this.xV = 0;
            return;
        }

        let change = 0;

        if (this.keys.left.pressed) {
            change = -1;
        }

        if (this.keys.right.pressed) {
            change = 1;
        }

        if (this.platforms.some(p => p.xV !== 0)) {
            this.platforms.forEach(p => p.xV += -change);
        } else {
            this.xV += change;
        }

        this.floorXVelocity();
    }

    updatePlatformsVelocity(x) {
        this.platforms.forEach(platform => platform.xV += x);
    }
}

class Platform extends Entity {
    constructor(player, canvas, x, y) {
        super(canvas, x, y, getRandomInt(20, 500), 10, 'black');
        this.player = player;
    }

    draw() {
        this.context.fillStyle = this.color;
        this.context.fillRect(this.x, this.y, this.width, this.height);
    }

    update() {
        this.x += this.xV;
        this.y += this.yV;

        this.updateXVelocity();

        this.draw();
    }

    updateXVelocity() {
        const isLeftBorderHit = this.player.x <= 200;
        const isRightBorderHit = this.player.x + this.player.width >= window.innerWidth - 200;

        if (this.player.keys.left.pressed && isLeftBorderHit) {
            this.xV += 1;
        }

        if (this.player.keys.right.pressed && isRightBorderHit) {
            this.xV -= 1;
        }

        this.floorXVelocity();
    }
}

const player = new Player(canvas);

for (let i = 0; i < 10000; i++) {
    let randY = getRandomInt(0, 1200);
    randY = randY - randY % 50;
    player.platforms.push(new Platform(player, canvas, getRandomInt(-100000, 100000), randY));
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

player.platforms.push(new Platform(player, canvas, 1200, 100));
player.platforms.push(new Platform(player, canvas, 1000, 200));
player.platforms.push(new Platform(player, canvas, 800, 300));
player.platforms.push(new Platform(player, canvas, 500, 400));
player.platforms.push(new Platform(player, canvas, 300, 500));

animate();

function animate() {
    requestAnimationFrame(animate);

    context.clearRect(0, 0, canvas.width, canvas.height);
    player.update();
}








