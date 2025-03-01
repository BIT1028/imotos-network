# 推送代码到GitHub的脚本
# 使用方法: 
# 1. 修改下面的GitHub用户名和仓库名
# 2. 右键点击此文件，选择"使用PowerShell运行"

# 设置GitHub用户名和仓库名
$GITHUB_USERNAME = "GIT1028"  # 替换为您的GitHub用户名
$REPO_NAME = "imotos-network"

# 确认设置
Write-Host "准备推送到GitHub仓库: https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"
$confirm = Read-Host "是否继续? (y/n)"

if ($confirm -ne "y") {
    Write-Host "操作已取消"
    exit
}

# 添加远程仓库
Write-Host "添加GitHub远程仓库..."
git remote add origin "https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"

# 推送代码
Write-Host "推送代码到GitHub..."
git push -u origin main

Write-Host "完成!"
Write-Host "现在可以在 https://github.com/$GITHUB_USERNAME/$REPO_NAME 查看您的代码"
Write-Host "按任意键退出..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 