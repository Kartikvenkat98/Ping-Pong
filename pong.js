var

WIDTH  = 700,
HEIGHT = 500,
pi = Math.PI,
Up = 38,
Down = 40,
W = 87,
S = 83,

res,

canvas,
ctx,
keystate,

player1 = 
{
	x: null,
	y: null,
	width:  20,
	height: 80,
	score: null,
	
	update: function() 
	{
		if (keystate[W]) this.y -= 8;
		if (keystate[S]) this.y += 8;
		// keep the paddle inside of the canvas
		this.y = Math.max(Math.min(this.y, HEIGHT - this.height), 0);
	},
	
	draw: function() 
	{
		ctx.fillStyle = "#f00";
		ctx.fillRect(this.x, this.y, this.width, this.height);
	}
},

player2 = 
{
	x: null,
	y: null,
	width:  20,
	height: 80,
	score: null,
	
	update: function() 
	{
		
		if (keystate[Up]) this.y -= 8;
		if (keystate[Down]) this.y += 8;
		// keep the paddle inside of the canvas
		this.y = Math.max(Math.min(this.y, HEIGHT - this.height), 0);
	},
	
	draw: function() 
	{
		ctx.fillStyle = "#0f0";
		ctx.fillRect(this.x, this.y, this.width, this.height);
	}
},

ball = 
{
	x: 340,
	y: 240,
	vel: null,
	side: 20,
	speed: 10,
	
	serve: function(side) 
	{
		// set the x and y position
		var r = Math.random();
		this.x = side === 1 ? player1.x + player1.width : player2.x - this.side;
		this.y = (HEIGHT - this.side)*r;
		// calculate out-angle, higher/lower on the y-axis =>
		// steeper angle
		var phi = 0.1*pi*(1 - 2*r);
		// set velocity direction and magnitude
		this.vel = 
		{
			x: side*this.speed*Math.cos(phi),
			y: this.speed*Math.sin(phi)
		}
	},
	
	update: function() 
	{
		// update position with current velocity
		this.x += this.vel.x;
		this.y += this.vel.y;
		// check if out of the canvas in the y direction
		if (0 > this.y || this.y + this.side > HEIGHT) {
			// calculate and add the right offset, i.e. how far
			// inside of the canvas the ball is
			var offset = this.vel.y < 0 ? 0 - this.y : HEIGHT - (this.y+this.side);
			this.y += 2*offset;
			// mirror the y velocity
			this.vel.y *= -1;
		}
		// helper function to check intesectiont between two
		// axis aligned bounding boxex (AABB)
		var AABBIntersect = function(ax, ay, aw, ah, bx, by, bw, bh) 
		{
			return ax < bx+bw && ay < by+bh && bx < ax+aw && by < ay+ah;
		};
		// check againts target paddle to check collision in x
		// direction
		var pdle = this.vel.x < 0 ? player1 : player2;
		if (AABBIntersect(pdle.x, pdle.y, pdle.width, pdle.height,
				this.x, this.y, this.side, this.side))
		 {	
			// set the x position and calculate reflection angle
			this.x = pdle===player1 ? player1.x+player1.width : player2.x - this.side;
			var n = (this.y+this.side - pdle.y)/(pdle.height+this.side);
			var phi = 0.25*pi*(2*n - 1); // pi/4 = 45
			// calculate smash value and update velocity
			var smash = Math.abs(phi) > 0.2*pi ? 1.5 : 1;
			this.vel.x = smash*(pdle===player1 ? 1 : -1)*this.speed*Math.cos(phi);
			this.vel.y = smash*this.speed*Math.sin(phi);
		}
		// reset the ball when ball outside of the canvas in the
		// x direction
		/*if (0 > this.x+this.side || this.x > WIDTH) 
		{
			this.serve(pdle===player1 ? 1 : -1);
		}*/
		
		if (0 > this.x+this.side || this.x > WIDTH) 
		{
			var isplayer = pdle===player1;
			player1.score += isplayer ? 0 : 1;
			player2.score += isplayer ? 1 : 0;
			
			document.getElementById("red").innerHTML = (player1.score < 10)?'0'+ player1.score : player1.score;
			document.getElementById("green").innerHTML = (player2.score < 10)?'0'+ player2.score : player2.score;
			
			if(player1.score == 15)
			{
				alert("Player 1 wins 15 to "+ player2.score);
				location.reload();
			}
			
			if(player2.score == 15)
			{
				alert("Player 2 wins 15 to "+ player1.score);
				location.reload();
			}
			
			/*if(isplayer == player1)
				score1++;
			if(isplayer == player2)
				score2++;*/
			this.serve(isplayer ? 1 : -1);
		}

	},
	/**
	 * Draw the ball to the canvas
	 */
	draw: function() 
	{
		ctx.fillStyle = "#ff0";
		ctx.fillRect(this.x, this.y, this.side, this.side);
	}
};
/**
 * Starts the game
 */
