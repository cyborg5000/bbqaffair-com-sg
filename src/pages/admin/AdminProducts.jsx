import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { supabase } from '../../lib/supabase';
import TiptapEditor from '../../components/TiptapEditor';
import ImageUpload from '../../components/admin/ImageUpload';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [categories, setCategories] = useState([]);
  const [useCustomCategory, setUseCustomCategory] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const pageSize = 10;
  const [exporting, setExporting] = useState(false);
  const [productIndex, setProductIndex] = useState({});
  const [importFileInputKey, setImportFileInputKey] = useState(0);
  const [importState, setImportState] = useState({
    step: 'idle', // idle | map | preview
    rawRows: [],
    columns: [],
    mapping: {
      name: '',
      price: '',
      category: '',
      description: '',
      image_url: '',
      is_active: '',
      unit_label: '',
    },
    previewProducts: [],
    duplicates: [],
    loading: false,
  });

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image_url: '',
    is_active: true,
    unit_label: '',
    has_options: false,
    options: [],
    addons: [],
  });

  useEffect(() => {
    fetchCategories();
    fetchProductIndex();
  }, []);

  useEffect(() => {
    // reset import modal when closing
    if (importState.step === 'idle') {
      setImportState((prev) => ({
        ...prev,
        rawRows: [],
        columns: [],
        mapping: {
          name: '',
          price: '',
          category: '',
          description: '',
          image_url: '',
          is_active: '',
          unit_label: '',
        },
        previewProducts: [],
        duplicates: [],
        loading: false,
      }));
    }
  }, [importState.step]);

  useEffect(() => {
    const handle = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(handle);
  }, [searchTerm]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  useEffect(() => {
    fetchProducts(page, debouncedSearch);
  }, [page, debouncedSearch]);

  useEffect(() => {
    if (!editingProduct || categories.length === 0) return;
    const exists = categories.some(cat => cat.name === editingProduct.category && cat.is_active !== false);
    setUseCustomCategory(!exists);
  }, [categories, editingProduct]);

  async function fetchProducts(currentPage = page, term = debouncedSearch) {
    setLoading(true);
    const from = (currentPage - 1) * pageSize;
    const to = from + pageSize - 1;

    try {
      let query = supabase
        .from('products')
        .select(`
          *,
          product_options(
            id,
            name,
            current_price,
            original_price,
            display_order,
            is_default,
            is_active
          ),
          product_addons(
            id,
            name,
            price,
            display_order,
            is_active
          )
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (term && term.trim()) {
        const trimmed = term.trim();
        query = query.or(`name.ilike.%${trimmed}%,category.ilike.%${trimmed}%`);
      }

      const { data, error, count } = await query;

      if (error) throw error;
      const list = data || [];
      if (list.length === 0 && currentPage > 1 && (count || 0) > 0) {
        setLoading(false);
        setPage(currentPage - 1);
        return;
      }

      setProducts(list);
      setTotalProducts(count || 0);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchProductIndex() {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name');
      if (error) throw error;
      const index = {};
      (data || []).forEach((p) => {
        if (p.name) {
          index[p.name.trim().toLowerCase()] = p.id;
        }
      });
      setProductIndex(index);
      return index;
    } catch (error) {
      console.error('Error loading product index:', error);
      return {};
    }
  }

  async function fetchCategories() {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
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
      const cells = parseCsvLine(line);
      const row = {};
      columns.forEach((column, idx) => {
        row[column] = cells[idx] ?? '';
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

      const findColumn = (candidates) => columns.find((col) => {
        const normalized = col.toLowerCase();
        return candidates.some((candidate) => normalized.includes(candidate));
      }) || '';

      setImportState((prev) => ({
        ...prev,
        step: 'map',
        columns,
        rawRows: rows,
        mapping: {
          name: findColumn(['name', 'product']),
          price: findColumn(['price', 'amount']),
          category: findColumn(['category']),
          description: findColumn(['description']),
          image_url: findColumn(['image', 'image_url', 'photo']),
          is_active: findColumn(['is_active', 'active', 'status']),
          unit_label: findColumn(['unit_label', 'unit']),
        },
      }));
    };
    reader.readAsText(file);
  }

  async function buildImportPreview() {
    const { rawRows, mapping } = importState;
    if (!mapping.name || !mapping.price || !mapping.category) {
      alert('Please map name, price, and category before preview.');
      return;
    }

    const previewProducts = rawRows
      .map((row) => ({
        name: String(row[mapping.name] ?? '').trim(),
        price: parseFloat(row[mapping.price]) || 0,
        category: String(row[mapping.category] ?? '').trim(),
        description: mapping.description ? String(row[mapping.description] ?? '') : '',
        image_url: mapping.image_url ? String(row[mapping.image_url] ?? '') : '',
        is_active: mapping.is_active ? normalizeBoolean(row[mapping.is_active], true) : true,
        unit_label: mapping.unit_label ? String(row[mapping.unit_label] ?? '').trim() : null,
        has_options: false,
      }))
      .filter((row) => row.name.length > 0);

    if (previewProducts.length === 0) {
      alert('No valid product rows after mapping.');
      return;
    }

    const latestIndex = await fetchProductIndex();
    const duplicates = previewProducts.filter((row) => latestIndex[row.name.toLowerCase()]);

    setImportState((prev) => ({
      ...prev,
      previewProducts,
      duplicates,
      step: 'preview',
    }));
  }

  async function confirmImport() {
    const { previewProducts, duplicates } = importState;
    if (previewProducts.length === 0) return;

    if (duplicates.length > 0) {
      const approved = confirm(
        `${duplicates.length} products already exist by name. Overwrite existing products with the imported rows?`
      );
      if (!approved) return;
    }

    setImportState((prev) => ({ ...prev, loading: true }));

    try {
      const latestIndex = await fetchProductIndex();
      for (const row of previewProducts) {
        const existingId = latestIndex[row.name.toLowerCase()];
        if (existingId) {
          const { error } = await supabase
            .from('products')
            .update({
              name: row.name,
              price: row.price,
              category: row.category,
              description: row.description,
              image_url: row.image_url,
              is_active: row.is_active,
              unit_label: row.unit_label || null,
              has_options: false,
            })
            .eq('id', existingId);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('products')
            .insert([{
              name: row.name,
              price: row.price,
              category: row.category,
              description: row.description,
              image_url: row.image_url,
              is_active: row.is_active,
              unit_label: row.unit_label || null,
              has_options: false,
            }]);
          if (error) throw error;
        }
      }

      await fetchProductIndex();
      await fetchProducts(1, debouncedSearch);
      setPage(1);
      setImportState((prev) => ({ ...prev, loading: false, step: 'idle' }));
      setImportFileInputKey((prev) => prev + 1);
      alert('Product import completed.');
    } catch (error) {
      console.error('Error importing products:', error);
      alert('Error importing products: ' + error.message);
      setImportState((prev) => ({ ...prev, loading: false }));
    }
  }

  async function exportProductsCsv() {
    setExporting(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('name, price, category, description, image_url, is_active, unit_label')
        .order('name', { ascending: true });
      if (error) throw error;

      const headers = ['name', 'price', 'category', 'description', 'image_url', 'is_active', 'unit_label'];
      const rows = (data || []).map((product) =>
        headers.map((header) => {
          const value = product[header] ?? '';
          return `"${String(value).replace(/"/g, '""')}"`;
        }).join(',')
      );

      const csvContent = [headers.join(','), ...rows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `products-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting products:', error);
      alert('Error exporting products: ' + error.message);
    } finally {
      setExporting(false);
    }
  }

  function handleEdit(product) {
    setEditingProduct(product);
    const categoryExists = categories.some(cat => cat.name === product.category && cat.is_active !== false);
    setUseCustomCategory(!categoryExists);
    // Sort options by display_order
    const sortedOptions = (product.product_options || [])
      .sort((a, b) => a.display_order - b.display_order)
      .map(opt => ({
        id: opt.id,
        name: opt.name,
        current_price: opt.current_price,
        original_price: opt.original_price || '',
        display_order: opt.display_order,
        is_default: opt.is_default,
        is_active: opt.is_active,
      }));

    // Sort addons by display_order
    const sortedAddons = (product.product_addons || [])
      .sort((a, b) => a.display_order - b.display_order)
      .map(addon => ({
        id: addon.id,
        name: addon.name,
        price: addon.price,
        display_order: addon.display_order,
        is_active: addon.is_active,
      }));

    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price,
      category: product.category,
      image_url: product.image_url || '',
      is_active: product.is_active,
      unit_label: product.unit_label || '',
      has_options: product.has_options || false,
      options: sortedOptions,
      addons: sortedAddons,
    });
    setShowForm(true);
  }

  function handleNew() {
    setEditingProduct(null);
    setUseCustomCategory(false);
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      image_url: '',
      is_active: true,
      unit_label: '',
      has_options: false,
      options: [],
      addons: [],
    });
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price) || 0,
        category: formData.category,
        image_url: formData.image_url,
        is_active: formData.is_active,
        unit_label: formData.unit_label || null,
        has_options: formData.has_options,
      };

      let productId;

      if (editingProduct) {
        // Update existing product
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);

        if (error) throw error;
        productId = editingProduct.id;

        // Delete options that were removed
        if (formData.has_options) {
          const existingOptionIds = formData.options
            .filter(opt => opt.id)
            .map(opt => opt.id);

          if (existingOptionIds.length > 0) {
            // Delete options not in current list
            const { error: deleteError } = await supabase
              .from('product_options')
              .delete()
              .eq('product_id', productId)
              .not('id', 'in', `(${existingOptionIds.join(',')})`);

            if (deleteError) console.error('Error deleting removed options:', deleteError);
          } else {
            // Delete all existing options (all were removed)
            const { error: deleteError } = await supabase
              .from('product_options')
              .delete()
              .eq('product_id', productId);

            if (deleteError) console.error('Error deleting all options:', deleteError);
          }
        } else {
          // has_options is false, delete all options
          await supabase
            .from('product_options')
            .delete()
            .eq('product_id', productId);
        }
      } else {
        // Create new product
        const { data, error } = await supabase
          .from('products')
          .insert([productData])
          .select()
          .single();

        if (error) throw error;
        productId = data.id;
      }

      // Save options if has_options is enabled
      if (formData.has_options && formData.options.length > 0) {
        for (let i = 0; i < formData.options.length; i++) {
          const option = formData.options[i];
          const optionData = {
            product_id: productId,
            name: option.name,
            current_price: parseFloat(option.current_price),
            original_price: option.original_price ? parseFloat(option.original_price) : null,
            display_order: i,
            is_default: option.is_default || false,
            is_active: true,
          };

          if (option.id) {
            // Update existing option
            const { error: updateError } = await supabase
              .from('product_options')
              .update(optionData)
              .eq('id', option.id);

            if (updateError) throw updateError;
          } else {
            // Create new option
            const { error: insertError } = await supabase
              .from('product_options')
              .insert([optionData]);

            if (insertError) throw insertError;
          }
        }
      }

      // Save add-ons
      // First, get existing addon IDs to handle deletions
      const existingAddonIds = formData.addons
        .filter(addon => addon.id)
        .map(addon => addon.id);

      if (editingProduct) {
        // Delete addons that were removed
        if (existingAddonIds.length > 0) {
          await supabase
            .from('product_addons')
            .delete()
            .eq('product_id', productId)
            .not('id', 'in', `(${existingAddonIds.join(',')})`);
        } else {
          // Delete all existing addons
          await supabase
            .from('product_addons')
            .delete()
            .eq('product_id', productId);
        }
      }

      // Save each addon
      for (let i = 0; i < formData.addons.length; i++) {
        const addon = formData.addons[i];
        const addonData = {
          product_id: productId,
          name: addon.name,
          price: parseFloat(addon.price) || 0,
          display_order: i,
          is_active: true,
        };

        if (addon.id) {
          // Update existing addon
          const { error: updateError } = await supabase
            .from('product_addons')
            .update(addonData)
            .eq('id', addon.id);

          if (updateError) throw updateError;
        } else {
          // Create new addon
          const { error: insertError } = await supabase
            .from('product_addons')
            .insert([addonData]);

          if (insertError) throw insertError;
        }
      }

      setShowForm(false);
      fetchProductIndex();
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error saving product: ' + error.message);
    }
  }

  // Option management helpers
  function addOption() {
    setFormData(prev => ({
      ...prev,
      options: [
        ...prev.options,
        {
          id: null,
          name: '',
          current_price: '',
          original_price: '',
          display_order: prev.options.length,
          is_default: prev.options.length === 0, // First option is default
          is_active: true,
        },
      ],
    }));
  }

  function updateOption(index, field, value) {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((opt, i) =>
        i === index ? { ...opt, [field]: value } : opt
      ),
    }));
  }

  function setDefaultOption(index) {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => ({
        ...opt,
        is_default: i === index,
      })),
    }));
  }

  function removeOption(index) {
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }));
  }

  // Add-on management helpers
  function addAddon() {
    setFormData(prev => ({
      ...prev,
      addons: [
        ...prev.addons,
        {
          id: null,
          name: '',
          price: '',
          display_order: prev.addons.length,
          is_active: true,
        },
      ],
    }));
  }

  function updateAddon(index, field, value) {
    setFormData(prev => ({
      ...prev,
      addons: prev.addons.map((addon, i) =>
        i === index ? { ...addon, [field]: value } : addon
      ),
    }));
  }

  function removeAddon(index) {
    setFormData(prev => ({
      ...prev,
      addons: prev.addons.filter((_, i) => i !== index),
    }));
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchProductIndex();
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error deleting product');
    }
  }

  // Bulk selection handlers
  function handleSelectAll(e) {
    if (e.target.checked) {
      setSelectedIds(products.map(p => p.id));
    } else {
      setSelectedIds([]);
    }
  }

  function handleSelectOne(id) {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(selectedId => selectedId !== id)
        : [...prev, id]
    );
  }

  async function handleBulkDelete() {
    if (selectedIds.length === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} product(s)?`)) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .in('id', selectedIds);

      if (error) throw error;
      setSelectedIds([]);
      fetchProductIndex();
      fetchProducts();
    } catch (error) {
      console.error('Error deleting products:', error);
      alert('Error deleting products');
    }
  }

  const isAllSelected = products.length > 0 && selectedIds.length === products.length;
  const isIndeterminate = selectedIds.length > 0 && selectedIds.length < products.length;
  const activeCategories = categories.filter((category) => category.is_active !== false);
  const totalPages = Math.max(1, Math.ceil(totalProducts / pageSize));

  if (loading) return <AdminLayout><div className="loading">Loading...</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="admin-products">
        <div className="page-header">
          <h1>Products</h1>
          <button onClick={handleNew} className="btn-primary">
            ➕ Add Product
          </button>
        </div>

        {selectedIds.length > 0 && (
          <div className="bulk-actions-bar">
            <span className="selected-count">{selectedIds.length} selected</span>
            <button onClick={handleBulkDelete} className="btn-delete-bulk">
              🗑️ Delete Selected
            </button>
          </div>
        )}

        <div className="table-toolbar">
          <input
            type="search"
            placeholder="Search products or categories"
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
            <button type="button" className="btn-secondary toolbar-btn" onClick={exportProductsCsv} disabled={exporting}>
              {exporting ? 'Exporting...' : 'Export CSV'}
            </button>
          </div>
        </div>

        {importState.step !== 'idle' && (
          <div className="modal-overlay" onClick={() => setImportState((prev) => ({ ...prev, step: 'idle' }))}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h2>Import Products</h2>

              {importState.step === 'map' && (
                <>
                  <p>Map CSV columns to product fields before preview.</p>
                  {[
                    ['name', 'Product Name (required)'],
                    ['price', 'Price (required)'],
                    ['category', 'Category (required)'],
                    ['description', 'Description'],
                    ['image_url', 'Image URL'],
                    ['is_active', 'Active Status'],
                    ['unit_label', 'Unit Label'],
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
                    {importState.previewProducts.length} rows ready. {importState.duplicates.length} matching names
                    found in existing products.
                  </p>
                  <div style={{ maxHeight: '320px', overflow: 'auto', border: '1px solid #e5e5e5', borderRadius: '8px' }}>
                    <table className="products-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Category</th>
                          <th>Price</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {importState.previewProducts.slice(0, 100).map((row, idx) => {
                          const overwrite = !!productIndex[row.name.toLowerCase()];
                          return (
                            <tr key={`${row.name}-${idx}`}>
                              <td>{row.name}</td>
                              <td>{row.category}</td>
                              <td>${Number(row.price || 0).toFixed(2)}</td>
                              <td>{overwrite ? 'Overwrite' : 'Create'}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  {importState.previewProducts.length > 100 && (
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
                      onClick={confirmImport}
                      disabled={importState.loading}
                    >
                      {importState.loading ? 'Importing...' : 'Confirm Import'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {showForm && (
          <div className="modal-overlay" onClick={() => setShowForm(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h2>{editingProduct ? 'Edit Product' : 'New Product'}</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <TiptapEditor
                    content={formData.description}
                    onUpdate={(html) => setFormData({...formData, description: html})}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Category</label>
                    {activeCategories.length > 0 ? (
                      <>
                        <select
                          value={useCustomCategory ? '__custom__' : formData.category}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === '__custom__') {
                              setUseCustomCategory(true);
                              setFormData({ ...formData, category: '' });
                            } else {
                              setUseCustomCategory(false);
                              setFormData({ ...formData, category: value });
                            }
                          }}
                          required={!useCustomCategory}
                        >
                          <option value="">Select a category</option>
                          {activeCategories.map((cat) => (
                            <option key={cat.id} value={cat.name}>
                              {cat.name}
                            </option>
                          ))}
                          <option value="__custom__">Other (manual)</option>
                        </select>
                        {useCustomCategory && (
                          <input
                            type="text"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            placeholder="Enter category"
                            style={{ marginTop: '0.5rem' }}
                            required
                          />
                        )}
                        {!useCustomCategory && formData.category && !activeCategories.some(cat => cat.name === formData.category) && (
                          <small style={{ color: '#b45309', display: 'block', marginTop: '0.25rem' }}>
                            Current category is inactive. Choose an active one or use manual entry.
                          </small>
                        )}
                      </>
                    ) : (
                      <input
                        type="text"
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                        placeholder="e.g., BBQ Package"
                        required
                      />
                    )}
                  </div>
                </div>

                <ImageUpload
                  value={formData.image_url}
                  onChange={(url) => setFormData({...formData, image_url: url})}
                  label="Product Image"
                />

                <div className="form-group">
                  <label>Unit Label (optional)</label>
                  <input
                    type="text"
                    value={formData.unit_label}
                    onChange={(e) => setFormData({...formData, unit_label: e.target.value})}
                    placeholder="e.g., 1kg, 2kg, per piece"
                  />
                  <small style={{ color: '#666', display: 'block', marginTop: '0.25rem' }}>
                    Displayed as "Quantity (1kg) + 1" in cart
                  </small>
                </div>

                <div className="form-group checkbox">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                    />
                    Active
                  </label>
                </div>

                <div className="form-group checkbox">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.has_options}
                      onChange={(e) => setFormData({...formData, has_options: e.target.checked})}
                    />
                    Has Options (e.g., flavors with different prices)
                  </label>
                </div>

                {/* Options Editor */}
                {formData.has_options && (
                  <div className="options-section" style={{ marginTop: '1rem', padding: '1rem', background: '#f8f8f8', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <h4 style={{ margin: 0 }}>Product Options</h4>
                      <button
                        type="button"
                        onClick={addOption}
                        style={{
                          padding: '0.5rem 1rem',
                          fontSize: '0.875rem',
                          background: 'var(--ember-orange, #ff6b00)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: '600'
                        }}
                      >
                        + Add Option
                      </button>
                    </div>

                    {formData.options.length === 0 ? (
                      <div style={{ color: '#666', textAlign: 'center', padding: '2rem 1rem', background: 'white', borderRadius: '6px', border: '2px dashed #ddd' }}>
                        <p style={{ margin: '0 0 1rem 0' }}>No options yet.</p>
                        <button
                          type="button"
                          onClick={addOption}
                          style={{
                            padding: '0.75rem 1.5rem',
                            background: 'var(--ember-orange, #ff6b00)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '1rem'
                          }}
                        >
                          + Add First Option
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {formData.options.map((option, index) => (
                          <div
                            key={option.id || `new-${index}`}
                            style={{
                              display: 'flex',
                              flexWrap: 'wrap',
                              gap: '0.5rem',
                              alignItems: 'center',
                              padding: '0.75rem',
                              background: 'white',
                              borderRadius: '6px',
                              border: '1px solid #e0e0e0',
                            }}
                          >
                            <input
                              type="text"
                              placeholder="Option name (e.g., Honey)"
                              value={option.name}
                              onChange={(e) => updateOption(index, 'name', e.target.value)}
                              required
                              style={{ padding: '0.5rem', flex: '1 1 150px', minWidth: '120px' }}
                            />
                            <input
                              type="number"
                              step="0.01"
                              placeholder="Price $"
                              value={option.current_price}
                              onChange={(e) => updateOption(index, 'current_price', e.target.value)}
                              required
                              style={{ padding: '0.5rem', width: '90px' }}
                              title="Current price"
                            />
                            <input
                              type="number"
                              step="0.01"
                              placeholder="Was $"
                              value={option.original_price}
                              onChange={(e) => updateOption(index, 'original_price', e.target.value)}
                              style={{ padding: '0.5rem', width: '90px' }}
                              title="Original price (for strike-through)"
                            />
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer', whiteSpace: 'nowrap', padding: '0.5rem' }}>
                              <input
                                type="radio"
                                name="default_option"
                                checked={option.is_default}
                                onChange={() => setDefaultOption(index)}
                              />
                              Default
                            </label>
                            <button
                              type="button"
                              onClick={() => removeOption(index)}
                              style={{
                                background: '#ffebee',
                                border: 'none',
                                padding: '0.5rem 0.75rem',
                                borderRadius: '4px',
                                cursor: 'pointer',
                              }}
                              title="Remove option"
                            >
                              🗑️
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.75rem' }}>
                      💡 Tip: "Was $" is the original price shown with strike-through when on sale.
                    </p>
                  </div>
                )}

                {/* Add-ons Editor */}
                <div className="addons-section" style={{ marginTop: '1.5rem', padding: '1rem', background: '#f0f7ff', borderRadius: '8px', border: '1px solid #cce0ff' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <h4 style={{ margin: 0, color: '#1a5fb4' }}>➕ Add-Ons (Optional Extras)</h4>
                    <button
                      type="button"
                      onClick={addAddon}
                      style={{
                        padding: '0.5rem 1rem',
                        fontSize: '0.875rem',
                        background: '#1a5fb4',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}
                    >
                      + Add Add-On
                    </button>
                  </div>

                  {formData.addons.length === 0 ? (
                    <div style={{ color: '#666', textAlign: 'center', padding: '1.5rem 1rem', background: 'white', borderRadius: '6px', border: '2px dashed #cce0ff' }}>
                      <p style={{ margin: '0 0 0.5rem 0' }}>No add-ons yet.</p>
                      <p style={{ margin: 0, fontSize: '0.875rem', color: '#888' }}>Add-ons are optional extras customers can select (e.g., Extra Sauce +$2)</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {formData.addons.map((addon, index) => (
                        <div
                          key={addon.id || `new-addon-${index}`}
                          style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '0.5rem',
                            alignItems: 'center',
                            padding: '0.75rem',
                            background: 'white',
                            borderRadius: '6px',
                            border: '1px solid #cce0ff',
                          }}
                        >
                          <input
                            type="text"
                            placeholder="Add-on name (e.g., Extra Sauce)"
                            value={addon.name}
                            onChange={(e) => updateAddon(index, 'name', e.target.value)}
                            required
                            style={{ padding: '0.5rem', flex: '1 1 200px', minWidth: '150px' }}
                          />
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <span style={{ color: '#666' }}>+$</span>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0.00"
                              value={addon.price}
                              onChange={(e) => updateAddon(index, 'price', e.target.value)}
                              required
                              style={{ padding: '0.5rem', width: '80px' }}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeAddon(index)}
                            style={{
                              background: '#ffebee',
                              border: 'none',
                              padding: '0.5rem 0.75rem',
                              borderRadius: '4px',
                              cursor: 'pointer',
                            }}
                            title="Remove add-on"
                          >
                            🗑️
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <p style={{ fontSize: '0.75rem', color: '#5a8dd6', marginTop: '0.75rem' }}>
                    💡 Add-ons are optional extras that customers can select when ordering this product.
                  </p>
                </div>

                <div className="form-actions">
                  <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    {editingProduct ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="products-table-container">
          <table className="products-table">
            <thead>
              <tr>
                <th className="checkbox-cell">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = isIndeterminate;
                    }}
                    onChange={handleSelectAll}
                  />
                </th>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className={selectedIds.includes(product.id) ? 'selected-row' : ''}>
                  <td className="checkbox-cell">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(product.id)}
                      onChange={() => handleSelectOne(product.id)}
                    />
                  </td>
                  <td>
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="product-thumb" />
                    ) : (
                      <div className="no-image">No Image</div>
                    )}
                  </td>
                  <td>{product.name}</td>
                  <td>{product.category}</td>
                  <td>${product.price.toFixed(2)}</td>
                  <td>
                    <span className={`status-badge ${product.is_active ? 'active' : 'inactive'}`}>
                      {product.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <button onClick={() => handleEdit(product)} className="btn-edit">
                      ✏️
                    </button>
                    <button onClick={() => handleDelete(product.id)} className="btn-delete">
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pagination-bar">
          <div className="pagination-info">
            Page {page} of {totalPages} · {totalProducts} products
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
      </div>
    </AdminLayout>
  );
}
