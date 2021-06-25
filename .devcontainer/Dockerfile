# [Choice] Node.js version: 14, 12, 10
ARG VARIANT=14
FROM mcr.microsoft.com/vscode/devcontainers/javascript-node:0-${VARIANT}

RUN su node -c "umask 0002 && npm install -g http-server @vue/cli @vue/cli-service-global"
WORKDIR /app

EXPOSE 8080

RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
        zsh \
        vim-nox \
        python3-pip

RUN pip3 install --upgrade pip
RUN pip3 install fabric pre-commit setuptools

RUN su node -c "cd && git clone https://github.com/exhuma/dotfiles && cd dotfiles && ./install -c" 2>&1
RUN su node -c "cd ~/dotfiles && bash bootstrap_common" 2>&1
