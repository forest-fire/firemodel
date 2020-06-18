module.exports = {
  testMatch: ["**/test/?(*-)+(spec|test).[jt]s?(x)"],
  transform: {
    // '(universal-fire|@forest-fire).+\\.js$': 'babel-jest',
    '^.+\\.tsx?$': 'ts-jest',
  },
  transformIgnorePatterns: [
    // '<rootDir>/node_modules/(?!(universal-fire|@forest-fire)).+\\.js$',
  ],
  moduleNameMapper: {
    // '^universal-fire$': '<rootDir>/node_modules/universal-fire/dist/es/index.js',
    // '^@forest-fire/firestore-client$': '<rootDir>/node_modules/@forest-fire/firestore-client/dist/es/index.js',
    // '^@forest-fire/firestore-admin$': '<rootDir>/node_modules/@forest-fire/firestore-admin/dist/es/index.js',
    // '^@forest-fire/real-time-client$': '<rootDir>/node_modules/@forest-fire/real-time-client/dist/es/index.js',
    // '^@forest-fire/real-time-admin$': '<rootDir>/node_modules/@forest-fire/real-time-admin/dist/es/index.js',
  },
  setupFilesAfterEnv: ['jest-extended', '<rootDir>/jest.setup.js'],
  testEnvironment: 'node',
};