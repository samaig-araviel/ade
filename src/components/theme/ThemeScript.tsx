// Inline script to prevent flash of wrong theme
// Runs before React hydration to set the correct class
export function ThemeScript() {
  const script = `
    (function() {
      try {
        var theme = localStorage.getItem('ade-theme');
        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else if (theme === 'light') {
          document.documentElement.classList.add('light');
        }
        // If no preference stored, system preference is used via CSS media query
      } catch (e) {}
    })();
  `;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
