/**
 * Creates and initializes a player. Very similar to quad.
 * Methods will be used by game.
 */
function Player(gl_, game) {

    this.game = game;
 
   var SHIFT=16;
    var SPACE=32;
    var LEFT=37;
    var UP=38;
    var RIGHT=39;
    var DOWN=40;
    var _A=65;

    this.key_down = { SHIFT: false,
                      RIGHT: false,
                      LEFT: false,
                      UP: false };

    // Used in collision detection.
    var WALL_NONE = 0;
    var WALL_N = 1;
    var WALL_S = 2;
    var WALL_W = 3;
    var WALL_E = 4;

    var i; // for init loop

    // Setup player textures
    this.movement = vec3.create();
    this.movement_old = vec3.create();

    // Specify string to use, texture ID, and shader to use. Abandoned in favor of sprites
//    var player_string = new GLstring(this.name, "text", theCanvas.shader["player"]);

    this.jump_count = 0;
    this.left_count = 0;
    this.right_count = 0;
    this.left_started = false;
    this.right_started = false;
    this.in_jump = false;
    this.jumping_up = true;
    this.jumping_down = false;
    this.in_left_move = false;
    this.in_right_move = false;

    // Move distance is a group of numbers, normalized so their sum is 1.0
    this.move_dist = [];
    var move_total = 0;
    for (i = 0; i <= 8; ++i) {
    	var move_num = 64 - (i*i);
    	this.move_dist.push (move_num);
    	move_total += move_num;
    }
    this.move_dist.forEach(function(a, b, c) { c[b] = a / move_total; });

    // x is width (from -w to w), y is height (from 0 to h), z is length (never varies over l)
    var w = game.grid / 2;
    var h = game.grid;
    var l = -1;

    // Experimental. Add the underlying GLobject of the Quad directly to this.
    // This might be a cool way of faking inheritance.
    Quad.bind(this)([ w, h, l],
		    [ w, 0, l],
		    [-w, h, l],
		    [-w, 0, l]);
    this.o.setTexture("text");
    this.o.initTextures([1,0], [1,1], [0,0], [0,1]);
    this.o.shader = theCanvas.shader["player"];
    this.width = w;
    this.height = h;

    this.initBuffers = function(gl_) { this.o.initBuffers(gl_); };

    this.xPos = function() { return this.movement[0]; }
    this.yPos = function() { return this.movement[1]; }

    this.draw = function(gl_, hi_hat) {

    	game.matrix.push();
    	game.matrix.translate(this.movement);
    	var shader = theCanvas.changeShader("player");
        gl_.uniform1f(shader.unis["hi_hat_u"], hi_hat);
        gl_.uniform1i(shader.unis["sampler1"], gl_.texNum["drawing"]);
    	theMatrix.setVertexUniforms(shader);

    	this.o.draw(gl_);
    	game.matrix.pop();

    };

    this.startJump = function() {

    	if (this.in_jump === true) return;
    	this.jump_started = false;
    	this.jumping_up = true;
    	this.jumping_down = false;
    	this.jump_count = 0;
    	this.in_jump = true;
    };

    var dist;

    this.startLeftMove = function() {

    	dist = this.key_down[SHIFT]? 3:1;
    	if (this.in_left_move === true) return;
    	this.left_count = -1;
    	this.left_started = false;
    	this.in_left_move = true;
    	if(this.in_right_move === true && this.right_started === false) {
    	    this.in_right_move = false;
    	}

    };

    this.startRightMove = function() {

    	dist = this.key_down[SHIFT]? 3:1;
    	if (this.in_right_move === true) return;
    	this.right_count = -1;
    	this.right_started = false;
    	this.in_right_move = true;
    	if(this.in_left_move === true && this.left_started === false) {
    	    this.in_left_move = false;
    	}
    };

    this.endLeftMove = function() {
	    this.in_left_move = false;
	    if (this.key_down[LEFT]) this.startLeftMove();
    }

    this.endRightMove = function() {
	    this.in_right_move = false;
	    if (this.key_down[RIGHT]) this.startRightMove();
    }

    this.moveRight = function() {
    	if (this.right_started === false) return;
    	if ((++this.right_count) >= this.move_dist.length) {
    	    this.endRightMove();
    	    return;
    	}
    	this.movement[0] += this.move_dist[this.right_count] * this.width * 2 * dist;
    };

    this.moveLeft = function () {

    	if ((++this.left_count) >= this.move_dist.length) {
    	    this.endLeftMove();
    	    return;
    	}
    	this.movement[0] -= this.move_dist[this.left_count] * this.width * 2 * dist;
    };

    var on_wall = false;

    this.detectCollision = function(object) {

    	// First, check vertical indexes. Next, check horizontal indexes.
    	if (this.movement[1] + this.height > object.y_min &&
    	    this.movement[1] <= object.y_max &&
    	    this.movement[0] - this.width < object.x_max &&
    	    this.movement[0] + this.width > object.x_min) {

  	    // Which side of the box did we cross during the previous frame?
  	    if (this.movement_old[1] >= object.y_max ||
      		this.movement[1] >= object.y_max) {
      		object.collided = WALL_N;
      		on_wall = true;
      		// Here, just move to the top of the wall.
      		if(this.jumping_down === true && this.in_jump === true) {
      		    this.movement[1] = object.y_max;
      		    this.in_jump = false;
      		    this.jumping_down = false;
      		}
  	    } else if (this.movement_old[1] + this.height < object.y_min) {
      		this.movement[1] = object.y_min - this.height;
      		object.collided = WALL_S;
      		this.jump_count = 0;
      		this.jumping_up = false;
      		this.jumping_down = true;
  	    } else if (this.movement_old[0] - this.width >= object.x_max) {
      		object.collided = WALL_E;
      		// Convert to 1.0 scale, round to integer, convert back
      		this.movement[0] = game.grid * Math.ceil(this.movement[0] / game.grid);
      		this.endLeftMove();
  	    } else if (this.movement_old[0] + this.width <= object.x_min) {
      		object.collided = WALL_W;
      		// Convert to 1.0 scale, round to integer, convert back
      		this.movement[0] = game.grid * Math.floor(this.movement[0] / game.grid);
      		this.endRightMove();
  	    } else console.log("Collision error..?");
    	} else {
  	    object.collided = WALL_NONE;
    	}
    };

    this.movePostCollision = function() {
    	if (on_wall === false && this.in_jump === false) {
    	    console.log("freefallin!");
    	    this.jump_count = 0;
    	    this.jumping_up = false;
    	    this.jumping_down = true;
    	    this.jump_started = false;
    	    this.in_jump = true;
    	}
    	on_wall = false;
    };

    // Preset audio method so we don't have to pass it each time.
    this.setMoveMethod = function(method) {
      this.move_method = method;
    }

    // Called before draw.
    this.updateMovement = function(on_beat) {

    	if(this.movement[1] < -500) { vec3.set(this.movement, 0,10,0); return; }

    	vec3.copy(this.movement_old, this.movement);

    	// Check whether it's time to initiate a move that's been triggered.
    	if (on_beat === true) {
        if (this.in_right_move === true) {
      		this.right_started = true; this.move_method(RIGHT); }
        if (this.in_left_move === true && this.left_started === false) {
      		this.left_started = true; this.move_method(LEFT); }
  	    if (this.in_jump === true && this.jump_started === false) {
      		this.jump_started = true; this.move_method(UP, 0.25); }
    	}

	// We may be 'changing a move' due to collision constraints.
	// Otherwise, all other moves are valid and there's no particular priority.
	if (this.in_right_move === true && this.right_started === true) this.moveRight();
	if (this.in_left_move === true && this.left_started === true) this.moveLeft();
	if (this.in_jump === true && this.jump_started === true) {

	    if (this.jumping_up === true) {
    		var up_dist = 18 - ((++this.jump_count) / 2);
    		if (up_dist <= 0) {
    		    this.jumping_up = false;
    		    this.jumping_down = true;
    		    this.jump_count = 0;
    		} else {
    		    this.movement[1] += up_dist;
    		}

	    } else {
    		this.movement[1] -= (++this.jump_count);
	    }
	}
    };

    /**
     * Binds keys to document object.
     * This should be done as part of initialization.
     */
    this.mapKeys = function() {

	document.onkeyup = (function(keys_down, playa) {
            return function(the_event) {
                var code = the_event.keyCode;
	        keys_down[code] = false;
	        if(code === UP) playa.startJump();
	    };
        } (this.key_down, this));

	document.onkeydown = (function(keys_down, playa) {

            // contains closed functions mapped to game keys
            var functionz = {};
            functionz[RIGHT] = playa.startRightMove.bind(playa);
            functionz[LEFT] = playa.startLeftMove.bind(playa);
            functionz[UP] = playa.startJump.bind(playa);
            functionz[DOWN] = ((function(gl_matrix) {

                // here, toggle a backward viewing matrix translation
                var view_dist = vec3.fromValues(0,0,3000);
                return function() {
		    gl_matrix.vTranslate(view_dist);
		    vec3.negate(view_dist, view_dist);
		}; }) (window.theCanvas.mat));

//            functionz[_A] = function() { audio.log_music = !(audio.log_music); };
//            functionz[SPACE] = function() { audio.pause(); };

            return function(event) {
                var code = event.keyCode;
                if (!!keys_down[+code]) return;
                if (!!functionz[+code]) functionz[+code]();
                keys_down[+code] = true;
            };
        } (this.key_down, this));

    };

    this.mapKeys();

    return this;
}
