var app =
{
	//@formatter:off
	centrePoint : { x : 0, y : 120, z : 0 },
	activeRadius : 10000, //Used as a square so 10000 = 100mm
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

			//var pitchAdjust = 0.3;
			// temporary : Normalising to hand position

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
					// + "</p>"
					// + "<p> FRAME <br>" 
					// //+ "<strong>RotationAxis:</strong> " + frame.rotationAxis()
					// + "<strong>rotationAngle X:</strong> " + frame.rotationAngle( app.controller.frame( 1 ), 0 )
					// + "<strong>rotationAngle Y:</strong> " + frame.rotationAngle( 0,  1 )
					// + "<strong>rotationAngle Z:</strong> " + frame.rotationAngle( 0,  2 )
					// /+ "<strong>rotationMatrix:</strong> " + frame.rotationMatrix
					// + "<strong>scaleFactor:</strong> " + frame.scaleFactor
					// + "<strong>translation:</strong> " + frame.translation
					+ "<br/><strong> -- ACTIVE -- " + active 
					+ "</p>" ; 
					
				//console.log( str );
				document.getElementById( 'out' ).innerHTML = str;
				
				//@formatter:on
			/*
			Hand Properties
			palmPosition 	The center of the palm measured in millimeters from the Leap origin.
			palmVelocity 	The speed of the palm in millimeters per second.
			palmNormal 		A vector perpendicular to the plane formed by the palm of the hand. The vector points downward out of the palm.
			direction 		A vector pointing from the center of the palm toward the fingers.
			sphereCenter 	The center of a sphere fit to the curvature of the hand (as if it were holding a ball).
			sphereRadius 	The radius of a sphere fit to the curvature of the hand. The radius changes with the shape of the hand.

			General Frame properties
			rotationAxis 	A direction vector expressing the axis of rotation.
			rotationAngle 	The angle of rotation clockwise around the rotation axis (using the right-hand rule).
			rotationMatrix 	A transform matrix expressing the rotation.
			scaleFactor		A factor expressing expansion or contraction.
			translation		A vector expressing the linear movement.
			*/

			// DRAW
			if ( active == true )
			{
				glView.animate( roll, pitch, yaw );
			}

			glView.drawScene( );
		}
	},

	noLeapLoop : function( )
	{
		requestAnimFrame( app.noLeapLoop );

		// DRAW
		glView.animate( 2.5, 2, 1 );

		glView.drawScene( );
	},
};
