import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useEffect, useState } from 'react';
import { BookOpen, LogOut, ShoppingBag, User } from 'lucide-react';

export default function Navbar() {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState('user');
    const navigate = useNavigate();

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            if (session?.user) fetchProfile(session.user.id);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) fetchProfile(session.user.id);
            else setRole('user');
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchProfile = async (userId) => {
        const { data } = await supabase.from('profiles').select('role').eq('id', userId).single();
        if (data) setRole(data.role);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    return (
        <nav className="bg-white shadow">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <Link to="/" className="flex-shrink-0 flex items-center">
                            <BookOpen className="h-8 w-8 text-indigo-600" />
                            <span className="ml-2 text-xl font-bold text-gray-900">NotesMarket</span>
                        </Link>
                    </div>
                    <div className="flex items-center space-x-4">
                        {user ? (
                            <>
                                {role === 'admin' && (
                                    <Link to="/admin" className="text-gray-600 hover:text-gray-900 font-medium">
                                        Admin
                                    </Link>
                                )}
                                <Link to="/" className="text-gray-900 px-3 py-2 rounded-md text-sm font-medium hover:text-indigo-600">
                                    Home
                                </Link>
                                <Link to="/pricing" className="text-gray-900 px-3 py-2 rounded-md text-sm font-medium hover:text-indigo-600">
                                    Pricing
                                </Link>
                                {user && (
                                    <Link to="/my-purchases" className="text-gray-900 px-3 py-2 rounded-md text-sm font-medium hover:text-indigo-600">
                                        My Purchases
                                    </Link>
                                )}

                                <div className="h-6 w-px bg-gray-200 mx-2" aria-hidden="true" />

                                <div className="flex items-center gap-3">
                                    <div className="flex flex-col items-end">
                                        <span className="text-sm font-medium text-gray-700 hidden md:block max-w-[150px] truncate">
                                            {user.email}
                                        </span>
                                        <span className="text-xs text-gray-500 capitalize">{role}</span>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="text-gray-400 hover:text-red-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
                                        title="Sign out"
                                    >
                                        <LogOut className="h-5 w-5" />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <Link
                                to="/login"
                                className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
                            >
                                Login
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
