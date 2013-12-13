
var stories= [
	"Obama: New bill will prevent 'breakdown in our financial system'",
	"Obama again protests 'Republican obstruction' on jobless benefits",
	"Phoenix cop probed over online video opposing Arizona's immigration law"
];

var $card =$('.card'),
	$wheel = $('.wheel'),
	$stake = $('.stake'),
	$score = $('.score'),
	checkForLetter = function(letter){
		var $matches = $card.filter('.'+letter)
		$matches.toggleClass('flipped');
		$score.html(parseInt($score.html()) + (curVal*$matches.length));
	};

$('.letters, .vowels').on('click', '.letter', function (e) {
	e.currentTarget.disabled = true;
	checkForLetter(e.currentTarget.innerHTML);
});

var curVal,
	wheel = {
		timerHandle : 0,
		timerDelay : 3,
		angleCurrent : 0,
		angleDelta : 0,
		size : 150,
		canvasContext : null,
		colors : ['#AA0000', '#235780', '#13732E', '#2674AF', '#566471'],
		segments : [],
		seg_colors : ['#AA0000', '#235780', '#13732E', '#2674AF', '#566471'],
		maxSpeed : Math.PI / 16,
		upTime : 1000,
		downTime : 17000,
		spinStart : 0,
		frames : 0,
		centerX : 155,
		centerY : 158,
		spin : function() {
			$wheel.show();
			if (wheel.timerHandle === 0) {
				wheel.spinStart = new Date().getTime();
				wheel.maxSpeed = Math.PI / (16 + Math.random()); // Randomly vary how hard the spin is
				wheel.frames = 0;
				wheel.sound.play();
				wheel.timerHandle = setInterval(wheel.onTimerTick, wheel.timerDelay);
			}
		},

		onTimerTick : function() {
			wheel.frames++;
			wheel.draw();

			var duration = (new Date().getTime() - wheel.spinStart),
				progress = 0,
				finished = false;

			if (duration < wheel.upTime) {
				progress = duration / wheel.upTime;
				wheel.angleDelta = wheel.maxSpeed * Math.sin(progress * Math.PI / 2);
			} else {
				progress = duration / wheel.downTime;
				wheel.angleDelta = wheel.maxSpeed	* Math.sin(progress * Math.PI / 2 + Math.PI / 2);
				finished = progress >= 1;
			}

			wheel.angleCurrent += wheel.angleDelta;
			while (wheel.angleCurrent >= Math.PI * 2)
				// Keep the angle in a reasonable range
				wheel.angleCurrent -= Math.PI * 2;

			if (finished) {
				clearInterval(wheel.timerHandle);
				wheel.timerHandle = 0;
				wheel.angleDelta = 0;
				$wheel.hide();
				curVal = curVal.replace('$','');
				$stake.html(curVal);
			}
		},

		init : function(optionList) {
			try {
				wheel.initWheel();
				wheel.initAudio();
				wheel.initCanvas();
				wheel.draw();
				$.extend(wheel, optionList);
			} catch (exceptionData) {
				alert('Wheel is not loaded ' + exceptionData);
			}
		},

		initAudio : function() {
			wheel.sound = document.getElementById('audio-spin');
		},

		initCanvas : function() {
			var canvas = $('.wheel #canvas').get(0);
			//canvas.addEventListener("click", wheel.spin, false);
			wheel.canvasContext = canvas.getContext("2d");
			//wheel.spin();
		},

		initWheel : function() {
		},

		// Called when segments have changed
		update : function() {
			// Ensure we start mid way on a item
			//var r = Math.floor(Math.random() * wheel.segments.length);
			var r = 0;
			wheel.angleCurrent = ((r + 0.5) / wheel.segments.length) * Math.PI * 2;
			wheel.seg_color = [
				'#000',
				'#8915fe',
				'#ff1',
				'#0f8',
				'#fff',
				'#ff0',
				'#08f',
				'#f8c',
				'#0f8',
				'#8915fe',
				'#000',
				'#CCC',
				'#f80',
				'#f8c',
				'#ff0',
				'#f8c',
				'#ff1',
				'#8915fe',
				'#f80',
				'#f8c',
				'#0f8',
				'#ff1',
				'#f8c',
				'#ff0',
			];
			wheel.draw();
		},

		draw : function() {
			wheel.clear();
			wheel.drawWheel();
			wheel.drawNeedle();
		},

		clear : function() {
			var ctx = wheel.canvasContext;
			ctx.clearRect(0, 0, 500, 400);
		},

		drawNeedle : function() {
			var ctx =     wheel.canvasContext,
				centerX = wheel.centerX,
				centerY = wheel.centerY,
				size =    wheel.size;

			ctx.lineWidth = 1;
			ctx.strokeStyle = '#000000';
			ctx.fileStyle = '#ffffff';
			ctx.beginPath();
			ctx.moveTo(centerX + size - 40, centerY);
			ctx.lineTo(centerX + size + 20, centerY - 10);
			ctx.lineTo(centerX + size + 20, centerY + 10);
			ctx.closePath();
			ctx.stroke();
			ctx.fill();

			var i = wheel.segments.length - Math.floor((wheel.angleCurrent / (Math.PI * 2))	* wheel.segments.length) - 1;
			curVal = wheel.segments[i];

		},

		drawSegment : function(key, lastAngle, angle) {
			var ctx    = wheel.canvasContext,
				centerX  = wheel.centerX,
				centerY  = wheel.centerY,
				size     = wheel.size,
				segments = wheel.segments,
				colors   = wheel.seg_color,
				value    = segments[key].split('').reverse().join('');

			ctx.save();
			ctx.beginPath();

			// Start in the centre
			ctx.moveTo(centerX, centerY);
			ctx.arc(centerX, centerY, size, lastAngle, angle, false); // Draw a arc around the edge
			ctx.lineTo(centerX, centerY); // Now draw a line back to the centre
			ctx.closePath();
			ctx.fillStyle = colors[key];
			ctx.fill();
			ctx.stroke();
			// The save ensures this works on Android devices
			ctx.save();
			ctx.translate(centerX, centerY);
			ctx.rotate((lastAngle + angle) / 2);
			ctx.fillStyle = '#000';
			switch(value) {
				case 'TPURKNAB':
				case 'BANKRUPT':
					ctx.fillStyle = '#FFF';
					ctx.fillText(value.substr(0, 20), size / 1.5 , 0);
					break;
				case 'NRUT ESOL':
				case 'LOSE TURN':
					ctx.fillText(value.substr(0, 20), size / 1.5 , 0);
					break;
				default:
					ctx.fillText(value.substr(0, 20), size / 1.5 + 25, 0);
			}
			ctx.restore();
			ctx.restore();
		},

		drawWheel : function() {
			var ctx =           wheel.canvasContext,
				angleCurrent =  wheel.angleCurrent,
				lastAngle    =  angleCurrent,
				len       =     wheel.segments.length,
				centerX =       wheel.centerX,
				centerY =       wheel.centerY,
				size    =       wheel.size,
				PI2 =           Math.PI * 2;

			ctx.lineWidth    = 1;
			ctx.strokeStyle  = '#000';
			ctx.textBaseline = "middle";
			ctx.textAlign    = "center";
			ctx.font         = "1em Arial";

			for (var i = 1; i <= len; i++) {
				var angle = PI2 * (i / len) + angleCurrent;
				wheel.drawSegment(i - 1, lastAngle, angle);
				lastAngle = angle;
			}
			// Draw a center circle
			ctx.beginPath();
			ctx.arc(centerX, centerY, 20, 0, PI2, false);
			ctx.closePath();
			ctx.fillStyle   = '#FFF';
			ctx.strokeStyle = '#000';
			ctx.fill();
			ctx.stroke();
			ctx.beginPath();
			ctx.arc(centerX, centerY, size, 0, PI2, false);
			ctx.closePath();
			ctx.lineWidth   = 2;
			ctx.strokeStyle = '#000';
			ctx.stroke();
		}
	};
