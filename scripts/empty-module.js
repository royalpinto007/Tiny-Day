// Stub for dev-only modules that open a websocket back to the Metro dev server.
// An embedded (standalone) bundle has no dev server, and the real module throws
// at import time in that case, which would take the whole app down.
module.exports = {};
