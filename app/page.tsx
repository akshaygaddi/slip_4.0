'use client';

// app/page.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, RefreshCcw, Building2, Calendar, DollarSign, Percent } from 'lucide-react';

interface FormData {
    mainHeading: string;
    totalPlay: string;
    oldBalance: string;
    selectedOption: string;
    ankValue: string;
    spValue: string;
    dpValue: string;
    jodiValue: string;
    totalPlaySelect: string;
    oldBalanceSelect: string;
    advanceMoneySelect: string;
    ankValueSelect: string;
    spValueSelect: string;
    dpValueSelect: string;
    jodiValueSelect: string;
    selectedDate: string;
    advanceMoney: string;
}

interface InputGroupProps {
    label: string;
    name: string;
    type: string;
    value: string;
    selectName?: string;
    selectValue?: string;
    selectOptions?: Array<{ value: string; label: string }>;
    icon?: any;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

const InputGroup = ({
                        label,
                        name,
                        type,
                        value,
                        selectName,
                        selectValue,
                        selectOptions,
                        icon: Icon,
                        onChange
                    }: InputGroupProps) => (
    <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center gap-2 mb-1">
                {Icon && <Icon className="w-4 h-4" />}
                {label}
            </div>
        </label>
        <div className="flex gap-2">
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
            />
            {selectOptions && (
                <select
                    name={selectName}
                    value={selectValue}
                    onChange={onChange}
                    className="rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                >
                    <option value="">Select</option>
                    {selectOptions.map(option => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            )}
        </div>
    </div>
);

export default function HomePage() {
    const router = useRouter();
    const [formData, setFormData] = useState<FormData>({
        mainHeading: '',
        totalPlay: '',
        oldBalance: '',
        selectedOption: '',
        ankValue: '',
        spValue: '',
        dpValue: '',
        jodiValue: '',
        totalPlaySelect: '',
        oldBalanceSelect: '',
        advanceMoneySelect: '',
        ankValueSelect: '',
        spValueSelect: '',
        dpValueSelect: '',
        jodiValueSelect: '',
        selectedDate: '',
        advanceMoney: ''
    });

    useEffect(() => {
        const savedFormData = localStorage.getItem('formData');
        if (savedFormData) {
            setFormData(JSON.parse(savedFormData));
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        localStorage.setItem('formData', JSON.stringify(formData));
        router.push('/result');
    };

    const handleReset = () => {
        localStorage.removeItem('formData');
        setFormData({
            mainHeading: '',
            totalPlay: '',
            oldBalance: '',
            selectedOption: '',
            ankValue: '',
            spValue: '',
            dpValue: '',
            jodiValue: '',
            totalPlaySelect: '',
            selectedDate: '',
            oldBalanceSelect: '',
            advanceMoneySelect: '',
            ankValueSelect: '',
            spValueSelect: '',
            dpValueSelect: '',
            jodiValueSelect: '',
            advanceMoney: ''
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="px-6 py-8">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-2xl font-bold text-gray-900">
                            Generate Slip
                        </h1>
                        <button
                            type="button"
                            onClick={handleReset}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <RefreshCcw className="w-4 h-4"/>
                            Reset
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <InputGroup
                            label="Company"
                            name="mainHeading"
                            type="text"
                            value={formData.mainHeading}
                            icon={Building2}
                            onChange={handleChange}
                        />

                        <InputGroup
                            label="Select Date"
                            name="selectedDate"
                            type="date"
                            value={formData.selectedDate}
                            icon={Calendar}
                            onChange={handleChange}
                        />

                        <InputGroup
                            label="Total Play"
                            name="totalPlay"
                            type="number"
                            value={formData.totalPlay}
                            selectName="totalPlaySelect"
                            selectValue={formData.totalPlaySelect}
                            selectOptions={[
                                {value: '0', label: '0%'},
                                {value: '5', label: '5%'},
                                {value: '4', label: '4%'},
                                {value: '8', label: '8%'},
                                {value: '10', label: '10%'}
                            ]}
                            icon={DollarSign}
                            onChange={handleChange}
                        />

                        <InputGroup
                            label="Old Balance"
                            name="oldBalance"
                            type="number"
                            value={formData.oldBalance}
                            selectName="oldBalanceSelect"
                            selectValue={formData.oldBalanceSelect}
                            selectOptions={[
                                {value: '1', label: 'Balance Plus'},
                                {value: '0', label: 'Balance Minus'}
                            ]}
                            icon={DollarSign}
                            onChange={handleChange}
                        />

                        <InputGroup
                            label="Advance Money"
                            name="advanceMoney"
                            type="number"
                            value={formData.advanceMoney}
                            selectName="advanceMoneySelect"
                            selectValue={formData.advanceMoneySelect}
                            selectOptions={[
                                {value: '1', label: 'Advance Plus'},
                                {value: '0', label: 'Advance Minus'}
                            ]}
                            icon={DollarSign}
                            onChange={handleChange}
                        />

                        <div className="border-t border-gray-200 my-8"></div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputGroup
                                label="Ank"
                                name="ankValue"
                                type="number"
                                value={formData.ankValue}
                                selectName="ankValueSelect"
                                selectValue={formData.ankValueSelect}
                                selectOptions={[
                                    {value: '9', label: '9%'},
                                    {value: '9.5', label: '9.5%'}
                                ]}
                                icon={Percent}
                                onChange={handleChange}
                            />

                            <InputGroup
                                label="SP"
                                name="spValue"
                                type="number"
                                value={formData.spValue}
                                selectName="spValueSelect"
                                selectValue={formData.spValueSelect}
                                selectOptions={[
                                    {value: '140', label: '140'},
                                    {value: '150', label: '150'}
                                ]}
                                onChange={handleChange}
                            />

                            <InputGroup
                                label="DP"
                                name="dpValue"
                                type="number"
                                value={formData.dpValue}
                                selectName="dpValueSelect"
                                selectValue={formData.dpValueSelect}
                                selectOptions={[
                                    {value: '280', label: '280'},
                                    {value: '300', label: '300'}
                                ]}
                                onChange={handleChange}
                            />

                            <InputGroup
                                label="Jodi"
                                name="jodiValue"
                                type="number"
                                value={formData.jodiValue}
                                selectName="jodiValueSelect"
                                selectValue={formData.jodiValueSelect}
                                selectOptions={[
                                    {value: '90', label: '90'},
                                    {value: '95', label: '95'}
                                ]}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="flex justify-end mt-8">
                            <button
                                type="submit"
                                className="flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                            >
                                <Save className="w-4 h-4"/>
                                Generate Slip
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}