Spustit docker
docker run -d  --name keycloak -p 8080:8080 -e KEYCLOAK_ADMIN=sa -e KEYCLOAK_ADMIN_PASSWORD=Bublinka#1 quay.io/keycloak/keycloak:25.0.0 start-dev

Konzole na http://localhost:8080/admin, jm�no a heslo viz v��e

Vytvo�it nov� Realm a klienta

Nastavit u�ivatelsk� e-mail jako id, zru�it first-name+last-name jako povinn�

