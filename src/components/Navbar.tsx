export const Navbar: React.FC = () => {
  return (
    <nav className="flex justify-between">
      <div className="flex items-center">
        <img src="/logo.webp" alt="logo" className="w-16 h-16" />
        <h1 className="text-h5 md:text-h4 font-bold ml-4">Culinary Forecast</h1>
      </div>

      <div className="flex items-center justify-center text-center text-h6">
        Made with ♥ by Kyle
      </div>
    </nav>
  );
};
