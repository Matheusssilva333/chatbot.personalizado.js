param(
  [string]$ProjectPath = "$PSScriptRoot\..",
  [string]$TaskName = "LuanaBotAutoStart"
)

$nodePath = (Get-Command node).Source
if (-not $nodePath) { Write-Error "Node.js não encontrado no PATH."; exit 1 }

$startScript = Join-Path -Path $ProjectPath -ChildPath "scripts/start.js"
if (-not (Test-Path $startScript)) { Write-Error "Arquivo start.js não encontrado: $startScript"; exit 1 }

$action = New-ScheduledTaskAction -Execute $nodePath -Argument $startScript -WorkingDirectory $ProjectPath
$trigger = New-ScheduledTaskTrigger -AtLogOn
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -StartWhenAvailable -MultipleInstances Parallel

try {
  Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger -Settings $settings -Description "Inicialização automática do Luana Bot" -Force
  Write-Output "Tarefa agendada criada: $TaskName"
} catch {
  Write-Error "Falha ao registrar tarefa agendada: $_"
}