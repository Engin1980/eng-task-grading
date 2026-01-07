1. Generate and prepare certificate for https - see certs/readme.md

2. Create docker-compose.release.yml overriding:

```
services:

  mssql:
    environment:
      SA_PASSWORD: <<TODO db password>>

  engtaskgradingnetbe:
    environment:
      AppSettings__Security__AccessTokenJwtSecretKey: <<TODO secret key>>
      AppSettings__Emails__Configs__Osu__SenderEmail: <<TODO ou email>>
      AppSettings__Emails__Configs__Osu__SenderPassword: <<TODO ou email password>>
      DOTNET_ENVIRONMENT: Release
      ASPNETCORE_ENVIRONMENT: Release
      ASPNETCORE_HTTP_PORTS: 8080
      ASPNETCORE_HTTPS_PORTS: 443
      DB_PASSWORD: <<TODO db password>>
    ports: !override
      - "55555:8080"  # HTTP
      - "55556:443"   # HTTPS
      
```

3. Prepare appsettings.release.json

```
{
  "Kestrel": {
    "Endpoints": {
      "Http": { "Url": "http://+:8080" },
      "Https": {
        "Url": "https://+:443",
        "Certificate": {
          "Path": "/https/aspnetapp.pfx",
          "Password": "TODO put cert password here"
        }
      }
    }
  },
  "AppSettings": {
    "FrontEndUrl": "TODO updatehttps://78.128.134.148:5173",
    "CloudFlare": {
      "Enabled": false
    },
    "Email": {
      "ActiveConfigName": "osu",
      "DebugEmailRecipient": "TODO remove if not use: engin@seznam.cz"
    }
  }
}
```


4. build and run up everything using

```
docker compose -f docker-compose.yml -f docker-compose.release.yml build
docker compose -f docker-compose.yml -f docker-compose.release.yml up -d
```

