/**
 * Creates and initializes a game.
 */

function Game(gl_) {

    var level0 = new GameLevel(gl_, "#config-json");

    var audio = level0.initAudio();
    level0.initTextures(gl_);
    level0.initGrid(); // GRID_SIZE
    level0.initPieces();

    // Used in collision detection.
    var WALL_NONE = 0;
    var WALL_N = 1;
    var WALL_S = 2;
    var WALL_W = 3;
    var WALL_E = 4;

    this.matrix = theCanvas.mat;

    // handles movement
    this.bg_movement = vec3.create();
    this.in_change = false;
    this.change_x = [];

    this.hi_hat = 0;

    // Jump distance is a vector of linear X values
    // When we increment y-pos by these array values, the effect is a parabolic jump

    this.matrix.vTranslate(level0.getStartPos());

    this.floor_effect = 0;          // new shader effect

    this.floor = level0.getPiece("floor");
    this.push_button = level0.getPiece("wall");
    this.chameleon = level0.getPiece("chameleon");

    this.grid = level0.getGrid();

//    this.trigger_fns = level0.getTriggerFunctions();

    var player = new Player(gl_, this);

    this.drawing = new GLsprite("textures/one.png", "drawing");

    // Map uniforms ourself
    GLobject.draw_optimized = true;

    var wh = 1200;
    var l2= -20;
    this.background = new Quad(
        [-wh, wh, l2],
        [-wh,-wh, l2],
        [ wh, wh, l2],
        [ wh,-wh, l2])
    .setTexture("heaven.jpg")
	.setShader(theCanvas.shader["canvas"]);

    this.initBuffers = function(gl_) {

    	player.initBuffers(gl_);
    	this.background.initBuffers(gl_);

      function bufferz(piece) { piece.initBuffers(gl_); }

    	this.floor.forEach(bufferz);
      this.push_button.forEach(bufferz);
      this.chameleon.forEach(bufferz);
    };

    this.draw = function(gl_) {

    	if (audio.analyze() === true) this.hi_hat = 11;
    	else if (this.hi_hat > 0) this.hi_hat -= 1;

    	// Analyse movement, which draws upon sound, and activated moves.
    	this.updateMovement();

    	// The draw calls themself. Heavily optimize here by manually loading
    	// matrices and setting shaders. This reduces redundant calls
    	// to shader progs.

    	//    this.player : gl_.shader_player
    	//    this.background : gl_.shader_canvas
    	//    this.floor : gl_.shader

    	var shader = theCanvas.changeShader("default");
    	this.matrix.setViewUniforms(shader);
    	var unis = shader.unis;
    	gl_.uniform1f(unis["hi_hat_u"], this.hi_hat);
    	gl_.uniform1f(unis["wall_hit_u"], this.floor_effect);
    	gl_.uniform3fv(unis["lightPosU"], [2, 2, -40]);
    	gl_.uniform1i(unis["sampler1"], gl_.texNum["brick_normal.jpg"]);

    	for(i = 0; i < this.floor.length; ++i){
    	    this.floor[i].draw(gl_);
    	}

      for(i = 0; i < this.push_button.length; ++i){
          this.push_button[i].draw(gl_);
      }

      for(i = 0; i < this.chameleon.length; ++i){
          this.chameleon[i].draw(gl_);
      }

    	player.draw(gl_, this.hi_hat);

    	this.matrix.push();
    	this.matrix.translate(this.bg_movement);

    	shader = theCanvas.changeShader("canvas");
    	this.matrix.setVertexUniforms(shader);
    	gl_.uniform1i(shader.unis["sampler1"], gl_.texNum["heaven_Normal.jpg"]);

    	this.background.draw(gl_);
    	this.matrix.pop();


    };

    var kTick = 15;
    var kCount = 30;
    this.camera = {
      game: this,
      in_left_move: false,
      in_right_move: false,
      movement: vec3.create(),
      left_count: 0,
      right_count: 0,
      startLeftMove: function() {

        if (this.in_left_move === true || this.in_right_move === true) return;
        this.movement[0] -= (kTick * kCount);
        this.left_count = kCount;
        this.in_left_move = true;
      },
      startRightMove: function() {

        if (this.in_right_move === true || this.in_left_move === true) return;
        this.movement[0] += (kTick * kCount);
        this.right_count = kCount;
        this.in_right_move = true;
      },
      checkPosition: function(x_pos) {
        if(x_pos < this.movement[0] - 400) this.startLeftMove();
        else if(x_pos > this.movement[0] + 400) this.startRightMove();

        if (this.in_right_move === true) {
            if ((--this.right_count) < 0) this.in_right_move = false;
            else this.game.matrix.vTranslate([kTick, 0, 0]);
        }
        if (this.in_left_move === true) {
            if ((--this.left_count) < 0) this.in_left_move = false;
            else this.game.matrix.vTranslate([-kTick, 0, 0]);
        }
      }
    };

    // Calls function exactly once; when the object is first collided with.
    // Supposed to be called each tick.
    function collision_check(object, fn) { 
        var trigger = false;
        return function() {
            if (trigger == false && object.collided == WALL_N) { trigger = true; fn(); }
        };
    }

    var audio_check = [];

    audio_check.push(collision_check(this.push_button[0], audio.triggerLoop.bind(audio, "music/trigger1.wav")));
    audio_check.push(collision_check(this.push_button[10], audio.triggerLoop.bind(audio, "music/trigger2.wav")));
    audio_check.push(collision_check(this.push_button[20], audio.triggerLoop.bind(audio, "music/trigger3.wav")));

    player.setMoveMethod(audio.playSound);

    this.updateMovement = function() {

    	this.camera.checkPosition(player.xPos());

    	player.updateMovement(this.hi_hat === 10);

    	// Collision. How far should we go to be on grid?
    	var i;
    	var length1 = this.floor.length;

        function checkCollision(obj){ player.detectCollision(obj); }

        this.floor.forEach(checkCollision);
        this.push_button.forEach(checkCollision);
        this.chameleon.forEach(checkCollision);

	   player.movePostCollision();

       audio_check.forEach(function(a) { a(); })

    };

    return this;
}
