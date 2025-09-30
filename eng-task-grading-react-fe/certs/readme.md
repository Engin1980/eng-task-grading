# Instalace HTTPS certifikátu pro React+Vite

Je třeba mít `mkcert`. Nejjednodušší je **stáhnout binárku přímo**. Postup:

---

## 1️⃣ Stáhni mkcert

1. Otevři [mkcert GitHub releases](https://github.com/FiloSottile/mkcert/releases).
2. Najdi poslední verzi pro Windows (`mkcert-v*-windows-amd64.exe`).
3. Stáhni soubor a přejmenuj ho na `mkcert.exe`.
4. Umísti ho někam do PATH (např. `C:\tools\mkcert\mkcert.exe`) nebo do složky projektu.

---

## 2️⃣ Nainstaluj lokální root certifikát

Otevři **PowerShell jako administrátor**:

```powershell
mkcert -install
```

Tím se vytvoří lokální root certifikát, kterému Windows (a Chromium/Edge) důvěřuje.

---

## 3️⃣ Vygeneruj certifikát pro localhost

V adresáři projektu spusť:

```powershell
mkcert localhost
```

Vytvoří ti soubory:

```
localhost.pem       ← certifikát
localhost-key.pem   ← privátní klíč
```

---

## 4️⃣ Použij v Vite

Složku s certifikáty např. `certs/` a v `vite.config.ts`:

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";

export default defineConfig({
  plugins: [react()],
  server: {
    https: {
      key: fs.readFileSync("./certs/localhost-key.pem"),
      cert: fs.readFileSync("./certs/localhost.pem"),
    },
    host: "localhost",
    port: 3000,
  },
});
```
Cesta je: 
* **Relativní je vůči souboru `vite.config.ts`**, ne vůči `src`.
* Typicky tedy doporučené umístění:

```
project-root/
│ vite.config.ts
│ certs/
│   localhost.pem
│   localhost-key.pem
│ src/
```

Pak stačí:

```powershell
npm run dev
```

→ pojede `https://localhost:####` s důvěryhodným certifikátem.

---

### Patří `.pem` soubory do repository?

✅ **Obecně ne!**

* Jsou to **lokální development certifikáty** → každý dev by si měl generovat vlastní.
* Vložení do git by mohlo být bezpečnostní riziko (privátní klíč).

**Doporučení:**

* Přidej `certs/` do `.gitignore`:

```
# local dev certs
certs/
```

* V README můžeš napsat:

  > `mkcert localhost` → vytvoří soubory `localhost.pem` a `localhost-key.pem`
