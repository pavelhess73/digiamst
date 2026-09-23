# Web Server & REST API pro Erasmus+ Amsterdam 2027 (ZŠ MOLEKULA)
param (
    [int]$port = 8080
)

$ADMIN_PASSWORD = "molekula2027"
$ADMIN_TOKEN = "admin_molekula_secret_token_2027"
$DATA_FILE = Join-Path $PSScriptRoot "data\applications.json"

# Ujisti se, ze slozka data existuje
$dataDir = Split-Path $DATA_FILE
if (!(Test-Path $dataDir)) {
    New-Item -ItemType Directory -Path $dataDir -Force | Out-Null
}
if (!(Test-Path $DATA_FILE)) {
    "[]" | Out-File -FilePath $DATA_FILE -Encoding utf8
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Prefixes.Add("http://127.0.0.1:$port/")

try {
    $listener.Start()
    Write-Host "=========================================================="
    Write-Host " Erasmus+ ZS MOLEKULA Server & REST API spusten!"
    Write-Host " URL: http://localhost:$port/"
    Write-Host " Administrace: http://localhost:$port/admin.html"
    Write-Host "=========================================================="
} catch {
    Write-Error "Nelze spustit server: $_"
    exit 1
}

$mimeTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".htm"  = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".svg"  = "image/svg+xml"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".ico"  = "image/x-icon"
}

function Send-JsonResponse($response, [int]$statusCode, $obj) {
    try {
        $json = $obj | ConvertTo-Json -Depth 10 -Compress
        [byte[]]$buffer = [System.Text.Encoding]::UTF8.GetBytes($json)
        $response.StatusCode = $statusCode
        $response.ContentType = "application/json; charset=utf-8"
        $response.SendChunked = $false
        $response.ContentLength64 = $buffer.Length
        $response.Headers.Add("Access-Control-Allow-Origin", "*")
        $response.Headers.Add("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS")
        $response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, Authorization")
        $response.OutputStream.Write($buffer, 0, $buffer.Length)
        $response.OutputStream.Flush()
    } catch {
        Write-Warning "Chyba pri odesilani JSON odpovedi: $_"
    } finally {
        try { $response.Close() } catch {}
    }
}

function Read-RequestBody($request) {
    try {
        $reader = New-Object System.IO.StreamReader($request.InputStream, $request.ContentEncoding)
        $body = $reader.ReadToEnd()
        $reader.Close()
        return $body
    } catch {
        return ""
    }
}

function Get-Applications() {
    try {
        if (Test-Path $DATA_FILE) {
            $raw = Get-Content -Path $DATA_FILE -Raw -Encoding utf8
            if ([string]::IsNullOrWhiteSpace($raw)) { return @() }
            $data = $raw | ConvertFrom-Json
            if ($data -isnot [System.Array]) {
                if ($data -eq $null) { return @() }
                return @($data)
            }
            return $data
        }
        return @()
    } catch {
        Write-Warning "Chyba pri cteni databaze: $_"
        return @()
    }
}

