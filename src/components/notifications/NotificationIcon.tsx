
import { Bell, AlertTriangle, Heart, BarChart, ShoppingBag, Check, Clock, DollarSign, ShoppingCart } from "lucide-react";

interface NotificationIconProps {
  type: string;
}

const NotificationIcon = ({ type }: NotificationIconProps) => {
  const iconProps = {
    className: "w-6 h-6"
  };
  
  const wrapperClassName = "w-10 h-10 rounded-full flex items-center justify-center";
  
  switch (type) {
    case "order":
      return <div className={`${wrapperClassName} bg-green-100`}><ShoppingBag {...iconProps} className="text-green-600" /></div>;
    case "stock":
      return <div className={`${wrapperClassName} bg-red-100`}><AlertTriangle {...iconProps} className="text-red-600" /></div>;
    case "pickup":
      return <div className={`${wrapperClassName} bg-blue-100`}><ShoppingCart {...iconProps} className="text-blue-600" /></div>;
    case "sales":
      return <div className={`${wrapperClassName} bg-green-100`}><DollarSign {...iconProps} className="text-green-600" /></div>;
    case "purchase":
      return <div className={`${wrapperClassName} bg-purple-100`}><ShoppingCart {...iconProps} className="text-purple-600" /></div>;
    case "expiration":
      return <div className={`${wrapperClassName} bg-amber-100`}><Clock {...iconProps} className="text-amber-600" /></div>;
    case "wishlist":
      return <div className={`${wrapperClassName} bg-red-100`}><Heart {...iconProps} className="text-red-600" /></div>;
    case "report":
      return <div className={`${wrapperClassName} bg-purple-100`}><BarChart {...iconProps} className="text-purple-600" /></div>;
    default:
      return <div className={`${wrapperClassName} bg-gray-100`}><Bell {...iconProps} className="text-gray-600" /></div>;
  }
};

export default NotificationIcon;
