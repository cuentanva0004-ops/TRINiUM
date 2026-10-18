import { FormEvent, useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";

type IconName =
  | "arrow"
  | "cart"
  | "check"
  | "close"
  | "cube"
  | "edit"
  | "eye"
  | "eyeOff"
  | "heart"
  | "layers"
  | "logout"
  | "menu"
  | "message"
  | "minus"
  | "package"
  | "plus"
  | "search"
  | "spark"
  | "trash"
  | "upload"
  | "user";

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, ReactNode> = {
    arrow: <><path d="M4 12h16" /><path d="m14 6 6 6-6 6" /></>,
    cart: <><circle cx="9" cy="20" r="1" /><circle cx="19" cy="20" r="1" /><path d="M3 4h2l2.5 11h10l2-7H7" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    close: <path d="M6 6l12 12M18 6 6 18" />,
    cube: <><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" /><path d="m4.5 7.5 7.5 4 7.5-4M12 21v-9.5" /></>,
    edit: <><path d="M12 20h9" /><path d="m16.5 3.5 4 4L9 19l-5 1 1-5L16.5 3.5Z" /></>,
    eye: <><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" /><circle cx="12" cy="12" r="2.5" /></>,
    eyeOff: <><path d="m3 3 18 18" /><path d="M10.6 6.2A9.8 9.8 0 0 1 12 6c6.5 0 10 6 10 6a16 16 0 0 1-2.1 2.8M6.6 6.7C3.6 8.4 2 12 2 12s3.5 6 10 6a9.7 9.7 0 0 0 4-.8" /></>,
    heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />,
    layers: <><path d="m12 2 9 5-9 5-9-5 9-5Z" /><path d="m3 12 9 5 9-5M3 17l9 5 9-5" /></>,
    logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5M21 12H9" /></>,
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
    message: <><path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9.3 9.3 0 0 1-3.8-.9L3 21l1.7-5a8.3 8.3 0 1 1 16.3-4.5Z" /><path d="M8 10.5c1.2 2.4 2.8 3.9 5.4 5l1.8-1.7" /></>,
    minus: <path d="M5 12h14" />,
    package: <><path d="m4 7 8-4 8 4-8 4-8-4Z" /><path d="M4 7v10l8 4 8-4V7M12 11v10" /></>,
    plus: <path d="M12 5v14M5 12h14" />,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    spark: <><path d="m12 3 1.2 4.2L17 9l-3.8 1.8L12 15l-1.2-4.2L7 9l3.8-1.8L12 3Z" /><path d="m19 15 .6 2.1 1.9.9-1.9.9L19 21l-.6-2.1-1.9-.9 1.9-.9L19 15Z" /></>,
    trash: <><path d="M4 7h16M9 7V4h6v3M7 7l1 14h8l1-14M10 11v6M14 11v6" /></>,
    upload: <><path d="M12 16V4M7 9l5-5 5 5" /><path d="M5 14v6h14v-6" /></>,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
  };
  return <svg aria-hidden="true" className="icon" fill="none" height={size} viewBox="0 0 24 24" width={size}>{paths[name]}</svg>;
}

type Product = {
  id: number;
  name: string;
  category: "Impresión 3D" | "Sublimación";
  category_id?: number;
  slug?: string;
  price: number;
  image: string;
  tag?: string;
  visible: boolean;
  featured?: boolean;
  customizable?: boolean;
  stock?: number;
  description: string;
};

const API_BASE = "https://triniumdb.infinityfree.io/api";
const WA_NUMBER = "573000000000"; // Reemplaza por el WhatsApp real de TRINiUM.
const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1703221561813-cdaa308cf9e7?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900&h=1000";

const initialProducts: Product[] = [];

const money = (value: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(value);

type ApiResponse<T> = { success: boolean; message: string; data: T; errors?: unknown };

async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("trinium_admin_token");
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const body = (await response.json().catch(() => ({}))) as ApiResponse<T>;
  if (!response.ok || body.success === false) {
    throw new Error(body.message || `Error HTTP ${response.status}`);
  }
  return body.data;
}

