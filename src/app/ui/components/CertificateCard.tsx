"use client";

import { motion } from "framer-motion";

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

// AWS Icon Component
function AWSIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M7.636 10.344c0 .246.027.446.073.592.053.146.12.306.213.479a.29.29 0 0 1 .047.153c0 .067-.04.133-.126.2l-.419.279a.32.32 0 0 1-.173.06c-.067 0-.133-.033-.2-.093a2.015 2.015 0 0 1-.239-.313 4.898 4.898 0 0 1-.206-.392c-.519.612-1.171.918-1.956.918-.559 0-1.004-.16-1.33-.479-.326-.319-.492-.745-.492-1.277 0-.565.2-1.024.605-1.37s.945-.519 1.63-.519c.226 0 .459.02.705.053.245.032.498.086.764.145v-.485c0-.506-.106-.858-.313-1.064-.212-.207-.572-.306-1.084-.306-.233 0-.472.027-.718.086a5.3 5.3 0 0 0-.718.226 2.063 2.063 0 0 1-.233.087.427.427 0 0 1-.106.02c-.093 0-.14-.067-.14-.206v-.326c0-.106.013-.186.047-.233a.496.496 0 0 1 .186-.14c.232-.12.511-.219.837-.299a4.056 4.056 0 0 1 1.038-.126c.792 0 1.37.18 1.743.539.366.359.552.905.552 1.636v2.155h.013zm-2.7 1.011c.22 0 .446-.04.685-.12.239-.08.452-.226.632-.426.106-.126.186-.266.226-.426s.067-.353.067-.579v-.279a5.855 5.855 0 0 0-.613-.113 4.938 4.938 0 0 0-.625-.04c-.446 0-.772.086-.991.266-.22.18-.326.432-.326.765 0 .313.08.545.246.705.16.167.393.247.699.247zm5.341.718c-.12 0-.2-.02-.253-.067-.053-.04-.1-.133-.14-.259L8.321 6.605c-.04-.133-.06-.22-.06-.266 0-.106.053-.166.16-.166h.652c.126 0 .213.02.259.067.053.04.093.133.133.259l1.118 4.403 1.038-4.403c.033-.133.073-.22.126-.259a.455.455 0 0 1 .266-.067h.532c.126 0 .213.02.266.067.053.04.1.133.126.259l1.051 4.457 1.151-4.457c.04-.133.086-.22.133-.259a.433.433 0 0 1 .259-.067h.619c.106 0 .166.053.166.166 0 .033-.007.067-.013.106a.944.944 0 0 1-.047.166l-1.603 5.142c-.04.133-.086.22-.14.259a.425.425 0 0 1-.253.067h-.572c-.126 0-.213-.02-.266-.067-.053-.047-.1-.133-.126-.266l-1.031-4.29-1.024 4.284c-.033.133-.073.22-.126.266s-.146.067-.266.067h-.572zm8.548.18c-.346 0-.692-.04-1.024-.12-.333-.08-.592-.166-.765-.266-.106-.06-.18-.126-.206-.186a.462.462 0 0 1-.04-.186v-.339c0-.14.053-.206.153-.206.04 0 .08.007.12.02s.1.04.166.067c.226.1.472.18.732.233.266.053.525.08.792.08.419 0 .745-.073.971-.22a.716.716 0 0 0 .346-.632.65.65 0 0 0-.18-.466c-.12-.126-.346-.239-.672-.346l-.965-.299c-.486-.153-.845-.379-1.064-.678a1.584 1.584 0 0 1-.333-.965c0-.279.06-.525.18-.738s.279-.399.479-.545c.2-.153.426-.266.692-.346.265-.082.544-.115.837-.115.146 0 .299.007.446.027.153.02.293.047.432.073.133.033.259.067.379.106.12.04.213.08.279.12.093.053.16.106.2.166.04.053.06.126.06.22v.313c0 .14-.053.213-.153.213a.7.7 0 0 1-.253-.08 3.042 3.042 0 0 0-1.277-.259c-.379 0-.678.06-.885.186-.206.126-.313.319-.313.592 0 .186.067.346.2.472s.379.253.732.366l.945.299c.479.153.825.366 1.031.639.206.273.306.585.306.931 0 .286-.06.545-.173.772-.12.226-.279.426-.486.585a2.137 2.137 0 0 1-.738.372c-.3.093-.612.14-.951.14z" />
      <path d="M20.082 15.485c-2.188 1.616-5.368 2.474-8.102 2.474-3.831 0-7.284-1.417-9.891-3.772-.206-.186-.02-.439.226-.293 2.82 1.636 6.299 2.627 9.898 2.627 2.428 0 5.095-.506 7.55-1.543.365-.164.678.241.319.507z" />
      <path d="M20.993 14.448c-.279-.359-1.849-.173-2.561-.086-.213.027-.246-.16-.053-.299 1.251-.878 3.306-.625 3.545-.333.239.299-.067 2.355-1.237 3.339-.18.153-.353.073-.273-.126.266-.659.858-2.143.579-2.495z" />
    </svg>
  );
}

// Kubernetes Icon Component
function KubernetesIcon({ className }: { className?: string }) {
  return (

    <svg className={className} viewBox="0 0 32 32" fill="currentColor">
      <path d="M6.401 12.802v12.797h12.797v6.401h-19.198v-19.198zM32 0v32h-9.599v-6.401h3.198v-19.198h-19.198v3.198h-6.401v-9.599z" />
    </svg>
  );
}

// Azure Icon Component
function AzureIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="currentColor">
      <path d="M7.47 12.412l3.348-.592.031-.007-1.722-2.049a291.474 291.474 0 01-1.723-2.058c0-.01 1.779-4.909 1.789-4.926a788.95 788.95 0 012.934 5.066l2.95 5.115.023.039-10.948-.001 3.317-.587zM.9 11.788c0-.003.811-1.412 1.803-3.131L4.507 5.53l2.102-1.764C7.765 2.797 8.714 2 8.717 2a.37.37 0 01-.033.085L6.4 6.981 4.16 11.789l-1.63.002c-.897.001-1.63 0-1.63-.003z" />
    </svg>
  );
}

// Get icon based on certificate name
function getCertificateIcon(name: string): React.ReactNode {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('aws')) {
    return <AWSIcon className="w-6 h-6" />;
  }
  if (lowerName.includes('kubernetes') || lowerName.includes('cka')) {
    return <KubernetesIcon className="w-6 h-6" />;
  }
  if (lowerName.includes('azure')) {
    return <AzureIcon className="w-6 h-6" />;
  }
  return null;
}

export function CertificateCard({ certificate, index = 0 }: CertificateCardProps) {
  const icon = certificate.icon || getCertificateIcon(certificate.name);

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
            {icon}
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
