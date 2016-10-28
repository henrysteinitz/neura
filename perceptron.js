const Functions = require('./math.js');


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
    this.activationLines = [];
    this.initializeViews();
    this.renderNeurons();
    this.renderConnections();
    this.updateConnections = this.updateConnections.bind(this);

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
    this.clearActivationLines();
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

  updateArchitecture(){
    this.updateConnections();
  }

  renderNeurons(){
    const stage = this.stage;
    const radius = this.radius;
    const neuronCenters = this.neuronCenters;
    const weightMatrices = this.weightMatrices;
    this.layers.forEach( function(layer, k){
      for (let i = 0; i < layer; i++){
        const circle = new createjs.Shape();
        circle.graphics.beginFill("#dddddd").drawCircle(0, 0, radius);
        circle.x = neuronCenters[k][i][0];
        circle.y = neuronCenters[k][i][1];
        stage.addChild(circle);
        stage.update();
        if (k > 0){
          circle.on("mouseover", function(e){
            console.log('adsfd');
            const mag = Math.tanh(weightMatrices[k - 1].rows[i][weightMatrices[k - 1].rows[i].length - 1]);
            circle.filters = [new createjs.ColorFilter(
              0,0,0,1,
              180 - Math.floor(50*mag),
              180 - Math.abs(Math.floor(50*mag)),
              180 + Math.floor(50*mag), 0) ];
            circle.cache(-1*radius, -1*radius, radius*2, radius*2 ,2);
          });
          circle.on("mouseout", function(e){
            circle.filters = [];
            circle.cache(-1*radius, -1*radius, radius*2, radius*2 ,2);
          });
        }

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
        line.graphics.beginStroke("rgb(180,180,180)");
        line.graphics.moveTo(this.neuronCenters[0][j][0] - this.radius - this.ioLength, this.neuronCenters[0][j][1]);
        const cmd = line.graphics.lineTo(this.neuronCenters[0][j][0] - this.radius - this.ioLength, this.neuronCenters[0][j][1]).command;
        line.graphics.endStroke();
        createjs.Tween.get(cmd).to({x:this.neuronCenters[0][j][0] - this.radius}, 800).call(
          this.renderActivations.bind(this,l+1)
        );
        this.stage.addChild(line);
        this.activationLines.push(line);
      }
    } else if (l === this.layers.length){
      for (let j = 0; j < this.neuronCenters[l - 1].length; j++){
        const line = new createjs.Shape();
        line.graphics.beginStroke("rgb(180,180,180)");
        line.graphics.moveTo(this.neuronCenters[l - 1][j][0] + this.radius, this.neuronCenters[l - 1][j][1]);
        const cmd = line.graphics.lineTo(this.neuronCenters[l - 1][j][0] + this.radius, this.neuronCenters[l - 1][j][1]).command;
        line.graphics.endStroke();
        createjs.Tween.get(cmd).to({x:this.neuronCenters[l - 1][j][0] + this.radius + this.ioLength}, 800);
        this.stage.addChild(line);
        this.activationLines.push(line);
      }
    } else {
      for (let j = 0; j < this.synapses[l - 1].length; j++){
        for (let k = 0; k < this.synapses[l - 1][j].length; k++){
          const line = new createjs.Shape();
          const mag = Math.tanh(this.activationMatrices[l-1].rows[k][j]);
          const color = `rgb(${180 - Math.floor(50*mag)}, ${180 - Math.abs(Math.floor(50*mag))}, ${180 + Math.floor(50*mag)})`;
          line.graphics.beginStroke(color);
          let width = 1;
          if (Math.abs(this.weightMatrices[l-1].rows[k][j]) > 1){
            width = Math.abs(this.weightMatrices[l-1].rows[k][j]);
          }
          line.graphics.setStrokeStyle(width);
          line.graphics.moveTo(this.synapses[l-1][j][k][0][0], this.synapses[l-1][j][k][0][1]);
          const cmd = line.graphics.lineTo(this.synapses[l-1][j][k][0][0], this.synapses[l-1][j][k][0][1]).command;
          line.graphics.endStroke();
          createjs.Tween.get(cmd).to({x:this.synapses[l-1][j][k][1][0], y:this.synapses[l-1][j][k][1][1]}, 800).call(
            this.renderActivations.bind(this,l+1)
          );
          this.stage.addChild(line);
          this.activationLines.push(line);
        }
      }
    }
  }

  clearActivationLines(){
    for (let i = 0; i < this.activationLines.length; i++){
      this.stage.removeChild(this.activationLines[i]);
    }
  }

  updateConnections(){
    for (let i = 0; i < this.lines.length; i++){
      for (let j = 0; j < this.lines[i].length; j++){
        for (let k = 0; k < this.lines[i][j].length; k++){
          this.stage.removeChild(this.lines[i][j][k]);
          this.lines[i][j][k] = new createjs.Shape();
          let stroke = Math.max(1, Math.abs(this.weightMatrices[i].rows[k][j]));
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

  absMax(){
    const max = 0;
    for (let i = 0; i < this.width; i++){
      for (let j = 0; j < this.height; j++){
        if (Math.abs(this.rows[j][i]) > max){
          max = Math.abs(this.rows[j][i]);
        }
      }
    }
    return max;
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
