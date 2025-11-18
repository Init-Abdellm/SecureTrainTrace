import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { HardHat, Shield, QrCode, Upload, CheckCircle, Award, FileText, Users, Clock, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageSelector } from "@/components/language-selector";

export default function Landing() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-5xl px-4">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-orange-600 rounded-lg flex items-center justify-center">
                <HardHat className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-base font-bold text-gray-900">{t("nav.constructionSiteSafety")}</span>
            </div>
            <div className="flex items-center gap-2">
              <LanguageSelector />
              <Link href="/admin">
                <Button variant="outline" size="sm" className="border-gray-300 h-9">
                  <Shield className="w-4 h-4 mr-2" />
                  {t("nav.adminLogin")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 lg:px-8 bg-gradient-to-b from-orange-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  {t("landing.title")}
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  {t("landing.subtitle")}
                </p>
              </div>
              <div>
                <Link href="/verify">
                  <Button size="lg" className="bg-orange-600 hover:bg-orange-700 h-12 px-8">
                    <QrCode className="w-5 h-5 mr-2" />
                    {t("landing.verifyCertificate")}
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-orange-100 to-orange-50 rounded-2xl p-8 shadow-xl">
                <img src="/hero.gif" alt="Construction Safety" className="w-full rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">{t("landing.howItWorks")}</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t("landing.howItWorksSubtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <ProcessStep
              number="1"
              icon={<Upload className="w-6 h-6" />}
              title={t("landing.step1.title")}
              description={t("landing.step1.description")}
            />
            <ProcessStep
              number="2"
              icon={<Users className="w-6 h-6" />}
              title={t("landing.step2.title")}
              description={t("landing.step2.description")}
            />
            <ProcessStep
              number="3"
              icon={<CheckCircle className="w-6 h-6" />}
              title={t("landing.step3.title")}
              description={t("landing.step3.description")}
            />
            <ProcessStep
              number="4"
              icon={<Award className="w-6 h-6" />}
              title={t("landing.step4.title")}
              description={t("landing.step4.description")}
            />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">{t("landing.features.title")}</h2>
            <p className="text-xl text-gray-600">{t("landing.features.subtitle")}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<FileText className="w-8 h-8 text-orange-600" />}
              title={t("landing.features.bulkImport.title")}
              description={t("landing.features.bulkImport.description")}
            />
            <FeatureCard
              icon={<CheckCircle className="w-8 h-8 text-orange-600" />}
              title={t("landing.features.statusTracking.title")}
              description={t("landing.features.statusTracking.description")}
            />
            <FeatureCard
              icon={<Award className="w-8 h-8 text-orange-600" />}
              title={t("landing.features.digitalCertificates.title")}
              description={t("landing.features.digitalCertificates.description")}
            />
            <FeatureCard
              icon={<QrCode className="w-8 h-8 text-orange-600" />}
              title={t("landing.features.qrVerification.title")}
              description={t("landing.features.qrVerification.description")}
            />
            <FeatureCard
              icon={<Lock className="w-8 h-8 text-orange-600" />}
              title={t("landing.features.secureAccess.title")}
              description={t("landing.features.secureAccess.description")}
            />
            <FeatureCard
              icon={<Clock className="w-8 h-8 text-orange-600" />}
              title={t("landing.features.trainingHistory.title")}
              description={t("landing.features.trainingHistory.description")}
            />
          </div>
        </div>
      </section>

      {/* Safety Visual */}
      <section className="py-24 px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl font-bold text-gray-900">
                {t("landing.safetyCompliance.title")}
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                {t("landing.safetyCompliance.description")}
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-gray-700">{t("landing.safetyCompliance.point1")}</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-gray-700">{t("landing.safetyCompliance.point2")}</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-gray-700">{t("landing.safetyCompliance.point3")}</span>
                </li>
              </ul>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-orange-100 to-yellow-50 rounded-2xl p-8 shadow-xl">
                <img src="/Safety.gif" alt="Safety Training" className="w-full rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Verification CTA */}
      <section className="py-24 px-6 lg:px-8 bg-gradient-to-br from-orange-600 to-orange-700">
        <div className="max-w-4xl mx-auto text-center text-white space-y-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-4">
            <QrCode className="w-8 h-8" />
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold">
            {t("landing.verifyCta.title")}
          </h2>
          <p className="text-xl text-orange-50 max-w-2xl mx-auto">
            {t("landing.verifyCta.description")}
          </p>
          <Link href="/verify">
            <Button size="lg" className="bg-white text-orange-600 hover:bg-orange-50 h-14 px-8 text-lg font-semibold">
              <QrCode className="w-5 h-5 mr-2" />
              {t("landing.verifyCta.verifyNow")}
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 lg:px-8 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
                <HardHat className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-sm font-semibold text-gray-900">{t("nav.constructionSiteSafety")}</span>
            </div>
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} {t("landing.footer.copyright")}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ProcessStep({ number, icon, title, description }: { 
  number: string; 
  icon: React.ReactNode; 
  title: string; 
  description: string;
}) {
  return (
    <div className="relative">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="relative">
          <div className="w-16 h-16 bg-orange-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
            {icon}
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
            <span className="text-sm font-bold text-orange-600">{number}</span>
          </div>
        </div>
        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        <p className="text-gray-600 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
}) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}
