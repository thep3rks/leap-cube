var app =
{

	glView : null,
	controller : new Leap.Controller( ),

	initialise : function( )
	{
		app.initialiseGL( );
		app.initialiseLeap( );

	},

	initialiseGL : function( )
	{
		this.canvas = document.getElementById( "cube-canvas" );

		glView = new app.GLView( );
		glView.init( this.canvas );
		glView.initShaders( );
		glView.initBuffers( );
		glView.finaliseSetup( );

		//this.glView.drawScene( );

		app.tick( );
	},

	tick : function( )
	{
		requestAnimFrame( app.tick );
		glView.drawScene( );
		glView.animate( );
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
		if ( frame.hands.length > 0 )
		{
			var str = "";
			for ( var i in frame.handsMap )
			{
				var hand = frame.handsMap[ i ];
				str += "<p> HAND " + i + "<br>" 
					+ "<strong>Roll:</strong> " + hand.roll( ) 
					+ "<br/><strong>Pitch:</strong> " + hand.pitch( ) 
					+ "<br/><strong>Yaw:</strong> " + hand.yaw( ) 
					+ "<br/><strong>palmPosition:</strong> " + hand.palmPosition 
					+ "<br/><strong>palmPosition X:</strong> " + hand.palmPosition[ 0 ] 
					+ "<br/><strong>palmPosition Y:</strong> " + hand.palmPosition[ 1 ] 
					+ "<br/><strong>palmPosition Z:</strong> " + hand.palmPosition[ 2 ] 
					+ "<br/><strong>palmVelocity:</strong> " + hand.palmVelocity 
					+ "<br/><strong>palmNormal:</strong> " + hand.palmNormal
					+ "<br/><strong>direction:</strong> " + hand.direction
					+ "<br/><strong>sphereCenter:</strong> " + hand.sphereCenter
					+ "<br/><strong>sphereRadius:</strong> " + hand.sphereRadius
					+ "</p>"
					+ "<p> FRAME <br>" 
					//+ "<strong>RotationAxis:</strong> " + frame.rotationAxis()
					+ "<strong>rotationAngle X:</strong> " + frame.rotationAngle( app.controller.frame( 1 ), 0 )
					+ "<strong>rotationAngle Y:</strong> " + frame.rotationAngle( 0,  1 )
					+ "<strong>rotationAngle Z:</strong> " + frame.rotationAngle( 0,  2 )
					//+ "<strong>rotationMatrix:</strong> " + frame.rotationMatrix
					//+ "<strong>scaleFactor:</strong> " + frame.scaleFactor
					//+ "<strong>translation:</strong> " + frame.translation
					+ "</p>" ; 
			// /console.log(frame[10]);
			
			}
			//console.log( str );
			
			document.getElementById( 'out' ).innerHTML = str;
			
			// console.log( frame.hands[ 0 ] );
			// var pos = frame.hands[0].palmVeclocity[ 0 ];
			
			
			
			// Hand Properties
			// palmPosition 	// — The center of the palm measured in millimeters from the Leap origin.
			// palmVelocity 	// — The speed of the palm in millimeters per second.
			// palmNormal 		// — A vector perpendicular to the plane formed by the palm of the hand. The vector points downward out of the palm.
			// direction 		// — A vector pointing from the center of the palm toward the fingers.
			// sphereCenter 	// — The center of a sphere fit to the curvature of the hand (as if it were holding a ball).
			// sphereRadius 	// — The radius of a sphere fit to the curvature of the hand. The radius changes with the shape of the hand.
					
			
			//General Frame properties
			// rotationAxis // — A direction vector expressing the axis of rotation.
			// rotationAngle // — The angle of rotation clockwise around the rotation axis (using the right-hand rule).
			// rotationMatrix // — A transform matrix expressing the rotation.
			// scaleFactor // — A factor expressing expansion or contraction.
			// translation // — A vector expressing the linear movement.
		}

	},
};
