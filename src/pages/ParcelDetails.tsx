
import { ArrowLeft, Bell } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const ParcelDetails = () => {
  const navigate = useNavigate();
  
  // This would typically come from URL params or state
  const orderDetails = {
    title: "Corporate Lunch - Tech Co",
    time: "Today, 12:30 PM",
    amount: "$1,240",
    status: "Pending",
    details: {
      location: "123 Tech Street, Silicon Valley",
      contactPerson: "John Smith",
      contactNumber: "+1 234 567 8900",
      items: [
        { name: "Sandwich Platter", quantity: 3, price: "$240" },
        { name: "Fruit Basket", quantity: 2, price: "$100" },
        { name: "Coffee Service", quantity: 1, price: "$900" }
      ]
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto bg-white min-h-screen">
        <header className="px-6 pt-8 pb-6 sticky top-0 bg-white z-10 border-b">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="w-6 h-6" />
              </Button>
              <h1 className="text-2xl font-bold">Order Details</h1>
            </div>
            <Button variant="ghost" size="icon">
              <Bell className="w-6 h-6" />
            </Button>
          </div>
        </header>

        <main className="px-6 pb-20">
          <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="font-semibold text-lg">{orderDetails.title}</h2>
                <p className="text-gray-500">{orderDetails.time}</p>
              </div>
              <span className="inline-block px-2 py-1 rounded text-sm bg-orange-100 text-orange-600">
                {orderDetails.status}
              </span>
            </div>
            <div className="border-t pt-4">
              <p className="font-semibold mb-2">Delivery Details</p>
              <div className="space-y-2 text-gray-600">
                <p>Location: {orderDetails.details.location}</p>
                <p>Contact Person: {orderDetails.details.contactPerson}</p>
                <p>Contact Number: {orderDetails.details.contactNumber}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
            <h3 className="font-semibold mb-4">Order Items</h3>
            <div className="space-y-4">
              {orderDetails.details.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-semibold">{item.price}</p>
                </div>
              ))}
            </div>
            <div className="border-t mt-4 pt-4">
              <div className="flex justify-between items-center">
                <p className="font-semibold">Total Amount</p>
                <p className="font-semibold text-lg text-green-600">{orderDetails.amount}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" className="w-full">
              Reject Order
            </Button>
            <Button className="w-full bg-green-600 hover:bg-green-700">
              Accept Order
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ParcelDetails;