function mapProduct(raw: any): Product {
  return {
    id: Number(raw.id),
    name: raw.name,
    category: raw.category === "Sublimación" ? "Sublimación" : "Impresión 3D",
    category_id: Number(raw.category_id ?? (raw.category_slug === "sublimacion" ? 2 : 1)),
    slug: raw.slug,
    price: Number(raw.price),
    image: raw.image || DEFAULT_IMAGE,
    tag: raw.tag || undefined,
    visible: Boolean(Number(raw.visible)),
    featured: Boolean(Number(raw.featured)),
    customizable: Boolean(Number(raw.customizable)),
    stock: Number(raw.stock ?? 0),
    description: raw.description || "",
  };
}

function useReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add("is-visible")),
      { threshold: 0.12 },
    );
    document.querySelectorAll(".reveal").forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);
}

function Brand() {
  return (
    <a className="brand" href="#inicio" aria-label="TRINiUM, inicio">
      <img src="/assets/trinium-mark-flat.png" alt="" />
      <span>TRIN<span>i</span>UM</span>
    </a>
  );
}

export default function App() {
  useReveal();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [category, setCategory] = useState("Todos");
  const [cart, setCart] = useState<Record<number, number>>(() => JSON.parse(localStorage.getItem("trinium_cart") || "{}"));
  const [favorites, setFavorites] = useState<number[]>(() => JSON.parse(localStorage.getItem("trinium_favorites") || "[]"));
  const [cartOpen, setCartOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [admin, setAdmin] = useState(Boolean(localStorage.getItem("trinium_admin_token")));
  const [editing, setEditing] = useState<Product | null>(null);
  const [adminSearch, setAdminSearch] = useState("");
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(true);

  const shownProducts = products.filter((product) => product.visible && (category === "Todos" || product.category === category));
  const cartProducts = products.filter((product) => cart[product.id]);
  const cartCount = (Object.values(cart) as number[]).reduce((sum, quantity) => sum + quantity, 0);
  const total = cartProducts.reduce((sum, product) => sum + product.price * cart[product.id], 0);

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2400);
  };

  useEffect(() => {
    localStorage.setItem("trinium_cart", JSON.stringify(cart));
  }, [cart]);
  useEffect(() => {
    localStorage.setItem("trinium_favorites", JSON.stringify(favorites));
  }, [favorites]);
  useEffect(() => {
    let active = true;
    api<any[]>("/products")
      .then((data) => active && setProducts(data.map(mapProduct)))
      .catch(() => active && notify("No se pudo cargar el catálogo desde la API"))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const add = (id: number) => {
    setCart((current) => ({ ...current, [id]: (current[id] || 0) + 1 }));
    notify("Añadido a tu selección");
  };
  const quantity = (id: number, amount: number) => {
    setCart((current) => {
      const updated = { ...current, [id]: Math.max(0, (current[id] || 0) + amount) };
      if (!updated[id]) delete updated[id];
      return updated;
    });
  };
  const sendOrder = async () => {
    if (!cartProducts.length) return;
    try {
      const detail = cartProducts.map((p) => `• ${cart[p.id]}x ${p.name} — ${money(p.price * cart[p.id])}`).join("\n");
      await api<{ id: number }>("/orders", {
        method: "POST",
        body: JSON.stringify({
          customer_name: "Cliente web TRINiUM",
          total,
          notes: "Pedido generado desde la tienda web.",
          items: cartProducts.map((p) => ({ product_id: p.id, quantity: cart[p.id], unit_price: p.price, subtotal: p.price * cart[p.id] })),
        }),
      });
      const message = encodeURIComponent(`Hola TRINiUM, quiero crear este pedido:\n\n${detail}\n\nTotal: ${money(total)}\n\nQuiero conversar sobre la personalización.`);
      window.open(`https://wa.me/${WA_NUMBER}?text=${message}`, "_blank", "noopener,noreferrer");
      notify("Pedido registrado y listo para WhatsApp");
    } catch (error) {
      notify(error instanceof Error ? error.message : "No se pudo registrar el pedido");
    }
  };

  const saveProduct = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editing) return;
    const payload = {
      category_id: editing.category_id ?? (editing.category === "Sublimación" ? 2 : 1),
      name: editing.name,
      slug: editing.slug || editing.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
      description: editing.description,
      price: editing.price,
      image: editing.image,
      stock: editing.stock ?? 0,
      visible: editing.visible ? 1 : 0,
      featured: editing.featured ? 1 : 0,
      customizable: editing.customizable ? 1 : 0,
      tag: editing.tag || null,
    };
    try {
      if (editing.id > 0 && products.some((p) => p.id === editing.id)) {
        await api(`/products/${editing.id}`, { method: "PUT", body: JSON.stringify(payload) });
      } else {
        await api(`/products`, { method: "POST", body: JSON.stringify(payload) });
      }
      const fresh = await api<any[]>("/products");
      setProducts(fresh.map(mapProduct));
      setEditing(null);
      notify("Producto sincronizado con MySQL");
    } catch (error) {
      notify(error instanceof Error ? error.message : "No se pudo guardar el producto");
    }
  };

  const loginAdmin = async (email: string, password: string) => {
    const data = await api<{ token: string }>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
    localStorage.setItem("trinium_admin_token", data.token);
    setAdmin(true);
    setLoginOpen(false);
    notify("Acceso autorizado");
  };

  const logoutAdmin = async () => {
    try { await api("/auth/logout", { method: "POST" }); } catch {}
    localStorage.removeItem("trinium_admin_token");
    setAdmin(false);
  };

  if (admin) {
    return (
      <Admin
        products={products}
        search={adminSearch}
        editing={editing}
        toast={toast}
        onSearch={setAdminSearch}
        onEdit={setEditing}
        onClose={() => setEditing(null)}
        onSave={saveProduct}
        onNew={() => setEditing({ id: 0, name: "", category: "Impresión 3D", category_id: 1, price: 0, image: DEFAULT_IMAGE, visible: true, description: "", stock: 0, customizable: true })}
        onToggle={async (id) => { const p = products.find((item) => item.id === id); if (!p) return; try { await api(`/products/${id}`, { method: "PUT", body: JSON.stringify({ category_id: p.category_id ?? 1, name: p.name, slug: p.slug, price: p.price, description: p.description, image: p.image, stock: p.stock ?? 0, visible: p.visible ? 0 : 1, featured: p.featured ? 1 : 0, customizable: p.customizable ? 1 : 0, tag: p.tag || null }) }); const fresh = await api<any[]>("/products"); setProducts(fresh.map(mapProduct)); notify("Visibilidad actualizada"); } catch (error) { notify(error instanceof Error ? error.message : "No se pudo actualizar"); } }}
        onDelete={async (id) => { try { await api(`/products/${id}`, { method: "DELETE" }); setProducts((current) => current.filter((p) => p.id !== id)); notify("Producto eliminado"); } catch (error) { notify(error instanceof Error ? error.message : "No se pudo eliminar"); } }}
        onLogout={logoutAdmin}
      />
    );
  }

  return (
    <div className="app">
      <div className="noise" />
      <header className="header">
        <div className="shell nav-row">
          <Brand />
          <nav className={menuOpen ? "open" : ""}>
            {["Colección", "Tecnología", "Proceso", "Estudio"].map((item, index) => (
              <a key={item} href={["#productos", "#tecnologia", "#proceso", "#estudio"][index]} onClick={() => setMenuOpen(false)}>{item}</a>
            ))}
          </nav>
          <div className="nav-actions">
            <button className="ghost-icon user-action" onClick={() => setLoginOpen(true)} aria-label="Ingresar"><Icon name="user" size={18} /><span>Acceso</span></button>
            <button className="cart-action" onClick={() => setCartOpen(true)}><span>Selección</span><b>{String(cartCount).padStart(2, "0")}</b></button>
            <button className="mobile-menu" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menú"><Icon name={menuOpen ? "close" : "menu"} /></button>
          </div>
        </div>
      </header>

      <main>
        <section className="hero" id="inicio">
          <div className="hero-grid-bg" />
          <div className="aurora aurora-one" />
          <div className="aurora aurora-two" />
          <div className="shell hero-layout">
            <div className="hero-copy">
              <div className="status-pill"><i /><span>Objetos del futuro, fabricados hoy</span></div>
              <h1>
                <span className="line-mask"><span>IMAGINA.</span></span>
                <span className="line-mask"><span>DISEÑA.</span></span>
                <span className="line-mask accent-line"><span>HAZLO REAL.</span></span>
              </h1>
              <p>Impresión 3D y sublimación de nueva generación. Diseñamos piezas únicas, funcionales y hechas para llevar tu identidad.</p>
              <div className="hero-buttons">
                <a className="button-primary magnetic" href="#productos"><span>Explorar colección</span><Icon name="arrow" /></a>
                <a className="button-link" href={`https://wa.me/${WA_NUMBER}`} target="_blank" rel="noreferrer"><span className="play-dot"><Icon name="message" size={17} /></span>Crear algo único</a>
              </div>
              <div className="hero-metrics">
                <div><strong>500<span>+</span></strong><small>Piezas creadas</small></div>
                <div><strong>0.2<span>mm</span></strong><small>Precisión de capa</small></div>
                <div><strong>4.9<span>/5</span></strong><small>Experiencia</small></div>
              </div>
            </div>

            <div className="hero-object" aria-label="Logo tridimensional TRINiUM">
              <div className="orbit orbit-a"><i /><i /><i /></div>
              <div className="orbit orbit-b"><i /></div>
              <div className="logo-energy" />
              <img className="hero-logo" src="/assets/trinium-mark.png" alt="Isotipo metálico de TRINiUM" />
              <div className="scan-line" />
              <div className="hud hud-top"><span>TRI / CORE</span><b>ONLINE</b></div>
              <div className="hud hud-side"><span>PRECISION</span><b>99.8%</b></div>
              <div className="hud hud-bottom"><i /><span>FABRICACIÓN<br />DIGITAL</span></div>
            </div>
          </div>
          <div className="hero-footer shell">
            <span>SCROLL TO DISCOVER</span><i />
            <span>EST. 2025 — COLOMBIA</span>
          </div>
        </section>

        <div className="ticker">
          <div>
            {[0, 1].map((set) => (
              <span key={set}>IMPRESIÓN 3D <i /> SUBLIMACIÓN <i /> DISEÑO PERSONALIZADO <i /> PROTOTIPADO <i /> IDEAS SIN LÍMITES <i /></span>
            ))}
          </div>
        </div>

        <section className="capabilities section" id="tecnologia">
          <div className="shell">
            <div className="section-intro reveal">
              <div><span className="overline">01 / CAPACIDADES</span><h2>Dos tecnologías.<br /><em>Infinitas posibilidades.</em></h2></div>
              <p>Unimos fabricación digital y expresión gráfica para llevar ideas desde la pantalla hasta tus manos.</p>
            </div>
            <div className="capability-grid">
              <a className="capability-card card-3d reveal" href="#productos" onClick={() => setCategory("Impresión 3D")}>
                <div className="card-noise" />
                <div className="cap-card-head"><span>01</span><Icon name="arrow" /></div>
                <div className="layer-sculpture">
                  {[86, 108, 128, 145, 158, 165, 168, 164, 154, 142, 126, 112, 103, 108, 119, 130].map((width, index) => <i key={index} style={{ "--layer-width": `${width}px`, "--delay": `${index * 0.06}s` } as CSSProperties} />)}
                  <span className="nozzle" />
                </div>
                <div className="cap-card-copy"><small>FABRICACIÓN ADITIVA</small><h3>Impresión 3D</h3><p>Figuras, prototipos y objetos funcionales construidos capa por capa con precisión.</p><span className="explore">Explorar piezas <Icon name="arrow" size={16} /></span></div>
              </a>
              <a className="capability-card card-sub reveal reveal-delay" href="#productos" onClick={() => setCategory("Sublimación")}>
                <div className="thermal-lines" />
                <div className="cap-card-head"><span>02</span><Icon name="arrow" /></div>
                <div className="mug-visual"><div className="mug-body"><span>YOUR<br />IDEA</span></div><i /><b /></div>
                <div className="cap-card-copy"><small>TRANSFERENCIA TÉRMICA</small><h3>Sublimación</h3><p>Color de alta definición sobre objetos que comunican quién eres.</p><span className="explore">Explorar diseños <Icon name="arrow" size={16} /></span></div>
              </a>
            </div>
          </div>
        </section>

        <section className="products section" id="productos">
          <div className="shell">
            <div className="products-head reveal">
              <div><span className="overline">02 / COLECCIÓN</span><h2>Objetos con carácter.</h2></div>
              <div className="filter-tabs">
                {["Todos", "Impresión 3D", "Sublimación"].map((item) => <button className={category === item ? "active" : ""} onClick={() => setCategory(item)} key={item}>{item}</button>)}
              </div>
            </div>
            <div className="product-grid">
              {loading ? <div className="reveal is-visible" style={{ padding: "3rem 0" } as CSSProperties}>Cargando colección desde TRINiUM API…</div> : shownProducts.map((product, index) => (
                <article className="product-card reveal" style={{ "--reveal-delay": `${(index % 3) * 0.08}s` } as CSSProperties} key={product.id}>
                  <div className="product-media">
                    <img src={product.image} alt={product.name} loading="lazy" />
                    <div className="product-gradient" />
                    <span className="product-index">{String(index + 1).padStart(2, "0")}</span>
                    {product.tag && <span className="product-tag">{product.tag}</span>}
                    <button className={`heart ${favorites.includes(product.id) ? "active" : ""}`} onClick={() => setFavorites((current) => current.includes(product.id) ? current.filter((id) => id !== product.id) : [...current, product.id])} aria-label="Favorito"><Icon name="heart" size={18} /></button>
                    <button className="quick-add" onClick={() => add(product.id)}><span>Agregar</span><Icon name="plus" size={18} /></button>
                  </div>
                  <div className="product-copy"><span>{product.category}</span><h3>{product.name}</h3><p>{product.description}</p><div><strong>{money(product.price)}</strong><small>Personalizable</small></div></div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="process section" id="proceso">
          <div className="process-glow" />
          <div className="shell">
            <div className="section-intro reveal">
              <div><span className="overline">03 / PROCESO</span><h2>De cero a objeto.<br /><em>Sin complicaciones.</em></h2></div>
              <p>Una experiencia clara, colaborativa y diseñada para que el resultado se sienta exactamente como lo imaginaste.</p>
            </div>
            <div className="process-track">
              {[
                ["01", "Brief", "Nos cuentas la idea, uso, medida y plazo."],
                ["02", "Diseño", "Traducimos tu concepto a una solución fabricable."],
                ["03", "Producción", "Creamos y controlamos cada capa, color y detalle."],
                ["04", "Entrega", "Coordinamos para que llegue impecable a tus manos."],
              ].map(([number, title, text], index) => (
                <div className="process-step reveal" style={{ "--reveal-delay": `${index * 0.1}s` } as CSSProperties} key={number}>
                  <div className="step-node"><span>{number}</span><i /></div>
                  <h3>{title}</h3><p>{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="studio section" id="estudio">
          <div className="shell studio-panel reveal">
            <div className="studio-grid" />
            <div className="studio-copy"><span className="overline">04 / TU PRÓXIMA IDEA</span><h2>No buscamos hacer<br />más de lo mismo.</h2><p>Si puedes imaginarlo, conversemos. Nuestro trabajo empieza donde termina el catálogo.</p><a className="button-primary" href={`https://wa.me/${WA_NUMBER}`} target="_blank" rel="noreferrer"><span>Iniciar un proyecto</span><Icon name="arrow" /></a></div>
            <div className="studio-mark"><div className="mark-rings" /><img src="/assets/trinium-mark-flat.png" alt="" loading="lazy" /><span>MAKE IT REAL</span></div>
          </div>
        </section>
      </main>

      <footer>
        <div className="shell footer-main">
          <Brand />
          <p>Fabricación digital para ideas<br />que merecen existir.</p>
          <div><a href="#productos">Colección</a><a href="#proceso">Proceso</a><a href={`https://wa.me/${WA_NUMBER}`}>WhatsApp</a></div>
          <span>© 2026 TRINiUM<br />HECHO EN COLOMBIA</span>
        </div>
        <div className="footer-word">TRIN<span>i</span>UM</div>
      </footer>

      {cartOpen && <CartDrawer products={cartProducts} quantities={cart} total={total} onClose={() => setCartOpen(false)} onQuantity={quantity} onSend={sendOrder} />}
      {loginOpen && <LoginModal onClose={() => setLoginOpen(false)} onLogin={loginAdmin} />}
      {toast && <div className="toast"><span><Icon name="check" size={14} /></span>{toast}</div>}
    </div>
  );
}

function CartDrawer({ products, quantities, total, onClose, onQuantity, onSend }: { products: Product[]; quantities: Record<number, number>; total: number; onClose: () => void; onQuantity: (id: number, amount: number) => void; onSend: () => void }) {
  return (
    <div className="overlay" onMouseDown={onClose}>
      <aside className="cart-drawer" onMouseDown={(event) => event.stopPropagation()}>
        <div className="drawer-head"><div><span>SELECCIÓN ACTUAL</span><h2>Tu pedido</h2></div><button onClick={onClose}><Icon name="close" /></button></div>
        <div className="cart-list">
          {!products.length ? <div className="empty-cart"><Icon name="cart" size={32} /><h3>Aún no has elegido nada.</h3><p>Explora la colección y agrega las piezas que te interesan.</p><button className="button-primary" onClick={onClose}>Explorar colección</button></div> :
            products.map((product) => <div className="cart-item" key={product.id}><img src={product.image} alt="" /><div><span>{product.category}</span><h3>{product.name}</h3><strong>{money(product.price)}</strong><div className="quantity"><button onClick={() => onQuantity(product.id, -1)}><Icon name="minus" size={13} /></button><b>{quantities[product.id]}</b><button onClick={() => onQuantity(product.id, 1)}><Icon name="plus" size={13} /></button></div></div><button className="remove" onClick={() => onQuantity(product.id, -quantities[product.id])}><Icon name="trash" size={16} /></button></div>)}
        </div>
        {!!products.length && <div className="cart-total"><div><span>Total estimado</span><strong>{money(total)}</strong></div><p>Personalización y entrega se coordinan contigo.</p><button onClick={onSend}><Icon name="message" /> Finalizar por WhatsApp</button></div>}
      </aside>
    </div>
  );
}

function LoginModal({ onClose, onLogin }: { onClose: () => void; onLogin: (email: string, password: string) => Promise<void> }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <div className="overlay centered" onMouseDown={onClose}>
      <form className="login-modal" onSubmit={async (event) => { event.preventDefault(); setBusy(true); setError(""); try { await onLogin(email, password); } catch (e) { setError(e instanceof Error ? e.message : "Credenciales inválidas"); } finally { setBusy(false); } }} onMouseDown={(event) => event.stopPropagation()}>
        <button className="modal-x" type="button" onClick={onClose}><Icon name="close" /></button>
        <img src="/assets/trinium-mark-flat.png" alt="" />
        <span>TRINIUM / CONTROL</span><h2>Acceso al sistema</h2><p>Administra productos, visibilidad y pedidos.</p>
        <label>Correo<input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="admin@trinium.local" required /></label>
        <label>Contraseña<input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="••••••••" required /></label>
        {error && <small style={{ color: "#ff6b6b" }}>{error}</small>}
        <button className="button-primary submit" type="submit" disabled={busy}>{busy ? "Validando…" : "Ingresar"} <Icon name="arrow" /></button>
        <small>Acceso protegido por TRINiUM API.</small>
      </form>
    </div>
  );
}

type AdminProps = {
  products: Product[]; search: string; editing: Product | null; toast: string;
  onSearch: (value: string) => void; onEdit: (product: Product) => void; onClose: () => void;
  onSave: (event: FormEvent<HTMLFormElement>) => void; onNew: () => void; onToggle: (id: number) => void;
  onDelete: (id: number) => void; onLogout: () => void;
};

function Admin({ products, search, editing, toast, onSearch, onEdit, onClose, onSave, onNew, onToggle, onDelete, onLogout }: AdminProps) {
  const shown = useMemo(() => products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase())), [products, search]);
  return (
    <div className="admin">
      <aside className="admin-side"><Brand /><span className="side-label">CONTROL CENTER</span><nav><button className="active"><Icon name="package" />Productos <b>{products.length}</b></button><button><Icon name="message" />Pedidos <i>03</i></button><button><Icon name="layers" />Producción</button></nav><button className="admin-logout" onClick={onLogout}><Icon name="logout" />Salir del sistema</button></aside>
      <main className="admin-main">
        <header className="admin-head"><div><span>TRINIUM / INVENTORY</span><h1>Productos</h1><p>Control total de tu catálogo en tiempo real.</p></div><button className="button-primary" onClick={onNew}><Icon name="plus" />Nuevo producto</button></header>
        <div className="admin-stats">
          <div><small>TOTAL / SKU</small><strong>{String(products.length).padStart(2, "0")}</strong><span>Objetos registrados</span></div>
          <div><small>LIVE / ONLINE</small><strong>{String(products.filter((p) => p.visible).length).padStart(2, "0")}</strong><span>Visibles en tienda</span></div>
          <div><small>HIDDEN / OFFLINE</small><strong>{String(products.filter((p) => !p.visible).length).padStart(2, "0")}</strong><span>En modo oculto</span></div>
        </div>
        <section className="admin-table">
          <div className="admin-toolbar"><div><Icon name="search" /><input value={search} onChange={(e) => onSearch(e.target.value)} placeholder="Buscar en inventario..." /></div><span>{shown.length} RESULTADOS</span></div>
          <div className="table-wrap"><table><thead><tr><th>Objeto</th><th>Tecnología</th><th>Valor</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>{shown.map((product) => <tr key={product.id}><td><div className="admin-product"><img src={product.image} alt="" /><div><strong>{product.name}</strong><small>TRI-{String(product.id).padStart(4, "0")}</small></div></div></td><td>{product.category}</td><td><strong>{money(product.price)}</strong></td><td><button className={`admin-status ${product.visible ? "on" : ""}`} onClick={() => onToggle(product.id)}><i />{product.visible ? "LIVE" : "HIDDEN"}</button></td><td><div className="admin-actions"><button onClick={() => onEdit(product)}><Icon name="edit" size={17} /></button><button onClick={() => onDelete(product.id)}><Icon name="trash" size={17} /></button></div></td></tr>)}</tbody></table></div>
        </section>
      </main>
      {editing && <div className="overlay centered"><form className="editor" onSubmit={onSave}><div className="drawer-head"><div><span>PRODUCT / EDITOR</span><h2>{products.some((p) => p.id === editing.id) ? "Editar objeto" : "Nuevo objeto"}</h2></div><button type="button" onClick={onClose}><Icon name="close" /></button></div><label>Nombre<input value={editing.name} onChange={(e) => onEdit({ ...editing, name: e.target.value })} required /></label><div className="two-fields"><label>Tecnología<select value={editing.category} onChange={(e) => onEdit({ ...editing, category: e.target.value as Product["category"] })}><option>Impresión 3D</option><option>Sublimación</option></select></label><label>Precio<input type="number" value={editing.price || ""} onChange={(e) => onEdit({ ...editing, price: Number(e.target.value) })} required /></label></div><label>Descripción<textarea value={editing.description} onChange={(e) => onEdit({ ...editing, description: e.target.value })} required /></label><label>Imagen / URL<input value={editing.image} onChange={(e) => onEdit({ ...editing, image: e.target.value })} required /></label><label className="check-row"><input type="checkbox" checked={editing.visible} onChange={(e) => onEdit({ ...editing, visible: e.target.checked })} /><span>Publicar inmediatamente</span></label><div className="editor-actions"><button type="button" onClick={onClose}>Cancelar</button><button className="button-primary" type="submit">Guardar cambios</button></div></form></div>}
      {toast && <div className="toast"><span><Icon name="check" size={14} /></span>{toast}</div>}
    </div>
  );
}
