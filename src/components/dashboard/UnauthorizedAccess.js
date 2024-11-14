import React from 'react';

const UnauthorizedAccess = () => {
  return (
    <div p={3} className="container-fluid col-md-12" style={{ marginLeft: '5px', marginTop: '80px' }}>
      <h1>Access Denied</h1>
      <p>You do not have permission to access this dashboard. Please contact the administrator.</p>
    </div>
  );
};

export default UnauthorizedAccess;
