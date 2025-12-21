import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsPrvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectToDB } from "@/utils/database";
import User from "@/models/user";

const handler = NextAuth({
    providers: [
        CredentialsPrvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" },
            },

            async authorize(credentials) {
                await connectToDB();

                const user = await User.findOne({email: credentials.email}); // may cause error

                if(!user) throw new Error("No user found with the given email");

                const isPasswordCorrect = await bcrypt.compare(
                    credentials.password,
                    user.password
                )

                if(!isPasswordCorrect) throw new Error("Incorrect password");

                return user;
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
        async signIn({ user, account}){
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
        }
    },

});

export { handler as GET, handler as POST };
