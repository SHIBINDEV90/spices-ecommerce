export default function CertificationsPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-center mb-8">Our Certifications</h1>
      <div className="max-w-3xl mx-auto">
        <p className="text-lg text-gray-700 mb-6">
          We are committed to providing our customers with the highest quality spices. Our products are certified by various government and international organizations.
        </p>
        <ul className="list-disc list-inside">
          <li className="text-lg text-gray-700 mb-2">IEC (Import Export Code)</li>
          <li className="text-lg text-gray-700 mb-2">FSSAI (Food Safety and Standards Authority of India)</li>
          <li className="text-lg text-gray-700 mb-2">Spice Board of India</li>
          <li className="text-lg text-gray-700 mb-2">ISO (International Organization for Standardization)</li>
        </ul>
      </div>
    </div>
  );
}
