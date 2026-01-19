"use client";

import { useState, useRef } from "react";
import { Button } from "@/app/ui/components/Button";

interface ContactFormProps {
  labels: {
    name: string;
    email: string;
    message: string;
    send: string;
  };
}

export function ContactForm({ labels }: ContactFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const linkRef = useRef<HTMLAnchorElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Create mailto link with pre-filled data
    const subject = `Contact from ${formData.name}`;
    const body = `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`;
    const mailtoLink = `mailto:mail@winson.dev?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    // Set href and trigger click
    if (linkRef.current) {
      linkRef.current.href = mailtoLink;
      linkRef.current.click();
    }

    // Reset form after a short delay
    setTimeout(() => {
      setFormData({ name: "", email: "", message: "" });
      setIsSubmitting(false);
    }, 1000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = emailRegex.test(formData.email);
  const isFormValid = formData.name.trim() !== "" && isEmailValid && formData.message.trim() !== "";

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-2">
          {labels.name}
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full px-4 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          placeholder={labels.name}
          required
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-2">
          {labels.email}
        </label>
        <input
          type="email"
          id="email"
          value={formData.email}
          onChange={handleChange}
          className={`w-full px-4 py-2 bg-background border rounded-md focus:outline-none focus:ring-2 transition-all ${
            formData.email && !isEmailValid
              ? "border-destructive focus:ring-destructive/20 focus"
              : "border-input focus:ring-primary/20 focus:border-primary"
          }`}
          placeholder={labels.email}
          required
        />
        {formData.email && !isEmailValid && (
          <p className="text-xs text-destructive mt-1">Please enter a valid email address</p>
        )}
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium mb-2">
          {labels.message}
        </label>
        <textarea
          id="message"
          rows={4}
          value={formData.message}
          onChange={handleChange}
          className="w-full px-4 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          placeholder={labels.message}
          required
        />
      </div>

      <Button type="submit" className="w-full" disabled={!isFormValid || isSubmitting}>
        {isSubmitting ? "Opening..." : labels.send}
      </Button>

      {/* Hidden anchor for mailto link */}
      <a ref={linkRef} className="hidden" />
    </form>
  );
}
