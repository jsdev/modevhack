var headlineURL = 'http://api.usatoday.com/open/articles/mobile/topnews?api_key=w3vb9xvbuvue8g8e3tbpp6un&encoding=json',
	headlines= ["Sheriff: Colo. school shooting suspect is dead", "Wichita tech arrested in plot to bomb airport", "Senate Republican opposition rising to budget deal"];

var LETTER = { //cache all letters:
	A: document.getElementById('A'), B: document.getElementById('B'), C: document.getElementById('C'),
	D: document.getElementById('D'), E: document.getElementById('E'), F: document.getElementById('F'),
	G: document.getElementById('G'), H: document.getElementById('H'), I: document.getElementById('I'),
	J: document.getElementById('J'), K: document.getElementById('K'), L: document.getElementById('L'),
	M: document.getElementById('M'), N: document.getElementById('N'), O: document.getElementById('O'),
	P: document.getElementById('P'), Q: document.getElementById('Q'),	R: document.getElementById('R'),
	S: document.getElementById('S'), T: document.getElementById('T'),	U: document.getElementById('U'),
	V: document.getElementById('V'), W: document.getElementById('W'), X: document.getElementById('X'),
	Y: document.getElementById('Y'), Z: document.getElementById('Z')
};

// get headline api
$.ajax({
	url: headlineURL,
	// the name of the callback parameter, as specified by the YQL service
	crossDomain:true,
	// tell jQuery we're expecting JSONP
	dataType: "json",
	// work with the response
	success: function( response ) {
		var newStories = [],
			storiesInResponse = response.stories;
		$.each(storiesInResponse, function(key,val){
			if(newStories.length < 3){
				newStories.push(val.title);
			} else {
				return false;
			}
		});
		if(newStories.length){
			headlines = newStories;
			nextHeadline();
		}
	},
	error: function( e ) {
		console.log( e );
	}
});

var showAllLetters = function () {
	$card.filter('.flipped').removeClass('flipped');
};

var checkForCommands = function () {
	var said = $mic.val(),
		last = said.slice(-1),
		letter = 1 + said.indexOf("letter"),
		isVowel = 1 + ['A','E','I','O','U'].indexOf(last),
		isUpper = last === last.toUpperCase() ;

	if (solve.disabled) {
		console.log(said.toUpperCase());
		if (1 + said.toUpperCase().replace(/\s/g,"").indexOf($board.text())) {
			showAllLetters();
			total.innerHTML = [parseInt(score.innerHTML) + parseInt(total.innerHTML)].toString();
		}
	}

	if (1 + said.indexOf('solve')) {
		solve.click();
	}

	if (1 + said.indexOf('spin') || 1 + said.indexOf('wheel')) {
		spin.click();
		return;
	}

	if (1 + said.indexOf('buy') || 1 + said.indexOf('vowel') || 1 + said.indexOf('vail')) {
		(isVowel ? LETTER[last] : vowel).click();
		return;
	}

	if (letter) {
		(isUpper ? LETTER[last] : consonant).click();
	}
};

if( document.createElement('input').webkitSpeech !== undefined ) {
	$('.user-settings b').eq(1).append('<input type="text" class="mic" tabindex="-1" x-webkit-speech />')
		.find('input')[0].onwebkitspeechchange = checkForCommands;
}

var $game = $('.game'),
	$board = $('.board'),
	newHeadline = document.getElementById('new-headline'),
	$mic = $('.mic'),
	solve =  document.getElementById('solve'),
	consonant = document.getElementById('consonant'),
	$consonants = $('.consonants .letter'),
	$sendgridForm = $('#lifelineForm'),
	vowel =  document.getElementById('vowel'),
	$vowels = $('.vowels .letter'),
	spin = document.getElementById('spin'),
	$letters = $('.letter'),
	$card, wheelValue,
	$wheel = $('.wheel'),
	$stake = $('.stake'),
	score = document.getElementById('score'),
	total = document.getElementById('total'),
	capitalLetter =/^[A-Z]*$/,
	nextHeadline = function () {
		var $frag = $('<div/>'),
			className,
			headline = headlines.pop(),
			chars = headline.toUpperCase().split('');
		for (var i = 0, len = chars.length, char = chars[i]; i < len; i++, char = chars[i] ) {
			className = char.match(capitalLetter) ? 'card ' + char + ' flipped' : 'card';
			switch (char) {
				case " ":
					$frag.append('<section class="container" />');
					break;
				default:
					$frag.append('<section class="container"><article class="'+className+'"><span class="front">'+char+'</span><span class="back"></span></article></section>');
			}
		}
		$board.empty().append($frag.html());
		$card = $('.card');
		consonant.disabled = true;
		$vowels.parent().hide();
		$consonants.parent().hide();
	};

nextHeadline();

var showAndTurn = function ($matches) {
		var len = $matches.length,
			i = 0,
			show = function () {
				$matches.eq(i).addClass('highlight');
			},
			turn = function () {
				$matches.eq(i++).removeClass('flipped');
				if (i < len) {
					setTimeout(show, 200);
					setTimeout(turn, 1000);
				}
			};
		show();
		turn();
	},
	checkForLetter = function(letter) {
		var temp, currentScore = score.innerHTML,
			$matches = $card.filter('.'+letter),
			len = $matches.length;

		spin.disabled = false;
		if (len) {
			showAndTurn($matches);
			temp = parseInt(wheelValue.replace('$','')) * len;
			temp = currentScore ? temp + parseInt(currentScore) : temp;
			score.innerHTML = temp.toString();
			return true;
		}
		return false;

	},
	checkForVowel = function(letter){
		showAndTurn($card.filter('.'+letter));
		score.innerHTML = [parseInt(score.innerHTML)-250].toString();
		spin.disabled = false;
	};

