Spustit docker
docker run -d  --name keycloak -p 8080:8080 -e KEYCLOAK_ADMIN=sa -e KEYCLOAK_ADMIN_PASSWORD=Bublinka#1 quay.io/keycloak/keycloak:25.0.0 start-dev

Konzole na http://localhost:8080/admin, jméno a heslo viz výše

Vytvoøit nový Realm a klienta

Nastavit uživatelský e-mail jako id, zrušit first-name+last-name jako povinné

