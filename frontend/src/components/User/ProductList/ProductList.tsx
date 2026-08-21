import { useState } from 'react';
import CustomSelect from '../CustomSelect/CustomSelect';
import { useCart } from '../../../context/CartContext';
import { useProducts } from '../../../context/ProductContext';
import './ProductList.css';

const Spiral = ({ style }: { style: React.CSSProperties }) => (
  <img
    src="/images/decorations/spiral-decoration.png"
    alt=""
    aria-hidden="true"
    style={{
      position: 'absolute',
      zIndex: 0,
      opacity: 0.35,
      pointerEvents: 'none',
      userSelect: 'none',
      ...style,
    }}
  />
);

const ProductList = () => {
  const { products: allProducts } = useProducts();
  const { addToCart } = useCart();

  // Hanya sembunyikan produk yang statusnya 'nonaktif' (produk dengan stok 0 / status 'habis' tetap tampil)
  const displayProducts = allProducts.filter(p => p.status !== 'nonaktif');

  const [selectedVariants, setSelectedVariants] = useState<Record<string, number>>({});
  const [addedCategories, setAddedCategories] = useState<Record<string, boolean>>({});

  const handleVariantChange = (category: string, id: number) => {
    setSelectedVariants(prev => ({ ...prev, [category]: id }));
  };

  const handleAddToCart = (activeItem: any, categoryName: string) => {
    const success = addToCart({
      productId: activeItem.id,
      productName: categoryName,
      variant: activeItem.name,
      priceStr: activeItem.priceStr || 'Rp 0',
      weight: activeItem.weight,
      image: activeItem.image,
      stock: activeItem.stock,
    });

    if (success) {
      setAddedCategories(prev => ({ ...prev, [categoryName]: true }));
      setTimeout(() => {
        setAddedCategories(prev => ({ ...prev, [categoryName]: false }));
      }, 1500); // Reset animation after 1.5 seconds
    }
  };

  const CartIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="21" r="2"></circle>
      <circle cx="18" cy="21" r="2"></circle>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
      <line x1="16" y1="8" x2="16" y2="14"></line>
      <line x1="13" y1="11" x2="19" y2="11"></line>
    </svg>
  );

  const CheckIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="check-icon-anim">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  );

  return (
    <>
      <div className="katalog-title">
        <h2>Katalog Produk</h2>
      </div>

      <section className="products-section container" style={{ position: 'relative', overflow: 'hidden' }}>
        {/* Background Spiral Decorations for Product List (Ukuran Ramping & Tersebar Rapi) */}
        <Spiral style={{ top: '2%', left: '1%', width: '85px', transform: 'rotate(25deg)' }} />
        <Spiral style={{ top: '6%', left: '30%', width: '70px', transform: 'rotate(75deg)' }} />
        <Spiral style={{ top: '4%', right: '5%', width: '90px', transform: 'rotate(45deg)' }} />
        <Spiral style={{ top: '10%', right: '25%', width: '75px', transform: 'rotate(-30deg)' }} />

        <Spiral style={{ top: '16%', left: '8%', width: '80px', transform: 'rotate(110deg)' }} />
        <Spiral style={{ top: '20%', left: '42%', width: '95px', transform: 'rotate(15deg)' }} />
        <Spiral style={{ top: '18%', right: '2%', width: '85px', transform: 'rotate(-65deg)' }} />
        <Spiral style={{ top: '26%', right: '35%', width: '70px', transform: 'rotate(80deg)' }} />

        <Spiral style={{ top: '32%', left: '2%', width: '90px', transform: 'rotate(-40deg)' }} />
        <Spiral style={{ top: '38%', left: '25%', width: '75px', transform: 'rotate(135deg)' }} />
        <Spiral style={{ top: '35%', right: '12%', width: '95px', transform: 'rotate(-20deg)' }} />
        <Spiral style={{ top: '44%', right: '40%', width: '80px', transform: 'rotate(55deg)' }} />

        <Spiral style={{ top: '50%', left: '12%', width: '85px', transform: 'rotate(90deg)' }} />
        <Spiral style={{ top: '55%', left: '45%', width: '70px', transform: 'rotate(-85deg)' }} />
        <Spiral style={{ top: '52%', right: '4%', width: '90px', transform: 'rotate(30deg)' }} />
        <Spiral style={{ top: '60%', right: '28%', width: '80px', transform: 'rotate(-45deg)' }} />

        <Spiral style={{ top: '66%', left: '4%', width: '95px', transform: 'rotate(120deg)' }} />
        <Spiral style={{ top: '72%', left: '32%', width: '75px', transform: 'rotate(40deg)' }} />
        <Spiral style={{ top: '69%', right: '8%', width: '85px', transform: 'rotate(-70deg)' }} />
        <Spiral style={{ top: '78%', right: '36%', width: '90px', transform: 'rotate(60deg)' }} />

        <Spiral style={{ top: '84%', left: '2%', width: '80px', transform: 'rotate(-35deg)' }} />
        <Spiral style={{ top: '88%', left: '40%', width: '95px', transform: 'rotate(100deg)' }} />
        <Spiral style={{ top: '86%', right: '15%', width: '75px', transform: 'rotate(25deg)' }} />
        <Spiral style={{ top: '94%', left: '18%', width: '90px', transform: 'rotate(-50deg)' }} />
        <Spiral style={{ top: '96%', right: '5%', width: '85px', transform: 'rotate(80deg)' }} />

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
                            onChange={(val) => handleVariantChange(categoryName, val)}
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
                        className={`btn-add btn-add-full ${addedCategories[categoryName] ? 'added' : ''}`}
                        onClick={() => handleAddToCart(activeItem, categoryName)}
                        disabled={activeItem.stock === 0 || addedCategories[categoryName]}
                      >
                        {activeItem.stock === 0 ? 'Stok Habis' : (
                          addedCategories[categoryName] ? (
                            <>Tersimpan di Keranjang <CheckIcon /></>
                          ) : (
                            <>Tambah ke Keranjang <CartIcon /></>
                          )
                        )}
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
