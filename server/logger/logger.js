const prodLogger = require('./prodLogger');
const devLogger = require('./devLogger');

let logger = null;

if (process.env.NODE_ENV === 'production') {
    logger = prodLogger();
} else {
    logger = devLogger();
}

module.exports = logger;
