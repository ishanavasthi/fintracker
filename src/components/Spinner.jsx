export default function Spinner({ size = "md", className = "" }) {
  const sizes = {
    sm: "h-5 w-5 border-2",
    md: "h-10 w-10 border-4",
    lg: "h-14 w-14 border-4",
  };
  return (
    <div
      className={`rounded-full border-indigo-200 border-t-indigo-600 animate-spin ${sizes[size] || sizes.md} ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}

export function FullPageSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Spinner size="lg" />
    </div>
  );
}

export function SectionSpinner() {
  return (
    <div className="flex justify-center py-16">
      <Spinner size="md" />
    </div>
  );
}
