# ClimateVerse - PowerShell start script
Write-Host "============================================================"
Write-Host "  ClimateVerse - Simulate Today. Protect Tomorrow."
Write-Host "============================================================"

$dockerAvailable = Get-Command docker -ErrorAction SilentlyContinue

if ($dockerAvailable) {
    try {
        docker info | Out-Null
        Write-Host "[OK] Docker is available and running."
        if (-not (Test-Path ".env")) { Copy-Item ".env.example" ".env" }
        docker compose up --build -d

        Write-Host "Waiting for backend health check..."
        $tries = 0
        do {
            $tries++
            Start-Sleep -Seconds 2
            $ok = $false
            try {
                $resp = Invoke-WebRequest -Uri "http://localhost:8000/health" -UseBasicParsing -TimeoutSec 2
                if ($resp.StatusCode -eq 200) { $ok = $true }
            } catch {}
        } while (-not $ok -and $tries -lt 30)

        if ($ok) { Write-Host "[OK] Backend is healthy." } else { Write-Host "[WARN] Backend not confirmed healthy yet." }
    } catch {
        Write-Host "[WARN] Docker not running. Falling back to local mode."
        $dockerAvailable = $false
    }
}

if (-not $dockerAvailable) {
    if (-not (Test-Path "backend\.venv")) {
        Write-Host "[ERROR] Run setup.bat first to create the backend virtual environment."
        exit 1
    }
    Start-Process cmd -ArgumentList "/k cd backend && call .venv\Scripts\activate.bat && uvicorn app.main:app --host 0.0.0.0 --port 8000"
    Start-Sleep -Seconds 5
    Start-Process cmd -ArgumentList "/k cd frontend && npm run dev"
}

Write-Host ""
Write-Host "Frontend:   http://localhost:3000"
Write-Host "Backend:    http://localhost:8000"
Write-Host "API docs:   http://localhost:8000/docs"
Write-Host "Demo login: demo@climateverse.local / ClimateVerse@123"
Start-Sleep -Seconds 2
Start-Process "http://localhost:3000"
