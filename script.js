// Variable to keep track of the last updated month
var lastUpdatedMonth = null;
var lastUpdatedAmount = null;
var lastUpdatedCategory = null;
var lastUpdatedRow = null;
var lastUpdatedCellIndex = null;

// Function to set the selected category
function setCategory(categoryButton) {
    // Remove the 'selected' class from all category buttons
    var categoryButtons = document.querySelectorAll('.category-btn');
    categoryButtons.forEach(function (btn) {
        btn.classList.remove('selected');
        btn.disabled = false;
    });

    // Add the 'selected' class to the clicked category button
    categoryButton.classList.add('selected');

    // Disable the selected category button
    categoryButton.disabled = true;

    // Update the hidden input value with the selected category
    document.getElementById('selected-category').value = categoryButton.innerText;
}



// Function to handle form submission
document.getElementById('expense-form').addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent the default form submission behavior

    // Get the entered amount and selected category
    var amount = parseFloat(document.getElementById('amount').value);
    var category = document.getElementById('selected-category').value;

    // Validate the entered amount
    if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid positive amount.');
        return;
    }

    // Validate if a category is selected
    if (!category) {
        alert('Please select a category.');
        return;
    }

    // Get the selected month
    var month = document.getElementById('month').value;

    // Check if the category already has an entry for the selected month
    var table = document.getElementById('expense-table');
    var rowIndex = findRowIndexByMonth(table, month);

    if (rowIndex !== -1) {
        // Entry exists, update the amount for the selected category and month
        var cellIndex = getCategoryCellIndex(category);
        var existingAmount = parseFloat(table.rows[rowIndex].cells[cellIndex].innerText);
        table.rows[rowIndex].cells[cellIndex].innerText = existingAmount + amount;
        lastUpdatedAmount = existingAmount;
        lastUpdatedRow = table.rows[rowIndex];
    } else {
        // Entry doesn't exist, create a new row for the selected month
        var newRow = table.insertRow(table.rows.length);
        var cell1 = newRow.insertCell(0);
        cell1.innerHTML = month;

        // Create cells for each category with initial value 0
        for (var i = 1; i < table.rows[0].cells.length; i++) {
            var cell = newRow.insertCell(i);
            cell.innerHTML = 0;
        }

        // Update the amount for the selected category and month
        var cellIndex = getCategoryCellIndex(category);
        table.rows[table.rows.length - 1].cells[cellIndex].innerText = amount;
        lastUpdatedAmount = -1;
        lastUpdatedRow = table.rows[table.rows.length - 1];
    }

    // Update the last updated month
    lastUpdatedMonth = month;
    lastUpdatedCategory = category;
    lastUpdatedCellIndex = cellIndex;

    // Clear the form fields after submission
    document.getElementById('amount').value = '';
    document.getElementById('selected-category').value = '';

    // Reset the category buttons styles
    resetCategoryButtons();

    // Display the last entry information
    updateLastEntryInfo(lastUpdatedMonth, amount, category);
});

// Function to find the row index based on the selected month
function findRowIndexByMonth(table, month) {
    for (var i = 1; i < table.rows.length; i++) {
        if (table.rows[i].cells[0].innerText === month) {
            return i;
        }
    }
    return -1;
}

// Function to find the cell index based on the selected category
function getCategoryCellIndex(category) {
    var categoryHeaders = document.getElementById('expense-table').rows[0].cells;
    for (var i = 1; i < categoryHeaders.length; i++) {
        if (categoryHeaders[i].innerText === category) {
            return i;
        }
    }
    return -1;
}

// Function to undo the last update
function pop() {
    // Check if there is a last updated row to undo
    if (lastUpdatedRow) {
        lastUpdatedRow.cells[lastUpdatedCellIndex].innerText = lastUpdatedAmount;
        updateLastEntryInfo(lastUpdatedMonth, lastUpdatedAmount, lastUpdatedCategory);

        if(lastUpdatedAmount == -1){
            updateLastEntryInfo('-','-','-');
            lastUpdatedRow.remove();
        }


        // Display a message indicating the last update has been undone
        alert('Last update has been undone.');

        // Clear the form fields after undoing the update
        document.getElementById('amount').value = '';
        document.getElementById('selected-category').value = '';

        // Reset the category buttons styles
        resetCategoryButtons();


        // Clear the last updated row variable
        lastUpdatedRow = null;
        lastUpdatedAmount = null;
        lastUpdatedCategory = null;
        lastUpdatedCellIndex = null;
    } else {
        // Display a message if there is no last updated row to undo
        alert('No updates to undo.');
    }
}



// Function to update the last entry information
function updateLastEntryInfo(month, amount, category) {
    var lastEntryInfo = document.getElementById('last-entry-info');
    lastEntryInfo.innerText = `Month : ${month}\n\nCategory : ${category}\n\nAmount : ${amount}`;
}

// Function to find an existing row with the same month and category
function findExistingRow(table, month, category) {
    for (var i = 0; i < table.rows.length; i++) {
        var row = table.rows[i];
        if (row.cells[0].innerText === month && row.cells[1].innerText === category) {
            return row;
        }
    }
    return null;
}

// Function to reset the styles of category buttons
function resetCategoryButtons() {
    var categoryButtons = document.querySelectorAll('.category-btn');
    categoryButtons.forEach(function (btn) {
        btn.classList.remove('selected');
        btn.disabled = false;
    });
}

// Function to export the expense table to Excel
function exportToExcel() {
    // Get the table data
    var table = document.getElementById('expense-table');
    var tableData = Array.from(table.rows).map(row => Array.from(row.cells).map(cell => cell.innerText));

    // Create a workbook and add a worksheet
    var wb = XLSX.utils.book_new();
    var ws = XLSX.utils.aoa_to_sheet(tableData);

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, 'ExpensesSheet');

    // Save the workbook as an Excel file
    XLSX.writeFile(wb, 'data.xlsx');
}

