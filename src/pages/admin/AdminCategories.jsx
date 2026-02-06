import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { supabase } from '../../lib/supabase';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [productCounts, setProductCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalCategories, setTotalCategories] = useState(0);
  const pageSize = 10;
  const [exporting, setExporting] = useState(false);
  const [categoryIndex, setCategoryIndex] = useState({});
  const [importFileInputKey, setImportFileInputKey] = useState(0);
  const [importState, setImportState] = useState({
    step: 'idle', // idle | map | preview
    columns: [],
    rawRows: [],
    mapping: {
      name: '',
      display_order: '',
      is_active: '',
    },
    previewRows: [],
    duplicates: [],
    loading: false,
  });
  const [formData, setFormData] = useState({
    name: '',
    display_order: '',
    is_active: true,
  });

  useEffect(() => {
    const handle = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(handle);
  }, [searchTerm]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  useEffect(() => {
    fetchCategoriesAndCounts(page, debouncedSearch);
  }, [page, debouncedSearch]);

  useEffect(() => {
    fetchCategoryIndex();
  }, []);

  const nextDisplayOrder = useMemo(() => {
    if (categories.length === 0) return 1;
    const max = categories.reduce((acc, cat) => {
      const value = Number.isFinite(cat.display_order) ? cat.display_order : parseInt(cat.display_order, 10);
      return Math.max(acc, Number.isFinite(value) ? value : 0);
    }, 0);
    return max + 1;
  }, [categories]);
  const totalPages = Math.max(1, Math.ceil(totalCategories / pageSize));

  async function fetchCategoriesAndCounts(currentPage = page, term = searchTerm) {
    setLoading(true);
    const from = (currentPage - 1) * pageSize;
    const to = from + pageSize - 1;
    try {
      const [{ data: categoriesData, count, error: catError }, { data: productsData, error: prodError }] =
        await Promise.all([
          (() => {
            let q = supabase
              .from('categories')
              .select('*', { count: 'exact' })
              .order('display_order', { ascending: true })
              .range(from, to);
            if (term && term.trim()) {
              const trimmed = term.trim();
              q = q.ilike('name', `%${trimmed}%`);
            }
            return q;
          })(),
          supabase.from('products').select('id, category'),
        ]);

      if (catError) throw catError;
      if (prodError) throw prodError;

      const list = categoriesData || [];
      if (list.length === 0 && currentPage > 1 && (count || 0) > 0) {
        setLoading(false);
        setPage(currentPage - 1);
        return;
      }

      setCategories(list);
      setTotalCategories(count || 0);

      const counts = {};
      (productsData || []).forEach((product) => {
        const key = product.category || 'Uncategorized';
        counts[key] = (counts[key] || 0) + 1;
      });
      setProductCounts(counts);
    } catch (error) {
      console.error('Error loading categories:', error);
      alert('Error loading categories: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchCategoryIndex() {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name');
      if (error) throw error;
      const index = {};
      (data || []).forEach((category) => {
        if (category.name) {
          index[category.name.trim().toLowerCase()] = category.id;
        }
      });
      setCategoryIndex(index);
      return index;
    } catch (error) {
      console.error('Error loading category index:', error);
      return {};
    }
  }

  function parseCsvLine(line) {
    const cells = [];
    let cell = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cell += '"';
          i += 1;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        cells.push(cell.trim());
        cell = '';
      } else {
        cell += char;
      }
    }
    cells.push(cell.trim());
    return cells;
  }

  function parseCsv(text) {
    const lines = text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
    if (lines.length < 2) return { columns: [], rows: [] };
    const columns = parseCsvLine(lines[0]);
    const rows = lines.slice(1).map((line) => {
      const values = parseCsvLine(line);
      const row = {};
      columns.forEach((column, idx) => {
        row[column] = values[idx] ?? '';
      });
      return row;
    });
    return { columns, rows };
  }

  function normalizeBoolean(value, defaultValue = true) {
    if (value === undefined || value === null || value === '') return defaultValue;
    const normalized = String(value).trim().toLowerCase();
    if (['true', '1', 'yes', 'y', 'active'].includes(normalized)) return true;
    if (['false', '0', 'no', 'n', 'inactive'].includes(normalized)) return false;
    return defaultValue;
  }

  function openImportMapping(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = String(event.target?.result || '');
      const { columns, rows } = parseCsv(text);
      if (rows.length === 0) {
        alert('Import file has no rows.');
        return;
      }

      const findColumn = (candidates) => columns.find((column) => {
        const normalized = column.toLowerCase();
        return candidates.some((candidate) => normalized.includes(candidate));
      }) || '';

      setImportState((prev) => ({
        ...prev,
        step: 'map',
        columns,
        rawRows: rows,
        mapping: {
          name: findColumn(['name', 'category']),
          display_order: findColumn(['display_order', 'order', 'sort']),
          is_active: findColumn(['is_active', 'active', 'status']),
        },
      }));
    };
    reader.readAsText(file);
  }

  async function buildImportPreview() {
    const { rawRows, mapping } = importState;
    if (!mapping.name) {
      alert('Please map category name before preview.');
      return;
    }

    const previewRows = rawRows
      .map((row) => ({
        name: String(row[mapping.name] ?? '').trim(),
        display_order: mapping.display_order ? parseInt(row[mapping.display_order], 10) || 0 : 0,
        is_active: mapping.is_active ? normalizeBoolean(row[mapping.is_active], true) : true,
      }))
      .filter((row) => row.name.length > 0);

    if (previewRows.length === 0) {
      alert('No valid category rows after mapping.');
      return;
    }

    const latestIndex = await fetchCategoryIndex();
    const duplicates = previewRows.filter((row) => latestIndex[row.name.toLowerCase()]);

    setImportState((prev) => ({
      ...prev,
      previewRows,
      duplicates,
      step: 'preview',
    }));
  }

  async function confirmImport() {
    const { previewRows, duplicates } = importState;
    if (previewRows.length === 0) return;

    if (duplicates.length > 0) {
      const approved = confirm(
        `${duplicates.length} categories already exist by name. Overwrite existing categories with the imported rows?`
      );
      if (!approved) return;
    }

    setImportState((prev) => ({ ...prev, loading: true }));

    try {
      const latestIndex = await fetchCategoryIndex();
      for (const row of previewRows) {
        const existingId = latestIndex[row.name.toLowerCase()];
        if (existingId) {
          const { error } = await supabase
            .from('categories')
            .update({
              name: row.name,
              display_order: row.display_order,
              is_active: row.is_active,
            })
            .eq('id', existingId);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('categories')
            .insert([{
              name: row.name,
              display_order: row.display_order,
              is_active: row.is_active,
            }]);
          if (error) throw error;
        }
      }

      await fetchCategoryIndex();
      await fetchCategoriesAndCounts(1, debouncedSearch);
      setPage(1);
      setImportState((prev) => ({ ...prev, loading: false, step: 'idle' }));
      setImportFileInputKey((prev) => prev + 1);
      alert('Category import completed.');
    } catch (error) {
      console.error('Error importing categories:', error);
      alert('Error importing categories: ' + error.message);
      setImportState((prev) => ({ ...prev, loading: false }));
    }
  }

  async function exportCategoriesCsv() {
    setExporting(true);
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('name, display_order, is_active')
        .order('display_order', { ascending: true });
      if (error) throw error;

      const headers = ['name', 'display_order', 'is_active'];
      const rows = (data || []).map((category) =>
        headers.map((header) => `"${String(category[header] ?? '').replace(/"/g, '""')}"`).join(',')
      );
      const csv = [headers.join(','), ...rows].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `categories-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting categories:', error);
      alert('Error exporting categories: ' + error.message);
    } finally {
      setExporting(false);
    }
  }

  function openNewForm() {
    setEditingCategory(null);
    setFormData({
      name: '',
      display_order: nextDisplayOrder,
      is_active: true,
    });
    setShowForm(true);
  }

  function openEditForm(category) {
    setEditingCategory(category);
    setFormData({
      name: category.name || '',
      display_order: Number.isFinite(category.display_order)
        ? category.display_order
        : category.display_order || '',
      is_active: category.is_active !== false,
    });
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      alert('Category name is required.');
      return;
    }

    const parsedOrder = parseInt(formData.display_order, 10);
    const payload = {
      name: trimmedName,
      display_order: Number.isNaN(parsedOrder) ? 0 : parsedOrder,
      is_active: formData.is_active,
    };

    try {
      if (editingCategory) {
        const nameChanged = trimmedName !== editingCategory.name;
        const { error } = await supabase
          .from('categories')
          .update(payload)
          .eq('id', editingCategory.id);

        if (error) throw error;

        if (nameChanged) {
          const { error: productError } = await supabase
            .from('products')
            .update({ category: trimmedName })
            .eq('category', editingCategory.name);

          if (productError) throw productError;
        }
      } else {
        const { error } = await supabase.from('categories').insert([payload]);
        if (error) throw error;
      }

      setShowForm(false);
      setEditingCategory(null);
      fetchCategoryIndex();
      await fetchCategoriesAndCounts();
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Error saving category: ' + error.message);
    }
  }

  async function handleToggle(category) {
    const isActive = category.is_active !== false;
    const nextActive = !isActive;
    const actionLabel = nextActive ? 'restore' : 'remove';
    const productCount = productCounts[category.name] || 0;
    const warning = !nextActive && productCount > 0
      ? ` This category has ${productCount} product(s). They will be hidden from the menu while inactive.`
      : '';

    if (!confirm(`Are you sure you want to ${actionLabel} "${category.name}"?${warning}`)) return;

    try {
      const { error } = await supabase
        .from('categories')
        .update({ is_active: nextActive })
        .eq('id', category.id);

      if (error) throw error;
      fetchCategoryIndex();
      await fetchCategoriesAndCounts();
    } catch (error) {
      console.error('Error updating category:', error);
      alert('Error updating category');
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="loading">Loading...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-products">
        <div className="page-header">
          <h1>Categories</h1>
          <button type="button" onClick={openNewForm} className="btn-primary">
            + Add Category
          </button>
        </div>

        <div className="table-toolbar">
          <input
            type="search"
            placeholder="Search categories"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="table-search"
          />
          <div className="table-toolbar-actions">
            <label className="btn-secondary toolbar-btn" style={{ margin: 0 }}>
              Import CSV
              <input
                key={importFileInputKey}
                type="file"
                accept=".csv,text/csv"
                style={{ display: 'none' }}
                onChange={(e) => openImportMapping(e.target.files?.[0])}
              />
            </label>
            <button type="button" className="btn-secondary toolbar-btn" onClick={exportCategoriesCsv} disabled={exporting}>
              {exporting ? 'Exporting...' : 'Export CSV'}
            </button>
          </div>
        </div>

        {importState.step !== 'idle' && (
          <div className="modal-overlay" onClick={() => setImportState((prev) => ({ ...prev, step: 'idle' }))}>
            <div className="modal category-modal" onClick={(e) => e.stopPropagation()}>
              <h2>Import Categories</h2>
              {importState.step === 'map' && (
                <>
                  <p>Map CSV columns to category fields before preview.</p>
                  {[
                    ['name', 'Category Name (required)'],
                    ['display_order', 'Display Order'],
                    ['is_active', 'Active Status'],
                  ].map(([field, label]) => (
                    <div className="form-group" key={field}>
                      <label>{label}</label>
                      <select
                        value={importState.mapping[field] || ''}
                        onChange={(e) =>
                          setImportState((prev) => ({
                            ...prev,
                            mapping: {
                              ...prev.mapping,
                              [field]: e.target.value,
                            },
                          }))
                        }
                      >
                        <option value="">Not mapped</option>
                        {importState.columns.map((column) => (
                          <option key={column} value={column}>
                            {column}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                  <div className="form-actions">
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => setImportState((prev) => ({ ...prev, step: 'idle' }))}
                    >
                      Cancel
                    </button>
                    <button type="button" className="btn-primary" onClick={buildImportPreview}>
                      Preview Import
                    </button>
                  </div>
                </>
              )}
              {importState.step === 'preview' && (
                <>
                  <p>
                    {importState.previewRows.length} rows ready. {importState.duplicates.length} matching names
                    found in existing categories.
                  </p>
                  <div style={{ maxHeight: '320px', overflow: 'auto', border: '1px solid #e5e5e5', borderRadius: '8px' }}>
                    <table className="products-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Order</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {importState.previewRows.slice(0, 100).map((row, idx) => (
                          <tr key={`${row.name}-${idx}`}>
                            <td>{row.name}</td>
                            <td>{row.display_order}</td>
                            <td>{row.is_active ? 'Active' : 'Inactive'}</td>
                            <td>{categoryIndex[row.name.toLowerCase()] ? 'Overwrite' : 'Create'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {importState.previewRows.length > 100 && (
                    <small style={{ display: 'block', marginTop: '0.5rem', color: '#666' }}>
                      Showing first 100 preview rows.
                    </small>
                  )}
                  <div className="form-actions">
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => setImportState((prev) => ({ ...prev, step: 'map' }))}
                    >
                      Back to Mapping
                    </button>
                    <button
                      type="button"
                      className="btn-primary"
                      disabled={importState.loading}
                      onClick={confirmImport}
                    >
                      {importState.loading ? 'Importing...' : 'Confirm Import'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        <div className="products-table-container">
          <table className="products-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Products</th>
                <th>Order</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan="5" className="category-empty-state">
                    No categories yet.
                  </td>
                </tr>
              ) : (
                categories.map((category) => {
                  const isActive = category.is_active !== false;
                  return (
                    <tr key={category.id}>
                      <td>{category.name}</td>
                      <td>{productCounts[category.name] || 0}</td>
                      <td>{category.display_order ?? 0}</td>
                      <td>
                        <span className={`status-badge ${isActive ? 'active' : 'inactive'}`}>
                          {isActive ? 'Active' : 'Removed'}
                        </span>
                      </td>
                      <td className="category-actions-cell">
                        <button type="button" onClick={() => openEditForm(category)} className="btn-edit">
                          ✏️
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggle(category)}
                          className={isActive ? 'btn-delete' : 'btn-secondary category-restore-btn'}
                        >
                          {isActive ? 'Remove' : 'Restore'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="pagination-bar">
          <div className="pagination-info">
            Page {page} of {totalPages} · {totalCategories} categories
          </div>
          <div className="pagination-controls">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="btn-secondary"
            >
              Prev
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="btn-secondary"
            >
              Next
            </button>
          </div>
        </div>

        {showForm && (
          <div className="modal-overlay" onClick={() => setShowForm(false)}>
            <div className="modal category-modal" onClick={(e) => e.stopPropagation()}>
              <h2>{editingCategory ? 'Edit Category' : 'New Category'}</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Category Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Display Order</label>
                  <input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: e.target.value })}
                  />
                </div>

                <div className="form-group checkbox">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    />
                    Active (shown on menu)
                  </label>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingCategory(null);
                    }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    {editingCategory ? 'Update Category' : 'Create Category'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
