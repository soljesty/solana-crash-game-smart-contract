# Script to create a GitHub repo and push code
# Requires a GitHub Personal Access Token with 'repo' scope

param(
    [Parameter(Mandatory=$true)]
    [string]$Token,
    
    [Parameter(Mandatory=$false)]
    [string]$RepoName = "solana-crash-game"
)

# Create GitHub repository
$headers = @{
    Authorization = "token $Token"
    Accept = "application/vnd.github.v3+json"
}

$body = @{
    name = $RepoName
    description = "Solana Crash Game smart contract with Anchor framework"
    private = $false
    has_issues = $true
    has_projects = $true
    has_wiki = $true
} | ConvertTo-Json

Write-Host "Creating GitHub repository: $RepoName"
try {
    $response = Invoke-RestMethod -Uri "https://api.github.com/user/repos" -Method Post -Headers $headers -Body $body -ContentType "application/json"
    $repoUrl = $response.html_url
    Write-Host "Repository created: $repoUrl"
    
    # Set git remote and push
    git remote add origin "https://$Token@github.com/$($response.full_name).git"
    git push -u origin master
    
    # Update README-GITPOD.md with correct repo URL
    $gitpodContent = Get-Content "README-GITPOD.md" -Raw
    $gitpodContent = $gitpodContent -replace "https://gitpod.io/#https://github.com/YOUR_USERNAME/crash-game", "https://gitpod.io/#$repoUrl"
    $gitpodContent | Set-Content "README-GITPOD.md"
    
    # Commit and push the updated README
    git add README-GITPOD.md
    git commit -m "Update Gitpod link with correct repository URL"
    git push
    
    Write-Host "Code pushed to GitHub. Your repository is ready!"
    Write-Host "Gitpod link: https://gitpod.io/#$repoUrl"
} catch {
    Write-Host "Error creating repository: $_"
} 