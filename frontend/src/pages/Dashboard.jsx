import React, { useState, useEffect,useMemo } from 'react';
import { transactionService } from '../services/api';
import { PlusCircle, Wallet, List ,PieChart as ChartIcon,Trash2 ,Target ,Search,Filter } from 'lucide-react';
import { PieChart ,Pie ,Cell ,ResponsiveContainer ,Tooltip ,Legend } from 'recharts';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // Import it as a function
import html2canvas from 'html2canvas';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8','#6366f1','#ec4899'];

const Dashboard = () => {
    const [transactions, setTransactions] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('Food');

    // Download Report
    const downloadPDF = async () => {
    const doc = new jsPDF();
    
    // 1. Add Title
    doc.setFontSize(20);
    doc.text("FinTrack Executive Report", 14, 20);

    // 2. Capture the Pie Chart
    const pieChartElem = document.getElementById('pie-chart-container');
    const pieCanvas = await html2canvas(pieChartElem);
    const pieImgData = pieCanvas.toDataURL('image/png');
    
    // 3. Capture the Bar Chart
    const barChartElem = document.getElementById('bar-chart-container');
    const barCanvas = await html2canvas(barChartElem);
    const barImgData = barCanvas.toDataURL('image/png');

    // 4. Add Images to PDF (x, y, width, height)
    doc.setFontSize(12);
    doc.text("Category Breakdown", 14, 35);
    doc.addImage(pieImgData, 'PNG', 14, 40, 80, 60);

    doc.text("Monthly Trends", 110, 35);
    doc.addImage(barImgData, 'PNG', 110, 40, 80, 60);

    // 5. Add the Transactions Table below the images
    autoTable(doc, {
        head: [["Date", "Description", "Category", "Amount"]],
        body: transactions.map(t => [
            new Date(t.timestamp).toLocaleDateString(),
            t.description,
            t.category,
            `$${t.amount.toFixed(2)}`
        ]),
        startY: 110, // Start table after the images
        theme: 'grid'
    });

    doc.save("FinTrack_Visual_Report.pdf");
    };

    // Fetch transactions on load
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await transactionService.getTransactions();
            setTransactions(res.data);
            
            // Generate chart data by grouping categories
            const totals = res.data.reduce((acc, curr) => {
                acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
                return acc;
            }, {});

            const formattedData = Object.keys(totals).map(key => ({
                name: key,
                value: totals[key]
            }));
            setChartData(formattedData);
        } catch (err) {
            console.error("Fetch error", err);
        }
    };

    const handleAddTransaction = async (e) => {
        e.preventDefault();
        try {
            await transactionService.addTransaction({
                amount: parseFloat(amount),
                description,
                category
            });
            // Clear fields and refresh list
            setAmount('');
            setDescription('');
            fetchData();
        } catch (err) {
            alert("Error adding transaction");
        }
    };

    const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
        try {
            await transactionService.deleteTransaction(id);
            fetchData(); // Refresh the list and chart automatically
        } catch (err) {
            alert("Failed to delete transaction");
        }
    }
    };

     // Calculate Summary Data
     const totalSpent = transactions.reduce((acc, curr) => acc + curr.amount, 0);
        const transactionCount = transactions.length;

        // Find the category with the highest spending
        const topCategory = chartData.length > 0 
            ? chartData.reduce((prev, current) => (prev.value > current.value) ? prev : current).name 
            : "None";
        
     // Add these with your other useState hooks
    const [budgetGoal, setBudgetGoal] = useState(localStorage.getItem('budgetGoal') || 2000);
    const [isEditingBudget, setIsEditingBudget] = useState(false);

    // Calculate percentage (Spent / Goal * 100)
    const budgetUsagePercent = Math.min((totalSpent / budgetGoal) * 100, 100);

    // Determine color based on usage
    const getProgressBarColor = () => {
        if (budgetUsagePercent >= 90) return 'bg-red-500';
        if (budgetUsagePercent >= 70) return 'bg-yellow-500';
        return 'bg-green-500';
    };
    
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');
    // Inside your component:
    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => {
            const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = filterCategory === 'All' || t.category === filterCategory;
            return matchesSearch && matchesCategory;
        });
    }, [searchTerm, filterCategory, transactions]); // Only re-calculates if these 3 change
    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <header className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                        <Wallet className="text-blue-600" /> FinTrack
                    </h1>
                    <div className="flex items-center gap-4">
                        {/* NEW DOWNLOAD BUTTON */}
                        <button 
                            onClick={downloadPDF}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition"
                        >
                            Download Report (PDF)
                        </button>
                        
                        <button 
                            onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
                            className="text-sm text-gray-500 hover:text-red-500"
                        >
                            Logout
                        </button>
                    </div>
                </header>

                

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-600">
                        <p className="text-sm text-gray-500 uppercase font-bold tracking-wider">Total Spent</p>
                        <p className="text-3xl font-bold text-gray-800">${totalSpent.toFixed(2)}</p>
                    </div>
                    
                    <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-purple-600">
                        <p className="text-sm text-gray-500 uppercase font-bold tracking-wider">Top Category</p>
                        <p className="text-3xl font-bold text-gray-800">{topCategory}</p>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-600">
                        <p className="text-sm text-gray-500 uppercase font-bold tracking-wider">Transactions</p>
                        <p className="text-3xl font-bold text-gray-800">{transactionCount}</p>
                    </div>
                </div>
                {/* Budget Progress Section */}
                <div className="bg-white p-6 rounded-xl shadow-sm mb-8 border border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <Target size={20} className="text-blue-600" /> Monthly Budget Goal
                        </h2>
                        <div className="flex items-center gap-2">
                            {isEditingBudget ? (
                                <div className="flex gap-2">
                                    <input 
                                        type="number" 
                                        className="border rounded px-2 py-1 w-24 text-sm"
                                        value={budgetGoal}
                                        onChange={(e) => {
                                            setBudgetGoal(e.target.value);
                                            localStorage.setItem('budgetGoal', e.target.value);
                                        }}
                                    />
                                    <button onClick={() => setIsEditingBudget(false)} className="text-blue-600 text-sm font-bold">Save</button>
                                </div>
                            ) : (
                                <button onClick={() => setIsEditingBudget(true)} className="text-gray-400 hover:text-blue-600 text-sm">
                                    Edit Goal: ${budgetGoal}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* The Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                        <div 
                            className={`h-4 rounded-full transition-all duration-500 ${getProgressBarColor()}`}
                            style={{ width: `${budgetUsagePercent}%` }}
                        ></div>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Spent: ${totalSpent.toFixed(2)}</span>
                        <span className="font-bold text-gray-700">
                            {budgetUsagePercent.toFixed(0)}% of your ${budgetGoal} limit
                        </span>
                    </div>
                </div>
                {/* Search and Filter Bar */}
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        <input 
                            type="text"
                            placeholder="Search transactions..."
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter size={18} className="text-gray-500" />
                        <select 
                            className="border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                        >
                            <option value="All">All Categories</option>
                            <option value="Food">Food</option>
                            <option value="Rent">Rent</option>
                            <option value="Transport">Transport</option>
                            <option value="Entertainment">Entertainment</option>
                        </select>
                    </div>
                </div>

                {/* Add Transaction Form */}
                <div className="bg-white p-6 rounded-xl shadow-sm mb-8 border border-gray-100">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <PlusCircle size={20} className="text-green-500" /> Add New Expense
                    </h2>
                    <form onSubmit={handleAddTransaction} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <input 
                            type="number" placeholder="Amount" step="0.01" required
                            className="p-2 border rounded-lg"
                            value={amount} onChange={(e) => setAmount(e.target.value)}
                        />
                        <input 
                            type="text" placeholder="Description" required
                            className="p-2 border rounded-lg"
                            value={description} onChange={(e) => setDescription(e.target.value)}
                        />
                        <select 
                            className="p-2 border rounded-lg"
                            value={category} onChange={(e) => setCategory(e.target.value)}
                        >
                            <option value="Food">Food</option>
                            <option value="Rent">Rent</option>
                            <option value="Transport">Transport</option>
                            <option value="Entertainment">Entertainment</option>
                            <option value="Miscellaneous">Miscellaneous</option>
                            <option value="Grocery">Grocery</option>
                            <option value="Medicine">Medicine</option>
                            <option value="Bills">Bills</option>
                            <option value="Subscriptions">Subscriptions</option>
                        </select>
                        <button type="submit" className="bg-blue-600 text-white rounded-lg py-2 hover:bg-blue-700 transition">
                            Save
                        </button>
                    </form>
                </div>
                <div>
                {/* Data Visualization Section */}
                <div className="bg-white p-6 rounded-xl shadow-sm mb-8 border border-gray-100">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <ChartIcon size={20} className="text-purple-500" /> Spending Breakdown
                    </h2>
                    <div id="pie-chart-container" className="h-64 w-full">
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-center text-gray-400 py-20">Add transactions to see your breakdown</p>
                        )}
                    </div>
                </div>
               
                {/* Bar Chart Section */}
                    <div className="bg-white p-6 rounded-xl shadow-sm mb-8 border border-gray-100">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <ChartIcon size={20} className="text-blue-500" /> Yearly Spending Trend
                        </h2>
                        <div id="bar-chart-container" className="h-64 w-full">
                            {/* We use the SAME ResponsiveContainer here as we did for the Pie Chart */}
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}> {/* You can use chartData or a new yearlyData state */}
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                    <YAxis axisLine={false} tickLine={false} />
                                    <Tooltip 
                                        cursor={{fill: '#f8fafc'}}
                                        contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                                    />
                                    <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Transactions List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b bg-gray-50 flex items-center gap-2">
                        <List size={20} className="text-blue-600" />
                        <h2 className="font-semibold">Recent Transactions</h2>
                    </div>
                    <div className="divide-y">
                        {/* WE USE filteredTransactions HERE */}
                        {filteredTransactions.length > 0 ? (
                            filteredTransactions.map((t, index) => (
                                <div key={t.id} className="p-4 flex justify-between items-center hover:bg-gray-50 group">
                                    <div className="flex items-center gap-3">
                                        <div 
                                            className="w-2 h-2 rounded-full" 
                                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                        ></div>
                                        <div>
                                            <p className="font-medium text-gray-800">{t.description}</p>
                                            <p className="text-xs text-gray-400">
                                                {t.category} • {new Date(t.timestamp).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="font-bold text-gray-700">-${t.amount.toFixed(2)}</span>
                                        <button 
                                            onClick={() => handleDelete(t.id)}
                                            className="text-gray-300 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-gray-400 italic">
                                No matching transactions found.
                            </div>
                        )}
                    </div>
                </div>
                
                {transactions.map((t, index) => (
                    <div key={t.id} className="p-4 flex justify-between items-center hover:bg-gray-50 group">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                            <div>
                                <p className="font-medium text-gray-800">{t.description}</p>
                                <p className="text-xs text-gray-400">{t.category}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="font-bold text-gray-700">-${t.amount.toFixed(2)}</span>
                            <button 
                                onClick={() => handleDelete(t.id)}
                                className="text-gray-300 hover:text-red-500 transition-colors p-1"
                                title="Delete transaction"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}                
            </div>
        </div>
    );
};

export default Dashboard;