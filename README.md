# Multithreaded String Search

This is a node application that searches for the string "FiCo" in an infinite stream of data.

## Prerequisites

- Node v10.5 or higher

## Making the Executable

- Run `$ npm run setup` at the project root to install dependencies and to make `./main/index.js` executable.
- If you encounter a permissions error, run `$ npm run sudoSetup` instead and input your system password.

## Running the Program

- Run `$ sakura -h` at the project root for instructions.

## Workflow

1. When running the program, it will prompt you to input an integer for a timeout (default is 60s)
1. In `main/index.js`, a new `Pool` object from `main/classes/Pool.js` is created with 10 workers pointing to the `main/workers/fico.js` to process data as well as a `Data` object to generate an infinite stream of data
1. Workers are spawned within `Wrapper`s in `main/classes/Wrapper.js` which contain the worker as well as resolve and reject functions and are kept as a map in the `workers` property of the pool
- Wrappers were made to keep the reference to the main thread since the reference to a promise is lost when passing down resolve and reject to a different thread (or worker)
1. While there are still workers working and timeout has not yet been reached, the program will continue to generate fake data and process them
1. In `main/data/Data.js`, data to be processed is in the form of a string, with a length between 100 and 10000 characters
1. In `main/index.js`, this string data is divided by the number of working workers plus 3 (since "FiCo" could exist between the data of each worker) and passed to a worker
1. Workers uses the Knuth-Morris-Pratt algorithm to search for the string "FiCo" in its given stream and returns back whether or not it was found to the parent thread
1. Workers will only report the bytes read and time elapsed if it finds "FiCo" in its stream 
1. In stdout, it will log the workers in descending order by time elapsed followed by the average bytes per millisecond

## Built With

- **Worker Threads** - to process a stream of data in parallel
- **Faker** - to generate fake data

## Author

- [**Francis Distor**](https://github.com/fdistor)
