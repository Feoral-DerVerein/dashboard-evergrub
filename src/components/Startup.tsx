
import { Link } from "react-router-dom";
import { Rocket, Monitor, Server, Globe } from "lucide-react";

const Startup = () => {
  const startupOptions = [
    {
      name: "Apple",
      icon: <Monitor className="w-8 h-8 text-gray-800" />,
      description: "Hardware & software ecosystem",
      path: "/apple"
    }
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Startup Solutions</h2>
        <div className="flex items-center gap-2">
          <Rocket className="w-5 h-5 text-blue-600" />
          <span className="text-sm text-blue-600 font-medium">Quick Launch</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {startupOptions.map((option, index) => (
          <Link
            key={index}
            to={option.path}
            className="flex flex-col items-center justify-center p-4 rounded-xl bg-white border border-gray-100 
                     transition-all duration-200 hover:shadow-md hover:border-blue-100"
          >
            <div className="mb-2">{option.icon}</div>
            <h3 className="text-base font-medium mb-1">{option.name}</h3>
            <p className="text-xs text-gray-500 text-center">{option.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Startup;
