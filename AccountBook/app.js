var budgetController = (function() {
	var Expense = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
		this.percentage = -1;
	};

	Expense.prototype.calcPercentage = function(totalIncome) {
		if (totalIncome > 0) {
			this.percentage = Math.round((this.value / totalIncome) * 100);
		} else {
			this.percentage = -1;
		}
	};

	Expense.prototype.getPercentage = function() {
		return this.percentage;
	};

	var Income = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
	};
	var calculateTotal = function(type) {
		var sum = 0;
		data.allItems[type].forEach(function(current) {
			sum += current.value;
		});
		data.totals[type] = sum;
	};
	var data = {
		allItems: {
			expense: [],
			income: []
		},
		totals: {
			expense: 0,
			income: 0
		},
		budget: 0,
		percentage: -1
	};


	return {
		addNewItem: function(type, desc, val) {
			var newItem, ID;

			if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

			// 新しい項目を作る
			if (type === 'expense') {
                newItem = new Expense(ID, desc, val);
            } else if (type === 'income') {
                newItem = new Income(ID, desc, val);
            }

			// 項目リストに新しい項目を追加
			data.allItems[type].push(newItem);
			return newItem;
		}, 
		deleteItem: function(type, id) {
			var ids, index;

			ids = data.allItems[type].map(function(current) {
				return current.id;
			});

			index = ids.indexOf(id);

			if (index !== -1) {
				data.allItems[type].splice(index, 1);
			}
		},
		calculateBudget: function() {
			// 収入と支出の合計値をそれぞれ計算
			calculateTotal('expense');
			calculateTotal('income');

			// 予算の合計値を算出
			data.budget = data.totals.income - data.totals.expense;

			// 支出の割合を算出
			if (data.totals.income > 0) {
				data.percentage = Math.round((data.totals.expense / data.totals.income) * 100);
			} else {
				data.percentage = -1;
			}
		},
		getBudget: function() {
			return {
				budget: data.budget,
				totalIncome: data.totals.income,
				totalExpense: data.totals.expense,
				percentage: data.percentage
			};
		},
		calculatePercentages: function() {
			// 全てのexpenseインスタンスにpercentageを格納
			data.allItems.expense.forEach(function(current) {
				current.calcPercentage(data.totals.income);
			});
		},
		getPercentages: function() {
			// 全てのexpenseインスタンスのpercentageを配列で返す
			var allPercentages = data.allItems.expense.map(function(current) {
				return current.getPercentage();
			});
			return allPercentages;
		},
		testing: function() {
			console.log(data);
		}
	};

})();

