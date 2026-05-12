import { createFileRoute } from "@tanstack/react-router";
import { appService } from "../services/app-service";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/health")({
  component: RouteComponent,
});

function RouteComponent() {
  const [backendVersion, setBackendVersion] = useState<string>("Retrieving...");
  const [dbState, setDbState] = useState<string>("Retrieving...");
  const [emailState, setEmailState] = useState<string>("Retrieving...");

  useEffect(() => {
    appService
      .getBackendVersion()
      .then(setBackendVersion)
      .catch((err) => setBackendVersion("error" + err));
    appService
      .getDbState()
      .then(setDbState)
      .catch((err) => setDbState("error " + err));
    appService
      .getEmailState()
      .then(setEmailState)
      .catch((err) => setEmailState("error " + err));
  }, []);

  return (
    <div>
      <h1>Health Check</h1>
      <p>Backend Version: {backendVersion}</p>
      <p>Database State: {dbState}</p>
      <p>Email State: {emailState}</p>
    </div>
  );
}
