
/**
* Method to generate random html color code so that we can draw our Fractal
*
* @param letters : Generate every possible characters, and split them into an array
* @param color : start with the required html #.
*
* @return : return a color code of 6 iteration letters[x] to color, which will give ( #01912F )
*
*/
function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}



/**
* Factal object that know how to draw itself. We will use a color table to show difference between iterations, which will create our fractal at the end :)
*
* @param x : Position of the fractal on the X axis.
* @param y : Position of the fractal on the Y axis.
* @param size : Screen size of the fractal, which will simulate the 'zoom'.
* @param iterations : Amount of iteration we do to reach the fractal. The morer the more precise and rendered it will be.
*
*/
function Fractal() {

	//This is the fractal position on the Plan, and its origin is not a 0,0 which is why we have to use -1.5,-1,5
	this.x = -1.5;
	this.y = -1.5;
  this.xjulia = 0;
  this.yjulia = 0;
	this.size = 4;
	this.iterations = 20;
	this.colors = new Array(1,256);
	this.currentColor = 0;
  this.typeFractal = 1;


	//Initialize our color Table
	this.colors[0,255] = 000000;
	this.colors[1,255] = 000000;

	for (var i =0; i<this.colors.length; i++) {
		this.colors[0,i] = getRandomColor();
	}

};
