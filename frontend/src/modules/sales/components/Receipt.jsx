import React, { useState, useEffect } from "react";
import { API_URL } from "@/services/api";

const Receipt = ({
  sale,
  items = [],
  subtotal = 0,
  discount = 0,
  tax = 0,
  total = 0,
}) => {
  const [companyInfo, setCompanyInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const currentDate = new Date().toLocaleDateString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  // Fetch company information
  useEffect(() => {
    const fetchCompanyInfo = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_URL}/companies/current`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (data.success && data.data) {
          setCompanyInfo(data.data.company || data.data);
        }
      } catch (error) {
        console.error("Error fetching company info:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyInfo();
  }, []);

  const receiptData = {
    companyName: companyInfo?.name || "YOUR COMPANY NAME",
    address: companyInfo?.address || "123 Business Avenue, Victoria Island",
    phone: companyInfo?.phone || "+234 800 123 4567",
    date: currentDate,
    receiptNo: sale?.sale_number || "000001",
    items: items.map(item => ({
      name: item.name,
      qty: item.quantity,
      price: item.price
    }))
  };

  return (
    <>
      <style>{`
        @media print {
          @page {
            size: 80mm auto;
            margin: 0;
          }
          body {
            margin: 0;
            padding: 0;
          }
          * {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>
      <div style={styles.wrapper}>
      {/* Header */}
      <h2 style={styles.company}>{receiptData.companyName}</h2>
      <p style={styles.center}>{receiptData.address}</p>
      <p style={styles.center}>{receiptData.phone}</p>

      <div style={styles.infoSection}>
        <div>Date: {receiptData.date}</div>
        <div><strong>Receipt No.: {receiptData.receiptNo}</strong></div>
      </div>

      <hr style={styles.line} />

      {/* Items Header */}
      <div style={styles.itemHeader}>
        <span style={styles.headerItem}>ITEM NAME</span>
        <span style={styles.headerUnit}>UNIT</span>
        <span style={styles.headerPrice}>PRICE</span>
      </div>

      {/* Items */}
      {receiptData.items.map((item, i) => (
        <div key={i} style={styles.itemRow}>
          <span style={styles.itemName}>{item.name}</span>
          <span style={styles.itemUnit}>x{item.qty}</span>
          <span style={styles.itemPrice}>₦{(item.price * item.qty).toLocaleString()}</span>
        </div>
      ))}

      {/* Subtotal */}
      <div style={styles.subtotalBox}>
        <span>SUBTOTAL</span>
        <strong>₦{(total || subtotal).toLocaleString()}</strong>
      </div>

      <hr style={styles.line} />

      {/* Footer */}
      <div style={styles.footer}>
        <p>THANK YOU</p>
        <p>FOR YOUR PURCHASE</p>
      </div>

      <div style={styles.brand}>
        <div style={styles.brandCenter}>
          <img 
            src="/logo.png" 
            alt="Cloudspace" 
            style={styles.brandLogo}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'inline';
            }}
          />
          <span style={{display: 'none'}}>
            <strong>Cloudspace</strong> <small>ERP</small>
          </span>
        </div>
      </div>
    </div>
    </>
  );
};

const styles = {
  wrapper: {
    width: "80mm",
    minHeight: "auto",
    fontFamily: "Arial, sans-serif",
    fontSize: "13px",
    margin: "0",
    color: "#333",
    backgroundColor: "white",
    padding: "5mm 3mm"
  },
  company: {
    textAlign: "center",
    margin: "0",
    fontSize: "18px",
    fontWeight: "bold"
  },
  center: {
    textAlign: "center",
    margin: "3px 0",
    fontSize: "12px"
  },
  infoSection: {
    fontSize: "12px",
    marginTop: "10px",
    lineHeight: "1.5"
  },
  line: {
    border: "none",
    borderTop: "2px solid #6ca6b4",
    margin: "10px 0"
  },
  itemHeader: {
    display: "flex",
    fontWeight: "bold",
    fontSize: "12px",
    marginBottom: "10px",
    paddingBottom: "5px",
    borderBottom: "1px solid #ccc"
  },
  headerItem: {
    flex: 2
  },
  headerUnit: {
    flex: 1,
    textAlign: "center"
  },
  headerPrice: {
    flex: 1,
    textAlign: "right"
  },
  itemRow: {
    display: "flex",
    margin: "8px 0",
    fontSize: "12px"
  },
  itemName: {
    flex: 2
  },
  itemUnit: {
    flex: 1,
    textAlign: "center"
  },
  itemPrice: {
    flex: 1,
    textAlign: "right",
    fontWeight: "bold"
  },
  subtotalBox: {
    backgroundColor: "#3f6974",
    color: "#fff",
    padding: "12px",
    display: "flex",
    justifyContent: "space-between",
    fontSize: "16px",
    fontWeight: "bold",
    marginTop: "10px"
  },
  footer: {
    textAlign: "center",
    marginTop: "15px",
    fontWeight: "bold",
    fontSize: "14px"
  },
  brand: {
    marginTop: "25px"
  },
  brandCenter: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  brandLogo: {
    height: "30px",
    maxWidth: "120px",
    objectFit: "contain"
  }
};

export default Receipt;