var UIcontroller = (function() {
	var DOMstrings = {
		inputType: '.add__type',
		inputDescription: '.add__description',
		inputValue: '.add__value',
		inputBtn: '.add__btn',
		incomeContainer: '.income__list',
		expenseContainer: '.expenses__list',
		budgetLabel: '.budget__value',
		incomeLabel: '.budget__income--value',
		expensesLabel: '.budget__expenses--value',
		percentageLabel: '.budget__expenses--percentage',
		container: '.container',
		expensesPercentageLabel: '.item__percentage',
		dateLabel: '.budget__title--month'
	};

	var formatNumber = function(num, type) {
		var numSplit, integerPart, decimalPart;
		num = Math.abs(num);
		num = num.toFixed(2);

		numSplit = num.split('.');

		integerPart = numSplit[0];
		if(integerPart.length > 3) {
			integerPart = integerPart.substr(0, integerPart.length - 3) + ',' + integerPart.substr(integerPart.length - 3, 3);
		}

		decimalPart = numSplit[1];

		type === 'expense' ? type = '-' : type = '+';

		return type + ' ' + integerPart + '.' + decimalPart;
	};

	var nodeListForEach = function(list, callback) {
		for(i = 0; i < list.length; i ++) {
			callback(list[i], i);
		}
	};

	return {
		getInput: function() {
			return {
				type: document.querySelector(DOMstrings.inputType).value,
				description: document.querySelector(DOMstrings.inputDescription).value,
				value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
			}
		},
		addListItem: function(obj, type) {
			var html, newHTML, element;

			// Create HTML string with placeholder text
			if (type === 'income') {
				element = DOMstrings.incomeContainer;
				html = '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			} else if (type === 'expense') {
				element = DOMstrings.expenseContainer;
				html = '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			}

			// Replace the placeholder text with some actual data
			newHtml = html.replace('%id%', obj.id);
			newHtml = newHtml.replace('%description%', obj.description);
			newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

			// Insert the HTML into the DOM
			document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
		},
		deleteListItem: function(selectedID) {
			var el;
			el = document.getElementById(selectedID);
			el.parentNode.removeChild(el);
		},
		clearFields: function() {
			var fields, fieldsArr;
			fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
			fieldsArr = Array.prototype.slice.call(fields);
			fieldsArr.forEach(function(current, index, array) {
				current.value = '';
			});
			fieldsArr[0].focus();
		},
		displayBudget: function(obj) {
			var type;
			obj.budget > 0 ? type = 'income' : type = 'expense';
			document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
			document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalIncome, 'income');
			document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExpense, 'expense');
			if (obj.percentage > 0) {
				document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
			} else {
				document.querySelector(DOMstrings.percentageLabel).textContent = '---';
			}
		},
		displayPercentage: function(percentages) {
			var fields = document.querySelectorAll(DOMstrings.expensesPercentageLabel);

			nodeListForEach(fields, function(current, index) {
				if(percentages[index] > 0) {
					current.textContent = percentages[index] + '%';
				} else {
					current.textContent = '---';
				}
			});
		},
		displayMonth: function(){
			var now, year, month, months;
			now = new Date();
			year = now.getFullYear();
			month = now.getMonth();
			months = ['January', 'Feb', 'May', 'Apr', 'Mar', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

			document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
		},
		changeType: function() {
			var fields = document.querySelectorAll(
				DOMstrings.inputType + ',' + 
				DOMstrings.inputDescription + ',' + 
				DOMstrings.inputValue
			);

			nodeListForEach(fields, function(current) {
				current.classList.toggle('red-focus');
			});

			document.querySelector(DOMstrings.inputBtn).classList.toggle('red');

		},

		getDOMstrings: function() {
			return DOMstrings;
		}
	};
})();



var controller = (function(budgetCtrl, UICtrl) {
	var setupEventListeners = function() {
		var DOM = UICtrl.getDOMstrings();
		document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

		document.addEventListener('keypress', function(e) {
			if(e.keyCode === 13 || e.which === 13) {
				ctrlAddItem();
			}
		});

		document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

		document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType);
	}

	var updateBudget = function() {
		// 1.budgetを計算する
		budgetCtrl.calculateBudget();

		// 2.budgetの項目を受け取る
		var budgetItems = budgetCtrl.getBudget();

		// 3.budgetの合計値を表示する
		UICtrl.displayBudget(budgetItems);
	};

	var updatePercentage = function(){
		// 1. データ構造を書き換える
		budgetCtrl.calculatePercentages();

		// 2. percentageを受け取る
		var percentages = budgetCtrl.getPercentages();

		// 3. UIに表示する
		UICtrl.displayPercentage(percentages);
	};

	var ctrlAddItem = function() {
		var input, newItem;
		// 1.インプットデータを読み込む
		input = UICtrl.getInput();

		if (input.description !== '' && !isNaN(input.value) && input.value > 0) {
			// 2.budgetコントローラーにデータを渡す
			newItem = budgetCtrl.addNewItem(input.type, input.description, input.value);

			// 3.予算リストに表示させる
			UICtrl.addListItem(newItem, input.type);

			UICtrl.clearFields();
		}
		// budgetを更新する
		updateBudget();

		// 個々のpercentageを更新する
		updatePercentage();
	};

	var ctrlDeleteItem = function(event) {
		var itemID, splitID, type, ID;
		itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

		if (itemID) {
			splitID = itemID.split('-');
			type = splitID[0];
			ID = parseInt(splitID[1]);

			// データ構造から項目を削除する
			budgetCtrl.deleteItem(type, ID);

			// UIから項目を削除する
			UICtrl.deleteListItem(itemID);

			// budgetを更新する
			updateBudget();

			// 個々のpercentageを更新する
			updatePercentage();
		}
	};

	return {
		init: function() {
			console.log('application is started.');
			UICtrl.displayBudget({
				budget: 0,
				totalIncome: 0,
				totalExpense: 0,
				percentage: -1
			});
			setupEventListeners();

			UICtrl.displayMonth();
		}
	};
})(budgetController, UIcontroller);

controller.init();






