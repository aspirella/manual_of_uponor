# GIF Optimization Script using PowerShell
# This script reduces GIF file size by optimizing frames and reducing quality

param(
    [string]$InputFile = "dimensions.gif",
    [string]$OutputFile = "dimensions_optimized.gif"
)

Write-Host "Starting GIF optimization..." -ForegroundColor Green
Write-Host "Input file: $InputFile"

# Get original file size
$originalSize = (Get-Item $InputFile).Length
Write-Host "Original size: $([math]::Round($originalSize/1MB,2)) MB" -ForegroundColor Yellow

# Since we don't have ImageMagick, we'll use a different approach
# We'll download and use gifsicle via PowerShell

$gifsicleUrl = "https://eternallybored.org/misc/gifsicle/releases/gifsicle-1.94-win64.zip"
$tempZip = "$env:TEMP\gifsicle.zip"
$tempDir = "$env:TEMP\gifsicle"

try {
    # Download gifsicle
    Write-Host "Downloading gifsicle..." -ForegroundColor Cyan
    Invoke-WebRequest -Uri $gifsicleUrl -OutFile $tempZip -UseBasicParsing
    
    # Extract
    Write-Host "Extracting gifsicle..." -ForegroundColor Cyan
    Expand-Archive -Path $tempZip -DestinationPath $tempDir -Force
    
    # Find gifsicle.exe
    $gifsicle = Get-ChildItem -Path $tempDir -Filter "gifsicle.exe" -Recurse | Select-Object -First 1
    
    if ($gifsicle) {
        Write-Host "Optimizing GIF with gifsicle..." -ForegroundColor Cyan
        
        # Run gifsicle with optimization
        & $gifsicle.FullName -O3 --colors 256 --lossy=30 -o $OutputFile $InputFile
        
        # Get new file size
        $newSize = (Get-Item $OutputFile).Length
        $reduction = [math]::Round((($originalSize - $newSize) / $originalSize) * 100, 2)
        
        Write-Host "`nOptimization complete!" -ForegroundColor Green
        Write-Host "New size: $([math]::Round($newSize/1MB,2)) MB" -ForegroundColor Green
        Write-Host "Size reduction: $reduction%" -ForegroundColor Green
        
        # Cleanup
        Remove-Item $tempZip -Force
        Remove-Item $tempDir -Recurse -Force
        
    } else {
        Write-Host "Error: Could not find gifsicle.exe" -ForegroundColor Red
    }
    
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}
