/**
* Main method that will be used by the Web Worker (Thread). This object will be kept in memory with the Rendered Table, accessible at any time.
* This object allows us to render while updating our page. It prevents the browser to "Freeze" when doing high calculations.
*/

var pixels = new Array();
var totalCalculations = 0;

self.addEventListener('message', function(e) {
  var data = e.data;
  switch (data.cmd) {
    case 'calculate':
      		var width = data.width;
      		var height = data.height;
      		var fractalX = data.fractalX;
      		var delta = data.delta;
      		var fractalY = data.fractalY;
      		var iterations = data.iterations;
          var fractalXJulia = data.fractalXJulia;
          var fractalYJulia = data.fractalYJulia;


      		pixels = new Array();
          totalCalculations = 0;

          //Type 1 = Mandelbrot, Type 2 = Julia
          if(data.type == 1) {

        			for (var i = 0; i<width; i++) {

        				var row = new Array();


        				for (var j=0; j<height; j++) {

        					var n = 0;
        					var c = new Complex(fractalX + delta * i, fractalY + delta * j);
        					var z = new Complex(0,0);

        					do {
        						z = Complex.add(z.square(), c);
        						n++;
                    totalCalculations = totalCalculations +1;
        					}while (z.squareModule() < 4 && n < iterations);

        					row.push(n);
        				}
        				self.postMessage({'cmd': 'iterationCalculation', 'iteration': i});
        				pixels.push(row);
        			}
          }
          else {


            for (var i = 0; i<width; i++) {

              var row = new Array();


              for (var j=0; j<height; j++) {

                var n = 0;
                var c = new Complex( fractalX + delta * i , fractalY + delta * j);
                var z = new Complex( fractalXJulia, fractalYJulia);

                do {
                  c = Complex.add(c.square(), z);
                  n++;
                }while (z.squareModule() < 4 && n < iterations);

                row.push(n);
              }
              self.postMessage({'cmd': 'iterationCalculation', 'iteration': i});
              pixels.push(row);
            }
          }
    			self.postMessage({'cmd': 'calculationFinished', 'totalCalculs': totalCalculations});

      break;
    case 'mouseMove':
    	   self.postMessage({'cmd': 'mouseMove', 'nb': pixels[data.x][data.y]});

    	break;
    case 'draw':

      		var width = data.width;
      		var height = data.height;
    		  var row = new Array();

    			if (data.i==width)
    				self.postMessage({'cmd': 'drawFinished'});
    			else {
    				for (var j=0;  j<height; j++) {
    					row.push(pixels[data.i][j]);
    				}
    				self.postMessage({'cmd': 'iterationDraw', 'iteration': data.i});
    				self.postMessage({'cmd': 'draw', 'i': data.i, 'row': row});
    			}

    	break;
  };
}, false);



/**
* Complex object used for Calculating Complex Numbers. They require a few logic to be implemented in a programmation environment. A complex number has 2 section, the regular and imaginary, often noted as  x + iy
*
* @param a : Regular numbers
* @param b : Imaginary numbers
*
*/
function Complex(_a,_b) {

	this.a = Number(_a);
	this.b = Number(_b);


	this.square = function() {
		return Complex.multiply(this,this);
	};

	this.module = function() {
		return Math.sqrt( this.a*this.a + this.b*this.b);
	};

	// This function will be called instead of the normal Module. The end user must know the trick in order to
	// save alot of Square Root calculations.
	this.squareModule = function() {
		return (this.a*this.a) + (this.b*this.b);
	};

};

// Static Methods used to calculate complex numbers ( +, -, *, / )
Complex.add = function(z1,z2) {
	return new Complex(z1.a+z2.a , z1.b+z2.b);
}

Complex.substract = function(z1,z2) {
	return new Complex(z1.a-z2.a , z1.b-z2.b);
}

Complex.multiply = function(z1,z2) {
	return new Complex(   ((z1.a*z2.a) - (z1.b*z2.b)) , ((z1.a*z2.b) + (z1.b*z2.a))  );
}

Complex.divide = function(z1,z2) {

	var divider =  (z2.a*z2.a) + (z2.b*z2.b);
	return new Complex (
		(( (z1.a * z2.a) + (z1.b * z2.b) ) / divider),
		(( (z1.b * z2.a) + (z1.a * z2.b) ) / divider)
	);
}