wheel.init();
wheel.segments = [
	//"B\nA\nN\nK\nR\nU\nP\nT",
	"BANKRUPT",
	"$600",
	"$500",
	"$300",
	//"LOSE\nA\n\nT\nU\nR\nN",
	"LOSE TURN",
	"$800",
	"$350",
	"$450",
	"$700",
	"$300",
	//"B\nA\nN\nK\nR\nU\nP\nT",
	"BANKRUPT",
	"$5000",
	"$600",
	"$500",
	"$300",
	"$750",
	"$800",
	"$550",
	"$400",
	"$300",
	"$900",
	"$500",
	"$300",
	"$900"
];
wheel.update();

// Hide the address bar (for mobile devices)!
setTimeout(function() {
	window.scrollTo(0, 1);
}, 0);


$('.spin').on('click', wheel.spin);


Element.prototype.hasClassName = function (a) {
	return new RegExp("(?:^|\\s+)" + a + "(?:\\s+|$)").test(this.className);
};

Element.prototype.addClassName = function (a) {
	if (!this.hasClassName(a)) {
		this.className = [this.className, a].join(" ");
	}
};

Element.prototype.removeClassName = function (b) {
	if (this.hasClassName(b)) {
		var a = this.className;
		this.className = a.replace(new RegExp("(?:^|\\s+)" + b + "(?:\\s+|$)", "g"), " ");
	}
};

Element.prototype.toggleClassName = function (a) {
	this[this.hasClassName(a) ? "removeClassName" : "addClassName"](a);
};