/**
 * ============================================================
 * Auto-apply schema patches on server boot (idempotent)
 * ============================================================
 *
 * Mục đích: tránh tình trạng dev chạy `npm start` mà quên
 *           `npm run db:patches` → API trả 500 do thiếu cột
 *           (ví dụ: NhanVien thiếu Email/ChucVu/DiaChi/GhiChu).
 *
 * Cách hoạt động:
 *  - Mỗi lần server boot, duyệt qua danh sách file SQL trong
 *    `database/` theo thứ tự (cố định — đúng FK ordering).
 *  - Mỗi file đã được viết idempotent (IF NOT EXISTS / IF COL_LENGTH IS NULL
 *    / DROP IF EXISTS) nên chạy lại nhiều lần không lỗi.
 *  - Mặc định BẬT. Tắt bằng cách set `AUTO_MIGRATE=false` trong `.env`
 *    (vd khi muốn boot nhanh để debug, hoặc khi đã biết schema ổn).
 *
 * KHÔNG thay thế `npm run db:setup`:
 *   - `db:setup` chạy toàn bộ (DB + tables + seed + accounts + patches)
 *   - Hàm này CHỈ chạy patches, dành cho server đã có tables/seed sẵn.
 * ============================================================
 */

require('dotenv').config();
const sql = require('mssql');
const fs = require('fs');
const path = require('path');

// Danh sách file patch — thứ tự QUAN TRỌNG (FK ordering).
// Mọi file ở đây đều idempotent (xem comment đầu mỗi file .sql).
const PATCH_FILES = [
    '99_schema_patches.sql',
    '18_patch_nhanvien_profile.sql',
    '19_patch_taikhoan_mustchangepassword.sql',
    '18_system_config.sql',
];

// Build config giống src/scripts/migrate.js để đảm bảo cùng cách kết nối
function buildConfig(databaseName) {
    const config = {
        server: process.env.DB_SERVER || 'localhost',
        port: parseInt(process.env.DB_PORT) || 1433,
        options: {
            encrypt: process.env.DB_ENCRYPT === 'true',
            trustServerCertificate: true,
            enableArithAbort: true,
            connectionTimeout: 30000,
            requestTimeout: 30000,
        },
    };
    if (databaseName) config.database = databaseName;

    if (process.env.DB_TRUSTED_CONNECTION === 'true') {
        config.options.trustedConnection = true;
    } else {
        config.user = process.env.DB_USER || 'sa';
        config.password = process.env.DB_PASSWORD;
    }
    return config;
}

// Tách file SQL thành các batch theo GO (giống migrate.js để nhất quán)
function splitSqlBatches(sqlContent) {
    const cleaned = sqlContent
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .split('\n')
        .map((line) => {
            const idx = line.indexOf('--');
            return idx >= 0 ? line.substring(0, idx) : line;
        })
        .join('\n');

    return cleaned
        .split(/^\s*GO\s*$/gim)
        .map((b) => b.trim())
        .filter((b) => b.length > 0);
}

/**
 * Chạy tất cả patches idempotent.
 * KHÔNG throw — chỉ log warn/error để server vẫn boot được
 * (nếu pool connect fail, server đã được start rồi nhờ await ở dưới).
 *
 * @returns {Promise<{applied: string[], skipped: string[], failed: {file: string, error: string}[]}>}
 */
async function applyPatchesOnBoot() {
    // Cho phép tắt bằng env: AUTO_MIGRATE=false
    if (String(process.env.AUTO_MIGRATE).toLowerCase() === 'false') {
        console.log('⏭️  [auto-migrate] AUTO_MIGRATE=false — bỏ qua auto-apply patches.');
        return { applied: [], skipped: [], failed: [] };
    }

    const dbDir = path.join(__dirname, '..', '..', 'database');
    const dbName = process.env.DB_NAME || 'SecurePharmaDB';
    const result = { applied: [], skipped: [], failed: [] };

    console.log(`\n🔧 [auto-migrate] Kiểm tra schema patches (database: ${dbName})...`);

    let pool;
    try {
        pool = await sql.connect(buildConfig(dbName));
    } catch (err) {
        console.warn(`⚠️  [auto-migrate] Không kết nối được DB — bỏ qua auto-apply. Lỗi: ${err.message}`);
        return result;
    }

    try {
        for (const file of PATCH_FILES) {
            const fullPath = path.join(dbDir, file);
            if (!fs.existsSync(fullPath)) {
                console.log(`   ⏭️  ${file} — không tìm thấy, bỏ qua.`);
                result.skipped.push(file);
                continue;
            }

            const sqlContent = fs.readFileSync(fullPath, 'utf8');
            const batches = splitSqlBatches(sqlContent);

            try {
                for (let i = 0; i < batches.length; i++) {
                    const batch = batches[i];
                    if (/USE\s+SecurePharmaDB/i.test(batch)) continue;
                    await pool.request().batch(batch);
                }
                console.log(`   ✅ ${file} — đã apply (${batches.length} batch).`);
                result.applied.push(file);
            } catch (err) {
                console.warn(`   ⚠️  ${file} — lỗi: ${err.message}`);
                result.failed.push({ file, error: err.message });
                // Không throw — tiếp tục file kế tiếp để cố heal tối đa
            }
        }

        if (result.applied.length > 0) {
            console.log(`✅ [auto-migrate] Hoàn tất: applied=${result.applied.length}, skipped=${result.skipped.length}, failed=${result.failed.length}`);
        } else {
            console.log(`✅ [auto-migrate] Schema đã ổn (${result.skipped.length} file skip, ${result.failed.length} lỗi).`);
        }
    } finally {
        try { await pool.close(); } catch (_) { /* ignore */ }
    }

    return result;
}

module.exports = { applyPatchesOnBoot, PATCH_FILES };
