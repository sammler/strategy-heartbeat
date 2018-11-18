ARG NODE_VER="10.9.0"
ARG PORT=3101
ARG HOME_DIR="/opt/strategy-heartbeat"

## -------------------------------------------------------------------
##                            BASE IMAGE
## -------------------------------------------------------------------
FROM node:${NODE_VER}-alpine as BASE

ARG PORT
ARG HOME_DIR
ENV port=$PORT

# Enables colored output
ENV FORCE_COLOR=true

ENV HOME=$HOME_DIR
RUN mkdir -p $HOME
WORKDIR $HOME

COPY package.json ./

## -------------------------------------------------------------------
##                            DEPENDENCIES
## -------------------------------------------------------------------
FROM BASE as DEPENDENCIES

RUN npm install --only=production

# copy production node_modules aside
RUN cp -R node_modules prod_node_modules

# install ALL node_modules, including 'devDependencies'
RUN npm install

## -------------------------------------------------------------------
##                                TEST
## -------------------------------------------------------------------
# run linters, setup and tests
FROM dependencies AS TEST

COPY .eslintrc.json .
COPY /src ./src/
COPY /test ./test/

# Enables colored output
ENV FORCE_COLOR=true

RUN  npm run lint:fix && npm run lint && npm run test:unit

## -------------------------------------------------------------------
##                              RELEASE
## -------------------------------------------------------------------
FROM node:${NODE_VER}-alpine as RELEASE

ARG HOME_DIR
ARG PORT

ENV port=$PORT

ENV home=$HOME_DIR
RUN mkdir -p $home
WORKDIR $home

COPY index.*js package.json ./

# copy production node_modules
COPY --from=dependencies $home/prod_node_modules ./node_modules
COPY /src ./src/

EXPOSE $port

CMD ["npm", "run", "start"]


