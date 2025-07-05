<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Prince Interest Calculator</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        * {
            font-family: 'Inter', sans-serif;
        }
        
        .gradient-bg {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        
        .card {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }
        
        .gradient-btn {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            transition: all 0.3s ease;
        }
        
        .gradient-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(102, 126, 234, 0.4);
        }
        
        .input-field {
            border: 2px solid #e5e7eb;
            border-radius: 12px;
            padding: 16px;
            font-size: 16px;
            transition: all 0.3s ease;
            background: white;
        }
        
        .input-field:focus {
            border-color: #667eea;
            outline: none;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        
        .radio-option {
            background: white;
            border: 2px solid #e5e7eb;
            border-radius: 12px;
            padding: 16px;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .radio-option:hover {
            border-color: #667eea;
        }
        
        .radio-option.selected {
            border-color: #667eea;
            background: rgba(102, 126, 234, 0.1);
        }
        
        .result-box {
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            border-radius: 16px;
            padding: 20px;
            margin-top: 20px;
        }
        
        .breakdown-item {
            background: white;
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 8px;
            border-left: 4px solid #667eea;
        }
        
        .error-message {
            color: #ef4444;
            font-size: 14px;
            margin-top: 4px;
        }
        
        @media (max-width: 480px) {
            .card {
                margin: 10px;
                border-radius: 16px;
            }
        }
    </style>
</head>
<body class="gradient-bg">
    <div class="min-h-screen flex items-center justify-center p-4">
        <div class="w-full max-w-md">
            <div class="card p-6">
                <div class="text-center mb-6">
                    <h1 class="text-2xl font-bold text-gray-800 mb-2">
                        <i class="fas fa-calculator text-purple-600 mr-2"></i>
                        Prince Interest Calculator
                    </h1>
                    <p class="text-gray-600 text-sm">Calculate interest with monthly rates</p>
                </div>
                
                <form id="calculatorForm">
                    <!-- Principal Amount -->
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            <i class="fas fa-rupee-sign text-purple-600 mr-1"></i>
                            Principal Amount (₹)
                        </label>
                        <input type="number" id="principal" class="input-field w-full" placeholder="Enter principal amount" min="1" required>
                        <div id="principalError" class="error-message hidden"></div>
                    </div>
                    
                    <!-- Time Period -->
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            <i class="fas fa-clock text-purple-600 mr-1"></i>
                            Time Period
                        </label>
                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <input type="number" id="years" class="input-field w-full" placeholder="Years" min="0" max="50" required>
                                <div class="text-xs text-gray-500 mt-1">Years</div>
                            </div>
                            <div>
                                <input type="number" id="months" class="input-field w-full" placeholder="Months" min="0" max="11">
                                <div class="text-xs text-gray-500 mt-1">Additional Months</div>
                            </div>
                        </div>
                        <div id="timeError" class="error-message hidden"></div>
                    </div>
                    
                    <!-- Interest Rate -->
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            <i class="fas fa-percentage text-purple-600 mr-1"></i>
                            Monthly Interest Rate
                        </label>
                        <select id="interestRate" class="input-field w-full" required>
                            <option value="">Select monthly interest rate</option>
                        </select>
                        <div id="rateError" class="error-message hidden"></div>
                    </div>
                    
                    <!-- Calculation Mode -->
                    <div class="mb-6">
                        <label class="block text-sm font-medium text-gray-700 mb-3">
                            <i class="fas fa-cogs text-purple-600 mr-1"></i>
                            Calculation Mode
                        </label>
                        <div class="space-y-3">
                            <div class="radio-option" onclick="selectMode('simple')">
                                <input type="radio" id="simple" name="calculationMode" value="simple" class="sr-only">
                                <div class="flex items-center">
                                    <div class="radio-indicator mr-3"></div>
                                    <div>
                                        <div class="font-medium text-gray-800">Simple Interest</div>
                                        <div class="text-sm text-gray-500">Standard simple interest calculation</div>
                                    </div>
                                </div>
                            </div>
                            <div class="radio-option" onclick="selectMode('custom')">
                                <input type="radio" id="custom" name="calculationMode" value="custom" class="sr-only">
                                <div class="flex items-center">
                                    <div class="radio-indicator mr-3"></div>
                                    <div>
                                        <div class="font-medium text-gray-800">Custom Step-Wise Interest</div>
                                        <div class="text-sm text-gray-500">Compounding yearly with monthly rate</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div id="modeError" class="error-message hidden"></div>
                    </div>
                    
                    <!-- Calculate Button -->
                    <button type="submit" class="gradient-btn w-full text-white font-semibold py-4 px-6 rounded-xl">
                        <i class="fas fa-calculator mr-2"></i>
                        Calculate Interest
                    </button>
                </form>
                
                <!-- Results -->
                <div id="results" class="hidden">
                    <div class="result-box">
                        <h3 class="text-lg font-semibold text-gray-800 mb-4">
                            <i class="fas fa-chart-line text-purple-600 mr-2"></i>
                            Calculation Results
                        </h3>
                        <div id="resultContent"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <script>
        // Initialize interest rate dropdown
        function initializeRateDropdown() {
            const rateSelect = document.getElementById('interestRate');
            for (let i = 0; i <= 10; i += 0.5) {
                const option = document.createElement('option');
                option.value = i;
                option.textContent = `${i}% monthly`;
                rateSelect.appendChild(option);
            }
        }
        
        // Select calculation mode
        function selectMode(mode) {
            document.querySelectorAll('.radio-option').forEach(option => {
                option.classList.remove('selected');
            });
            document.querySelector(`#${mode}`).parentElement.classList.add('selected');
            document.querySelector(`#${mode}`).checked = true;
            
            // Add visual indicator
            document.querySelectorAll('.radio-indicator').forEach(indicator => {
                indicator.innerHTML = '<div class="w-4 h-4 border-2 border-gray-300 rounded-full"></div>';
            });
            document.querySelector(`#${mode}`).parentElement.querySelector('.radio-indicator').innerHTML = 
                '<div class="w-4 h-4 bg-purple-600 rounded-full flex items-center justify-center"><i class="fas fa-check text-white text-xs"></i></div>';
        }
        
        // Validate inputs
        function validateInputs() {
            let isValid = true;
            
            // Clear previous errors
            document.querySelectorAll('.error-message').forEach(error => {
                error.classList.add('hidden');
            });
            
            // Validate principal
            const principal = parseFloat(document.getElementById('principal').value);
            if (!principal || principal <= 0) {
                document.getElementById('principalError').textContent = 'Please enter a valid principal amount';
                document.getElementById('principalError').classList.remove('hidden');
                isValid = false;
            }
            
            // Validate time period
            const years = parseInt(document.getElementById('years').value) || 0;
            const months = parseInt(document.getElementById('months').value) || 0;
            if (years === 0 && months === 0) {
                document.getElementById('timeError').textContent = 'Please enter at least some time period';
                document.getElementById('timeError').classList.remove('hidden');
                isValid = false;
            }
            
            // Validate interest rate
            const rate = parseFloat(document.getElementById('interestRate').value);
            if (rate === '' || rate < 0) {
                document.getElementById('rateError').textContent = 'Please select an interest rate';
                document.getElementById('rateError').classList.remove('hidden');
                isValid = false;
            }
            
            // Validate calculation mode
            const mode = document.querySelector('input[name="calculationMode"]:checked');
            if (!mode) {
                document.getElementById('modeError').textContent = 'Please select a calculation mode';
                document.getElementById('modeError').classList.remove('hidden');
                isValid = false;
            }
            
            return isValid;
        }
        
        // Calculate simple interest
        function calculateSimpleInterest(principal, rate, years, months) {
            const totalMonths = years * 12 + months;
            const interest = (principal * rate * totalMonths) / 100;
            return {
                interest: interest,
                finalAmount: principal + interest,
                breakdown: [`Total Interest for ${years} years ${months} months: ₹${interest.toFixed(2)}`]
            };
        }
        
        // Calculate custom step-wise interest
        function calculateCustomInterest(principal, rate, years, months) {
            let currentPrincipal = principal;
            let totalInterest = 0;
            let breakdown = [];
            
            // Calculate for each complete year
            for (let year = 1; year <= years; year++) {
                const yearlyInterest = (currentPrincipal * rate * 12) / 100;
                totalInterest += yearlyInterest;
                breakdown.push(`Year ${year}: ₹${yearlyInterest.toFixed(2)} (Base: ₹${currentPrincipal.toFixed(2)})`);
                currentPrincipal += yearlyInterest;
            }
            
            // Calculate for remaining months
            if (months > 0) {
                const monthlyInterest = (currentPrincipal * rate * months) / 100;
                totalInterest += monthlyInterest;
                breakdown.push(`Extra ${months} months: ₹${monthlyInterest.toFixed(2)} (Base: ₹${currentPrincipal.toFixed(2)})`);
            }
            
            return {
                interest: totalInterest,
                finalAmount: principal + totalInterest,
                breakdown: breakdown
            };
        }
        
        // Display results
        function displayResults(result, principal, rate, years, months, mode) {
            const resultContent = document.getElementById('resultContent');
            
            let html = `
                <div class="breakdown-item">
                    <div class="flex justify-between items-center mb-2">
                        <span class="font-medium text-gray-700">Principal Amount:</span>
                        <span class="font-bold text-gray-800">₹${principal.toFixed(2)}</span>
                    </div>
                    <div class="flex justify-between items-center mb-2">
                        <span class="font-medium text-gray-700">Time Period:</span>
                        <span class="font-bold text-gray-800">${years} years ${months} months</span>
                    </div>
                    <div class="flex justify-between items-center mb-2">
                        <span class="font-medium text-gray-700">Monthly Interest Rate:</span>
                        <span class="font-bold text-gray-800">${rate}%</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="font-medium text-gray-700">Calculation Mode:</span>
                        <span class="font-bold text-gray-800">${mode === 'simple' ? 'Simple Interest' : 'Custom Step-Wise'}</span>
                    </div>
                </div>
            `;
            
            if (result.breakdown.length > 1) {
                html += '<div class="mt-4 mb-4"><h4 class="font-semibold text-gray-700 mb-2">Breakdown:</h4>';
                result.breakdown.forEach(item => {
                    html += `<div class="breakdown-item text-sm">${item}</div>`;
                });
                html += '</div>';
            }
            
            html += `
                <div class="breakdown-item bg-gradient-to-r from-purple-100 to-blue-100 border-l-4 border-purple-600">
                    <div class="flex justify-between items-center mb-2">
                        <span class="font-medium text-gray-700">Total Interest:</span>
                        <span class="font-bold text-purple-600 text-lg">₹${result.interest.toFixed(2)}</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="font-medium text-gray-700">Final Amount:</span>
                        <span class="font-bold text-purple-600 text-xl">₹${result.finalAmount.toFixed(2)}</span>
                    </div>
                </div>
            `;
            
            resultContent.innerHTML = html;
            document.getElementById('results').classList.remove('hidden');
            
            // Scroll to results
            document.getElementById('results').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        
        // Handle form submission
        document.getElementById('calculatorForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (!validateInputs()) {
                return;
            }
            
            const principal = parseFloat(document.getElementById('principal').value);
            const years = parseInt(document.getElementById('years').value) || 0;
            const months = parseInt(document.getElementById('months').value) || 0;
            const rate = parseFloat(document.getElementById('interestRate').value);
            const mode = document.querySelector('input[name="calculationMode"]:checked').value;
            
            let result;
            if (mode === 'simple') {
                result = calculateSimpleInterest(principal, rate, years, months);
            } else {
                result = calculateCustomInterest(principal, rate, years, months);
            }
            
            displayResults(result, principal, rate, years, months, mode);
        });
        
        // Initialize radio indicators
        document.querySelectorAll('.radio-indicator').forEach(indicator => {
            indicator.innerHTML = '<div class="w-4 h-4 border-2 border-gray-300 rounded-full"></div>';
        });
        
        // Initialize the app
        initializeRateDropdown();
        
        // Set default values for testing
        document.getElementById('principal').value = '1000';
        document.getElementById('years').value = '2';
        document.getElementById('months').value = '6';
        document.getElementById('interestRate').value = '3';
        selectMode('custom');
    </script>
</body>
</html>
