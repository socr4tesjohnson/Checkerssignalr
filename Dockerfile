# Multi-stage build for React frontend + ASP.NET Core backend

# Stage 1: Build frontend
FROM node:20-alpine AS frontend-build
WORKDIR /app/client

# Copy frontend package files
COPY client/package*.json ./
RUN npm ci

# Copy frontend source and build
COPY client/ ./
RUN npm run build

# Stage 2: Build backend
FROM mcr.microsoft.com/dotnet/sdk:10.0-preview AS backend-build
WORKDIR /app/backend

# Copy csproj and restore
COPY CheckersApi/*.csproj ./
RUN dotnet restore

# Copy backend source
COPY CheckersApi/ ./

# Copy frontend build to wwwroot
COPY --from=frontend-build /app/client/dist ./wwwroot/

# Build and publish
RUN dotnet publish -c Release -o /app/publish

# Stage 3: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:10.0-preview AS runtime
WORKDIR /app

# Copy published app
COPY --from=backend-build /app/publish .

# Expose port (Render uses PORT env variable)
EXPOSE 8080

# Set environment variables
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

# Run the app
ENTRYPOINT ["dotnet", "CheckersApi.dll"]
