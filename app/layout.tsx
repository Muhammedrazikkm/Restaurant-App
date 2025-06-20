
import "primereact/resources/themes/lara-light-blue/theme.css"; // PrimeReact theme
import "primereact/resources/primereact.min.css";               // PrimeReact core CSS
import "primeicons/primeicons.css";                             // PrimeReact icons


export const metadata = {
  title: "ResWay",
  description: "Register your restaurant or store with us",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
      </head>
      <body style={{ margin: 0, background: "#f9f9f9", fontFamily: "var(--font-family, sans-serif)" }}>
        <main style={{ minHeight: "100vh", padding: "1rem" }}>
          {children}
        </main>
      </body>
    </html>
  );
}
