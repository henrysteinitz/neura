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

	"use strict";

	var Perceptron = __webpack_require__(1);

	document.addEventListener("DOMContentLoaded", function () {
	  console.log("siajdfhaoijdfn");
	  var stage = init();
	  stage.enableMouseOver(30);
	  createjs.Ticker.setFPS(70);
	  //stage.autoClear = false;
	  var ann = new Perceptron([2, 4, 1], stage);
	  ann.training = false;
	  ann.visualizing = false;
	  createjs.Ticker.addEventListener("tick", function () {
	    if (ann.training) {
	      var batch = generateBatch(3);
	      ann.train(batch);
	    }
	    //stage.clear();
	    stage.update();
	  });

	  document.getElementsByClassName('train')[0].addEventListener("click", function (e) {
	    if (ann.training) {
	      e.target.className = "train";
	      e.target.innerHTML = "Train";
	      document.getElementsByClassName('run')[0].className = "run unfaded";
	      ann.training = false;
	    } else {
	      e.target.className = "stop";
	      e.target.innerHTML = "Stop";
	      document.getElementsByClassName('run')[0].className = "run faded";
	      ann.training = true;
	      ann.clearActivationLines();
	      if (parseFloat(document.getElementById("rate").value)) {
	        ann.learningRate = parseFloat(document.getElementById("rate").value);
	      } else {
	        ann.learningRate = 1.0;
	        document.getElementById("rate").value = "1.0";
	      }
	    }
	  });

	  document.getElementsByClassName('run')[0].addEventListener("click", function (e) {
	    if (!ann.training) {
	      var x = parseFloat(document.getElementById("x").value);
	      var y = parseFloat(document.getElementById("y").value);
	      ann.visualCompute([x, y]);
	    }
	  });

	  document.getElementById('add-layer').addEventListener("click", function (e) {
	    var layers = ann.layers.slice(0, ann.layers.length - 1).concat([4, 1]);
	    stage.removeAllChildren();
	    ann = new Perceptron(layers, stage);
	  });
	  document.getElementById('remove-layer').addEventListener("click", function (e) {
	    var layers = ann.layers.slice(0, ann.layers.length - 2).concat([1]);
	    stage.removeAllChildren();
	    ann = new Perceptron(layers, stage);
	  });
	});

	function generateBatch(size) {
	  var batch = [];
	  for (var i = 0; i < size; i++) {
	    var x = Math.random();
	    var y = Math.random();
	    var z = void 0;
	    if (eval(document.getElementById("data-eval").value)) {
	      z = 1;
	    } else {
	      z = 0;
	    }
	    batch.push([x, y, z]);
	  }
	  return batch;
	}

	function init() {
	  var canvas = document.getElementById("architecture-canvas");
	  var stage = new createjs.Stage("architecture-canvas");

	  if (window.devicePixelRatio) {
	    var height = canvas.getAttribute('height');
	    var width = canvas.getAttribute('width');
	    canvas.setAttribute('width', Math.round(width * window.devicePixelRatio));
	    canvas.setAttribute('height', Math.round(height * window.devicePixelRatio));
	    canvas.style.width = width + "px";
	    canvas.style.height = height + "px";
	    stage.scaleX = stage.scaleY = window.devicePixelRatio;
	  }

	  return stage;
	}

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Functions = __webpack_require__(2);

	var Perceptron = function () {
	  // takes in an array of layer-sizes. The length of the array tells us how
	  // deep the network is.
	  function Perceptron(layers, stage) {
	    _classCallCheck(this, Perceptron);

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
	    this.activationLines = [];
	    this.initializeViews();
	    this.renderNeurons();
	    this.renderConnections();
	    this.updateConnections = this.updateConnections.bind(this);
	  }

	  _createClass(Perceptron, [{
	    key: "initializeWeights",
	    value: function initializeWeights() {
	      this.weightMatrices = [];
	      for (var i = 0; i < this.layers.length - 1; i++) {
	        var weights = new Matrix(this.layers[i] + 1, this.layers[i + 1]);
	        weights.randomize(.005);
	        this.weightMatrices.push(weights);
	      }
	    }
	  }, {
	    key: "initializeViews",
	    value: function initializeViews() {

	      // calculate neuron centers
	      var xCenter = this.stage.canvas.width / (2 * window.devicePixelRatio);
	      var yCenter = this.stage.canvas.height / (2 * window.devicePixelRatio);
	      var xMid = (this.layers.length - 1) / 2;
	      var neuronCenters = this.neuronCenters;
	      this.layers.forEach(function (layer, k) {
	        var yMid = (layer - 1) / 2;
	        neuronCenters.push([]);
	        for (var i = 0; i < layer; i++) {
	          var x = (k - xMid) * 170 + xCenter;
	          var y = (i - yMid) * 120 + yCenter;
	          neuronCenters[k].push([x, y]);
	        }
	      });
	      // calculate connection endpoints
	      for (var i = 0; i < this.layers.length - 1; i++) {
	        this.synapses.push([]);
	        for (var j = 0; j < this.layers[i]; j++) {
	          this.synapses[i].push([]);
	          for (var k = 0; k < this.layers[i + 1]; k++) {
	            // hs geometry...
	            var start = neuronCenters[i][j].slice(0);
	            var end = neuronCenters[i + 1][k].slice(0);
	            var yDist = end[1] - start[1];
	            var xDist = end[0] - start[0];
	            var slope = yDist / xDist;
	            var cosTheta = xDist / Math.sqrt(xDist * xDist + yDist * yDist);
	            var realStart = [start[0] + this.radius * cosTheta, start[1] + this.radius * cosTheta * slope];
	            var realEnd = [end[0] - this.radius * cosTheta, end[1] - this.radius * cosTheta * slope];

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
	  }, {
	    key: "compute",
	    value: function compute(input) {
	      this.activations = [];
	      var field = input;
	      this.activations.push(field.slice(0));
	      for (var i = 0; i < this.weightMatrices.length; i++) {
	        var weights = this.weightMatrices[i];
	        field.push(1);
	        field = weights.multiply(new Vector(field)).columns()[0];
	        field = Functions.sigmoid(field);
	        this.activations.push(field.slice(0));
	      }
	      return field;
	    }

	    //

	  }, {
	    key: "visualCompute",
	    value: function visualCompute(input) {
	      this.xDisplay.text = input[0].toString().slice(0, 6);
	      this.yDisplay.text = input[1].toString().slice(0, 6);
	      this.outDisplay.text = (Math.round(this.compute(input)[0] * 100000) / 100000).toString();
	      this.stage.update();
	      this.activationMatrices = [];
	      for (var i = 0; i < this.weightMatrices.length; i++) {
	        var weights = this.weightMatrices[i];
	        var activations = this.activations[i].slice(0);
	        activations.push(1);
	        this.activationMatrices.push(weights.halfMultiply(new Vector(activations)));
	      }
	      this.clearActivationLines();
	      this.renderActivations(0);
	    }

	    // batch is a 2d array containing training data and label

	  }, {
	    key: "train",
	    value: function train(batch) {
	      var _this = this;

	      var gradients = [];
	      this.weightMatrices.forEach(function (weights) {
	        gradients.push(new Matrix(weights.width, weights.height));
	      });

	      var _loop = function _loop(k) {
	        var deltas = [];
	        _this.layers.forEach(function (layer) {
	          deltas.push(Functions.zeros(layer));
	        });

	        var result = _this.compute(batch[k].slice(0, -1));
	        for (var _l = 0; _l < result.length; _l++) {
	          // handles more than 1 label, which we may not use
	          deltas[deltas.length - 1][_l] += result[_l] - batch[k][batch[k].length - 1];
	        }

	        // backpropagate the error
	        for (var _l2 = deltas.length - 2; _l2 > 0; _l2--) {
	          var pass = _this.weightMatrices[_l2].transpose().multiply(new Vector(deltas[_l2 + 1])).columns()[0];
	          pass = pass.slice(0, -1);
	          var sigDeriv = Functions.pointProduct(Functions.oneMinus(_this.activations[_l2]), _this.activations[_l2]);
	          deltas[_l2] = Functions.pointProduct(pass, sigDeriv);
	        }
	        // correct the error to get the real gadient dE/dW
	        for (var _l3 = 1; _l3 < deltas.length; _l3++) {
	          var biasedActivation = _this.activations[_l3 - 1].slice(0);
	          biasedActivation.push(1);
	          biasedActivation = new Vector(biasedActivation);
	          var delta = new Vector(deltas[_l3]);
	          gradients[_l3 - 1] = gradients[_l3 - 1].sum(biasedActivation.outerProduct(delta));
	        }
	      };

	      for (var k = 0; k < batch.length; k++) {
	        _loop(k);
	      }
	      for (var l = 0; l < this.weightMatrices.length; l++) {
	        gradients[l].scale(-1 * this.learningRate);
	        this.weightMatrices[l] = this.weightMatrices[l].sum(gradients[l]);
	      }
	      this.updateConnections();
	    }
	  }, {
	    key: "updateArchitecture",
	    value: function updateArchitecture() {
	      this.updateConnections();
	    }
	  }, {
	    key: "renderNeurons",
	    value: function renderNeurons() {
	      var stage = this.stage;
	      var radius = this.radius;
	      var neuronCenters = this.neuronCenters;
	      var weightMatrices = this.weightMatrices;
	      this.layers.forEach(function (layer, k) {
	        var _loop2 = function _loop2(i) {
	          var circle = new createjs.Shape();
	          circle.graphics.beginFill("#dddddd").drawCircle(0, 0, radius);
	          circle.x = neuronCenters[k][i][0];
	          circle.y = neuronCenters[k][i][1];
	          stage.addChild(circle);
	          stage.update();
	          if (k > 0) {
	            circle.on("mouseover", function (e) {
	              console.log('adsfd');
	              var mag = Math.tanh(weightMatrices[k - 1].rows[i][weightMatrices[k - 1].rows[i].length - 1]);
	              circle.filters = [new createjs.ColorFilter(0, 0, 0, 1, 180 - Math.floor(50 * mag), 180 - Math.abs(Math.floor(50 * mag)), 180 + Math.floor(50 * mag), 0)];
	              circle.cache(-1 * radius, -1 * radius, radius * 2, radius * 2, 2);
	            });
	            circle.on("mouseout", function (e) {
	              circle.filters = [];
	              circle.cache(-1 * radius, -1 * radius, radius * 2, radius * 2, 2);
	            });
	          }
	        };

	        for (var i = 0; i < layer; i++) {
	          _loop2(i);
	        }
	      });
	    }
	  }, {
	    key: "renderConnections",
	    value: function renderConnections() {
	      var stage = this.stage;

	      // render input
	      for (var j = 0; j < this.neuronCenters[0].length; j++) {
	        var line = new createjs.Shape();
	        line.graphics.beginStroke("#cccccc");
	        line.graphics.moveTo(this.neuronCenters[0][j][0] - this.radius, this.neuronCenters[0][j][1]);
	        line.graphics.lineTo(this.neuronCenters[0][j][0] - this.radius - this.ioLength, this.neuronCenters[0][j][1]);
	        line.graphics.endStroke();
	        stage.addChild(line);
	        stage.update();
	      }

	      // render middle
	      for (var _i = 0; _i < this.synapses.length; _i++) {
	        this.lines.push([]);
	        for (var _j = 0; _j < this.synapses[_i].length; _j++) {
	          this.lines[_i].push([]);
	          for (var k = 0; k < this.synapses[_i][_j].length; k++) {
	            var _line = new createjs.Shape();
	            _line.graphics.beginStroke("#cccccc");
	            _line.graphics.moveTo(this.synapses[_i][_j][k][0][0], this.synapses[_i][_j][k][0][1]);
	            _line.graphics.lineTo(this.synapses[_i][_j][k][1][0], this.synapses[_i][_j][k][1][1]);
	            _line.graphics.endStroke();
	            stage.addChild(_line);
	            stage.update();
	            this.lines[_i][_j].push(_line);
	          }
	        }
	      }

	      // render output
	      var i = this.neuronCenters.length - 1;
	      for (var _j2 = 0; _j2 < this.neuronCenters[this.neuronCenters.length - 1].length; _j2++) {
	        var _line2 = new createjs.Shape();
	        _line2.graphics.beginStroke("#cccccc");
	        _line2.graphics.moveTo(this.neuronCenters[i][_j2][0] + this.radius, this.neuronCenters[i][_j2][1]);
	        _line2.graphics.lineTo(this.neuronCenters[i][_j2][0] + this.radius + this.ioLength, this.neuronCenters[i][_j2][1]);
	        _line2.graphics.endStroke();
	        stage.addChild(_line2);
	        stage.update();
	      }
	    }
	  }, {
	    key: "renderActivations",
	    value: function renderActivations(l) {
	      // render input
	      if (l === 0) {
	        for (var j = 0; j < this.neuronCenters[0].length; j++) {
	          var line = new createjs.Shape();
	          line.graphics.beginStroke("rgb(180,180,180)");
	          line.graphics.moveTo(this.neuronCenters[0][j][0] - this.radius - this.ioLength, this.neuronCenters[0][j][1]);
	          var cmd = line.graphics.lineTo(this.neuronCenters[0][j][0] - this.radius - this.ioLength, this.neuronCenters[0][j][1]).command;
	          line.graphics.endStroke();
	          createjs.Tween.get(cmd).to({ x: this.neuronCenters[0][j][0] - this.radius }, 800).call(this.renderActivations.bind(this, l + 1));
	          this.stage.addChild(line);
	          this.activationLines.push(line);
	        }
	      } else if (l === this.layers.length) {
	        for (var _j3 = 0; _j3 < this.neuronCenters[l - 1].length; _j3++) {
	          var _line3 = new createjs.Shape();
	          _line3.graphics.beginStroke("rgb(180,180,180)");
	          _line3.graphics.moveTo(this.neuronCenters[l - 1][_j3][0] + this.radius, this.neuronCenters[l - 1][_j3][1]);
	          var _cmd = _line3.graphics.lineTo(this.neuronCenters[l - 1][_j3][0] + this.radius, this.neuronCenters[l - 1][_j3][1]).command;
	          _line3.graphics.endStroke();
	          createjs.Tween.get(_cmd).to({ x: this.neuronCenters[l - 1][_j3][0] + this.radius + this.ioLength }, 800);
	          this.stage.addChild(_line3);
	          this.activationLines.push(_line3);
	        }
	      } else {
	        for (var _j4 = 0; _j4 < this.synapses[l - 1].length; _j4++) {
	          for (var k = 0; k < this.synapses[l - 1][_j4].length; k++) {
	            var _line4 = new createjs.Shape();
	            var mag = Math.tanh(this.activationMatrices[l - 1].rows[k][_j4]);
	            var color = "rgb(" + (180 - Math.floor(50 * mag)) + ", " + (180 - Math.abs(Math.floor(50 * mag))) + ", " + (180 + Math.floor(50 * mag)) + ")";
	            _line4.graphics.beginStroke(color);
	            var width = 1;
	            if (Math.abs(this.weightMatrices[l - 1].rows[k][_j4]) > 1) {
	              width = Math.abs(this.weightMatrices[l - 1].rows[k][_j4]);
	            }
	            _line4.graphics.setStrokeStyle(width);
	            _line4.graphics.moveTo(this.synapses[l - 1][_j4][k][0][0], this.synapses[l - 1][_j4][k][0][1]);
	            var _cmd2 = _line4.graphics.lineTo(this.synapses[l - 1][_j4][k][0][0], this.synapses[l - 1][_j4][k][0][1]).command;
	            _line4.graphics.endStroke();
	            createjs.Tween.get(_cmd2).to({ x: this.synapses[l - 1][_j4][k][1][0], y: this.synapses[l - 1][_j4][k][1][1] }, 800).call(this.renderActivations.bind(this, l + 1));
	            this.stage.addChild(_line4);
	            this.activationLines.push(_line4);
	          }
	        }
	      }
	    }
	  }, {
	    key: "clearActivationLines",
	    value: function clearActivationLines() {
	      for (var i = 0; i < this.activationLines.length; i++) {
	        this.stage.removeChild(this.activationLines[i]);
	      }
	    }
	  }, {
	    key: "updateConnections",
	    value: function updateConnections() {
	      for (var i = 0; i < this.lines.length; i++) {
	        for (var j = 0; j < this.lines[i].length; j++) {
	          for (var k = 0; k < this.lines[i][j].length; k++) {
	            this.stage.removeChild(this.lines[i][j][k]);
	            this.lines[i][j][k] = new createjs.Shape();
	            var stroke = Math.max(1, Math.abs(this.weightMatrices[i].rows[k][j]));
	            this.lines[i][j][k].graphics.setStrokeStyle(stroke);
	            if (this.weightMatrices[i].rows[k][j] < 0) {
	              this.lines[i][j][k].graphics.beginStroke("#d0d0d0");
	            } else {
	              this.lines[i][j][k].graphics.beginStroke("#d0d0d0");
	            }
	            this.lines[i][j][k].graphics.moveTo(this.synapses[i][j][k][0][0], this.synapses[i][j][k][0][1]);
	            this.lines[i][j][k].graphics.lineTo(this.synapses[i][j][k][1][0], this.synapses[i][j][k][1][1]);
	            this.lines[i][j][k].graphics.endStroke();
	            this.stage.addChild(this.lines[i][j][k]);
	          }
	        }
	      }
	    }
	  }]);

	  return Perceptron;
	}();

	var Matrix = function () {
	  function Matrix(width, height) {
	    _classCallCheck(this, Matrix);

	    this.width = width;
	    this.height = height;
	    this.rows = [];
	    for (var i = 0; i < height; i++) {
	      var row = [];
	      for (var j = 0; j < width; j++) {
	        row.push(0);
	      }
	      this.rows.push(row);
	    }
	  }

	  _createClass(Matrix, [{
	    key: "columns",
	    value: function columns() {
	      return this.transpose().rows;
	    }
	  }, {
	    key: "transpose",
	    value: function transpose() {
	      var result = new Matrix(this.height, this.width);
	      for (var i = 0; i < result.width; i++) {
	        for (var j = 0; j < result.height; j++) {
	          result.set(i, j, this.rows[i][j]);
	        }
	      }
	      return result;
	    }
	  }, {
	    key: "set",
	    value: function set(x, y, value) {
	      this.rows[y][x] = value;
	    }
	  }, {
	    key: "scale",
	    value: function scale(factor) {
	      for (var i = 0; i < this.width; i++) {
	        for (var j = 0; j < this.height; j++) {
	          this.set(i, j, this.rows[j][i] * factor);
	        }
	      }
	    }
	  }, {
	    key: "sum",
	    value: function sum(matrix) {
	      var result = new Matrix(this.width, this.height);
	      for (var i = 0; i < this.width; i++) {
	        for (var j = 0; j < this.height; j++) {
	          result.set(i, j, this.rows[j][i] + matrix.rows[j][i]);
	        }
	      }
	      return result;
	    }

	    // naive matrix multiplication, but it should work fine for us.

	  }, {
	    key: "multiply",
	    value: function multiply(matrix) {
	      if (this.width === matrix.height) {
	        var _result = new Matrix(matrix.width, this.height);
	        for (var i = 0; i < _result.width; i++) {
	          for (var j = 0; j < _result.height; j++) {
	            _result.set(i, j, Functions.innerProduct(matrix.columns()[i], this.rows[j]));
	          }
	        }
	        return _result;
	      }
	    }
	  }, {
	    key: "halfMultiply",
	    value: function halfMultiply(vector) {
	      if (this.width === vector.height) {

	        var _result2 = new Matrix(this.width, this.height);
	        for (var j = 0; j < _result2.height; j++) {
	          _result2.rows[j] = Functions.pointProduct(this.rows[j], vector.columns()[0]);
	        }
	        return _result2;
	      }
	    }
	  }, {
	    key: "randomize",
	    value: function randomize(modulus) {
	      for (var i = 0; i < this.width; i++) {
	        for (var j = 0; j < this.height; j++) {
	          this.set(i, j, modulus * (2 * Math.random() - 1));
	        }
	      }
	    }
	  }, {
	    key: "absMax",
	    value: function absMax() {
	      var max = 0;
	      for (var i = 0; i < this.width; i++) {
	        for (var j = 0; j < this.height; j++) {
	          if (Math.abs(this.rows[j][i]) > max) {
	            max = Math.abs(this.rows[j][i]);
	          }
	        }
	      }
	      return max;
	    }
	  }]);

	  return Matrix;
	}();

	var Vector = function (_Matrix) {
	  _inherits(Vector, _Matrix);

	  function Vector(array) {
	    _classCallCheck(this, Vector);

	    var _this2 = _possibleConstructorReturn(this, (Vector.__proto__ || Object.getPrototypeOf(Vector)).call(this, 1, array.length));

	    for (var i = 0; i < array.length; i++) {
	      _this2.set(0, i, array[i]);
	    }
	    return _this2;
	  }

	  _createClass(Vector, [{
	    key: "outerProduct",
	    value: function outerProduct(v) {
	      var result = new Matrix(this.height, v.height);
	      for (var i = 0; i < result.width; i++) {
	        for (var j = 0; j < result.height; j++) {
	          result.set(i, j, this.columns()[0][i] * v.columns()[0][j]);
	        }
	      }
	      return result;
	    }
	  }]);

	  return Vector;
	}(Matrix);

	module.exports = Perceptron;

/***/ },
/* 2 */
/***/ function(module, exports) {

	"use strict";

	function innerProduct(v, w) {
	  var result = 0;
	  for (var i = 0; i < v.length; i++) {
	    result += v[i] * w[i];
	  }
	  return result;
	}

	function pointProduct(v, w) {
	  var result = [];
	  for (var i = 0; i < v.length; i++) {
	    result.push(v[i] * w[i]);
	  }
	  return result;
	}

	function sum(v, w) {
	  var result = [];
	  for (var i = 0; i < v.length; i++) {
	    result.push(v[i] + w[i]);
	  }
	  return result;
	}

	function zeros(length) {
	  var result = [];
	  for (var i = 0; i < length; i++) {
	    result.push(0);
	  }
	  return result;
	}

	//applies tanh to a list
	function tanh(v) {
	  return v.map(function (x) {
	    return Math.tanh(x);
	  });
	}

	function sech(v) {
	  return v.map(function (x) {
	    return Math.sech(x) * Math.sech(x);
	  });
	}

	function sigmoid(v) {
	  return v.map(function (x) {
	    return 1 / (1 + Math.exp(-x));
	  });
	}

	function sigmoidPrime(v) {
	  return pointProduct(sigmoid(v), oneMinus(sigmoid(v)));
	}

	function oneMinus(v) {
	  return v.map(function (x) {
	    return 1 - x;
	  });
	}

	module.exports = {
	  innerProduct: innerProduct,
	  sigmoid: sigmoid,
	  sigmoidPrime: sigmoidPrime,
	  pointProduct: pointProduct,
	  zeros: zeros,
	  oneMinus: oneMinus,
	  sum: sum,
	  tanh: tanh
	};

/***/ }
/******/ ]);