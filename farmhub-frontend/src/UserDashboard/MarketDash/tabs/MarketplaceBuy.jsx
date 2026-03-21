import React, { useState, useEffect } from "react";
import ProductCard from "../../../website/Components/marketplace/ProductCard";
import FilterSidebar from "../../../website/Components/marketplace/FilterMarket";
import CheckoutPage from "../CheckoutPage";
import PaymentPage from "./PaymentPage";
import ConfirmationPage from "./ConfirmPage";
import api from "../../../services/api";

const Marketplace = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [selectedRatings, setSelectedRatings] = useState([]);
  const [showSidebar, setShowSidebar] = useState(false);

  const [currentStep, setCurrentStep] = useState("marketplace");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [shippingInfo, setShippingInfo] = useState(null);
  const [paymentData, setPaymentData] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.get("/produce");
      // Normalise backend DTO to the shape ProductCard expects
      const normalised = (data || []).map((p) => ({
        id: p.id,
        name: p.name,
        price: p.pricePerUnit || p.price || 0,
        category: p.cropType || p.category || "Other",
        stock: p.quantity ?? p.stock ?? 0,
        unit: p.unit || "kg",
        image: p.imageUrl || p.image || "https://placehold.co/400x300?text=No+Image",
        seller: p.farmer?.firstName ? `${p.farmer.firstName} ${p.farmer.lastName}` : (p.seller?.name || p.sellerName || "FarmHub Seller"),
        location: p.location || "",
        description: p.description || "",
        inStock: (p.quantity ?? p.stock ?? 0) > 0,
        rating: p.rating || 4.0,
        reviews: p.reviews || 0,
        sold: p.sold || 0,
        discount: p.discount || 0,
        originalPrice: p.originalPrice || p.pricePerUnit || p.price,
      }));
      setProducts(normalised);
      // Dynamically set price range ceiling
      if (normalised.length > 0) {
        const maxPrice = Math.max(...normalised.map((p) => p.price));
        setPriceRange([0, maxPrice]);
      }
    } catch (err) {
      setError(err.message || "Failed to load products.");
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { name: "All Categories", count: products.length },
    ...["Vegetables", "Fruits", "Grains", "Equipment", "Seeds", "Livestock"].map((cat) => ({
      name: cat,
      count: products.filter((p) => p.category === cat).length,
    })),
  ];

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === "All Categories" || product.category === selectedCategory;
    const matchesPrice = product.price <= priceRange[1];
    const matchesRating =
      selectedRatings.length === 0 || selectedRatings.some((r) => product.rating >= r);
    return matchesCategory && matchesPrice && matchesRating;
  });

  const handleReset = () => {
    setSelectedCategory("All Categories");
    setPriceRange([0, products.length > 0 ? Math.max(...products.map((p) => p.price)) : 100000]);
    setSelectedRatings([]);
  };

  const handleBuyNow = (product) => {
    setSelectedProduct(product);
    setCurrentStep("checkout");
    window.scrollTo(0, 0);
  };

  const handleProceedToPayment = (info) => {
    setShippingInfo(info);
    setCurrentStep("payment");
    window.scrollTo(0, 0);
  };

  const handleBackToCheckout = () => {
    setCurrentStep("checkout");
    window.scrollTo(0, 0);
  };

  const handlePaymentSuccess = (payment) => {
    setPaymentData(payment);
    setCurrentStep("confirmation");
    window.scrollTo(0, 0);
  };

  const handleContinueShopping = () => {
    setSelectedProduct(null);
    setShippingInfo(null);
    setPaymentData(null);
    setCurrentStep("marketplace");
    window.scrollTo(0, 0);
  };

  if (currentStep === "checkout" && selectedProduct) {
    return (
      <CheckoutPage
        product={selectedProduct}
        onBack={handleContinueShopping}
        onProceedToPayment={handleProceedToPayment}
      />
    );
  }
  if (currentStep === "payment" && selectedProduct && shippingInfo) {
    return (
      <PaymentPage
        product={selectedProduct}
        shippingInfo={shippingInfo}
        onBackToCheckout={handleBackToCheckout}
        onPaymentSuccess={handlePaymentSuccess}
      />
    );
  }
  if (currentStep === "confirmation" && selectedProduct && shippingInfo) {
    return (
      <ConfirmationPage
        product={selectedProduct}
        shippingInfo={shippingInfo}
        paymentData={paymentData}
        onBackToHome={handleContinueShopping}
      />
    );
  }

  return (
    <div className="min-h-screen font-sanserif bg-gray-50">
      <div className="lg:hidden flex justify-end px-6 mb-4">
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          className="py-2 px-4 bg-green-600 text-white rounded-lg"
        >
          {showSidebar ? "Close Filters" : "Filters"}
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-6 flex gap-6">
        {/* Mobile sidebar */}
        {showSidebar && (
          <FilterSidebar
            categories={categories.map((c) => ({ ...c, selected: c.name === selectedCategory }))}
            onCategoryChange={setSelectedCategory}
            onPriceChange={setPriceRange}
            onRatingChange={setSelectedRatings}
            onReset={handleReset}
          />
        )}

        {/* Desktop sidebar */}
        <div className="hidden lg:block">
          <FilterSidebar
            categories={categories.map((c) => ({ ...c, selected: c.name === selectedCategory }))}
            onCategoryChange={setSelectedCategory}
            onPriceChange={setPriceRange}
            onRatingChange={setSelectedRatings}
            onReset={handleReset}
          />
        </div>

        <main className="flex-1 mb-8">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
              <span className="ml-3 text-gray-600">Loading products…</span>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <p className="text-red-500 font-medium">{error}</p>
              <button
                onClick={fetchProducts}
                className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProducts.length === 0 ? (
                <p className="col-span-full text-center text-gray-500 mt-10">
                  No products match your filters.
                </p>
              ) : (
                filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onBuyNow={() => handleBuyNow(product)}
                  />
                ))
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Marketplace;