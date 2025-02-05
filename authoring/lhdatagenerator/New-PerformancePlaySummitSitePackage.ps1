$ErrorActionPreference = "Stop"
$currentPath = Get-Location
$lhdatagenerator = Join-Path -Path $currentPath -ChildPath "lhdatagenerator"
$foundation = Join-Path -Path $currentPath -ChildPath "src"

Write-Host "Current Path: $currentPath"
Write-Host "lhdatagenerator Path: $lhdatagenerator"
Write-Host "foundation Path: $foundation"

if (Test-Path "artifacts.zip") {
    Remove-Item "artifacts.zip" -Recurse -Force | Out-Null
}

Write-Host "Clear git artifacts"
Set-Location $foundation
if (Test-Path ".git") {
    Remove-Item ".git" -Recurse -Force
}
Set-Location $lhdatagenerator
if (Test-Path ".git") {
    Remove-Item ".git" -Recurse -Force
}
Set-Location "$foundation/src/platform"


# Add Config file that enables performance plugin
Write-Host "Copy lhdatagenerator Artifacts into platform"
if (-not (Test-Path "App_Config")) {
    New-Item "App_Config" -ItemType Directory | Out-Null
}

if (-not (Test-Path "App_Config/Include")) {
    New-Item "App_Config/Include" -ItemType Directory | Out-Null
}

Copy-Item "$lhdatagenerator/App_Config/Include/Sitecore.Performance.LhDataGenerator.Controllers.config" "App_Config/Include"

# Update the Project File (Platform.csproj)
Write-Host "Update platform project file for lhdatagenerator"
[xml]$project = Get-Content -Path "Platform.csproj"

# Include Sitecore.Performance.LhDataGenerator.Controllers.config (Platform.csproj)
$configNode = $project.CreateElement("ItemGroup", "http://schemas.microsoft.com/developer/msbuild/2003");
$content = $project.CreateElement("Content", "http://schemas.microsoft.com/developer/msbuild/2003");
$content.SetAttribute("Include", "App_Config/Include/Sitecore.Performance.LhDataGenerator.Controllers.config")
($configNode.AppendChild($content)) | Out-Null
($project.Project.AppendChild($configNode)) | Out-Null

# Add Project References (Platform.csproj)
$projectReferenceItemNode = $project.CreateElement("ItemGroup", "http://schemas.microsoft.com/developer/msbuild/2003");
$projectReferenceNode = $project.CreateElement("ProjectReference", "http://schemas.microsoft.com/developer/msbuild/2003");
$projectReferenceNode.SetAttribute("Include", "../lhdatagenerator/Sitecore.Performance.LhDataGenerator.csproj")
$projectNode = $project.CreateElement("Project", "http://schemas.microsoft.com/developer/msbuild/2003");
$projectNode.InnerText = "{99259493-bbc0-4bee-8bb3-76cdadd338f7}"
$nameNode = $project.CreateElement("Name", "http://schemas.microsoft.com/developer/msbuild/2003");
$nameNode.InnerText = "Sitecore.Performance.LhDataGenerator"
($projectReferenceNode.AppendChild($projectNode)) | Out-Null
($projectReferenceNode.AppendChild($nameNode)) | Out-Null
($projectReferenceItemNode.AppendChild($projectReferenceNode)) | Out-Null
($project.Project.AppendChild($projectReferenceItemNode)) | Out-Null
$project.save("$currentPath/src/src/platform/Platform.csproj")
Set-Location "$foundation/src"

# Copy lhdatagenerator source into Foundation source
Write-Host "Copy lhdatagenerator project artifacts into Play Summit project"
if (-not (Test-Path ./lhdatagenerator)) {
    New-Item -Path ./lhdatagenerator -ItemType Directory | Out-Null
}
Copy-Item -Path $lhdatagenerator/* -Destination ./lhdatagenerator/ -Recurse -Force | Out-Null
Set-Location "$foundation/src/lhdatagenerator"
Set-Location $foundation

# # Add Project to the Solution (Sitecore.Demo.Edge.Website.sln)
Write-Host "Add lhdatagenerator to Play Summit solution file"
dotnet sln Sitecore.Demo.Edge.Website.sln add --in-root  src/lhdatagenerator/Sitecore.Performance.LhDataGenerator.csproj

# Update Required Packages (Packages.props)
Write-Host "Update Play Summit project packages with lhdatagenerator dependancies"
[xml]$packages = Get-Content -Path "Packages.props"
$SitecoreXmCloudMvcPackage = $packages.CreateElement("PackageReference", "http://schemas.microsoft.com/developer/msbuild/2003");
$SitecoreXmCloudMvcPackage.SetAttribute("Update", "Sitecore.XmCloud.Mvc")
$SitecoreXmCloudMvcPackage.SetAttribute("Version", "`$(PlatformVersion)")
($packages.Project.ItemGroup.AppendChild($SitecoreXmCloudMvcPackage)) | Out-Null
$packages.save("$currentPath/src/Packages.props")
Set-Location $currentPath