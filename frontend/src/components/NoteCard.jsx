import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';

export default function NoteCard({ note }) {
    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <div className="h-48 bg-gray-200 flex items-center justify-center">
                {note.preview_url ? (
                    <img src={note.preview_url} alt={note.title} className="h-full w-full object-cover" />
                ) : (
                    <FileText className="h-16 w-16 text-gray-400" />
                )}
            </div>
            <div className="p-4">
                <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">
                    {note.subject}
                </div>
                <Link to={`/notes/${note.id}`} className="block mt-1 text-lg leading-tight font-medium text-black hover:underline">
                    {note.title}
                </Link>
                <div className="mt-2 flex items-center justify-between">
                    <span className="text-xl font-bold text-gray-900">₹{note.price}</span>
                    <Link to={`/notes/${note.id}`} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                        View Details
                    </Link>
                </div>
            </div>
        </div>
    );
}
