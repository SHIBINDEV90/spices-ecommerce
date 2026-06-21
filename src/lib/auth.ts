import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db";
import User from "@/lib/models/User";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "admin-credentials",
      name: "Admin Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter an email and password');
        }

        await dbConnect();

        let user = await User.findOne({ email: credentials.email }).select('+password');

        if (!user) {
          const isAdminEmail = credentials.email === 'admin@malabarcoast.com' || credentials.email === 'admin@spicewizz.com';
          const defaultAdminPassword = process.env.ADMIN_PASSWORD || 'admin';

          if (isAdminEmail && credentials.password === defaultAdminPassword) {
            const hashedPassword = await bcrypt.hash(credentials.password, 10);
            user = await User.create({
              name: 'Admin',
              email: credentials.email,
              password: hashedPassword,
              role: 'Admin'
            });

            return {
              id: user._id.toString(),
              name: user.name,
              email: user.email,
              role: user.role,
            };
          }

          throw new Error('No user found with this email');
        }

        if (user.role !== 'Admin') {
          throw new Error('Access denied. Admin role required.');
        }

        if (!user.password) {
          throw new Error('User has no password configured.');
        }

        const isPasswordMatch = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordMatch) {
          throw new Error('Invalid credentials');
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        };
      }
    }),
    CredentialsProvider({
      id: "customer-credentials",
      name: "Customer Credentials",
      credentials: {
        phone: { label: "Phone Number", type: "text", placeholder: "Enter your registered mobile number" },
        otp: { label: "OTP", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.otp) {
          throw new Error('Please enter your mobile number and OTP');
        }

        await dbConnect();

        const user = await User.findOne({ phone: credentials.phone }).select('+otp +otpExpiry');

        if (!user) {
          throw new Error('No user found with this mobile number');
        }

        if (!user.otp || !user.otpExpiry) {
          throw new Error('Please request an OTP first.');
        }

        if (new Date() > user.otpExpiry) {
          throw new Error('OTP has expired. Please request a new one.');
        }

        if (user.otp !== credentials.otp) {
          throw new Error('Invalid OTP');
        }

        // Optional: clear the OTP after successful login
        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save();

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
      }
      return session;
    }
  },
  session: { strategy: "jwt", maxAge: 24 * 60 * 60 },
  pages: { signIn: '/admin/login' },
  secret: process.env.NEXTAUTH_SECRET || 'fallback_secret',
};

