//Budget controller or Data Module. Add new item to data structure and calculate budget
const budgetControlller = (function(){
    //variables to store all expense & income items & calculate expenses and incomes
    const data = {
        allItems:{
            exp: [],
            inc: []
        },
        totals:{
            exp:0,
            inc:0
        },
        budget: 0,
        percentage: -1
    };
    //function constructor to initialize the expense item with id, description and value
    const Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    //function constructor to initialize the expense item with id, description and value
    const Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };
    //prototype of expense object for calculating percentage of each individual expense
    Expense.prototype.calcPercentage = function(totalIncome){
        //if total income exists, calculate percentage
        if(totalIncome > 0){
            this.percentage = Math.round((this.value / totalIncome) * 100);
        }else{
            this.percentage = -1;
        }
    };
    //prototype of expense object for returning the percentage of each individual expense
    Expense.prototype.getPercentage = function(){
        return this.percentage;
    };
    //private function to calculate total
    const calculateTotal = function(type){
        let sum = 0;
        //accessing all the objects in data.allItems.exp or data.allItems.inc 
        data.allItems[type].forEach(function(current){
            sum += current.value;
        });
        //store the total to data.totals.exp or data.totals.inc 
        data.totals[type] = sum;
    };
    //public methods to add items to the expense and income list
    return{
        //method to add new item based on type=income or expense
        addItem: function(typ, descrp, val){
            let newItem, ID;
            //creating the unique id number of the item by first retrieving the last id number of any item and then add 1
            //example: ID = data.allItems['exp'][5-1].id + 1
            if(data.allItems[typ].length > 0){
                ID = data.allItems[typ][data.allItems[typ].length-1].id + 1;
            }else{
                ID = 0;
            }
            if(typ === 'exp'){
                newItem = new Expense(ID, descrp, val);
            }else if(typ === 'inc'){
                newItem = new Income(ID, descrp, val);
            }
            //pushing the new item to the array 'exp' or 'inc'
            data.allItems[typ].push(newItem);
            //return newItem to the other module in case it needs
            return newItem
        },
        //calculate the total income, expenses, budget and percentage
        calculateBudget: function(){
            //calculate total income
            calculateTotal('inc');
            //calculate total expenses
            calculateTotal('exp');
            //calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;
            //calculate the percentage of income that we spent
            if(data.totals.inc > 0){
                //if income is positive
                data.percentage = Math.floor((data.totals.exp / data.totals.inc)*100);
            }else{
                data.percentage = -1;
            }
            
        },
        //return the total income, expenses, budget and percentage
        getBudget: function(){
            return{
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },
        //delete the budget income or expense list item from the data
        deleteItem: function(type, id){
            let ids, index;
            
            //data.alltimes[type][id];
            //[1, 2, 6, 9]
            ids = data.allItems[type].map(function(current){
                //return the id of the current element
                return current.id;
            });
            index = ids.indexOf(id);
            if(index !== -1){
                data.allItems[type].splice(index, 1);  
            }

        },
        //calculate percentages of each expenses
        calculatePercentages: function(){
            //calling the calcPercentage prototype method for each of the expense object
            data.allItems.exp.forEach(function(current){
                current.calcPercentage(data.totals.inc);
            });
        },
        //return all the percentages of each individual expenses 
        getPercentages: function(){
            //mapping each individual expense item
            let allPercentages = data.allItems.exp.map(function(current){
                return current.getPercentage();
            });
            //array of all the percentages
            return allPercentages;
        }
    }
})();



