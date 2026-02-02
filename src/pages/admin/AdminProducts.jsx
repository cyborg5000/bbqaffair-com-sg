import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { supabase } from '../../lib/supabase';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showForm, setShowForm] = useState(false);

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
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      const { data, error } = await supabase
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
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(product) {
    setEditingProduct(product);
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
    });
    setShowForm(true);
  }

  function handleNew() {
    setEditingProduct(null);
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

      setShowForm(false);
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

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error deleting product');
    }
  }

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
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows="3"
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
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      placeholder="e.g., packages, addons"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Image URL</label>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                    placeholder="https://..."
                  />
                </div>

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
                <tr key={product.id}>
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
      </div>
    </AdminLayout>
  );
}
