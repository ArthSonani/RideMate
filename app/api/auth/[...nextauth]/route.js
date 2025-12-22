import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectToDB } from "@/utils/database";
import User from "@/models/user";

const authOptions = NextAuth({
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

                // Return minimal session fields
                return {
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
    callbacks: {
        async signIn({ user, account }){
            await connectToDB();

            if(account.provider === "google") {
                const dbUser = await User.findOne({ email: user.email });

                if(!dbUser) {
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
    },

});

export { authOptions as GET, authOptions as POST };
