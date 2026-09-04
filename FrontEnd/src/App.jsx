import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./Components/ProtectedRoute";
import Login from "./Pages/AuthPages/Login";
import Signup from "./Pages/AuthPages/SignUp";
import LandingPage from "./Pages/LandingPage/LandingPage";
import AddCustomer from "./Pages/Customer/AddCustomer";
import ViewCustomers from "./Pages/Customer/ViewCustomer";
import EditCustomer from "./Pages/Customer/EditCustomer";
import AddProduct from "./Pages/Product/AddProduct";
import ViewProducts from "./Pages/Product/ViewProducts";
import EditProduct from "./Pages/Product/EditProduct";
import AddInvoice from "./Pages/Invoice/AddInvoice";
import ViewInvoice from "./Pages/Invoice/Viewinvoices";
import CustomerReports from "./Pages/Reports/Customerreport ";
import SalesReports from "./Pages/Reports/Salesreport";
import ProductReports from "./Pages/Reports/Productreport";

function App() {
  return (
    <BrowserRouter>
      <Routes>
       <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/landingpage" element={<LandingPage  />} />
        <Route path="/addcustomer" element={<AddCustomer />} />
        <Route path="/viewcustomer" element={<ViewCustomers />} />
        <Route path="/editcustomer/:id" element={<EditCustomer />} />
        <Route path="/products/add" element={<AddProduct />} />
        <Route path="/products/view" element={<ViewProducts />} />
        <Route path="/editproducts/:id" element={<EditProduct />} />
        <Route path="/addinvoice" element={<AddInvoice />} />
        <Route path="/viewinvoices" element={<ViewInvoice />} />
        <Route path="/reports/sales" element={<SalesReports />} />
        <Route path="/reports/revenue" element={<CustomerReports />} />
        <Route path="/reports/product" element={<ProductReports />} />
        <Route path="*" element={<Navigate to="/" />} />
       {/* <Route
          path="/signup"
          element={
            <ProtectedRoute>
              <Signup/>
            </ProtectedRoute>
          }
        /> */}
       {/* <Route
          path="/landingpage"
          element={
            <ProtectedRoute>
              <LandingPage />
            </ProtectedRoute>
          }
        /> */}

       
      </Routes>
    </BrowserRouter>
  );
}

export default App;


