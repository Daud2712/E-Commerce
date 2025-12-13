import React, { useState, useEffect } from 'react';
import { Container, Button, Alert, Table, Spinner } from 'react-bootstrap';
import * as api from '../services/api';
import { IProduct } from '../types';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const ProductsPage: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [products, setProducts] = useState<IProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const { data } = await api.getProducts();
            setProducts(data);
        } catch (err: any) {
            setError(err.response?.data?.message || t('seller_fetch_products_error'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleEditProduct = (product: IProduct) => {
        navigate(`/seller/manage-products?edit=true`, { state: { product } });
    };

    const handleDeleteProduct = async (productId: string, productName: string) => {
        if (window.confirm(t('confirm_delete_product', { productName }))) {
            try {
                await api.deleteProduct(productId);
                setSuccess(t('product_deleted_success_message'));
                fetchProducts();
            } catch (err: any) {
                setError(err.response?.data?.message || t('product_delete_error'));
            }
        }
    };

    return (
        <Container>
            <h4>{t('your_products_title')}</h4>
            {loading && <Spinner animation="border" />}
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}
            {!loading && !error && (
                <Table striped bordered hover responsive>
                    <thead>
                        <tr>
                            <th>{t('product_image_header')}</th>
                            <th>{t('product_name_header')}</th>
                            <th>{t('product_price_header')}</th>
                            <th>{t('product_stock_header')}</th>
                            <th>{t('product_category_header')}</th>
                            <th>{t('actions_header')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.length > 0 ? (
                            products.map((product) => (
                                <tr key={product._id}>
                                    <td>
                                        {product.images && product.images.length > 0 ? (
                                            <div className="d-flex flex-wrap gap-1">
                                                {product.images.slice(0, 3).map((img, idx) => (
                                                    <img key={idx} src={img} alt={`${product.name} ${idx + 1}`} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                                                ))}
                                                {product.images.length > 3 && (
                                                    <div style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f0f0', borderRadius: '4px', fontSize: '0.8em' }}>
                                                        +{product.images.length - 3}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <span>{t('no_images_available')}</span>
                                        )}
                                    </td>
                                    <td>{product.name}</td>
                                    <td>{t('price_with_currency_display', { amount: product.price.toFixed(2) })}</td>
                                    <td>{product.stock}</td>
                                    <td>{product.category || t('not_applicable_short')}</td>
                                    <td>
                                        <Button variant="info" size="sm" className="me-2" onClick={() => handleEditProduct(product)}>
                                            {t('edit_button')}
                                        </Button>
                                        <Button variant="danger" size="sm" onClick={() => handleDeleteProduct(product._id, product.name)}>
                                            {t('delete_button')}
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="text-center">{t('no_products_found')}</td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            )}
        </Container>
    );
};

export default ProductsPage;
