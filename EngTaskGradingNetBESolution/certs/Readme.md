Postup generování certifikátu:

1. Zvolit heslo a upravit ho v bodu 2 níže

2. Spustit a nechat vygenerovat cetifikátový soubor

```
$cert = New-SelfSignedCertificate -DnsName "localhost" -CertStoreLocation "Cert:\LocalMachine\My" -KeyExportPolicy Exportable -NotAfter (Get-Date).AddYears(1)
$password = ConvertTo-SecureString -String "SuperTajneHeslo" -Force -AsPlainText
Export-PfxCertificate -Cert $cert -FilePath "C:\path\to\aspnetapp.pfx" -Password $password
```

3. Upravit heslo v appsettings.release.properties v nastavení Kestrelu - jsou v projektu v "User Secrets" (pravým klikem na projekt -> Manage User Secrets))

4. Rebuildnout kontejner
