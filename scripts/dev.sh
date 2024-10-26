rm -rf ./build
yarn
yarn format
yarn lint
nodemon src/server.ts