$letters.on('click', function (e) {
	e.currentTarget.disabled = true;
	spin.disabled = false;
});

vowel.addEventListener('click', function () {
	$vowels.parent().show();
});

$vowels.on('click', function (e) {
	checkForVowel(e.currentTarget.innerHTML);
	$vowels.parent().hide();
	vowel.disabled = $vowels.length === $vowels.filter(':disabled').length;
});

consonant.addEventListener('click', function () {
	$consonants.parent().show();
});

$consonants.on('click', function (e) {
	checkForLetter(e.currentTarget.innerHTML);
	vowel.disabled = $vowels.length === $vowels.filter(':disabled').length;
	$consonants.parent().hide();
	spin.disabled = $consonants.length === $consonants.filter(':disabled').length;
	if (spin.disabled) {
		alert('Only vowels remain.');
	}
	consonant.disabled = true; //require spin
})

var wheel = {
		timerHandle : 0,
		timerDelay : 3,
		angleCurrent : 0,
		angleDelta : 0,
		size : 150,
		canvasContext : null,
		segments : [],
		maxSpeed : Math.PI / 16,
		upTime : 1000,
		downTime : 17000,
		spinStart : 0,
		frames : 0,
		centerX : 155,
		centerY : 158,
		spin : function() {
			vowel.disabled = true;
			solve.disabled = true;
			spin.disabled = true;
			$board.hide();
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
			while (wheel.angleCurrent >= Math.PI * 2)// Keep the angle in a reasonable range
				wheel.angleCurrent -= Math.PI * 2;

			if (finished) {
				clearInterval(wheel.timerHandle);
				wheel.timerHandle = 0;
				wheel.angleDelta = 0;
				$wheel.hide();
				$board.show();
				solve.disabled = false;
				$stake.html(wheelValue);
				switch(wheelValue) {
					case 'LOSE TURN':
						alert('IF YOU HAD FRIENDS IT WOULD BE THEIR TURN.');
						spin.disabled = false;
						return;
					case 'BANKRUPT':
						score.innerHTML = '0';
						spin.disabled = false;
						return;
					default:
						consonant.disabled = false;
				}
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
			wheel.canvasContext = $('.wheel #canvas').get(0).getContext("2d");
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
				'#81f',
				'#ff1',
				'#0f8',
				'#fff',
				'#ff0',
				'#08f',
				'#f8c',
				'#0f8',
				'#81f',
				'#000',
				'#CCC',
				'#f80',
				'#f8c',
				'#ff0',
				'#f8c',
				'#ff1',
				'#81f',
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
			var ctx =   wheel.canvasContext,
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
			wheelValue = wheel.segments[i];
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
			ctx.font         = "14px Arial";

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


spin.addEventListener('click', wheel.spin);
newHeadline.addEventListener('click', nextHeadline);
solve.addEventListener('click', function () {
	solve.disabled = true;
	alert('Good luck.');
});

$('.sendgrid').on('click', function () {
	$sendgridForm.css('display', 'inline-block');
	$game.css('display', 'none');
});

$sendgridForm.find('button').on('click', function () {
	$sendgridForm.css('display', '');
	$game.css('display', '');
});

var $body = $('body'),
	$window = $(window);
if ($window.height() < $window.width()) {
	$body.css('font-size', Math.floor($window.height()/24) +'px');
} else {
	$body.css('font-size', Math.floor($window.width()/26) +'px');
}


/* form handling */
var lifeline = {
    myObjs : function(){
        this.$el = $('#lifelineForm');
        this.$submit = this.$el.find('#submitLifeLine');
        this.$board = $('.board');
        this.div = $('#askForALifeLine');
    },

    init : function(){
        this.myObjs();
        this.assignHandlers();
    },

    assignHandlers : function(){
        var self = this;
        this.$el.submit(function(evt){
            evt.preventDefault();
            self.buildRequest(evt);
        });
    },

    buildRequest: function(){
       var inputs = this.$el.serializeArray();
       var html = this.buildTable();
       inputs.push({'name' : 'html', 'value' : html});
       console.log(inputs);

       $.post( "sendmail.php", inputs );
       this.div.append('Your LifeLine has been sent out.');
    },

    buildTable: function(){
        var $sections = this.$board.find('section.container'),
            self = this,
            html = '<table width=\"100%\"><tr>';

        $sections.each(function(){
            var $me = $(this),
                isFlipped = $me.find('.card').hasClass('flipped'),
                letter = $me.find('figure').filter(function () {
                    return (this.textContent || this.innerText);
                }).text(),
                isBlank = ($me.find('.card').length === 0),
                myStyle = (isBlank) ? 'style = \"background-color: rgb(0, 136, 0);\"' : 'style = \"background-color: rgb(0, 0, 170);\"' ;
                if(!isBlank && !isFlipped) {
                    myStyle = 'style=\"background-color: #ffffff;\"';
                }
                myStyle += ' width:10%; height:20px;';
            var myText = (letter && !isFlipped) ? letter : '&nbsp;',
                myHTML = '<td ' + myStyle + '>' + myText + '</td>';
            html += myHTML;
        });
        html += '</tr></table>';
        return html;
    }
};

lifeline.init();


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