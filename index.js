// Funções para processamento de input
let listeners;
function getString(data) {
    return data.toString().replace(/(\r\n|\n|\r)/gm, "");
}

function registerInputListener(listener) {
    process.stdin.on("data", listener);
}

function unregisterInputListener(listener) {
    process.stdin.off("data", listener);
}

function stopInput() {
    process.stdin.pause();
}

function startListenerChain() {
    const listener = listeners.splice(0, 1)[0]; // Remove primeiro elemento e retorna
    if (!listener) {
        stopInput();
    }
    const caller = (data) =>
        listener(data, () => {
            process.stdin.off("data", caller);
            startListenerChain();
        });
    process.stdin.on("data", caller);
}

function registerListeners(...listenersToRegister) {
    listeners = [...listenersToRegister];
}

// Construtor do grafo de estados
function buildStates(numberOfStates, acceptanceStates, transitions) {
    const states = [];
    // adicionar objetos de estado à array
    for (i = 0; i < numberOfStates; i++) {
        states.push(buildStateNode(acceptanceStates, i.toString()));
    }
    // setar transições entre estados
    for (i = 0; i < numberOfStates; i++) {
        states[i].transitions = buildTransitions(
            transitions.filter(([from]) => from === i.toString()),
            states
        );
    }
    return states;
}

// Criar objeto que representa um estado
function buildStateNode(acceptanceStates, node) {
    return {
        isAcceptance: acceptanceStates.includes(node),
    };
}

// Adicionar cada transição ao seu respectivo estado de origem
function buildTransitions(arrayOfTransitions, states) {
    const transitions = {};
    for (const transition of arrayOfTransitions) {
        const [_, read, to, write, direction] = transition;
        transitions[read] = {
            to: states[parseInt(to)], // referencia para o estado de destino
            write: write,
            direction: direction,
        };
    }
    return transitions;
}

// Mover cabeça
function moveHead(head, direction) {
    if (direction === "R") return head + 1;
    if (direction === "L") return head - 1;
    return head;
}

// Percorrer grafo recurssivamente
function traverse(state, strip, head) {
    const symbol = strip[head];
    if (state.transitions[symbol]) {
        strip[head] = state.transitions[symbol].write;
        return traverse(
            state.transitions[symbol].to,
            strip,
            moveHead(head, state.transitions[symbol].direction)
        );
    }
    return state.isAcceptance;
}

function buildTuringMachine() {
    let numStates;
    let alphabet;
    let stripAlphabet;
    let acceptanceState;
    let numberOfTransitions;
    let numberOfTransitionsRead = 0;
    const transitions = [];
    let numberOfStringsToEvaluate;
    const stringsToEvaluate = [];
    let numberOfStringsRead = 0;

    function readNumStates(data, next) {
        numStates = parseInt(getString(data));
        next();
    }
    function readAlphabetString(data, next) {
        alphabet = getString(data).split(" ");
        alphabet.splice(0, 1);
        next();
    }
    function readStripAlphabet(data, next) {
        stripAlphabet = getString(data).split(" ");
        stripAlphabet.splice(0, 1);
        next();
    }
    function readAcceptanceState(data, next) {
        acceptanceState = getString(data);
        next();
    }
    function readNumberOfTransitions(data, next) {
        numberOfTransitions = parseInt(getString(data));
        next();
    }
    function readTransition(data, next) {
        transitions.push(getString(data).split(" "));
        numberOfTransitionsRead++;
        if (numberOfTransitionsRead === numberOfTransitions) {
            next();
        }
    }
    function readNumberOfStringsToEvaluate(data, next) {
        numberOfStringsToEvaluate = parseInt(getString(data));
        next();
    }
    function readString(data, next) {
        stringsToEvaluate.push(getString(data));
        numberOfStringsRead++;
        if (numberOfStringsRead === numberOfStringsToEvaluate) {
            next();
            evaluate();
        }
    }

    function evaluate() {
        const states = buildStates(numStates, acceptanceState, transitions);

        for (string of stringsToEvaluate) {
            const strip = `B${string}B`.split("");
            const accept = traverse(states[0], strip, 1) ? "aceita" : "rejeita";
            console.log(accept);
        }
    }

    registerListeners(
        readNumStates,
        readAlphabetString,
        readStripAlphabet,
        readAcceptanceState,
        readNumberOfTransitions,
        readTransition,
        readNumberOfStringsToEvaluate,
        readString
    );

    startListenerChain();
}

buildTuringMachine();
