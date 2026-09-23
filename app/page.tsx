import { Chat } from "@/components/chat";
import { getAllProjects } from "@/lib/db";

export const dynamic = "force-dynamic";

export default function Home() {
  const projects = getAllProjects();
  return <Chat initialProjects={projects} />;
}
