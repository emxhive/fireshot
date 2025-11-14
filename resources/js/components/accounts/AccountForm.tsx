import { formatNumberInput, parseNumberInput } from '@/lib/utils';
import { NumberInput, Select, SelectItem, TextInput } from '@tremor/react';
import React, { useState } from 'react';

interface Props {
    data: Partial<Account> | null;
    onChange: (key: keyof Account, value: any) => void;
}

const AccountForm: React.FC<Props> = ({ data, onChange }) => {
    const [displayValue, setDisplayValue] = useState('');

    return (
        <div className="space-y-6">
            <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Account Name</label>
                <TextInput placeholder="Account Name" value={data?.name || ''} onChange={(e) => onChange('name', e.target.value)} className="mt-2" />
            </div>

            <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Currency</label>
                <Select value={data?.currency || ''} onValueChange={(val) => onChange('currency', val)} className="mt-2">
                    <SelectItem value="NGN">NGN</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">% Fee</label>
                    <NumberInput placeholder="Fee" value={data?.fee ?? 0} onValueChange={(val) => onChange('fee', Number(val ?? 0))} className="mt-2" />
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Balance</label>
                    <TextInput
                        placeholder="Balance"
                        value={displayValue}
                        onChange={(e) => {
                            const val = e.target.value;

                            // Parse the numeric value for internal state/backend
                            const parsed = parseNumberInput(val);
                            onChange('balance', isNaN(parsed) ? 0 : parsed);

                            // Format for visible display
                            setDisplayValue(formatNumberInput(parsed));
                        }}
                        className="mt-2"
                    />
                </div>
            </div>
        </div>
    );
};

export default AccountForm;
// <NumberInput placeholder="Balance" value={data?.balance ?? 0} onValueChange={(val) => onChange('balance', Number(val ?? 0))} className="mt-2" />;
