import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User, Phone, Mail, Save, Loader } from 'lucide-react';

export default function MyAccount() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState({
        full_name: '',
        mobile_number: '',
    });

    useEffect(() => {
        const getProfile = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                setUser(user);

                if (user) {
                    const { data, error } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', user.id)
                        .single();

                    if (error && error.code !== 'PGRST116') {
                        throw error;
                    }

                    if (data) {
                        setProfile({
                            full_name: data.full_name || '',
                            mobile_number: data.mobile_number || '',
                        });
                    }
                }
            } catch (error) {
                console.error('Error loading profile:', error.message);
            } finally {
                setLoading(false);
            }
        };

        getProfile();
    }, []);

    const handleChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            // Use upsert to handle cases where the profile row might not exist yet
            const { error } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    email: user.email,
                    full_name: profile.full_name,
                    mobile_number: profile.mobile_number,
                });

            if (error) throw error;
            alert('Profile updated successfully!');
        } catch (error) {
            console.error('Error updating profile:', error.message);
            alert(`Error updating profile: ${error.message}`);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <Loader className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">My Account</h1>

            <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
                <div className="p-6 md:p-8 space-y-6">
                    <form onSubmit={handleSubmit}>
                        {/* Email - Read Only */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Email Address
                            </label>
                            <div className="relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    value={user?.email || ''}
                                    disabled
                                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                                />
                            </div>
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                Email cannot be changed.
                            </p>
                        </div>

                        {/* Full Name */}
                        <div className="mb-6">
                            <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Full Name
                            </label>
                            <div className="relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    name="full_name"
                                    id="full_name"
                                    value={profile.full_name}
                                    onChange={handleChange}
                                    placeholder="John Doe"
                                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                            </div>
                        </div>

                        {/* Mobile Number */}
                        <div className="mb-8">
                            <label htmlFor="mobile_number" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Mobile Number
                            </label>
                            <div className="relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Phone className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="tel"
                                    name="mobile_number"
                                    id="mobile_number"
                                    value={profile.mobile_number}
                                    onChange={handleChange}
                                    placeholder="9966659900"
                                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={saving}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                            >
                                {saving ? (
                                    <>
                                        <Loader className="animate-spin -ml-1 mr-2 h-4 w-4" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="-ml-1 mr-2 h-4 w-4" />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
