import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectToDB } from "@/utils/database";
import User from "@/models/user";

const handler = NextAuth({
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" },
            },

            async authorize(credentials) {
                await connectToDB();

                const user = await User.findOne({ email: credentials.email }).select("+password");

                if(!user) throw new Error("No user found with the given email");

                const isPasswordCorrect = await bcrypt.compare(
                    credentials.password,
                    user.password
                )

                if(!isPasswordCorrect) throw new Error("Incorrect password");

                // Return a safe object
                return {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    image: user.avatar || null,
                };
            }
        }),

        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
    ],
    session: {
        strategy: "jwt",
    },
    

    callbacks: {
        async signIn({ user, account }){
            await connectToDB();

            if(account.provider === "google") {
                const userExists = await User.findOne({ email: user.email });

                if(!userExists) {
                    await User.create({
                        name: user.name,
                        email: user.email,
                        avatar: user.image,
                        provider: "google",
                    });
                }
            }

            return true;
        },

        async jwt({ token, user }) {
            if (user) {
                token.id = user.id || token.id;
                token.picture = user.image || token.picture || null;
            }

            if (!token.id && token.email) {
                await connectToDB();
                const dbUser = await User.findOne({ email: token.email });
                if (dbUser) {
                    token.id = dbUser._id.toString();
                    token.picture = dbUser.avatar || token.picture || null;
                }
            }

            return token;
        },

        async session({ session, token }) {
            if (session?.user) {
                session.user.id = token.id;
                session.user.image = session.user.image || token.picture || null;
            }
            return session;
        },
    },

});

export { handler as GET, handler as POST };
