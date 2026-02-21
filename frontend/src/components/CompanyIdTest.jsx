import React, { useEffect, useState } from 'react';

const CompanyIdTest = () => {
  const [companyId, setCompanyId] = useState(null);

  useEffect(() => {
    const id = localStorage.getItem('company_id');
    setCompanyId(id);
    console.log('Company ID from localStorage:', id);
  }, []);

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: 'yellow', 
      padding: '10px',
      border: '1px solid black',
      zIndex: 9999
    }}>
      <strong>Company ID:</strong> {companyId || 'null'}
    </div>
  );
};

export default CompanyIdTest;
