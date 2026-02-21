import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const [companies, setCompanies] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if the user is a super admin
    const isSuperAdmin = localStorage.getItem("isSuperAdmin");
    if (!isSuperAdmin) {
      navigate("/login");
    }

    // Fetch companies from local storage
    const demoCompanies = JSON.parse(localStorage.getItem("demoCompanies")) || [];
    setCompanies(demoCompanies);
  }, [navigate]);

  const approveCompany = (id) => {
    const updatedCompanies = companies.map((company) => {
      if (company.id === id) {
        return { ...company, status: "Approved" };
      }
      return company;
    });

    setCompanies(updatedCompanies);
    localStorage.setItem("demoCompanies", JSON.stringify(updatedCompanies));
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <table className="table-auto w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300 px-4 py-2">Company Name</th>
            <th className="border border-gray-300 px-4 py-2">Status</th>
            <th className="border border-gray-300 px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {companies.map((company) => (
            <tr key={company.id}>
              <td className="border border-gray-300 px-4 py-2">{company.company_name}</td>
              <td className="border border-gray-300 px-4 py-2">{company.status}</td>
              <td className="border border-gray-300 px-4 py-2">
                {company.status === "Pending Approval" && (
                  <button
                    onClick={() => approveCompany(company.id)}
                    className="bg-primary-500 text-white px-4 py-2 rounded"
                  >
                    Approve
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminDashboard;