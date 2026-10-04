<#
.SYNOPSIS
    Khởi động lại toàn bộ SecurePharma (Backend + Frontend).

.DESCRIPTION
    - Kill mọi process đang chiếm port BE (8080) và FE (4444).
    - Kill các cửa sổ BE/FE của lần chạy trước (nếu còn sót).
    - Mở 2 cửa sổ PowerShell riêng: 1 cho BE, 1 cho FE.
    - Đợi cả 2 cổng Listen sẵn sàng rồi in thông tin truy cập.
    - Ctrl+C ở cửa sổ này sẽ dừng cả 2 server.

.EXAMPLE
    .\dev.ps1
#>

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$bePort = 8080
$fePort = 4444
$beTitle = 'SecurePharma - Backend (8080)'
$feTitle = 'SecurePharma - Frontend (4444)'

# ---------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------
function Stop-Port {
    param([int]$Port)

    # Parse `netstat -ano` để bắt được cả IPv4 (0.0.0.0:PORT) lẫn IPv6 ([::]:PORT).
    # Get-NetTCPConnection trên một số bản Windows chỉ liệt kê IPv4 → dễ bỏ sót
    # socket dual-stack như của Node.js → server mới vẫn EADDRINUSE.
    $lines = & netstat.exe -ano 2>$null
    $pids  = New-Object System.Collections.Generic.HashSet[int]
    foreach ($ln in $lines) {
        if ($ln -match '^\s*TCP\s+\S+:{0}\s+\S+\s+LISTENING\s+(\d+)\s*$' -f $Port) {
            $null = $pids.Add([int]$Matches[1])
        }
    }
    foreach ($p in $pids) {
        if ($p -eq $PID) { continue }
        try {
            $proc = Get-Process -Id $p -ErrorAction Stop
            Write-Host ("  🔪 Port {0} → PID {1} ({2})" -f $Port, $p, $proc.ProcessName) -ForegroundColor Yellow
            Stop-Process -Id $p -Force -ErrorAction SilentlyContinue
        } catch {
            # Process có thể đã thoát giữa chừng, bỏ qua
        }
    }
}

function Close-Windows {
    param([string[]]$Titles)
    Get-Process powershell -ErrorAction SilentlyContinue | Where-Object {
        $t = $_.MainWindowTitle
        $Titles | Where-Object { $t -eq $_ }
    } | ForEach-Object {
        Write-Host "  🔪 Closing window: $($_.MainWindowTitle)" -ForegroundColor Yellow
        Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
    }
}

function Wait-Port {
    param([int]$Port, [int]$TimeoutSec = 45)
    for ($i = 0; $i -lt $TimeoutSec; $i++) {
        $conn = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
        if ($conn) { return $true }
        Start-Sleep -Seconds 1
    }
    return $false
}

# ---------------------------------------------------------------
# 1. Cleanup mọi thứ từ lần chạy trước
# ---------------------------------------------------------------
Write-Host ""
Write-Host "🧹 Cleaning up old BE/FE..." -ForegroundColor Cyan
Write-Host ""

Stop-Port $bePort
Stop-Port $fePort
Close-Windows @($beTitle, $feTitle)

Start-Sleep -Milliseconds 800

# ---------------------------------------------------------------
# 2. Start BE + FE trong 2 cửa sổ PowerShell riêng
# ---------------------------------------------------------------
Write-Host "🚀 Starting Backend & Frontend..." -ForegroundColor Cyan
Write-Host ""

$beCmd = "`$Host.UI.RawUI.WindowTitle='$beTitle';" +
         " Write-Host '';" +
         " Write-Host '═══ SecurePharma Backend ═══' -ForegroundColor Cyan;" +
         " npm run dev"

$feCmd = "`$Host.UI.RawUI.WindowTitle='$feTitle';" +
         " Write-Host '';" +
         " Write-Host '═══ SecurePharma Frontend ═══' -ForegroundColor Green;" +
         " npm run dev"

$beProc = Start-Process powershell `
    -ArgumentList @('-NoExit', '-Command', $beCmd) `
    -WorkingDirectory (Join-Path $root 'backend') `
    -PassThru

$feProc = Start-Process powershell `
    -ArgumentList @('-NoExit', '-Command', $feCmd) `
    -WorkingDirectory (Join-Path $root 'frontend') `
    -PassThru

# ---------------------------------------------------------------
# 3. Đợi ports sẵn sàng
# ---------------------------------------------------------------
Write-Host "⏳ Waiting for backend  on :$bePort ..." -NoNewline -ForegroundColor Gray
$beOk = Wait-Port $bePort 45
if ($beOk) { Write-Host " ready ✅" -ForegroundColor Green } else { Write-Host " TIMEOUT ❌" -ForegroundColor Red }

Write-Host "⏳ Waiting for frontend on :$fePort ..." -NoNewline -ForegroundColor Gray
$feOk = Wait-Port $fePort 45
if ($feOk) { Write-Host " ready ✅" -ForegroundColor Green } else { Write-Host " TIMEOUT ❌" -ForegroundColor Red }

# ---------------------------------------------------------------
# 4. Banner kết quả
# ---------------------------------------------------------------
Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║           SecurePharma dev environment READY          ║" -ForegroundColor Cyan
Write-Host "╠════════════════════════════════════════════════════════╣" -ForegroundColor Cyan
Write-Host "║  🌐 App:        http://localhost:$fePort                  ║" -ForegroundColor Cyan
Write-Host "║  🔌 API:        http://localhost:$bePort/api              ║" -ForegroundColor Cyan
Write-Host "║  📊 Health:     http://localhost:$bePort/api/health       ║" -ForegroundColor Cyan
Write-Host "║  👤 Demo:       admin.huong / Admin@2026               ║" -ForegroundColor Cyan
Write-Host "║                                                       ║" -ForegroundColor Cyan
Write-Host "║  • Đóng cửa sổ Backend/Frontend đang mở để tắt.       ║" -ForegroundColor Cyan
Write-Host "║  • Hoặc nhấn Ctrl+C TRONG cửa sổ này để stop cả 2.    ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

if (-not $beOk) { Write-Host "⚠️  Backend chưa lên sau 45s — xem cửa sổ Backend." -ForegroundColor Yellow }
if (-not $feOk) { Write-Host "⚠️  Frontend chưa lên sau 45s — xem cửa sổ Frontend." -ForegroundColor Yellow }

# ---------------------------------------------------------------
# 5. Cleanup khi Ctrl+C / đóng cửa sổ
# ---------------------------------------------------------------
$cleanup = {
    Write-Host ""
    Write-Host "🛑 Stopping Backend & Frontend..." -ForegroundColor Yellow
    Stop-Port $bePort
    Stop-Port $fePort
    Close-Windows @($beTitle, $feTitle)
    Write-Host "✅ Cleaned up." -ForegroundColor Green
}

# Đăng ký hook khi script kết thúc (đóng cửa sổ chính hoặc Ctrl+C)
Register-EngineEvent PowerShell.Exiting -Action $cleanup | Out-Null

try {
    while ($true) { Start-Sleep -Seconds 5 }
}
finally {
    & $cleanup
}
