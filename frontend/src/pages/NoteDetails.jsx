import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { supabase } from '../lib/supabase';
import { FileText, Download } from 'lucide-react';

export default function NoteDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [note, setNote] = useState(null);
    const [loading, setLoading] = useState(true);
    const [purchased, setPurchased] = useState(false);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchNoteDetails();
        checkPurchaseStatus();
    }, [id]);

    const fetchNoteDetails = async () => {
        try {
            const { data } = await api.get(`/notes/${id}`);
            setNote(data);
        } catch (error) {
            console.error('Error fetching note:', error);
        } finally {
            setLoading(false);
        }
    };

    const checkPurchaseStatus = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session || !note) return;

        try {
            const { data, error } = await supabase
                .from('purchases')
                .select('*')
                .eq('user_id', session.user.id)
                .eq('note_id', note.id)
                .single(); // Assuming one purchase per note per user

            if (data && !error) {
                setPurchased(true);
            }
        } catch (error) {
            console.error('Error checking purchase status:', error);
        }
    };

    // Add effect to check purchase status whenever note changes
    useEffect(() => {
        if (note) {
            checkPurchaseStatus();
        }
    }, [note]);

    const handleBuy = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            navigate('/login');
            return;
        }

        if (purchased) {
            alert('You have already purchased this note!');
            return;
        }

        setProcessing(true);
        try {
            // 1. Create Order
            const { data: order } = await api.post('/payments/create-order', { noteId: note.id });

            // 2. Open Razorpay
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: 'NotesMarket',
                description: `Purchase ${note.title}`,
                order_id: order.id,
                handler: async function (response) {
                    try {
                        // 3. Verify Payment
                        await api.post('/payments/verify', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            noteId: note.id
                        });
                        alert('Payment Successful!');
                        setPurchased(true);
                        // Redirect or just update UI
                    } catch (verifyError) {
                        console.error(verifyError);
                        alert('Payment Verification Failed');
                    }
                },
                prefill: {
                    email: session.user.email,
                },
                theme: {
                    color: '#4f46e5',
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (error) {
            console.error('Payment Error:', error);
            alert('Something went wrong initializing payment');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!note) return <div>Note not found</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-2xl leading-6 font-medium text-gray-900">{note.title}</h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">{note.subject}</p>
                </div>
                <div className="border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                        <div className="h-96 bg-gray-100 flex items-center justify-center border rounded overflow-hidden relative">
                            {note.preview_url ? (
                                note.preview_url.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                                    <img
                                        src={note.preview_url}
                                        alt={note.title}
                                        className="w-full h-full object-contain"
                                    />
                                ) : (
                                    <iframe
                                        src={`${note.preview_url}#toolbar=0&navpanes=0&scrollbar=0`}
                                        className="w-full h-full overflow-hidden"
                                        title="Preview"
                                        scrolling="no"
                                    />
                                )
                            ) : (
                                <FileText className="h-24 w-24 text-gray-400" />
                            )}
                        </div>
                        <div className="flex flex-col justify-between">
                            <div>
                                <p className="text-gray-700 mb-4">
                                    Get full access to this premium note used by top students.
                                    Includes detailed explanations, diagrams, and summary.
                                </p>
                                <h4 className="text-3xl font-bold text-gray-900 mb-4">₹{note.price}</h4>
                            </div>

                            {purchased ? ( // Show Full Screen Button if already bought
                                <div className="space-y-3">
                                    <div className="p-3 bg-green-100 text-green-800 rounded-md text-center font-medium">
                                        ✅ You own this note
                                    </div>
                                    <button
                                        onClick={() => {
                                            const elem = document.getElementById('pdf-container');
                                            if (elem && elem.requestFullscreen) {
                                                elem.requestFullscreen();
                                            }
                                        }}
                                        className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4M4 20l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                        </svg>
                                        View in Full Screen
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={handleBuy}
                                    disabled={processing}
                                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                >
                                    {processing ? 'Processing...' : 'Buy Now'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
                {/* Hidden Wrapper for Full Screen logic */}
                {purchased && (
                    <div className="h-0 w-0 overflow-hidden">
                        <div id="pdf-container" className="bg-gray-100 flex items-center justify-center h-screen w-screen">
                            <iframe
                                src={`${note.file_url}#toolbar=0&navpanes=0&scrollbar=0`}
                                className="w-full h-full bg-white"
                                title="Full Note"
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
