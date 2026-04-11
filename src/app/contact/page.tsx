"use client";

import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";

export default function ContactPage() {
  const contactDetails = [
    {
      icon: <Mail className="w-6 h-6 text-primary" />,
      title: "EMAIL",
      details: ["hello@spicewizz.com"],
    },
    {
      icon: <Phone className="w-6 h-6 text-primary" />,
      title: "PHONE",
      details: ["+91 80-62689625", "+91 9886 55 9991"],
    },
    {
      icon: <MapPin className="w-6 h-6 text-primary" />,
      title: "ADDRESS",
      details: ["Spicewizz", "Vythiri post, Wayanad", "Kerala, India"],
    },
    {
      icon: <Clock className="w-6 h-6 text-primary" />,
      title: "BUSINESS HOURS",
      details: ["Monday – Saturday", "9:00 AM – 5:00 PM"],
    },
  ];

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">Get in Touch</h1>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            We'd love to hear from you. Whether you have a question about our spices, pricing, or anything else, our team is ready to answer all your questions.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-semibold mb-6 text-foreground">Contact Information</h2>
            {contactDetails.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                whileHover={{ y: -5 }}
                className="flex items-start p-6 bg-surface glass rounded-2xl shadow-sm border border-foreground/5 hover:shadow-md transition-all duration-300"
              >
                <div className="p-3 bg-primary/10 rounded-xl mr-5 shrink-0">
                  {item.icon}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground/60 tracking-wider mb-2 uppercase">{item.title}</h3>
                  {item.details.map((detail, i) => (
                    <p key={i} className="text-foreground/90 font-medium">{detail}</p>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-surface glass p-8 md:p-10 rounded-3xl shadow-lg border border-foreground/5"
          >
            <h2 className="text-3xl font-bold mb-2 text-foreground">Send Us an Enquiry</h2>
            <p className="text-foreground/60 mb-8">Fill out the form below and we'll get back to you as soon as possible.</p>

            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">Name *</label>
                  <input
                    type="text"
                    id="name"
                    className="w-full px-4 py-3 bg-background/50 border border-foreground/10 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-colors outline-none"
                    placeholder="Your full name"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">Email *</label>
                  <input
                    type="email"
                    id="email"
                    className="w-full px-4 py-3 bg-background/50 border border-foreground/10 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-colors outline-none"
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">Phone</label>
                  <input
                    type="tel"
                    id="phone"
                    className="w-full px-4 py-3 bg-background/50 border border-foreground/10 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-colors outline-none"
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-2">Subject</label>
                  <input
                    type="text"
                    id="subject"
                    className="w-full px-4 py-3 bg-background/50 border border-foreground/10 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-colors outline-none"
                    placeholder="How can we help?"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">Message *</label>
                <textarea
                  id="message"
                  rows={5}
                  className="w-full px-4 py-3 bg-background/50 border border-foreground/10 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-colors outline-none resize-none"
                  placeholder="Tell us about your enquiry..."
                  required
                ></textarea>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full py-4 bg-primary text-black font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
              >
                <Send className="w-5 h-5" />
                Submit Enquiry
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
