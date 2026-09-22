import { NextResponse } from "next/server";
import * as db from "@/lib/db";

export async function GET() {
  try {
    const projects = db.getAllProjects();
    return NextResponse.json({ projects });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.name) {
      return NextResponse.json({ error: "Project name is required" }, { status: 400 });
    }
    const project = db.createProject({
      name: body.name,
      description: body.description,
      status: body.status,
    });
    return NextResponse.json({ project });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
