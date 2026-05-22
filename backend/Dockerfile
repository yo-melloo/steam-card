# Baixa a imagem do Maven para construir o projeto
# Usa imagem do Eclipse Temurin 17 para rodar a aplicação
# Distro Alpine para reduzir o tamanho da imagem final
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY . .
# Compila o projeto gerando o arquivo JAR, pulando os testes
# JAR é a extensão do arquivo gerado após a compilação do projeto Java, que pode ser executado na JVM
# Se o JAR é gerado corretamente, então não há erros no código-fonte e a aplicação pode ser executada sem problemas
RUN mvn clean package -DskipTests

# Agora, usaremos o JAR gerado para criar a imagem final da aplicação
# Insere a aplicação na pasta /app dentro do container
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
# Comando Maven para copiar o JAR e expor a execução da aplicação na porta 8080
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
# a flag "-jar" é usada para indicar que o arquivo é uma aplicação Java executável
ENTRYPOINT ["java", "-jar", "app.jar"]
