import { NextAuthOptions } from "next-auth";
// Import your providers here, e.g. GoogleProvider, CredentialsProvider, etc.
// import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  // Configure one or more authentication providers
  providers: [
    // Example:
    // GoogleProvider({
    //   clientId: process.env.GOOGLE_CLIENT_ID!,
    //   clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    // }),
  ],
  // Add more NextAuth options here as needed
}; 