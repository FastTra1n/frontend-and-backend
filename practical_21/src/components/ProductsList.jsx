import ProductCard from "./ProductCard";

function ProductsList({ products, onEdit, onDelete }) {
  if (!products || !products.length) {
    return <div className="empty">Пока что нет ни единого продукта...</div>;
  }

  return (
    <div className="product-list">
      {products.map((p) => (
        <ProductCard
          key={p.key}
          name={p.name}
          price={p.price}
          description={p.description}
          category={p.category}
          quanity={p.quanity}
          image={p.image}
          product={p}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}

export default ProductsList;
