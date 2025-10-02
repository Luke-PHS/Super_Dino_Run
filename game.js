// Initialize the Kaboom context.
kaboom({
    width: 800,
    height: 600,
    background: [0, 100, 200],
});

setGravity(800);

// --- Load Assets ---
loadSprite("apple", "https://kaboomjs.com/sprites/apple.png");
loadSprite("enemy", "https://kaboomjs.com/sprites/gigagantrum.png");
loadSprite("coin", "https://kaboomjs.com/sprites/coin.png");
loadSprite("door", "https://kaboomjs.com/sprites/door.png");

// --- Define Custom Components ---
// By defining patrol() here, it's globally available and can be used by any scene.
function patrol() {
    return {
        id: "patrol",
        require: [ "pos", "area" ],
        dir: -1,
        add() {
            this.onCollide((obj, col) => {
                if (col.isLeft() || col.isRight()) {
                    this.dir = -this.dir;
                }
            });
        },
        update() {
            this.move(60 * this.dir, 0);
        },
    };
}


// --- Main Game Scene ---
scene("main", ({ level } = { level: 0 }) => {

    // Array of all level layouts
    const LEVELS = [
        [
            "   $    $    $     ",
            "                    ",
            "    =         =   D ",
            "                    ",
            "  =    ^  =      =  ",
            " $           $      ",
            "====================",
        ],
        [
            " $                  ",
            " =                  ",
            "      =      =      ",
            "                    ",
            "     ^           ^  ",
            "      =      =    D ",
            "====================",
        ]
    ];

    const currentLevel = level;

    // Configure what each symbol in the level layout means.
    const levelConf = {
        tileWidth: 47,
        tileHeight: 47,
        tiles: {
            " ": () => [],
            "=": () => [
                rect(47, 47),
                color(0, 200, 0),
                area(),
                body({ isStatic: true }),
                "platform",
            ],
            "$": () => [
                sprite("coin"),
                area(),
                "coin",
            ],
            "D": () => [
                sprite("door"),
                area(),
                "door",
            ],
            // This now correctly uses the globally-defined patrol() function.
            "^": () => [
                sprite("enemy"),
                area(),
                body(),
                patrol(),
                "enemy",
            ],
        }
    };

    addLevel(LEVELS[currentLevel], levelConf);

    // --- Score & UI ---
    let score = 0;
    const scoreLabel =add([
        text("Score:" + score),
        pos(24,24),
        fixed(),
    ]);

    // --- The Player Character ---
    const player = add([
        sprite("apple"),
        pos(100, 100),
        area({ scale: 0.7 }),
        body(),
        "player",
    ]);

    // --- Player Controls & Interactions ---
    onKeyDown("left", () => { player.move(-200, 0); });
    onKeyDown("right", () => { player.move(200, 0); });
    onKeyPress("space", () => { if (player.isGrounded()) { player.jump(650); } });

    //--Coin Collecting Logic--
    player.onCollide("coin", (coin) =>{
        destroy(coin);
        score+= 10;
        scoreLabel.text ="Score: " + score;

    });

    player.onCollide("enemy", (enemy, col) => {
        if (col.isBottom()) {
            destroy(enemy);
            player.jump(300);
        } else {
            destroy(player);
            go("lose");
        }
    });

    player.onCollide("door", () => {
        if (currentLevel + 1 < LEVELS.length) {
            go("main", { level: currentLevel + 1 });
        } else {
            go("win");
        }
    });
});


// --- Lose Scene ---
scene("lose", () => {
    add([ text("Game Over"), pos(center()), anchor("center") ]);
    wait(2, () => { go("main", { level: 0 }); });
});

// --- Win Scene ---
scene("win", () => {
    add([ text("You Win!"), pos(center()), anchor("center") ]);
    wait(2, () => { go("main", { level: 0 }); });
});


// Start the game
go("main");