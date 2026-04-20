import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <button
            onClick={logout}
            className="text-sm text-indigo-600 hover:text-indigo-500 font-medium"
          >
            Log out
          </button>
        </div>
        <div className="bg-white rounded-2xl shadow-md p-6">
          <p className="text-gray-600">Logged in as <span className="font-medium">{user?.email}</span></p>
          <p className="text-gray-500 text-sm mt-2">Dashboard placeholder.</p>
        </div>
      </div>
    </div>
  );
}
