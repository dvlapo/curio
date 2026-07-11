export function Footer() {
  return (
    <footer>
      <div className="footer-mark">
        curio<span>.</span>
      </div>
      <div className="footer-links">
        <a href="#categories">Departments</a>
        <a href="#products">New arrivals</a>
        <a href="#story">Our promise</a>
      </div>
      <div className="footer-bottom">
        <p>A premium marketplace for modern living.</p>
        <p>&copy; {new Date().getFullYear()} Curio Studio</p>
      </div>
    </footer>
  );
}
