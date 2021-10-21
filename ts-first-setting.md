# 설정

## 타입 스크립트 npm 기본 설치
  * npm i --save-dev typescript ts-node ts-node-dev

  * npm i --save-dev --force ts-cleaner nodemon @types/node @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint eslint-config-standard eslint-plugin-import eslint-plugin-node eslint-plugin-promise

## 타입 스크립트 package.json
  "scripts": {
    "start": "node .",
    "build": "ts-cleaner && tsc",
    "dev:watch": "nodemon -e ts --exec 'ts-cleaner && tsc && node . || exit 1'",
    "dev": "ts-cleaner && tsc && node ."
  },

## package.json 모듈 업데이트
  * npm i -g npm-check-updates

  * ncu -u
  * npm install
