/**
 * Simple abstraction of an error
 * @param {Boolean} condition
 * @param {*} [undefined] message
 * @param {*|Error} [Error] errorType
 * @returns {Boolean}
 * @throws {*|Error}
 */
exports.errorIfFalse = function errorIfFalse(
  condition,
  message,
  errorType = Error,
) {
  if (condition) {
    throw new errorType(message)
  }
  return true
}
