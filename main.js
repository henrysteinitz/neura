const Perceptron = require('./perceptron.js');


document.addEventListener("DOMContentLoaded", function(){
  console.log("siajdfhaoijdfn");
  const stage = init();
  stage.enableMouseOver(30);
  createjs.Ticker.setFPS(70);
  //stage.autoClear = false;
  let ann = new Perceptron([2,4,1], stage);
  ann.training = false;
  ann.visualizing = false;
  createjs.Ticker.addEventListener("tick", function(){
    if (ann.training) {
      let batch = generateBatch(3);
      ann.train(batch);
    }
    //stage.clear();
    stage.update();

  });

  document.getElementsByClassName('train')[0].addEventListener("click", function(e){
    if (ann.training) {
      e.target.className = "train"
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
  })

  document.getElementsByClassName('run')[0].addEventListener("click", function(e){
    if (!ann.training){
      const x = parseFloat(document.getElementById("x").value);
      const y = parseFloat(document.getElementById("y").value);
      ann.visualCompute([x, y]);
    }
  });

  document.getElementById('add-layer').addEventListener("click", function(e){
    const layers = ann.layers.slice(0, ann.layers.length - 1).concat([4,1]);
    stage.removeAllChildren();
    ann = new Perceptron(layers, stage);
  });
  document.getElementById('remove-layer').addEventListener("click", function(e){
    const layers = ann.layers.slice(0, ann.layers.length - 2).concat([1]);
    stage.removeAllChildren();
    ann = new Perceptron(layers, stage);
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
