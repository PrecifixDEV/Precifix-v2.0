
# Script para corrigir erros de null handling nos arquivos TypeScript

$files = @(
    @{
        Path = "src\pages\cadastros\Products.tsx"
        Replacements = @(
            @{ Find = 'formatCurrency(product.price)'; Replace = 'formatCurrency(product.price || 0)' }
            @{ Find = 'formatCurrency(product.sale_price ||'; Replace = 'formatCurrency(product.sale_price ||' }
            @{ Find = 'product.stock_quantity <='; Replace = '(product.stock_quantity || 0) <=' }
        )
    },
    @{
        Path = "src\pages\cadastros\ProductFormDialog.tsx"
        Replacements = @(
            @{ Find = 'setValue(''price'', product.price)'; Replace = 'setValue(''price'', product.price || 0)' }
            @{ Find = 'setValue(''sale_price'', product.sale_price)'; Replace = 'setValue(''sale_price'', product.sale_price || 0)' }
        )
    },
    @{
        Path = "src\pages\cadastros\ProductSaleDialog.tsx"
        Replacements = @(
            @{ Find = 'setValue(''price'', product.price)'; Replace = 'setValue(''price'', product.price || 0)' }
        )
    }
)

foreach ($file in $files) {
    $filePath = $file.Path
    Write-Host "Processing: $filePath" -ForegroundColor Cyan
    
    $content = Get-Content $filePath -Raw -Encoding UTF8
    
    foreach ($replacement in $file.Replacements) {
        $content = $content -replace [regex]::Escape($replacement.Find), $replacement.Replace
    }
    
    Set-Content $filePath -Value $content -Encoding UTF8 -NoNewline
    Write-Host "  ✓ Fixed" -ForegroundColor Green
}

Write-Host "`nAll files processed!" -ForegroundColor Green
Write-Host "Run 'npm run build' to verify fixes." -ForegroundColor Yellow
