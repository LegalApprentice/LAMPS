FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build-env
WORKDIR /app

# Copy csproj and restore as distinct layers
COPY *.csproj ./

RUN dotnet restore "./LoginService.csproj"

# Copy everything else and build
COPY . ./
RUN dotnet publish -c Release -o out

# Build runtime image
FROM mcr.microsoft.com/dotnet/aspnet:6.0
WORKDIR /app
EXPOSE 80
EXPOSE 5000
EXPOSE 5001
EXPOSE 443
COPY --from=build-env /app/out .
ENTRYPOINT ["dotnet", "LoginService.dll"]

# az login
# az acr login --name lacontainers
# docker build -t bvaserver -f Dockerfile  .
# docker tag bvaserver lacontainers.azurecr.io/bvaserver:v8.0.0
# docker push lacontainers.azurecr.io/bvaserver:v8.0.0
# docker run -d --network squire -p 8000:80 -v /iobt:/app/iobt  --rm --name bvaserver bvaserver 