//UI controller
const UIController = (function(){
    //string object of the input field 
    let DOMStrings ={
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabbel: '.budget__value',
        incomeLabel: '.budget__income--value',
        ExpensesLabel: '.budget__expenses--value',
        ExpensesPercentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensePercentageLabel: '.item__percentage',
        monthLabel: '.budget__title--month'
    };
    //format number example: 23500 => + or -23,500.00
    var formatNumber = function(num, type){
        let numSplit, intPart, decPart;
        num = Math.abs(num);         //num = 23500
        num = num.toFixed(2);        //num = 23500.00
        numSplit = num.split('.');   //numSplit = [23500, 00]
        intPart = numSplit[0];       //intPart = [23500]
        decPart = numSplit[1];       //decPart = [00]
        if(intPart.length > 3){
            //intPart = 23500
            //intPart = 23,500
            intPart = intPart.substr(0, intPart.length - 3) + ',' + intPart.substr(intPart.length-3, 3);
        }
        //intPart = +23,500.00 or intPart = -23,500.00 or intPart = +500.00
        type === 'inc'? intPart = `+${intPart}.${decPart}` : intPart = `-${intPart}.${decPart}`;
        return intPart;
    };
    //loop through each list item and execute the callBack function for each list item
    var nodeListForEach = function(list, callBack){
        for(let i = 0; i<list.length; i++){
            //call the function for every element of the list 
            callBack(list[i], i);
        }
    };
    //public methods
    return{
        //return the value of the input field
        getInput: function(){
            return{
                type: document.querySelector(DOMStrings.inputType).value,  //return inc or exp
                description: document.querySelector(DOMStrings.inputDescription).value, //description input field
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value) //value input field 
            }
        },
        //return the DOMStrings
        getDOMStrings: function(){
            return DOMStrings;
        },
        //add the new list item to the UI
        addNewLIstItem: function(object, type){
            let html, element, newHtml;
            //if it is income or expense
            if(type === 'inc'){
                //position the element after class 'income__list'
                element = DOMStrings.incomeContainer;
                //HTML text
                html = `<div class="item clearfix" id="inc-%id%">
                            <div class="item__description">%description%</div>
                            <div class="right clearfix">
                                <div class="item__value">%value%</div>
                                <div class="item__delete">
                                    <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                                </div>
                            </div>
                        </div>`;
            }else if(type === 'exp'){
                //position the element after class 'expenses__list'
                element = DOMStrings.expensesContainer;
                //HTML text
                html = `<div class="item clearfix" id="exp-%id%">
                            <div class="item__description">%description%</div>
                            <div class="right clearfix">
                                <div class="item__value">%value%</div>
                                <div class="item__percentage">21%</div>
                                <div class="item__delete">
                                    <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                                </div>
                            </div>
                        </div>`;
            }
            //appends the 'id', 'description', 'value' of the html
            newHtml = html.replace('%id%', object.id);
            newHtml = newHtml.replace('%description%', object.description);
            newHtml = newHtml.replace('%value%', formatNumber(object.value, type));
            //insert the HTML text inside the element after its first child 
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },
        //delete the selected list item
        deleteListItem : function(selectorId){
            let el;
            //el = <div class="income__list">  or <div class="expenses__list">
            el = document.getElementById(selectorId);
            el.parentNode.removeChild(el);
        },
        //clear the input field
        clearInputFiled: function(){
            let fields, arrfileds;
            //select the input description and input value field
            fields = document.querySelectorAll(DOMStrings.inputDescription + ',' + DOMStrings.inputValue);
            //convert the node fields into an array
            //arrfileds = Array.prototype.slice.call(fields);
            arrfileds = Array.from(fields);
            //accessing each element of the arrfields 
            arrfileds.forEach(function(current, index, array){
                current.value = "";
            });
            arrfileds[0].focus();
        },
        //display the updated budget
        displayBudget: function(budgetObject){
            let type  //either it is income or expense
            budgetObject.budget > 0 ? type = 'inc' : type = 'exp';
            document.querySelector(DOMStrings.budgetLabbel).textContent = formatNumber(budgetObject.budget, type);
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(budgetObject.totalInc, 'inc');
            document.querySelector(DOMStrings.ExpensesLabel).textContent = formatNumber(budgetObject.totalExp, 'exp');
            //checking the percentage is greater than zero
            if(budgetObject.percentage > 0){
                document.querySelector(DOMStrings.ExpensesPercentageLabel).textContent = budgetObject.percentage + '%';
            }else{
                document.querySelector(DOMStrings.ExpensesPercentageLabel).textContent = '---';
            }
        },
        //display the percentage of each individual expense item 
        displayPercentages: function(allPercentages){
            //fields =  [<div class="item__percentage">21%</div>,  <div class="item__percentage">21%</div>] 
            let fields = document.querySelectorAll(DOMStrings.expensePercentageLabel);
            //calling the nodelistForEach function and pass the fields
            nodeListForEach(fields, function(current, index){
                if(allPercentages[index] > 0){
                    current.textContent = allPercentages[index] + '%';
                }else{
                    current.textContent = '---';
                }
            });
            
        },
        //display the current month and year
        displayTime : function(){
            let date, month, year, months;
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            date = new Date();
            month = date.getMonth();
            year = date.getFullYear();
            document.querySelector(DOMStrings.monthLabel).textContent = `${months[month]} ${year}`;
        },
        //toggle the red-focus and red class when the input field of the income and expense type changes
        changeType : function(){
            //fields = [class="add__type", class="add__value", class="add__description"]
            let fields = document.querySelectorAll(
                DOMStrings.inputType + ',' +
                DOMStrings.inputValue + ',' +
                DOMStrings.inputDescription);
            //accessing each element of fields 
            nodeListForEach(fields, function(current){
                //toggle the '.red-focus' class for each fields item
                current.classList.toggle('red-focus');
            });
            //select class '.add__btn' and toggle the '.red' class
            document.querySelector(DOMStrings.inputBtn).classList.toggle('red');
        }
    }
})();

