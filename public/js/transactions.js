let selectedBook = null;
let currentReturnTransaction = null;

function showBookAvailable() {
    document.getElementById('bookAvailableSection').style.display = 'block';
    document.getElementById('bookIssueSection').style.display = 'none';
    document.getElementById('returnBookSection').style.display = 'none';
    document.getElementById('finePaySection').style.display = 'none';
    document.getElementById('bookAvailableForm').reset();
    document.getElementById('searchResults').innerHTML = '';
}

function showBookIssue() {
    document.getElementById('bookAvailableSection').style.display = 'none';
    document.getElementById('bookIssueSection').style.display = 'block';
    document.getElementById('returnBookSection').style.display = 'none';
    document.getElementById('finePaySection').style.display = 'none';
    document.getElementById('bookIssueForm').reset();
    document.getElementById('issueDate').value = getTodayDate();
    document.getElementById('returnDate').value = getDate15DaysLater();
}

function showReturnBook() {
    document.getElementById('bookAvailableSection').style.display = 'none';
    document.getElementById('bookIssueSection').style.display = 'none';
    document.getElementById('returnBookSection').style.display = 'block';
    document.getElementById('finePaySection').style.display = 'none';
    document.getElementById('returnBookForm').reset();
}

function showFinePay() {
    document.getElementById('bookAvailableSection').style.display = 'none';
    document.getElementById('bookIssueSection').style.display = 'none';
    document.getElementById('returnBookSection').style.display = 'none';
    document.getElementById('finePaySection').style.display = 'block';
}

document.getElementById('bookAvailableForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('searchBookName').value.trim();
    const author = document.getElementById('searchAuthor').value.trim();
    const type = document.getElementById('searchType').value;
    const serialNo = document.getElementById('searchSerialNo').value.trim();
    
    if (!name && !author && !type && !serialNo) {
        showError('bookAvailableError', 'Please fill at least one field to search');
        return;
    }
    
    try {
        const params = new URLSearchParams();
        if (name) params.append('name', name);
        if (author) params.append('author', author);
        if (type) params.append('type', type);
        if (serialNo) params.append('serialNo', serialNo);
        
        const response = await fetch(`${API_BASE}/books?${params}`, {
            headers: getAuthHeaders()
        });
        
        const books = await response.json();
        displaySearchResults(books);
    } catch (error) {
        showError('bookAvailableError', 'Network error. Please try again.');
    }
});

function displaySearchResults(books) {
    const resultsDiv = document.getElementById('searchResults');
    
    if (books.length === 0) {
        resultsDiv.innerHTML = '<p>No books found.</p>';
        return;
    }
    
    let html = '<div class="table-container"><table><thead><tr><th>Name</th><th>Author</th><th>Type</th><th>Serial No</th><th>Available</th><th>Select</th></tr></thead><tbody>';
    
    books.forEach(book => {
        html += `
            <tr>
                <td>${book.name}</td>
                <td>${book.author}</td>
                <td>${book.type}</td>
                <td>${book.serialNo}</td>
                <td>${book.isAvailable ? 'Yes' : 'No'}</td>
                <td><input type="radio" name="selectedBook" value="${book._id}" data-book='${JSON.stringify(book)}'></td>
            </tr>
        `;
    });
    
    html += '</tbody></table></div>';
    resultsDiv.innerHTML = html;
    
    document.querySelectorAll('input[name="selectedBook"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.checked) {
                selectedBook = JSON.parse(e.target.dataset.book);
            }
        });
    });
}

document.getElementById('issueBookName').addEventListener('blur', async () => {
    const bookName = document.getElementById('issueBookName').value.trim();
    if (bookName) {
        try {
            const response = await fetch(`${API_BASE}/books/available?name=${encodeURIComponent(bookName)}`, {
                headers: getAuthHeaders()
            });
            const books = await response.json();
            if (books.length > 0) {
                document.getElementById('issueAuthor').value = books[0].author;
            }
        } catch (error) {
        }
    }
});

document.getElementById('issueDate').addEventListener('change', (e) => {
    const issueDateValue = e.target.value;
    if (issueDateValue) {
        const issueDate = new Date(issueDateValue);
        const returnDate = new Date(issueDate);
        returnDate.setDate(returnDate.getDate() + 15);
        document.getElementById('returnDate').value = formatDate(returnDate);
    }
});

