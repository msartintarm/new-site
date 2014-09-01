/*
 * Internally manages a texture and frame.
 *
 * Does more than init its objects buffers - also
 * binds a GPU frame to a texture.
 *
 * To draw, it renders the scene and updates the texture.
 */
function GLframe(texture_num) {
    this.num = texture_num;
    theCanvas.gl.texNum[this.num] = -1;
    this.frameBuff = null;
}

GLframe.prototype.init = function(gl_) {

//    this.playa.setShader(gl_.shader);

    this.playa.initBuffers(gl_);

    this.frameBuff = gl_.createFramebuffer();
    this.frameBuff.width = 512;
    this.frameBuff.height = 512;

    this.active = (++(gl_.active));
    gl_.texNum[this.num] = this.active;

    this.texture = gl_.createTexture();

    // don't really need this unless it's overwriting another texture
    gl_.activeTexture(gl_.TEXTURE0 + this.active);
    gl_.bindTexture(gl_.TEXTURE_2D, this.texture);

    GLtexture.initSquareTexture(gl_);
    gl_.texImage2D(gl_.TEXTURE_2D, 0, gl_.RGBA,
		   this.frameBuff.width, this.frameBuff.height,
		   0, gl_.RGBA, gl_.UNSIGNED_BYTE, null);
    gl_.generateMipmap(gl_.TEXTURE_2D);

    this.renderBuff = gl_.createRenderbuffer();
    gl_.bindRenderbuffer(gl_.RENDERBUFFER, this.renderBuff);
    gl_.renderbufferStorage(gl_.RENDERBUFFER,
			    gl_.DEPTH_COMPONENT16,
			    this.frameBuff.width,
			    this.frameBuff.height);

    gl_.bindFramebuffer(gl_.FRAMEBUFFER, this.frameBuff);
    gl_.framebufferTexture2D(gl_.FRAMEBUFFER,
			     gl_.COLOR_ATTACHMENT0,
			     gl_.TEXTURE_2D,
			     this.texture, 0);
    gl_.framebufferRenderbuffer(gl_.FRAMEBUFFER,
				gl_.DEPTH_ATTACHMENT,
				gl_.RENDERBUFFER, this.renderBuff);

    // -- check to make sure everything is init'ed -- //
    if(gl_.checkFramebufferStatus(gl_.FRAMEBUFFER) !==
       gl_.FRAMEBUFFER_COMPLETE) alert("yo, framebuffer not working dawg");

    gl_.bindRenderbuffer(gl_.RENDERBUFFER, null);
    gl_.bindFramebuffer(gl_.FRAMEBUFFER, null);
    gl_.bindTexture(gl_.TEXTURE_2D, null);

    var sampler_num = (++(gl_.shader.sampler));

    console.log("frame: [" + this.active + "," + this.num + "]");
};

/**
 * 1. Saves state of matrices
 * 2. Loads matrices specific to this framebuffer into GL
 * 3. Renders scene
 * 4. Loads state of matrices
 * 5. Updates texture used by main framebuffer
 */

GLframe.prototype.draw = function(gl_) {

    gl_.activeTexture(gl_.TEXTURE0 + this.active);
    gl_.viewport(0, 0, this.frameBuff.width, this.frameBuff.height);
    gl_.bindTexture(gl_.TEXTURE_2D, null);
    gl_.bindFramebuffer(gl_.FRAMEBUFFER, this.frameBuff);
    gl_.clear(gl_.COLOR_BUFFER_BIT | gl_.DEPTH_BUFFER_BIT);

    // edit vMatrix here
    // theMatrix.vMatrixChanged = true;

    theCanvas.drawScene();

    this.playa.draw(gl_);

    gl_.bindFramebuffer(gl_.FRAMEBUFFER, null);
    gl_.bindTexture(gl_.TEXTURE_2D, this.texture);
    gl_.generateMipmap(gl_.TEXTURE_2D);
    gl_.viewport(0, 0, gl_.drawingBufferWidth, gl_.drawingBufferHeight);

};
