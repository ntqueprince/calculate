const { useState, useEffect, useRef } = React;

// Initialize Supabase client here
const { createClient } = supabase;
const supabaseUrl = 'https://nraoiasjbifimoljziqi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yYW9pYXNqYmlmaW1vbGp6aXFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyMzMwNjIsImV4cCI6MjA3MDgwOTA2Mn0.VOslmpc2xNK6nklwAgEjvvybMuiPbJPHDahKfQdBTdo';
const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

const months = [
    { en: "Chait", hi: "चैत" },
    { en: "Vaishakh", hi: "वैशाख" },
    { en: "Jyeshth", hi: "ज्येष्ठ" },
    { en: "Ashadh", hi: "आषाढ़" },
    { en: "Shravan", hi: "श्रावण" },
    { en: "Bhadrapad", hi: "भाद्रपद" },
    { en: "Ashwin", hi: "अश्विन" },
    { en: "Kartik", hi: "कार्तिक" },
    { en: "Margashirsh", hi: "मार्गशीर्ष" },
    { en: "Paush", hi: "पौष" },
    { en: "Magh", hi: "माघ" },
    { en: "Falgun", hi: "फाल्गुन" }
];

const years = Array.from({length: 61}, (_, i) => 1420 + i);
const tithis = [
    { en: "1", hi: "१" }, { en: "2", hi: "२" }, { en: "3", hi: "३" }, { en: "4", hi: "४" }, { en: "5", hi: "५" },
    { en: "6", hi: "६" }, { en: "7", hi: "७" }, { en: "8", hi: "८" }, { en: "9", hi: "९" }, { en: "10", hi: "१०" },
    { en: "11", hi: "११" }, { en: "12", hi: "१२" }, { en: "13", hi: "१३" }, { en: "14", hi: "१४" }, { en: "15", hi: "१५" }
];

const pakshas = [
    { en: "Sudi", hi: "(सुदी)" },
    { en: "Badi", hi: "(बदी)" }
];

