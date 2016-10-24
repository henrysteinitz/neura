
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
