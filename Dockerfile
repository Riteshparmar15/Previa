# Stage 1: Build .NET Web API
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy project files and restore dependencies
COPY Previa.slnx ./
COPY src/Previa.Domain/Previa.Domain.csproj src/Previa.Domain/
COPY src/Previa.Application/Previa.Application.csproj src/Previa.Application/
COPY src/Previa.Infrastructure/Previa.Infrastructure.csproj src/Previa.Infrastructure/
COPY src/Previa.Api/Previa.Api.csproj src/Previa.Api/
COPY tests/Previa.Tests/Previa.Tests.csproj tests/Previa.Tests/

RUN dotnet restore src/Previa.Api/Previa.Api.csproj

# Copy remaining source code and publish
COPY . .
RUN dotnet publish src/Previa.Api/Previa.Api.csproj -c Release -o /app/publish /p:UseAppHost=false

# Stage 2: Runtime image
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

# Expose HTTP port
EXPOSE 5123
ENV ASPNETCORE_URLS=http://+:5123
ENV ASPNETCORE_ENVIRONMENT=Production

ENTRYPOINT ["dotnet", "Previa.Api.dll"]
