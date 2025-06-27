import { NextResponse } from "next/server"
import { debugGlobalState } from "@/lib/actions"

export const dynamic = "force-dynamic"

export async function GET() {
  const state = await debugGlobalState()

  return NextResponse.json({
    serverTime: new Date().toISOString(),
    globalState: state,
    message: "This endpoint helps debug the server-side global state",
  })
}
