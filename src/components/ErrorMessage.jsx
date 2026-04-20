export default function ErrorMessage({ error, className = "" }) {
  if (!error) return null;
  const message =
    typeof error === "string" ? error : error.message || "Something went wrong";
  return (
    <p
      className={`text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 ${className}`}
      role="alert"
    >
      {message}
    </p>
  );
}
