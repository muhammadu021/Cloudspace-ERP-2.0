/**
 * Frontend Helper for Account Creation
 * 
 * This utility helps ensure accounts are created with correct normal balances
 * according to accounting principles.
 */

/**
 * Get the correct normal balance for an account type
 * @param {string} accountType - The type of account (asset, liability, equity, revenue, expense)
 * @returns {string} The normal balance ('debit' or 'credit')
 */
export const getNormalBalance = (accountType) => {
  const debitAccounts = ['asset', 'expense'];
  const creditAccounts = ['liability', 'equity', 'revenue'];
  
  if (debitAccounts.includes(accountType)) {
    return 'debit';
  } else if (creditAccounts.includes(accountType)) {
    return 'credit';
  }
  
  throw new Error(`Unknown account type: ${accountType}`);
};

/**
 * Validate account data before sending to API
 * @param {Object} accountData - The account data to validate
 * @returns {Object} Validation result { valid: boolean, errors: string[] }
 */
export const validateAccountData = (accountData) => {
  const errors = [];
  
  // Required fields
  if (!accountData.code) {
    errors.push('Account code is required');
  }
  
  if (!accountData.name) {
    errors.push('Account name is required');
  }
  
  if (!accountData.type) {
    errors.push('Account type is required');
  }
  
  // Validate account type
  const validTypes = ['asset', 'liability', 'equity', 'revenue', 'expense'];
  if (accountData.type && !validTypes.includes(accountData.type)) {
    errors.push(`Invalid account type. Must be one of: ${validTypes.join(', ')}`);
  }
  
  // Validate normal balance if provided
  if (accountData.normal_balance && accountData.type) {
    const correctNormalBalance = getNormalBalance(accountData.type);
    if (accountData.normal_balance !== correctNormalBalance) {
      errors.push(
        `Invalid normal balance for ${accountData.type} account. ` +
        `${accountData.type.charAt(0).toUpperCase() + accountData.type.slice(1)} ` +
        `accounts must have a ${correctNormalBalance} normal balance.`
      );
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Prepare account data for API submission
 * Removes normal_balance field to let backend auto-set it
 * @param {Object} accountData - The account data from form
 * @returns {Object} Cleaned account data ready for API
 */
export const prepareAccountData = (accountData) => {
  const { normal_balance, ...cleanData } = accountData;
  
  // Remove empty or null values
  Object.keys(cleanData).forEach(key => {
    if (cleanData[key] === '' || cleanData[key] === null || cleanData[key] === undefined) {
      delete cleanData[key];
    }
  });
  
  return cleanData;
};

/**
 * Create account via API
 * @param {Object} accountData - The account data
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} API response
 */
export const createAccount = async (accountData, token) => {
  // Validate data first
  const validation = validateAccountData(accountData);
  if (!validation.valid) {
    throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
  }
  
  // Prepare data (removes normal_balance)
  const cleanData = prepareAccountData(accountData);
  
  const response = await fetch('/api/v1/finance/accounts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(cleanData)
  });
  
  const result = await response.json();
  
  if (!response.ok) {
    throw new Error(result.message || 'Failed to create account');
  }
  
  return result;
};

/**
 * Get account type information
 * @param {string} accountType - The account type
 * @returns {Object} Account type information
 */
export const getAccountTypeInfo = (accountType) => {
  const accountTypes = {
    asset: {
      label: 'Asset',
      normalBalance: 'debit',
      description: 'Resources owned by the company',
      examples: ['Cash', 'Accounts Receivable', 'Inventory', 'Equipment'],
      increasesWith: 'debit',
      decreasesWith: 'credit'
    },
    liability: {
      label: 'Liability',
      normalBalance: 'credit',
      description: 'Obligations owed to others',
      examples: ['Accounts Payable', 'Loans Payable', 'Accrued Expenses'],
      increasesWith: 'credit',
      decreasesWith: 'debit'
    },
    equity: {
      label: 'Equity',
      normalBalance: 'credit',
      description: 'Owner\'s stake in the company',
      examples: ['Owner\'s Capital', 'Retained Earnings', 'Common Stock'],
      increasesWith: 'credit',
      decreasesWith: 'debit'
    },
    revenue: {
      label: 'Revenue',
      normalBalance: 'credit',
      description: 'Income earned from business activities',
      examples: ['Sales Revenue', 'Service Revenue', 'Interest Income'],
      increasesWith: 'credit',
      decreasesWith: 'debit'
    },
    expense: {
      label: 'Expense',
      normalBalance: 'debit',
      description: 'Costs incurred in business operations',
      examples: ['Salaries', 'Rent', 'Utilities', 'Office Supplies'],
      increasesWith: 'debit',
      decreasesWith: 'credit'
    }
  };
  
  return accountTypes[accountType] || null;
};

/**
 * Format account code (ensure proper format)
 * @param {string} code - The account code
 * @returns {string} Formatted account code
 */
export const formatAccountCode = (code) => {
  // Remove any non-alphanumeric characters except hyphens
  return code.replace(/[^a-zA-Z0-9-]/g, '').toUpperCase();
};

// React Hook Example
/**
 * Custom React hook for account form
 * @returns {Object} Form state and handlers
 */
export const useAccountForm = (initialData = {}) => {
  const [formData, setFormData] = React.useState({
    code: '',
    name: '',
    type: 'asset',
    currency: 'USD',
    description: '',
    ...initialData
  });
  
  const [errors, setErrors] = React.useState([]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors when user makes changes
    setErrors([]);
  };
  
  const handleTypeChange = (e) => {
    const type = e.target.value;
    setFormData(prev => ({
      ...prev,
      type: type
    }));
    setErrors([]);
  };
  
  const validate = () => {
    const validation = validateAccountData(formData);
    setErrors(validation.errors);
    return validation.valid;
  };
  
  const getNormalBalanceForCurrentType = () => {
    return getNormalBalance(formData.type);
  };
  
  const getTypeInfo = () => {
    return getAccountTypeInfo(formData.type);
  };
  
  return {
    formData,
    errors,
    handleChange,
    handleTypeChange,
    validate,
    getNormalBalanceForCurrentType,
    getTypeInfo,
    setFormData,
    setErrors
  };
};

// Vue.js Composable Example
/**
 * Vue composable for account form
 * @returns {Object} Form state and methods
 */
export const useAccountFormVue = (initialData = {}) => {
  const formData = Vue.ref({
    code: '',
    name: '',
    type: 'asset',
    currency: 'USD',
    description: '',
    ...initialData
  });
  
  const errors = Vue.ref([]);
  
  const normalBalance = Vue.computed(() => {
    return getNormalBalance(formData.value.type);
  });
  
  const typeInfo = Vue.computed(() => {
    return getAccountTypeInfo(formData.value.type);
  });
  
  const validate = () => {
    const validation = validateAccountData(formData.value);
    errors.value = validation.errors;
    return validation.valid;
  };
  
  return {
    formData,
    errors,
    normalBalance,
    typeInfo,
    validate
  };
};

// Export all utilities
export default {
  getNormalBalance,
  validateAccountData,
  prepareAccountData,
  createAccount,
  getAccountTypeInfo,
  formatAccountCode,
  useAccountForm,
  useAccountFormVue
};
