FROM node:18.20.2-slim@sha256:d3c5f8b0c1e2f4a6b7e8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f

RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

RUN git clone https://github.com/HackerDjibi/Arise.git /Arise

WORKDIR /Arise

COPY package.json .

RUN npm ci --omit=dev

COPY . .



