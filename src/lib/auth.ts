import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db";
import User from "@/lib/models/User";
import Vendor from "@/lib/models/Vendor";
import { headers } from "next/headers";

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

        const cleanEmail = credentials.email.trim().toLowerCase();
        let user = await User.findOne({ 
          email: { $regex: new RegExp(`^${cleanEmail.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i') } 
        }).select('+password');

        if (!user) {
          const isAdminEmail = cleanEmail === 'admin@malabarcoast.com' || cleanEmail === 'admin@spicewizz.com';
          const defaultAdminPassword = process.env.ADMIN_PASSWORD || 'admin';
          const isMalabarFallback = cleanEmail === 'admin@malabarcoast.com' && credentials.password === 'malabar123';
          const isSpicewizzFallback = cleanEmail === 'admin@spicewizz.com' && credentials.password === 'spicewizz123';

          if (isAdminEmail && (credentials.password === defaultAdminPassword || isMalabarFallback || isSpicewizzFallback)) {
            const hashedPassword = await bcrypt.hash(credentials.password, 10);
            user = await User.create({
              name: 'Admin',
              email: cleanEmail,
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
      id: "vendor-credentials",
      name: "Vendor Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter an email and password');
        }

        await dbConnect();

        const cleanEmail = credentials.email.trim().toLowerCase();
        const user = await User.findOne({ 
        let user = await User.findOne({ 
          email: { $regex: new RegExp(`^${cleanEmail.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i') } 
        }).select('+password');

        if (!user) {
          throw new Error('No vendor account found with this email');
          // Check if a vendor profile exists with this email or owner
          const vendorByEmail = await Vendor.findOne({
            $or: [
              { email: cleanEmail },
              { email: { $regex: new RegExp(`^${cleanEmail.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i') } }
            ]
          });

          if (vendorByEmail) {
            if (vendorByEmail.status === 'Pending') {
              throw new Error('Your vendor application is currently pending admin approval.');
            }
            if (vendorByEmail.status === 'Rejected') {
              throw new Error('Your vendor application was not approved. Please contact admin support.');
            }
            throw new Error('Vendor profile exists, but user account was not found. Please use Forgot Password or contact support.');
          }

          throw new Error('No vendor account found with this email.');
        }

        if (user.role !== 'Vendor') {
          throw new Error(`This email is registered as a ${user.role}, not a Vendor.`);
          // Check if there is an approved vendor linked to this user or email
          const linkedVendor = await Vendor.findOne({
            $or: [{ userId: user._id }, { email: cleanEmail }]
          });

          if (linkedVendor && linkedVendor.status === 'Approved') {
            user.role = 'Vendor';
            if (!linkedVendor.userId || linkedVendor.userId.toString() !== user._id.toString()) {
              linkedVendor.userId = user._id;
              await linkedVendor.save();
            }
            await user.save();
          } else if (linkedVendor && linkedVendor.status === 'Pending') {
            throw new Error('Your vendor application is currently pending admin approval.');
          } else if (linkedVendor && linkedVendor.status === 'Rejected') {
            throw new Error('Your vendor application was not approved. Please contact admin support.');
          } else {
            throw new Error(`This email is registered as a ${user.role}, not a Vendor.`);
          }
        }

        if (!user.password) {
          throw new Error('Vendor has no password configured.');
          throw new Error('Vendor has no password configured. Please use Forgot Password to set one.');
        }

        const isPasswordMatch = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordMatch) {
          throw new Error('Invalid credentials');
          throw new Error('Invalid email or password.');
        }

        const vendor = await Vendor.findOne({ userId: user._id });
        const vendor = await Vendor.findOne({ 
          $or: [{ userId: user._id }, { email: cleanEmail }] 
        });

        if (!vendor) {
            throw new Error('Vendor profile not found.');
          throw new Error('Vendor profile not found. Please contact support.');
        }
        if (vendor.status !== 'Approved') {
            throw new Error(`Vendor account status is "${vendor.status}". Please wait for admin approval.`);
          throw new Error(`Vendor account status is "${vendor.status}". Please wait for admin approval.`);
        }

        // Keep vendor record synced with user ID and email
        if (!vendor.userId || vendor.userId.toString() !== user._id.toString() || !vendor.email) {
          vendor.userId = user._id;
          if (!vendor.email) vendor.email = cleanEmail;
          await vendor.save();
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
    }),
    CredentialsProvider({
      id: "customer-password-credentials",
      name: "Customer Password Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter an email and password');
        }

        await dbConnect();

        const user = await User.findOne({ email: credentials.email.toLowerCase() }).select('+password');

        if (!user) {
          throw new Error('No user found with this email');
        }

        if (user.role !== 'Customer') {
          throw new Error('Access denied. Customer role required.');
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
    })
  ],
  callbacks: {
    async redirect({ url, baseUrl }) {
      let host = "";
      let proto = "http";
      try {
        const headersList = headers();
        host = headersList.get("host") || "";
        proto = headersList.get("x-forwarded-proto") || "http";
      } catch (e) {
        // headers() might throw if not called in request context
      }

      let currentOrigin = host ? `${proto}://${host}` : null;
      if (currentOrigin) {
        try {
          const originUrl = new URL(currentOrigin);
          // If the hostname is not localhost/127.0.0.1, we strip any custom port
          if (originUrl.hostname !== 'localhost' && originUrl.hostname !== '127.0.0.1') {
            currentOrigin = `${originUrl.protocol}//${originUrl.hostname}`;
          }
        } catch (e) {
          // Ignore
        }
      }

      // Ensure baseUrl does not leak port 3000 in production either
      let cleanBaseUrl = baseUrl;
      try {
        const baseParsed = new URL(baseUrl);
        if (baseParsed.hostname !== 'localhost' && baseParsed.hostname !== '127.0.0.1') {
          cleanBaseUrl = `${baseParsed.protocol}//${baseParsed.hostname}`;
        }
      } catch (e) {
        // Ignore
      }

      // Allows relative callback URLs
      if (url.startsWith("/")) {
        if (currentOrigin) {
          return `${currentOrigin}${url}`;
        }
        return `${cleanBaseUrl}${url}`;
      }
      
      try {
        const parsedUrl = new URL(url);
        const parsedBase = new URL(cleanBaseUrl);
        
        // Allows callback URLs on the same origin
        if (parsedUrl.origin === parsedBase.origin) {
          return url;
        }
        
        // Also allow local URLs (localhost / 127.0.0.1) for local development/testing
        if (parsedUrl.hostname === 'localhost' || parsedUrl.hostname === '127.0.0.1') {
          return url;
        }

        // Allow current origin if set
        if (currentOrigin && parsedUrl.origin === currentOrigin) {
          return url;
        }
      } catch (e) {
        // Ignore and fallback
      }
      
      return currentOrigin || cleanBaseUrl;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id || token.sub;
      }
      return session;
    }
  },
  session: { strategy: "jwt", maxAge: 24 * 60 * 60 },
  pages: { signIn: '/admin/login' },
  secret: process.env.NEXTAUTH_SECRET || 'fallback_secret',
};

