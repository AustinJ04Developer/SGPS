import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-[80vh] text-center">

      {/* 404 Title */}
      <h1 className="text-6xl font-bold text-blue-600">404</h1>

      {/* Message */}
      <p className="text-gray-600 mt-2 text-lg">
        Oops! Page not found
      </p>

      {/* Description */}
      <p className="text-gray-400 text-sm mt-1">
        The page you are looking for does not exist.
      </p>

      {/* Button using navigate */}
      <button
        onClick={() => navigate("/")}
        className="mt-5 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        Go to Dashboard
      </button>

    </div>
  );
}