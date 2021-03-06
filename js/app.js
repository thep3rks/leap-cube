var app =
{
	//@formatter:off
	centrePoint : { x : 0, y : 200, z : 0 }, //mm
	activeRadius : 20000, //Used as a square so 10000 = 10cm
	haveLeap : true,
	glView : null,
	canvas : null,
	controller : new Leap.Controller( ),
	//@formatter:on
	
	initialise : function( )
	{
		this.initialiseGL( );

		if ( this.haveLeap )
			this.initialiseLeap( );
	},

	initialiseGL : function( )
	{
		console.log( "init" );
		canvas = document.getElementById( "cube-canvas" );

		glView = new app.GLView( );
		glView.init( canvas );
		glView.initShaders( );
		glView.initBuffers( );
		glView.initTexture( );
		glView.finaliseSetup( );

		//temp when no leap
		if ( !this.haveLeap )
			this.noLeapLoop( );
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

	roundTo2DecimalPlaces : function( num )
	{
		return Math.round( num * 100 ) / 100;
	},

	leapLoop : function( frame )
	{
		if ( frame.hands.length > 0 )
		{
			var str = "";
			var hand = frame.hands[ 0 ];

			//ACTIVE ZONE
			var palmX = app.roundTo2DecimalPlaces( hand.palmPosition[ 0 ] );
			var palmY = app.roundTo2DecimalPlaces( hand.palmPosition[ 1 ] );
			var palmZ = app.roundTo2DecimalPlaces( hand.palmPosition[ 2 ] );

			//
			var dX = palmX - app.centrePoint.x;
			var dY = palmY - app.centrePoint.y;
			var dZ = palmZ - app.centrePoint.z;

			var active = ( ( dX * dX + dY * dY + dZ * dZ ) <= app.activeRadius );

			// MOVEMENT VALUES
			var roll = app.roundTo2DecimalPlaces( hand.roll( ) );
			var pitch = app.roundTo2DecimalPlaces( hand.pitch( ) );
			var yaw = app.roundTo2DecimalPlaces( hand.yaw( ) );

			//@formatter:off
				str += "<p> HAND <br>" 
					+ "<strong>Roll:</strong> " + roll
					+ "<br/><strong>Pitch:</strong> " + pitch 
					+ "<br/><strong>Yaw:</strong> " + yaw 
					+ "<br/><strong>palmPosition X:</strong> " + palmX
					+ "<br/><strong>palmPosition Y:</strong> " + palmY
					+ "<br/><strong>palmPosition Z:</strong> " + palmZ
					// + "<br/><strong>palmVelocity X:</strong> " + app.roundTo2DecimalPlaces( hand.palmVelocity[ 0 ] )
					// + "<br/><strong>palmVelocity Y:</strong> " + app.roundTo2DecimalPlaces( hand.palmVelocity[ 1 ] )
					// + "<br/><strong>palmVelocity Z:</strong> " + app.roundTo2DecimalPlaces( hand.palmVelocity[ 2 ] )
					+ "<br/><strong>sphereCenter:</strong> " + hand.sphereCenter
					+ "<br/><strong>sphereRadius:</strong> " + hand.sphereRadius
					+ "<br/><strong> -- ACTIVE -- " + active 
					+ "</p>" ; 
					
				//console.log( str );
				document.getElementById( 'out' ).innerHTML = str;
				//@formatter:on
			
			//TODO: Look into general 'Frame' props
						
			// DRAW
			if ( active == true )
			{
				// can add positioning here
				glView.animate( roll, pitch, yaw, (palmZ / 20) - 10 );
				// glView.animate( pitch, roll, yaw, -5 );
			}

			glView.drawScene( );
		}
	},

	noLeapLoop : function( )
	{
		requestAnimFrame( app.noLeapLoop );

		// DRAW
		glView.animateStatic( );

		glView.drawScene( );
	},
};
