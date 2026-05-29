#!/bin/bash
set -e

SSH_ALIAS="server"            
REMOTE_DIR="/home/www/project/react"        # 服务器上 Nginx 静态文件目录
PROJECT_DIR="$(pwd)"              # 当前项目目录（脚本执行路径）

echo "构建前端项目..."
npm run build

echo "同步构建产物到服务器 ${SSH_ALIAS}:${REMOTE_DIR} ..."
rsync -avzi --delete  ./dist/ --rsync-path='sudo rsync' "${SSH_ALIAS}:${REMOTE_DIR}/"

echo "重启 Nginx 服务..."
ssh ${SSH_ALIAS} "sudo systemctl restart nginx"

echo "部署完成"