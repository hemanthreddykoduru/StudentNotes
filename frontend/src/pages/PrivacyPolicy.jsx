import React from 'react';
import { Lock, Eye, ShieldCheck, Database } from 'lucide-react';

const PrivacyPolicy = () => {
    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
                    Privacy Policy
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                    Last updated: {new Date().toLocaleDateString()}
                </p>
            </div>

            <div className="space-y-8">
                <section className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        Your privacy is important to us. It is StudentNotes' policy to respect your privacy regarding any information we may collect from you across our website, and other sites we own and operate.
                    </p>
                </section>

                {/* Information We Collect */}
                <section className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
                            <Database className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">1. Information We Collect</h2>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                        We may ask for personal information, such as your:
                    </p>
                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2 ml-4">
                        <li>Name</li>
                        <li>Email</li>
                        <li>Telephone number</li>
                        <li>Payment information</li>
                    </ul>
                </section>

                {/* How We Use Information */}
                <section className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                            <Eye className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">2. How We Use Information</h2>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        We use the information we collect in various ways, including to:
                    </p>
                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2 ml-4 mt-2">
                        <li>Provide, operate, and maintain our website</li>
                        <li>Improve, personalize, and expand our website</li>
                        <li>Understand and analyze how you use our website</li>
                        <li>Process your transactions and manage your orders</li>
                        <li>Send you emails</li>
                    </ul>
                </section>

                {/* Security */}
                <section className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
                            <Lock className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">3. Security</h2>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        We value your trust in providing us your Personal Information, thus we are striving to use commercially acceptable means of protecting it. But remember that no method of transmission over the internet, or method of electronic storage is 100% secure and reliable, and we cannot guarantee its absolute security.
                    </p>
                </section>

                {/* Disclosure */}
                <section className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-lg">
                            <ShieldCheck className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                        </div>
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">4. Disclosure to Third Parties</h2>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        We do not sell, trade, or otherwise transfer to outside parties your Personally Identifiable Information unless we do so with advance notice. This does not include website hosting partners and other parties who assist us in operating our website, conducting our business, or serving our users, so long as those parties agree to keep this information confidential.
                    </p>
                </section>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
