var app =
{

	glView : null,
	canvas : null,
	controller : new Leap.Controller( ),

	initialise : function( )
	{
		app.initialiseGL( );
		app.initialiseLeap( );

	},

	initialiseGL : function( )
	{
		this.canvas = document.getElementById( "cube-canvas" );

		this.glView = new app.GLView( );
		this.glView.init( this.canvas );
		this.glView.initShaders( );
		this.glView.initBuffers( );
		this.glView.finaliseSetup( );
		this.glView.drawScene( );
	},

	initialiseLeap : function( )
	{
		this.bindEvents( );

		this.controller.connect( );
	},

	bindEvents : function( )
	{
		this.controller.on( 'deviceConnected', this.leapDeviceConnected );
		this.controller.on( 'deviceDisconnected', this.leapDeviceDisconnected );
		this.controller.on( 'connect', this.leapConnected );
		this.controller.on( 'animationFrame', this.leapLoop );
	},

	leapDeviceConnected : function( )
	{
		console.log( "A Leap device has been connected." );
	},

	leapDeviceDisconnected : function( )
	{
		console.log( "A Leap device has been disconnected." );
	},

	leapConnected : function( )
	{
		console.log( 'connected' );
	},

	leapLoop : function( frame )
	{

		//app.draw(frame);
		if ( app.i < 100 )
		{
			console.log( frame );
			app.i++;
		}

		if ( frame.pointables.length > 0 )
		{

			console.log( frame.pointables.length );
			// var pos = frame.hands[0].palmVeclocity[0];
			// console.log(pos);
			//            var pos = frame.pointables[0].tipPosition;
			//            //webGL.updateRoatation(frame.pointables[0].tipPosition[0]);
			//            webGL.updateTranslate(frame.pointables[0].tipPosition[0],
			// frame.pointables[0].tipPosition[1], frame.pointables[0].tipPosition[2]);

		}

	},
};
