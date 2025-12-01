import "./Header.css";

function Header() {
  return (
    <header className="site-header">
      <div className="header-inner">
        <nav className="header-nav">
          <a href="#home">Home</a>
          <a href="#about">About Us</a>
          <a href="#airconditioning">Air Conditioning</a>
          <a href="#heating">Heating</a>
        </nav>

        <div className="header-actions">
          <a href="#request-service" className="header-cta">
            Request Service
          </a>
        </div>
      </div>
    </header>
  );
}

export default Header;
