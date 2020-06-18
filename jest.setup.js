global.console = {
	log: console.log, // console.log are ignored in tests

	// Keep native behaviour for other methods, use those to print out things in your own tests, not `console.log`
	error: console.error,
	warn: jest.fn(),
	info: jest.fn(),
	debug: console.debug,
};