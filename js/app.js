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
	
	roundTo2DecimalPlaces : function( num )
	{
		return Math.round( num * 100 ) / 100;
	},

	leapLoop : function( frame )
	{
		if ( frame.hands.length > 0 )
		{
			var str = "";
			var hand = frame.hands[ 0 ] ;
			
			if ( hand )
			{
				var palmX = app.roundTo2DecimalPlaces( hand.palmPosition[ 0 ] ); 
				var palmY = app.roundTo2DecimalPlaces( hand.palmPosition[ 1 ] );
				var palmZ = app.roundTo2DecimalPlaces( hand.palmPosition[ 2 ] );
				
				var xActive = ( ( palmX > -30) && ( palmX < 30 ) ) ; 
				var yActive = ( ( palmY > 100) && ( palmY < 200 ) ) ; 
				var zActive = ( ( palmZ > 20) && ( palmZ < 80 ) ) ; 
				
				var active =  xActive && yActive && zActive ;
				
				str += "<p> HAND <br>" 
					+ "<strong>Roll:</strong> " + app.roundTo2DecimalPlaces( hand.roll( ) )
					+ "<br/><strong>Pitch:</strong> " + app.roundTo2DecimalPlaces( hand.pitch( ) ) 
					+ "<br/><strong>Yaw:</strong> " + app.roundTo2DecimalPlaces( hand.yaw( ) ) 
					+ "<br/><strong>palmPosition X:</strong> " + palmX
					+ "<br/><strong>palmPosition Y:</strong> " + palmY
					+ "<br/><strong>palmPosition Z:</strong> " + palmZ
					// + "<br/><strong>palmVelocity X:</strong> " + app.roundTo2DecimalPlaces( hand.palmVelocity[ 0 ] )
					// + "<br/><strong>palmVelocity Y:</strong> " + app.roundTo2DecimalPlaces( hand.palmVelocity[ 1 ] )
					// + "<br/><strong>palmVelocity Z:</strong> " + app.roundTo2DecimalPlaces( hand.palmVelocity[ 2 ] )
					// + "<br/><strong>sphereCenter:</strong> " + hand.sphereCenter
					// + "<br/><strong>sphereRadius:</strong> " + hand.sphereRadius
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
				
	/*
				Hand Properties
				palmPosition 	// ‚Äî The center of the palm measured in millimeters from the Leap origin.
				palmVelocity 	// ‚Äî The speed of the palm in millimeters per second.
				palmNormal 		// ‚Äî A vector perpendicular to the plane formed by the palm of the hand. The vector points downward out of the palm.
				direction 		// ‚Äî A vector pointing from the center of the palm toward the fingers.
				sphereCenter 	// ‚Äî The center of a sphere fit to the curvature of the hand (as if it were holding a ball).
				sphereRadius 	// ‚Äî The radius of a sphere fit to the curvature of the hand. The radius changes with the shape of the hand.
						
				
				General Frame properties
				rotationAxis // ‚Äî A direction vector expressing the axis of rotation.
				rotationAngle // ‚Äî The angle of rotation clockwise around the rotation axis (using the right-hand rule).
				rotationMatrix // ‚Äî A transform matrix expressing the rotation.
				scaleFactor // ‚Äî A factor expressing expansion or contraction.
				translation // ‚Äî A vector expressing the linear movement.
	*/
	}
	}
			
			document.getElementById( 'out' ).innerHTML = str;
			
			
			

	},
};
