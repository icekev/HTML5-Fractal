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
