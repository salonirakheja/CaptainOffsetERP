import { getAllGateLogEntries } from '@/lib/db/gate-log';
import GateLogClient from './GateLogClient';

export const dynamic = 'force-dynamic';

export default async function GateLogPage() {
  const entries = await getAllGateLogEntries(new Date());

  return <GateLogClient entries={entries} />;
}
