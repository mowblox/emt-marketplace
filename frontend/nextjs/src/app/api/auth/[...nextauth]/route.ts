
/**
 * The handler function for the GET and POST requests.
 * @param {import("next-auth").NextAuthOptions} authOptions - The authentication options.
 * @returns {Promise<void>} - A promise that resolves when the authentication is complete.
 */
import NextAuth from "next-auth";
import { authOptions } from "./auth-options";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };