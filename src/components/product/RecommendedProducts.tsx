import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { searchApi } from '../../lib/api';
import { useCart } from '../../hooks';
import { getImageUrl, formatCurrency, parseProductImage } from '../../lib/utils';
import toast from 'react-hot-toast';

interface Product {
  id: string;
  name: string;
  price: string | number;
  discountPrice?: string | number;
  image: string;
  images?: string[];
  stock: number;
}

const RecommendedProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchRecommendedProducts = async () => {
      try {
        setIsLoading(true);
        
        // Try to get trending products
        const response = await searchApi.trending({ limit: 3 });
        
        if (response.data && Array.isArray(response.data)) {
          setProducts(response.data);
        } else {
          console.warn('Unexpected trending products response format:', response);
          setProducts([]);
        }
      } catch (error) {
        console.error('Failed to fetch recommended products:', error);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendedProducts();
  }, []);

  const handleAddToCart = (product: Product) => {
    try {
      // Convert to proper Product structure expected by addToCart
      const productForCart: any = {
        id: product.id,
        name: product.name,
        price: typeof product.price === 'string' ? product.price : product.price.toString(),
        discountPrice: product.discountPrice ? 
          (typeof product.discountPrice === 'string' ? 
            product.discountPrice : 
            product.discountPrice.toString()) : 
          undefined,
        images: product.images || [product.image || ''],
        stock: product.stock,
        // Add required fields for Product type
        description: '',
        category: { id: '', name: '', slug: '', productCount: 0, createdAt: '', updatedAt: '' },
        averageRating: 0,
        reviewCount: 0,
        createdAt: '',
        updatedAt: ''
      };
      
      addToCart(productForCart);
      toast.success(`${product.name} added to cart`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add product to cart');
    }
  };

  if (isLoading) {
    return (
      <div className="mt-8 bg-white rounded-lg shadow-sm">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">You might also like</h3>
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 bg-white rounded-lg shadow-sm">
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">You might also like</h3>
        <div className="space-y-4">
          {products.map((product) => (
            <div key={product.id} className="flex items-center space-x-3">
              <Link to={`/products/${product.id}`} className="flex-shrink-0">
                <img
                  className="w-16 h-16 rounded-md object-cover bg-gray-100"
                  src={parseProductImage(product.image || (product.images && product.images.length > 0 ? product.images[0] : ''))}
                  alt={product.name}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/api/placeholder/60/60';
                  }}
                />
              </Link>
              <div className="flex-1 min-w-0">
                <Link 
                  to={`/products/${product.id}`}
                  className="text-sm font-medium text-gray-900 hover:text-blue-600 line-clamp-1"
                >
                  {product.name}
                </Link>
                <p className="text-sm text-gray-600">
                  {formatCurrency(product.discountPrice || product.price)}
                  {product.discountPrice && (
                    <span className="ml-2 text-xs text-gray-500 line-through">
                      {formatCurrency(product.price)}
                    </span>
                  )}
                </p>
              </div>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleAddToCart(product)}
                aria-label={`Add ${product.name} to cart`}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecommendedProducts;
