app.GLView = function( )
{
	var gl;
	var shaderProgram;
	var cubeVertexPositionBuffer;
	var cubeVertexIndexBuffer;
	var cubeVertexTextureCoordBuffer;
	var cubeVertexNormalBuffer;
	var crateTexture;

	var mvMatrixStack = [ ];
	
	var mvMatrix = mat4.create( );
	var pMatrix = mat4.create( );

	var rollCube = 0;
	var pitchCube = 0;
	var yawCube = 0;
	var zCube = 0;
	var lastTime = 0;
	var moveMultiplier = 40;

	this.init = function( canvas )
	{
		gl = WebGLUtils.setupWebGL( canvas );
		gl.viewportWidth = canvas.width;
		gl.viewportHeight = canvas.height;
	};

	this.finaliseSetup = function( )
	{
		gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
		gl.enable( gl.DEPTH_TEST );
	};

	this.getShader = function( gl, id )
	{
		var shaderScript = document.getElementById( id );

		if ( !shaderScript )
		{
			return null;
		}

		var str = "";
		var k = shaderScript.firstChild;

		while ( k )
		{
			if ( k.nodeType == 3 )
			{
				str += k.textContent;
			}

			k = k.nextSibling;
		}

		var shader;

		if ( shaderScript.type == "x-shader/x-fragment" )
		{
			shader = gl.createShader( gl.FRAGMENT_SHADER );
		}
		else
		if ( shaderScript.type == "x-shader/x-vertex" )
		{
			shader = gl.createShader( gl.VERTEX_SHADER );
		}
		else
		{
			return null;
		}

		gl.shaderSource( shader, str );
		gl.compileShader( shader );

		if ( !gl.getShaderParameter( shader, gl.COMPILE_STATUS ) )
		{
			alert( gl.getShaderInfoLog( shader ) );
			return null;
		};

		return shader;
	};

	this.initShaders = function( )
	{
		var fragmentShader = this.getShader( gl, "shader-fs" );
		var vertexShader = this.getShader( gl, "shader-vs" );

		shaderProgram = gl.createProgram( );
		gl.attachShader( shaderProgram, vertexShader );
		gl.attachShader( shaderProgram, fragmentShader );
		gl.linkProgram( shaderProgram );

		if ( !gl.getProgramParameter( shaderProgram, gl.LINK_STATUS ) )
		{
			alert( "Could not initialise shaders" );
		}

		gl.useProgram( shaderProgram );

		shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
        gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

        shaderProgram.vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "aVertexNormal");
        gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);

        shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
        gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);

        shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
        shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
        shaderProgram.nMatrixUniform = gl.getUniformLocation(shaderProgram, "uNMatrix");
        shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");
        shaderProgram.useLightingUniform = gl.getUniformLocation(shaderProgram, "uUseLighting");
        shaderProgram.ambientColorUniform = gl.getUniformLocation(shaderProgram, "uAmbientColor");
        shaderProgram.lightingDirectionUniform = gl.getUniformLocation(shaderProgram, "uLightingDirection");
        shaderProgram.directionalColorUniform = gl.getUniformLocation(shaderProgram, "uDirectionalColor");
        shaderProgram.alphaUniform = gl.getUniformLocation(shaderProgram, "uAlpha");
	};

	this.setMatrixUniforms = function( )
	{
		gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
        gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);

        var normalMatrix = mat3.create();
        mat4.toInverseMat3(mvMatrix, normalMatrix);
        mat3.transpose(normalMatrix);
        gl.uniformMatrix3fv(shaderProgram.nMatrixUniform, false, normalMatrix);
	};

	this.initBuffers = function( )
	{
		cubeVertexPositionBuffer = gl.createBuffer( );
		gl.bindBuffer( gl.ARRAY_BUFFER, cubeVertexPositionBuffer );

		//@formatter:off
		var vertices = [
		      // Front face
		      -1.0, -1.0,  1.0,
		       1.0, -1.0,  1.0,
		       1.0,  1.0,  1.0,
		      -1.0,  1.0,  1.0,
		
		      // Back face
		      -1.0, -1.0, -1.0,
		      -1.0,  1.0, -1.0,
		       1.0,  1.0, -1.0,
		       1.0, -1.0, -1.0,
		
		      // Top face
		      -1.0,  1.0, -1.0,
		      -1.0,  1.0,  1.0,
		       1.0,  1.0,  1.0,
		       1.0,  1.0, -1.0,
		
		      // Bottom face
		      -1.0, -1.0, -1.0,
		       1.0, -1.0, -1.0,
		       1.0, -1.0,  1.0,
		      -1.0, -1.0,  1.0,
		
		      // Right face
		       1.0, -1.0, -1.0,
		       1.0,  1.0, -1.0,
		       1.0,  1.0,  1.0,
		       1.0, -1.0,  1.0,
		
		      // Left face
		      -1.0, -1.0, -1.0,
		      -1.0, -1.0,  1.0,
		      -1.0,  1.0,  1.0,
		      -1.0,  1.0, -1.0,
	    ];
	    //@formatter:on

		gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( vertices ), gl.STATIC_DRAW );
		cubeVertexPositionBuffer.itemSize = 3;
		cubeVertexPositionBuffer.numItems = 24;
		
		cubeVertexNormalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexNormalBuffer);
        var vertexNormals = [
            // Front face
             0.0,  0.0,  1.0,
             0.0,  0.0,  1.0,
             0.0,  0.0,  1.0,
             0.0,  0.0,  1.0,

            // Back face
             0.0,  0.0, -1.0,
             0.0,  0.0, -1.0,
             0.0,  0.0, -1.0,
             0.0,  0.0, -1.0,

            // Top face
             0.0,  1.0,  0.0,
             0.0,  1.0,  0.0,
             0.0,  1.0,  0.0,
             0.0,  1.0,  0.0,

            // Bottom face
             0.0, -1.0,  0.0,
             0.0, -1.0,  0.0,
             0.0, -1.0,  0.0,
             0.0, -1.0,  0.0,

            // Right face
             1.0,  0.0,  0.0,
             1.0,  0.0,  0.0,
             1.0,  0.0,  0.0,
             1.0,  0.0,  0.0,

            // Left face
            -1.0,  0.0,  0.0,
            -1.0,  0.0,  0.0,
            -1.0,  0.0,  0.0,
            -1.0,  0.0,  0.0
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexNormals), gl.STATIC_DRAW);
        cubeVertexNormalBuffer.itemSize = 3;
        cubeVertexNormalBuffer.numItems = 24;

		cubeVertexTextureCoordBuffer = gl.createBuffer( );
		gl.bindBuffer( gl.ARRAY_BUFFER, cubeVertexTextureCoordBuffer );

		//@formatter:off
    	var textureCoords = [
		      // Front face
		      0.0, 0.0,
		      1.0, 0.0,
		      1.0, 1.0,
		      0.0, 1.0,
		
		      // Back face
		      1.0, 0.0,
		      1.0, 1.0,
		      0.0, 1.0,
		      0.0, 0.0,
		
		      // Top face
		      0.0, 1.0,
		      0.0, 0.0,
		      1.0, 0.0,
		      1.0, 1.0,
		
		      // Bottom face
		      1.0, 1.0,
		      0.0, 1.0,
		      0.0, 0.0,
		      1.0, 0.0,
		
		      // Right face
		      1.0, 0.0,
		      1.0, 1.0,
		      0.0, 1.0,
		      0.0, 0.0,
		
		      // Left face
		      0.0, 0.0,
		      1.0, 0.0,
		      1.0, 1.0,
		      0.0, 1.0,
	    ];
		//@formatter:on

		gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( textureCoords ), gl.STATIC_DRAW );
		cubeVertexTextureCoordBuffer.itemSize = 2;
		cubeVertexTextureCoordBuffer.numItems = 24;

		cubeVertexIndexBuffer = gl.createBuffer( );
		gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer );

		//@formatter:off
        var cubeVertexIndices = [
            0, 1, 2,      0, 2, 3,    // Front face
            4, 5, 6,      4, 6, 7,    // Back face
            8, 9, 10,     8, 10, 11,  // Top face
            12, 13, 14,   12, 14, 15, // Bottom face
            16, 17, 18,   16, 18, 19, // Right face
            20, 21, 22,   20, 22, 23  // Left face
        ];
        //@formatter:on

		gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint16Array( cubeVertexIndices ), gl.STATIC_DRAW );
		cubeVertexIndexBuffer.itemSize = 1;
		cubeVertexIndexBuffer.numItems = 36;
	};

	this.handleLoadedTexture = function( )
	{
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

        gl.bindTexture(gl.TEXTURE_2D, crateTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, crateTexture.image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
        gl.generateMipmap(gl.TEXTURE_2D);
        
        gl.bindTexture(gl.TEXTURE_2D, null);
	};

	this.initTexture = function( )
	{
		crateTexture = gl.createTexture( );
		crateTexture.image = new Image( );
		crateTexture.image.src = "assets/glass1.png";
		crateTexture.image.onload = this.handleLoadedTexture( );
	};

	this.animatemvPushMatrix = function( )
	{
		var copy = mat4.create( );

		mat4.set( mvMatrix, copy );
		mvMatrixStack.push( copy );
	};

	this.mvPopMatrix = function( )
	{
		if ( mvMatrixStack.length == 0 )
		{
			throw "Invalid popMatrix!";
		}
		mvMatrix = mvMatrixStack.pop( );
	};

	this.degToRad = function( degrees )
	{
		return degrees * Math.PI / 180;
	};

	this.animate = function( roll, pitch, yaw, z )
	{
		pitchCube = pitch * moveMultiplier;
		rollCube = roll * moveMultiplier;
		yawCube = -yaw * moveMultiplier;
		zCube = z;
	};

	this.animateStatic = function( )
	{
		pitchCube += 0.3;
		rollCube += 0.6;
		yawCube += 0.4;
		zCube = -5;
	};

	this.drawScene = function( )
	{
		gl.viewport( 0, 0, gl.viewportWidth, gl.viewportHeight );
		gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

		mat4.perspective( 45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix );

		mat4.identity( mvMatrix );
		mat4.translate( mvMatrix, [ 0.0, 0.0, zCube ] );

		this.animatemvPushMatrix( );

		mat4.rotate( mvMatrix, this.degToRad( pitchCube ), [ 1, 0, 0 ] );
		mat4.rotate( mvMatrix, this.degToRad( yawCube ), [ 0, 1, 0 ] );
		mat4.rotate( mvMatrix, this.degToRad( rollCube ), [ 0, 0, 1 ] );

		gl.bindBuffer( gl.ARRAY_BUFFER, cubeVertexPositionBuffer );
		gl.vertexAttribPointer( shaderProgram.vertexPositionAttribute, cubeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0 );
		
		gl.bindBuffer( gl.ARRAY_BUFFER, cubeVertexNormalBuffer );
		gl.vertexAttribPointer( shaderProgram.vertexNormalAttribute, cubeVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0 );

		gl.bindBuffer( gl.ARRAY_BUFFER, cubeVertexTextureCoordBuffer );
		gl.vertexAttribPointer( shaderProgram.textureCoordAttribute, cubeVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0 );
		
		// TEXTURES //
		gl.activeTexture( gl.TEXTURE0 );
		gl.bindTexture( gl.TEXTURE_2D, crateTexture );
		gl.uniform1i( shaderProgram.samplerUniform, 0 );

		// ALPHA / BLENDING //
		gl.blendFunc( gl.SRC_ALPHA, gl.ONE );
		gl.enable( gl.BLEND );
		gl.disable( gl.DEPTH_TEST );
		gl.uniform1f( shaderProgram.alphaUniform, 0.5 );

		// LIGHTING //
		gl.uniform1i( shaderProgram.useLightingUniform, true );

		// Ambient
		gl.uniform3f( shaderProgram.ambientColorUniform, 0.5, 0.5, 0.5 ); 

		// Directional
        var lightingDirection = [ -0.25, -0.25, -1 ] ;
        
  		var adjustedLD = vec3.create();
        vec3.normalize(lightingDirection, adjustedLD);
        vec3.scale(adjustedLD, -1);
        gl.uniform3fv(shaderProgram.lightingDirectionUniform, adjustedLD);
		
        gl.uniform3f( shaderProgram.directionalColorUniform, 0.8, 0.8, 0.8 ) ;


		gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer );
		this.setMatrixUniforms( );
		gl.drawElements( gl.TRIANGLES, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0 );
	};

};
