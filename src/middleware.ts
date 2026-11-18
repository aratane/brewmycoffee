import NextAuth from "next-auth";
import authConfig from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const role = req.auth?.user?.role;
  const isLoggedIn = !!req.auth;

  const adminPath = nextUrl.pathname.startsWith("/admin");
  const kitchenPath = nextUrl.pathname.startsWith("/kitchen");
  const accountPath = nextUrl.pathname.startsWith("/account");

  if ((adminPath || kitchenPath || accountPath) && !isLoggedIn) {
    const login = new URL("/login", nextUrl);
    login.searchParams.set("callbackUrl", nextUrl.pathname);
    return Response.redirect(login);
  }

  if (adminPath && role === "CUSTOMER") {
    return Response.redirect(new URL("/unauthorized", nextUrl));
  }
  if (kitchenPath && role !== "BARISTA" && role !== "ADMIN" && role !== "SUPER_ADMIN") {
    return Response.redirect(new URL("/unauthorized", nextUrl));
  }
});

export const config = {
  matcher: ["/admin/:path*", "/kitchen/:path*", "/account/:path*"],
};
