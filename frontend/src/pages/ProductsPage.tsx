import React, { useState, useEffect } from 'react';
import { Container, Button, Alert, Table, Spinner } from 'react-bootstrap';
import * as api from '../services/api';
import { getImageUrl } from '../services/api';
import { IProduct } from '../types';
import { useNavigate } from 'react-router-dom';

const ProductsPage: React.FC = () => {
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
            setError(err.response?.data?.message || 'Failed to fetch products');
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
        if (window.confirm(`Are you sure you want to delete "${productName}"?`)) {
            try {
                await api.deleteProduct(productId);
                setSuccess('Product deleted successfully');
                fetchProducts();
            } catch (err: any) {
                setError(err.response?.data?.message || 'Failed to delete product');
            }
        }
    };

    return (
        <Container>
            <h4>All Products (Collaborative Management)</h4>
            <p className="text-muted">All sellers can add, edit, and delete any product</p>
            {loading && <Spinner animation="border" />}
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}
            {!loading && !error && (
                <Table striped bordered hover responsive>
                    <thead>
                        <tr>
                            <th>Product Image</th>
                            <th>Product Name</th>
                            <th>Product Price</th>
                            <th>Product Stock</th>
                            <th>Product Category</th>
                            <th>Actions</th>
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
                                                    <img key={idx} src={getImageUrl(img)} alt={`${product.name} ${idx + 1}`} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                                                ))}
                                                {product.images.length > 3 && (
                                                    <div style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f0f0', borderRadius: '4px', fontSize: '0.8em' }}>
                                                        +{product.images.length - 3}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <span>No images available</span>
                                        )}
                                    </td>
                                    <td>{product.name}</td>
                                    <td>TZS {product.price.toLocaleString()}</td>
                                    <td>{product.stock}</td>
                                    <td>{product.category || 'N/A'}</td>
                                    <td>
                                        <Button variant="info" size="sm" className="me-2" onClick={() => handleEditProduct(product)}>
                                            Edit
                                        </Button>
                                        <Button variant="danger" size="sm" onClick={() => handleDeleteProduct(product._id, product.name)}>
                                            Delete
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="text-center">No products found</td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            )}
        </Container>
    );
};

export default ProductsPage;
