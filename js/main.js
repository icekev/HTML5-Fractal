/**
* This is our main Canvas where we will calculate our Fractal with Complex numbers and Draw it.
*/
function Canvas(_canvas) {
		
		
		var self=this;
		
		//External objects creation
		var subject = new Subject();
		var worker =  new Worker('js/calculateFractal.js');
		this.fractal = new Fractal();
		
		
		//Canvas related variables
		this.canvas = document.getElementById(_canvas);
		this.canvas.width = $("#" + _canvas).width();
		this.canvas.height = $("#" + _canvas).height();
		this.zoomFactor = 4;
		this.zoomDirection = 1;
		this.ctx = self.canvas.getContext("2d");


		//Statistics Variable
		this.statsIterationCount = new Array(self.fractal.iterations);
		this.pieData = new Array();
		this.totalIterationsDraw = 0;
		this.totalIterationCalcul = 0;
		this.timeBegin = new Date();




		/**
		* This method will add an Observer to simulate a Delegate
		*/
		//================================================================================================//
		this.addObserver = function addObserver( newObserver ) {
		//================================================================================================//
		
		    subject.observe( newObserver );
		    
		};
		//------------------------------------------------------------------------------------------------//
		
		


		/**
		* This is our main Calculate function that will pass through the Mandelbrot calculations for every pixels in the canvas.
		*/
		//================================================================================================//
		this.calculate = function() {
		//================================================================================================//
		
			var delta = this.fractal.size / (this.canvas.width-1);
			self.totalIterationCalcul = 0;

			self.timeBegin = new Date();
			//We need to give alot of data to the worker because he works seperatly in a private thread, and we can only communicate through JSON request with him.
			worker.postMessage({
				'cmd': 'calculate',
				'type': self.fractal.typeFractal,
				'width': this.canvas.width,
				'height':this.canvas.height,
				'fractalX': this.fractal.x,
				'fractalY': this.fractal.y,
				'fractalXJulia': self.fractal.xjulia,
				'fractalYJulia': self.fractal.xjulia,
				'iterations': this.fractal.iterations,
				'delta': delta
			});

		}
		//------------------------------------------------------------------------------------------------//




		/**
		* This is the event action of the Worker (Thread) that will be used to communicate between the thread and the main file.
		*/
		//================================================================================================//
		worker.addEventListener('message', function(e) {
		//================================================================================================//
			var data = e.data;
			switch (data.cmd) {


				case 'iterationCalculation':
						subject.notify( data.iteration, 0 );
					break;


				case 'iterationDraw':
						subject.notify( data.iteration, 1 );
					break;


				case 'calculationFinished':

					self.totalIterationCalcul = data.totalCalculs;
					$(".updateCalculation").slideUp(200,
				        function () {
					        prepareDrawingUpdateScreen(self);
							self.draw();
						});

					break;


				case 'draw':
						drawAt(data.i, data.row);
					break;


				case 'drawFinished':

						generateStats();
						$(".updateDrawing").slideUp(200);
						$(".update").fadeOut(300);

					break;


				case 'mouseMove':
						$('.Fractaltooltip').text("Iteration #: " + data.nb);
					break;

			}

		}, false);
		//------------------------------------------------------------------------------------------------//





		/**
		* This function will Generate the Pie chart with it's data, and will also display Calculation Stats
		*/
		//================================================================================================//
		function generateStats() {
		//================================================================================================//
			
			self.pieData = new Array();
			var topTenArray = [];
			
			for(var i = 1; i < self.statsIterationCount.length+1;  i++) {
			    topTenArray.push([i, self.statsIterationCount[i]]);
			    
			}
			
			
			// sort first by value (descending order), then by index (ascending order)
			topTenArray.sort(function(t1, t2) {
			    return t2[1] - t1[1] || t1[0] - t2[0];
			});
			
			topTenArray.length = 10;
			
			
			
			for(i=0; i<topTenArray.length;i++) {
				var data = {
					value: topTenArray[i][1],
					color: self.fractal.colors[self.fractal.currentColor, topTenArray[i][0]%255],
					highlight: self.fractal.colors[self.fractal.currentColor, topTenArray[i][0]%255],
					label: topTenArray[i][0]
				}
				self.pieData.push(data);
			}
			
			
			

			//If the PieChart already exist.. Destroy it so we don't append again data.
			if (typeof window.myPie !== 'undefined') {
				window.myPie.destroy();
				
				//Must re-input height to fix ChartJS hidden problem of negative arc.
				$("#chart-area").attr('height',$("#chart-area").width());
			}


			//Generate the Graphic with our Data
			var context = document.getElementById("chart-area").getContext("2d");
			window.myPie = new Chart(context).Pie(self.pieData);
			

			//Play around with the Time required by the Fractal to generate & Draw
			var thisTime = new Date();
			var timeDifference = thisTime - self.timeBegin;
			var seconds = Math.round( (timeDifference/1000) % 60); //Remove miliseconds from the Total time
			var minutes = Math.round( Math.floor(timeDifference/1000/60) % 60); // Remove Miliseconds + Seconds from the Total time


			//Chage the text of our Labels
			$(".totalDraw span").text(self.totalIterationsDraw.toLocaleString());
			$(".totalCalculs span").text(self.totalIterationCalcul.toLocaleString());
			$(".totalTime span").text( ((minutes == 0) ? "" :  minutes + "m ") + seconds + "s");

		}
		//------------------------------------------------------------------------------------------------//







		/**
		* The Draw function actually takes the Pixels color from our Pixels table and draw it. It doesn't Calculate it again !
		*/
		//================================================================================================//
		this.draw = function() {
		//================================================================================================//
			
			self.totalIterationsDraw = 0;
			self.statsIterationCount = new Array(self.fractal.iterations);
			for(i=1; i<self.fractal.iterations+1;i++) {
				self.statsIterationCount[i] = 0;
			}


			//Call our other intern function with position 0 for @param i
			worker.postMessage({
					'cmd': 'draw',
					'width': self.canvas.width,
					'height': self.canvas.height,
					'i': 0
			});

		}
		//------------------------------------------------------------------------------------------------//






		/**
		* This function will be called everytime the Worker sends back a message
		*
		* @param i : Coordinates in x of the canvas
		* @param nb : Number of iteration. Will be used to go look into the Colors table of the fractal.
		*
		*/
		//================================================================================================//
		function drawAt(i,row) {
		//================================================================================================//
			for (var j =0; j<self.canvas.width; j++) {
				self.ctx.fillStyle = self.fractal.colors[self.fractal.currentColor, row[j]%255];
				self.ctx.fillRect(i,j,1,1);
				self.statsIterationCount[row[j]] = self.statsIterationCount[row[j]]+1;
				self.totalIterationsDraw = self.totalIterationsDraw+1;
			}

			worker.postMessage({
			 'cmd': 'draw',
			 'width': self.canvas.width,
			 'height': self.canvas.height,
			 'i': i+1
			});

		}
		//------------------------------------------------------------------------------------------------//
		
		
		
		


		/**
		*
		* This function will be used to go Zoom on the Fractal. This will be called when there is a mouseClick on the canvas
		*
		* @param _x : The coordinate x of the click posistion
		* @param _y : the coordinate y of the click position
		*
		*/
		//================================================================================================//
		this.zoom = function (_x, _y) {
		//================================================================================================//
			var delta = this.fractal.size / (this.canvas.width-1);


			if (this.zoomDirection == 1) {
				this.fractal.size /= this.zoomFactor;
			}
			else {
				this.fractal.size *= this.zoomFactor;
			}

			this.fractal.x += delta * _x - (this.fractal.size/2);
			this.fractal.y += delta * _y - (this.fractal.size/2);
		}
		//------------------------------------------------------------------------------------------------//
		
		
		



		/**
		* MouseMove event on our Canvas. This is how we will have our Toggle over the mouse indicating the amount of iterations
		*/
		//================================================================================================//
		$("#" + _canvas).mousemove(function(e){
		//================================================================================================//
		
			var offset = $(this).offset();

			worker.postMessage({'cmd': 'mouseMove', 'x': parseInt(e.clientX-offset.left), 'y': parseInt(e.pageY-offset.top) });
			$('.Fractaltooltip').css({ left: parseInt(e.clientX), top: parseInt(e.pageY)-60 });
			
		});
		//------------------------------------------------------------------------------------------------//
		
		
		
		


		/**
		* MouseClick event on our Canvas. This will call a zoom effect and redraw the canvas with the appropriate options chosen
		*/
		//================================================================================================//
		$("#" + _canvas).click(function(e) {
		//================================================================================================//
		
			var delta = self.fractal.size / (self.canvas.width-1);
			var offset = $(this).offset();

			//Check the new direction of the Zoom (In/Out)
			self.zoomDirection = $("input:radio[name ='options-zoom']:checked").val();
			//Zoom the fractal
			self.zoom(parseInt(e.clientX-offset.left), parseInt(e.pageY-offset.top));

			if (self.fractal.typeFractal == 1 && $("input:radio[name ='options-set']:checked").val() == 2) {
					//This is our first time getting a Julia set, we must reset the zoom to normal and Draw a julia set for the proposed coordinates
				  self.fractal.typeFractal = $("input:radio[name ='options-set']:checked").val();
					self.fractal.x = -1.5;
					self.fractal.y = -1.5;
					self.fractal.size = 2;
					self.fractal.xjulia = parseInt(e.clientX-offset.left)*delta+self.fractal.x;
					self.fractal.yjulia = parseInt(e.pageY-offset.top)*delta+self.fractal.y;
			}

			prepareCalculationUpdateScreen(self);
			
		});
		//------------------------------------------------------------------------------------------------//
		
		
		
		
		


		/**
		* MouseHover event on our Canvas. This will let us know when the user is in or out of the canvas item. Thats when we know if we have to show the iteration counter.
		*/
		//================================================================================================//
		$("#" + _canvas).hover(function() {
		//================================================================================================//
		
			//Hover in
	        $('<p class="Fractaltooltip"></p>').appendTo('body').fadeIn('slow');
		}, function() {
			
			//Hover out
	        $('.Fractaltooltip').remove();
	        
		});
		//------------------------------------------------------------------------------------------------//
		

};




