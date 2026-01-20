import { useEffect, useState } from 'react';
import api from '../lib/api';
import { supabase } from '../lib/supabase';
import { Plus, Trash2, Pencil, X } from 'lucide-react';

export default function AdminDashboard() {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [editingNote, setEditingNote] = useState(null);

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
            let fileUrl = editingNote ? editingNote.file_url : '';
            if (formData.file) {
                fileUrl = await uploadFile(formData.file, 'notes');
            }

            let previewUrl = editingNote ? editingNote.preview_url : '';
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

            if (editingNote) {
                await api.put(`/notes/${editingNote.id}`, noteData);
                alert('Note updated successfully!');
            } else {
                await api.post('/notes', noteData);
                alert('Note added successfully!');
            }

            setShowForm(false);
            setEditingNote(null);
            setFormData({ title: '', subject: '', price: '', file: null, preview: null });
            fetchNotes();

        } catch (error) {
            console.error('Error saving note:', error);
            alert(`Error: ${error.message}`);
        } finally {
            setUploading(false);
        }
    };

    const handleEdit = (note) => {
        setEditingNote(note);
        setFormData({
            title: note.title,
            subject: note.subject,
            price: note.price,
            file: null, // Don't pre-fill file inputs
            preview: null
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this note? This cannot be undone.")) return;

        try {
            await api.delete(`/notes/${id}`);
            alert('Note deleted successfully');
            fetchNotes();
        } catch (error) {
            console.error('Error deleting note:', error);
            alert('Failed to delete note');
        }
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingNote(null);
        setFormData({ title: '', subject: '', price: '', file: null, preview: null });
    };

    if (loading) return <div className="p-8 dark:text-gray-300">Loading...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
                <button
                    onClick={() => {
                        setEditingNote(null);
                        setFormData({ title: '', subject: '', price: '', file: null, preview: null });
                        setShowForm(!showForm);
                    }}
                    className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                    <Plus className="h-5 w-5 mr-1" />
                    Add Note
                </button>
            </div>

            {showForm && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8 relative">
                    <button
                        onClick={handleCancel}
                        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                        <X className="h-6 w-6" />
                    </button>
                    <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                        {editingNote ? 'Edit Note' : 'Add New Note'}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input type="text" name="title" placeholder="Title" required
                                value={formData.title} onChange={handleChange}
                                className="p-2 border rounded w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                            />
                            <input type="text" name="subject" placeholder="Subject" required
                                value={formData.subject} onChange={handleChange}
                                className="p-2 border rounded w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                            />
                            <input type="number" name="price" placeholder="Price (₹)" required min="10"
                                value={formData.price} onChange={handleChange}
                                className="p-2 border rounded w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Full PDF {editingNote && '(Leave empty to keep existing)'}
                                </label>
                                <label className="flex items-center justify-center w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer transition-colors">
                                    <span>{formData.file ? formData.file.name : 'Choose PDF File'}</span>
                                    <input type="file" name="file" accept=".pdf" required={!editingNote} onChange={handleChange} className="hidden" />
                                </label>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Preview (Image/PDF) {editingNote && '(Leave empty to keep existing)'}
                                </label>
                                <label className="flex items-center justify-center w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer transition-colors">
                                    <span>{formData.preview ? formData.preview.name : 'Choose Preview File'}</span>
                                    <input type="file" name="preview" accept=".pdf,.png,.jpg,.jpeg" required={!editingNote} onChange={handleChange} className="hidden" />
                                </label>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <button type="submit" disabled={uploading} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50">
                                {uploading ? 'Processing...' : (editingNote ? 'Update Note' : 'Save Note')}
                            </button>
                            <button type="button" onClick={handleCancel} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                    {notes.map(note => (
                        <li key={note.id} className="px-4 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">{note.title}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{note.subject} - ₹{note.price}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 text-xs rounded-full ${note.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'}`}>
                                    {note.is_active ? 'Active' : 'Inactive'}
                                </span>

                                <button
                                    onClick={() => handleEdit(note)}
                                    className="p-1 text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200"
                                    title="Edit"
                                >
                                    <Pencil className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={() => handleDelete(note.id)}
                                    className="p-1 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200"
                                    title="Delete"
                                >
                                    <Trash2 className="h-5 w-5" />
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
