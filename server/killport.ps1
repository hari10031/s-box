$connections = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
foreach ($c in $connections) {
    Stop-Process -Id $c.OwningProcess -Force -ErrorAction SilentlyContinue
}
Write-Host "Done"