function main() 
{
	// create, initiate and append game canvas
	canvas = document.createElement("canvas");
	window.cancelAnimationFrame(res);
	document.getElementById("red").innerHTML = '00';
	document.getElementById("green").innerHTML = '00';
	canvas.width = WIDTH;
	canvas.height = HEIGHT;
	ctx = canvas.getContext("2d");
	ctx.fillStyle = "#00f";
	document.body.appendChild(canvas);
	keystate = {};
	// keep track of keyboard presses
	document.addEventListener("keydown", function(evt) 
	{
		keystate[evt.keyCode] = true;
	});
	document.addEventListener("keyup", function(evt) 
	{
		delete keystate[evt.keyCode];
	});
	init(); // initiate game objects
	// game loop function
	var loop = function() 
	{
		ctx.clearRect(0,0,WIDTH,HEIGHT);
		update();
		draw();
		res = window.requestAnimationFrame(loop, canvas);
	};
	res = window.requestAnimationFrame(loop, canvas);
}
/**
 * Initatite game objects and set start positions
 */
function init() 
{
	player1.x = player1.width;
	player1.y = (HEIGHT - player1.height)/2;
	player2.x = WIDTH - (player1.width + player2.width);
	player2.y = (HEIGHT - player2.height)/2;
	player1.score = 0;
	player2.score = 0;
	ball.serve(1);
}
/**
 * Update all game objects
 */
function update() 
{
	ball.update();
	player1.update();
	player2.update();
}
/**
 * Clear canvas and draw all game objects and net
 */
function draw() 
{
	ctx.fillRect(0, 0, WIDTH, HEIGHT);
	ctx.save();
	ball.draw();
	player1.draw();
	player2.draw();
	//var t = player1.score + " - " + player2.score;
	//ctx.fillText(t, canvas.width/2 - ctx.measureText(t).width/2, 100);
	ctx.restore();
	/*document.getElementById("red").innerHTML = (player1.score < 10)?'0'+ player1.score : player1.score;
	document.getElementById("green").innerHTML = (player2.score < 10)?'0'+ player2.score : player2.score;*/
	
	/*if(player1.score == 15)
		alert("Player 1 wins 15 to "+ player2.score);
	if(player2.score == 15)
		alert("Player 2 wins 15 to "+player1.score);*/
}



function start()
{
	var

	WIDTH  = 700,
	HEIGHT = 500,
	canvas,
	ctx,
	res,

	player1 = 
	{
		x: null,
		y: null,
		width:  20,
		height: 80,
	
		draw: function() 
		{
			ctx.fillStyle = "#f00";
			ctx.fillRect(this.x, this.y, this.width, this.height);
		}
	},

	player2 = 
	{
		x: null,
		y: null,
		width:  20,
		height: 80,
	
		draw: function() 
		{
			ctx.fillStyle = "#0f0";
			ctx.fillRect(this.x, this.y, this.width, this.height);
		}
	},

	ball = 
	{
		x: 40,
		y: 240,
		vel: null,
		side:  20,
		speed: 10,
		/**
		* Draw the ball to the canvas
	 	*/
		draw: function() 
		{
			ctx.fillStyle = "#ff0";
			ctx.fillRect(this.x, this.y, this.side, this.side);
		}
	};
	/**
 	* Starts the game
 	*/
	function main2() 
	{
	// create, initiate and append game canvas
		canvas = document.createElement("canvas");
		window.cancelAnimationFrame(res);
		document.getElementById("red").innerHTML = '00';
		document.getElementById("green").innerHTML = '00';
		canvas.width = WIDTH;
		canvas.height = HEIGHT;
		ctx = canvas.getContext("2d");
		ctx.fillStyle = "#00f";
		document.body.appendChild(canvas);
		init(); // initiate game objects
		// game loop function
		var loop = function() 
		{
			ctx.clearRect(0,0,WIDTH,HEIGHT);
			draw();
			res = window.requestAnimationFrame(loop, canvas);
		};
		res = window.requestAnimationFrame(loop, canvas);
	}
	/**
 	* Initatite game objects and set start positions
 	*/
	function init() 
	{
		player1.x = player1.width;
		player1.y = (HEIGHT - player1.height)/2;
		player2.x = WIDTH - (player1.width + player2.width);
		player2.y = (HEIGHT - player2.height)/2;	
	}

	function draw() 
	{
		ctx.fillRect(0, 0, WIDTH, HEIGHT);
		ctx.save();
		ball.draw();
		player1.draw();
		player2.draw();
		ctx.restore();
	}
	main2();
}