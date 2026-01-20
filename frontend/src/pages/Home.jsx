import { useEffect, useState } from 'react';
import api from '../lib/api';
import NoteCard from '../components/NoteCard';
import Hero3D from '../components/Hero3D';

export default function Home() {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotes();
    }, []);

    const fetchNotes = async () => {
        try {
            const { data } = await api.get('/notes');
            setNotes(data);
        } catch (error) {
            console.error('Error fetching notes:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">Loading...</div>;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-12">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl md:text-6xl mb-4">
                        <span className="block">Master Your Studies with</span>
                        <span className="block text-indigo-600 dark:text-indigo-400">Premium Notes</span>
                    </h1>
                    <p className="mt-3 max-w-md mx-auto text-base text-gray-500 dark:text-gray-400 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                        Access high-quality study materials, summaries, and guides to ace your exams.
                    </p>
                </div>
                <Hero3D />
            </div>

            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Latest Notes</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {notes.length > 0 ? (
                    notes.map((note) => <NoteCard key={note.id} note={note} />)
                ) : (
                    <p className="text-gray-500 dark:text-gray-400">No notes available yet.</p>
                )}
            </div>
        </div>
    );
}
