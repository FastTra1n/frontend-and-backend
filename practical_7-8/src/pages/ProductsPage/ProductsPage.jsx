import { useState, useEffect } from "react";
import { nanoid } from "nanoid";

import ProductsList from "../../components/ProductsList.jsx";
import ProductModal from "../../components/ProductModal.jsx";

import "./ProductsPage.css";

import { api } from "../../api";

function ProductsPage() {
  const [products, setProducts] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await api.getProducts();
      setProducts(data);
    } catch (e) {
      console.error(e);
    }
  };

  const openCreateModal = () => {
    setModalMode("create");
    setEditingProduct(null);
    setModalOpen(true);
  };

  const openEditModal = (product) => {
    setModalMode("edit");
    setEditingProduct(product);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingProduct(null);
  };

  const handleSubmitModal = async (payload) => {
    try {
      if (modalMode === "create") {
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
            <button
              className="header__add-product"
              onClick={() => openCreateModal()}
            >
              Добавить товар
            </button>
            <button className="header__auth">Авторизоваться</button>
          </div>
        </div>
      </header>

      <main className="main">
        <div className="container">
          <ProductsList products={products} onEdit={openEditModal} />
        </div>
      </main>

      <ProductModal
        mode={modalMode}
        initialProduct={editingProduct}
        isOpen={modalOpen}
        onClose={closeModal}
        onSubmit={handleSubmitModal}
        onDelete={handleDelete}
      />
    </>
  );
}

export default ProductsPage;
