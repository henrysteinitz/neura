/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	const Perceptron = __webpack_require__(1);


	document.addEventListener("DOMContentLoaded", function(){
	  const stage = init();
	  stage.autoClear = false;
	  const ann = new Perceptron([2,4,4,1], stage);
	  ann.training = false;
	  ann.visualizing = false;
	  createjs.Ticker.addEventListener("tick", function(){
	    if (ann.training) {
	      let batch = generateBatch(3);
	      ann.train(batch);
	    }
	    if (ann.visualizing) {

	    }
	    stage.clear();
	    stage.update();

	  });

	  document.getElementsByClassName('train')[0].addEventListener("click", function(e){
	    if (ann.training) {
	      e.target.className = "train"
	      e.target.innerHTML = "Train";
	      ann.training = false;
	    } else {
	      e.target.className = "stop";
	      e.target.innerHTML = "Stop";
	      ann.training = true;
	      if (parseFloat(document.getElementById("rate").value)) {
	        ann.learningRate = parseFloat(document.getElementById("rate").value);
	      } else {
	        ann.learningRate = 1.0;
	        document.getElementById("rate").value = "1.0";
	      }
	    }
	  })

	  document.getElementsByClassName('run')[0].addEventListener("click", function(e){
	    const x = parseFloat(document.getElementById("x").value);
	    const y = parseFloat(document.getElementById("y").value);
	    ann.visualCompute([x, y]);
	  });

	});



	function generateBatch(size){
	    const batch = [];
	    for (let i = 0; i < size; i++){
	      const x = Math.random();
	      const y = Math.random();
	      let z;
	      if (eval(document.getElementById("data-eval").value)){
	        z = 1;
	      } else {
	        z = 0;
	      }
	      batch.push([x, y, z]);
	    }
	    return batch;
	}

	function init(){
	  const canvas = document.getElementById("architecture-canvas");
	  const stage = new createjs.Stage("architecture-canvas");

	  if (window.devicePixelRatio) {
	    const height = canvas.getAttribute('height');
	    const width = canvas.getAttribute('width');
	    canvas.setAttribute('width', Math.round(width * window.devicePixelRatio));
	    canvas.setAttribute('height', Math.round(height * window.devicePixelRatio));
	    canvas.style.width = width+"px";
	    canvas.style.height = height+"px";
	    stage.scaleX = stage.scaleY = window.devicePixelRatio;
	  }

	  return stage;
	}


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	const Functions = __webpack_require__(2);


	class Perceptron {
	  // takes in an array of layer-sizes. The length of the array tells us how
	  // deep the network is.
	  constructor(layers, stage){

	    // model attributes
	    this.layers = layers;
	    this.learningRate = 1.0;
	    this.activations = [];
	    this.initializeWeights();
	    this.training = false;

	    // view attributes
	    this.radius = 40;
	    this.ioLength = 80;
	    this.stage = stage;
	    this.neuronCenters = [];
	    this.synapses = [];
	    this.lines = [];
	    this.initializeViews();
	    this.renderNeurons();
	    this.renderConnections();
	    this.updateConnections = this.updateConnections.bind(this);

	    this.k = 0;


	  }

	  initializeWeights(){
	    this.weightMatrices = [];
	    for (let i = 0; i < this.layers.length - 1; i++){
	      const weights = (new Matrix(this.layers[i] + 1, this.layers[i + 1]))
	      weights.randomize(.005);
	      this.weightMatrices.push(weights);
	    }
	  }

	  initializeViews(){

	    // calculate neuron centers
	    const xCenter = this.stage.canvas.width / (2 * window.devicePixelRatio);
	    const yCenter = this.stage.canvas.height / (2 * window.devicePixelRatio);
	    const xMid = (this.layers.length - 1) / 2;
	    const neuronCenters = this.neuronCenters;
	    this.layers.forEach( function(layer, k){
	      const yMid = (layer - 1) / 2;
	      neuronCenters.push([]);
	      for (let i = 0; i < layer; i++){
	        const x = (k - xMid)*170 + xCenter;
	        const y = (i - yMid)*120 + yCenter;
	        neuronCenters[k].push([x, y]);
	      }
	    });
	    // calculate connection endpoints
	    for (let i = 0; i < this.layers.length - 1; i++){
	      this.synapses.push([])
	      for (let j = 0; j < this.layers[i]; j++){
	        this.synapses[i].push([]);
	        for (let k = 0; k < this.layers[i + 1]; k++){
	          // hs geometry...
	          const start = neuronCenters[i][j].slice(0);
	          const end = neuronCenters[i + 1][k].slice(0);
	          const yDist = end[1] - start[1];
	          const xDist = end[0] - start[0];
	          const slope = yDist / xDist;
	          const cosTheta = xDist / Math.sqrt(xDist*xDist + yDist*yDist);
	          const realStart = [start[0] + this.radius*cosTheta, start[1] + this.radius*cosTheta*slope];
	          const realEnd = [end[0] - this.radius*cosTheta, end[1] - this.radius*cosTheta*slope];

	          this.synapses[i][j].push([realStart, realEnd]);
	        }
	      }
	    }

	    this.xDisplay = new createjs.Text("", "18px Helvetica neue", "#000000");
	    this.xDisplay.x = this.neuronCenters[0][0][0] - 90;
	    this.xDisplay.y = this.neuronCenters[0][0][1] - 6;
	    this.xDisplay.textBaseline = "alphabetic";

	    this.yDisplay = new createjs.Text("", "18px Helvetica neue", "#000000");
	    this.yDisplay.x = this.neuronCenters[0][1][0] - 90;
	    this.yDisplay.y = this.neuronCenters[0][1][1] - 6;
	    this.yDisplay.textBaseline = "alphabetic";

	    this.outDisplay = new createjs.Text("", "18px Helvetica neue", "#000000");
	    this.outDisplay.x = this.neuronCenters[this.neuronCenters.length - 1][0][0] + 50;
	    this.outDisplay.y = this.neuronCenters[this.neuronCenters.length - 1][0][1] - 6;
	    //debugger
	    this.outDisplay.textBaseline = "alphabetic";

	    this.stage.addChild(this.xDisplay);
	    this.stage.addChild(this.yDisplay);
	    this.stage.addChild(this.outDisplay);
	    this.stage.update();

	  }

	  compute(input){
	    this.activations = [];
	    let field = input;
	    this.activations.push(field.slice(0));
	    for (let i = 0; i < this.weightMatrices.length; i++){
	      const weights = this.weightMatrices[i]
	      field.push(1);
	      field = weights.multiply(new Vector(field)).columns()[0];
	      field = Functions.sigmoid(field);
	      this.activations.push(field.slice(0));
	    }
	    return field;
	  }

	  //
	  visualCompute(input){
	    this.xDisplay.text = input[0].toString().slice(0,6);
	    this.yDisplay.text = input[1].toString().slice(0,6);
	    this.outDisplay.text = (Math.round(this.compute(input)[0]*100000)/100000).toString();
	    this.stage.update();
	    this.activationMatrices = [];
	      for (let i = 0; i < this.weightMatrices.length; i++){
	      const weights = this.weightMatrices[i]
	      const activations = this.activations[i].slice(0);
	      activations.push(1);
	      this.activationMatrices.push(weights.halfMultiply(new Vector(activations)));
	    }
	    this.renderActivations(0);
	  }

	  // batch is a 2d array containing training data and label
	  train(batch){

	    let gradients = [];
	    this.weightMatrices.forEach(function(weights){
	      gradients.push(new Matrix(weights.width, weights.height));
	    });

	    for (let k = 0; k < batch.length; k++){
	      let deltas = [];
	      this.layers.forEach(function(layer){
	        deltas.push(Functions.zeros(layer))
	      });

	      const result = this.compute(batch[k].slice(0, -1));
	      for (let l = 0; l < result.length; l++){
	        // handles more than 1 label, which we may not use
	        deltas[deltas.length -1][l] += result[l] - batch[k][batch[k].length - 1];
	      }

	      // backpropagate the error
	      for (let l = deltas.length - 2; l > 0; l --){
	        let pass = this.weightMatrices[l].transpose()
	                        .multiply(new Vector(deltas[l + 1])).columns()[0];
	        pass = pass.slice(0, -1);
	        const sigDeriv = Functions.pointProduct(Functions.oneMinus(this.activations[l]), this.activations[l]);
	        deltas[l] = Functions.pointProduct(pass, sigDeriv);
	      }
	      // correct the error to get the real gadient dE/dW
	      for (let l = 1; l < deltas.length; l++){
	        let biasedActivation = this.activations[l - 1].slice(0);
	        biasedActivation.push(1);
	        biasedActivation = new Vector(biasedActivation);
	        const delta = new Vector(deltas[l]);
	        gradients[l - 1] = gradients[l - 1].sum(biasedActivation.outerProduct(delta));
	      }
	    }
	    for (let l = 0; l < this.weightMatrices.length; l++){
	      gradients[l].scale((-1) * this.learningRate);
	      this.weightMatrices[l] = this.weightMatrices[l].sum(gradients[l]);
	    }
	    this.updateConnections();
	  }


	  renderForwardPass(){

	  }

	  updateArchitecture(){
	    this.updateConnections();
	  }

	  renderNeurons(){
	    const stage = this.stage;
	    const radius = this.radius;
	    const neuronCenters = this.neuronCenters;
	    this.layers.forEach( function(layer, k){
	      for (let i = 0; i < layer; i++){
	        const circle = new createjs.Shape();
	        circle.graphics.beginFill("#dddddd").drawCircle(0, 0, radius);
	        circle.x = neuronCenters[k][i][0];
	        circle.y = neuronCenters[k][i][1];
	        stage.addChild(circle);
	        stage.update();
	      }
	    });

	  }

	  renderConnections(){
	    const stage = this.stage;

	    // render input
	    for (let j = 0; j < this.neuronCenters[0].length; j++){
	      const line = new createjs.Shape();
	      line.graphics.beginStroke("#cccccc");
	      line.graphics.moveTo(this.neuronCenters[0][j][0] - this.radius, this.neuronCenters[0][j][1]);
	      line.graphics.lineTo(this.neuronCenters[0][j][0] - this.radius - this.ioLength, this.neuronCenters[0][j][1]);
	      line.graphics.endStroke();
	      stage.addChild(line);
	      stage.update();
	    }

	    // render middle
	    for (let i = 0; i < this.synapses.length; i++){
	      this.lines.push([]);
	      for (let j = 0; j < this.synapses[i].length; j++){
	        this.lines[i].push([]);
	        for (let k = 0; k < this.synapses[i][j].length; k++){
	          const line = new createjs.Shape();
	          line.graphics.beginStroke("#cccccc");
	          line.graphics.moveTo(this.synapses[i][j][k][0][0], this.synapses[i][j][k][0][1]);
	          line.graphics.lineTo(this.synapses[i][j][k][1][0], this.synapses[i][j][k][1][1]);
	          line.graphics.endStroke();
	          stage.addChild(line);
	          stage.update();
	          this.lines[i][j].push(line);
	        }
	      }
	    }

	    // render output
	    let i = this.neuronCenters.length - 1;
	    for (let j = 0; j < this.neuronCenters[this.neuronCenters.length - 1].length; j++){
	      const line = new createjs.Shape();
	      line.graphics.beginStroke("#cccccc");
	      line.graphics.moveTo(this.neuronCenters[i][j][0] + this.radius, this.neuronCenters[i][j][1]);
	      line.graphics.lineTo(this.neuronCenters[i][j][0] + this.radius + this.ioLength, this.neuronCenters[i][j][1]);
	      line.graphics.endStroke();
	      stage.addChild(line);
	      stage.update();
	    }
	  }

	  renderActivations(l){
	    // render input
	    if (l === 0){
	      for (let j = 0; j < this.neuronCenters[0].length; j++){
	        const line = new createjs.Shape();
	        line.graphics.beginStroke("#000000");
	        line.graphics.moveTo(this.neuronCenters[0][j][0] - this.radius - this.ioLength, this.neuronCenters[0][j][1]);
	        const cmd = line.graphics.lineTo(this.neuronCenters[0][j][0] - this.radius - this.ioLength, this.neuronCenters[0][j][1]).command;
	        line.graphics.endStroke();
	        createjs.Tween.get(cmd).to({x:this.neuronCenters[0][j][0] - this.radius}, 1400).call(
	          this.renderActivations.bind(this,l+1)
	        );
	        this.stage.addChild(line);
	      }
	    } else if (l === this.layers.length){

	    } else {
	      for (let j = 0; j < this.synapses[l - 1].length; j++){
	        for (let k = 0; k < this.synapses[l - 1][j].length; k++){
	          const line = new createjs.Shape();
	          let pos = 0;
	          let neg = 0;
	          if (this.activationMatrices[l-1].rows[k][j] > 0){
	            pos = Math.floor(this.activationMatrices[l-1].rows[k][j] * 10);
	          } else {
	            neg = -1 * Math.floor(this.activationMatrices[l-1].rows[k][j] * 10);
	          }
	          line.graphics.beginStroke(`rgb(${neg},1,${pos})`);
	          let width = 1;
	          if (Math.abs(this.weightMatrices[l-1].rows[k][j]) > 1){
	            width = Math.abs(this.weightMatrices[l-1].rows[k][j]);
	          }
	          line.graphics.setStrokeStyle(width);
	          line.graphics.moveTo(this.synapses[l-1][j][k][0][0], this.synapses[l-1][j][k][0][1]);
	          const cmd = line.graphics.lineTo(this.synapses[l-1][j][k][0][0], this.synapses[l-1][j][k][0][1]).command;
	          line.graphics.endStroke();
	          createjs.Tween.get(cmd).to({x:this.synapses[l-1][j][k][1][0], y:this.synapses[l-1][j][k][1][1]}, 1400).call(
	            this.renderActivations.bind(this,l+1)
	          );
	          this.stage.addChild(line);
	          //stage.update();
	          //this.lines[i][j].push(line);
	        }
	      }
	    }


	  }

	  updateConnections(){
	    this.k += 1;
	    for (let i = 0; i < this.lines.length; i++){
	      for (let j = 0; j < this.lines[i].length; j++){
	        for (let k = 0; k < this.lines[i][j].length; k++){
	          this.lines[i][j][k].graphics.setStrokeStyle(Math.abs(this.weightMatrices[i].rows[k][j]));
	          if (this.weightMatrices[i].rows[k][j] < 0) {
	            this.lines[i][j][k].graphics.beginStroke("#d0d0d0");
	          } else {
	            this.lines[i][j][k].graphics.beginStroke("#d0d0d0");
	          }
	          this.lines[i][j][k].graphics.moveTo(this.synapses[i][j][k][0][0], this.synapses[i][j][k][0][1]);
	          this.lines[i][j][k].graphics.lineTo(this.synapses[i][j][k][1][0], this.synapses[i][j][k][1][1]);
	          this.lines[i][j][k].graphics.endStroke();
	        }
	      }
	    }
	    //this.stage.removeAllChildren();

	  }
	}










	class Matrix {
	  constructor(width, height){
	    this.width = width;
	    this.height = height;
	    this.rows = []
	    for (let i = 0; i < height; i++){
	      const row = [];
	      for (let j = 0; j < width; j++){
	        row.push(0)
	      }
	      this.rows.push(row);
	    }
	  }

	  columns(){
	    return this.transpose().rows;
	  }

	  transpose(){
	    const result = new Matrix(this.height, this.width);
	    for (let i = 0; i < result.width; i++){
	      for (let j = 0; j < result.height; j++){
	        result.set(i, j, this.rows[i][j]);
	      }
	    }
	    return result;
	  }

	  set(x, y, value){
	    this.rows[y][x] = value;
	  }

	  scale(factor){
	    for (let i = 0; i < this.width; i++){
	      for (let j = 0; j < this.height; j++){
	        this.set(i , j, this.rows[j][i] * factor);
	      }
	    }
	  }

	  sum(matrix){
	    const result = new Matrix(this.width, this.height);
	    for (let i = 0; i < this.width; i++){
	      for (let j = 0; j < this.height; j++){
	        result.set(i , j, this.rows[j][i] + matrix.rows[j][i]);
	      }
	    }
	    return result;
	  }

	  // naive matrix multiplication, but it should work fine for us.
	  multiply(matrix){
	    if (this.width === matrix.height){
	      const result = new Matrix(matrix.width, this.height);
	      for (let i = 0; i < result.width; i++){
	        for (let j = 0; j < result.height; j++){
	          result.set(i, j, Functions.innerProduct(
	            matrix.columns()[i],
	            this.rows[j]
	          ));
	        }
	      }
	      return result;
	    }
	  }
	  halfMultiply(vector){
	    if (this.width === vector.height){

	      const result = new Matrix(this.width, this.height);
	      for (let j = 0; j < result.height; j++){
	        result.rows[j] = Functions.pointProduct(this.rows[j], vector.columns()[0]);
	      }
	      return result;
	    }
	  }

	  randomize(modulus){
	    for (let i = 0; i < this.width; i++){
	      for (let j = 0; j < this.height; j++){
	        this.set(i , j, modulus * (2 * Math.random()  - 1));
	      }
	    }
	  }
	}


	class Vector extends Matrix {
	  constructor(array){
	    super(1, array.length);
	    for (let i = 0; i < array.length; i++){
	      this.set(0, i, array[i]);
	    }
	  }

	  outerProduct(v){
	    const result = new Matrix(this.height, v.height);
	    for (let i = 0; i < result.width; i++){
	      for (let j = 0; j < result.height; j++){
	        result.set(i, j, this.columns()[0][i] * v.columns()[0][j]);
	      }
	    }
	    return result;
	  }
	}

	module.exports = Perceptron;


