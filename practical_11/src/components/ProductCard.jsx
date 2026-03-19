import "./ProductCard.css";

function ProductCard({
  name,
  price,
  description,
  category,
  quanity,
  image,
  product,
  onEdit,
}) {
  return (
    <div className="product-card" onClick={() => onEdit(product)}>
      <img className="product-card__image" src={image} />
      <div className="product-card__text-wrapper">
        <h3 className="product-card__title">{name}</h3>
        <p className="product-card__desc">{description}</p>
      </div>
      <div className="product-card__info">
        <span className="product-card__price">{price}</span>
        <span className="product-card__category">{category}</span>
        <span
          className={`product-card__quanity ${quanity === 0 && "product-card__quanity--out"}`}
        >
          {quanity}
        </span>
      </div>
    </div>
  );
}

export default ProductCard;