function App() {
    const [currentView, setCurrentView] = useState('login');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [popupMessage, setPopupMessage] = useState('');
    const [allEntries, setAllEntries] = useState([]);

    const [newEntryFormData, setNewEntryFormData] = useState({
        customer_name: '',
        comment: '',
        village: '',
        mobile: '',
        amount: '',
        year: '',
        month: '',
        paksha: '',
        tithi: '',
    });

    const [newEntryItems, setNewEntryItems] = useState([{ itemType: '', itemName: '', weight: '' }]);

    const [filters, setFilters] = useState({
        customerName: '',
        village: '',
        itemType: '',
        itemName: '',
        year: '',
        month: '',
        paksha: '',
        tithi: ''
    });

    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);

    const [showItemDetails, setShowItemDetails] = useState(false);
    const [currentItemNamesAndWeights, setCurrentItemNamesAndWeights] = useState([]);
    const modalRef = useRef(null);

    const fetchEntries = async () => {
        const { data, error } = await supabaseClient.from('customers').select('*');
        if (error) {
            console.error("Error fetching entries:", error);
            showPopupMessage('Error fetching records!', true);
        } else {
            setAllEntries(data);
        }
    };

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabaseClient.auth.getSession();
            if (session) {
                setIsLoggedIn(true);
                setCurrentView('dashboard');
                fetchEntries();
            }
        };
        checkSession();

        const { data: authListener } = supabaseClient.auth.onAuthStateChange(
            (event, session) => {
                if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                    setIsLoggedIn(true);
                    setCurrentView('dashboard');
                    fetchEntries();
                }
                if (event === 'SIGNED_OUT') {
                    setIsLoggedIn(false);
                    setCurrentView('login');
                }
            }
        );

        return () => authListener.subscription.unsubscribe();
    }, []);

    const filteredData = allEntries.filter(item => {
        const itemMatches = item.items.some(singleItem =>
            filters.itemName === '' || (singleItem.itemName && singleItem.itemName.toLowerCase().includes(filters.itemName.toLowerCase()))
        );

        return (
            (filters.customerName === '' || (item.customer_name && item.customer_name.toLowerCase().includes(filters.customerName.toLowerCase()))) &&
            (filters.village === '' || (item.village && item.village.toLowerCase().includes(filters.village.toLowerCase()))) &&
            (filters.itemType === '' || (item.items && item.items.some(singleItem => singleItem.itemType === filters.itemType))) &&
            itemMatches &&
            (filters.year === '' || item.year === filters.year) &&
            (filters.month === '' || item.month === filters.month) &&
            (filters.paksha === '' || item.paksha === filters.paksha) &&
            (filters.tithi === '' || item.tithi === filters.tithi)
        );
    });

    const showPopupMessage = (message, isError = false) => {
        setPopupMessage(message);
        setShowPopup(true);
        setTimeout(() => setShowPopup(false), 3000);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        const email = e.target.email.value;
        const password = e.target.password.value;
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email,
            password
        });
        if (error) {
            showPopupMessage(error.message, true);
        } else {
            showPopupMessage('Login Successful!');
        }
    };

    const handleSignUp = async (e) => {
        e.preventDefault();
        const email = e.target.email.value;
        const password = e.target.password.value;
        const { error } = await supabaseClient.auth.signUp({
            email,
            password
        });
        if (error) {
            showPopupMessage(error.message, true);
        } else {
            showPopupMessage('Registration successful! Please log in.');
            setTimeout(() => setCurrentView('login'), 2000);
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        const email = e.target.email.value;
        const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
            redirectTo: 'https://your-domain.com/update-password',
        });
        if (error) {
            showPopupMessage(error.message, true);
        } else {
            showPopupMessage('A password reset link has been sent to your email.');
            setTimeout(() => setCurrentView('login'), 2000);
        }
    };

    const handleLogout = async () => {
        const { error } = await supabaseClient.auth.signOut();
        if (error) {
            showPopupMessage('Error logging out!', true);
        } else {
            showPopupMessage('Logout Successful!');
        }
    };

    const handleNewEntryChange = (e) => {
        const { name, value } = e.target;
        setNewEntryFormData({ ...newEntryFormData, [name]: value });
    };

    const handleNewItemChange = (index, field, value) => {
        const updatedItems = newEntryItems.map((item, i) =>
            i === index ? { ...item, [field]: value } : item
        );
        setNewEntryItems(updatedItems);
    };

    const handleAddItem = () => {
        setNewEntryItems([...newEntryItems, { itemType: '', itemName: '', weight: '' }]);
    };

    const handleRemoveItem = (indexToRemove) => {
        setNewEntryItems(newEntryItems.filter((_, index) => index !== indexToRemove));
    };

    const startEdit = (item) => {
        setNewEntryFormData({
            customer_name: item.customer_name,
            comment: item.comment || '',
            village: item.village,
            mobile: item.mobile || '',
            amount: item.amount || '',
            year: item.year,
            month: item.month,
            paksha: item.paksha,
            tithi: item.tithi,
        });
        setNewEntryItems(item.items ? JSON.parse(JSON.stringify(item.items)) : [{ itemType: '', itemName: '', weight: '' }]);
        setIsEditing(true);
        setEditId(item.id);
        setCurrentView('newEntry');
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this record?')) {
            const { error } = await supabaseClient.from('customers').delete().eq('id', id);
            if (error) {
                console.error('Error deleting record:', error);
                showPopupMessage('Error deleting record!', true);
            } else {
                showPopupMessage('Record deleted!');
                fetchEntries();
            }
        }
    };

    const handleSaveEntry = async () => {
        const { customer_name, village, month, paksha, tithi } = newEntryFormData;
        if (!customer_name || !village || !month || !paksha || !tithi) {
            showPopupMessage('Please fill out all required fields.', true);
            return;
        }

        const completeEntryData = {
            ...newEntryFormData,
            items: newEntryItems,
        };

        if (isEditing) {
            const { error } = await supabaseClient
                .from('customers')
                .update(completeEntryData)
                .eq('id', editId);

            if (error) {
                console.error("Error updating entry:", error);
                showPopupMessage('Error updating record!', true);
            } else {
                showPopupMessage('Record Updated!');
                fetchEntries();
                setNewEntryFormData({
                    customer_name: '', comment: '', village: '', mobile: '', amount: '', year: '', month: '', paksha: '', tithi: '',
                });
                setNewEntryItems([{ itemType: '', itemName: '', weight: '' }]);
                setIsEditing(false);
                setEditId(null);
                setCurrentView('viewEntries');
            }
        } else {
            const { error } = await supabaseClient.from('customers').insert([completeEntryData]);

            if (error) {
                console.error("Error saving entry:", error);
                showPopupMessage('Error saving record!', true);
            } else {
                showPopupMessage('Entry Saved!');
                fetchEntries();
                setNewEntryFormData({
                    customer_name: '', comment: '', village: '', mobile: '', amount: '', year: '', month: '', paksha: '', tithi: '',
                });
                setNewEntryItems([{ itemType: '', itemName: '', weight: '' }]);
            }
        }
    };

    const handleCancelEdit = () => {
        setNewEntryFormData({ customer_name: '', comment: '', village: '', mobile: '', amount: '', year: '', month: '', paksha: '', tithi: '' });
        setNewEntryItems([{ itemType: '', itemName: '', weight: '' }]);
        setIsEditing(false);
        setEditId(null);
        setCurrentView('viewEntries');
    };

    const resetFilters = () => {
        setFilters({
            customerName: '',
            village: '',
            itemType: '',
            itemName: '',
            year: '',
            month: '',
            paksha: '',
            tithi: ''
        });
    };

    const handleViewMoreClick = (itemsArray) => {
        const itemsWithWeight = itemsArray.map(item => `${item.itemName} (${item.weight}g)`);
        setCurrentItemNamesAndWeights(itemsWithWeight);
        setShowItemDetails(true);
    };

    const handleOutsideClick = (event) => {
        if (modalRef.current && !modalRef.current.contains(event.target)) {
            setShowItemDetails(false);
        }
    };

    useEffect(() => {
        if (showItemDetails) {
            document.addEventListener('mousedown', handleOutsideClick);
        } else {
            document.removeEventListener('mousedown', handleOutsideClick);
        }

        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, [showItemDetails]);

    const renderHeader = () => (
        <header className="gradient-bg text-white p-4 shadow-lg">
            <div className="flex justify-between items-center relative">
                <div className="flex flex-col items-start">
                    <p className="text-xs text-gray-200 mb-1">Created by Shivang</p>
                    <div className="flex items-center space-x-2">
                        <i className="fas fa-gem text-2xl"></i>
                        <h1 className="text-xl font-bold">Jewelry Records</h1>
                    </div>
                </div>
                {isLoggedIn && (
                    <button
                        onClick={handleLogout}
                        className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105"
                    >
                        <i className="fas fa-sign-out-alt mr-2"></i>Logout
                    </button>
                )}
            </div>
        </header>
    );

    const renderLogin = () => (
        <div className="animate-fadeIn min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md transform transition-all duration-500">
                <button
                    onClick={() => window.open('https://ntqueprince.github.io/calculate/', '_blank')}
                    className="w-full mb-6 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-semibold transform hover:scale-105 transition-all duration-300 shadow-lg"
                >
                    Open Interest Calculator
                </button>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="text-center mb-8">
                        <i className="fas fa-gem text-6xl text-purple-600 mb-4"></i>
                        <h2 className="text-3xl font-bold text-gray-800">Welcome Back</h2>
                        <p className="text-gray-600 mt-2">Please sign in to continue</p>
                    </div>
                    <div className="relative">
                        <i className="fas fa-envelope absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                        <input
                            type="text"
                            name="email"
                            placeholder="Email"
                            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all duration-300"
                            required
                        />
                    </div>
                    <div className="relative">
                        <i className="fas fa-lock absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all duration-300"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-300 shadow-lg"
                    >
                        <i className="fas fa-sign-in-alt mr-2"></i>Login
                    </button>
                    <div className="flex justify-between text-sm">
                        <button
                            type="button"
                            onClick={() => setCurrentView('signup')}
                            className="text-purple-600 hover:text-purple-800 font-medium transition-colors duration-300"
                        >
                            Sign Up
                        </button>
                        <button
                            type="button"
                            onClick={() => setCurrentView('forgot')}
                            className="text-purple-600 hover:text-purple-800 font-medium transition-colors duration-300"
                        >
                            Forgot Password?
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    const renderSignup = () => (
        <div className="animate-fadeIn min-h-screen bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
                <div className="text-center mb-8">
                    <i className="fas fa-user-plus text-6xl text-green-600 mb-4"></i>
                    <h2 className="text-3xl font-bold text-gray-800">Create Account</h2>
                </div>
                <form onSubmit={handleSignUp} className="space-y-4">
                    <input type="email" name="email" placeholder="Email" className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-all duration-300" required/>
                    <input type="password" name="password" placeholder="Password" className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-all duration-300" required/>
                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white py-3 rounded-xl font-semibold hover:from-green-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-300"
                    >
                        Sign Up
                    </button>
                    <button
                        type="button"
                        onClick={() => setCurrentView('login')}
                        className="w-full text-gray-600 hover:text-gray-800 transition-colors duration-300"
                    >
                        Back to Login
                    </button>
                </form>
            </div>
        </div>
    );

    const renderForgotPassword = () => (
        <div className="animate-fadeIn min-h-screen bg-gradient-to-br from-orange-400 via-red-500 to-pink-500 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
                <div className="text-center mb-8">
                    <i className="fas fa-key text-6xl text-orange-600 mb-4"></i>
                    <h2 className="text-3xl font-bold text-gray-800">Reset Password</h2>
                </div>
                <form onSubmit={handleForgotPassword} className="space-y-4">
                    <input type="email" name="email" placeholder="Email" className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-all duration-300" required/>
                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-red-700 transform hover:scale-105 transition-all duration-300"
                    >
                        Reset Password
                    </button>
                    <button
                        type="button"
                        onClick={() => setCurrentView('login')}
                        className="w-full text-gray-600 hover:text-gray-800 transition-colors duration-300"
                    >
                        Back to Login
                    </button>
                </form>
            </div>
        </div>
    );

    const renderDashboard = () => (
        <div className="animate-fadeIn min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 p-4">
            {renderHeader()}
            <div className="max-w-4xl mx-auto mt-8">
                <div className="text-center mb-8">
                    <h2 className="text-4xl font-bold text-white mb-4">
                        <i className="fas fa-tachometer-alt mr-3"></i>Dashboard
                    </h2>
                    <p className="text-white text-lg">Manage your jewelry records efficiently</p>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                    <div
                        onClick={() => setCurrentView('newEntry')}
                        className="dashboard-card rounded-3xl p-8 text-white cursor-pointer transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-3xl"
                    >
                        <div className="text-center">
                            <i className="fas fa-plus-circle text-6xl mb-4"></i>
                            <h3 className="text-2xl font-bold mb-2">New Entry</h3>
                            <p className="text-lg opacity-90">Add new jewelry record</p>
                        </div>
                    </div>
                    <div
                        onClick={() => setCurrentView('viewEntries')}
                        className="dashboard-card rounded-3xl p-8 text-white cursor-pointer transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-3xl"
                    >
                        <div className="text-center">
                            <i className="fas fa-table text-6xl mb-4"></i>
                            <h3 className="text-2xl font-bold mb-2">View Entries</h3>
                            <p className="text-lg opacity-90">Browse existing records</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderNewEntry = () => (
        <div className="animate-fadeIn min-h-screen entry-form-bg">
            {renderHeader()}
            <div className="max-w-4xl mx-auto p-4">
                <div className="bg-white rounded-3xl shadow-2xl p-8 mt-6">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-3xl font-bold text-gray-800">
                            <i className="fas fa-plus-circle text-green-600 mr-3"></i>{isEditing ? 'Edit Record' : 'Add New Record'}
                        </h2>
                        <button
                            onClick={isEditing ? handleCancelEdit : () => setCurrentView('dashboard')}
                            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-all duration-300"
                        >
                            <i className="fas fa-arrow-left mr-2"></i>{isEditing ? 'Cancel' : 'Back'}
                        </button>
                    </div>

                    <div className="space-y-8">
                        <div className="customer-card rounded-2xl p-6 text-white">
                            <h3 className="text-2xl font-bold mb-6 flex items-center">
                                <i className="fas fa-user-circle mr-3"></i>Customer Details
                            </h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Name *</label>
                                    <input
                                        type="text"
                                        name="customer_name"
                                        value={newEntryFormData.customer_name}
                                        onChange={handleNewEntryChange}
                                        className="w-full p-3 rounded-lg text-gray-800 border-2 focus:border-blue-500 focus:outline-none transition-all duration-300"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Comment</label>
                                    <input
                                        type="text"
                                        name="comment"
                                        value={newEntryFormData.comment}
                                        onChange={handleNewEntryChange}
                                        className="w-full p-3 rounded-lg text-gray-800 border-2 focus:border-blue-500 focus:outline-none transition-all duration-300"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Village/City *</label>
                                    <input
                                        type="text"
                                        name="village"
                                        value={newEntryFormData.village}
                                        onChange={handleNewEntryChange}
                                        className="w-full p-3 rounded-lg text-gray-800 border-2 focus:border-blue-500 focus:outline-none transition-all duration-300"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Mobile Number</label>
                                    <input
                                        type="text"
                                        name="mobile"
                                        value={newEntryFormData.mobile}
                                        onChange={handleNewEntryChange}
                                        className="w-full p-3 rounded-lg text-gray-800 border-2 focus:border-blue-500 focus:outline-none transition-all duration-300"
                                    />
                                </div>
                            </div>
                        </div>

                        {newEntryItems.map((item, index) => (
                            <div key={index} className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-6 text-white relative">
                                <h3 className="text-2xl font-bold mb-6 flex items-center">
                                    <i className="fas fa-gem mr-3"></i>Item Details {newEntryItems.length > 1 && `(${index + 1})`}
                                </h3>
                                {newEntryItems.length > 1 && (
                                    <button
                                        onClick={() => handleRemoveItem(index)}
                                        className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-all duration-300 transform hover:scale-110"
                                    >
                                        <i className="fas fa-times"></i>
                                    </button>
                                )}
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Item Type</label>
                                        <select
                                            value={item.itemType}
                                            onChange={(e) => handleNewItemChange(index, 'itemType', e.target.value)}
                                            className="w-full p-3 rounded-lg text-gray-800 border-2 focus:border-yellow-500 focus:outline-none transition-all duration-300"
                                        >
                                            <option value="">Select Type</option>
                                            <option value="Gold">Gold</option>
                                            <option value="Silver">Silver</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Item Name *</label>
                                        <input
                                            type="text"
                                            placeholder="e.g., Chain, Ring, Payal"
                                            value={item.itemName}
                                            onChange={(e) => handleNewItemChange(index, 'itemName', e.target.value)}
                                            className="w-full p-3 rounded-lg text-gray-800 border-2 focus:border-yellow-500 focus:outline-none transition-all duration-300"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Weight (grams) *</label>
                                        <input
                                            type="number"
                                            value={item.weight}
                                            onChange={(e) => handleNewItemChange(index, 'weight', e.target.value)}
                                            className="w-full p-3 rounded-lg text-gray-800 border-2 focus:border-yellow-500 focus:outline-none transition-all duration-300"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}

                        <button
                            onClick={handleAddItem}
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-300 shadow-lg"
                        >
                            <i className="fas fa-plus mr-2"></i>Add More Item
                        </button>

                        <div className="bg-gradient-to-r from-purple-400 to-pink-500 rounded-2xl p-6 text-white">
                            <h3 className="text-2xl font-bold mb-6 flex items-center">
                                <i className="fas fa-rupee-sign mr-3"></i>Total Amount Given
                            </h3>
                            <div>
                                <label className="block text-sm font-medium mb-2">Amount (₹)</label>
                                <input
                                    type="number"
                                    name="amount"
                                    value={newEntryFormData.amount}
                                    onChange={handleNewEntryChange}
                                    className="w-full p-3 rounded-lg text-gray-800 border-2 focus:border-purple-500 focus:outline-none transition-all duration-300"
                                />
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-green-400 to-blue-500 rounded-2xl p-6 text-white">
                            <h3 className="text-2xl font-bold mb-6 flex items-center">
                                <i className="fas fa-calendar-alt mr-3"></i>Date Details *
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Year</label>
                                    <select
                                        name="year"
                                        value={newEntryFormData.year}
                                        onChange={handleNewEntryChange}
                                        className="w-full p-3 rounded-lg text-gray-800 border-2 focus:border-green-500 focus:outline-none transition-all duration-300"
                                        required
                                    >
                                        <option value="">Select Year</option>
                                        {years.map(year => <option key={year} value={year}>{year}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Month</label>
                                    <select
                                        name="month"
                                        value={newEntryFormData.month}
                                        onChange={handleNewEntryChange}
                                        className="w-full p-3 rounded-lg text-gray-800 border-2 focus:border-green-500 focus:outline-none transition-all duration-300"
                                        required
                                    >
                                        <option value="">Select Month / महीना चुनें</option>
                                        {months.map(month => <option key={month.en} value={month.en}>{month.en} / {month.hi}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Paksha</label>
                                    <select
                                        name="paksha"
                                        value={newEntryFormData.paksha}
                                        onChange={handleNewEntryChange}
                                        className="w-full p-3 rounded-lg text-gray-800 border-2 focus:border-green-500 focus:outline-none transition-all duration-300"
                                        required
                                    >
                                        <option value="">Select Paksha / पक्ष चुनें</option>
                                        {pakshas.map(paksha => <option key={paksha.en} value={paksha.en}>{paksha.en} / {paksha.hi}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Tithi</label>
                                    <select
                                        name="tithi"
                                        value={newEntryFormData.tithi}
                                        onChange={handleNewEntryChange}
                                        className="w-full p-3 rounded-lg text-gray-800 border-2 focus:border-green-500 focus:outline-none transition-all duration-300"
                                        required
                                    >
                                        <option value="">Select Tithi / तिथि चुनें</option>
                                        {tithis.map(tithi => <option key={tithi.en} value={tithi.en}>{tithi.en} / {tithi.hi}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleSaveEntry}
                            className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white py-4 rounded-xl text-xl font-bold hover:from-green-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-300 shadow-lg"
                        >
                            <i className="fas fa-save mr-3"></i>{isEditing ? 'Update Record' : 'Save Record'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderViewEntries = () => (
        <div className="animate-fadeIn min-h-screen bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-500">
            {renderHeader()}
            <div className="max-w-6xl mx-auto p-4">
                <div className="bg-white rounded-3xl shadow-2xl mt-6 overflow-hidden">
                    <div className="p-6 border-b">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-3xl font-bold text-gray-800 flex items-center">
                                <i className="fas fa-table text-indigo-600 mr-3"></i>Existing Records
                            </h2>
                            <button
                                onClick={() => setCurrentView('dashboard')}
                                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-all duration-300"
                            >
                                <i className="fas fa-arrow-left mr-2"></i>Back to Dashboard
                            </button>
                        </div>

                        <div className="filter-card rounded-2xl p-6 mb-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold text-gray-800 flex items-center">
                                    <i className="fas fa-filter text-pink-600 mr-2"></i>Filters
                                </h3>
                                <button
                                    onClick={resetFilters}
                                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm transition-all duration-300"
                                >
                                    <i className="fas fa-undo mr-1"></i>Reset
                                </button>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <input
                                    type="text"
                                    placeholder="Filter by Customer Name"
                                    value={filters.customerName}
                                    onChange={(e) => setFilters({...filters, customerName: e.target.value})}
                                    className="p-3 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:outline-none transition-all duration-300"
                                />
                                <input
                                    type="text"
                                    placeholder="Filter by Village/City"
                                    value={filters.village}
                                    onChange={(e) => setFilters({...filters, village: e.target.value})}
                                    className="p-3 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:outline-none transition-all duration-300"
                                />
                                <select
                                    value={filters.itemType}
                                    onChange={(e) => setFilters({...filters, itemType: e.target.value})}
                                    className="p-3 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:outline-none transition-all duration-300"
                                >
                                    <option value="">All Item Types</option>
                                    <option value="Gold">Gold</option>
                                    <option value="Silver">Silver</option>
                                </select>
                                <input
                                    type="text"
                                    placeholder="Filter by Item Name"
                                    value={filters.itemName}
                                    onChange={(e) => setFilters({...filters, itemName: e.target.value})}
                                    className="p-3 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:outline-none transition-all duration-300"
                                />
                                <select
                                    value={filters.year}
                                    onChange={(e) => setFilters({...filters, year: e.target.value})}
                                    className="p-3 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:outline-none transition-all duration-300"
                                >
                                    <option value="">All Years</option>
                                    {years.map(year => <option key={year} value={year}>{year}</option>)}
                                </select>
                                <select
                                    value={filters.month}
                                    onChange={(e) => setFilters({...filters, month: e.target.value})}
                                    className="p-3 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:outline-none transition-all duration-300"
                                >
                                    <option value="">All Months / सभी महीने</option>
                                    {months.map(month => <option key={month.en} value={month.en}>{month.en} / {month.hi}</option>)}
                                </select>
                                <select
                                    value={filters.paksha}
                                    onChange={(e) => setFilters({...filters, paksha: e.target.value})}
                                    className="p-3 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:outline-none transition-all duration-300"
                                >
                                    <option value="">All Paksha / सभी पक्ष</option>
                                    {pakshas.map(paksha => <option key={paksha.en} value={paksha.en}>{paksha.en} / {paksha.hi}</option>)}
                                </select>
                                <select
                                    value={filters.tithi}
                                    onChange={(e) => setFilters({...filters, tithi: e.target.value})}
                                    className="p-3 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:outline-none transition-all duration-300"
                                >
                                    <option value="">All Tithi / सभी तिथि</option>
                                    {tithis.map(tithi => <option key={tithi.en} value={tithi.en}>{tithi.en} / {tithi.hi}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="table-header text-white">
                                <tr>
                                    <th className="p-4 text-left">Customer</th>
                                    <th className="p-4 text-left">Village/City</th>
                                    <th className="p-4 text-left">Item Name</th>
                                    <th className="p-4 text-left">Weight (g)</th>
                                    <th className="p-4 text-left">Amount</th>
                                    <th className="p-4 text-left">Date</th>
                                    <th className="p-4 text-left">Item Type</th>
                                    <th className="p-4 text-left">Comment</th>
                                    <th className="p-4 text-left">Mobile</th>
                                    <th className="p-4 text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.map((item, index) => {
                                    const displayItems = item.items.slice(0, 2).map(i => i.itemName);
                                    const hasMoreItems = item.items.length > 2;

                                    const displayItemType = item.items.length > 1 && new Set(item.items.map(i => i.itemType)).size > 1
                                                            ? 'Mixed'
                                                            : item.items[0]?.itemType || '';

                                    let totalGoldWeight = 0;
                                    let totalSilverWeight = 0;
                                    item.items.forEach(singleItem => {
                                        const weight = parseFloat(singleItem.weight || 0);
                                        if (singleItem.itemType === 'Gold') {
                                            totalGoldWeight += weight;
                                        } else if (singleItem.itemType === 'Silver') {
                                            totalSilverWeight += weight;
                                        }
                                    });

                                    let weightDisplay = '';
                                    if (totalGoldWeight > 0 && totalSilverWeight > 0) {
                                        weightDisplay = `Gold: ${totalGoldWeight.toFixed(1)}g, Silver: ${totalSilverWeight.toFixed(1)}g`;
                                    } else if (totalGoldWeight > 0) {
                                        weightDisplay = `${totalGoldWeight.toFixed(1)}g`;
                                    } else if (totalSilverWeight > 0) {
                                        weightDisplay = `${totalSilverWeight.toFixed(1)}g`;
                                    }

                                    return (
                                        <tr key={index} className="border-b hover:bg-gray-50 transition-colors duration-200">
                                            <td className="p-4">
                                                <div className="font-semibold text-purple-700">{item.customer_name}</div>
                                            </td>
                                            <td className="p-4">
                                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-lg text-sm font-medium">
                                                    {item.village}
                                                </span>
                                            </td>
                                            <td className="p-4 font-medium text-gray-800">
                                                {displayItems.join(', ')}
                                                {hasMoreItems && (
                                                    <button
                                                        onClick={() => handleViewMoreClick(item.items)}
                                                        className="text-blue-500 hover:text-blue-700 ml-2 font-semibold"
                                                    >
                                                        ...view more
                                                    </button>
                                                )}
                                            </td>
                                            <td className="p-4 font-semibold text-green-600">{weightDisplay}</td>
                                            <td className="p-4 font-semibold text-purple-600">₹{item.amount.toLocaleString()}</td>
                                            <td className="p-4">
                                                <div className="text-sm">
                                                    <div className="font-semibold">{item.year} {item.month}</div>
                                                    <div className="text-gray-600">{item.paksha} {item.tithi}</div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-3 py-1 rounded-full text-sm font-bold
                                                    ${displayItemType === 'Gold' ? 'item-badge-gold' :
                                                    (displayItemType === 'Silver' ? 'item-badge-silver' : 'item-badge-mixed')}`}>
                                                    {displayItemType}
                                                </span>
                                            </td>
                                            <td className="p-4 text-gray-600">{item.comment}</td>
                                            <td className="p-4 text-gray-600">{item.mobile}</td>
                                            <td className="p-4">
                                                <button
                                                    onClick={() => startEdit(item)}
                                                    className="text-indigo-600 hover:text-indigo-900 mr-2"
                                                >
                                                    <i className="fas fa-edit"></i> Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    <i className="fas fa-trash-alt"></i> Delete
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        {filteredData.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                <i className="fas fa-search text-4xl mb-4"></i>
                                <p className="text-lg">No records match your filter criteria</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderItemDetailsModal = () => (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
            <div ref={modalRef} className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md transform transition-all duration-300">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-800">Item Details</h3>
                    <button onClick={() => setShowItemDetails(false)} className="text-gray-500 hover:text-gray-800">
                        <i className="fas fa-times text-2xl"></i>
                    </button>
                </div>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                    {currentItemNamesAndWeights.map((item, index) => (
                        <li key={index} className="bg-gray-100 p-2 rounded-lg">{item}</li>
                    ))}
                </ul>
            </div>
        </div>
    );

    return (
        <div>
            {currentView === 'login' && renderLogin()}
            {currentView === 'signup' && renderSignup()}
            {currentView === 'forgot' && renderForgotPassword()}
            {currentView === 'dashboard' && renderDashboard()}
            {currentView === 'newEntry' && renderNewEntry()}
            {currentView === 'viewEntries' && renderViewEntries()}

            {showPopup && (
                <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slideIn">
                    <i className="fas fa-check-circle mr-2"></i>
                    {popupMessage}
                </div>
            )}

            {showItemDetails && renderItemDetailsModal()}
        </div>
    );
}

ReactDOM.render(<App />, document.getElementById('root'));
