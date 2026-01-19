import { useEffect, useState } from 'react';
import api from '../lib/api';
import NoteCard from '../components/NoteCard';

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
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Latest Notes</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {notes.length > 0 ? (
                    notes.map((note) => <NoteCard key={note.id} note={note} />)
                ) : (
                    <p className="text-gray-500">No notes available yet.</p>
                )}
            </div>
        </div>
    );
}
