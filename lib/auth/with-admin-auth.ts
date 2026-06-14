// lib/auth/with-admin-auth.ts
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<Record<string, string>> };
type RouteHandler = (
  request: Request,
  context?: RouteContext
) => Promise<Response>;

export function withAdminAuth(handler: RouteHandler): RouteHandler {
  return async (request, context) => {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || user.app_metadata?.role !== "admin") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    return handler(request, context);
  };
}