/**
* This function will prepare the Calculation progress bar Screen
*
* @param _canvas : Canvas parameter to call the Canvas Methods
*/
//================================================================================================//
function prepareCalculationUpdateScreen(_canvas) {
//================================================================================================//

	//Check our Inputs for what we've got in our option pane 'Maybe' Changed by the user

	if (parseInt($("#nbIteration").val()) > 200 || parseInt($("#nbIteration").val()) < 20 ) {
		$("#nbIteration").val(40)
		_canvas.fractal.iterations = 40;
	}
	else
		_canvas.fractal.iterations = parseInt($("#nbIteration").val());

	if (parseInt($("#nbZoomFactor").val()) > 10 || parseInt($("#nbZoomFactor").val()) < 2) {
		$("#nbZoomFactor").val(4);
		_canvas.zoomfactor = 4;
	}
	else
		_canvas.zoomfactor = parseInt($("#nbZoomFactor").val());
		
	
	
	//Set the Canvas width and Heigh to be square, and change it to fit the smallest side ( w / h )
	
	if ( $("body").width() >  $("body").height() ) {
		$("#mandelbrot").attr('height',$("body").height()-$(".navbar").height()-40);
		$("#mandelbrot").attr('width',$("body").height()-$(".navbar").height()-40);
	}
	else {
		$("#mandelbrot").attr('height',$("body").width()-$(".navbar").height()-40);
		$("#mandelbrot").attr('width',$("body").width()-$(".navbar").height()-40);
	}
	
	
	var heightScreen = $("body").height();
	var heightBox = $(".updateCalculation").height();
	
	$(".update").show();
	$(".updateDrawing").hide(0);
	$(".updateCalculation").show(0);
	$(".updateCalculation").animate({marginTop: (heightScreen/2 - heightBox/2)},{
        complete: function () {
	        _canvas.calculate();

        }

	});
}
//------------------------------------------------------------------------------------------------//





