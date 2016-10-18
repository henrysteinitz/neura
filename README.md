## Neural Network Visualizer

### Background

Artificial Neural Networks are learning algorithms used to extract patterns
from data. A network consists of series units called "neurons" and directed
connections between them. The connections each have an associated real number
called a "weight".

For simple feedforward networks, the algorithm begins by passing input (an
array of real numbers) to a few designated input neurons. These neurons then
pass the data through their outgoing connections, which are scaled by the
weights and received by new neurons. Each new neuron sums over the values they
receive and applies a nonlinear function to the result which becomes that
neuron's output. The process continues until the data flows to designated output
neurons.


![wireframes](https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/ArtificialNeuronModel_english.png/600px-ArtificialNeuronModel_english.png)

By adjusting the weights through a technique call backpropagation, ANNs can
learn to perform task that are difficult to explicitly program. Some examples
include object recognition, speech recognition, translation, and image
classification.
