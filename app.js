//MODULAR PROGRAMMING JS
//In order to create modular functions we use IIFE, wrapping the function with parentheses and using closed
// parentheses at the end. This creates data privacy because it closes de scope
//Only what we return is PUBLIC the rest is PRIVATE

//MODULE FOR BUDGET
var budgetController = (function() {
  //CONSTRUCTORS
  var Expense = function(id, description, value) {
    //Set up each property
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  //Adding a prototype to the expenses to use later
  Expense.prototype.calcPercentage = function(totalInc) { //pass the totalincome

    if (totalInc > 0 ) {
      //set percentage to the value divided by total income
      this.percentage = Math.round((this.value / totalInc) * 100);
    } else {
      this.percentage = -1;
    }

  };

  //return the calculated percentage
  Expense.prototype.getPercentage = function() {
    return this.percentage;
  };

  var Income = function(id, description, value) {
    //Set up each property
    this.id = id;
    this.description = description;
    this.value = value;
  };

  //DATA STRUCTURES (ARRAYS FIR EXPENSES AND INCOME) - all stored in data object
  var data = {
    //object for both arrays
    allItems: {
      exp: [],
      inc: []
    },

    //Object for total amounts
    total: {
      exp: 0,
      inc: 0
    },

    //Budget (income - expenses)
    budget: 0,
    //Percentage property
    percentage: -1 //-1 for someething that is non-existent
  };

  //Private function to calculate total income and expenses, depending on the type
  var calculateTotal = function(type) {
    var sum = 0;

    //loop through allItems object for exp or inc
    data.allItems[type].forEach(function(currentElement) { //we only need to loop through the currentElement here

      sum += currentElement.value; //add the previous value of sum to the current value
    });

    //store the sum into the total object in the data STRUCTURES
    data.total[type] = sum;
  };

  //return public method to allow other modules to add to our DATA STRUCTURES
  return {
    addItem: function(type, des, val) { //function to add new items

      var newItem; //variable to later create a new exp or inc object
      var ID; //variable for the ID of the item

      //Only execute if array is not empty
      if (data.allItems[type].length > 0)
      {
        //Algorithm for next id: length of array minus 1 (this is the last item) and then + 1 (which would be the next item)
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1; //the code inside the second brackets gets us the last index and then we access its ID (.id) and increment it by one to find what should be the next ID.
      }
      else //if it is empty, first item should be 0
      {
        ID = 0;
      }
      if (type === 'exp') //check if it is an expense
      {
        newItem = new Expense(ID, des, val); //create new idem with expense object
      }
      else if (type === 'inc')
      {
        newItem = new Income(ID, des, val); //create new item with income object
      }

      data.allItems[type].push(newItem); //use the "type" to add to the right array and push the newly created object/item

      return newItem; //return it so that other modules have direct access
    },

    //function to delete the items
    deleteItem: function(type, id) { //we need these parameters to know exactly what to delete

      //use map method to return brand new array with all the id numbers that we have
      var ids = data.allItems[type].map(function(current) { //pass the current object
        return current.id; //return the id and populate the array witht them
      });

      var index = ids.indexOf(id); //use indexof method to geet the index of the id passed into the deleteItem method.

      //only remove if index exists
      if (index !== -1)
      {
        data.allItems[type].splice(index, 1); //Using splice in the array of objects. Firt argument is where we want to start deleting (in this case is the current index, the second argument is how many items to delete)
      }

    },

    //function to calculate the budget
    calculateBudget: function () {

      //Calculate total income and expenses
      calculateTotal('exp');
      calculateTotal('inc');

      //Calculate budget , income - expenses
      data.budget = data.total.inc - data.total.exp;

      //Calculate percentage of income spent (rounded)
      if (data.total.inc > 0)
      {
        data.percentage = Math.round((data.total.exp / data.total.inc) * 100);
      }
      else {
        data.percentage = -1;
      }
    },

    //public function to calculate percentages
    calculatePercentages: function () {

      //loop through array to calculate the percentage for every item
      data.allItems.exp.forEach(function(currentVariable) {
        currentVariable.calcPercentage(data.total.inc);
      });
    },

    //call this on each of our objects
    getPercentages: function() {
      //use map because we don't want to just do something, we want to return someething
      var allPercentages = data.allItems.exp.map(function(currentVariable) {
        return currentVariable.getPercentage();
      });
      return allPercentages;
    },

    //method to return the budget object structure (making it public)
    getBudget: function() {
      return {
        budget: data.budget,
        totalInc: data.total.inc,
        totalExp: data.total.exp,
        percentage: data.percentage
      };
    }

  };

})();

//MODULE FOR UI
var uiController = (function() {

  //CREATE OBJECT TO STORE ALL CLASS STRINGS FOR DOM MANIPULATION (in case they change, we would just have to change it here)
  var DOMstrings = {
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    inputButton: '.add__btn',
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

  //METHOD TO FORMAT EACH NUMBER, SIGN, COMMAS, DECIMALS ETC..
  var formatNumber = function(num, type) { //pass the actual number and if its inc or exp

    //override the num to use only the absolute value of it
    num = Math.abs(num); //passing it to override it

    //take care of decimlas using tofixed
    num = num.toFixed(2); //method of the number prototype (2 is the number of decimals)

    //split integer and decimal to inser the comma for the thousands
    var numSplit = num.split('.');
    var integer = numSplit[0]; //first element resulting from split is integer

    //if the number has more than 3 places...is in the thousands
    if (integer.length > 3) {
      integer = integer.substr(0, integer.length - 3) + ',' + integer.substr(integer.length - 3, 3); //arguments are 1. where we start and 2. how many we want. Then we add the comma..and add the rest of the string
    }

    //add the decimals
    var decimals = numSplit[1];

    //return the entire number concatenating decimals and signs
    return (type === 'exp' ? '-' : '+') + ' ' + integer + '.' + decimals;
  };

  //My own forEach to loop through a nodelist
  var nodeListForEach = function(list, callback) { //create our own function to use a forEach on a nodeList

    for (var i = 0; i < list.length; i++) {
      callback(list[i], i); //recursive function, pass the current element and the index of it
    }
  };

  //PUBLIC methods to be used in controller
  return { //always return an object (iife)
    //FUNCTION TO GET THE INPUTS for manipulation
    getInput: function() {

      return { //return object in order to be able to return more than 1 thing
        type: document.querySelector(DOMstrings.inputType).value, //either inc or exp
        description: document.querySelector(DOMstrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
      };
    },

    //Method to add items to the list DOM as html
    addListItem: function(obj, type) { //the obj is the newItem from budgetController

        //Declaring variables
        var html, newHtml, element;

        //Create HTML string with placeholder text for inc and exp
        if (type === 'inc') { //use this if iNCOME

          element = DOMstrings.incomeContainer; //element to be selected to add as adjacent later

          //use percentages to find what we want to replace later
           html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
        } else if (type === 'exp') { //use this if EXPENSE

          element = DOMstrings.expenseContainer; //element to be selected to add as adjacent later
           html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
        }

        //Replace placeholder text
        newHtml = html.replace('%id%', obj.id); //replace method for strings: first arguments is what has to be replaced, second argument is what to replace it with (in this case we are replacing the placeholders above with actual data coming from the object)
        newHtml = newHtml.replace('%description%', obj.description); //we are doing it in the newHtml so that we can keep the changes made in the line above
        newHtml = newHtml.replace('%value%', formatNumber(obj.value, type)); //passing with the formated number

        //Inser Adjacent HTML into DOM
        document.querySelector(element).insertAdjacentHTML('beforeend', newHtml); //element will be the correct one thanks to the if statement above. insertAdjacentHTML needs the position and the thing to be inserted
    },

    //method to delete item from user INTERFACE
    deleteListItem: function(selectorID) { //the entire ID to be deleted
      var element = document.getElementById(selectorID);
      element.parentNode.removeChild(element);
    },

    //method to clear the fields
    clearFields: function() {
      var fields;

      fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue); //querySelectorAll returns a list which needs to be turned into an arrays

      var fieldsArray = Array.prototype.slice.call(fields); //This will use the slice method into a list but return an array (use call to call slice function and only then pass the parameter)

      //Use forEach loop with a call back function that will apply to each element in the fields array (description and value)
      fieldsArray.forEach(function(currentElement, index, array) { //these are the 3 arguments that we have access to...

        //set each current value to empty
        currentElement.value = "";
      });

      //set focus to the description field again
      fieldsArray[0].focus();
    },

    //METHOD TO DISPLAY THE BUDGET Label
    displayBudget: function(obj) { //passing the object where all the data is stored

      //Determine the type
      var type;
      obj.budget > 0 ? type = 'inc' : type = 'exp';

      //modify all the labels to display the actual values coming from obj
      document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
      document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc,'inc');
      document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');

      if (obj.percentage > 0) //if percentage is greater than zero...
      {
        document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
      }
      else {
        document.querySelector(DOMstrings.percentageLabel).textContent = "-";
      }
    },

    //method to display percentages alongside each element of the list
    displayPercentages: function(percentages) {

      var fields = document.querySelectorAll(DOMstrings.expensesPercentageLabel); //returns nodelist

      //use our own nodeListForEach
      nodeListForEach(fields, function(currentElement, indexOfElement) { //pass current and indexOf

        if(percentages[indexOfElement] > 0) { //if current percentage is greater than zero...
          currentElement.textContent = percentages[indexOfElement] + '%';
        } else {
          currentElement.textContent = '-';
        }

      });
    },

    //Display month correctly
    displayMonth: function () {
      var dateNow = new Date(); //if we don't pass arguments, it will be the entire date.

      //Array for month names
      var allMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

      //Variables to store month and year coming from date object
      var month = dateNow.getMonth();
      var year = dateNow.getFullYear();

      //set the dom object to the year
      document.querySelector(DOMstrings.dateLabel).textContent = allMonths[month]+ ', ' + year;
    },


    //method to highlight when type changes on inputfields
    changedType: function() {
      //Select all three that are going to receive the red:focus class and put them in the fields variable
      var fields = document.querySelectorAll(
        DOMstrings.inputType + ',' +
        DOMstrings.inputDescription + ',' +
        DOMstrings.inputValue
      );

      //use our own for each to add the class red foucs
      nodeListForEach(fields, function(currentElement) {
        currentElement.classList.toggle('red-focus'); //if its added, remove it and vice versa
      });

      document.querySelector(DOMstrings.inputButton).classList.toggle('red');
    },

    getDOMstrings: function() {
      return DOMstrings; //making this public to use all the strings not just in this scope
    }
  };

}());

//MODULE TO CONNECT OTHER MODULES (APP CONTROLLER
//Pass the other two modules as arguments to have access to them
var controller = (function(budgetCtrl, uiCtrl) {

  //Function to set up event listeners
  var setUpEventListeners = function() {

    //variable to get the strings for class selection and such...
    var DOM = uiCtrl.getDOMstrings();

    //Add event listener for CLICK to checkmark button
    document.querySelector(DOM.inputButton).addEventListener('click', ctrlAddItem);

    //Add event listener for KEY PRESS to entire document
    document.addEventListener('keypress', function(event) {
      if (event.keyCode === 13)
      {
        ctrlAddItem();
      }
    });

    //Adding an event to the container(parent) that will delegate the event to all its childs and add the listener for delete buttons
    document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

    //Event listeners to change of inc and exp symbols
    document.querySelector(DOM.inputType).addEventListener('change', uiCtrl.changedType); //parameters are change event and method coming from ui module

  };

  var updateBudget = function() {

    //CALCULATE THE Budget
    budgetCtrl.calculateBudget();

    //RETURN the budget
    var budget = budgetCtrl.getBudget(); //this gets the data structure objects

    //DISPLAY THE Budget
    uiCtrl.displayBudget(budget);
  };

  //function to update the percentages
  var updatePercentages = function() {

    //Calculate percentages
    budgetCtrl.calculatePercentages();

    //Read from budget CONTROLLER
    var percentages = budgetCtrl.getPercentages();

    //Update INTERFACE
    uiCtrl.displayPercentages(percentages);

  };

  //ADD ITEM FUNCTION | TO USE IN EVENT LISTENERS
  var ctrlAddItem = function() {

    //declaring variables
    var input, newItem;

    //GET FIELD INPUT
    input = uiController.getInput(); //calling publich function from uiController module

    //Do all of the following only if there is something (something valid) in the input fields
    if (input.description !== "" && !isNaN(input.value) && input.value > 0)
    {
      //ADD ITEM TO budgetController
      newItem = budgetController.addItem(input.type, input.description, input.value); //using the input which already has the exact arguments we need

      //ADD ITEM TO uiController
      uiCtrl.addListItem(newItem, input.type); //pass the obj and the type

      //CLEAR fields
      uiCtrl.clearFields();

      //Calculate and update budget
      updateBudget();

      //Calculate and update percentages
      updatePercentages();
    }
  };

  //Anonymous function to delete items when clicking the button
  var ctrlDeleteItem = function(event) { //need event to know the target element (the "x" icon)

    //get the id of the parent node of the icon that contains the entire div that we wanna clear and retrieve its ID and store it into the variable
    var itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

    //there are only two css ID's in the html
    if (itemID) { //if it exists...

      //Format is "inc-1" for example

      var splitID = itemID.split('-'); //use split method to get "inc" and "1" separated
      var type = splitID[0]; //first element return by split method is the type "inc"
      var ID = parseInt(splitID[1]); //second element is the id number (convert it to integer becayse split returns strings)

      //DELETE ITEM FROM DATA STRUCTURES
      budgetCtrl.deleteItem(type, ID);

      //DELETE FROM USER INTERFACE
      uiCtrl.deleteListItem(itemID);

      //UPDATE AND SHOW NEW Budget
      updateBudget();

      //Calculate and update percentages
      updatePercentages();
    }
  };

  //return a public initialization function (hast to be as an object)
  return {
    init: function() {
      uiCtrl.displayMonth();
      uiCtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1
      }); //we are passing the entire object as a parameter with everything set to 0
      setUpEventListeners();
    }
  };

})(budgetController, uiController);

//This is the only function that is not insed an iife
controller.init();
