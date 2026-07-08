const app = require('./app');
const logger = require('./config/logger');
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => { logger.info(`Server on port ${PORT}`); console.log(`🚀 http://localhost:${PORT}`); });
process.on('unhandledRejection', (err) => { logger.error('Unhandled:', err); process.exit(1); });