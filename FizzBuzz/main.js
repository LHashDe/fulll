const fizzBuzz = (from = 1, to = 100) => {
    for (let i = from; i <= to; i++) {
        let result = '';
        if (i % 3 === 0) result += 'Fizz';
        if (i % 5 === 0) result += 'Buzz';
        console.log(result || i);
    }
}

const getArgsValue = () => {
    let args = [];
    if (typeof process !== 'undefined' && process?.argv) {
        args = process.argv.slice(2) || [];
        if (args.length > 0 && isNaN(Number(args[0]))) {
            return null;
        }
    }
    return args[0];
}

// node main.js <number>
const args = getArgsValue();

// Default N = 100 if no argument provided
const N = Number(args) || 100;

// Run FizzBuzz from 1 to N
fizzBuzz(1, N);