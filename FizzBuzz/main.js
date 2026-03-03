const getFizzBuzz = (number) => {
    let result = '';
    if (number % 3 === 0) result += 'Fizz';
    if (number % 5 === 0) result += 'Buzz';
    return result || number;
};

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
for (let i = 1; i <= N; i++) {
    console.log(getFizzBuzz(i));
}