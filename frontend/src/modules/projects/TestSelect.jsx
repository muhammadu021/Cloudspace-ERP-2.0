import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/Dropdown';

const TestSelectComponent = () => {
  const [selectedValue, setSelectedValue] = useState('');
  
  const testOptions = [
    { value: '1', label: 'Option 1' },
    { value: '2', label: 'Option 2' },
    { value: '3', label: 'Option 3' }
  ];

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Test Select Component</h2>
      <div className="max-w-xs">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Test Select
        </label>
        <Select
          value={selectedValue}
          onValueChange={(value) => setSelectedValue(value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Select an option</SelectItem>
            {testOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="mt-2 text-sm text-gray-600">
          Selected value: {selectedValue || 'None'}
        </p>
      </div>
    </div>
  );
};

export default TestSelectComponent;