/**
* This function will prepare the Drawing progress bar Screen
*
* @param _canvas : Canvas parameter to call the Canvas Methods
*/
//================================================================================================//
function prepareDrawingUpdateScreen(_canvas) {
//================================================================================================//

	var heightScreen = $("#mandelbrot").height();
	var heightBox = $(".updateDrawing").height();
	$(".updateDrawing").show(0);
	$(".updateDrawing").animate({marginTop: (heightScreen/2 - heightBox/2)},{
        complete: function () {

        }
	});

}
//------------------------------------------------------------------------------------------------//





/**
* Function that will Update the progress bar when calculating the Fractal
*
* @param _val : Value received in a decimal format
*
*/
//================================================================================================//
function updateProgressbarCacl(_val) {
//================================================================================================//

	var value = parseInt((_val*100)+1);
	$('.updateCalculation .progress-bar').css('width', value + '%');
	
}
//------------------------------------------------------------------------------------------------//





/**
* Function that will Update the progress bar when drawing the Fractal
*
* @param _val : Value received in a decimal format
*
*/
function updateProgressbarDraw(_val) {
	
	var value = parseInt((_val*100)+1);
	$('.updateDrawing .progress-bar').css('width', value + '%');
	
}
//------------------------------------------------------------------------------------------------//






