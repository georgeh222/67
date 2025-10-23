export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#0a0a0a", color: "#fff", fontFamily: "system-ui" }}>
        {children}
      </body>
    </html>
  );
}
