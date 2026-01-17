import { createFileRoute } from '@tanstack/react-router'
import type { SenderRulesHandler } from '../../services/log-service';
import { senderRulesHandler } from '../../services/log-service';
import { useState } from 'react';

export const Route = createFileRoute('/admin/client-logs')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/admin/client-logs"!</div>
}
