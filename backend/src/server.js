/**
 * Server Entry Point
 */
require('dotenv').config();
const app = require('./app');
const db = require('./config/db');
const { applyPatchesOnBoot } = require('./config/autoMigrate');

const PORT = process.env.PORT || 8080;
// HOST mặc định `0.0.0.0` để máy khác trong cùng mạng LAN truy cập được
// (đổi thành `localhost` nếu muốn giới hạn chỉ máy này).
const HOST = process.env.HOST || '0.0.0.0';

// Start server
async function startServer() {
    try {
        // Test database connection
        console.log('🔄 Connecting to database...');
        const dbConnected = await db.testConnection();

        if (!dbConnected) {
            console.warn('⚠️  Database connection failed. Server will start but database features may not work.');
        } else {
            // DB OK → auto-apply schema patches (idempotent, không block boot nếu lỗi).
            // Tránh tình trạng: dev quên `npm run db:patches` → API trả 500 do thiếu cột.
            // Tắt bằng AUTO_MIGRATE=false trong .env.
            await applyPatchesOnBoot();
        }
        
        // Start Express server
        const host = `http://localhost:${PORT}`;
        // Lấy IP LAN để in banner (nếu lỗi thì fallback '0.0.0.0')
        const os = require('os');
        const lanIp = (() => {
            try {
                const ifaces = os.networkInterfaces();
                for (const name of Object.keys(ifaces)) {
                    for (const i of ifaces[name]) {
                        if (i.family === 'IPv4' && !i.internal) return i.address;
                    }
                }
            } catch (_) { /* ignore */ }
            return '0.0.0.0';
        })();
        const lanUrl = `http://${lanIp}:${PORT}`;
        app.listen(PORT, HOST, () => {
            console.log('');
            console.log('╔══════════════════════════════════════════════════════════════╗');
            console.log('║           SecurePharma Backend Server                      ║');
            console.log('╠══════════════════════════════════════════════════════════════╣');
            console.log(`║  🌐 Local:           ${host.padEnd(38)}║`);
            console.log(`║  🌐 Network (LAN):   ${lanUrl.padEnd(38)}║`);
            console.log(`║  📊 Health check:      ${(host + '/api/health').padEnd(38)}║`);
            console.log(`║  📖 API Docs (Swagger): ${(host + '/api/docs').padEnd(36)}║`);
            console.log(`║  📄 OpenAPI JSON spec:  ${(host + '/api/docs.json').padEnd(35)}║`);
            console.log(`║  🔧 Environment:       ${(process.env.NODE_ENV || 'development').padEnd(28)}║`);
            console.log('╚══════════════════════════════════════════════════════════════╝');
            console.log('');
        });
    } catch (err) {
        console.error('❌ Failed to start server:', err.message);
        process.exit(1);
    }
}

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    await db.closePool();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('SIGINT received. Shutting down gracefully...');
    await db.closePool();
    process.exit(0);
});

// Start the server
startServer();
