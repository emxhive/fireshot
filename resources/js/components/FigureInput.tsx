import { formatNumberInput, parseNumberInput } from '@/lib/utils';
import { TextInput, TextInputProps } from '@tremor/react';
import React, { useState } from 'react';

type FigureInputProps = Omit<TextInputProps, 'value' | 'onChange'> & {
    name: string;
    formChange: (name: any, value: any) => void;
    initialValue?: number | null;
};

export function FigureInput({ name, formChange, initialValue = null, ...props }: FigureInputProps) {
    const [raw, setRaw] = useState<number | null>(initialValue);
    const [text, setText] = useState(initialValue !== null ? formatNumberInput(initialValue) : '');

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const val = e.target.value;
        setText(val);

        const parsed = parseNumberInput(val);
        const clean = isNaN(parsed) ? null : parsed;

        setRaw(clean);
        formChange(name, clean ?? 0);
    }

    function handleBlur() {
        if (raw === null) {
            setText('');
            return;
        }
        setText(formatNumberInput(raw));
    }

    return <TextInput {...props} name={name} value={text} onChange={handleChange} onBlur={handleBlur} />;
}
