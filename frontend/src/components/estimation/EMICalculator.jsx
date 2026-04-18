import React, { useState } from 'react';
import axios from 'axios';
import { Calculator, TrendingUp, DollarSign, Calendar, Home, Zap, CheckCircle } from 'lucide-react';
import API_BASE_URL from '../../apiConfig';

const EMICalculator = () => {
    const [calculatorMode, setCalculatorMode] = useState('emi'); // 'emi' or 'affordable'
    
    // EMI Calculator inputs
    const [loanAmount, setLoanAmount] = useState('50');
    const [interestRate, setInterestRate] = useState('7.5');
    const [loanTerm, setLoanTerm] = useState('20');
    
    // Affordable Loan Calculator inputs
    const [monthlyBudget, setMonthlyBudget] = useState('50000');
    const [affordableRate, setAffordableRate] = useState('7.5');
    const [affordabeTerm, setAffordableTerm] = useState('20');
    
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Calculate EMI
    const calculateEMI = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await axios.post(`${API_BASE_URL}/calculators/emi`, {
                principalAmount: parseFloat(loanAmount) * 100000,
                annualInterestRate: parseFloat(interestRate),
                loanYears: parseFloat(loanTerm)
            });
            setResult(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Error calculating EMI');
        } finally {
            setLoading(false);
        }
    };

    // Calculate Affordable Loan
    const calculateAffordable = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await axios.post(`${API_BASE_URL}/calculators/emi/affordable`, {
                monthlyBudget: parseFloat(monthlyBudget),
                annualInterestRate: parseFloat(affordableRate),
                loanYears: parseFloat(affordabeTerm)
            });
            setResult(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Error calculating affordable loan');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(value);
    };

    return (
        <div style={{
            background: 'linear-gradient(135deg, var(--background) 0%, rgba(198, 161, 91, 0.05) 100%)',
            minHeight: '100vh',
            padding: '60px 20px',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Decorative elements */}
            <div style={{
                position: 'absolute',
                top: '-100px',
                right: '-100px',
                width: '400px',
                height: '400px',
                background: 'radial-gradient(circle, rgba(198, 161, 91, 0.1) 0%, transparent 70%)',
                borderRadius: '50%',
                pointerEvents: 'none'
            }} />
            <div style={{
                position: 'absolute',
                bottom: '-50px',
                left: '-100px',
                width: '300px',
                height: '300px',
                background: 'radial-gradient(circle, rgba(198, 161, 91, 0.08) 0%, transparent 70%)',
                borderRadius: '50%',
                pointerEvents: 'none'
            }} />

            <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                {/* Header */}
                <div style={{
                    textAlign: 'center',
                    marginBottom: '50px'
                }}>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px',
                        marginBottom: '16px',
                        padding: '12px 24px',
                        background: 'rgba(198, 161, 91, 0.1)',
                        borderRadius: '50px',
                        border: '1px solid rgba(198, 161, 91, 0.2)'
                    }}>
                        <Calculator size={24} style={{ color: 'var(--primary)' }} />
                        <span style={{ color: 'var(--primary)', fontWeight: '600' }}>Financial Tools</span>
                    </div>
                    <h1 style={{
                        fontSize: '2.8rem',
                        fontWeight: '700',
                        color: 'var(--text)',
                        marginBottom: '12px',
                        background: 'linear-gradient(135deg, var(--primary), #c6a15b)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                    }}>
                        EMI Calculator
                    </h1>
                    <p style={{
                        fontSize: '1.1rem',
                        color: 'var(--text-muted)',
                        maxWidth: '600px',
                        margin: '0 auto'
                    }}>
                        Calculate your monthly EMI for home loans or find out how much you can afford to borrow
                    </p>
                </div>

                {/* Mode Selector */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, minmax(220px, 1fr))',
                    gap: '16px',
                    maxWidth: '640px',
                    margin: '0 auto 50px'
                }}>
                    <button
                        onClick={() => {
                            setCalculatorMode('emi');
                            setResult(null);
                        }}
                        style={{
                            padding: '14px 32px',
                            border: 'none',
                            borderRadius: '12px',
                            width: '100%',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            background: calculatorMode === 'emi' 
                                ? 'linear-gradient(135deg, var(--primary), #d4af80)' 
                                : 'var(--surface)',
                            color: calculatorMode === 'emi' ? '#fff' : 'var(--text)',
                            transition: 'all 0.3s ease',
                            boxShadow: calculatorMode === 'emi'
                                ? '0 8px 24px rgba(198, 161, 91, 0.3)'
                                : 'none',
                            border: calculatorMode !== 'emi' ? '1px solid var(--border)' : 'none'
                        }}
                    >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                            <DollarSign size={18} />
                            Calculate EMI
                        </span>
                    </button>
                    <button
                        onClick={() => {
                            setCalculatorMode('affordable');
                            setResult(null);
                        }}
                        style={{
                            padding: '14px 32px',
                            border: 'none',
                            borderRadius: '12px',
                            width: '100%',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            background: calculatorMode === 'affordable' 
                                ? 'linear-gradient(135deg, var(--primary), #d4af80)' 
                                : 'var(--surface)',
                            color: calculatorMode === 'affordable' ? '#fff' : 'var(--text)',
                            transition: 'all 0.3s ease',
                            boxShadow: calculatorMode === 'affordable'
                                ? '0 8px 24px rgba(198, 161, 91, 0.3)'
                                : 'none',
                            border: calculatorMode !== 'affordable' ? '1px solid var(--border)' : 'none'
                        }}
                    >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                            <TrendingUp size={18} />
                            How Much Can I Afford?
                        </span>
                    </button>
                </div>

                {/* Calculator Forms */}
                <div style={{
                    maxWidth: '1100px',
                    margin: '0 auto',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '40px',
                    alignItems: 'start'
                }}>
                    {/* Form */}
                    <div style={{
                        background: 'var(--surface)',
                        padding: '40px',
                        borderRadius: '16px',
                        border: '1px solid var(--border)',
                        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)',
                        transition: 'all 0.3s ease'
                    }}>
                        <form onSubmit={calculatorMode === 'emi' ? calculateEMI : calculateAffordable}>
                            {calculatorMode === 'emi' ? (
                                <>
                                    {/* Loan Amount */}
                                    <div style={{ marginBottom: '32px' }}>
                                        <label style={{
                                            display: 'block',
                                            marginBottom: '12px',
                                            fontWeight: '700',
                                            color: 'var(--text)',
                                            fontSize: '0.95rem'
                                        }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <Home size={16} style={{ color: 'var(--primary)' }} />
                                                Loan Amount (in Lakhs)
                                            </span>
                                        </label>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            marginBottom: '16px'
                                        }}>
                                            <DollarSign size={18} style={{ color: 'var(--primary)' }} />
                                            <input
                                                type="number"
                                                value={loanAmount}
                                                onChange={(e) => setLoanAmount(e.target.value)}
                                                step="1"
                                                min="1"
                                                max="500"
                                                style={{
                                                    flex: 1,
                                                    padding: '14px',
                                                    border: '1.5px solid var(--border)',
                                                    borderRadius: '10px',
                                                    background: 'var(--background)',
                                                    color: 'var(--text)',
                                                    fontSize: '1rem',
                                                    transition: 'all 0.3s ease'
                                                }}
                                            />
                                        </div>
                                        <input
                                            type="range"
                                            value={loanAmount}
                                            onChange={(e) => setLoanAmount(e.target.value)}
                                            min="1"
                                            max="500"
                                            style={{
                                                width: '100%',
                                                height: '6px',
                                                borderRadius: '5px',
                                                background: 'linear-gradient(to right, var(--primary), rgba(198, 161, 91, 0.3))',
                                                outline: 'none',
                                                WebkitAppearance: 'none',
                                                marginBottom: '12px'
                                            }}
                                        />
                                        <small style={{ color: 'var(--text-muted)', display: 'block' }}>
                                            ₹{(parseFloat(loanAmount) * 100000).toLocaleString('en-IN')}
                                        </small>
                                    </div>

                                    {/* Interest Rate */}
                                    <div style={{ marginBottom: '32px' }}>
                                        <label style={{
                                            display: 'block',
                                            marginBottom: '12px',
                                            fontWeight: '700',
                                            color: 'var(--text)',
                                            fontSize: '0.95rem'
                                        }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <Zap size={16} style={{ color: 'var(--primary)' }} />
                                                Annual Interest Rate (%)
                                            </span>
                                        </label>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            marginBottom: '16px'
                                        }}>
                                            <TrendingUp size={18} style={{ color: 'var(--primary)' }} />
                                            <input
                                                type="number"
                                                value={interestRate}
                                                onChange={(e) => setInterestRate(e.target.value)}
                                                step="0.1"
                                                min="0"
                                                max="20"
                                                style={{
                                                    flex: 1,
                                                    padding: '14px',
                                                    border: '1.5px solid var(--border)',
                                                    borderRadius: '10px',
                                                    background: 'var(--background)',
                                                    color: 'var(--text)',
                                                    fontSize: '1rem',
                                                    transition: 'all 0.3s ease'
                                                }}
                                            />
                                        </div>
                                        <input
                                            type="range"
                                            value={interestRate}
                                            onChange={(e) => setInterestRate(e.target.value)}
                                            step="0.1"
                                            min="0"
                                            max="20"
                                            style={{
                                                width: '100%',
                                                height: '6px',
                                                borderRadius: '5px',
                                                background: 'linear-gradient(to right, var(--primary), rgba(198, 161, 91, 0.3))',
                                                outline: 'none',
                                                WebkitAppearance: 'none',
                                                marginBottom: '12px'
                                            }}
                                        />
                                    </div>

                                    {/* Loan Term */}
                                    <div style={{ marginBottom: '32px' }}>
                                        <label style={{
                                            display: 'block',
                                            marginBottom: '12px',
                                            fontWeight: '700',
                                            color: 'var(--text)',
                                            fontSize: '0.95rem'
                                        }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <Calendar size={16} style={{ color: 'var(--primary)' }} />
                                                Loan Term (Years)
                                            </span>
                                        </label>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            marginBottom: '16px'
                                        }}>
                                            <Calendar size={18} style={{ color: 'var(--primary)' }} />
                                            <input
                                                type="number"
                                                value={loanTerm}
                                                onChange={(e) => setLoanTerm(e.target.value)}
                                                step="1"
                                                min="1"
                                                max="30"
                                                style={{
                                                    flex: 1,
                                                    padding: '14px',
                                                    border: '1.5px solid var(--border)',
                                                    borderRadius: '10px',
                                                    background: 'var(--background)',
                                                    color: 'var(--text)',
                                                    fontSize: '1rem',
                                                    transition: 'all 0.3s ease'
                                                }}
                                            />
                                        </div>
                                        <input
                                            type="range"
                                            value={loanTerm}
                                            onChange={(e) => setLoanTerm(e.target.value)}
                                            min="1"
                                            max="30"
                                            style={{
                                                width: '100%',
                                                height: '6px',
                                                borderRadius: '5px',
                                                background: 'linear-gradient(to right, var(--primary), rgba(198, 161, 91, 0.3))',
                                                outline: 'none',
                                                WebkitAppearance: 'none'
                                            }}
                                        />
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* Monthly Budget */}
                                    <div style={{ marginBottom: '32px' }}>
                                        <label style={{
                                            display: 'block',
                                            marginBottom: '12px',
                                            fontWeight: '700',
                                            color: 'var(--text)',
                                            fontSize: '0.95rem'
                                        }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <DollarSign size={16} style={{ color: 'var(--primary)' }} />
                                                Monthly Budget (₹)
                                            </span>
                                        </label>
                                        <input
                                            type="number"
                                            value={monthlyBudget}
                                            onChange={(e) => setMonthlyBudget(e.target.value)}
                                            step="5000"
                                            min="10000"
                                            style={{
                                                width: '100%',
                                                padding: '14px',
                                                border: '1.5px solid var(--border)',
                                                borderRadius: '10px',
                                                background: 'var(--background)',
                                                color: 'var(--text)',
                                                fontSize: '1rem',
                                                transition: 'all 0.3s ease'
                                            }}
                                        />
                                    </div>

                                    {/* Interest Rate */}
                                    <div style={{ marginBottom: '32px' }}>
                                        <label style={{
                                            display: 'block',
                                            marginBottom: '12px',
                                            fontWeight: '700',
                                            color: 'var(--text)',
                                            fontSize: '0.95rem'
                                        }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <Zap size={16} style={{ color: 'var(--primary)' }} />
                                                Annual Interest Rate (%)
                                            </span>
                                        </label>
                                        <input
                                            type="number"
                                            value={affordableRate}
                                            onChange={(e) => setAffordableRate(e.target.value)}
                                            step="0.1"
                                            min="0"
                                            max="20"
                                            style={{
                                                width: '100%',
                                                padding: '14px',
                                                border: '1.5px solid var(--border)',
                                                borderRadius: '10px',
                                                background: 'var(--background)',
                                                color: 'var(--text)',
                                                fontSize: '1rem',
                                                transition: 'all 0.3s ease'
                                            }}
                                        />
                                    </div>

                                    {/* Loan Term */}
                                    <div style={{ marginBottom: '32px' }}>
                                        <label style={{
                                            display: 'block',
                                            marginBottom: '12px',
                                            fontWeight: '700',
                                            color: 'var(--text)',
                                            fontSize: '0.95rem'
                                        }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <Calendar size={16} style={{ color: 'var(--primary)' }} />
                                                Loan Term (Years)
                                            </span>
                                        </label>
                                        <input
                                            type="number"
                                            value={affordabeTerm}
                                            onChange={(e) => setAffordableTerm(e.target.value)}
                                            step="1"
                                            min="1"
                                            max="30"
                                            style={{
                                                width: '100%',
                                                padding: '14px',
                                                border: '1.5px solid var(--border)',
                                                borderRadius: '10px',
                                                background: 'var(--background)',
                                                color: 'var(--text)',
                                                fontSize: '1rem',
                                                transition: 'all 0.3s ease'
                                            }}
                                        />
                                    </div>
                                </>
                            )}

                            {error && (
                                <div style={{
                                    padding: '14px',
                                    background: 'rgba(239, 68, 68, 0.08)',
                                    border: '1.5px solid #ef4444',
                                    borderRadius: '10px',
                                    color: '#dc2626',
                                    marginBottom: '20px',
                                    fontSize: '0.95rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    ❌ {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    width: '100%',
                                    padding: '16px',
                                    background: loading 
                                        ? 'rgba(198, 161, 91, 0.5)' 
                                        : 'linear-gradient(135deg, var(--primary), #d4af80)',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '12px',
                                    fontSize: '1rem',
                                    fontWeight: '700',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    opacity: loading ? 0.7 : 1,
                                    transition: 'all 0.3s ease',
                                    boxShadow: !loading ? '0 8px 24px rgba(198, 161, 91, 0.3)' : 'none'
                                }}
                            >
                                {loading ? '⏳ Calculating...' : '✨ Calculate'}
                            </button>
                        </form>
                    </div>

                    {/* Results */}
                    {result && (
                        <div style={{
                            background: 'var(--surface)',
                            padding: '40px',
                            borderRadius: '16px',
                            border: '1px solid var(--border)',
                            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)',
                            animation: 'slideIn 0.5s ease'
                        }}>
                            <h3 style={{
                                fontSize: '1.4rem',
                                fontWeight: '700',
                                color: 'var(--text)',
                                marginBottom: '28px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <CheckCircle size={24} style={{ color: 'var(--primary)' }} />
                                Your Calculation Results
                            </h3>

                            {calculatorMode === 'emi' && result?.monthlyEMI ? (
                                <>
                                    <div style={{
                                        padding: '28px',
                                        background: 'linear-gradient(135deg, rgba(198, 161, 91, 0.15), rgba(198, 161, 91, 0.05))',
                                        borderRadius: '14px',
                                        marginBottom: '28px',
                                        border: '1.5px solid rgba(198, 161, 91, 0.3)',
                                        boxShadow: '0 8px 24px rgba(198, 161, 91, 0.1)'
                                    }}>
                                        <p style={{
                                            fontSize: '0.9rem',
                                            color: 'var(--text-muted)',
                                            marginBottom: '12px',
                                            fontWeight: '600',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px'
                                        }}>
                                            💰 Monthly EMI Payment
                                        </p>
                                        <h4 style={{
                                            fontSize: '2.6rem',
                                            fontWeight: '700',
                                            background: 'linear-gradient(135deg, var(--primary), #d4af80)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            backgroundClip: 'text',
                                            margin: '0'
                                        }}>
                                            {formatCurrency(result.monthlyEMI)}
                                        </h4>
                                    </div>

                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: '1fr 1fr',
                                        gap: '16px',
                                        marginBottom: '28px'
                                    }}>
                                        <div style={{
                                            padding: '20px',
                                            background: 'var(--background)',
                                            borderRadius: '12px',
                                            border: '1.5px solid var(--border)',
                                            transition: 'all 0.3s ease'
                                        }}>
                                            <p style={{
                                                fontSize: '0.8rem',
                                                color: 'var(--text-muted)',
                                                margin: '0 0 12px 0',
                                                fontWeight: '600',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px'
                                            }}>
                                                🏠 Principal Amount
                                            </p>
                                            <p style={{
                                                fontSize: '1.4rem',
                                                fontWeight: '700',
                                                color: 'var(--primary)',
                                                margin: '0'
                                            }}>
                                                {formatCurrency(result.principal)}
                                            </p>
                                        </div>

                                        <div style={{
                                            padding: '20px',
                                            background: 'var(--background)',
                                            borderRadius: '12px',
                                            border: '1.5px solid var(--border)',
                                            transition: 'all 0.3s ease'
                                        }}>
                                            <p style={{
                                                fontSize: '0.8rem',
                                                color: 'var(--text-muted)',
                                                margin: '0 0 12px 0',
                                                fontWeight: '600',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px'
                                            }}>
                                                ⚠️ Total Interest
                                            </p>
                                            <p style={{
                                                fontSize: '1.4rem',
                                                fontWeight: '700',
                                                color: '#ef4444',
                                                margin: '0'
                                            }}>
                                                {formatCurrency(result.totalInterest)}
                                            </p>
                                        </div>

                                        <div style={{
                                            padding: '20px',
                                            background: 'var(--background)',
                                            borderRadius: '12px',
                                            border: '1.5px solid var(--border)',
                                            transition: 'all 0.3s ease'
                                        }}>
                                            <p style={{
                                                fontSize: '0.8rem',
                                                color: 'var(--text-muted)',
                                                margin: '0 0 12px 0',
                                                fontWeight: '600',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px'
                                            }}>
                                                💵 Total Amount Payable
                                            </p>
                                            <p style={{
                                                fontSize: '1.4rem',
                                                fontWeight: '700',
                                                color: 'var(--text)',
                                                margin: '0'
                                            }}>
                                                {formatCurrency(result.totalAmount)}
                                            </p>
                                        </div>

                                        <div style={{
                                            padding: '20px',
                                            background: 'var(--background)',
                                            borderRadius: '12px',
                                            border: '1.5px solid var(--border)',
                                            transition: 'all 0.3s ease'
                                        }}>
                                            <p style={{
                                                fontSize: '0.8rem',
                                                color: 'var(--text-muted)',
                                                margin: '0 0 12px 0',
                                                fontWeight: '600',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px'
                                            }}>
                                                📅 Loan Tenure
                                            </p>
                                            <p style={{
                                                fontSize: '1.4rem',
                                                fontWeight: '700',
                                                color: 'var(--text)',
                                                margin: '0'
                                            }}>
                                                {result.numberOfMonths} months
                                            </p>
                                        </div>
                                    </div>
                                </>
                            ) : calculatorMode === 'affordable' && result?.affordableLoanAmount ? (
                                <div style={{
                                    padding: '28px',
                                    background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(34, 197, 94, 0.05))',
                                    borderRadius: '14px',
                                    border: '1.5px solid rgba(34, 197, 94, 0.3)',
                                    boxShadow: '0 8px 24px rgba(34, 197, 94, 0.1)'
                                }}>
                                    <p style={{
                                        fontSize: '0.9rem',
                                        color: 'var(--text-muted)',
                                        marginBottom: '12px',
                                        fontWeight: '600',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                    }}>
                                        💚 Maximum Affordable Loan
                                    </p>
                                    <h4 style={{
                                        fontSize: '2.8rem',
                                        fontWeight: '700',
                                        color: '#22c55e',
                                        margin: '0 0 16px 0'
                                    }}>
                                        {formatCurrency(result.affordableLoanAmount)}
                                    </h4>
                                    <p style={{
                                        fontSize: '0.9rem',
                                        color: 'var(--text-muted)',
                                        margin: '0',
                                        lineHeight: '1.6'
                                    }}>
                                        Based on ₹{Math.round(result.monthlyBudget || 0).toLocaleString('en-IN')} monthly budget at {result.annualInterestRate}% for {result.loanTerm} years
                                    </p>
                                </div>
                            ) : (
                                <p style={{ color: 'var(--text-muted)' }}>No results available</p>
                            )}

                            {/* Bank Offers */}
                            <div style={{ marginTop: '36px', paddingTop: '28px', borderTop: '2px solid var(--border)' }}>
                                <h4 style={{
                                    fontSize: '1.2rem',
                                    fontWeight: '700',
                                    color: 'var(--text)',
                                    marginBottom: '20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    🏦 Featured Bank Partners
                                </h4>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr',
                                    gap: '12px'
                                }}>
                                    {[
                                        { name: 'HDFC Bank', url: 'https://www.hdfc.com/personal/loans/home-loans' },
                                        { name: 'ICICI Bank', url: 'https://www.icicibank.com/personal/loans/home-loan' },
                                        { name: 'Axis Bank', url: 'https://www.axisbank.com/retail/loans/home-loan' },
                                        { name: 'SBI', url: 'https://www.sbi.co.in/web/personal-banking/loans-and-advances/home-loans' }
                                    ].map((bank) => (
                                        <div key={bank.name} style={{
                                            padding: '16px',
                                            background: 'linear-gradient(135deg, var(--background), rgba(198, 161, 91, 0.05))',
                                            borderRadius: '10px',
                                            border: '1.5px solid var(--border)',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            transition: 'all 0.3s ease',
                                            cursor: 'pointer'
                                        }}>
                                            <span style={{ color: 'var(--text)', fontWeight: '700' }}>
                                                {bank.name}
                                            </span>
                                            <button 
                                                onClick={() => window.open(bank.url, '_blank')}
                                                style={{
                                                    padding: '10px 20px',
                                                    background: 'linear-gradient(135deg, var(--primary), #d4af80)',
                                                    color: '#fff',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    fontSize: '0.9rem',
                                                    cursor: 'pointer',
                                                    fontWeight: '600',
                                                    transition: 'all 0.3s ease',
                                                    boxShadow: '0 4px 12px rgba(198, 161, 91, 0.3)'
                                                }}
                                                onMouseOver={(e) => {
                                                    e.target.style.transform = 'translateY(-2px)';
                                                    e.target.style.boxShadow = '0 6px 16px rgba(198, 161, 91, 0.4)';
                                                }}
                                                onMouseOut={(e) => {
                                                    e.target.style.transform = 'translateY(0)';
                                                    e.target.style.boxShadow = '0 4px 12px rgba(198, 161, 91, 0.3)';
                                                }}>
                                                Apply Now
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                input[type="range"]::-webkit-slider-thumb {
                    appearance: none;
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, var(--primary), #d4af80);
                    cursor: pointer;
                    box-shadow: 0 4px 12px rgba(198, 161, 91, 0.4);
                    border: 2px solid #fff;
                }

                input[type="range"]::-moz-range-thumb {
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, var(--primary), #d4af80);
                    cursor: pointer;
                    box-shadow: 0 4px 12px rgba(198, 161, 91, 0.4);
                    border: 2px solid #fff;
                }

                input[type="range"]::-webkit-slider-thumb:hover {
                    box-shadow: 0 6px 16px rgba(198, 161, 91, 0.5);
                }

                input[type="range"]::-moz-range-thumb:hover {
                    box-shadow: 0 6px 16px rgba(198, 161, 91, 0.5);
                }

                input:focus {
                    outline: none;
                    border-color: var(--primary) !important;
                    box-shadow: 0 0 0 3px rgba(198, 161, 91, 0.1);
                }

                @media (max-width: 768px) {
                    h1 {
                        font-size: 2rem !important;
                    }

                    div[style*="gridTemplateColumns: 1fr 1fr"] {
                        grid-template-columns: 1fr !important;
                    }

                    button span {
                        flex-direction: column;
                    }
                }
            `}</style>
        </div>
    );
};

export default EMICalculator;
