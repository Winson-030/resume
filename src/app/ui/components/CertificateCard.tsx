"use client";

import { motion } from "framer-motion";
import { Award } from "lucide-react";

interface Certificate {
  name: string;
  issuer: string;
  date: string;
  icon?: React.ReactNode;
}

interface CertificateCardProps {
  certificate: Certificate;
  index?: number;
}

export function CertificateCard({ certificate, index = 0 }: CertificateCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ scale: 1.02, y: -4 }}
      className="group relative"
    >
      <div className="relative bg-card border border-border rounded-lg p-6 h-full transition-all duration-300 hover:shadow-lg hover:border-primary/20">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
            {certificate.icon || <Award className="w-6 h-6" />}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
              {certificate.name}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {certificate.issuer}
            </p>
            <p className="text-xs text-muted-foreground/60 mt-2">
              {certificate.date}
            </p>
          </div>
        </div>

        <motion.div
          className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        />
      </div>
    </motion.div>
  );
}

interface CertificateGridProps {
  certificates: Certificate[];
}

export function CertificateGrid({ certificates }: CertificateGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {certificates.map((cert, index) => (
        <CertificateCard
          key={cert.name}
          certificate={cert}
          index={index}
        />
      ))}
    </div>
  );
}
