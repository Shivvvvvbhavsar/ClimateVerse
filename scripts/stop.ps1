# ClimateVerse - PowerShell stop script
$dockerAvailable = Get-Command docker -ErrorAction SilentlyContinue
if ($dockerAvailable) {
    docker compose down
    Write-Host "[OK] Docker containers stopped."
}
Write-Host "If running in local mode, close the backend/frontend terminal windows directly."
