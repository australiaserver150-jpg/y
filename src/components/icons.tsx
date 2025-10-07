export function Logo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M17 3.34a10 10 0 1 1-14.995 9.125" />
      <path d="M22 8a4 4 0 1 0-8 0 4 4 0 0 0 8 0Z" />
    </svg>
  );
}
