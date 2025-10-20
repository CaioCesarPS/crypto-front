/* eslint-disable */
/**
 * React 19 polyfills for Jest
 * Set the React act environment flag for testing
 */

// Set the React act environment flag
globalThis.IS_REACT_ACT_ENVIRONMENT = true

// Get React module and add act if it doesn't exist
const React = require('react')

if (!React.act) {
  // Create act implementation
  React.act = function (callback) {
    const previousActEnvironment = globalThis.IS_REACT_ACT_ENVIRONMENT
    globalThis.IS_REACT_ACT_ENVIRONMENT = true

    try {
      const result = callback()

      // If the callback returns a thenable (Promise), handle it
      if (result && typeof result.then === 'function') {
        return result.then(
          (value) => {
            globalThis.IS_REACT_ACT_ENVIRONMENT = previousActEnvironment
            return value
          },
          (error) => {
            globalThis.IS_REACT_ACT_ENVIRONMENT = previousActEnvironment
            throw error
          }
        )
      }

      globalThis.IS_REACT_ACT_ENVIRONMENT = previousActEnvironment
      return result
    } catch (error) {
      globalThis.IS_REACT_ACT_ENVIRONMENT = previousActEnvironment
      throw error
    }
  }
}
