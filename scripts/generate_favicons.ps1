Add-Type -AssemblyName System.Drawing

$projectRoot = "d:\spices-ecom\malabar-coast-spices-website"
$srcPath = Join-Path $projectRoot "public\images\logo.jpeg"
$publicDir = Join-Path $projectRoot "public"
$appDir = Join-Path $projectRoot "src\app"

if (-not (Test-Path $srcPath)) {
    Write-Error "Source image not found: $srcPath"
    exit 1
}

# Load source image into memory
$srcBytes = [System.IO.File]::ReadAllBytes($srcPath)
$ms = New-Object System.IO.MemoryStream($srcBytes, 0, $srcBytes.Length)
$src = [System.Drawing.Bitmap]::FromStream($ms)

# Clone image to remove the text "spicewizz" seamlessly using background texture
$cleanBmp = New-Object System.Drawing.Bitmap($src.Width, $src.Height)
$gClean = [System.Drawing.Graphics]::FromImage($cleanBmp)
$gClean.DrawImage($src, 0, 0, $src.Width, $src.Height)

# Texture patch from bottom (Y=800..950) over text area (Y=625..775)
$srcRect = New-Object System.Drawing.Rectangle(250, 800, 700, 150)
$destRect = New-Object System.Drawing.Rectangle(250, 625, 700, 150)
$gClean.DrawImage($src, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
$gClean.Dispose()

# Symbol center: X=555.5, Y=524. Symbol size: 241x172.
# 350x350 crop provides a balanced, centered framing for icons
$cropSize = 350
$cropX = [int](555.5 - ($cropSize / 2)) # 380
$cropY = [int](524 - ($cropSize / 2))   # 349

$masterRect = New-Object System.Drawing.Rectangle($cropX, $cropY, $cropSize, $cropSize)

# Master 512x512 icon
$master512 = New-Object System.Drawing.Bitmap(512, 512)
$g512 = [System.Drawing.Graphics]::FromImage($master512)
$g512.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g512.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g512.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$g512.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

$g512.DrawImage($cleanBmp, (New-Object System.Drawing.Rectangle(0, 0, 512, 512)), $masterRect, [System.Drawing.GraphicsUnit]::Pixel)
$g512.Dispose()

# Function to save resized PNG
function Save-ResizedPng($srcBitmap, $width, $height, $outFilePath) {
    $dest = New-Object System.Drawing.Bitmap($width, $height)
    $g = [System.Drawing.Graphics]::FromImage($dest)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

    $g.DrawImage($srcBitmap, 0, 0, $width, $height)
    $g.Dispose()

    $dest.Save($outFilePath, [System.Drawing.Imaging.ImageFormat]::Png)
    $dest.Dispose()
    Write-Host "Created $outFilePath ($width x $height)"
}

# Generate all standard sizes
Save-ResizedPng $master512 16 16 (Join-Path $publicDir "favicon-16x16.png")
Save-ResizedPng $master512 32 32 (Join-Path $publicDir "favicon-32x32.png")
Save-ResizedPng $master512 48 48 (Join-Path $publicDir "favicon-48x48.png")
Save-ResizedPng $master512 180 180 (Join-Path $publicDir "apple-touch-icon.png")
Save-ResizedPng $master512 192 192 (Join-Path $publicDir "icon-192.png")
Save-ResizedPng $master512 512 512 (Join-Path $publicDir "icon-512.png")

# Also save Next.js App Router specific standard icon files
Save-ResizedPng $master512 512 512 (Join-Path $appDir "icon.png")
Save-ResizedPng $master512 180 180 (Join-Path $appDir "apple-icon.png")

$master512.Dispose()
$cleanBmp.Dispose()
$src.Dispose()
$ms.Dispose()

Write-Host "All PNG icon assets generated successfully!"
