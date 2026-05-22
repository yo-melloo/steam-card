FROM node:20-alpine
# após baixar a imagem do Node.js, o próximo passo é definir o diretório de trabaalho com WORKDIR
# O WORKDIR é o diretório onde os comandos RUN, CMD, ENTRYPOINT, COPY e ADD serão centralizados.
# para a raiz do container, é copiado a configuração do npm (package.json e package-lock.json) para o diretório de trabalho (./)
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]

# a diferença entre RUN e CMD é que o RUN é executado durante a construção da imagem, enquanto o CMD é executado quando o container é iniciado