#!/usr/bin/env bash
set -euo pipefail

SERVICE_NAME="luana-bot.service"
TARGET_DIR="/opt/luana-bot"

echo "Instalando serviço do Luana Bot em $TARGET_DIR"
sudo mkdir -p "$TARGET_DIR"
sudo cp -r "$(dirname "$0")/.."/* "$TARGET_DIR"/
sudo cp "$(dirname "$0")/$SERVICE_NAME" /etc/systemd/system/

echo "Recarregando systemd e habilitando serviço"
sudo systemctl daemon-reload
sudo systemctl enable luana-bot.service
sudo systemctl start luana-bot.service

echo "Serviço instalado e iniciado. Verifique com: sudo systemctl status luana-bot.service"