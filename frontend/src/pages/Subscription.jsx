import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { supabase } from '../lib/supabase';

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
                    color: "#4f46e5"
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
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
            <div className="max-w-lg w-full space-y-8">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                        {hasSubscription ? 'You are a Pro Member!' : 'Unlock Unlimited Knowledge'}
                    </h2>
                    <p className="mt-4 text-lg text-gray-500">
                        {hasSubscription
                            ? 'Enjoy unlimited access to all premium notes on our platform.'
                            : 'Get access to every single premium note on our platform for one simple yearly price.'
                        }
                    </p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-indigo-100 transform transition-all hover:scale-105 duration-300">
                    <div className={`px-6 py-8 ${hasSubscription ? 'bg-green-600' : 'bg-indigo-600'} sm:p-10 sm:pb-6`}>
                        <div className="flex justify-center">
                            <span className={`inline-flex px-4 py-1 rounded-full text-sm font-semibold tracking-wide uppercase ${hasSubscription ? 'bg-green-100 text-green-600' : 'bg-indigo-100 text-indigo-600'}`}>
                                {hasSubscription ? 'Active Plan' : 'Pro Plan'}
                            </span>
                        </div>
                        <div className="mt-4 flex justify-center text-6xl font-extrabold text-white">
                            <span className="flex items-start tracking-tight">
                                <span className="mt-2 mr-2 text-4xl font-medium">₹</span>
                                1
                            </span>
                            <span className={`ml-1 text-2xl font-medium ${hasSubscription ? 'text-green-200' : 'text-indigo-200'} self-end mb-2`}>/year</span>
                        </div>
                    </div>
                    <div className="px-6 pt-6 pb-8 bg-gray-50 sm:p-10 sm:pt-6">
                        <ul className="space-y-4">
                            {[
                                'Access to ALL Premium Notes',
                                'Unlimited Views & Reading',
                                'Priority Support',
                                'Early Access to New Content',
                                'Secure Ad-free Experience',
                            ].map((feature) => (
                                <li key={feature} className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <svg className={`h-6 w-6 ${hasSubscription ? 'text-green-600' : 'text-green-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <p className="ml-3 text-base text-gray-700">{feature}</p>
                                </li>
                            ))}
                        </ul>
                        <div className="mt-8">
                            {hasSubscription ? (
                                <div className="w-full flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 shadow-lg cursor-default">
                                    ✓ Membership Active
                                </div>
                            ) : (
                                <button
                                    onClick={handleSubscribe}
                                    disabled={loading}
                                    className="w-full flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10 shadow-lg transition-all"
                                >
                                    {loading ? 'Processing...' : 'Upgrade to Pro Now'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