//Global App Controller. All the eventlistner is included here
const controller = (function(budgetCtrl, UICtrl){
    //setting up all the event listener
    const setUpEventListener = function(){
        //the DOM selector objects from UI Control
        let DOM = UICtrl.getDOMStrings();
        //click event of the .add__btn 
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
        //click event of the enter key
        document.onkeypress = function(event){
            if(event.keyCode === 13 || event.which === 13){
                ctrlAddItem();
            }
        }
        //capturing the click event on the container where the income and expenses list exist
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        //capturing the change event of the input field of income and expense type
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType);
    }
    //function for calculating each percentages of the expenses in terms of income
    const updatePercentages = function(){
        //calculate the percentage
        budgetCtrl.calculatePercentages();
        //Read percentage from the budget controller
        let allPercentages = budgetCtrl.getPercentages();
        //update the UI with the new percentage
        UICtrl.displayPercentages(allPercentages);
    }
    const updateBudget = function(){
        let budgetObject;
        //calculate the budget
        budgetCtrl.calculateBudget()
        //return the budget
        budgetObject =  budgetCtrl.getBudget();
        //Display the budget on UI
        UICtrl.displayBudget(budgetObject);
    }

    const ctrlAddItem = function(){
        let input, newItem;
        //Get the field input data
        input = UICtrl.getInput();
        //if the input description is not empty & input value is not null and greater than zero
        if(input.description !=='' && !isNaN(input.value) && input.value > 0){
            //Add the item to the budgetController
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);
            //Add the item to the UI
            UICtrl.addNewLIstItem(newItem, input.type);
            //clear the input field after adding the new item
            UICtrl.clearInputFiled();
            //calculate and update the budget
            updateBudget();
            //calculate and update percentage of the individual expenses
            updatePercentages();
        }
    } 
    //capturing the click event of the delete icon on the income and expense list
    const ctrlDeleteItem = function(event){
        let itemId, splitId, type, id;
        //(div class="item clearfix" id="inc-0").id  or (div class="item clearfix" id="exp-0").id
        itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if(itemId){
            //[inc, 0] or [exp, 0]
            splitId = itemId.split('-');
            //income or expense
            type = splitId[0];
            //id number of the income or expense
            id = Number(splitId[1]);
            //delete the item from the data model
            budgetCtrl.deleteItem(type, id);
            //delete the item from the UI
            UICtrl.deleteListItem(itemId);
            //Update the Budgate  
            updateBudget();
            //calculate and update percentage of the individual expenses
            updatePercentages();
        }
        
    }
    //public method to expose the setUpEventListener() method or initialize the app
    return{
        init: function(){
            setUpEventListener();
            //update the current time
            UICtrl.displayTime();
            //setting all the budget fields to zero
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
        }
    }
})(budgetControlller, UIController);

controller.init();