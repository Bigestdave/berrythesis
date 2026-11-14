import Dashboard from "@/components/dashboard";
import { getWorkspace } from "@/lib/workspace";

export const dynamic = "force-dynamic";

export default async function ChangelogPage() {
  const workspace = await getWorkspace();
  return <Dashboard initialWorkspace={workspace} initialSection="changelog" />;
}
