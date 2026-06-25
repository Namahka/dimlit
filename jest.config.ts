import type { Config } from 'jest'

const config: Config = {
  testEnvironment: 'jsdom',
  setupFilesAfterEach: ['<rootDir>/jest.setup.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: { jsx: 'react-jsx', esModuleInterop: true }
    }],
  },
  moduleNameMapper: {
    '\\.(css|less|scss)$': '<rootDir>/src/__tests__/__mocks__/fileMock.ts',
    '^firebase/(.*)$': '<rootDir>/src/__tests__/__mocks__/firebase.ts',
    '^../../infrastructure/firebase/firebaseApp$': '<rootDir>/src/__tests__/__mocks__/firebase.ts',
    '^../../../infrastructure/firebase/firebaseApp$': '<rootDir>/src/__tests__/__mocks__/firebase.ts',
  },
  testMatch: ['<rootDir>/src/__tests__/**/*.test.ts', '<rootDir>/src/__tests__/**/*.test.tsx'],
}

export default config
