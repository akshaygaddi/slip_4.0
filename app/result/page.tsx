'use client'


import React, { useEffect, useState, useRef } from 'react';
import { Share2, Calendar, TrendingUp, Wallet, ChevronDown, Clock, Loader2 } from 'lucide-react';
import {
    Card,
    CardContent,
} from "@/components/ui/card";
import html2canvas from "html2canvas";

export default function ResultPage() {
    const resultRef = useRef(null);
    const [formData, setFormData] = useState(null);
    const [finalDisplayResult, setFinalDisplayResult] = useState('');
    const [isSharing, setIsSharing] = useState(false);
    const [shareProgress, setShareProgress] = useState('');

    useEffect(() => {
        const savedFormData = localStorage.getItem('formData');
        if (savedFormData) {
            setFormData(JSON.parse(savedFormData));
        }
    }, []);

    const optimizeForScreenshot = async () => {
        if (!resultRef.current) return;

        // Store original styles
        const elements = new Map();

        // Handle all elements that need style modifications
        resultRef.current.querySelectorAll('*').forEach(element => {
            if (element instanceof HTMLElement) {
                elements.set(element, {
                    originalStyle: element.style.cssText,
                    originalClasses: [...element.classList]
                });

                // Ensure gradients are properly rendered
                if (element.classList.contains('bg-gradient-to-r')) {
                    element.style.backgroundImage = getComputedStyle(element).backgroundImage;
                }

                // Fix any fixed/sticky positioning
                if (getComputedStyle(element).position === 'fixed' ||
                    getComputedStyle(element).position === 'sticky') {
                    element.style.position = 'absolute';
                }

                // Ensure all elements are visible
                element.style.opacity = '1';
                element.style.visibility = 'visible';
            }
        });

        // Force immediate style recalculation
        resultRef.current.offsetHeight;

        return () => {
            // Restore original styles
            elements.forEach((styles, element) => {
                if (element instanceof HTMLElement) {
                    element.style.cssText = styles.originalStyle;
                    element.classList.remove(...element.classList);
                    element.classList.add(...styles.originalClasses);
                }
            });
        };
    };

    const handleShare = async () => {
        if (!resultRef.current || isSharing) return;

        try {
            setIsSharing(true);
            // setShareProgress('Preparing...');

            // Store original styles
            const originalStyles = new Map();

            // Handle fixed elements and status bar during capture
            const elementsToHandle = document.querySelectorAll('.fixed, .sticky, [data-status-bar]');
            elementsToHandle.forEach(element => {
                if (element instanceof HTMLElement) {
                    originalStyles.set(element, element.style.cssText);

                    // Hide status bar and bottom elements
                    if (element.hasAttribute('data-status-bar') || element.classList.contains('bottom-0')) {
                        element.style.display = 'none';
                    }
                    // Keep header visible but handle other fixed elements
                    else if (!element.closest('[data-header]')) {
                        element.style.position = 'absolute';
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

            // setShareProgress('Capturing...');

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

            setShareProgress('Processing...');

            // Convert to blob
            const blob = await new Promise<Blob>((resolve, reject) => {
                canvas.toBlob((blob) => {
                    if (blob) resolve(blob);
                    else reject(new Error('Canvas to Blob conversion failed'));
                }, 'image/png', 1.0);
            });

            setShareProgress('Sharing...');

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

            // Restore all original styles
            originalStyles.forEach((style, element) => {
                if (element instanceof HTMLElement) {
                    element.style.cssText = style || '';
                }
            });

        } catch (error) {
            console.error('Error sharing:', error);
            alert('Failed to share. Please try again.');
        } finally {
            setIsSharing(false);
            setShareProgress('');
        }
    };

    // Keep existing calculations
    const ankTotal = Number(formData?.ankValue || 0) * Number(formData?.ankValueSelect || 0);
    const spTotal = Number(formData?.spValue || 0) * Number(formData?.spValueSelect || 0);
    const dpTotal = Number(formData?.dpValue || 0) * Number(formData?.dpValueSelect || 0);
    const jodiTotal = Number(formData?.jodiValue || 0) * Number(formData?.jodiValueSelect || 0);

    const grandTotalWining = ankTotal + spTotal + dpTotal + jodiTotal;
    const totalPlayValue = Number(formData?.totalPlay || 0);
    const totalPlayPercent = Math.floor(totalPlayValue * (Number(formData?.totalPlaySelect || 0) / 100));
    const balance = totalPlayValue - totalPlayPercent;
    const bal_win = balance > grandTotalWining ? balance - grandTotalWining : grandTotalWining - balance;
    const totalCalc = formData?.oldBalanceSelect === "0"
        ? bal_win - Number(formData?.oldBalance || 0)
        : bal_win + Number(formData?.oldBalance || 0);
    const afterAdvanceTotal = formData?.advanceMoneySelect === "0"
        ? totalCalc + Number(formData?.advanceMoney || 0)
        : totalCalc - Number(formData?.advanceMoney || 0);

    const selectedDate = formData?.selectedDate
        ? new Date(formData.selectedDate).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'numeric',
            year: 'numeric',
        })
        : '';

    if (!formData) return (
        <div className="min-h-screen grid place-items-center bg-gray-50">
            <div className="animate-pulse flex flex-col items-center gap-2">
                <div className="h-6 w-24 bg-gray-200 rounded-full"/>
                <div className="h-4 w-20 bg-gray-100 rounded-full"/>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 pb-16">
            <div ref={resultRef} data-result-ref className="max-w-lg mx-auto bg-white">
                {/* Enhanced Header */}
                <div data-header className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b">
                    <div className="flex items-center justify-between p-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center shadow-sm">
                                <span className="text-white font-bold">{formData?.mainHeading?.slice(0, 2) || 'SB'}</span>
                            </div>
                            <div>
                                <h1 className="text-base font-semibold text-gray-900">{formData?.mainHeading}</h1>
                                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                    <Calendar className="w-3.5 h-3.5"/>
                                    <span>{selectedDate}</span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={handleShare}
                            disabled={isSharing}
                            className="relative p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSharing ? (
                                <Loader2 className="w-5 h-5 animate-spin"/>
                            ) : (
                                <Share2 className="w-5 h-5"/>
                            )}
                        </button>
                    </div>

                    {/* Status Bar */}
                    {shareProgress && (
                        <div data-status-bar className="px-3 py-1 bg-blue-50 text-blue-600 text-sm">
                            {shareProgress}
                        </div>
                    )}

                    {/* Quick Stats */}
                    <div className="grid grid-cols-3 divide-x divide-gray-100 border-t">
                        <div className="px-3 py-2">
                            <div className="text-xs text-gray-500">Total Play</div>
                            <div className="text-sm font-medium mt-0.5">₹{totalPlayValue}</div>
                        </div>
                        <div className="px-3 py-2">
                            <div className="text-xs text-gray-500">Winning</div>
                            <div className="text-sm font-medium mt-0.5">₹{grandTotalWining}</div>
                        </div>
                        <div className="px-3 py-2">
                            <div className="text-xs text-gray-500">Balance</div>
                            <div className={`text-sm font-medium mt-0.5 ${
                                afterAdvanceTotal > 0 ? 'text-green-600' : 'text-red-600'
                            }`}>₹{afterAdvanceTotal}</div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="p-3 space-y-4">
                    {/* Game Cards */}
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { label: 'ANK', value: ankTotal, percent: formData?.ankValueSelect, color: 'from-blue-500 to-blue-600' },
                            { label: 'SP', value: spTotal, percent: formData?.spValueSelect, color: 'from-purple-500 to-purple-600' },
                            { label: 'DP', value: dpTotal, percent: formData?.dpValueSelect, color: 'from-indigo-500 to-indigo-600' },
                            { label: 'JODI', value: jodiTotal, percent: formData?.jodiValueSelect, color: 'from-pink-500 to-pink-600' }
                        ].map((item) => (
                            <div
                                key={item.label}
                                className="relative overflow-hidden rounded-xl bg-white border shadow-sm"
                            >
                                <div className={`h-1.5 bg-gradient-to-r ${item.color}`}/>
                                <div className="p-3">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm font-medium">{item.label}</span>
                                        <span className="text-xs text-gray-500">{item.percent}%</span>
                                    </div>
                                    <div className="text-lg font-semibold">₹{item.value}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Result Display */}
                    {finalDisplayResult && (
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-4 shadow-sm">
                            <div className="text-center text-xl font-bold text-white">
                                {finalDisplayResult}
                            </div>
                        </div>
                    )}

                    {/* Balance Information */}
                    <Card className="shadow-sm">
                        <CardContent className="divide-y divide-gray-100">
                            {[
                                {
                                    label: 'Total Play',
                                    value: totalPlayValue,
                                    extra: `${formData?.totalPlaySelect}%`,
                                    icon: <TrendingUp className="text-blue-500"/>
                                },
                                {
                                    label: 'Old Balance',
                                    value: formData?.oldBalance,
                                    extra: formData?.oldBalanceSelect === '1' ? 'Plus' : 'Minus',
                                    icon: <Clock className="text-purple-500"/>
                                },
                                {
                                    label: 'Advance Money',
                                    value: formData?.advanceMoney,
                                    extra: formData?.advanceMoneySelect === '1' ? 'Plus' : 'Minus',
                                    icon: <Wallet className="text-indigo-500"/>
                                }
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between py-3 px-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-5 h-5">{item.icon}</div>
                                        <span className="text-sm font-medium">{item.label}</span>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-semibold">₹{item.value || '0'}</div>
                                        <div className="text-xs text-gray-500">{item.extra}</div>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Fixed Bottom Bar */}
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
                    <div className="max-w-lg mx-auto p-3">
                        <select
                            className="w-full p-3 rounded-lg border text-sm bg-white appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                            <ChevronDown className="w-5 h-5"/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
