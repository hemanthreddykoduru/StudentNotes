import { useEffect, useState } from 'react';
import api from '../lib/api';
import { supabase } from '../lib/supabase';
import { Plus, Trash2, Pencil, X, TrendingUp, Users, FileText, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
    const [notes, setNotes] = useState([]);
    const [stats, setStats] = useState(null);
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
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            await Promise.all([fetchNotes(), fetchStats()]);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const { data } = await api.get('/analytics/stats');
            setStats(data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

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
            fetchData(); // Refresh everything including stats

        } catch (error) {
            console.error('Error saving note:', error);
            const message = error.response?.data?.error || error.message;
            alert(`Error: ${message}`);
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
            fetchStats(); // Update active note count
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Admin Dashboard</h1>

            {/* Analytics Section */}
            {stats && (
                <div className="mb-12 space-y-8">
                    {/* Key Metrics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center">
                            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 mr-4">
                                <DollarSign className="w-8 h-8" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Revenue</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{stats.totalRevenue.toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center">
                            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mr-4">
                                <Users className="w-8 h-8" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Users</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalUsers}</p>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center">
                            <div className="p-3 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 mr-4">
                                <FileText className="w-8 h-8" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Active Notes</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalNotes}</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Internal Revenue Chart */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                                <TrendingUp className="w-5 h-5 mr-2 text-indigo-500" />
                                Revenue Trend (Last 30 Days)
                            </h3>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stats.chartData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                        <XAxis
                                            dataKey="date"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 12, fill: '#6B7280' }}
                                            tickFormatter={(str) => {
                                                const d = new Date(str);
                                                return `${d.getDate()}/${d.getMonth() + 1}`;
                                            }}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 12, fill: '#6B7280' }}
                                            tickFormatter={(val) => `₹${val}`}
                                        />
                                        <Tooltip
                                            cursor={{ fill: '#F3F4F6' }}
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                        />
                                        <Bar dataKey="revenue" fill="#4F46E5" radius={[4, 4, 0, 0]} barSize={20} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Top Selling Notes */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Top Selling Notes</h3>
                            {stats.topNotes.length > 0 ? (
                                <div className="space-y-4">
                                    {stats.topNotes.map((note, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                            <div className="flex items-center">
                                                <span className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-xs font-bold text-gray-600 dark:text-gray-300 mr-3">
                                                    {index + 1}
                                                </span>
                                                <span className="font-medium text-gray-800 dark:text-white truncate max-w-[150px] sm:max-w-xs">{note.name}</span>
                                            </div>
                                            <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                                                {note.sales} sales
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 dark:text-gray-400 text-center py-10">No sales data yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Manage Notes</h2>
                <button
                    onClick={() => {
                        setEditingNote(null);
                        setFormData({ title: '', subject: '', price: '', file: null, preview: null });
                        setShowForm(!showForm);
                    }}
                    className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 shadow-sm transition-colors"
                >
                    <Plus className="h-5 w-5 mr-1" />
                    Add Note
                </button>
            </div>

            {showForm && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8 relative border border-gray-200 dark:border-gray-700">
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
                                className="p-2 border rounded w-full bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                            />
                            <input type="text" name="subject" placeholder="Subject" required
                                value={formData.subject} onChange={handleChange}
                                className="p-2 border rounded w-full bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                            />
                            <input type="number" name="price" placeholder="Price (₹)" required min="1"
                                value={formData.price} onChange={handleChange}
                                className="p-2 border rounded w-full bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
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
                        <div className="flex gap-4 pt-2">
                            <button type="submit" disabled={uploading} className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 font-medium transition-colors shadow-sm">
                                {uploading ? 'Processing...' : (editingNote ? 'Update Note' : 'Save Note')}
                            </button>
                            <button type="button" onClick={handleCancel} className="bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 px-6 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 font-medium transition-colors">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 sm:rounded-xl overflow-hidden">
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                    {notes.map(note => (
                        <li key={note.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <div className="flex items-center">
                                <FileText className="h-10 w-10 text-gray-400 bg-gray-100 dark:bg-gray-700 p-2 rounded-lg mr-4" />
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{note.title}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{note.subject} • ₹{note.price}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${note.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'}`}>
                                    {note.is_active ? 'Active' : 'Inactive'}
                                </span>

                                <button
                                    onClick={() => handleEdit(note)}
                                    className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                    title="Edit"
                                >
                                    <Pencil className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={() => handleDelete(note.id)}
                                    className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                    title="Delete"
                                >
                                    <Trash2 className="h-5 w-5" />
                                </button>
                            </div>
                        </li>
                    ))}
                    {notes.length === 0 && (
                        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                            No notes found. Create your first note above!
                        </div>
                    )}
                </ul>
            </div>
        </div>
    );
}
