var textures_loading = 0;

function GLtexture(gl_, name) {

    if(typeof gl_.texNum[name] != 'undefined') return;
    gl_.texNum[name] = -1;
    textures_loading ++;

    // REMOVED: Use base64 encoding to keep image client-side
    // NEW: Just fetch the picture and paste it to canvas.
    this.img = new Image();
    this.img.src = "/textures/" + name;

    this.img.active = (++gl_.active);

    gl_.texNum[name] = this.img.active;

    this.img.onload = this.init.bind(this.img, gl_);

    this.img.onerror = function(){ alert("problem with texture " +
					 index_ + " active: " + this.img.active); };
    return this;
}

// Square (or power of two), or irregular?
GLtexture.initSquareTexture = function(gl_) {
	gl_.texParameteri(gl_.TEXTURE_2D, gl_.TEXTURE_MAG_FILTER, gl_.LINEAR);
	gl_.texParameteri(gl_.TEXTURE_2D, gl_.TEXTURE_MIN_FILTER, gl_.LINEAR_MIPMAP_NEAREST);
}
GLtexture.initRectTexture = function(gl_) {
	gl_.texParameteri(gl_.TEXTURE_2D, gl_.TEXTURE_WRAP_S, gl_.CLAMP_TO_EDGE);
	gl_.texParameteri(gl_.TEXTURE_2D, gl_.TEXTURE_WRAP_T, gl_.CLAMP_TO_EDGE);
}

GLtexture.prototype.init = function(gl_) {

    gl_.activeTexture(gl_.TEXTURE0 + this.active);
    gl_.bindTexture(gl_.TEXTURE_2D, gl_.createTexture());
    gl_.texImage2D(gl_.TEXTURE_2D, 0, gl_.RGBA, gl_.RGBA, gl_.UNSIGNED_BYTE, this);
  	GLtexture.initSquareTexture(gl_);
    gl_.generateMipmap(gl_.TEXTURE_2D);

    console.log("tex: [" + this.active + "," + this.sampler + "," + this.src + "]");

    if((--textures_loading) === 0) {
	console.log("all textures loaded.");
	theCanvas.done_loading(1500);
    }
};

GLtexture.create = function (gl_, name) {
    var x = new GLtexture(gl_, name);
}
