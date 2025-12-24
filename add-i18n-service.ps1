#!/usr/bin/env pwsh
# Script para agregar I18nFieldService a múltiples componentes TypeScript

$componentsToUpdate = @(
    "c:\Users\MI PC\Documents\dev\TourYa\tourya-front\src\app\pages\providers\tours\tour-details\tour-details.component.ts",
    "c:\Users\MI PC\Documents\dev\TourYa\tourya-front\src\app\pages\providers\provider-reviews\provider-reviews.component.ts",
    "c:\Users\MI PC\Documents\dev\TourYa\tourya-front\src\app\pages\clients\tours-detail\tours-detail.component.ts",
    "c:\Users\MI PC\Documents\dev\TourYa\tourya-front\src\app\pages\clients\list-tours\tour-grid-view\tour-grid-view.component.ts",
    "c:\Users\MI PC\Documents\dev\TourYa\tourya-front\src\app\pages\clients\list-tours\tour-list-view\tour-list-view.component.ts",
    "c:\Users\MI PC\Documents\dev\TourYa\tourya-front\src\app\pages\clients\cart-summary\cart-summary.component.ts",
    "c:\Users\MI PC\Documents\dev\TourYa\tourya-front\src\app\shared\common\floating-cart\floating-cart.component.ts"
)

Write-Host "Actualizando componentes con I18nFieldService..." -ForegroundColor Green

foreach ($file in $componentsToUpdate) {
    if (Test-Path $file) {
        Write-Host "Procesando: $file" -ForegroundColor Yellow
        
        # Leer contenido
        $content = Get-Content $file -Raw
        
        # Verificar si ya tiene el import
        if ($content -notmatch "I18nFieldService") {
            Write-Host "  - Agregando import y servicio" -ForegroundColor Cyan
            
            # Agregar import (buscar último import y agregar después)
            $content = $content -replace "(import.*from.*;\r?\n)([\r\n]*@Component)", "`$1import { I18nFieldService } from '../../../shared/services/i18n-field.service';`$2"
            
            # Agregar al constructor (buscar constructor y agregar parámetro)
            $content = $content -replace "(\s+constructor\([^)]*)([\s]*\))", "`$1,`n    public i18nService: I18nFieldService`$2"
            
            # Guardar
            Set-Content -Path $file -Value $content -NoNewline
            Write-Host "  ✓ Actualizado" -ForegroundColor Green
        } else {
            Write-Host "  - Ya tiene I18nFieldService" -ForegroundColor Gray
        }
    } else {
        Write-Host "  ✗ Archivo no encontrado: $file" -ForegroundColor Red
    }
}

Write-Host "`nProceso completado!" -ForegroundColor Green
