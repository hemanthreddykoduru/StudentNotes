import React from 'react';
import { Shield, FileText, AlertCircle, RefreshCcw } from 'lucide-react';

const TermsOfService = () => {
    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
                    Terms of Service
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                    Last updated: {new Date().toLocaleDateString()}
                </p>
            </div>

            <div className="space-y-8">
                {/* Introduction */}
                <section className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
                            <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">1. Introduction</h2>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        Welcome to StudentNotes. By accessing our website and using our services, you agree to comply with and be bound by the following terms and conditions. Please review these terms carefully. If you do not agree to these terms, you should not use this site.
                    </p>
                </section>

                {/* Use of Services */}
                <section className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                            <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">2. Use of Services</h2>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                        You agree to use our services only for lawful purposes. You are prohibited from violating or attempting to violate the security of the site, including, without limitation:
                    </p>
                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2 ml-4">
                        <li>Accessing data not intended for you.</li>
                        <li>Attempting to probe, scan, or test the vulnerability of the system.</li>
                        <li>Interfering with service to any other user, host, or network.</li>
                    </ul>
                </section>

                {/* Cancellation and Refund Policy - CRITICAL FOR STRIPE */}
                <section className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 border-l-4 border-l-blue-500">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                            <RefreshCcw className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">3. Cancellation & Refund Policy</h2>
                    </div>
                    <div className="space-y-4 text-gray-600 dark:text-gray-300 leading-relaxed">
                        <p>
                            We want you to be completely satisfied with your purchase. However, because our products are digital goods delivered via Internet download, we generally offer no refunds.
                        </p>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mt-4">Cancellation</h3>
                        <p>
                            You may cancel your subscription at any time. Your subscription will remain active until the end of the current billing period, after which it will not renew. No partial refunds are provided for cancellations during an active billing cycle.
                        </p>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mt-4">Refunds</h3>
                        <p>
                            Refund requests are handled on a case-by-case basis and are issued at our sole discretion. If you believe there has been an error in billing or technical issue preventing access to content, please contact support within 7 days of purchase.
                        </p>
                    </div>
                </section>

                {/* Disclaimer */}
                <section className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-lg">
                            <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                        </div>
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">4. Limitation of Liability</h2>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        In no event shall StudentNotes or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on StudentNotes' website.
                    </p>
                </section>
            </div>
        </div>
    );
};

export default TermsOfService;
