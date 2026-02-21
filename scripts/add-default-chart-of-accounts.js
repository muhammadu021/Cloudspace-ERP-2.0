const { Company, Account } = require('../backend/models');

const defaultChartOfAccounts = [
  // ASSETS
  { code: '1000', name: 'Assets', type: 'asset', normal_balance: 'debit', parent_account_id: null },
  { code: '1100', name: 'Current Assets', type: 'asset', normal_balance: 'debit', parent_code: '1000' },
  { code: '1110', name: 'Cash and Cash Equivalents', type: 'asset', normal_balance: 'debit', parent_code: '1100', bank_account: true },
  { code: '1120', name: 'Accounts Receivable', type: 'asset', normal_balance: 'debit', parent_code: '1100' },
  { code: '1130', name: 'Inventory', type: 'asset', normal_balance: 'debit', parent_code: '1100' },
  { code: '1140', name: 'Prepaid Expenses', type: 'asset', normal_balance: 'debit', parent_code: '1100' },
  { code: '1200', name: 'Fixed Assets', type: 'asset', normal_balance: 'debit', parent_code: '1000' },
  { code: '1210', name: 'Property, Plant & Equipment', type: 'asset', normal_balance: 'debit', parent_code: '1200' },
  { code: '1220', name: 'Accumulated Depreciation', type: 'asset', normal_balance: 'credit', parent_code: '1200' },

  // LIABILITIES
  { code: '2000', name: 'Liabilities', type: 'liability', normal_balance: 'credit', parent_account_id: null },
  { code: '2100', name: 'Current Liabilities', type: 'liability', normal_balance: 'credit', parent_code: '2000' },
  { code: '2110', name: 'Accounts Payable', type: 'liability', normal_balance: 'credit', parent_code: '2100' },
  { code: '2120', name: 'Accrued Expenses', type: 'liability', normal_balance: 'credit', parent_code: '2100' },
  { code: '2130', name: 'Payroll Liabilities', type: 'liability', normal_balance: 'credit', parent_code: '2100' },
  { code: '2140', name: 'Tax Payable', type: 'liability', normal_balance: 'credit', parent_code: '2100', tax_account: true },
  { code: '2200', name: 'Long-term Liabilities', type: 'liability', normal_balance: 'credit', parent_code: '2000' },
  { code: '2210', name: 'Long-term Debt', type: 'liability', normal_balance: 'credit', parent_code: '2200' },

  // EQUITY
  { code: '3000', name: 'Equity', type: 'equity', normal_balance: 'credit', parent_account_id: null },
  { code: '3100', name: 'Share Capital', type: 'equity', normal_balance: 'credit', parent_code: '3000' },
  { code: '3200', name: 'Retained Earnings', type: 'equity', normal_balance: 'credit', parent_code: '3000' },
  { code: '3300', name: 'Current Year Earnings', type: 'equity', normal_balance: 'credit', parent_code: '3000' },

  // REVENUE
  { code: '4000', name: 'Revenue', type: 'revenue', normal_balance: 'credit', parent_account_id: null },
  { code: '4100', name: 'Sales Revenue', type: 'revenue', normal_balance: 'credit', parent_code: '4000' },
  { code: '4200', name: 'Service Revenue', type: 'revenue', normal_balance: 'credit', parent_code: '4000' },
  { code: '4300', name: 'Other Income', type: 'revenue', normal_balance: 'credit', parent_code: '4000' },

  // EXPENSES
  { code: '5000', name: 'Expenses', type: 'expense', normal_balance: 'debit', parent_account_id: null },
  { code: '5100', name: 'Cost of Goods Sold', type: 'expense', normal_balance: 'debit', parent_code: '5000' },
  { code: '5200', name: 'Operating Expenses', type: 'expense', normal_balance: 'debit', parent_code: '5000' },
  { code: '5210', name: 'Salaries and Wages', type: 'expense', normal_balance: 'debit', parent_code: '5200' },
  { code: '5220', name: 'Rent Expense', type: 'expense', normal_balance: 'debit', parent_code: '5200' },
  { code: '5230', name: 'Utilities Expense', type: 'expense', normal_balance: 'debit', parent_code: '5200' },
  { code: '5240', name: 'Office Supplies', type: 'expense', normal_balance: 'debit', parent_code: '5200' },
  { code: '5250', name: 'Travel and Entertainment', type: 'expense', normal_balance: 'debit', parent_code: '5200' },
  { code: '5260', name: 'Professional Fees', type: 'expense', normal_balance: 'debit', parent_code: '5200' },
  { code: '5270', name: 'Marketing and Advertising', type: 'expense', normal_balance: 'debit', parent_code: '5200' },
  { code: '5280', name: 'Insurance Expense', type: 'expense', normal_balance: 'debit', parent_code: '5200' },
  { code: '5290', name: 'Depreciation Expense', type: 'expense', normal_balance: 'debit', parent_code: '5200' },
  { code: '5300', name: 'Other Expenses', type: 'expense', normal_balance: 'debit', parent_code: '5000' },
];

async function addDefaultChartOfAccounts() {
  try {
    console.log('Starting to add default chart of accounts to all companies...\n');

    // Get all companies
    const companies = await Company.findAll({
      where: { is_active: true },
      attributes: ['id', 'name']
    });

    console.log(`Found ${companies.length} active companies\n`);

    for (const company of companies) {
      console.log(`Processing company: ${company.name} (ID: ${company.id})`);

      // Check if company already has accounts
      const existingAccounts = await Account.count({
        where: { company_id: company.id }
      });

      if (existingAccounts > 0) {
        console.log(`  ⚠️  Company already has ${existingAccounts} accounts. Skipping...\n`);
        continue;
      }

      // Create accounts in two passes (first parents, then children)
      const accountMap = {};

      // First pass: Create parent accounts (no parent_code)
      for (const account of defaultChartOfAccounts) {
        if (!account.parent_code) {
          const created = await Account.create({
            company_id: company.id,
            code: account.code,
            name: account.name,
            type: account.type,
            normal_balance: account.normal_balance,
            parent_account_id: account.parent_account_id,
            currency: 'USD',
            bank_account: account.bank_account || false,
            tax_account: account.tax_account || false,
            is_active: true,
            current_balance: 0
          });
          accountMap[account.code] = created.id;
        }
      }

      // Second pass: Create child accounts (with parent_code)
      for (const account of defaultChartOfAccounts) {
        if (account.parent_code) {
          const parentId = accountMap[account.parent_code];
          const created = await Account.create({
            company_id: company.id,
            code: account.code,
            name: account.name,
            type: account.type,
            normal_balance: account.normal_balance,
            parent_account_id: parentId,
            currency: 'USD',
            bank_account: account.bank_account || false,
            tax_account: account.tax_account || false,
            is_active: true,
            current_balance: 0
          });
          accountMap[account.code] = created.id;
        }
      }

      console.log(`  ✅ Created ${defaultChartOfAccounts.length} accounts\n`);
    }

    console.log('✅ Completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run the script
addDefaultChartOfAccounts();
