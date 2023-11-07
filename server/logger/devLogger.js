const { format, transports, createLogger } = require('winston');
const { combine, timestamp, printf } = format;

const devFormat = printf(({ level, message,timestamp }) => {
    return `${timestamp} [${level}]  ${message}`;
});

function devLogger() {
    return createLogger({
        level: 'http',
        format: combine(
            timestamp({format:"HH:mm:ss"}),
            devFormat
        ),
        transports: [
            new transports.Console()
        ],
    });
}

module.exports = devLogger;
