'use client'

import React, { useEffect, useState, useRef } from 'react';
import { Share2, Calendar, ArrowDown, ArrowUp, TrendingUp, Wallet, ChevronDown, Clock, Users } from 'lucide-react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import html2canvas from "html2canvas";

export default function ResultPage() {
    const resultRef = useRef(null);
    const [formData, setFormData] = useState(null);
    const [finalDisplayResult, setFinalDisplayResult] = useState('');
    const [isSharing, setIsSharing] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const savedFormData = localStorage.getItem('formData');
        if (savedFormData) {
            setFormData(JSON.parse(savedFormData));
        }

        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleShare = async () => {
        if (!resultRef.current || isSharing) return;

        try {
            setIsSharing(true);

            // Store original styles
            const originalStyles = new Map();

            // Hide fixed elements during capture
            const fixedElements = document.querySelectorAll('.fixed, .sticky');
            fixedElements.forEach(element => {
                if (element instanceof HTMLElement) {
                    originalStyles.set(element, element.style.cssText);
                    element.style.position = 'absolute';
                    if (element.classList.contains('bottom-0')) {
                        element.style.display = 'none';
                    }
                }
            });

            // Handle gradient backgrounds
            const gradientElements = resultRef.current.querySelectorAll('.bg-gradient-to-r, [class*="from-"]');
            gradientElements.forEach(element => {
                if (element instanceof HTMLElement) {
                    originalStyles.set(element, element.style.cssText);
                    if (element.classList.contains('from-blue-600')) {
                        element.style.cssText = `
                        ${element.style.cssText}
                        background-image: linear-gradient(to right, rgb(37, 99, 235), rgb(147, 51, 234)) !important;
                    `;
                    }
                    if (element.classList.contains('bg-clip-text')) {
                        element.style.webkitBackgroundClip = 'text';
                        element.style.backgroundClip = 'text';
                        element.style.color = 'transparent';
                    }
                }
            });

            // Ensure result display is visible
            if (finalDisplayResult) {
                const resultDisplay = resultRef.current.querySelector('[data-result-display]');
                if (resultDisplay instanceof HTMLElement) {
                    originalStyles.set(resultDisplay, resultDisplay.style.cssText);
                    resultDisplay.style.cssText = `
                    display: block !important;
                    visibility: visible !important;
                    opacity: 1 !important;
                `;
                }
            }

            // Scroll to top and wait for animations
            window.scrollTo(0, 0);
            await new Promise(resolve => setTimeout(resolve, 500));

            // Capture the image
            const canvas = await html2canvas(resultRef.current, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                scrollY: -window.scrollY,
                windowWidth: resultRef.current.scrollWidth,
                windowHeight: resultRef.current.scrollHeight,
                foreignObjectRendering: true,
                onclone: (clonedDoc) => {
                    const clonedGradients = clonedDoc.querySelectorAll('.bg-gradient-to-r, [class*="from-"]');
                    clonedGradients.forEach(element => {
                        if (element instanceof HTMLElement) {
                            if (element.classList.contains('from-blue-600')) {
                                element.style.backgroundImage = 'linear-gradient(to right, rgb(37, 99, 235), rgb(147, 51, 234))';
                            }
                        }
                    });
                }
            });

            // Convert to blob and share/download
            const blob = await new Promise<Blob>((resolve, reject) => {
                canvas.toBlob((blob) => {
                    if (blob) resolve(blob);
                    else reject(new Error('Canvas to Blob conversion failed'));
                }, 'image/png', 1.0);
            });

            const file = new File([blob], 'game-result.png', { type: 'image/png' });

            if (navigator.share) {
                await navigator.share({
                    files: [file],
                    title: `${formData?.mainHeading || 'Game'} Result`,
                });
            } else {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'game-result.png';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }
        } catch (error) {
            console.error('Error sharing:', error);
            alert('Failed to share. Please try again.');
        } finally {
            // Restore all original styles
            originalStyles.forEach((style, element) => {
                if (element instanceof HTMLElement) {
                    element.style.cssText = style || '';
                }
            });
            setIsSharing(false);
        }
    };

    // Calculations
    const ankTotal = Number(formData?.ankValue || 0) * Number(formData?.ankValueSelect || 0);
    const spTotal = Number(formData?.spValue || 0) * Number(formData?.spValueSelect || 0);
    const dpTotal = Number(formData?.dpValue || 0) * Number(formData?.dpValueSelect || 0);
    const jodiTotal = Number(formData?.jodiValue || 0) * Number(formData?.jodiValueSelect || 0);

    const grandTotalWining = ankTotal + spTotal + dpTotal + jodiTotal;
    const totalPlayValue = Number(formData?.totalPlay || 0);
    const totalPlayPercent = Math.floor(totalPlayValue * (Number(formData?.totalPlaySelect || 0) / 100));
    const balance = totalPlayValue - totalPlayPercent;
    const bal_win = balance > grandTotalWining ? balance - grandTotalWining : grandTotalWining - balance;

    let totalCalc = formData?.oldBalanceSelect === "0"
        ? bal_win - Number(formData?.oldBalance || 0)
        : bal_win + Number(formData?.oldBalance || 0);

    const afterAdvanceTotal = formData?.advanceMoneySelect === "0"
        ? totalCalc + Number(formData?.advanceMoney || 0)
        : totalCalc - Number(formData?.advanceMoney || 0);

    const selectedDate = formData?.selectedDate ? new Date(formData.selectedDate).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric',
    }) : '';

    const dayOfWeek = formData?.selectedDate ? new Date(formData.selectedDate).toLocaleDateString('en-GB', {
        weekday: 'long',
    }) : '';

    // ... Keep existing state management and calculations ...

    if (!formData) return (
        <div className="min-h-screen grid place-items-center bg-gray-50">
            <div className="animate-pulse flex flex-col items-center gap-3">
                <div className="h-8 w-32 bg-gray-200 rounded-full"/>
                <div className="h-4 w-24 bg-gray-100 rounded-full"/>
                <div className="mt-4 grid grid-cols-2 gap-3">
                    {[1,2,3,4].map(i => (
                        <div key={i} className="h-24 w-36 bg-gray-100 rounded-xl"/>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <div ref={resultRef}>
                {/* Enhanced Header Section */}
                <div className="bg-white relative">
                    {/* Top Navigation Bar */}
                    <div className="flex items-center justify-between px-4 py-3 border-b">
                        <div className="flex items-center gap-2">
                            <div
                                className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                                <span className="text-white font-bold">SB</span>
                            </div>
                            <div>
                                <h2 className="text-sm font-medium text-gray-900">Suresh Bhai</h2>
                                <p className="text-xs text-gray-500">{dayOfWeek}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleShare}
                            disabled={isSharing}
                            className="p-2 rounded-full bg-gray-50 text-gray-600 hover:bg-gray-100"
                        >
                            <Share2 className="w-4 h-4"/>
                        </button>
                    </div>

                    {/* Game Details Grid */}
                    <div className="p-3 mt-2">
                        <Card className="bg-white shadow-sm border-0">
                            <CardContent className="p-3">
                                <h3 className="text-sm font-medium text-gray-700 mb-2">Game Details</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        {
                                            label: 'Ank',
                                            value: formData?.ankValue,
                                            total: ankTotal,
                                            percent: `${formData?.ankValueSelect}%`,
                                            color: 'bg-blue-500'
                                        },
                                        {
                                            label: 'SP',
                                            value: formData?.spValue,
                                            total: spTotal,
                                            percent: formData?.spValueSelect,
                                            color: 'bg-purple-500'
                                        },
                                        {
                                            label: 'DP',
                                            value: formData?.dpValue,
                                            total: dpTotal,
                                            percent: formData?.dpValueSelect,
                                            color: 'bg-indigo-500'
                                        },
                                        {
                                            label: 'Jodi',
                                            value: formData?.jodiValue,
                                            total: jodiTotal,
                                            percent: formData?.jodiValueSelect,
                                            color: 'bg-pink-500'
                                        }
                                    ].map((item) => (
                                        <div key={item.label} className="bg-gray-50 rounded-lg overflow-hidden">
                                            <div className={`${item.color} px-2 py-1`}>
                                                <div className="flex justify-between">
                                                    <span className="text-xs text-white">{item.label}</span>
                                                    <span className="text-xs text-white/90">{item.percent}</span>
                                                </div>
                                            </div>
                                            <div className="p-2">
                                                <div className="text-sm font-medium">₹{item.total}</div>
                                                <div className="text-xs text-gray-500 mt-0.5">
                                                    Value: {item.value}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>


                    </div>

                    <div className="h-1 bg-gradient-to-r from-blue-500 to-purple-500"/>

                    {/* Main Header Content */}
                    <div className="px-4 py-4">
                        <div className="flex flex-col">
                            <div className="flex items-center justify-between mb-3">
                                <h1 className="text-xl font-bold text-gray-900">{formData?.mainHeading}</h1>
                                <div
                                    className="flex items-center gap-1.5 text-xs bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full">
                                    <Calendar className="w-3 h-3"/>
                                    <span>{selectedDate}</span>
                                </div>
                            </div>

                            {/* Stats Overview */}
                            <div className="grid grid-cols-3 gap-2 mt-2">
                                <div className="bg-gray-50 rounded-lg p-2">
                                    <div className="text-xs text-gray-500 mb-1">Total Play</div>
                                    <div className="text-sm font-semibold">₹{totalPlayValue || '0'}</div>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-2">
                                    <div className="text-xs text-gray-500 mb-1">Winning</div>
                                    <div className="text-sm font-semibold">₹{grandTotalWining || '0'}</div>
                                </div>
                                <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg p-2 text-white">
                                    <div className="text-xs opacity-90 mb-1">Balance</div>
                                    <div className="text-sm font-semibold">₹{afterAdvanceTotal || '0'}</div>
                                </div>
                            </div>

                            {/* Tags/Status */}
                            <div className="flex gap-2 mt-3">
                                <span className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded-full">
                                    Commission: {formData?.totalPlaySelect}%
                                </span>
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                    afterAdvanceTotal > 0
                                        ? 'bg-green-50 text-green-600'
                                        : 'bg-red-50 text-red-600'
                                }`}>
                                    {afterAdvanceTotal > 0 ? 'Profit' : 'Loss'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Progress Indicator */}
                    <div className="h-1 bg-gradient-to-r from-blue-500 to-purple-500"/>
                </div>


                {/* Compact Result Display */}
                {finalDisplayResult && (
                    <div className="px-3 py-3" data-result-display>
                        <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-600 to-purple-600">
                            <CardContent className="p-4">
                                <div className="text-center text-xl font-bold text-white">
                                    {finalDisplayResult}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Balance Information */}
                <div className="px-3 py-2">
                    <Card className="shadow-sm border-0">
                        <CardContent className="p-3">
                            <h3 className="text-sm font-medium text-gray-700 mb-2">Balance Information</h3>
                            <div className="space-y-2">
                                {[
                                    {
                                        label: 'Total Play',
                                        value: totalPlayValue,
                                        extra: `${formData?.totalPlaySelect}%`,
                                        icon: <TrendingUp className="w-4 h-4 text-blue-500"/>
                                    },
                                    {
                                        label: 'Old Balance',
                                        value: formData?.oldBalance,
                                        extra: formData?.oldBalanceSelect === '1' ? 'Plus' : 'Minus',
                                        icon: <Clock className="w-4 h-4 text-purple-500"/>
                                    },
                                    {
                                        label: 'Advance Money',
                                        value: formData?.advanceMoney,
                                        extra: formData?.advanceMoneySelect === '1' ? 'Plus' : 'Minus',
                                        icon: <Wallet className="w-4 h-4 text-indigo-500"/>
                                    }
                                ].map((item, idx) => (
                                    <div key={idx}
                                         className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            {item.icon}
                                            <span className="text-sm">{item.label}</span>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-medium">₹{item.value || '0'}</div>
                                            <div className="text-xs text-gray-500">{item.extra}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Final Balance */}
                <div className="px-3 pb-20">
                    <Card className="shadow-sm border-0">
                        <CardContent className="p-3">
                            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-white">Final Balance</span>
                                    <span className="text-lg font-bold text-white">
                                        ₹{afterAdvanceTotal || '0'}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Compact Fixed Header */}
            <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-b z-20">
                <div className="px-3 py-2 flex justify-between items-center">
                    <h1 className="text-base font-medium">Game Result</h1>
                    <button
                        onClick={handleShare}
                        disabled={isSharing}
                        className="p-1.5 rounded-full bg-blue-50 text-blue-600"
                    >
                        <Share2 className="w-4 h-4"/>
                    </button>
                </div>
            </header>

            {/* Compact Bottom Select Menu */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-3 z-20">
                <select
                    className="w-full p-2.5 rounded-lg border text-sm bg-white appearance-none pr-8"
                    onChange={(e) => {
                        const value = e.target.value;
                        if (value === "1") setFinalDisplayResult("मी देणे 🟢");
                        else if (value === "0") setFinalDisplayResult("तुम्ही देणे 🔴");
                        else if (value === "3") setFinalDisplayResult("Mai Dena 🟢");
                        else if (value === "4") setFinalDisplayResult("Aap Dena 🔴");
                    }}
                >
                    <option value="none">Select Result Status</option>
                    <option value="3">Mai Dena 🟢</option>
                    <option value="1">मी देणे 🟢</option>
                    <option value="0">तुम्ही देणे 🔴</option>
                    <option value="4">Aap Dena 🔴</option>
                </select>
                <ChevronDown
                    className="w-4 h-4 text-gray-400 absolute right-6 top-1/2 transform -translate-y-1/2 pointer-events-none"/>
            </div>
        </div>
    );
}