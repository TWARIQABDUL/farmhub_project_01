import React, { useState, useEffect } from "react";
import { PlusCircle, Loader2 } from "lucide-react";
import SellerProductCard from "../../../UserDashboard/DashComponents/sellplace/SellerProductCard";
import AddProductForm from "../../DashComponents/sellplace/AddProductForm";
import EditProductModal from "../../MarketDash/Editproduce";
import api from "../../../services/api";
import AuthUtils from "../../../utils/authUtils";

const MarketplaceSell = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [myProducts, setMyProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMyProducts();
  }, []);

  const fetchMyProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.get("/produce");
      const currentUser = AuthUtils.getCurrentUser();
      const userId = currentUser?.id || currentUser?.userId;

      // Filter to only this user's produce if we have a user ID
      const myData = userId
        ? (data || []).filter(
            (p) => p.farmer?.id === userId || p.farmer?.userId === userId || p.seller?.id === userId || p.sellerId === userId
          )
        : data || [];

      const normalised = myData.map((p) => ({
        id: p.id,
        name: p.name,
        price: p.pricePerUnit || p.price || 0,
        category: p.cropType || p.category || "Other",
        stock: p.quantity ?? p.stock ?? 0,
        unit: p.unit || "kg",
        image: p.imageUrl || p.image || "",
        seller: p.farmer?.firstName ? `${p.farmer.firstName} ${p.farmer.lastName}` : (p.seller?.name || p.sellerName || ""),
        location: p.location || "",
        description: p.description || "",
        inStock: (p.quantity ?? p.stock ?? 0) > 0,
        rating: p.rating || 4.0,
        reviews: p.reviews || 0,
        sold: p.sold || 0,
        discount: p.discount || 0,
        originalPrice: p.originalPrice || p.pricePerUnit || p.price,
      }));
      setMyProducts(normalised);
    } catch (err) {
      setError(err.message || "Failed to load your products.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (newProductData) => {
    try {
      const payload = {
        name: newProductData.name,
        description: newProductData.description,
        cropType: newProductData.category,
        pricePerUnit: newProductData.price,
        quantity: newProductData.stock,
        unit: newProductData.unit,
        imageUrl: newProductData.image?.startsWith('data:image/') 
                   ? 'https://placehold.co/400x300?text=Uploaded+Image' 
                   : newProductData.image,
        location: newProductData.location,
        availability: 'AVAILABLE'
      };
      await api.post("/produce", payload);
      setShowAddForm(false);
      await fetchMyProducts();
    } catch (err) {
      alert(err.message || "Failed to add product.");
    }
  };

  const handleEditProduct = (productId) => {
    const product = myProducts.find((p) => p.id === productId);
    if (product) setEditingProduct(product);
  };

  const handleSaveEdit = async (updatedProduct) => {
    try {
      const payload = {
        name: updatedProduct.name,
        description: updatedProduct.description,
        cropType: updatedProduct.category,
        pricePerUnit: updatedProduct.price,
        quantity: updatedProduct.stock,
        unit: updatedProduct.unit,
        imageUrl: updatedProduct.image?.startsWith('data:image/') 
                   ? 'https://placehold.co/400x300?text=Uploaded+Image' 
                   : updatedProduct.image,
        location: updatedProduct.location,
        availability: 'AVAILABLE'
      };
      await api.patch(`/produce/${updatedProduct.id}`, payload);
      setEditingProduct(null);
      await fetchMyProducts();
    } catch (err) {
      alert(err.message || "Failed to update product.");
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await api.delete(`/produce/${productId}`);
      await fetchMyProducts();
    } catch (err) {
      alert(err.message || "Failed to delete product.");
    }
  };

  if (showAddForm) {
    return (
      <AddProductForm
        onCancel={() => setShowAddForm(false)}
        onSubmit={handleAddProduct}
      />
    );
  }

  return (
    <div className="p-6">
      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSave={handleSaveEdit}
        />
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">My Products</h1>
          <p className="text-gray-600 text-sm mt-1">Manage your marketplace listings</p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 bg-green-600 text-white px-5 py-3 rounded-lg hover:bg-green-700 transition shadow-md"
        >
          <PlusCircle className="w-5 h-5" />
          Add New Product
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          <span className="ml-3 text-gray-600">Loading your products…</span>
        </div>
      ) : error ? (
        <div className="text-center py-16">
          <p className="text-red-500">{error}</p>
          <button onClick={fetchMyProducts} className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg">
            Retry
          </button>
        </div>
      ) : myProducts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg shadow-md">
          <PlusCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Products Yet</h3>
          <p className="text-gray-500 mb-6">Start selling by adding your first product</p>
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
          >
            Add Product
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {myProducts.map((product) => (
            <SellerProductCard
              key={product.id}
              product={product}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MarketplaceSell;