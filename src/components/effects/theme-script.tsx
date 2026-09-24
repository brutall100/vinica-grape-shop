/**
 * Runs before the first paint: applies the saved (or system) theme so the
 * page never flashes the wrong colours. Also marks that JS is available,
 * which enables scroll-reveal styles.
 */
const script = `(function(){var r=document.documentElement,t;try{t=localStorage.getItem("theme")}catch(e){}if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}r.setAttribute("data-theme",t);r.classList.add("js")})()`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
