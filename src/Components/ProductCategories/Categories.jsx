import { useState, useEffect } from "react";
import {
  ChevronDown,
  GridIcon,
  List,
  SlidersHorizontal,
  ShoppingCart,
  X,
  ExternalLink,
} from "lucide-react";
import NavBar from "../NavBar/NavBar";
import Footer from "../HomePage/Footer.jsx";
import { message } from "antd";
import productServices from "../../Services/product.services.js";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";

const Categories = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [viewMode, setViewMode] = useState("grid");
  const [priceRange, setPriceRange] = useState([0, 4000]);
  const [selectedColor, setSelectedColor] = useState("all");
  const [resultsPerPage, setResultsPerPage] = useState(12);
  const [sortBy, setSortBy] = useState("relevance");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { categoryName } = useParams();
  const { addToCart } = useCart();

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(
    categoryName || "all"
  );

  const colorOptions = [
    { name: "Silver", value: "#C0C0C0" },
    { name: "Yellow", value: "#FFC955" },
    { name: "Space Gray", value: "#34303A" },
    { name: "Blue", value: "#447690" },
    { name: "Purple", value: "#BCB5E7" },
    { name: "Red", value: "#FB1533" },
    { name: "Green", value: "#AEBFAC" },
    { name: "White", value: "#F9F9F9" },
    { name: "Pink", value: "#E7D1CF" },
  ];

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await productServices.getAllCategories();
      if (response && response.categories) {
        setCategories(response.categories);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  // Fetch products based on category
  const fetchProductsByCategory = async (category) => {
    try {
      setIsLoading(true);
      setError(null);

      let response;
      if (category === "all") {
        response = await productServices.getAllProducts();
      } else {
        response = await productServices.getProductsByCategoryName(category);
      }

      if (response && response.products) {
        const parsedProducts = response.products.map((product) => ({
          ...product,
          colors: JSON.parse(product.colors[0] || "[]"),
        }));
        setProducts(parsedProducts);
        applyFilters(parsedProducts);
      } else {
        setProducts([]);
        setFilteredProducts([]);
        setError("No products found.");
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to fetch products. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch of categories and products
  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProductsByCategory(selectedCategory);
  }, [selectedCategory]);

  // Function to apply all filters
  const applyFilters = (productsToFilter) => {
    let tempProducts = [...productsToFilter];

    // Filter by color
    if (selectedColor !== "all") {
      tempProducts = tempProducts.filter((product) =>
        product.colors.includes(selectedColor)
      );
    }

    // Filter by price range
    tempProducts = tempProducts.filter(
      (product) =>
        product.lowestPrice >= priceRange[0] &&
        product.largestPrice <= priceRange[1]
    );

    // Sort products
    switch (sortBy) {
      case "price-low-high":
        tempProducts.sort((a, b) => a.lowestPrice - b.lowestPrice);
        break;
      case "price-high-low":
        tempProducts.sort((a, b) => b.lowestPrice - a.lowestPrice);
        break;
      case "name-a-z":
        tempProducts.sort((a, b) =>
          a.productTitle.localeCompare(b.productTitle)
        );
        break;
      case "name-z-a":
        tempProducts.sort((a, b) =>
          b.productTitle.localeCompare(a.productTitle)
        );
        break;
      default:
        break;
    }

    // Apply results per page
    setFilteredProducts(tempProducts.slice(0, resultsPerPage));
  };

  // Apply filters whenever filter criteria change
  useEffect(() => {
    if (products.length > 0) {
      applyFilters(products);
    }
  }, [selectedColor, priceRange, sortBy, resultsPerPage, products]);

  // Handle category selection with navigation
  const handleCategorySelect = (category, e) => {
    e.preventDefault();
    setSelectedCategory(category);

    // Update URL without full page refresh
    const newUrl =
      category === "all"
        ? "/categories"
        : `/categories/${encodeURIComponent(category)}`;

    navigate(newUrl, { replace: true });
  };

  const handleColorSelect = (color) => {
    setSelectedColor(color === selectedColor ? "all" : color);
  };

  const handleAddToCart = (product, e) => {
    e.stopPropagation(); // Prevent navigation when clicking add to cart
    const cartItem = {
      id: product._id,
      name: product.productTitle,
      price: product.lowestPrice,
      image: product.images[0]?.url || "/placeholder.jpg",
      color: selectedColor !== "all" ? selectedColor : product.colors[0],
    };
    addToCart(cartItem);
    message.info("Added to cart");
  };

  // Handle product click navigation
  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100/65 px-4 md:px-20 py-6 md:py-20 md:pb-3">
      <NavBar />
      <div className="flex flex-1 sm:mb-14 md:mb-14 lg:mb-14 lx:mb-14">
        <aside className="hidden md:block w-64 transition-all duration-300 bg-white shadow-lg overflow-hidden">
          <div className="p-4">
            {/* Categories Filter */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Categories</h3>
              <div className="space-y-2">
                <button
                  onClick={(e) => handleCategorySelect("all", e)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition ${
                    selectedCategory === "all"
                      ? "bg-blue-500 text-white"
                      : "hover:bg-gray-100"
                  }`}
                >
                  All Categories
                </button>
                {categories.map((category) => (
                  <button
                    key={category._id}
                    onClick={(e) => handleCategorySelect(category.name, e)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition ${
                      selectedCategory === category.name
                        ? "bg-blue-500 text-white"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Colors Filter */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Colors</h3>
              <div className="grid grid-cols-5 gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => handleColorSelect(color.value)}
                    className={`w-8 h-8 rounded-full border-2 focus:outline-none ${
                      selectedColor === color.value
                        ? "ring-2 ring-blue-500 ring-offset-2"
                        : ""
                    }`}
                    style={{
                      backgroundColor: color.value,
                      border:
                        color.name === "White" ? "1px solid #e5e7eb" : "none",
                    }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            {/* Price Range Filter */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Price Range</h3>
              <input
                type="range"
                min="0"
                max="4000"
                value={priceRange[1]}
                onChange={(e) =>
                  setPriceRange([priceRange[0], parseInt(e.target.value)])
                }
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-600">
                <span>LKR {priceRange[0]}.00</span>
                <span>LKR {priceRange[1]}.00</span>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 p-2 md:p-6 md:pt-0 md:pb-0">
          <div className="bg-white rounded-lg shadow-sm mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between p-4 space-y-4 md:space-y-0">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border p-2 rounded-lg text-sm md:text-base flex-1 md:flex-none"
              >
                <option value="relevance">Relevance</option>
                <option value="price-low-high">Price: Low to High</option>
                <option value="price-high-low">Price: High to Low</option>
                <option value="name-a-z">Name: A to Z</option>
                <option value="name-z-a">Name: Z to A</option>
              </select>
              <select
                value={resultsPerPage}
                onChange={(e) => setResultsPerPage(parseInt(e.target.value))}
                className="border p-2 rounded-lg text-sm md:text-base"
              >
                <option value="12">12 per page</option>
                <option value="24">24 per page</option>
                <option value="48">48 per page</option>
              </select>
            </div>
          </div>

          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
                : "space-y-4"
            }
          >
            {isLoading ? (
              <div className="col-span-full flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : products.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-500">
                <div className="text-6xl mb-4">😕</div>
                <h3 className="text-xl font-semibold mb-2">
                  No Products Available
                </h3>
                <p>
                  There are no products available in this category at the
                  moment.
                </p>
              </div>
            ) : (
              filteredProducts.map((product) => (
                <div
                  key={product._id}
                  onClick={() => handleProductClick(product._id)}
                  className={`bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200 cursor-pointer`}
                >
                  <div className="relative">
                    <img
                      src={product.images[0]?.url || "/placeholder.jpg"}
                      alt={product.productTitle}
                      className="w-full h-48 object-contain"
                    />
                    
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-lg mb-2 text-gray-800">
                      {product.productTitle}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Price: LKR {product.lowestPrice} - LKR{" "}
                      {product.largestPrice}
                    </p>
                    <div className="mt-4 flex items-center space-x-2">
                      <button
                        onClick={(e) => handleAddToCart(product, e)}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition flex items-center gap-2 w-full justify-center"
                      >
                        <ShoppingCart size={20} />
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default Categories;