function Save-Applications($apps) {
    try {
        $json = $apps | ConvertTo-Json -Depth 10
        [System.IO.File]::WriteAllText($DATA_FILE, $json, [System.Text.Encoding]::UTF8)
        return $true
    } catch {
        Write-Warning "Chyba pri zapisu do databaze: $_"
        return $false
    }
}

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $method = $request.HttpMethod.ToUpper()
        $path = $request.Url.LocalPath

        # Handle CORS preflight
        if ($method -eq "OPTIONS") {
            $response.StatusCode = 204
            $response.Headers.Add("Access-Control-Allow-Origin", "*")
            $response.Headers.Add("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS")
            $response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, Authorization")
            $response.Close()
            continue
        }

        # ----------------------------------------------------------------------
        # REST API ROUTING
        # ----------------------------------------------------------------------
        if ($path.StartsWith("/api/")) {
            
            # 1. POST /api/login - overeni admin hesla
            if ($path -eq "/api/login" -and $method -eq "POST") {
                $body = Read-RequestBody $request
                $payload = $body | ConvertFrom-Json
                if ($payload.password -eq $ADMIN_PASSWORD) {
                    Send-JsonResponse $response 200 @{
                        success = $true
                        token   = $ADMIN_TOKEN
                        message = "Prihlaseni do administrace probehlo uspesne."
                    }
                } else {
                    Send-JsonResponse $response 401 @{
                        success = $false
                        error   = "Nespravne administratorske heslo."
                    }
                }
                continue
            }

            # 2. POST /api/register - nova prihlaska z landing page
            if ($path -eq "/api/register" -and $method -eq "POST") {
                $body = Read-RequestBody $request
                if ([string]::IsNullOrWhiteSpace($body)) {
                    Send-JsonResponse $response 400 @{ success = $false; error = "Prazdne telo pozadavku." }
                    continue
                }

                $payload = $body | ConvertFrom-Json
                if ([string]::IsNullOrWhiteSpace($payload.studentName) -or [string]::IsNullOrWhiteSpace($payload.parentEmail)) {
                    Send-JsonResponse $response 400 @{ success = $false; error = "Jmeno zaka i e-mail rodice jsou povinne." }
                    continue
                }

                $apps = @(Get-Applications)
                $randomCode = Get-Random -Minimum 1000 -Maximum 9999
                $cleanClass = if ($payload.studentClass) { ($payload.studentClass -replace '\.', '').ToUpper() } else { "ZAK" }
                $newId = "AMS-2027-$cleanClass-$randomCode"

                $newApp = [PSCustomObject]@{
                    id           = $newId
                    createdAt    = (Get-Date).ToUniversalTime().ToString("o")
                    studentName  = $payload.studentName.Trim()
                    studentClass = if ($payload.studentClass) { $payload.studentClass.Trim() } else { "" }
                    parentEmail  = $payload.parentEmail.Trim()
                    parentPhone  = if ($payload.parentPhone) { $payload.parentPhone.Trim() } else { "" }
                    motivation   = if ($payload.motivation) { $payload.motivation.Trim() } else { "" }
                    status       = "Nová"
                    notes        = ""
                }

                $apps = @($newApp) + $apps
                $saved = Save-Applications $apps

                if ($saved) {
                    Send-JsonResponse $response 201 @{
                        success = $true
                        id      = $newId
                        message = "Prihlaska byla uspesne ulozena do databaze."
                        data    = $newApp
                    }
                } else {
                    Send-JsonResponse $response 500 @{ success = $false; error = "Chyba pri ukladani do databaze." }
                }
                continue
            }

            # 3. GET /api/applications - ziskani vsech prihlasek
            if ($path -eq "/api/applications" -and $method -eq "GET") {
                $apps = Get-Applications
                Send-JsonResponse $response 200 @{
                    success = $true
                    count   = $apps.Count
                    data    = $apps
                }
                continue
            }

            # 4. PATCH /api/applications - zmena stavu nebo poznamky
            if ($path -eq "/api/applications" -and $method -eq "PATCH") {
                $body = Read-RequestBody $request
                $payload = $body | ConvertFrom-Json
                $targetId = $payload.id

                if ([string]::IsNullOrWhiteSpace($targetId)) {
                    Send-JsonResponse $response 400 @{ success = $false; error = "Nebylo predano ID prihlasky." }
                    continue
                }

                $apps = @(Get-Applications)
                $found = $false
                foreach ($item in $apps) {
                    if ($item.id -eq $targetId) {
                        if ($payload.status) { $item.status = $payload.status }
                        if ($payload.notes -ne $null) { $item.notes = $payload.notes }
                        $found = $true
                        break
                    }
                }

                if ($found) {
                    Save-Applications $apps
                    Send-JsonResponse $response 200 @{
                        success = $true
                        message = "Zaznam byl uspesne aktualizovan."
                    }
                } else {
                    Send-JsonResponse $response 404 @{
                        success = $false
                        error   = "Prihlaska s ID $targetId nebyla nalezena."
                    }
                }
                continue
            }

            # 5. DELETE /api/applications - smazani prihlasky
            if ($path -eq "/api/applications" -and $method -eq "DELETE") {
                $body = Read-RequestBody $request
                $payload = $body | ConvertFrom-Json
                $targetId = $payload.id

                if ([string]::IsNullOrWhiteSpace($targetId)) {
                    Send-JsonResponse $response 400 @{ success = $false; error = "Nebylo predano ID prihlasky ke smazani." }
                    continue
                }

                $apps = @(Get-Applications)
                $newApps = @($apps | Where-Object { $_.id -ne $targetId })

                if ($newApps.Count -lt $apps.Count) {
                    Save-Applications $newApps
                    Send-JsonResponse $response 200 @{
                        success = $true
                        message = "Prihlaska $targetId byla smazana."
                    }
                } else {
                    Send-JsonResponse $response 404 @{
                        success = $false
                        error   = "Prihlaska s ID $targetId nebyla nalezena."
                    }
                }
                continue
            }

            # 6. GET /api/export - export do CSV pro Excel s UTF-8 BOM
            if ($path -eq "/api/export" -and $method -eq "GET") {
                $apps = Get-Applications
                $csvHeader = "ID;Datum odeslani;Jmeno zaka;Trida;Email rodice;Telefon rodice;Stav prihlasky;Motivace;Interni poznamka"
                $csvLines = @($csvHeader)

                foreach ($a in $apps) {
                    $cMotiv = if ($a.motivation) { $a.motivation -replace ';', ',' -replace "`r`n", " " -replace "`n", " " } else { "" }
                    $cNotes = if ($a.notes) { $a.notes -replace ';', ',' -replace "`r`n", " " -replace "`n", " " } else { "" }
                    $line = "$($a.id);$($a.createdAt);$($a.studentName);$($a.studentClass);$($a.parentEmail);$($a.parentPhone);$($a.status);""$cMotiv"";""$cNotes"""
                    $csvLines += $line
                }

                $csvContent = $csvLines -join "`r`n"
                
                # UTF-8 with BOM byte prefix for Excel compatibility
                $bom = [System.Text.Encoding]::UTF8.GetPreamble()
                $bodyBytes = [System.Text.Encoding]::UTF8.GetBytes($csvContent)
                [byte[]]$fullBytes = $bom + $bodyBytes

                $response.StatusCode = 200
                $response.ContentType = "text/csv; charset=utf-8"
                $response.SendChunked = $false
                $response.ContentLength64 = $fullBytes.Length
                $response.Headers.Add("Content-Disposition", "attachment; filename=`"prihlasky_amsterdam_2027.csv`"")
                $response.Headers.Add("Access-Control-Allow-Origin", "*")
                $response.OutputStream.Write($fullBytes, 0, $fullBytes.Length)
                $response.OutputStream.Flush()
                $response.Close()
                continue
            }

            # Neznama API routa
            Send-JsonResponse $response 404 @{ success = $false; error = "Neznama API cesta." }
            continue
        }

        # ----------------------------------------------------------------------
        # STATIC FILES ROUTING
        # ----------------------------------------------------------------------
        $relPath = $path.TrimStart('/')
        if ([string]::IsNullOrWhiteSpace($relPath)) {
            $relPath = "index.html"
        }
        $fullPath = Join-Path $PSScriptRoot $relPath

        if (Test-Path $fullPath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($fullPath).ToLower()
            $mime = if ($mimeTypes.ContainsKey($ext)) { $mimeTypes[$ext] } else { "application/octet-stream" }
            [byte[]]$bytes = [System.IO.File]::ReadAllBytes($fullPath)
            
            $response.StatusCode = 200
            $response.ContentType = $mime
            $response.SendChunked = $false
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
            $response.OutputStream.Flush()
        } else {
            $response.StatusCode = 404
            $msg = [System.Text.Encoding]::UTF8.GetBytes("404 Nenalezeno: $relPath")
            $response.ContentType = "text/plain; charset=utf-8"
            $response.SendChunked = $false
            $response.ContentLength64 = $msg.Length
            $response.OutputStream.Write($msg, 0, $msg.Length)
            $response.OutputStream.Flush()
        }
        $response.Close()

    } catch {
        Write-Warning "Chyba pozadavku: $_"
        if ($context -and $context.Response) {
            try { $context.Response.Close() } catch {}
        }
    }
}
