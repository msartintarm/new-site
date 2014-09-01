/**
   Writes a sprite to an internal canvas element.
   Sets up a framebuffer to read from this element.
 */
function GLsprite(img_uri, texture_name) {

    this.ready = false;

    textures_loading ++;
    this.active = (++ theCanvas.gl.active);
    this.tex = texture_name;
    theCanvas.gl.texNum[this.tex] = this.active;


    this.img = new Image();
    this.img.src = img_uri;

    this.img.onload = function() { this.draw(theCanvas.gl); }.bind(this);

    return this;
}

GLsprite.prototype.draw = function(gl_) { 

    this.canvas = document.createElement('canvas');
    this.canvas.style.borderStyle = "solid";
    this.canvas.style.borderWidth = "2px";

    // Use logs to round the canvas width and height to the nearest power of 2
    this.canvas.width = Math.pow(2, Math.ceil(Math.log(this.img.width) / Math.LN2));
    this.canvas.height = 2 * Math.pow(2, Math.ceil(Math.log(this.img.height) / Math.LN2));

    var ctx = this.canvas.getContext("2d");
    if(!ctx) { alert("Error initializing text."); }
    ctx.drawImage(this.img, 0, 0, 
        this.canvas.width, this.canvas.height);
    gl_.activeTexture(gl_.TEXTURE0 + this.active);
    gl_.bindTexture(gl_.TEXTURE_2D, gl_.createTexture());

    gl_.texImage2D(gl_.TEXTURE_2D, 0, gl_.RGBA, gl_.RGBA,
               gl_.UNSIGNED_BYTE, this.canvas);

    GLtexture.initRectTexture(gl_);

    gl_.generateMipmap(gl_.TEXTURE_2D);


    if((--textures_loading) === 0) {
    console.log("all textures loaded.");
    theCanvas.done_loading(1500);
    }
};

GLsprite.prototype.update = function(gl_, new_string) {
    this.text = new_string;
    this.initBuffers(gl_);
};
