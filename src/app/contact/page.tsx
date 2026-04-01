"use client";

import { useState } from "react";
import { Mail, MessageSquare, Send, Clock, Check } from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";
import { PRICING } from "@/data/products";

export default function ContactPage() {
  const { formatPrice } = useCurrency();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--foreground)]">
            Get in{" "}
            <span className="text-white">Touch</span>
          </h1>
          <p className="mt-3 text-[var(--muted)] max-w-md mx-auto">
            Have a question about an order or need help? We&apos;re here to help.
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-8">
          {/* Contact Info */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-[var(--surface)] border border-[color:var(--border)] rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-brand-green/10 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-[var(--foreground)]">Email</h3>
                  <a
                    href="mailto:support@footxi.com"
                    className="text-sm text-white hover:text-white/90 transition-colors"
                  >
                    support@footxi.com
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-[var(--surface)] border border-[color:var(--border)] rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-brand-green/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-[var(--foreground)]">
                    Response Time
                  </h3>
                  <p className="text-sm text-[var(--muted)]">
                    Within 24 hours
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[var(--surface)] border border-[color:var(--border)] rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-brand-green/10 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-[var(--foreground)]">
                    FAQ
                  </h3>
                  <p className="text-sm text-[var(--muted)]">
                    Common questions answered
                  </p>
                </div>
              </div>
              <div className="mt-4 space-y-3">
                <details className="group">
                  <summary className="text-sm text-[var(--muted)] cursor-pointer hover:text-[var(--foreground)] transition-colors">
                    How long does shipping take?
                  </summary>
                  <p className="mt-2 text-xs text-[var(--muted)] pl-4">
                    Standard shipping takes 15-30 days. Express shipping takes
                    7-15 days.
                  </p>
                </details>
                <details className="group">
                  <summary className="text-sm text-[var(--muted)] cursor-pointer hover:text-[var(--foreground)] transition-colors">
                    Can I customize my kit?
                  </summary>
                  <p className="mt-2 text-xs text-[var(--muted)] pl-4">
                    Yes! You can add a custom name and number for {formatPrice(PRICING.customNameNumber)} extra.
                    Arm badges are also available for {formatPrice(PRICING.badgePrice)} each.
                  </p>
                </details>
                <details className="group">
                  <summary className="text-sm text-[var(--muted)] cursor-pointer hover:text-[var(--foreground)] transition-colors">
                    Do you offer bulk discounts?
                  </summary>
                  <p className="mt-2 text-xs text-[var(--muted)] pl-4">
                    Yes! 5% off for 3-6 kits and 10% off for 7-15 kits.
                  </p>
                </details>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="md:col-span-3">
            <div className="bg-[var(--surface)] border border-[color:var(--border)] rounded-xl p-6 sm:p-8">
              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-green-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">
                    Message Sent!
                  </h3>
                  <p className="text-[var(--muted)]">
                    We&apos;ll get back to you within 24 hours.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({
                        name: "",
                        email: "",
                        subject: "",
                        message: "",
                      });
                    }}
                    className="mt-6 text-sm text-white hover:text-white/90 transition-colors"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">
                        Your Name
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="w-full px-4 py-3 bg-[var(--surface-muted)] border border-[color:var(--border)] rounded-lg text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:border-brand-green/50 transition-colors"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="w-full px-4 py-3 bg-[var(--surface-muted)] border border-[color:var(--border)] rounded-lg text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:border-brand-green/50 transition-colors"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">
                      Subject
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.subject}
                      onChange={(e) =>
                        setFormData({ ...formData, subject: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-[var(--surface-muted)] border border-[color:var(--border)] rounded-lg text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:border-brand-green/50 transition-colors"
                      placeholder="Order inquiry, bulk order, etc."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">
                      Message
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-[var(--surface-muted)] border border-[color:var(--border)] rounded-lg text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:border-brand-green/50 transition-colors resize-none"
                      placeholder="Tell us how we can help..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-brand-green text-white font-semibold rounded-lg hover:bg-brand-green-dark transition-colors flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Send Message
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