/***/ },
/* 2 */
/***/ function(module, exports) {

	
	function innerProduct(v, w){
	  let result = 0;
	  for (let i = 0; i < v.length; i++){
	    result += v[i] * w[i];
	  }
	  return result;
	}

	function pointProduct(v, w){
	  const result = [];
	  for (let i = 0; i < v.length; i++){
	    result.push(v[i] * w[i]);
	  }
	  return result;
	}

	function sum(v, w){
	  const result = [];
	  for (let i = 0; i < v.length; i++){
	    result.push(v[i] + w[i]);
	  }
	  return result;
	}

	function zeros(length){
	  const result = [];
	  for (let i = 0; i < length; i++){
	    result.push(0);
	  }
	  return result;
	}

	//applies tanh to a list
	function tanh(v){
	  return v.map(function(x){
	    return Math.tanh(x);
	  });
	}

	function sech(v){
	  return v.map(function(x){
	    return Math.sech(x) * Math.sech(x);
	  });
	}

	function sigmoid(v){
	  return v.map(function(x){
	    return 1 / (1 + Math.exp(-x));
	  });
	}

	function sigmoidPrime(v){
	  return pointProduct(sigmoid(v), oneMinus(sigmoid(v)));
	}

	function oneMinus(v){
	  return v.map(function(x){
	    return 1 - x;
	  });
	}

	module.exports = {
	  innerProduct,
	  sigmoid,
	  sigmoidPrime,
	  pointProduct,
	  zeros,
	  oneMinus,
	  sum,
	  tanh
	};


/***/ }
/******/ ]);