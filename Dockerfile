FROM --platform linux/amd64 archlinux:latest

RUN pacman -Sy \
    github-cli \
    clang \
    jdk-openjdk \
    nodejs \
  && pacman -Sc

RUN mkdir -p /runner/workspace

ENV RUNNER_OS=Linux \
  RUNNER_ARCH=x86 \
  RUNNER_NAME='runs-on: Docker: Arch Linux' \
  RUNNER_WORKSPACE=/workspace \
  GITHUB_WORKSPACE=/runner/workspace \
