param(
  [Parameter(Mandatory = $false)]
  [string]$PostgresPassword,

  [string]$PostgresUser = "postgres",
  [string]$DbHost = "localhost",
  [int]$Port = 5432,
  [string]$AppUser = "taljamom",
  [string]$AppPassword = "taljamom",
  [string]$Database = "taljamom"
)

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $projectRoot

function Find-Psql {
  $candidates = @(
    "C:\Program Files\PostgreSQL\18\bin\psql.exe",
    "C:\Program Files\PostgreSQL\17\bin\psql.exe",
    "C:\Program Files\PostgreSQL\16\bin\psql.exe"
  )

  foreach ($candidate in $candidates) {
    if (Test-Path $candidate) {
      return $candidate
    }
  }

  $fromPath = Get-Command psql -ErrorAction SilentlyContinue
  if ($fromPath) {
    return $fromPath.Source
  }

  throw "psql.exe not found. Install PostgreSQL or Docker Desktop."
}

function Invoke-Psql {
  param(
    [string]$Sql,
    [string]$DatabaseName = "postgres"
  )

  & $psql `
    -U $PostgresUser `
    -h $DbHost `
    -p $Port `
    -d $DatabaseName `
    -v ON_ERROR_STOP=1 `
    -c $Sql
}

if (-not $PostgresPassword) {
  $secure = Read-Host "Enter PostgreSQL password for user '$PostgresUser'" -AsSecureString
  $PostgresPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
  )
}

$psql = Find-Psql
$env:PGPASSWORD = $PostgresPassword

Write-Host "Using psql: $psql"
Write-Host "Creating role and database '$Database'..."

try {
  Invoke-Psql -Sql "CREATE ROLE $AppUser WITH LOGIN PASSWORD '$AppPassword';"
} catch {
  Write-Host "Role '$AppUser' already exists, continuing."
}

try {
  Invoke-Psql -Sql "CREATE DATABASE $Database OWNER $AppUser;"
} catch {
  Write-Host "Database '$Database' already exists, continuing."
}

Invoke-Psql -Sql "GRANT ALL PRIVILEGES ON DATABASE $Database TO $AppUser;" | Out-Null
Invoke-Psql -Sql "ALTER DATABASE $Database OWNER TO $AppUser;" | Out-Null

Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue

function Invoke-Npm {
  param([string]$ScriptName)

  npm run $ScriptName
  if ($LASTEXITCODE -ne 0) {
    throw "Command 'npm run $ScriptName' failed with exit code $LASTEXITCODE"
  }
}

Write-Host "Resetting failed migration state (if any)..."
$env:PGPASSWORD = $AppPassword
try {
  Invoke-Psql -DatabaseName $Database -Sql "DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public; GRANT ALL ON SCHEMA public TO $AppUser; GRANT ALL ON SCHEMA public TO public;"
} finally {
  Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
}

Write-Host "Running Prisma migrations..."
Invoke-Npm "db:migrate:deploy"

Write-Host "Seeding database..."
Invoke-Npm "db:seed"

Write-Host ""
Write-Host "Done. Local database is ready."
Write-Host "DATABASE_URL=postgresql://${AppUser}:${AppPassword}@${DbHost}:${Port}/${Database}?schema=public"
