import { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { supabase } from '../../lib/supabase';

const pageSize = 10;

const emptyForm = {
  name: '',
  event: '',
  quote: '',
  rating: 5,
  is_active: true,
};

export default function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalTestimonials, setTotalTestimonials] = useState(0);

  useEffect(() => {
    const handle = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(handle);
  }, [searchTerm]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  useEffect(() => {
    fetchTestimonials(page, debouncedSearch);
  }, [page, debouncedSearch]);

  async function fetchTestimonials(currentPage = page, term = debouncedSearch) {
    setLoading(true);
    const from = (currentPage - 1) * pageSize;
    const to = from + pageSize - 1;

    try {
      let query = supabase
        .from('testimonials')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (term && term.trim()) {
        const trimmed = term.trim();
        query = query.or(`name.ilike.%${trimmed}%,event.ilike.%${trimmed}%,quote.ilike.%${trimmed}%`);
      }

      const { data, error, count } = await query;
      if (error) throw error;

      const list = data || [];
      if (list.length === 0 && currentPage > 1 && (count || 0) > 0) {
        setLoading(false);
        setPage(currentPage - 1);
        return;
      }

      setTestimonials(list);
      setTotalTestimonials(count || 0);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      alert('Error fetching testimonials: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setFormData(emptyForm);
    setEditingTestimonial(null);
  }

  function openCreateForm() {
    resetForm();
    setShowForm(true);
  }

  function openEditForm(testimonial) {
    setEditingTestimonial(testimonial);
    setFormData({
      name: testimonial.name || '',
      event: testimonial.event || '',
      quote: testimonial.quote || '',
      rating: testimonial.rating ?? 5,
      is_active: testimonial.is_active ?? true,
    });
    setShowForm(true);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const payload = {
      name: formData.name.trim(),
      event: formData.event.trim() || null,
      quote: formData.quote.trim(),
      rating: parseInt(formData.rating, 10) || 5,
      is_active: Boolean(formData.is_active),
    };

    if (!payload.name || !payload.quote) {
      alert('Name and quote are required.');
      return;
    }

    try {
      if (editingTestimonial) {
        const { error } = await supabase
          .from('testimonials')
          .update(payload)
          .eq('id', editingTestimonial.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('testimonials')
          .insert([payload]);
        if (error) throw error;
      }

      setShowForm(false);
      resetForm();
      fetchTestimonials();
    } catch (error) {
      console.error('Error saving testimonial:', error);
      alert('Error saving testimonial: ' + error.message);
    }
  }

  async function handleDelete(testimonial) {
    if (!window.confirm(`Delete testimonial from ${testimonial.name}?`)) return;

    try {
      const { error } = await supabase
        .from('testimonials')
        .delete()
        .eq('id', testimonial.id);
      if (error) throw error;
      fetchTestimonials();
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      alert('Error deleting testimonial: ' + error.message);
    }
  }

  async function toggleActive(testimonial) {
    try {
      const { error } = await supabase
        .from('testimonials')
        .update({ is_active: !(testimonial.is_active ?? true) })
        .eq('id', testimonial.id);
      if (error) throw error;
      fetchTestimonials();
    } catch (error) {
      console.error('Error updating testimonial:', error);
      alert('Error updating testimonial: ' + error.message);
    }
  }

  const totalPages = Math.max(1, Math.ceil(totalTestimonials / pageSize));

  return (
    <AdminLayout>
      <div className="admin-products">
        <div className="page-header">
          <h1>Testimonials</h1>
          <button className="btn-primary" onClick={openCreateForm}>
            Add Testimonial
          </button>
        </div>

        <div className="table-toolbar">
          <input
            type="text"
            placeholder="Search testimonials..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="table-search"
          />
        </div>

        <div className="category-management-table-wrap">
          <table className="category-management-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Event</th>
                <th>Rating</th>
                <th>Status</th>
                <th>Quote</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6">Loading...</td>
                </tr>
              ) : testimonials.length === 0 ? (
                <tr>
                  <td colSpan="6" className="category-empty-state">No testimonials found</td>
                </tr>
              ) : (
                testimonials.map((testimonial) => (
                  <tr key={testimonial.id}>
                    <td>{testimonial.name}</td>
                    <td>{testimonial.event || '-'}</td>
                    <td>{testimonial.rating ?? 5}</td>
                    <td>{(testimonial.is_active ?? true) ? 'Active' : 'Inactive'}</td>
                    <td style={{ maxWidth: '320px' }}>{testimonial.quote}</td>
                    <td className="category-actions-cell">
                      <button className="btn-edit" onClick={() => openEditForm(testimonial)}>Edit</button>
                      <button className="btn-view" onClick={() => toggleActive(testimonial)}>
                        {(testimonial.is_active ?? true) ? 'Deactivate' : 'Activate'}
                      </button>
                      <button className="btn-delete" onClick={() => handleDelete(testimonial)}>Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="pagination-bar">
          <div className="pagination-info">
            Page {page} of {totalPages} · {totalTestimonials} testimonials
          </div>
          <div className="pagination-controls">
            <button
              className="btn-secondary"
              disabled={page <= 1}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            >
              Previous
            </button>
            <button
              className="btn-secondary"
              disabled={page >= totalPages}
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{editingTestimonial ? 'Edit Testimonial' : 'Add Testimonial'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Event</label>
                <input
                  type="text"
                  value={formData.event}
                  onChange={(e) => setFormData({ ...formData, event: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Quote</label>
                <textarea
                  rows="4"
                  value={formData.quote}
                  onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Rating</label>
                  <select
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                  >
                    {[1, 2, 3, 4, 5].map((value) => (
                      <option key={value} value={value}>{value}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group checkbox">
                  <input
                    type="checkbox"
                    id="testimonial-active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  />
                  <label htmlFor="testimonial-active">Active</label>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => { setShowForm(false); resetForm(); }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingTestimonial ? 'Save Changes' : 'Create Testimonial'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
