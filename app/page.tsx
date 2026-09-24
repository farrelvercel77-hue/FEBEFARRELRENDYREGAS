"use client";

import { useEffect, useState } from "react";

type Product = {
  id: number;
  name: string;
  price: number;
  stock: number;
};

const API_URL = "https://rianee-erspi.vercel.app/api/products";

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [error, setError] = useState("");

  // =========================
  // GET PRODUCTS
  // =========================
  const fetchProducts = async () => {
    try {
      setError("");
      setLoadingProducts(true);

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Gagal mengambil produk");
      }

      setProducts(result.data || []);
    } catch (err: any) {
      console.error("GET error:", err);
      setError(err.message || "Gagal mengambil data");
    } finally {
      setLoadingProducts(false);
    }
  };

  // =========================
  // POST PRODUCT
  // =========================
  const addProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Nama produk wajib diisi");
      return;
    }

    if (!price) {
      setError("Harga wajib diisi");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          price: Number(price),
          stock: Number(stock) || 0,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
          result.error_message ||
          "Gagal menambahkan produk"
        );
      }

      setProducts((prev) => [result.data, ...prev]);

      setName("");
      setPrice("");
      setStock("");
    } catch (err: any) {
      console.error("POST error:", err);
      setError(err.message || "Gagal menambahkan produk");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // DELETE PRODUCT
  // =========================
  const deleteProduct = async (id: number) => {
    const confirmed = window.confirm(
      "Yakin ingin menghapus produk ini?"
    );

    if (!confirmed) return;

    try {
      setError("");

      // FIXED: no spaces around =
      const response = await fetch(`${API_URL}?id=${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
          result.error_message ||
          "Gagal menghapus produk"
        );
      }

      setProducts((prev) =>
        prev.filter((product) => product.id !== id)
      );
    } catch (err: any) {
      console.error("DELETE error:", err);
      setError(err.message || "Gagal menghapus produk");
    }
  };

  // =========================
  // INITIAL LOAD
  // =========================
  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <main className="page">
      <div className="container">

        {/* HEADER */}
        <header className="header">
          <div>
            <p className="eyebrow">INVENTORY SYSTEM</p>
            <h1>Product Management</h1>
            <p className="subtitle">
              Kelola produk, harga, dan stok dengan mudah.
            </p>
          </div>

          <button
            className="refreshButton"
            onClick={fetchProducts}
            disabled={loadingProducts}
          >
            <span className={loadingProducts ? "spin" : ""}>
              ↻
            </span>
            Refresh
          </button>
        </header>

        {/* ERROR */}
        {error && (
          <div className="error">
            <span className="errorIcon">!</span>
            <span>{error}</span>
            <button onClick={() => setError("")}>×</button>
          </div>
        )}

        {/* ADD PRODUCT */}
        <section className="card addCard">
          <div className="cardHeader">
            <div>
              <h2>Tambah Produk</h2>
              <p>Masukkan informasi produk baru.</p>
            </div>

            <div className="plus">+</div>
          </div>

          <form onSubmit={addProduct} className="form">
            <div className="field">
              <label>Nama Produk</label>
              <input
                type="text"
                placeholder="Contoh: Keyboard Mechanical"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="formRow">
              <div className="field">
                <label>Harga</label>
                <div className="inputWithPrefix">
                  <span>Rp</span>
                  <input
                    type="number"
                    placeholder="150000"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
              </div>

              <div className="field">
                <label>Stock</label>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                />
              </div>
            </div>

            <button
              className="submitButton"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner" />
                  Menambahkan...
                </>
              ) : (
                <>
                  <span>+</span>
                  Tambah Produk
                </>
              )}
            </button>
          </form>
        </section>

        {/* PRODUCT LIST */}
        <section className="productsSection">
          <div className="sectionHeader">
            <div>
              <h2>Daftar Produk</h2>
              <p>
                {products.length}{" "}
                {products.length === 1 ? "produk" : "produk"} tersedia
              </p>
            </div>

            <div className="countBadge">
              {products.length}
            </div>
          </div>

          {loadingProducts ? (
            <div className="emptyState">
              <span className="bigSpinner" />
              <p>Memuat produk...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="emptyState">
              <div className="emptyIcon">□</div>
              <h3>Belum ada produk</h3>
              <p>
                Tambahkan produk pertama menggunakan form di atas.
              </p>
            </div>
          ) : (
            <div className="productGrid">
              {products.map((product) => (
                <article className="productCard" key={product.id}>
                  <div className="productTop">
                    <div className="productIcon">
                      {product.name.charAt(0).toUpperCase()}
                    </div>

                    <button
                      className="deleteButton"
                      onClick={() => deleteProduct(product.id)}
                      title="Hapus produk"
                    >
                      ×
                    </button>
                  </div>

                  <div className="productInfo">
                    <h3>{product.name}</h3>

                    <div className="price">
                      Rp{" "}
                      {product.price.toLocaleString("id-ID")}
                    </div>
                  </div>

                  <div className="productBottom">
                    <span className="stockLabel">
                      STOCK
                    </span>

                    <span
                      className={
                        product.stock > 0
                          ? "stock available"
                          : "stock empty"
                      }
                    >
                      {product.stock > 0
                        ? `${product.stock} tersedia`
                        : "Habis"}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        .page {
          min-height: 100vh;
          background:
            radial-gradient(
              circle at 20% 0%,
              rgba(99, 102, 241, 0.12),
              transparent 35%
            ),
            #f5f6fa;
          color: #18181b;
          padding: 48px 20px;
          font-family:
            Inter,
            ui-sans-serif,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }

        .container {
          width: 100%;
          max-width: 1000px;
          margin: 0 auto;
        }

        .header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 32px;
        }

        .eyebrow {
          margin: 0 0 8px;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.15em;
          color: #6366f1;
        }

        h1 {
          margin: 0;
          font-size: clamp(30px, 5vw, 44px);
          line-height: 1;
          letter-spacing: -0.04em;
        }

        .subtitle {
          margin: 12px 0 0;
          color: #71717a;
          font-size: 15px;
        }

        .refreshButton {
          display: flex;
          align-items: center;
          gap: 8px;
          border: 1px solid #e4e4e7;
          background: white;
          color: #27272a;
          padding: 10px 15px;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: 0.2s;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }

        .refreshButton:hover {
          border-color: #a1a1aa;
          transform: translateY(-1px);
        }

        .refreshButton span {
          font-size: 19px;
        }

        .spin {
          display: inline-block;
          animation: spin 0.8s linear infinite;
        }

        .error {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 13px 15px;
          margin-bottom: 24px;
          border: 1px solid #fecaca;
          border-radius: 12px;
          background: #fef2f2;
          color: #b91c1c;
          font-size: 14px;
        }

        .errorIcon {
          display: grid;
          place-items: center;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #dc2626;
          color: white;
          font-weight: 800;
        }

        .error button {
          margin-left: auto;
          border: 0;
          background: transparent;
          color: #991b1b;
          font-size: 20px;
          cursor: pointer;
        }

        .card {
          background: white;
          border: 1px solid #e4e4e7;
          border-radius: 18px;
          box-shadow:
            0 8px 30px rgba(0, 0, 0, 0.04);
        }

        .addCard {
          padding: 26px;
          margin-bottom: 42px;
        }

        .cardHeader {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
        }

        .cardHeader h2,
        .sectionHeader h2 {
          margin: 0;
          font-size: 20px;
          letter-spacing: -0.02em;
        }

        .cardHeader p,
        .sectionHeader p {
          margin: 5px 0 0;
          color: #71717a;
          font-size: 13px;
        }

        .plus {
          display: grid;
          place-items: center;
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: #eef2ff;
          color: #4f46e5;
          font-size: 24px;
        }

        .form {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .formRow {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .field label {
          font-size: 12px;
          font-weight: 700;
          color: #52525b;
        }

        .field input {
          width: 100%;
          height: 44px;
          padding: 0 13px;
          border: 1px solid #d4d4d8;
          border-radius: 10px;
          outline: none;
          background: #fafafa;
          color: #18181b;
          font-size: 14px;
          transition: 0.2s;
        }

        .field input:focus {
          border-color: #6366f1;
          background: white;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
        }

        .inputWithPrefix {
          display: flex;
          align-items: center;
          border: 1px solid #d4d4d8;
          border-radius: 10px;
          background: #fafafa;
          overflow: hidden;
        }

        .inputWithPrefix:focus-within {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
          background: white;
        }

        .inputWithPrefix span {
          padding-left: 13px;
          color: #71717a;
          font-size: 13px;
          font-weight: 600;
        }

        .inputWithPrefix input {
          border: 0;
          box-shadow: none;
          background: transparent;
        }

        .inputWithPrefix input:focus {
          box-shadow: none;
        }

        .submitButton {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          height: 44px;
          margin-top: 2px;
          border: 0;
          border-radius: 10px;
          background: #4f46e5;
          color: white;
          font-weight: 700;
          cursor: pointer;
          transition: 0.2s;
        }

        .submitButton:hover:not(:disabled) {
          background: #4338ca;
          transform: translateY(-1px);
        }

        .submitButton:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .spinner,
        .bigSpinner {
          border: 2px solid rgba(255, 255, 255, 0.4);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        .spinner {
          width: 15px;
          height: 15px;
        }

        .sectionHeader {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 18px;
        }

        .countBadge {
          min-width: 32px;
          height: 28px;
          display: grid;
          place-items: center;
          padding: 0 9px;
          border-radius: 8px;
          background: #e4e4e7;
          color: #52525b;
          font-size: 12px;
          font-weight: 800;
        }

        .productGrid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        .productCard {
          min-width: 0;
          padding: 20px;
          border: 1px solid #e4e4e7;
          border-radius: 16px;
          background: white;
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.035);
          transition: 0.2s;
        }

        .productCard:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.08);
          border-color: #c7d2fe;
        }

        .productTop {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .productIcon {
          display: grid;
          place-items: center;
          width: 42px;
          height: 42px;
          border-radius: 11px;
          background: #eef2ff;
          color: #4f46e5;
          font-weight: 800;
          font-size: 17px;
        }

        .deleteButton {
          width: 30px;
          height: 30px;
          border: 0;
          border-radius: 8px;
          background: transparent;
          color: #a1a1aa;
          font-size: 20px;
          cursor: pointer;
          transition: 0.15s;
        }

        .deleteButton:hover {
          background: #fef2f2;
          color: #dc2626;
        }

        .productInfo {
          margin-top: 20px;
        }

        .productInfo h3 {
          margin: 0 0 8px;
          font-size: 16px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .price {
          font-size: 18px;
          font-weight: 800;
          letter-spacing: -0.02em;
        }

        .productBottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-top: 22px;
          padding-top: 14px;
          border-top: 1px solid #f4f4f5;
        }

        .stockLabel {
          color: #a1a1aa;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.12em;
        }

        .stock {
          font-size: 12px;
          font-weight: 700;
        }

        .available {
          color: #16a34a;
        }

        .empty {
          color: #dc2626;
        }

        .emptyState {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 220px;
          border: 1px dashed #d4d4d8;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.5);
          color: #71717a;
          text-align: center;
        }

        .emptyIcon {
          display: grid;
          place-items: center;
          width: 48px;
          height: 48px;
          margin-bottom: 12px;
          border-radius: 12px;
          background: #f4f4f5;
          color: #a1a1aa;
          font-size: 22px;
        }

        .emptyState h3 {
          margin: 0;
          color: #3f3f46;
          font-size: 15px;
        }

        .emptyState p {
          margin: 6px 0 0;
          font-size: 13px;
        }

        .bigSpinner {
          width: 28px;
          height: 28px;
          border-color: #e4e4e7;
          border-top-color: #4f46e5;
          margin-bottom: 12px;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 800px) {
          .productGrid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 600px) {
          .page {
            padding: 28px 15px;
          }

          .header {
            align-items: flex-start;
            flex-direction: column;
          }

          .refreshButton {
            width: 100%;
            justify-content: center;
          }

          .addCard {
            padding: 20px;
          }

          .formRow {
            grid-template-columns: 1fr;
          }

          .productGrid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}

