import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Alert, Spinner } from 'react-bootstrap';
import * as api from '../services/api';
import { getImageUrl } from '../services/api';
import { IProduct } from '../types';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

const ManageProductsPage: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const [productName, setProductName] = useState('');
    const [productDescription, setProductDescription] = useState('');
    const [productPrice, setProductPrice] = useState(0);
    const [productStock, setProductStock] = useState(0);
    const [productImageFiles, setProductImageFiles] = useState<File[]>([]);
    const [productImageUrls, setProductImageUrls] = useState<string>('');
    const [productCategory, setProductCategory] = useState('');
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [editingProduct, setEditingProduct] = useState<IProduct | null>(null);
    const [clearExistingImages, setClearExistingImages] = useState(false);

    useEffect(() => {
        console.log('ManageProductsPage: location.state', location.state); // Log location.state
        if (location.state && location.state.product) {
            try {
                const product = location.state.product as IProduct;
                console.log('ManageProductsPage: editing product data', product); // Log product data

                // Defensive checks for product properties
                setEditingProduct(product);
                setProductName(product.name || '');
                setProductDescription(product.description || '');
                setProductPrice(typeof product.price === 'number' ? product.price : 0);
                setProductStock(typeof product.stock === 'number' ? product.stock : 0);
                setProductCategory(product.category || '');
                setClearExistingImages(false); // Reset on product load
            } catch (error) {
                console.error('ManageProductsPage: Error processing product from location.state', error);
                setFormError(t('error_loading_product_details')); // A new translation key for this error
            }
        } else {
            console.log('ManageProductsPage: No product data in location.state, assuming add mode.');
        }
    }, [location.state, t]);

    const handleAddUpdateProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');
        setFormSuccess('');
        setLoading(true);

        const formData = new FormData();
        formData.append('name', productName);
        formData.append('description', productDescription);
        formData.append('price', productPrice.toString());
        formData.append('stock', productStock.toString());
        formData.append('category', productCategory);

        productImageFiles.forEach((file) => {
            formData.append('images', file);
        });

        // Add image URLs if provided
        if (productImageUrls.trim()) {
            const urls = productImageUrls.split(',').map(url => url.trim()).filter(url => url);
            urls.forEach((url) => {
                formData.append('imageUrls', url);
            });
        }

        // Only send clearExistingImages if it's true and we are editing a product
        if (editingProduct && clearExistingImages) {
            formData.append('clearExistingImages', 'true');
        }

        try {
            if (editingProduct) {
                await api.updateProduct(editingProduct._id, formData);
                setFormSuccess(t('product_updated_success_message'));
            } else {
                await api.createProduct(formData);
                setFormSuccess(t('product_created_success_message'));
            }
            setProductName('');
            setProductDescription('');
            setProductPrice(0);
            setProductStock(0);
            setProductCategory('');
            setProductImageUrls('');
            setEditingProduct(null);
            setClearExistingImages(false); // Reset state
            navigate('/seller/products');
        } catch (err: any) {
            setFormError(err.response?.data?.message || t('product_action_error'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container>
            <h4>{editingProduct ? t('edit_product_title') : t('add_new_product_title')}</h4>
            {formError && <Alert variant="danger">{formError}</Alert>}
            {formSuccess && <Alert variant="success">{formSuccess}</Alert>}
            <Form onSubmit={handleAddUpdateProduct}>
                <Form.Group className="mb-3" controlId="productName">
                    <Form.Label>{t('product_name_label')}</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder={t('enter_product_name_placeholder')}
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        required
                    />
                </Form.Group>
                <Form.Group className="mb-3" controlId="productDescription">
                    <Form.Label>{t('product_description_label')}</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        placeholder={t('enter_product_description_placeholder')}
                        value={productDescription}
                        onChange={(e) => setProductDescription(e.target.value)}
                    />
                </Form.Group>
                <Form.Group className="mb-3" controlId="productPrice">
                    <Form.Label>{t('product_price_label')}</Form.Label>
                    <Form.Control
                        type="number"
                        placeholder={t('enter_product_price_placeholder')}
                        value={productPrice}
                        onChange={(e) => setProductPrice(parseFloat(e.target.value))}
                        required
                        min="0"
                    />
                </Form.Group>
                <Form.Group className="mb-3" controlId="productStock">
                    <Form.Label>{t('product_stock_label')}</Form.Label>
                    <Form.Control
                        type="number"
                        placeholder={t('enter_product_stock_placeholder')}
                        value={productStock}
                        onChange={(e) => setProductStock(parseInt(e.target.value))}
                        required
                        min="0"
                    />
                </Form.Group>
                <Form.Group className="mb-3" controlId="productImage">
                    <Form.Label>{t('product_image_label_with_count')} - Upload Files</Form.Label>
                    <Form.Control
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            if (e.target.files) {
                                const filesArray = Array.from(e.target.files).slice(0, 6);
                                setProductImageFiles(filesArray);
                            }
                        }}
                    />
                    {productImageFiles.length > 0 && (
                        <small className="text-muted d-block mt-1">
                            {t('images_selected', { count: productImageFiles.length })}
                        </small>
                    )}
                    {editingProduct && editingProduct.images.length > 0 && (
                        <div className="mt-2">
                            <small className="text-muted">{t('current_images_header')}</small>
                            <div className="d-flex flex-wrap gap-2 mt-1">
                                {editingProduct.images.map((img, idx) => (
                                    <img key={idx} src={getImageUrl(img)} alt={t('product_alt_text', { index: idx + 1 })} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
                                ))}
                            </div>
                            <Form.Check
                                type="checkbox"
                                id="clearExistingImagesCheck"
                                label={t('clear_existing_images')}
                                checked={clearExistingImages}
                                onChange={(e) => setClearExistingImages(e.target.checked)}
                                className="mt-2"
                            />
                            {clearExistingImages && productImageFiles.length > 0 && (
                                <Alert variant="info" className="mt-2">
                                    {t('clear_images_warning')}
                                </Alert>
                            )}
                            {clearExistingImages && productImageFiles.length === 0 && (
                                <Alert variant="warning" className="mt-2">
                                    {t('clear_images_only_warning')}
                                </Alert>
                            )}
                        </div>
                    )}
                </Form.Group>
                <Form.Group className="mb-3" controlId="productImageUrls">
                    <Form.Label>Or Add Image URLs</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Enter image URLs separated by commas (e.g., https://example.com/image1.jpg, https://example.com/image2.jpg)"
                        value={productImageUrls}
                        onChange={(e) => setProductImageUrls(e.target.value)}
                    />
                    <Form.Text className="text-muted">
                        Separate multiple URLs with commas. These will be added along with uploaded files.
                    </Form.Text>
                </Form.Group>
                <Form.Group className="mb-3" controlId="productCategory">
                    <Form.Label>{t('product_category_label')}</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder={t('enter_product_category_placeholder')}
                        value={productCategory}
                        onChange={(e) => setProductCategory(e.target.value)}
                    />
                </Form.Group>
                <Button variant="primary" type="submit" className="w-100" disabled={loading}>
                    {loading ? (
                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                    ) : editingProduct ? t('update_product_button') : t('add_product_button')}
                </Button>
                {editingProduct && (
                    <Button variant="secondary" className="w-100 mt-2" onClick={() => navigate('/seller/products')}>
                        {t('cancel_edit_button')}
                    </Button>
                )}
            </Form>
        </Container>
    );
};

export default ManageProductsPage;
