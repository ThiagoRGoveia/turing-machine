// Funções para processamento de input
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

function buildStateNode(acceptanceStates, node) {
    return {
        isAcceptance: acceptanceStates.includes(node),
    };
}

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

function exec() {
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

    registerInputListener(readNumStates);

    function readNumStates(data) {
        numStates = parseInt(getString(data));
        unregisterInputListener(readNumStates);
        registerInputListener(readAlphabetString);
    }
    function readAlphabetString(data) {
        alphabet = getString(data).split(" ");
        alphabet.splice(0, 1);
        unregisterInputListener(readAlphabetString);
        registerInputListener(readStripAlphabet);
    }
    function readStripAlphabet(data) {
        stripAlphabet = getString(data).split(" ");
        stripAlphabet.splice(0, 1);
        unregisterInputListener(readStripAlphabet);
        registerInputListener(readAcceptanceState);
    }
    function readAcceptanceState(data) {
        acceptanceState = getString(data);
        unregisterInputListener(readAcceptanceState);
        registerInputListener(readNumberOfTransitions);
    }
    function readNumberOfTransitions(data) {
        numberOfTransitions = parseInt(getString(data));
        unregisterInputListener(readNumberOfTransitions);
        registerInputListener(readTransition);
    }
    function readTransition(data) {
        transitions.push(getString(data).split(" "));
        numberOfTransitionsRead++;
        if (numberOfTransitionsRead === numberOfTransitions) {
            unregisterInputListener(readTransition);
            registerInputListener(readStringsToEvaluate);
        }
    }
    function readStringsToEvaluate(data) {
        numberOfStringsToEvaluate = parseInt(getString(data));
        unregisterInputListener(readStringsToEvaluate);
        registerInputListener(readString);
    }
    function readString(data) {
        stringsToEvaluate.push(getString(data));
        numberOfStringsRead++;
        if (numberOfStringsRead === numberOfStringsToEvaluate) {
            unregisterInputListener(readString);
            stopInput();
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
}

exec();
