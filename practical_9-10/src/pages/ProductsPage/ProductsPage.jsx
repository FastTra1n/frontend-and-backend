import { useState, useEffect } from "react";
import { nanoid } from "nanoid";

import ProductsList from "../../components/ProductsList.jsx";
import ProductModal from "../../components/ProductModal.jsx";
import AuthModal from "../../components/AuthModal.jsx";

import "./ProductsPage.css";

import { api } from "../../api";

function ProductsPage() {
  const [isUserLogged, setIsUserLogged] = useState(false);

  const [products, setProducts] = useState([]);

  const [productModalOpen, setProductModalOpen] = useState(false);
  const [productModalMode, setProductModalMode] = useState("create");
  const [editingProduct, setEditingProduct] = useState(null);

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState("authorization");

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setIsUserLogged(false);
      return;
    }

    checkTokenValidity();
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const checkTokenValidity = async () => {
    try {
      await api.checkUser();
      setIsUserLogged(true);
    } catch (e) {
      setIsUserLogged(false);
      console.error(e);
    }
  };

  const loadProducts = async () => {
    try {
      const data = await api.getProducts();
      setProducts(data);
    } catch (e) {
      console.error(e);
    }
  };

  const openCreateModal = () => {
    setProductModalMode("create");
    setEditingProduct(null);
    setProductModalOpen(true);
  };

  const openEditModal = (product) => {
    setProductModalMode("edit");
    setEditingProduct(product);
    setProductModalOpen(true);
  };

  const closeModal = () => {
    setProductModalOpen(false);
    setEditingProduct(null);
  };

  const handleSubmitModal = async (payload) => {
    try {
      if (productModalMode === "create") {
        const newProduct = await api.createProduct(payload);
        setProducts((prev) => [...prev, newProduct]);
      } else {
        const updatedProduct = await api.updateProduct(payload.id, payload);
        setProducts((prev) =>
          prev.map((p) => (p.id === payload.id ? updatedProduct : p)),
        );
      }
      closeModal();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAuthModal = async (payload) => {
    try {
      if (authModalMode === "authorization") {
        await api.authUser(payload);
      } else {
        await api.registerUser(payload);
        alert("Аккаунт успешно создан!");
      }
      setAuthModalOpen(false);
      setAuthModalMode("authorization");
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    const ok = window.confirm("Удалить товар?");
    if (!ok) return;

    try {
      await api.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      closeModal();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <header className="header">
        <div className="header__container">
          <h1 className="header__logo">Online store</h1>
          <div className="header__button-wrapper">
            {isUserLogged ? (
              <button
                className="header__add-product"
                onClick={() => openCreateModal()}
              >
                Добавить товар
              </button>
            ) : (
              <button
                className="header__auth"
                onClick={() => setAuthModalOpen(true)}
              >
                Авторизоваться
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="main">
        <div className="container">
          <ProductsList
            products={products}
            onEdit={isUserLogged ? openEditModal : setAuthModalOpen}
          />
        </div>
      </main>

      <ProductModal
        mode={productModalMode}
        initialProduct={editingProduct}
        isOpen={productModalOpen}
        onClose={closeModal}
        onSubmit={handleSubmitModal}
        onDelete={handleDelete}
      />

      <AuthModal
        mode={authModalMode}
        setMode={setAuthModalMode}
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSubmit={handleAuthModal}
      />
    </>
  );
}

export default ProductsPage;
