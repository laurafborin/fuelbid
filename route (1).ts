@import "tailwindcss";

@theme inline {
  --color-brand: #E8621A;
  --color-brand-dark: #C44E10;
  --color-bg: #F8F7F4;
  --color-foreground: #1a1a1a;
  --font-sans: var(--font-dm-sans);
}

body {
  background: var(--color-bg);
  color: var(--color-foreground);
  font-family: var(--font-sans), system-ui, sans-serif;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
