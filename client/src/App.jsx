import Header from "./components/Header";
import RequestServiceForm from "./components/RequestServiceForm";
import "./App.css";

function App() {
  return (
    <>
      <Header />

      <section id="home" className="hero">
        <div className="hero-inner">
          <h1>
            Heating & Air Conditioning Experts <span>Serving Your Home</span>
          </h1>
          <p>
            Fast, reliable HVAC service backed by honest pricing and certified
            technicians.
          </p>
          <a href="#request-service" className="primary-btn">
            Request Service
          </a>
        </div>
      </section>

    
      <section id="about" className="section">
        <div className="section-inner">
          <h2>About Alpine HVAC</h2>
          <p>
            At Alpine HVAC, we specialize in reliable heating & cooling
            solutions. With certified technicians and years of experience, we
            deliver comfort, safety, and peace of mind to every home we serve.
          </p>
        </div>
      </section>

      
      <section id="airconditioning" className="section alt">
        <div className="section-inner">
          <h2>Air Conditioning Services</h2>
          <p>
            From AC repair to full system installation, our team ensures your
            home stays cool during the hottest months of the year.
          </p>
        </div>
      </section>

      
      <section id="heating" className="section">
        <div className="section-inner">
          <h2>Heating Services</h2>
          <p>
            Furnace repairs, heating tune-ups, and new system installs — we keep
            your home warm all winter long.
          </p>
        </div>
      </section>

      
      <section className="section alt">
        <div className="section-inner form-wrapper">
          <RequestServiceForm />
        </div>
      </section>

      
      <footer className="footer">
        <p>© {new Date().getFullYear()} Alpine HVAC. All rights reserved.</p>
      </footer>
    </>
  );
}

export default App;
