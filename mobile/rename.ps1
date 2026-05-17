Get-ChildItem -Path "m:\3-1\s-box1\mobile\src" -Recurse -Filter "*.js" | Rename-Item -NewName { $_.Name -replace '\.js$','.jsx' }
Write-Host "Done renaming files"
