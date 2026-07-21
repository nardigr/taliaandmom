import { NextResponse } from "next/server";
import { auth } from "@/auth";

export default auth((request) => {
  const { pathname } = request.nextUrl;
  const isAdminRoute = pathname.startsWith("/admin");
  const isLoginPage = pathname === "/admin/login";
  const isLoggedIn = !!request.auth;

  if (isAdminRoute) {
    if (!isLoggedIn && !isLoginPage) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    if (isLoggedIn && isLoginPage) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth|api/health).*)"],
};
