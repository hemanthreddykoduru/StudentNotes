import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { supabase } from '../lib/supabase';
import { Sparkles, Check, Shield, Zap, BookOpen, Star } from 'lucide-react';

export default function Subscription() {
    const [loading, setLoading] = useState(false);
    const [hasSubscription, setHasSubscription] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        checkSubscriptionStatus();
    }, []);

    const checkSubscriptionStatus = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const { data: subscriptions } = await supabase
                .from('subscriptions')
                .select('*')
                .eq('user_id', session.user.id)
                .eq('status', 'active')
                .gt('end_date', new Date().toISOString())
                .limit(1);

            if (subscriptions && subscriptions.length > 0) {
                setHasSubscription(true);
            }
        } catch (error) {
            console.error('Error checking subscription:', error);
        }
    };

    const handleSubscribe = async () => {
        if (hasSubscription) return;
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                navigate('/login');
                return;
            }

            // 1. Create Subscription Order
            const { data: order } = await api.post('/payments/create-subscription-order');

            // 2. Open Razorpay
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: "Student Notes Pro",
                description: "1 Year Premium Subscription",
                order_id: order.id,
                handler: async function (response) {
                    try {
                        // 3. Verify Payment
                        await api.post('/payments/verify-subscription', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        });
                        alert('Welcome to Pro! You now have access to all notes.');
                        setHasSubscription(true);
                        navigate('/');
                    } catch (error) {
                        alert('Subscription verification failed');
                    }
                },
                prefill: {
                    email: user.email
                },
                theme: {
                    color: "#4F46E5"
                }
            };

            const rzp1 = new window.Razorpay(options);
            rzp1.open();

        } catch (error) {
            console.error('Error initiating subscription:', error);
            const errorMessage = error.response?.data?.error || error.message || 'Failed to start subscription';
            alert(`Error: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-200">
            {/* Background Decorative Blobs */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-[100px]"></div>
            </div>

            <div className="max-w-4xl mx-auto relative z-10">
                <div className="text-center mb-16">
                    <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm font-semibold tracking-wide uppercase mb-4 shadow-sm border border-indigo-200 dark:border-indigo-800">
                        <Star className="w-4 h-4 mr-2 text-indigo-500" />
                        Premium Access
                    </span>
                    <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-4">
                        {hasSubscription ? 'You are a Pro Member!' : 'Invest in Your Knowledge'}
                    </h2>
                    <p className="mt-4 text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                        {hasSubscription
                            ? 'You have unlimited access to every note. Keep learning and growing!'
                            : 'Get unlimited access to high-quality study materials, exam notes, and more for less than the price of a coffee.'
                        }
                    </p>
                </div>

                <div className="relative transform hover:scale-[1.01] transition-all duration-300 ease-out">
                    {/* Gradient Border Glow */}
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-75 animate-pulse"></div>

                    <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
                        {/* Price Section */}
                        <div className="md:w-5/12 bg-gray-900 text-white p-8 md:p-12 flex flex-col justify-center items-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-700 opacity-90"></div>
                            <div className="relative z-10 text-center">
                                <h3 className="text-2xl font-semibold mb-2 text-indigo-100">Pro Pass</h3>
                                <div className="flex justify-center items-baseline my-6">
                                    <span className="text-6xl font-extrabold tracking-tight">₹1</span>
                                    <span className="text-xl text-indigo-200 ml-2">/year</span>
                                </div>
                                <p className="text-indigo-100 mb-8 text-sm opacity-90">
                                    Billed annually. Cancel anytime.
                                </p>

                                {hasSubscription ? (
                                    <div className="w-full py-3 px-6 rounded-lg bg-green-500 text-white font-bold flex items-center justify-center shadow-lg">
                                        <Check className="w-5 h-5 mr-2" />
                                        Active
                                    </div>
                                ) : (
                                    <button
                                        onClick={handleSubscribe}
                                        disabled={loading}
                                        className="w-full py-4 px-8 rounded-xl bg-white text-indigo-600 font-bold text-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-900 transition-all shadow-lg flex items-center justify-center"
                                    >
                                        {loading ? (
                                            <span className="flex items-center">
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Processing...
                                            </span>
                                        ) : (
                                            <>
                                                <Sparkles className="w-5 h-5 mr-2" />
                                                Get Instant Access
                                            </>
                                        )}
                                    </button>
                                )}
                                <p className="mt-4 text-xs text-indigo-200 flex items-center justify-center">
                                    <Shield className="w-3 h-3 mr-1" />
                                    Secure payment via Razorpay
                                </p>
                            </div>
                        </div>

                        {/* Features Section */}
                        <div className="md:w-7/12 p-8 md:p-12 bg-white dark:bg-gray-800">
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-6">What's included in Pro:</h4>
                            <ul className="space-y-6">
                                {[
                                    { icon: BookOpen, text: "Access to entire library of notes", sub: "Unlock every subject and topic instantly." },
                                    { icon: Zap, text: "Priority access to new uploads", sub: "Be the first to see new study materials." },
                                    { icon: Star, text: "Ad-free experience", sub: "Focus on your studies without distractions." },
                                    { icon: Shield, text: "Premium quality PDFs", sub: "High-resolution downloads for clarity." },
                                ].map((feature, index) => (
                                    <li key={index} className="flex items-start">
                                        <div className="flex-shrink-0">
                                            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-indigo-50 dark:bg-gray-700 text-indigo-600 dark:text-indigo-400">
                                                <feature.icon className="h-6 w-6" aria-hidden="true" />
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-base font-semibold text-gray-900 dark:text-white">
                                                {feature.text}
                                            </p>
                                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                                {feature.sub}
                                            </p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
