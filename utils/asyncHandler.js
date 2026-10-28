// express 4 doesn't catch rejected promises from async handlers, so forward them to the error middleware
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
}

module.exports = asyncHandler
