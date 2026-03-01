import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

import "./ProductModal.css";

function ProductModal({
  mode,
  initialProduct,
  isOpen,
  onClose,
  onSubmit,
  onDelete,
}) {
  const [productId, setProductId] = useState("");
  const [productName, setProductName] = useState("");
  const [productDesc, setProductDesc] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [productPrice, setProductPrice] = useState(0);
  const [productQuanity, setProductQuanity] = useState(0);
  const [productImage, setProductImage] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setProductId(initialProduct?.id ?? "");
    setProductName(initialProduct?.name ?? "");
    setProductDesc(initialProduct?.description ?? "");
    setProductCategory(initialProduct?.category ?? "");
    setProductPrice(
      initialProduct?.price != null ? String(initialProduct.price) : 0,
    );
    setProductQuanity(
      initialProduct?.quanity != null ? String(initialProduct.quanity) : 0,
    );
    setProductImage(initialProduct?.image ?? "");
  }, [isOpen, initialProduct]);

  if (!isOpen) return null;

  const title = mode === "edit" ? "Редактирование товара" : "Добавление товара";

  const handleSubmit = (e) => {
    e.preventDefault();

    if (Number.isFinite(productPrice) || productPrice < 0) {
      alert("Указана неверная цена товара.");
      return;
    }

    if (Number.isFinite(productQuanity) || productQuanity < 0) {
      alert("Указано неверное количество товара.");
      return;
    }

    onSubmit({
      id: productId,
      name: productName,
      price: Number(productPrice),
      description: productDesc,
      category: productCategory,
      quanity: Number(productQuanity),
      image: productImage,
    });
  };

  return createPortal(
    <div className="modal-overlay">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-content__title">{title}</h2>
        <form className="modal-content__form" onSubmit={handleSubmit}>
          <label htmlFor="name">Наименование товара</label>
          <input
            type="text"
            id="name"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            required
          />
          <label htmlFor="description">Описание товара</label>
          <input
            type="text"
            id="description"
            value={productDesc}
            onChange={(e) => setProductDesc(e.target.value)}
          />
          <label htmlFor="category">Категория товара</label>
          <input
            type="text"
            id="category"
            value={productCategory}
            onChange={(e) => setProductCategory(e.target.value)}
            required
          />
          <label htmlFor="price">Цена товара</label>
          <input
            type="number"
            id="price"
            value={productPrice}
            onChange={(e) => setProductPrice(e.target.value)}
          />
          <label htmlFor="quanity">Количество товара на складе</label>
          <input
            type="number"
            id="quanity"
            value={productQuanity}
            onChange={(e) => setProductQuanity(e.target.value)}
          />
          <label htmlFor="image">Изображение товара (ссылка)</label>
          <input
            type="text"
            id="image"
            value={productImage}
            onChange={(e) => setProductImage(e.target.value)}
            required
          />
          <button type="submit" className="btn-form">
            {mode === "edit" ? "Сохранить" : "Добавить"}
          </button>
          {mode === "edit" && (
            <button
              type="button"
              onClick={() => onDelete(productId)}
              className="btn-form btn-form--delete"
            >
              Удалить
            </button>
          )}
        </form>
        <button onClick={onClose} className="modal-close-button">
          Х
        </button>
      </div>
    </div>,
    document.body,
  );
}

export default ProductModal;
