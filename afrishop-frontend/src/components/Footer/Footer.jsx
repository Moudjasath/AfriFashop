import s from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={s.footer}>
      <div className={s.inner}>
        <div className={s.grid}>
          <div className={s.brand}>
            <div className={s.logo}>AfriShop</div>
            <p>Your destination for authentic African wax prints and contemporary African fashion. Ethically sourced from artisans across West Africa.</p>
          </div>

          <div className={s.col}>
            <h4>Shop</h4>
            <a href="#">Dresses</a>
            <a href="#">Tops</a>
            <a href="#">Accessories</a>
            <a href="#">New Arrivals</a>
          </div>

          <div className={s.col}>
            <h4>Info</h4>
            <a href="#">About Us</a>
            <a href="#">Shipping</a>
            <a href="#">Returns</a>
            <a href="#">FAQ</a>
          </div>

          <div className={s.col}>
            <h4>Contact</h4>
            <a href="mailto:hello@afrishop.com">hello@afrishop.com</a>
            <a href="#">WhatsApp</a>
            <a href="#">Instagram</a>
            <a href="#">Facebook</a>
          </div>
        </div>

        <div className={s.bottom}>
          <p>© 2025 AfriShop · Built by Moudjasath CHAKIBOU</p>
          <div className={s.socials}>
            <button className={s.socialBtn} aria-label="Facebook">📘</button>
            <button className={s.socialBtn} aria-label="Instagram">📸</button>
            <button className={s.socialBtn} aria-label="Twitter">🐦</button>
          </div>
        </div>
      </div>
    </footer>
  );
}