// ------------------------========================================================================------------------------ //
// ------------------------========================== MAIN FUNCTIONS ==============================------------------------ //
// ------------------------========================================================================------------------------ //



$( document ).ready(function() {

	/**
	* Observer object that will be called by the object whgen the function is called on the classs
	*/
	var rowCalculationCompleted = {
		update : function() {
			if(arguments[1] == 0) {
				var division = arguments[0]/parseInt($("#mandelbrot").width());
				updateProgressbarCacl(division);
			}
			else {
				var division = arguments[0]/parseInt($("#mandelbrot").width());
				updateProgressbarDraw(division);
			}

		}
	};


	//Create our Canvas object here
	var canvas = new Canvas("mandelbrot");

	//Add an Observer 'Delegate' that we can fire when prompted
	canvas.addObserver( rowCalculationCompleted );

	//Calculate the window when document is loaded
	prepareCalculationUpdateScreen(canvas);


    //Restrict our Input Options to numeric characters only
    $("#nbZoomFactor").numeric();
    $("#nbIteration").numeric();


	/**
	* resetPanels will remove all instance of red-buttons on the options bar, and will also close any current opened panels
	*/
	//================================================================================================//
    function resetPanels() {
	//================================================================================================//
	
	    $('#btnOptions').removeClass("btn-danger");
	    $('#btnGraphics').removeClass("btn-danger");
	    $(".options").css({marginTop: -1000});
	    $(".graphics").css({marginTop: -1000});
	    
    }
	//------------------------------------------------------------------------------------------------//
	
	
	
	
	
	

	/**
	* Click event on the Option button. Will Either open a window or close the current one.
	*/
	//================================================================================================//
    $('#btnOptions').on('click',function(){
	//================================================================================================//
	   
	    if ( $("#btnOptions").hasClass("btn-danger")) {
				$(".options").animate({marginTop: -1000});
				$("#btnOptions").removeClass("btn-danger");
			}
			else {
				$(".options").css({marginTop: -1000});
				resetPanels();
				$('#btnOptions').addClass("btn-danger");
				$(".options").show(0);
				$(".options").animate({marginTop: 50});
			}
			
    });
    //------------------------------------------------------------------------------------------------//
    
    
    
    
    


	/**
	* Click event on the Graphics button. Will Either open a window or close the current one.
	*/
	//================================================================================================//
    $('#btnGraphics').on('click',function(){
	//================================================================================================//
			
			if ( $("#btnGraphics").hasClass("btn-danger")) {
				$(".graphics").animate({marginTop: -1000});
				$("#btnGraphics").removeClass("btn-danger");
			}
			else {
				$(".graphics").css({marginTop: -1000});
				resetPanels();
				$('#btnGraphics').addClass("btn-danger");
				$(".graphics").show(0);
				$(".graphics").animate({marginTop: 50});
			}
			
    });
	//------------------------------------------------------------------------------------------------//







	//================================================================================================//
	$("#btnResetYes").on('click', function() {
	//================================================================================================//	
		prepareCalculationUpdateScreen(canvas);
	
	});
	//------------------------------------------------------------------------------------------------//


});
