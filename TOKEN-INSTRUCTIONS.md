# Using GitHub Personal Access Token to Run Tests

To run the Solana Crash Game tests in a cloud environment, follow these steps:

## 1. Create a GitHub Personal Access Token (if you don't have one)

1. Go to GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens
2. Click "Generate new token"
3. Give it a name like "Solana Crash Game Test"
4. Set expiration as needed
5. Select the scope "repo" (Full control of private repositories)
6. Generate token and copy it

## 2. Run the Repository Creation Script

With your token, you can run the script to create a GitHub repository and push the code:

```powershell
# From the crash_game directory
./create-repo.ps1 -Token "your_github_token_here"
```

This will:
- Create a new public GitHub repository
- Push all code to that repository
- Update the Gitpod link in the README

## 3. Open in Gitpod

Once the script completes successfully, it will output a Gitpod link. Click that link to:

1. Automatically spin up a cloud environment with all required tools
2. Build the Solana program
3. Run the tests

The Gitpod environment will show the test results in the terminal, and you'll be able to see your program running with actual test execution logs.

## Alternative: Run Manually

If you prefer not to use the script, you can:

1. Create a GitHub repository manually
2. Connect it to your local repository:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git
   git push -u origin master
   ```
3. Open in Gitpod by visiting: `https://gitpod.io/#https://github.com/YOUR_USERNAME/REPO_NAME` 