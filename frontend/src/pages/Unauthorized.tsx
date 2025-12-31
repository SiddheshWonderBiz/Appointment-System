import { Link } from "react-router-dom";

const Unauthorized = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md text-center w-96">
        <h1 className="text-2xl font-bold text-red-600 mb-4">
          Access Denied 
        </h1>

        <p className="text-gray-600 mb-6">
          You do not have permission to access this page.
        </p>

        <Link
          to="/"
          className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized;
