import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      image?: string;
      role: "user" | "admin";
    };
  }

  interface User {
    role: "user" | "admin";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string;
    id: string;
    picture?: string;
  }
}