document.getElementById('bookIssueForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const bookName = document.getElementById('issueBookName').value.trim();
    const author = document.getElementById('issueAuthor').value.trim();
    const membershipNumber = document.getElementById('issueMembershipNumber').value.trim();
    const issueDate = document.getElementById('issueDate').value;
    const returnDate = document.getElementById('returnDate').value;
    const remarks = document.getElementById('issueRemarks').value.trim();
    
    if (!bookName || !author || !membershipNumber || !issueDate || !returnDate) {
        showError('bookIssueError', 'Please fill all required fields');
        return;
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const issueDateObj = new Date(issueDate);
    if (issueDateObj < today) {
        showError('bookIssueError', 'Issue date cannot be less than today');
        return;
    }
    
    const returnDateObj = new Date(returnDate);
    const daysDiff = Math.ceil((returnDateObj - issueDateObj) / (1000 * 60 * 60 * 24));
    if (daysDiff < 0) {
        showError('bookIssueError', 'Return date cannot be earlier than issue date');
        return;
    }
    if (daysDiff > 15) {
        showError('bookIssueError', 'Return date cannot be more than 15 days from issue date');
        return;
    }
    
    try {
        const bookResponse = await fetch(`${API_BASE}/books/available?name=${encodeURIComponent(bookName)}`, {
            headers: getAuthHeaders()
        });
        const books = await bookResponse.json();
        
        if (books.length === 0) {
            showError('bookIssueError', 'No available copy of this book found');
            return;
        }
        
        const availableBook = books[0];
        
        const response = await fetch(`${API_BASE}/transactions/issue`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                bookName,
                serialNo: availableBook.serialNo,
                membershipNumber,
                issueDate,
                returnDate,
                remarks
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showSuccess('bookIssueSuccess', 'Book issued successfully');
            document.getElementById('bookIssueForm').reset();
            document.getElementById('issueDate').value = getTodayDate();
            document.getElementById('returnDate').value = getDate15DaysLater();
        } else {
            showError('bookIssueError', data.message || 'Failed to issue book');
        }
    } catch (error) {
        showError('bookIssueError', 'Network error. Please try again.');
    }
});

document.getElementById('returnBookName').addEventListener('blur', loadReturnTransaction);
document.getElementById('returnSerialNo').addEventListener('blur', loadReturnTransaction);

async function loadReturnTransaction() {
    const bookName = document.getElementById('returnBookName').value.trim();
    const serialNo = document.getElementById('returnSerialNo').value.trim();
    
    if (!bookName || !serialNo) return;
    
    try {
        const allTransactions = await fetch(`${API_BASE}/transactions`, {
            headers: getAuthHeaders()
        });
        const transactions = await allTransactions.json();
        
        const activeTransaction = transactions.find(t => 
            t.bookName.toLowerCase() === bookName.toLowerCase() && 
            t.serialNo === serialNo && 
            t.status === 'issued'
        );
        
        if (activeTransaction) {
            currentReturnTransaction = activeTransaction;
            document.getElementById('returnAuthor').value = activeTransaction.author;
            document.getElementById('returnIssueDate').value = formatDate(activeTransaction.issueDate);
            document.getElementById('returnReturnDate').value = formatDate(activeTransaction.returnDate);
            document.getElementById('returnBookError').classList.remove('show');
        } else {
            showError('returnBookError', 'No active transaction found for this book');
            currentReturnTransaction = null;
        }
    } catch (error) {
        showError('returnBookError', 'Failed to load transaction details');
        currentReturnTransaction = null;
    }
}

document.getElementById('returnBookForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const bookName = document.getElementById('returnBookName').value.trim();
    const serialNo = document.getElementById('returnSerialNo').value.trim();
    const actualReturnDate = document.getElementById('returnReturnDate').value;
    
    if (!bookName || !serialNo || !actualReturnDate) {
        showError('returnBookError', 'Please fill all required fields');
        return;
    }
    
    if (!currentReturnTransaction) {
        showError('returnBookError', 'Please enter valid book name and serial number');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/transactions/return`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                bookName,
                serialNo,
                actualReturnDate
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            localStorage.setItem('pendingFineTransaction', data.transaction._id);
            localStorage.setItem('pendingFineData', JSON.stringify(data.transaction));
            
            showFinePay();
            loadFinePayData(data.transaction);
        } else {
            showError('returnBookError', data.message || 'Failed to return book');
        }
    } catch (error) {
        showError('returnBookError', 'Network error. Please try again.');
    }
});

function loadFinePayData(transaction) {
    document.getElementById('fineBookName').value = transaction.bookName;
    document.getElementById('fineAuthor').value = transaction.author;
    document.getElementById('fineSerialNo').value = transaction.serialNo;
    document.getElementById('fineAmount').value = transaction.fineAmount || 0;
    document.getElementById('finePaid').checked = false;
    document.getElementById('fineRemarks').value = '';
}

document.getElementById('finePayForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const transactionId = localStorage.getItem('pendingFineTransaction');
    if (!transactionId) {
        showError('finePayError', 'No pending transaction found');
        return;
    }
    
    const finePaid = document.getElementById('finePaid').checked;
    const remarks = document.getElementById('fineRemarks').value.trim();
    const fineAmount = parseFloat(document.getElementById('fineAmount').value) || 0;
    
    if (fineAmount > 0 && !finePaid) {
        showError('finePayError', 'Fine must be paid before completing return');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/transactions/pay-fine/${transactionId}`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ finePaid, remarks })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showSuccess('finePaySuccess', 'Transaction completed successfully');
            localStorage.removeItem('pendingFineTransaction');
            localStorage.removeItem('pendingFineData');
            document.getElementById('finePayForm').reset();
        } else {
            showError('finePayError', data.message || 'Failed to process fine payment');
        }
    } catch (error) {
        showError('finePayError', 'Network error. Please try again.');
    }
});

window.addEventListener('DOMContentLoaded', () => {
    const pendingData = localStorage.getItem('pendingFineData');
    if (pendingData) {
        const transaction = JSON.parse(pendingData);
        showFinePay();
        loadFinePayData(transaction);
    }
});

