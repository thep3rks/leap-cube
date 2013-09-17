var app = {

	controller : new Leap.Controller(),
	gesture : null,
	ctx : null,
	canvas : null,
	webGL : null,
	i : 0,
	initalize : function() {

		this.bindEvents();

		//check that we can conncet to the leap controller
		this.controller.connect();

		//build the webGL
		webGL = new app.webGL;
		webGL.init();
	},

	bindEvents : function() {

		this.controller.on('deviceConnected', this.leapDeviceConnected);
		this.controller.on('deviceDisconnected', this.leapDeviceDisconnected);
		this.controller.on('connect', this.leapConnected);
		this.controller.on('animationFrame', this.leapLoop);

	},

	leapDeviceConnected : function() {
		console.log("A Leap device has been connected.");
	},

	leapDeviceDisconnected : function() {
		console.log("A Leap device has been disconnected.");
	},

	leapConnected : function() {

		console.log('connected');

	},

	leapLoop : function(frame) {

		//app.draw(frame);
		if (app.i < 100) {
			console.log(frame);
			app.i++
		}

		if (frame.pointables.length == 0) {

			//var pos = frame.hands[0].palmVeclocity[0];
			// console.log(pos);
			//            var pos = frame.pointables[0].tipPosition;
			//            //webGL.updateRoatation(frame.pointables[0].tipPosition[0]);
			//            webGL.updateTranslate(frame.pointables[0].tipPosition[0], frame.pointables[0].tipPosition[1], frame.pointables[0].tipPosition[2]);

		}

	}
};

app.webGL = function() {

	var scope = this;
	var gl = null;
	var squareRotation = 0.0;
	var translateX = 0.0;
	var translateY = 0.0;
	var translateZ = -6.0;
	var mvMatrixStack = [];
	var lastSquareUpdateTime = 0;

	this.init = function() {

		//get the canvas
		app.canvas = document.getElementsByTagName('canvas')[0];

		//check for gl
		if (!window.WebGLRenderingContext) {
			console.log('browser doesn\'t support GL');
			return;
		}

		try {
			//check for webgl
			gl = app.canvas.getContext("webgl");
		} catch(e) {
		}

		if (!gl) {
			console.log('counldn\'t initalize WebGL');
			return;
		}

		this.startGL();

	};

	this.startGL = function() {

		gl.clearColor(0.0, 0.0, 0.0, 1.0);
		gl.enable(gl.DEPTH_TEST);
		gl.depthFunc(gl.LEQUAL);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		this.initShaders();
		this.initBuffers();
		//this.drawScene();

		setInterval(this.drawScene, 15);

	};

	this.initShaders = function() {

		var fragmentShader = this.getShader("shader-fs");
		var vertexShader = this.getShader("shader-vs");

		// Create the shader program
		shaderProgram = gl.createProgram();
		gl.attachShader(shaderProgram, vertexShader);
		gl.attachShader(shaderProgram, fragmentShader);
		gl.linkProgram(shaderProgram);

		// If creating the shader program failed, alert
		if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
			console.log("Unable to initialize the shader program.");
		}

		gl.useProgram(shaderProgram);

		vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
		gl.enableVertexAttribArray(vertexPositionAttribute);

	};

	this.getShader = function(id) {

		var shaderScript, theSource, currentChild, shader;

		shaderScript = document.getElementById(id);

		if (!shaderScript) {
			return null;
		}

		theSource = "";
		currentChild = shaderScript.firstChild;

		while (currentChild) {
			if (currentChild.nodeType == currentChild.TEXT_NODE) {
				theSource += currentChild.textContent;
			}

			currentChild = currentChild.nextSibling;
		};

		if (shaderScript.type == "x-shader/x-fragment") {
			shader = gl.createShader(gl.FRAGMENT_SHADER);
		} else if (shaderScript.type == "x-shader/x-vertex") {
			shader = gl.createShader(gl.VERTEX_SHADER);
		} else {
			// Unknown shader type
			return null;
		}

		gl.shaderSource(shader, theSource);

		// Compile the shader program
		gl.compileShader(shader);

		// See if it compiled successfully
		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			alert("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));
			return null;
		}

		return shader;
	};

	this.initBuffers = function() {

		squareVerticesBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesBuffer);

		var vertices = [1.0, 1.0, 0.0, -1.0, 1.0, 0.0, 1.0, -1.0, 0.0, -1.0, -1.0, 0.0];

		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

	};

	this.drawScene = function() {

		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		perspectiveMatrix = makePerspective(45, 640.0 / 480.0, 0.1, 100.0);

		scope.loadIdentity();
		scope.mvTranslate([translateX, translateY, translateZ]);
		scope.mvPushMatrix();
		scope.mvRotate(squareRotation, [0, 0, 1]);

		gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesBuffer);
		gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
		scope.setMatrixUniforms();
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

		scope.mvPopMatrix();

	};

	this.updateRoatation = function(value) {

		squareRotation = value;

	};

	this.updateTranslate = function(x, y, z) {

		translateX = x / 40;
		translateY = y / 100;
		translateZ = z / 10;

		console.log(translateX, translateY, translateZ);

	};

	this.loadIdentity = function() {
		mvMatrix = Matrix.I(4);
	};

	this.setMatrixUniforms = function() {
		var pUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
		gl.uniformMatrix4fv(pUniform, false, new Float32Array(perspectiveMatrix.flatten()));

		var mvUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
		gl.uniformMatrix4fv(mvUniform, false, new Float32Array(mvMatrix.flatten()));
	};

	this.multMatrix = function(m) {
		mvMatrix = mvMatrix.x(m);
	};

	this.mvTranslate = function(v) {
		this.multMatrix(Matrix.Translation($V([v[0], v[1], v[2]])).ensure4x4());
	};
	
	this.mvPushMatrix = function(m) {
		if (m) {
			mvMatrixStack.push(m.dup());
			mvMatrix = m.dup();
		} else {
			mvMatrixStack.push(mvMatrix.dup());
		}
	};

	this.mvPopMatrix = function() {
		if (!mvMatrixStack.length) {
			throw ("Can't pop from an empty matrix stack.");
		}

		mvMatrix = mvMatrixStack.pop();
		return mvMatrix;
	};

	this.mvRotate = function(angle, v) {
		var inRadians = angle * Math.PI / 180.0;

		var m = Matrix.Rotation(inRadians, $V([v[0], v[1], v[2]])).ensure4x4();
		this.multMatrix(m);
	};
};

app.initalize(); 