1. St�hnout a nainstalovat Docker Desktop z [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/).
2. Spustit Docker Desktop a ujistit se, �e b��.
3. Spustit MS SQL image: 
   docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=Bublinka#1" -p 1433:1433 --name sqlserver --network=host -d mcr.microsoft.com/mssql/server:2022-latest