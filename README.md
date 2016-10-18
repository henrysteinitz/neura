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

By adjusting the weights through a technique called backpropagation, ANNs can
learn to perform task that are difficult to explicitly program, provided they
have an appropriate network topology. Some examples include object recognition,
speech recognition, translation, and image classification.

### Functionality & MVP

The visualizer will be able to
- [ ] Choose between different datasets and classification tasks (at least
separating randomly generated clusters)
- [ ] Design different architectures
- [ ] Render input and each neuron's output
- [ ] Render the weight of each
- [ ] Realtime training

### Implementation Timeline

**Day 1**
- [ ] Setup

**Day 2**
- [ ] Run / train network logic
- [ ] Create neurons and connections

**Day 3**
- [ ] Input generation logic
- [ ] draw input /output
- [ ] draw classification landscape

**Day 4**
- [ ] Run / train controls
- [ ] 

**Bonus**
- [ ] Recurrent connections
- [ ] Handwriting data
