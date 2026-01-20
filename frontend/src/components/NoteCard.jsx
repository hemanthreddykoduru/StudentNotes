import { useNavigate } from 'react-router-dom';
import { FileText, ArrowRight } from 'lucide-react';

export default function NoteCard({ note }) {
    const navigate = useNavigate();

    return (
        <div
            onClick={() => navigate(`/notes/${note.id}`)}
            className="group relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden transform hover:-translate-y-1"
        >
            <div className="aspect-w-16 aspect-h-9 w-full h-48 bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-center p-4">
                {note.preview_url?.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                    <img src={note.preview_url} alt={note.title} className="w-full h-full object-contain" />
                ) : (
                    <FileText className="h-16 w-16 text-gray-400 dark:text-gray-600 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors" />
                )}
            </div>

            <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200">
                        {note.subject}
                    </span>
                    <span className="font-bold text-gray-900 dark:text-white">
                        ₹{note.price}
                    </span>
                </div>

                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {note.title}
                </h3>

                <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 mb-4">
                    High-quality study material for {note.subject}. Click to view details and purchase.
                </p>

                <div className="flex items-center text-sm text-gray-500 dark:text-gray-500 font-medium group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    View Details <ArrowRight className="ml-1 w-4 h-4" />
                </div>
            </div>
        </div>
    );
}
