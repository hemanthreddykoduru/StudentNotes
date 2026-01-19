import { useEffect, useState } from 'react';
import api from '../lib/api';
import { supabase } from '../lib/supabase';
import { Plus, Trash2, Eye, EyeOff } from 'lucide-react';

export default function AdminDashboard() {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [uploading, setUploading] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        subject: '',
        price: '',
        file: null,
        preview: null,
    });

    useEffect(() => {
        fetchNotes();
    }, []);

    const fetchNotes = async () => {
        try {
            // Fetch all notes (including inactive) - need backend to allow filtering or admin route
            // Re-using public route for now but ideally we need an admin route to see all.
            // The current backend route /api/notes only returns active=true.
            // We should update backend to return all for admin or just use Supabase client here.
            const { data, error } = await supabase
                .from('notes')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setNotes(data);
        } catch (error) {
            console.error('Error fetching notes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (files) {
            setFormData({ ...formData, [name]: files[0] });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const uploadFile = async (file, bucket) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from(bucket)
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
        return data.publicUrl;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);

        try {
            // Upload Main PDF
            let fileUrl = '';
            if (formData.file) {
                fileUrl = await uploadFile(formData.file, 'notes');
            }

            // Upload Preview (Image/PDF)
            let previewUrl = '';
            if (formData.preview) {
                previewUrl = await uploadFile(formData.preview, 'previews');
            }

            const noteData = {
                title: formData.title,
                subject: formData.subject,
                price: formData.price,
                file_url: fileUrl,
                preview_url: previewUrl
            };

            // Call backend API to insert (checks admin role)
            await api.post('/notes', noteData);

            alert('Note added successfully!');
            setShowForm(false);
            setFormData({ title: '', subject: '', price: '', file: null, preview: null });
            fetchNotes();

        } catch (error) {
            console.error('Error adding note:', error);
            alert(`Error: ${error.message} (Ensure you have created 'notes' and 'previews' buckets in Supabase Storage)`);
        } finally {
            setUploading(false);
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                    <Plus className="h-5 w-5 mr-1" />
                    Add Note
                </button>
            </div>

            {showForm && (
                <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                    <h2 className="text-xl font-semibold mb-4">Add New Note</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input type="text" name="title" placeholder="Title" required
                                value={formData.title} onChange={handleChange}
                                className="p-2 border rounded w-full"
                            />
                            <input type="text" name="subject" placeholder="Subject" required
                                value={formData.subject} onChange={handleChange}
                                className="p-2 border rounded w-full"
                            />
                            <input type="number" name="price" placeholder="Price (₹)" required min="10"
                                value={formData.price} onChange={handleChange}
                                className="p-2 border rounded w-full"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Full PDF</label>
                                <input type="file" name="file" accept=".pdf" required onChange={handleChange} className="mt-1 block w-full" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Preview (Image/PDF)</label>
                                <input type="file" name="preview" accept=".pdf,.png,.jpg,.jpeg" required onChange={handleChange} className="mt-1 block w-full" />
                            </div>
                        </div>
                        <button type="submit" disabled={uploading} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50">
                            {uploading ? 'Uploading...' : 'Save Note'}
                        </button>
                    </form>
                </div>
            )}

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                    {notes.map(note => (
                        <li key={note.id} className="px-4 py-4 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900">{note.title}</h3>
                                <p className="text-sm text-gray-500">{note.subject} - ₹{note.price}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 text-xs rounded-full ${note.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {note.is_active ? 'Active' : 'Inactive'}
                                </span>
                                {/* Add toggle active and delete logic here if needed */}
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
