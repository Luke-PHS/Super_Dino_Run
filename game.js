// Initialize the Kaboom context.
kaboom({
    width: 900,
    height: 600,
    background: [203, 42, 230],
});

setGravity(800);

// --- Load Assets ---
loadSprite("dino", "https://kaboomjs.com/sprites/dino.png");
loadSprite("ghosty", "https://kaboomjs.com/sprites/ghosty.png");
loadSprite("meat", "https://kaboomjs.com/sprites/meat.png");
loadSprite("portal", "https://kaboomjs.com/sprites/portal.png");

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
            "   $              D ",
            "                    ",
            "    =         =     ",
            "                 $  ",
            "       ^         =  ",
            "       =$    $      ",
            "=========    =======",
            "                    ",
            "      $             ",
            "      ===           ",
            "                    ",
            "                    ",
            "                    ",
            "                    ",
            "                    ",
            "^^^^^^^^^    ^^^^^^^",
            "====================",
        ],
        [
            "        D   $       ",
            "                 $  ",
            " $          =       ",
            " =                  ",
            "     ^           ^  ",
            "      =  $  ^ =   $ ",
            "====================",
            
        ],
        [
            "  $          ^ $=   ",
            "             ====   ",
            "    =               ",
            "  D      =          ",
            "                    ",
            "          ^ $ =     ",
            "================    ",
            "                    ",
            "                  $ ",
            "           $     == ",
            "            = =     ",
            "                    ",
            "                    ",
            "                    ",
            "                    ",
            "^^^^^^^^^^^^^^^^^^^^",
            "====================",
            
        ],
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
                color(22, 141, 217),
                area(),
                body({ isStatic: true }),
                "platform",
            ],
            "$": () => [
                sprite("meat"),
                area(),
                "meat",
            ],
            "D": () => [
                sprite("portal"),
                area(),
                "portal",
            ],
            // This now correctly uses the globally-defined patrol() function.
            "^": () => [
                sprite("ghosty"),
                area(),
                body(),
                patrol(),
                "ghosty",
            ],
        }
    };

    addLevel(LEVELS[currentLevel], levelConf);

    // --- Score & UI ---
    let score = 0;
    const scoreLabel =add([
        text("Meat:" + score),
        pos(24,24),
        fixed(),
    ]);

    // --- The Player Character ---
    const player = add([
        sprite("dino"),
        pos(100, 100),
        area({ scale: 0.7 }),
        body(),
        "player",
    ]);

    // --- Player Controls & Interactions ---
    onKeyDown("left", () => { player.move(-200, 0); });
    onKeyDown("right", () => { player.move(200, 0); });
    onKeyPress("space", () => { if (player.isGrounded()) { player.jump(500); } });

    //--Coin Collecting Logic--
    player.onCollide("meat", (meat) =>{
        destroy(meat);
        score+= 20;
        scoreLabel.text ="Meat: " + score;

    });

    player.onCollide("ghosty", (ghosty, col) => {
        if (col.isBottom()) {
            destroy(ghosty);
            player.jump(300);
        } else {
            destroy(player);
            go("lose");
        }
    });

    player.onCollide("portal", () => {
    if (score == 100)
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