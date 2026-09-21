import { auth } from "@/lib/auth";

export default auth((req) => {
  const isDashboard = req.nextUrl.pathname.startsWith("/dashboard");
  const isLogin = req.nextUrl.pathname.startsWith("/login");
  const isApi = req.nextUrl.pathname.startsWith("/api");

  if (isApi) return;
  if (isLogin && req.auth) {
    return Response.redirect(new URL("/dashboard", req.nextUrl));
  }
  if (isDashboard && !req.auth) {
    return Response.redirect(new URL("/login", req.nextUrl));
  }
  if (isDashboard && req.auth) {
    const role = (req.auth.user as { role?: string } | undefined)?.role;
    if (role === "customer") {
      return Response.redirect(new URL("/", req.nextUrl));
    }
  }
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
