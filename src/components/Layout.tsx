import { Footer } from "./Footer";
import { Navbar } from "./Navbar";

interface Props {
  children: React.ReactNode;
}
export const Layout: React.FC<Props> = ({ children }) => {
  return (
    <div className="flex flex-col m-auto text-black px-8 md:px-0 max-w-5xl">
      <div className="mb-10" />
      <Navbar />
      <div className="mb-10" />
      <main>{children}</main>
      {/* spacing here can vary */}
      <Footer />
      <div className="mb-10" />
    </div>
  );
};
