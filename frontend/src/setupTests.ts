import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';

// Increase the default timeout
configure({ asyncUtilTimeout: 5000 });

// Suppress act() warnings
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (/Warning.*not wrapped in act/.test(args[0])) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});