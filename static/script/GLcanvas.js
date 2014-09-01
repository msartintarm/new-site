
/**
 * This is basically a wrapper class for the GL context.
 * It links together objects that are in scenes to things
 * defined within the context, such as shaders.
 */
function GLcanvas() {
    this.objects = [];
    this.textures = [];
    this.textureNums = [];
    this.frame_count = 0;
    this.gl = null;
    this.canvas = null;

    this.resizeCounter = 0;

    this.fullscreen = function() {
        // One-time display methods
        $("#header").hide();
        $("#footer").hide();
        $("#shader1").hide();
        $("#shader_viewer").hide();
    };

    /**
     * Begins the canvas.
     */
    this.start = function(theScene) {

        // TODO: use closure instead! (Not binding)
        var createScene = function(objToDraw) {
            if(objToDraw == "game") {
	           this.objects.push(new Game(this.gl));
            } 
        }.bind(this);

        var bufferModels = function() {
            for(var i = 0, max = this.objects.length;
	        i < max; ++i) {
	        this.objects[i].initBuffers(this.gl);
            }
        }.bind(this);

        if (this.gl === null) {

        $("#button_table").hide();

        this.fullscreen();

	    this.canvas = document.getElementById("glcanvas");
	    $(this.canvas).show();

            // Initialize Error Division Log
            // re-write console.log to show within the window itself
            console.log = (function(old_function, div_log) {

                var d = document.getElementById(div_log);
                $(d).show();
                var r = d.rows;
                var w = d.style.width;
                d.onclick = function() {
                    if (d.rows === r) {
                        d.style.width = "325%";
                        d.rows = "50";
                    } else {
                        d.rows = r;
                        d.style.width = w;
                    }
                };

                return function(text) {
                    old_function(text);
                    d.value += text + "\n";
                    d.scrollTop = d.scrollHeight;
                };
            } (console.log.bind(console), "error-log"));

            console.error = (function(old_function, div_log) {
                var d = document.getElementById(div_log);
                return function(text) {
                    old_function(text);
                    d.value = text + "\n";
                    d.scrollTop = d.scrollHeight;
                };
            } (console.error.bind(console), "error-log"));


	    if(this.initGL() !== 0) {
                document.getElementById("web_gl").style.color = "#ee5522";
	        var theWindow = window.open(
		    "GLerror.php",
		    "",
		    "height=110,width=220,location=no,scrollbars=no");
	        theWindow.focus();
	        return;
	    }

	    // Create and compile shaders before they are used.

	    this.shader_source = new GLshader;
	    this.shader_count = 0;
        this.shader = { 
            "default": this.gl.createProgram(),
            "frame": this.gl.createProgram(),
            "color": this.gl.createProgram(),
            "canvas": this.gl.createProgram(),
            "player": this.gl.createProgram()
        };

	    if(this.initShaders(this.shader["default"], "default",  "default") !== 0 ||
	       this.initShaders(this.shader["frame"],  "frame",    "default") !== 0 ||
	       this.initShaders(this.shader["canvas"], "canvas",   "default") !== 0 ||
	       this.initShaders(this.shader["player"], "player",   "player") !== 0 ||
	       this.initShaders(this.shader["color"],  "color",    "color") !== 0) {

            console.error("Shaders failed to compile.");
	        return;
	    }

	    this.objects = [];

	    // start matrix models
	    theMatrix = new GLmatrix(this.gl);
	    this.mat = theMatrix;

	    // Instantiate models
	    createScene(theScene);

	    this.gl.useProgram(this.shader["default"]);
	    this.active_shader = this.shader["default"];

	    console.log("Shaders compiled.");

	    // Get rid of unused JS  memory
	    this.shader_source.cleanup();

	    // Set up mouse control.
	    $(this.canvas).mousedown(handleMouseDown);
	    $(document).mouseup(handleMouseUp);
	    $(this.canvas).mousemove(handleMouseMove);

	    if(textures_loading !== 0) {
            console.log("Textures left: " + textures_loading);
        }
	    bufferModels();

	    // Needs calibration each time the HTML page changes. MST
	    this.resize();

	    // Set background color, clear everything, and
	    //  enable depth testing
	    this.gl.clearColor(0.1, 0.1, 0.1, 0.0);
	    this.gl.clearDepth(1.0);
	    this.gl.enable(this.gl.DEPTH_TEST);
        } else {
	    // If we have started GL already,
	    //  just add the new model.
	    createScene(theScene);
	    bufferModels();
        }
        // After the scene is complete, see if we have textures to load..?
        // If not, let's draw right away
        if(textures_loading === 0) this.done_loading(1500);

    };

    /*
     * Initialize WebGL, returning the GL context or null if
     * WebGL isn't available or could not be initialized.
     */
    this.initGL = function() {

        try {
	    this.gl = this.canvas.getContext("experimental-webgl");
        }
        catch(e) { console.log("%s",e); }
        // If we don't have a GL context, give up now
        if (!this.gl) { return 1; }

        this.gl.active = 0;
        // sets textures we have already loaded.
        // some of them don't have sources
        this.gl.texNum = {
            "frame": -1,
            "none": -1,
            "text1": -1,
            "text2": -1,
            "text3": -1,
            "text4": -1
        };

        window.onresize = function() {
	    theCanvas.resizeCounter = 30;
        };
        return 0;
    };

    this.setViews = function(name) {
        this.mat.setViewUniforms(this.shader[name]);
        this.gl.uniformMatrix4fv(this.shader[name].unis["pMatU"], false, this.mat.pMatrix);
    }

    this.resize = function() {
        this.canvas.width = this.canvas.parentElement.clientWidth;
        this.canvas.height = window.innerHeight - 105;
        this.gl.viewport(0, 0, this.canvas.width,
		         this.canvas.height);
    	this.mat.perspective(45,
    			      this.canvas.width /
    			      Math.max(1, this.canvas.height),
    			      0.1, 300000.0);

    	this.changeShader("default");
    	this.setViews("default");
    	this.changeShader("canvas");
        this.setViews("canvas");
    	this.changeShader("player");
    	this.setViews("player");
    };

    /**
     *  Draw the scene.
     */
    var drawScene = (function(canvas) {

        var requestFrame = window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function(callback) { window.setTimeout(callback, 1000/60); };

        return function() {
            requestFrame(drawScene);

            // Don't check context for errors. This is expensive.
            // Errors are evident in this stage as something
            //  usually doesn't show up.

            canvas.gl.clear(canvas.gl.COLOR_BUFFER_BIT |
		          canvas.gl.DEPTH_BUFFER_BIT);

            // Draw all our objects
            canvas.mat.push();

            for(var i = 0, max = canvas.objects.length;
	        i < max; ++i) {
	        canvas.objects[i].draw(canvas.gl);
            }

            canvas.mat.pop();

            // filter so we don't resize every frame
            if(canvas.resizeCounter > 0) {
	        if((--canvas.resizeCounter) === 0) {
	            canvas.resize();
	        }
            }

            canvas.frame_count++;
            //    this.gl.clear(this.gl.STENCIL_BUFFER_BIT);

            // Update viewer's matrix
            canvas.mat.update();
            if(canvas.resizeCounter > 0) {
	        canvas.resizeCounter -= 1;
	        if(canvas.resizeCounter === 0) {
	            canvas.resize();
	        }
            }

        };
    } (this));

    this.done_loading = function(timeout) {

        // Wait 1.5 seconds for no reason
        setTimeout(drawScene,timeout);
    };

    this.disableAttribute = function(gl_shader, name) {

        if(gl_shader.attribs[name] === -1) return;
        this.gl.disableVertexAttribArray(gl_shader.attribs[name]);
        gl_shader.attrib_enabled[name] = false;
    }

    this.initShaders = function(gl_shader, frag, vert) {

        if(this.shader_source.init(this.gl, gl_shader, frag, vert) !== 0) return -1;

        // This is so the two can be compared
        gl_shader.count = (++this.shader_count);

        gl_shader.attribs = [];
        gl_shader.attrib_enabled = [];
        gl_shader.unis = [];

        this.initAttribute(gl_shader, "vPosA");

        this.initAttribute(gl_shader, "vNormA");
        this.initAttribute(gl_shader, "vColA");
        this.initAttribute(gl_shader, "textureA");

        this.initUniform(gl_shader, "frames_elapsed_u");
        this.initUniform(gl_shader, "hi_hat_u");
        this.initUniform(gl_shader, "wall_hit_u");
        this.initUniform(gl_shader, "ambient_coeff_u");
        this.initUniform(gl_shader, "diffuse_coeff_u");
        this.initUniform(gl_shader, "specular_coeff_u");
        this.initUniform(gl_shader, "specular_color_u");

        // 3 matrixes packed into a size 3 array.
        // [0] is model, [1] is view, [2] is normal.
        // Perspective never changes, so is left out.
        // Another reason it makes sense to pack these is if one
        // changes, they all do.
        this.initUniform(gl_shader, "mvnMatU");

        this.initUniform(gl_shader, "pMatU"); // Perspecctive matrix
        //    this.initUniform(gl_shader, "mMatU"); // Model matrix
        //    this.initUniform(gl_shader, "vMatU"); // Viewing matrix
        //    this.initUniform(gl_shader, "nMatU"); // Model's normal matrix
        this.initUniform(gl_shader, "lMatU"); // Lighting matrix
        this.initUniform(gl_shader, "lightPosU"); // Initial light's position

        for(var i_ = 0; i_ < 3; ++i_) {
	    this.initUniform(gl_shader, "sampler" + i_);
        }

        return 0;
    };

    /**
     * Some shaders won't have these attributes.
     *
     * If this is the case, they will not be added to the
     * shaders' associative attributes list.
     */
    this.initAttribute = function(gl_shader, attr) {

        var theAttrib = this.gl.getAttribLocation(gl_shader, attr);
        gl_shader.attribs[attr] = theAttrib;
        gl_shader.attrib_enabled[attr] = false;
        if(theAttrib === -1) { return; }
        gl_shader.attrib_enabled[attr] = false;
    };

    /**
     * This is basically a wrapper for GLSL's 'useProgram' function that
     *  only disables an old program if it's not the same as the new one.
     */
    this.changeShader = function(shader_id) {

        // GLSL way of polling, it is costly
        //    var old_shader = this.gl.getParameter(this.gl.CURRENT_PROGRAM);
        //    if(old_shader === new_shader) return;

        // Our way
        var new_shader = this.shader[shader_id];
        if (new_shader.count === this.active_shader.count) return;

        this.disableAttribute(this.active_shader, "vPosA");
        this.disableAttribute(this.active_shader, "vNormA");
        this.disableAttribute(this.active_shader, "vColA");
        this.disableAttribute(this.active_shader, "textureA");

        this.gl.useProgram(new_shader);
        this.active_shader = new_shader;

        return new_shader;
    };

    this.initUniform = function(gl_shader, uni) {
        gl_shader.unis[uni] = this.gl.getUniformLocation(gl_shader, uni);
    };

    return this;
}


var theCanvas;

/**
 * Object holding modelview and perspective matrices.
 */
var theMatrix;
