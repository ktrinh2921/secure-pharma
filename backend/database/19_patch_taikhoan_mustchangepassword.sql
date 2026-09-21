-- ============================================================
-- 19_patch_taikhoan_mustchangepassword.sql
-- Thêm cột TaiKhoan.MustChangePassword
-- ============================================================
-- Nghiệp vụ: NV mới được cấp tài khoản (tạo NV + cấp TK, hoặc Admin cấp TK cho
-- NV đã có, hoặc Admin reset mật khẩu) sẽ có MustChangePassword = 1 → middleware
-- auth yêu cầu NV phải đổi mật khẩu ở lần đăng nhập đầu tiên.
--
-- Bug gặp phải: service tạo NV + tài khoản insert cột này nhưng schema gốc
-- (01_create_tables.sql) không có → 500 Invalid column name 'MustChangePassword'.
--
-- Idempotent: IF COL_LENGTH IS NULL.
-- ============================================================

SET NOCOUNT ON;
SET XACT_ABORT ON;
GO

USE SecurePharmaDB;
GO

IF COL_LENGTH('TaiKhoan', 'MustChangePassword') IS NULL
BEGIN
    ALTER TABLE TaiKhoan
    ADD MustChangePassword BIT NOT NULL
        CONSTRAINT DF_TaiKhoan_MustChangePassword DEFAULT 0;
    PRINT '[19] Added TaiKhoan.MustChangePassword';
END
ELSE
BEGIN
    PRINT '[19] TaiKhoan.MustChangePassword already exists';
END
GO

PRINT '[19] Patch applied.';
GO
