import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-indigo-600">404</h1>
        <p className="text-gray-600 mt-2 mb-6">Page not found</p>
        <Link to="/" className="text-indigo-600 hover:text-indigo-500 font-medium">
          Go home
        </Link>
      </div>
    </div>
  );
}
