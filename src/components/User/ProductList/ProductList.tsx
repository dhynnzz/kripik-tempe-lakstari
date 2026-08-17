import { useState } from 'react';
import CustomSelect from '../CustomSelect/CustomSelect';
import { useCart } from '../../../context/CartContext';
import { useProducts } from '../../../context/ProductContext';
import './ProductList.css';

const Spiral = ({ style }: { style: React.CSSProperties }) => (
  <svg
    width="60" height="60" viewBox="0 0 100 100" fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ position: 'absolute', zIndex: -1, opacity: 0.05, ...style }}
  >
    <path
      d="M50 50 C 50 42, 58 42, 58 50 C 58 62, 42 62, 42 50 C 42 34, 66 34, 66 50 C 66 70, 34 70, 34 50 C 34 26, 74 26, 74 50 C 74 78, 26 78, 26 50"
      stroke="#D97706"
      strokeWidth="3"
      strokeLinecap="round"
    />
  </svg>
);

const ProductList = () => {
  const { products: allProducts } = useProducts();

  // Hanya sembunyikan produk yang statusnya 'nonaktif' (produk dengan stok 0 / status 'habis' tetap tampil)
  const displayProducts = allProducts.filter(p => p.status !== 'nonaktif');

  const [selectedVariants, setSelectedVariants] = useState<Record<string, number>>({});

  const handleVariantChange = (category: string, id: number) => {
    setSelectedVariants(prev => ({ ...prev, [category]: id }));
  };

  const { addToCart } = useCart();

  const CartIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="21" r="2"></circle>
      <circle cx="18" cy="21" r="2"></circle>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
      <line x1="16" y1="8" x2="16" y2="14"></line>
      <line x1="13" y1="11" x2="19" y2="11"></line>
    </svg>
  );

  return (
    <>
      <div className="katalog-title">
        <h2>Katalog Produk</h2>
      </div>

      <section className="products-section container" style={{ position: 'relative' }}>

        {/* Background Decorations for Product List */}
        <Spiral style={{ top: '5%', left: '-5%', transform: 'rotate(25deg) scale(2.5)' }} />
        <Spiral style={{ top: '15%', right: '10%', transform: 'rotate(45deg) scale(1.8)' }} />
        <Spiral style={{ top: '25%', right: '-2%', transform: 'rotate(-15deg) scale(3)' }} />
        <Spiral style={{ top: '35%', left: '15%', transform: 'rotate(110deg) scale(2.2)' }} />
        <Spiral style={{ top: '45%', right: '25%', transform: 'rotate(-70deg) scale(1.5)' }} />
        <Spiral style={{ top: '50%', left: '45%', transform: 'rotate(80deg) scale(2)' }} />
        <Spiral style={{ top: '60%', left: '-2%', transform: 'rotate(15deg) scale(3.2)' }} />
        <Spiral style={{ top: '65%', right: '5%', transform: 'rotate(145deg) scale(1.9)' }} />
        <Spiral style={{ top: '75%', left: '5%', transform: 'rotate(-40deg) scale(1.5)' }} />
        <Spiral style={{ top: '85%', left: '35%', transform: 'rotate(90deg) scale(2.1)' }} />
        <Spiral style={{ top: '90%', right: '10%', transform: 'rotate(60deg) scale(2.5)' }} />
        <Spiral style={{ top: '95%', left: '15%', transform: 'rotate(-25deg) scale(1.7)' }} />

        <div className="products-grid-2x2">
          {displayProducts.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '50px', background: '#fff', borderRadius: '16px' }}>
              <h3>Belum Ada Produk Tersedia</h3>
              <p style={{ color: '#64748B' }}>Saat ini belum ada produk aktif yang siap dipesan.</p>
            </div>
          ) : (
            Object.entries(
              displayProducts.reduce((acc, curr) => {
                const cat = curr.category || 'Lainnya';
                if (!acc[cat]) acc[cat] = [];
                acc[cat].push(curr);
                return acc;
              }, {} as Record<string, typeof displayProducts>)
            ).map(([categoryName, items]) => {
              const selectedId = selectedVariants[categoryName] || items[0]?.id;
              const activeItem = items.find(p => p.id === selectedId) || items[0];

              return (
                <div className="product-category-section" key={categoryName}>
                  <h3 className="category-title">{categoryName}</h3>
                  <div className="product-card-large">
                    <span className="product-label quality-label">QUALITY PREMIUM</span>
                    <div className="product-image-placeholder-large">
                      <img src={activeItem.image} alt={activeItem.name} />
                    </div>
                    <div className="product-info">
                      <div className="title-price-row">
                        <h4>{activeItem.name}</h4>
                        <span className="price-large">{activeItem.priceStr}</span>
                      </div>
                      <p className="product-desc-min">{activeItem.weight} | {activeItem.desc}</p>

                      <div className="product-stock-tag">
                        <span className={`stock-indicator-dot ${activeItem.stock === 0 ? 'dot-out' : (activeItem.stock < 50 ? 'dot-low' : 'dot-available')}`}></span>
                        {activeItem.stock === 0 ? (
                          <span style={{ color: '#EF4444', fontWeight: 700 }}>Stok 0 </span>
                        ) : (
                          <>Stok Siap Kirim: <strong>{activeItem.stock} item</strong></>
                        )}
                      </div>

                      <div className="variant-selector">
                        {items.length > 1 ? (
                          <CustomSelect
                            options={items.map(p => ({
                              value: p.id as number,
                              label: p.name
                            }))}
                            value={activeItem.id as number}
                            onChange={(val) => handleVariantChange(categoryName, val as number)}
                          />
                        ) : (
                          <CustomSelect
                            options={[{
                              value: activeItem.id as number,
                              label: activeItem.name
                            }]}
                            value={activeItem.id as number}
                            onChange={() => { }}
                            disabled
                          />
                        )}
                      </div>

                      <button
                        className="btn-add btn-add-full"
                        onClick={() => addToCart({
                          productId: activeItem.id,
                          productName: categoryName,
                          variant: activeItem.name,
                          priceStr: activeItem.priceStr || 'Rp 0',
                          weight: activeItem.weight,
                          image: activeItem.image
                        })}
                        disabled={activeItem.stock === 0}
                      >
                        {activeItem.stock === 0 ? 'Stok Habis' : <>Tambah ke Keranjang <CartIcon /></>}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </>
  );
};

export default ProductList;
